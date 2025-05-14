# backend.py - Simplified Version
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

# Configuration
warnings.filterwarnings('ignore')
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["GOOGLE_API_KEY"] = "AIzaSyAllDb85-EYZSDQjd8tVyF_Kg5WG8HPOjc"

# Initialize Flask
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": True
    }
})

# Constants
JWT_SECRET_KEY = "your-secret-key-here-must-be-at-least-64-bytes-long-12345678901234567890"
JWT_EXPIRATION_MS = 604800000  # 7 days
PDF_DIR = "./pdf_files"
CHROMA_DIR = "./chroma_db"
LOCK_FILE = os.path.join(CHROMA_DIR, ".lock")
COLLECTION_NAME = "tesla_manual_v3"  # Updated collection name

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
    for proc in psutil.process_iter():
        try:
            for f in proc.open_files():
                if os.path.abspath(path) in os.path.abspath(f.path):
                    print(f"🔫 Killing process {proc.pid} ({proc.name()})")
                    proc.kill()
                    time.sleep(0.5)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
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
            if hasattr(vectorstore, 'delete_collection'):
                vectorstore.delete_collection()
        except Exception as e:
            print(f"⚠️ Cleanup error: {e}")
        vectorstore = None
    gc.collect()

# --------------------------
# Chroma DB Functions
# --------------------------

def initialize_chroma():
    """Initialize or load Chroma DB with proper persistence"""
    global vectorstore
    
    try:
        # Try to load existing DB
        if os.path.exists(CHROMA_DIR) and os.listdir(CHROMA_DIR):
            vectorstore = Chroma(
                persist_directory=CHROMA_DIR,
                embedding_function=embedding,
                collection_name=COLLECTION_NAME
            )
            print(f"✅ Loaded existing Chroma DB (Documents: {vectorstore._collection.count()})")
            return True
        
        # If no DB exists, create a new one
        print("🔄 No existing Chroma DB found - creating new one...")
        return build_chroma_db()
        
    except Exception as e:
        print(f"❌ Chroma initialization failed: {e}")
        traceback.print_exc()
        return False

def build_chroma_db():
    """Build a fresh Chroma DB with proper persistence"""
    try:
        with chroma_lock():
            # Clear existing DB if it exists
            if os.path.exists(CHROMA_DIR):
                print("🧹 Cleaning existing Chroma DB...")
                if not force_delete_directory(CHROMA_DIR):
                    print("❌ Failed to clean existing DB")
                    return False
            
            # Get all PDF files in the directory
            pdf_files = [os.path.join(PDF_DIR, f) for f in os.listdir(PDF_DIR) if f.endswith('.pdf')]
            
            if not pdf_files:
                print("❌ No PDF files found in directory")
                return False
            
            # Process PDFs
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
                    
                    if not chunks:
                        print(f"⚠️ No chunks from {os.path.basename(file)}")
                        continue
                        
                    all_docs.extend(chunks)
                    print(f"   Added {len(chunks)} chunks")
                    
                except Exception as e:
                    print(f"❌ Failed to process {file}: {e}")
                    continue
            
            if not all_docs:
                print("❌ No documents processed")
                return False
            
            # Create new persistent DB
            global vectorstore
            vectorstore = Chroma.from_documents(
                documents=all_docs,
                embedding=embedding,
                persist_directory=CHROMA_DIR,
                collection_name=COLLECTION_NAME,
                collection_metadata={"hnsw:space": "cosine"}
            )
            
            # Verify persistence
            if vectorstore._collection.count() == 0:
                print("❌ Failed to persist documents")
                return False
            
            print(f"✅ Saved {vectorstore._collection.count()} documents")
            return True
            
    except Exception as e:
        print(f"❌ Build failed: {e}")
        traceback.print_exc()
        return False

# --------------------------
# Authentication
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
# QA Chain Initialization
# --------------------------
# Custom prompt template

techcare_prompt_template = """You are a friendly and helpful customer support bot for Techcare, 
a technology products and services company. Your role is to assist customers with their inquiries 
about products, services, orders, troubleshooting, and general company information.

Follow these guidelines:
- Be polite, patient, and professional
- Provide accurate information based on the context
- If you don't know the answer, say you'll connect them with a human representative
- Keep responses concise but helpful
- For technical issues, provide step-by-step guidance when possible

Context: {context}

Question: {question}

Helpful Answer:"""
def initialize_qa_chain():
    """Initialize QA chain with persistent retriever"""
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

    return RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        return_source_documents=True,
        chain_type="stuff"
    )

# --------------------------
# API Endpoints
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

        # Get response with source documents
        print(f"\n🔍 Query: {query_text}")
        try:
            response = qa_chain.invoke({
                "query": query_text,
                "context": "\n".join([msg['content'] for msg in chat_history if msg['role'] == 'user'])
            })
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

# --------------------------
# Database Connection
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