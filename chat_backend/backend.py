# backend.py - Complete Fixed Version with All Original Code
import os
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_community.document_loaders import PyPDFLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
import mysql.connector
import json
from datetime import datetime, timedelta
from jwt import encode, decode, ExpiredSignatureError, InvalidTokenError
from functools import wraps
import shutil
import psutil
import tempfile
import atexit
import gc
from contextlib import contextmanager
import warnings
import traceback
import sys
from pathlib import Path
from urllib.parse import unquote

# Configuration
warnings.filterwarnings('ignore')
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["GOOGLE_API_KEY"] = "AIzaSyAllDb85-EYZSDQjd8tVyF_Kg5WG8HPOjc"

# Initialize Flask
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://43.228.124.29"],
        "methods": ["GET", "POST", "OPTIONS", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": True
    }
})

# Constants
JWT_SECRET_KEY = "your-secret-key-here-must-be-at-least-64-bytes-long-12345678901234567890"
JWT_EXPIRATION_MS = 604800000  # 7 days
PDF_DIR = os.path.abspath("./pdf_files")
CHROMA_DIR = os.path.abspath("./chroma_db")
LOCK_FILE = os.path.join(CHROMA_DIR, ".lock")
COLLECTION_NAME = "techcare_docs"
MAX_BATCH_SIZE = 5000  # Safe value below Chroma's limit of 5461

# Global State
vectorstore = None
qa_chain = None
embedding = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

# --------------------------
# Core Utility Functions
# --------------------------

def setup_directories():
    """Ensure required directories exist"""
    os.makedirs(PDF_DIR, exist_ok=True)
    os.makedirs(CHROMA_DIR, exist_ok=True)
    if sys.platform != 'win32':
        os.chmod(CHROMA_DIR, 0o777)

@contextmanager
def chroma_lock():
    """File-based lock for Chroma operations"""
    max_wait = 30
    start = time.time()
    
    while os.path.exists(LOCK_FILE):
        if time.time() - start > max_wait:
            raise TimeoutError("Could not acquire lock")
        time.sleep(1)
    
    try:
        with open(LOCK_FILE, 'w') as f:
            f.write(str(os.getpid()))
        yield
    finally:
        try:
            os.remove(LOCK_FILE)
        except:
            pass

def kill_processes_using_path(path):
    """Kill processes using files at given path"""
    abs_path = os.path.abspath(path)
    for proc in psutil.process_iter():
        try:
            # Check for open files
            for f in proc.open_files():
                if abs_path in os.path.abspath(f.path):
                    print(f"🔫 Killing process {proc.pid} ({proc.name()}) using {f.path}")
                    proc.kill()
                    time.sleep(0.5)
                    break # Process killed, move to next process
            # Additionally, check if the process's current working directory is inside the path
            if proc.cwd() and abs_path in os.path.abspath(proc.cwd()):
                print(f"🔫 Killing process {proc.pid} ({proc.name()}) with CWD in {abs_path}")
                proc.kill()
                time.sleep(0.5)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess, FileNotFoundError) as e:
            # Catch more specific psutil exceptions
            print(f"  Skipping process {proc.pid} ({proc.name()}) due to: {e}")
            continue
        except Exception as e:
            print(f"  Unexpected error while checking process {proc.pid} ({proc.name()}): {e}")
            continue

def force_delete_directory(path):
    """Forcefully delete directory"""
    for attempt in range(3):
        try:
            if os.path.exists(path):
                kill_processes_using_path(path)
                shutil.rmtree(path, ignore_errors=True)
                return True
        except Exception as e:
            print(f"⚠️ Delete attempt {attempt+1} failed: {e}")
            time.sleep(2)
    return False

def cleanup_resources():
    """Clean up resources on shutdown"""
    global vectorstore
    if vectorstore is not None:
        try:
            print("🧹 Cleaning up Chroma resources...")
            vectorstore.persist()
            if hasattr(vectorstore, '_client'):
                vectorstore._client.persist()
                vectorstore._client.close()
        except Exception as e:
            print(f"⚠️ Cleanup error: {e}")
        vectorstore = None
    gc.collect()

# --------------------------
# Chroma DB Functions (Updated with Batch Processing)
# --------------------------

def initialize_chroma():
    """Initialize or load Chroma DB with proper persistence"""
    global vectorstore
    try:
        # Debug directory contents
        if os.path.exists(CHROMA_DIR):
            print(f"📁 Chroma directory contents: {os.listdir(CHROMA_DIR)}")
        # Try to load existing DB (check for chroma.sqlite3 or any subdirectory)
        has_sqlite = os.path.exists(os.path.join(CHROMA_DIR, "chroma.sqlite3"))
        has_collection_dir = any(os.path.isdir(os.path.join(CHROMA_DIR, f)) for f in os.listdir(CHROMA_DIR)) if os.path.exists(CHROMA_DIR) else False
        if os.path.exists(CHROMA_DIR) and (has_sqlite or has_collection_dir):
            print("🔄 Attempting to load existing Chroma DB...")
            vectorstore = Chroma(
                persist_directory=CHROMA_DIR,
                embedding_function=embedding,
                collection_name=COLLECTION_NAME
            )
            # Verify the collection exists
            if hasattr(vectorstore, '_client'):
                collections = vectorstore._client.list_collections()
                print(f"📚 Available collections: {[c.name for c in collections]}")
                if COLLECTION_NAME not in [c.name for c in collections]:
                    print(f"⚠️ Collection '{COLLECTION_NAME}' not found")
                    return build_chroma_db()
            doc_count = vectorstore._collection.count()
            print(f"✅ Loaded existing Chroma DB (Documents: {doc_count})")
            return True
        # If no DB exists, create a new one
        print("🆕 No existing Chroma DB found - creating new one...")
        return build_chroma_db()
    except Exception as e:
        print(f"❌ Chroma initialization failed: {e}")
        traceback.print_exc()
        return False

def build_chroma_db():
    """Build a fresh Chroma DB with proper batch processing"""
    global vectorstore # Add this line
    try:
        with chroma_lock():
            # Clear existing DB if it exists
            if os.path.exists(CHROMA_DIR):
                print("🧹 Cleaning existing Chroma DB...")
                if not force_delete_directory(CHROMA_DIR):
                    print("❌ Failed to clean existing DB")
                    return False
                os.makedirs(CHROMA_DIR, exist_ok=True)

            # Get all PDF files
            pdf_files = [os.path.join(PDF_DIR, f) for f in os.listdir(PDF_DIR) 
                        if f.endswith('.pdf')]
            if not pdf_files:
                print("❌ No PDF files found in directory")
                # If no PDFs, create an empty Chroma DB
                vectorstore = Chroma(
                    persist_directory=CHROMA_DIR,
                    embedding_function=embedding,
                    collection_name=COLLECTION_NAME
                )
                vectorstore.persist()
                print("✅ Created empty Chroma DB as no PDF files were found.")
                return True

            # Process PDFs with progress reporting
            all_docs = []
            for file in pdf_files:
                try:
                    print(f"📄 Processing {os.path.basename(file)}...")
                    loader = PyPDFLoader(file)
                    pages = loader.load()
                    splitter = RecursiveCharacterTextSplitter(
                        chunk_size=1000,
                        chunk_overlap=200,
                        separators=["\n\n", "\n", " ", ""]
                    )
                    chunks = splitter.split_documents(pages)
                    all_docs.extend(chunks)
                    print(f"   Added {len(chunks)} chunks (Total: {len(all_docs)})")
                except Exception as e:
                    print(f"❌ Failed to process {file}: {e}")
                    continue

            if not all_docs:
                print("❌ No documents processed from PDFs")
                # If no documents processed, create an empty Chroma DB
                vectorstore = Chroma(
                    persist_directory=CHROMA_DIR,
                    embedding_function=embedding,
                    collection_name=COLLECTION_NAME
                )
                vectorstore.persist()
                print("✅ Created empty Chroma DB as no documents were processed from PDFs.")
                return True

            # Create new persistent DB with batch processing
            print("🏗️ Building Chroma DB in batches...")
            
            # Create initial empty collection
            vectorstore = Chroma(
                persist_directory=CHROMA_DIR,
                embedding_function=embedding,
                collection_name=COLLECTION_NAME
            )
            
            # Add documents in batches
            for i in range(0, len(all_docs), MAX_BATCH_SIZE):
                batch = all_docs[i:i + MAX_BATCH_SIZE]
                print(f"   Adding batch {i//MAX_BATCH_SIZE + 1} ({len(batch)} documents)")
                texts = [doc.page_content for doc in batch]
                metadatas = [doc.metadata for doc in batch]
                vectorstore.add_texts(texts=texts, metadatas=metadatas)
                time.sleep(1)  # Brief pause between batches
            
            # Explicit persist and verify
            print("💾 Persisting Chroma DB...")
            vectorstore.persist()
            time.sleep(2)  # Allow time for persistence to complete
            
            # Verify
            doc_count = vectorstore._collection.count()
            print(f"🔍 Verification: {doc_count} documents in DB")
            
            if doc_count != len(all_docs):
                print(f"❌ Document count mismatch: expected {len(all_docs)}, got {doc_count}")
                return False
                
            print(f"✅ Successfully built Chroma DB with {doc_count} documents")
            return True
            
    except Exception as e:
        print(f"❌ Build failed: {e}")
        traceback.print_exc()
        return False

# --------------------------
# Authentication (Original)
# --------------------------

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            data = decode(token, JWT_SECRET_KEY.encode('utf-8'), algorithms=["HS512"])
            current_user_email = data['sub']
        except ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        except Exception:
            return jsonify({'message': 'Token verification failed'}), 401

        return f(current_user_email, *args, **kwargs)
    return decorated

# --------------------------
# QA Chain Initialization (Original)
# --------------------------

# Add this near your other constants
TECHCARE_PROMPT_TEMPLATE = """You are a friendly Techcare support bot. Guidelines:
- Be polite and professional
- Use the context below to answer
- If unsure, offer to connect to a human

Relevant Context:
{context}

Conversation History:
{chat_history}

Question: {query}

Helpful Answer:"""

def initialize_qa_chain():
    """Initialize QA chain with proper prompt and configuration"""
    from langchain.prompts import PromptTemplate
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0.2,
        convert_system_message_to_human=True
    )

    retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={
            "k": 5,
            "score_threshold": 0.5,
            "fetch_k": 20
        }
    )

    # Define the prompt template
    template = """You are a friendly Techcare support bot. Guidelines:
    - Be polite and professional
    - Use the context below to answer
    - If unsure, offer to connect to a human

    Context: {context}

    Question: {question}

    Helpful Answer:"""

    QA_PROMPT = PromptTemplate(
        template=template,
        input_variables=["context", "question"]
    )

    return RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
        chain_type_kwargs={
            "prompt": QA_PROMPT,
            "document_variable_name": "context"
        }
    )

# --------------------------
# API Endpoints (All Original Endpoints)
# --------------------------

@app.route('/query', methods=['POST'])
@token_required
def query(current_user_email):
    """Handle user queries with source documents"""
    data = request.json
    query_text = data.get('query')

    if not query_text:
        return jsonify({"error": "Query is required"}), 400

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Get user ID
        cursor.execute("SELECT id FROM users WHERE email = %s", (current_user_email,))
        user_result = cursor.fetchone()
        if not user_result:
            return jsonify({"error": "User not found"}), 404
        user_id = user_result[0]

        # Get or create session
        cursor.execute(
            "SELECT id, history FROM sessions WHERE user_id = %s AND end_time IS NULL",
            (user_id,)
        )
        session = cursor.fetchone()

        if session:
            session_id, history_json = session
            chat_history = json.loads(history_json) if history_json else []
        else:
            cursor.execute(
                "INSERT INTO sessions (user_id, start_time, last_activity, title) VALUES (%s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, %s)",
                (user_id, query_text)
            )
            connection.commit()
            session_id = cursor.lastrowid
            chat_history = []

        # Add user message to history
        chat_history.append({
            "role": "user",
            "content": query_text,
            "timestamp": datetime.now().isoformat()
        })

        # Build conversation context
        conversation_context = "\n".join([
            f"{msg['role'].capitalize()}: {msg['content']}" 
            for msg in chat_history
        ])

        # Combine conversation history with the current query
        full_query = f"{conversation_context}\n\nCurrent Question: {query_text}"

        # Get response with source documents
        print(f"\n🔍 Query: {query_text}")
        try:
            # Pass only the query to the QA chain
            response = qa_chain({"query": full_query})
            
            answer = response["result"]
            sources = response.get("source_documents", [])
            
            print(f"📚 Retrieved {len(sources)} source chunks")
            for i, source in enumerate(sources):
                print(f"   Source {i+1}: {source.page_content[:200]}...")
                
        except Exception as e:
            print(f"❌ QA error: {e}")
            traceback.print_exc()
            answer = "I'm having trouble processing your request. Please try again."
            sources = []

        # Add bot response to history
        chat_history.append({
            "role": "assistant",
            "content": answer,
            "timestamp": datetime.now().isoformat()
        })

        # Update session
        cursor.execute(
            "UPDATE sessions SET history = %s, last_activity = CURRENT_TIMESTAMP WHERE id = %s",
            (json.dumps(chat_history), session_id)
        )
        connection.commit()

        return jsonify({
            "session_id": session_id,
            "answer": answer,
            "history": chat_history,
            "sources": [{
                "content": s.page_content[:500],
                "metadata": s.metadata
            } for s in sources]
        })

    except mysql.connector.Error as err:
        print(f"❌ Database error: {err}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        traceback.print_exc()
        return jsonify({"error": "Internal server error"}), 500
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/debug_collection', methods=['GET'])
def debug_collection():
    """Inspect the Chroma collection"""
    if not vectorstore:
        return jsonify({"error": "Vectorstore not initialized"}), 400
        
    collection = vectorstore._collection
    return jsonify({
        "count": collection.count(),
        "metadata": collection.metadata,
        "sample_ids": collection.get(limit=2)['ids']
    })

@app.route('/debug_query', methods=['POST'])
def debug_query():
    """Test raw retrieval"""
    data = request.json
    query = data.get('query')
    
    if not query or not vectorstore:
        return jsonify({"error": "Invalid request"}), 400
        
    try:
        docs = vectorstore.similarity_search(query, k=3)
        return jsonify({
            "results": [{
                "content": d.page_content[:500],
                "metadata": d.metadata
            } for d in docs]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/verify_persistence', methods=['GET'])
def verify_persistence():
    """Verify that Chroma DB is properly persisted"""
    if not vectorstore:
        return jsonify({"error": "Vectorstore not initialized"}), 400
    
    try:
        # Count documents in memory
        mem_count = vectorstore._collection.count()
        
        # Create a new instance to verify disk persistence
        temp_store = Chroma(
            persist_directory=CHROMA_DIR,
            embedding_function=embedding,
            collection_name=COLLECTION_NAME
        )
        disk_count = temp_store._collection.count()
        
        return jsonify({
            "memory_count": mem_count,
            "disk_count": disk_count,
            "consistent": mem_count == disk_count
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """System health check"""
    return jsonify({
        "chroma_initialized": vectorstore is not None,
        "documents_loaded": vectorstore._collection.count() if vectorstore else 0,
        "disk_usage": f"{sum(f.stat().st_size for f in Path(CHROMA_DIR).glob('**/*') if f.is_file()) / (1024*1024):.2f} MB",
        "system_status": "healthy"
    })

# --------------------------
# Database Connection (Original)
# --------------------------

def get_db_connection():
    """Create a new database connection"""
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="1234",
        database="ticket_system"
    )

# --------------------------
# Application Initialization
# --------------------------

def initialize_app():
    """Initialize all application components"""
    print("\n🚀 Initializing application...")
    setup_directories()
    
    if not initialize_chroma():
        print("❌ Failed to initialize Chroma DB")
        return False
    
    global qa_chain
    qa_chain = initialize_qa_chain()
    atexit.register(cleanup_resources)
    print("\n🏁 Application ready")
    return True

# --------------------------
# RAG File Management Endpoints
# --------------------------

@app.route('/rag/files', methods=['GET'])
@token_required
def list_rag_files(current_user_email):
    """Return list of PDF files"""
    files = [f for f in os.listdir(PDF_DIR) if f.lower().endswith('.pdf')]
    return jsonify(files)

@app.route('/rag/files', methods=['POST'])
@token_required
def upload_rag_file(current_user_email):
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF allowed'}), 400
    saved_path = os.path.join(PDF_DIR, file.filename)
    file.save(saved_path)
    return jsonify({'message': 'File uploaded'}), 201

@app.route('/rag/files/<path:filename>', methods=['DELETE'])
@token_required
def delete_rag_file(current_user_email, filename):
    safe_name = os.path.basename(unquote(filename))
    target_path = os.path.join(PDF_DIR, safe_name)
    if os.path.exists(target_path):
        os.remove(target_path)
        return jsonify({'message': 'Deleted'}), 200
    return jsonify({'error': 'File not found'}), 404

@app.route('/rag/restart', methods=['POST'])
@token_required
def restart_rag(current_user_email):
    success = build_chroma_db()
    if success:
        return jsonify({'message': 'RAG restarted'}), 200
    return jsonify({'error': 'Failed to restart'}), 500

# --------------------------
# Main Execution
# --------------------------

if __name__ == '__main__':
    try:
        if initialize_app():
            port = int(os.environ.get('PORT', 5000))
            print(f"\n🌐 Server running on http://0.0.0.0:{port}")
            app.run(host='0.0.0.0', port=port)
        else:
            print("\n💥 Failed to initialize application")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except Exception as e:
        print(f"\n💥 Fatal error: {e}")
        traceback.print_exc()
        sys.exit(1)