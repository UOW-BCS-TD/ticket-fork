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
from datetime import datetime

# Set the Google API key for authentication
os.environ["GOOGLE_API_KEY"] = "AIzaSyAllDb85-EYZSDQjd8tVyF_Kg5WG8HPOjc"

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

@app.route('/query', methods=['POST'])
def query():
    data = request.json
    user_id = data.get('user_id')
    query = data.get('query')

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

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

# Step 1: Define GitHub PDF URLs
pdf_urls = [
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/tesla%20testing.pdf",
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/model3.pdf",
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/modelY.pdf",
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/modelS.pdf",
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/modelX.pdf",
    "https://raw.githubusercontent.com/Elvificent/ticket/add-chatbot-data/cybertruck.pdf"
]

# Step 2: Download PDFs with retry and streaming
pdf_files = []
for url in pdf_urls:
    filename = url.split("/")[-1]
    for attempt in range(3):  # Retry up to 3 times
        try:
            with requests.get(url, stream=True) as response:
                response.raise_for_status()
                with open(filename, "wb") as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:  # Filter out keep-alive chunks
                            f.write(chunk)
            pdf_files.append(filename)
            print(f"✅ Successfully downloaded: {filename}")
            break
        except (ChunkedEncodingError, requests.exceptions.RequestException) as e:
            print(f"⚠️ Attempt {attempt + 1} failed for {filename}: {e}")
            time.sleep(2)  # Wait before retrying
    else:
        print(f"❌ Failed to download: {filename} after 3 attempts")

# Step 3: Load, split, and chunk all PDFs
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

# Step 4: Embed and store in Chroma
embedding = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
vectorstore = Chroma.from_documents(
    documents=all_docs,
    embedding=embedding,
    persist_directory="./chroma_db"
)

print(f"\n✅ Total embedded chunks: {len(all_docs)}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)