"""
The Orchestrator is the brain of the NeuroGenX-NG-1 system.
It manages the entire lifecycle of a model run, from data ingestion
to deployment, by coordinating the various agents.
"""
from typing import Dict, Any, Union
import json
import logging
import asyncio
import uuid
import os
from .registry import register_model_champion, get_champion_manifest
from .telemetry import LiveTelemetryManager
from app.agents import ingest_csv, prep_basic, search_evolve, evaluate, deploy_fastapi
from pydantic import BaseModel

# In-memory store for run statuses
RUN_STATUS: Dict[str, Any] = {}
telemetry_manager = LiveTelemetryManager()
logger = logging.getLogger(__name__)

class RunRequest(BaseModel):
    """Pydantic model for a run request."""
    dataset_id: str
    target: str
    run_budget: int

async def start_run(request: RunRequest):
    """
    Starts an asynchronous model evolution run.
    This function delegates the work to a series of agents.
    """
    run_id = str(uuid.uuid4())
    logger.info(f"Starting new run with ID: {run_id}")
    RUN_STATUS[run_id] = {
        "status": "pending",
        "progress": 0,
        "run_id": run_id,
        "log": []
    }

    # Send initial status via WebSocket
    await telemetry_manager.send_message(json.dumps(RUN_STATUS[run_id]))

    try:
        # Step 1: Ingest Data
        RUN_STATUS[run_id]["status"] = "ingesting data"
        RUN_STATUS[run_id]["progress"] = 10
        await telemetry_manager.send_message(json.dumps(RUN_STATUS[run_id]))
        ctx = await ingest_csv.IngestCSVAgent().run(ctx={"dataset_id": request.dataset_id, "target": request.target})

        # Step 2: Preprocess Data
        RUN_STATUS[run_id]["status"] = "preprocessing data"
        RUN_STATUS[run_id]["progress"] = 25
        await telemetry_manager.send_message(json.dumps(RUN_STATUS[run_id]))
        ctx = await prep_basic.PrepBasicAgent().run(ctx=ctx)

        # Step 3: Evolve Model (Genetic Search)
        RUN_STATUS[run_id]["status"] = "evolving model"
        RUN_STATUS[run_id]["progress"] = 50
        await telemetry_manager.send_message(json.dumps(RUN_STATUS[run_id]))
        # The search agent will update telemetry live via its own method
        ctx = await search_evolve.EvolveSearchAgent().run(
            ctx={
                "X_train": ctx["X_train"],
                "y_train": ctx["y_train"],
                "budget": request.run_budget,
                "run_id": run_id,
                "telemetry_manager": telemetry_manager,
                "preprocessor": ctx["preprocessor"]
            }
        )

        # Step 4: Evaluate Champion
        RUN_STATUS[run_id]["status"] = "evaluating champion"
        RUN_STATUS[run_id]["progress"] = 80
        await telemetry_manager.send_message(json.dumps(RUN_STATUS[run_id]))
        ctx = await evaluate.EvaluateAgent().run(ctx=ctx)

        # Step 5: Deploy Champion
        RUN_STATUS[run_id]["status"] = "deploying"
        RUN_STATUS[run_id]["progress"] = 95
        await telemetry_manager.send_message(json.dumps(RUN_STATUS[run_id]))
        ctx = await deploy_fastapi.DeployFastAPIAgent().run(ctx=ctx)

        # Finalize status
        RUN_STATUS[run_id]["status"] = "completed"
        RUN_STATUS[run_id]["progress"] = 100
        RUN_STATUS[run_id]["champion_model"] = ctx.get("champion_model")
        RUN_STATUS[run_id]["metrics"] = ctx.get("metrics")
        await telemetry_manager.send_message(json.dumps(RUN_STATUS[run_id]))

        logger.info(f"Run {run_id} completed successfully.")

    except Exception as e:
        logger.error(f"Run {run_id} failed: {e}")
        RUN_STATUS[run_id]["status"] = "failed"
        RUN_STATUS[run_id]["error"] = str(e)
        await telemetry_manager.send_message(json.dumps(RUN_STATUS[run_id]))

def get_status(run_id: str) -> Dict[str, Any]:
    """Retrieves the current status of a run."""
    return RUN_STATUS.get(run_id, {"status": "not found"})

def load_champion_model() -> Union[Dict[str, Any], None]:
    """Loads the currently deployed champion model manifest."""
    return get_champion_manifest()
