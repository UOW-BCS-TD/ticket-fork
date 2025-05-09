# backend.py
import os
import subprocess
import sys
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
from langchain_community.document_loaders import PyPDFLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
import time
from requests.exceptions import ChunkedEncodingError
import mysql.connector
import json
from datetime import datetime, timedelta
from jwt import encode, decode, ExpiredSignatureError, InvalidTokenError
from functools import wraps
import base64
import warnings
import shutil

# Suppress NumPy warnings
warnings.filterwarnings('ignore', category=RuntimeWarning)

# Set the Google API key for authentication
os.environ["GOOGLE_API_KEY"] = "AIzaSyAllDb85-EYZSDQjd8tVyF_Kg5WG8HPOjc"

# JWT Configuration - match Spring Boot's configuration
JWT_SECRET_KEY = "your-secret-key-here-must-be-at-least-512-bits-long"  # Must match Spring Boot's app.jwt.secret
JWT_EXPIRATION_MS = 3600000  # 1 hour in milliseconds, matches Spring Boot's app.jwt.expirationInMs

# Convert the secret key to bytes for HMAC-SHA
JWT_SECRET_KEY_BYTES = JWT_SECRET_KEY.encode('utf-8')

# Ensure virtual environment exists
venv_dir = "venv"
if not os.path.exists(venv_dir):
    subprocess.run([sys.executable, "-m", "venv", venv_dir])

# Check if the virtual environment was created successfully
activate_script = os.path.join(venv_dir, "Scripts", "activate") if os.name == "nt" else os.path.join(venv_dir, "bin", "activate")
if not os.path.exists(activate_script):
    raise FileNotFoundError(f"Virtual environment activation script not found: {activate_script}. Ensure the virtual environment is created correctly.")

# Activate virtual environment and install required modules
pip_executable = os.path.join(venv_dir, "Scripts", "pip") if os.name == "nt" else os.path.join(venv_dir, "bin", "pip")
subprocess.run([pip_executable, "install", "-r", "requirements.txt"])

# Inform the user to manually activate the virtual environment
print(f"Please manually activate the virtual environment using: {activate_script}")

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],  # Your frontend URL
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": True
    }
})

# Store user sessions
user_sessions = {}

def initialize_qa_chain():
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain.chains import RetrievalQA

    # Initialize Gemini model with system message conversion
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0.2,
        convert_system_message_to_human=True
    )

    # Load vectorstore (ensure chroma_db directory exists)
    vectorstore = Chroma(
        persist_directory="./chroma_db",
        embedding_function=embedding  # Pass the embedding object directly
    )

    # Build the QA chain
    return RetrievalQA.from_chain_type(
        llm=llm,
        retriever=vectorstore.as_retriever(),
        return_source_documents=True
    )

# Ensure the embedding object is defined before using it
embedding = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

# Initialize the vectorstore with the embedding function
vectorstore = Chroma(
    persist_directory="./chroma_db",
    embedding_function=embedding  # Pass the embedding object directly
)

# Initialize QA chain
qa_chain = initialize_qa_chain()

# Establish a connection to the MySQL database
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="1234",
        database="ticket_system"
    )

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer token
                print(f"Received token: {token}")  # Debug log
            except IndexError:
                print("Invalid token format - missing Bearer prefix")  # Debug log
                return jsonify({'message': 'Invalid token format'}), 401

        if not token:
            print("No token provided in request")  # Debug log
            return jsonify({'message': 'Token is missing'}), 401

        try:
            # Debug log the secret key (first few characters only)
            print(f"Using secret key (first 10 chars): {JWT_SECRET_KEY[:10]}...")
            print(f"Secret key bytes length: {len(JWT_SECRET_KEY_BYTES)}")
            
            # Verify the token using both HS384 and HS512 algorithms
            try:
                data = decode(token, JWT_SECRET_KEY_BYTES, algorithms=["HS384"])
            except InvalidTokenError:
                data = decode(token, JWT_SECRET_KEY_BYTES, algorithms=["HS512"])
                
            print(f"Decoded token data: {data}")  # Debug log
            current_user_email = data['sub']  # Spring Boot uses 'sub' for the subject (user ID)
            print(f"Extracted user email: {current_user_email}")  # Debug log
        except ExpiredSignatureError as e:
            print(f"Token expired: {str(e)}")  # Debug log
            return jsonify({'message': 'Token has expired'}), 401
        except InvalidTokenError as e:
            print(f"Invalid token: {str(e)}")  # Debug log
            return jsonify({'message': 'Invalid token'}), 401
        except Exception as e:
            print(f"Unexpected error during token verification: {str(e)}")  # Debug log
            return jsonify({'message': 'Token verification failed'}), 401

        return f(current_user_email, *args, **kwargs)
    return decorated

@app.route('/query', methods=['POST'])
@token_required
def query(current_user_email):
    data = request.json
    query = data.get('query')

    if not query:
        return jsonify({"error": "query is required"}), 400

    try:
        print(f"Processing query: {query}")
        print(f"Current user email: {current_user_email}")
        
        connection = get_db_connection()
        cursor = connection.cursor()

        # First, get the user ID from the email
        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (current_user_email,)
        )
        user_result = cursor.fetchone()
        
        if not user_result:
            print(f"User not found for email: {current_user_email}")
            return jsonify({"error": "User not found"}), 404
            
        user_id = user_result[0]
        print(f"Found user ID: {user_id}")

        # Check if an active session exists for the user
        cursor.execute(
            "SELECT id, history FROM sessions WHERE user_id = %s AND end_time IS NULL",
            (user_id,)
        )
        session = cursor.fetchone()

        if session:
            session_id, history_json = session
            print(f"Found existing session: {session_id}")
            # Parse existing history or create new list
            chat_history = json.loads(history_json) if history_json else []
        else:
            # Create a new session if none exists
            print("Creating new session")
            cursor.execute(
                "INSERT INTO sessions (user_id, start_time, last_activity) VALUES (%s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                (user_id,)
            )
            connection.commit()
            session_id = cursor.lastrowid
            chat_history = []

        # Add user message to history
        chat_history.append({
            "role": "user",
            "content": query,
            "timestamp": datetime.now().isoformat()
        })

        # Convert history to string for context
        context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in chat_history])
        print(f"Context for query: {context}")

        try:
            # Process the query using the chatbot
            print("Invoking QA chain...")
            response = qa_chain.invoke({"query": context})
            print(f"QA chain response: {response}")
            answer = response["result"]
            print(f"Generated answer: {answer}")
        except Exception as e:
            print(f"Error in QA chain: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            answer = "I apologize, but I'm having trouble processing your request. Please try again later."

        # Add bot response to history
        chat_history.append({
            "role": "assistant",
            "content": answer,
            "timestamp": datetime.now().isoformat()
        })

        # Update the session with the new history and last activity
        updated_history = json.dumps(chat_history)
        cursor.execute(
            "UPDATE sessions SET history = %s, last_activity = CURRENT_TIMESTAMP WHERE id = %s",
            (updated_history, session_id)
        )
        connection.commit()

    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
        return jsonify({"error": "Database error"}), 500
    except json.JSONDecodeError as err:
        print(f"JSON Error: {err}")
        return jsonify({"error": "Invalid history format"}), 500
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

    return jsonify({
        "session_id": session_id,
        "answer": answer,
        "history": chat_history  # This is the full updated history
    })

@app.route('/test_db_connection', methods=['GET'])
def test_db_connection():
    try:
        connection = get_db_connection()
        if connection.is_connected():
            return jsonify({"status": "success", "message": "Database connection successful."})
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": f"Database connection failed: {err}"})
    finally:
        if connection.is_connected():
            connection.close()

# Add login endpoint to match Spring Boot's authentication
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Get user from database
        cursor.execute(
            "SELECT user_id, password, role FROM users WHERE email = %s",
            (email,)
        )
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        # In a real application, you would verify the password hash here
        # For this example, we'll assume the password matches
        if password != user['password']:  # Replace with proper password verification
            return jsonify({"error": "Invalid credentials"}), 401

        # Generate JWT token matching Spring Boot's format
        token = encode({
            'sub': str(user['user_id']),  # Spring Boot uses 'sub' for the subject
            'exp': datetime.utcnow() + timedelta(milliseconds=JWT_EXPIRATION_MS),
            'iat': datetime.utcnow(),
            'roles': [f"ROLE_{user['role']}"]  # Match Spring Boot's role format
        }, JWT_SECRET_KEY_BYTES, algorithm="HS512")

        return jsonify({
            "token": token,
            "type": "Bearer",
            "id": user['user_id'],
            "email": email,
            "roles": [f"ROLE_{user['role']}"]
        })

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": "Database error"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

pdf_directory = "./pdf_files"
chroma_directory = "./chroma_db"

# Ensure the directories exist
os.makedirs(pdf_directory, exist_ok=True)
os.makedirs(chroma_directory, exist_ok=True)

# Step 1: Define GitHub PDF URLs
pdf_urls = [
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/tesla%20testing.pdf",
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/model3.pdf",
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/modelY.pdf",
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/modelS.pdf",
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/modelX.pdf",
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/cybertruck.pdf"
]

# Step 2: Download missing PDFs
pdf_files = []
all_files_exist = True
for url in pdf_urls:
    filename = os.path.join(pdf_directory, url.split("/")[-1])
    pdf_files.append(filename)
    if not os.path.exists(filename):
        all_files_exist = False

if not all_files_exist:
    print("🔄 Downloading missing PDF files...")
    for url in pdf_urls:
        filename = os.path.join(pdf_directory, url.split("/")[-1])
        if not os.path.exists(filename):
            for attempt in range(3):  # Retry up to 3 times
                try:
                    with requests.get(url, stream=True) as response:
                        response.raise_for_status()
                        with open(filename, "wb") as f:
                            for chunk in response.iter_content(chunk_size=8192):
                                if chunk:
                                    f.write(chunk)
                    print(f"✅ Successfully downloaded: {filename}")
                    break
                except (ChunkedEncodingError, requests.exceptions.RequestException) as e:
                    print(f"⚠️ Attempt {attempt + 1} failed for {filename}: {e}")
                    time.sleep(2)
            else:
                print(f"❌ Failed to download: {filename} after 3 attempts")
else:
    print("✅ All PDF files are already downloaded.")

# Step 3: Check if any PDF is newer than the chroma_db directory (AFTER download)
def needs_rechunking(pdf_directory, chroma_directory):
    if not os.path.exists(chroma_directory):
        return True
    chroma_mtime = os.path.getmtime(chroma_directory)
    for filename in os.listdir(pdf_directory):
        if filename.lower().endswith('.pdf'):
            pdf_path = os.path.join(pdf_directory, filename)
            if os.path.getmtime(pdf_path) > chroma_mtime:
                return True
    return False

if needs_rechunking(pdf_directory, chroma_directory):
    print("Detected new or updated PDFs. Re-chunking and re-embedding all documents...")
    if os.path.exists(chroma_directory):
        shutil.rmtree(chroma_directory)
    # Proceed with chunking and embedding all PDFs as usual
else:
    print("No new PDFs detected. Using existing Chroma database.")

# Step 4: Check if Chroma database already exists
if os.path.exists(chroma_directory) and os.listdir(chroma_directory):
    print("✅ Chroma database already exists. Skipping chunking and embedding.")
    vectorstore = Chroma(
        persist_directory=chroma_directory,
        embedding_function=GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    )
else:
    print("🔄 Chunking and embedding PDF files...")
    all_docs = []
    for file in pdf_files:
        try:
            loader = PyPDFLoader(file)
            pages = loader.load()
            splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
            chunks = splitter.split_documents(pages)
            all_docs.extend(chunks)
            print(f"✅ Loaded: {file} ({len(chunks)} chunks)")
        except Exception as e:
            print(f"❌ Failed to load {file}: {e}")

    # Step 5: Embed and store in Chroma
    embedding = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vectorstore = Chroma.from_documents(
        documents=all_docs,
        embedding=embedding,
        persist_directory=chroma_directory
    )
    print(f"\n✅ Total embedded chunks: {len(all_docs)}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)