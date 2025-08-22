"""
Evolutionary Search agent. This agent performs a genetic algorithm
to find the best model architecture and hyperparameters.
"""
from .base import Agent
from typing import Dict, Any
import asyncio
import logging
import json
import random
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
import numpy as np
from app.core.telemetry import LiveTelemetryManager

logger = logging.getLogger(__name__)

# Mock model genomes for simplicity
def get_genome():
    """Generates a random model genome."""
    models = ["logistic_regression", "random_forest"]
    model_choice = random.choice(models)

    if model_choice == "logistic_regression":
        return {
            "model": "logistic_regression",
            "params": {
                "C": random.uniform(0.1, 10.0),
                "solver": random.choice(["liblinear", "lbfgs"])
            }
        }
    elif model_choice == "random_forest":
        return {
            "model": "random_forest",
            "params": {
                "n_estimators": random.randint(50, 200),
                "max_depth": random.randint(5, 20)
            }
        }

def build_model_from_genome(genome):
    """Builds a scikit-learn model from a genome."""
    if genome["model"] == "logistic_regression":
        return LogisticRegression(**genome["params"])
    elif genome["model"] == "random_forest":
        return RandomForestClassifier(**genome["params"])

class EvolveSearchAgent(Agent):
    name = "EvolveSearch"
    version = "1.0"

    async def run(self, ctx: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a simplified evolutionary search.
        For a more advanced version, this would be a full genetic algorithm loop.
        """
        X_train = ctx.get("X_train")
        y_train = ctx.get("y_train")
        preprocessor = ctx.get("preprocessor")
        run_id = ctx.get("run_id")
        budget = ctx.get("budget", 10)
        telemetry_manager: LiveTelemetryManager = ctx.get("telemetry_manager")

        if any(v is None for v in [X_train, y_train, preprocessor]):
            raise ValueError("Missing required context for evolution.")

        best_score = -1.0
        best_genome = None

        # Simulate an evolutionary process
        for i in range(budget):
            await asyncio.sleep(0.5) # Simulate work
            genome = get_genome()
            model = build_model_from_genome(genome)

            # Create a full pipeline with preprocessing
            pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('classifier', model)])

            try:
                scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring="roc_auc")
                mean_score = np.mean(scores)
            except Exception as e:
                logger.warning(f"Trial {i} failed: {e}")
                mean_score = 0.0

            # Send live trial telemetry
            trial_data = {
                "run_id": run_id,
                "trial_id": i,
                "model_type": genome["model"],
                "score": float(mean_score),
                "params": genome["params"],
                "status": "completed" if mean_score > 0 else "failed"
            }
            await telemetry_manager.send_message(json.dumps({"type": "trial_update", "data": trial_data}))

            if mean_score > best_score:
                best_score = mean_score
                best_genome = genome

        # Train the champion model on the full training data
        champion_model = build_model_from_genome(best_genome)
        champion_pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('classifier', champion_model)])
        champion_pipeline.fit(X_train, y_train)

        ctx["champion_pipeline"] = champion_pipeline
        ctx["champion_genome"] = best_genome
        ctx["best_score"] = best_score

        logger.info(f"Evolutionary search completed. Best score: {best_score}")
        return ctx
