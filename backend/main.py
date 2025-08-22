# File: backend/main.py
# This is the core orchestrator for the NeuroGenX-AI multi-agent system.
# It directs project requests to the appropriate specialized AI agents.

import os
import json
import asyncio
from fastapi import FastAPI, HTTPException, WebSocket, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Dict, Any

# Mocking the Gemini API calls. In a real-world scenario, these would
# be replaced with actual API calls to specialized models.
async def call_gemini_api(prompt: str, model: str = "gemini-2.0-pro") -> str:
    """
    This function simulates a call to a Gemini model.
    The response is a mock string representing the generated code.
    In a real system, we'd use the Generative Language API.
    """
    await asyncio.sleep(3)  # Simulate a complex generation process
    
    # Simple keyword routing for demonstration purposes
    if "data" in prompt.lower() or "analysis" in prompt.lower():
        # Data Science Agent response
        return f"""```python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Generate mock data for demonstration
data = {{
    'Category': ['A', 'B', 'C', 'A', 'B', 'C', 'A', 'B', 'C'],
    'Value': [10, 20, 15, 25, 30, 18, 12, 22, 28]
}}
df = pd.DataFrame(data)

# Perform basic data analysis
summary = df.groupby('Category')['Value'].mean()
print("Summary Statistics:\\n", summary)

# Create a simple bar plot
sns.barplot(x='Category', y='Value', data=df)
plt.title('Average Value by Category')
plt.xlabel('Category')
plt.ylabel('Average Value')
plt.show()
```"""
    elif "game" in prompt.lower():
        # Game Development Agent response
        return f"""```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Game</title>
    <style>
        body {{
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #000;
        }}
        canvas {{
            background-color: #333;
            border: 2px solid #fff;
        }}
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 400;
        
        let x = canvas.width / 2;
        let y = canvas.height / 2;
        let dx = 2;
        let dy = 2;

        function drawBall() {{
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fillStyle = "#0095DD";
            ctx.fill();
            ctx.closePath();
        }}

        function draw() {{
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBall();
            x += dx;
            y += dy;

            if (x + dx > canvas.width - 10 || x + dx < 10) {{
                dx = -dx;
            }}
            if (y + dy > canvas.height - 10 || y + dy < 10) {{
                dy = -dy;
            }}
        }}

        setInterval(draw, 10);
    </script>
</body>
</html>
```"""
    else:
        # Default Web Development Agent response
        return f"""```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project for '{prompt}'</title>
    <script src="[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)"></script>
    <style>
        body {{
            background-color: #1a202c;
            color: #e2e8f0;
            font-family: 'Inter', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }}
        .container {{
            background-color: #2d3748;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1 class="text-3xl font-bold mb-4">Project Generated Successfully</h1>
        <p class="text-xl">Your requested project on '{prompt}' has been created.</p>
        <div class="mt-6 p-4 bg-gray-700 rounded-lg">
            <h2 class="text-lg font-semibold mb-2">Details:</h2>
            <p class="text-sm">Topic: {prompt}</p>
            <p class="text-sm">Status: Validated and ready for deployment.</p>
        </div>
    </div>
</body>
</html>
```"""

# FastAPI application setup
app = FastAPI(title="NeuroGenX-AI Agent Orchestrator")

class ProjectRequest(BaseModel):
    """Schema for the incoming project request from the user."""
    topic: str = Field(..., description="The topic or description of the web project to build.")

async def get_project_request(request: ProjectRequest):
    """Dependency injection to validate and return the request body."""
    if not request.topic:
        raise HTTPException(status_code=400, detail="Project topic is required.")
    return request

@app.post("/api/projects/generate")
async def generate_project(request: ProjectRequest = Depends(get_project_request)):
    """
    Main endpoint to trigger the multi-agent code generation process.
    """
    try:
        # Orchestration Agent in action: routes the request to the correct Domain Agent.
        generated_code = await call_gemini_api(request.topic, model="gemini-2.0-pro")
        
        # A mock validation step. In a real system, the code would be
        # sent to a specialized Validator Agent for a thorough check.
        validation_status = "success" if "error" not in generated_code else "failed"

        if validation_status == "success":
            return JSONResponse(
                content={
                    "status": "success",
                    "message": "Project generated and validated successfully.",
                    "project_code": generated_code
                },
                status_code=200
            )
        else:
            return JSONResponse(
                content={
                    "status": "failed",
                    "message": "Project generation failed during validation.",
                    "validation_errors": "Simulated validation failure."
                },
                status_code=500
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# This WebSocket endpoint could be used for real-time monitoring of the agent flow.
@app.websocket("/ws/status")
async def websocket_status(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            status_update = {"status": "Awaiting project request..."}
            await websocket.send_json(status_update)
            await asyncio.sleep(5)
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()
