# backend.py
import os
import subprocess
import sys
import requests
from flask import Flask, request, jsonify
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

# Store user sessions
user_sessions = {}

def initialize_qa_chain():
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain.chains import RetrievalQA
    from langchain.prompts import PromptTemplate

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

    # Initialize Gemini model
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.2)

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
        connection = get_db_connection()
        cursor = connection.cursor()

        # First, get the user ID from the email
        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (current_user_email,)
        )
        user_result = cursor.fetchone()
        
        if not user_result:
            return jsonify({"error": "User not found"}), 404
            
        user_id = user_result[0]

        # Check if an active session exists for the user
        cursor.execute(
            "SELECT id, history FROM sessions WHERE user_id = %s AND end_time IS NULL",
            (user_id,)
        )
        session = cursor.fetchone()

        if session:
            session_id, history_json = session
            # Parse existing history or create new list
            chat_history = json.loads(history_json) if history_json else []
        else:
            # Create a new session if none exists
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

        # Process the query using the chatbot
        response = qa_chain.invoke({"query": context})
        answer = response["result"]

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
        print(f"Error: {err}")
        return jsonify({"error": "Database error"}), 500
    except json.JSONDecodeError as err:
        print(f"JSON Error: {err}")
        return jsonify({"error": "Invalid history format"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

    return jsonify({"session_id": session_id, "answer": answer})

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

# Step 1: Define GitHub PDF URLs
pdf_urls = [
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/tesla%20testing.pdf",
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/model3.pdf",
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/modelY.pdf",
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/modelS.pdf",
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/modelX.pdf",
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/cybertruck.pdf"
]

# Directory to store downloaded PDFs and Chroma database
pdf_directory = "./pdf_files"
chroma_directory = "./chroma_db"

# Ensure the directories exist
os.makedirs(pdf_directory, exist_ok=True)
os.makedirs(chroma_directory, exist_ok=True)

# Step 2: Check if all PDFs are already downloaded
pdf_files = []

for url in pdf_urls:
    filename = os.path.join(pdf_directory, url.split("/")[-1])
    pdf_files.append(filename)
    if not os.path.exists(filename):

    vectorstore = Chroma(
        persist_directory=chroma_directory,
        embedding_function=GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    )
else:

        try:
            loader = PyPDFLoader(file)
            pages = loader.load()
            splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
            chunks = splitter.split_documents(pages)
            all_docs.extend(chunks)
            print(f"✅ Loaded: {file} ({len(chunks)} chunks)")
        except Exception as e:
            print(f"❌ Failed to load {file}: {e}")


    embedding = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vectorstore = Chroma.from_documents(
        documents=all_docs,
        embedding=embedding,
        persist_directory=chroma_directory
    )
    print(f"\n✅ Total embedded chunks: {len(all_docs)}")


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)