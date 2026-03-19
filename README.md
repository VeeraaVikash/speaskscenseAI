# SpeakScense

SpeakScense is an advanced AI-powered language coaching application designed to provide dynamic and contextual language learning experiences. It guides users through various conversational scenarios and provides real-time, granular feedback on grammar, fluency, and pronunciation using cutting-edge LLM integration.

## Key Features

- **Intelligent Level Detection**: Assesses user linguistic proficiency based on initial short interactions and assigns a proficiency level.
- **Dynamic Scenario Coaching**: Engages users in organic, context-aware conversations (e.g., Casual Chat, Job Interview, Public Speaking, Negotiation). The AI coach actively progresses the conversation dynamically.
- **Granular Feedback**: Analyzes user speech and provides 'Good', 'Better', and 'Best' iterations of their input, ensuring they retain their original meaning while learning native phrasing.
- **Targeted Pronunciation Tips**: Generates actionable phonetic tips based on the exact challenging words the user attempted.
- **Session Analysis**: Scores users on Grammar, Fluency, and Pronunciation, providing a holistic view of their language acquisition.

## Tech Stack

- **Frontend**: React (Vite)
- **Backend**: FastAPI (Python), SQLite
- **LLM Integration**: Groq API 

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/Harishlal-me/speakscense.git
cd speakscense
```

### 2. Backend Setup
The backend runs on FastAPI and Python.

```bash
cd backend
python -m venv venv
# Activate the virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Ensure you have a `.env` file containing your GROQ_API_KEY
echo "GROQ_API_KEY=your_api_key_here" > .env

# Run the server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
The frontend is a React application built with Vite.

```bash
cd frontend
npm install

# Run the development server
npm run dev -- --port 3177
```

### 4. Access the Application
Open your browser and navigate to `http://localhost:3177` to start practicing with the SpeakScense AI Coach.

## System Architecture

1. **Client**: Captures audio/text from the user using Web APIs and sends the payload to the backend. It also handles the interactive coaching UI.
2. **API Layer**: FastAPI endpoints receive the interactions, categorize the requests, and build strict logical prompt templates.
3. **LLM Engine**: The system queries the Groq API using a highly structured prompt to enforce JSON grammar, ensuring organic follow-up generation and accurate pedagogical tips.
4. **Database**: SQLite tracks user sessions, scenarios chosen, and historical performance scores.
