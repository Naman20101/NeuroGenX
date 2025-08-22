"""
Data preprocessing agent.
"""
from .base import Agent
from typing import Dict, Any
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
import logging

logger = logging.getLogger(__name__)

class PrepBasicAgent(Agent):
    name = "PrepBasic"
    version = "1.0"

    async def run(self, ctx: Dict[str, Any]) -> Dict[str, Any]:
        """
        Performs basic data preprocessing: splits data into train/test,
        and creates a preprocessing pipeline for numerical columns.
        """
        df = ctx.get("dataframe")
        if df is None:
            raise ValueError("DataFrame not found in context.")

        target = ctx.get("target")
        if target is None:
            raise ValueError("Target column not specified in context.")

        if target not in df.columns:
            raise ValueError(f"Target column '{target}' not found in DataFrame.")

        X = df.drop(columns=[target])
        y = df[target]

        # Identify numerical features. For this MVP, we only handle numerical.
        numerical_features = X.select_dtypes(include=['int64', 'float64']).columns

        # Create a preprocessing pipeline
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numerical_features)
            ],
            remainder='passthrough'
        )

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

        ctx["X_train"] = X_train
        ctx["X_test"] = X_test
        ctx["y_train"] = y_train
        ctx["y_test"] = y_test
        ctx["preprocessor"] = preprocessor

        logger.info("Data preprocessing completed.")
        return ctx
