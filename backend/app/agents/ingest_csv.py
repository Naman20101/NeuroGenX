"""
Ingest agent to handle CSV file uploads.
"""
from .base import Agent
from typing import Dict, Any
import pandas as pd
import os
import logging

logger = logging.getLogger(__name__)

class IngestCSVAgent(Agent):
    name = "IngestCSV"
    version = "1.0"

    async def run(self, ctx: Dict[str, Any]) -> Dict[str, Any]:
        """
        Reads a CSV file from a specified path in the context and returns
        the data as a Pandas DataFrame.
        """
        dataset_id = ctx.get("dataset_id")
        if not dataset_id:
            raise ValueError("Dataset ID not found in context.")
            
        file_path = f"./data/{dataset_id}.csv"

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Dataset file not found at {file_path}")

        try:
            df = pd.read_csv(file_path)
            logger.info(f"Ingested CSV file from {file_path}")
            ctx["dataframe"] = df
            ctx["schema"] = df.dtypes.astype(str).to_dict()
            return ctx
        except Exception as e:
            logger.error(f"Failed to ingest CSV: {e}")
            raise
