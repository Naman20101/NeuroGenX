"""
Manages WebSocket connections for real-time telemetry.
This allows the frontend to receive live updates from the backend
about the progress of a model evolution run.
"""
import asyncio
import json
from fastapi import WebSocket
from typing import List
import logging

logger = logging.getLogger(__name__)

class LiveTelemetryManager:
    """
    A singleton-like class to manage WebSocket connections and send messages.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accepts a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Removes a WebSocket connection."""
        try:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
        except ValueError:
            pass # Connection already removed

    async def send_message(self, message: str):
        """
        Broadcasts a message to all active WebSocket connections.
        Handles disconnection gracefully.
        """
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except WebSocketDisconnect:
                dead_connections.append(connection)
            except Exception as e:
                logger.error(f"Failed to send message to a client: {e}")
                dead_connections.append(connection)

        for connection in dead_connections:
            self.disconnect(connection)
