"""
Evaluation agent to calculate metrics on the champion model.
"""
from .base import Agent
from typing import Dict, Any
import logging
from sklearn.metrics import roc_auc_score, f1_score, precision_recall_curve, auc
import numpy as np

logger = logging.getLogger(__name__)

class EvaluateAgent(Agent):
    name = "Evaluate"
    version = "1.0"

    async def run(self, ctx: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates the champion model on the test set and calculates key metrics.
        """
        champion_pipeline = ctx.get("champion_pipeline")
        X_test = ctx.get("X_test")
        y_test = ctx.get("y_test")

        if any(v is None for v in [champion_pipeline, X_test, y_test]):
            raise ValueError("Missing required context for evaluation.")

        try:
            # Predict probabilities
            y_pred_proba = champion_pipeline.predict_proba(X_test)[:, 1]

            # Calculate metrics
            roc_auc = roc_auc_score(y_test, y_pred_proba)

            precision, recall, _ = precision_recall_curve(y_test, y_pred_proba)
            pr_auc = auc(recall, precision)

            # For F1 score, we need to choose a threshold. Using 0.5 for simplicity.
            y_pred = (y_pred_proba > 0.5).astype(int)
            f1 = f1_score(y_test, y_pred)

            metrics = {
                "roc_auc": float(roc_auc),
                "pr_auc": float(pr_auc),
                "f1_score": float(f1)
            }

            ctx["metrics"] = metrics

            logger.info(f"Model evaluation completed. Metrics: {metrics}")
            return ctx
        except Exception as e:
            logger.error(f"Failed to evaluate model: {e}")
            raise
