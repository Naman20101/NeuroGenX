"""
Deployment agent. Registers the champion model and its manifest.
"""
from .base import Agent
from typing import Dict, Any
import pickle
import logging
import os
import datetime
from app.core.registry import register_model_champion

logger = logging.getLogger(__name__)

class DeployFastAPIAgent(Agent):
    name = "DeployFastAPI"
    version = "1.0"

    async def run(self, ctx: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deploys the champion model by saving it and its manifest.
        In a real-world scenario, this would push the model to a
        production registry.
        """
        champion_pipeline = ctx.get("champion_pipeline")
        run_id = ctx.get("run_id")
        metrics = ctx.get("metrics")
        best_genome = ctx.get("champion_genome")

        if any(v is None for v in [champion_pipeline, run_id, metrics, best_genome]):
            raise ValueError("Missing required context for deployment.")

        model_manifest = {
            "run_id": run_id,
            "timestamp": datetime.datetime.now().isoformat(),
            "metrics": metrics,
            "genome": best_genome,
            "model_path": f"./models/{run_id}.pkl"
        }

        # Save the model pipeline to disk
        try:
            os.makedirs("./models", exist_ok=True)
            with open(model_manifest["model_path"], "wb") as f:
                pickle.dump(champion_pipeline, f)

            register_model_champion(model_manifest)

            ctx["champion_model"] = model_manifest
            logger.info(f"Model {run_id} deployed and registered.")
            return ctx

        except Exception as e:
            logger.error(f"Failed to deploy model: {e}")
            raise
