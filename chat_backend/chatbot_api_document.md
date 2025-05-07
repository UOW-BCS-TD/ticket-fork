# API Documentation for Chatbot Backend

## Base URL
The API is hosted locally at:
```
http://localhost:5000
```

## Endpoints

### 1. `/query` (POST)
This endpoint allows users to interact with the chatbot by sending queries. It supports session management for multiple users.

#### Request
- **URL**: `/query`
- **Method**: POST
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "user_id": "<optional_user_id>",
    "query": "<your_query_here>"
  }
  ```
  - `user_id` (optional): A unique identifier for the user. If not provided, a new session will be created.
  - `query` (required): The question or input for the chatbot.

#### Response
- **Status Code**: 200 OK
- **Body**:
  ```json
  {
    "user_id": "<generated_or_provided_user_id>",
    "answer": "<chatbot_response>"
  }
  ```
  - `user_id`: The unique identifier for the user session.
  - `answer`: The chatbot's response to the query.

#### Example
**Request**:
```bash
curl -X POST http://localhost:5000/query \
-H "Content-Type: application/json" \
-d '{"query": "What is the Tesla Model Y?"}'
```

**Response**:
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "answer": "The Tesla Model Y is a compact electric SUV..."
}
```

## Notes
- The `user_id` can be reused in subsequent requests to maintain the session.
- Ensure the server is running locally before making API calls.
- Use tools like Postman or cURL to test the API.

# Setting Up a Virtual Environment (venv)

A virtual environment helps isolate your Python dependencies for a specific project.

## Step 1: Install Python
Ensure Python is installed on your system. You can check by running:
```bash
python --version
```
If Python is not installed, download and install it from [python.org](https://www.python.org/).

## Step 2: Create a Virtual Environment
Navigate to your project directory:
```bash
cd "C:\Cyber\Test Chatbot"
```

Create a virtual environment named `venv`:
```bash
python -m venv venv
```

## Step 3: Activate the Virtual Environment
On Windows, activate the virtual environment:
```bash
venv\Scripts\activate
```

You should see `(venv)` at the beginning of your command prompt, indicating the virtual environment is active.

## Step 4: Install Dependencies
Install the required dependencies listed in `requirements.txt`:
```bash
pip install -r requirements.txt
```
## Step 5: Run the Application
Now you can run your Python application:
```bash
python app.py
```
Your application should now be running.

## Deactivating the Virtual Environment
When you're done working, deactivate the virtual environment:
```bash
deactivate
```

