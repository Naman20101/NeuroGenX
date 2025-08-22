# NeuroGenX
NG‑1 (NeuroGenesis) — self‑evolving multi‑agent AutoML / anomaly detection OS (MVP)
NeuroGenX-AI: The Universal Project Generator
Project Overview
NeuroGenX-AI is a revolutionary multi-agent system designed to act as a universal project generator. It is not a specialized tool; it is a "master of all fields" that can take a high-level request in plain language and generate a complete, runnable project from scratch.

The system intelligently routes your request to the appropriate specialized Domain Agent (e.g., Web Development, Data Science, Game Development) which then handles the code generation. The entire process is orchestrated to produce a high-quality, professional project.

Core Components
Backend: A robust FastAPI server that acts as the central orchestrator for the AI agents.

Frontend: A dynamic and intuitive conversational interface built with React and Tailwind CSS.

CI/CD: A fully automated GitHub Actions workflow for continuous integration and deployment.

Getting Started
Prerequisites
Python 3.10+ and pip

Node.js 16+ and npm or yarn

1. Backend Setup
# Navigate to the backend directory
cd backend

# Create a Python virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate

# Install the required Python packages
pip install -r requirements.txt

Running the Backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

2. Frontend Setup
# Navigate to the frontend directory
cd frontend

# Install the Node.js dependencies
npm install

Running the Frontend
npm run dev

3. Deployment
This project is designed for a full web-stack deployment. The provided ci.yml file contains a GitHub Actions workflow to automate the entire process, from building a Docker image of the backend to deploying it to a cloud provider like Google Cloud Run.

License
This project is licensed under the Apache-2.0 License. See the LICENSE file for full details.
