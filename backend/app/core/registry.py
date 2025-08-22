"""
Handles the model registry. This is where trained models and their
metadata (manifests) are stored and versioned.
"""
import os
import json
import logging
from typing import Dict, Any, Union

logger = logging.getLogger(__name__)

# Path to store model artifacts and manifests
MODELS_DIR = "./models"
CHAMPION_MANIFEST_PATH = os.path.join(MODELS_DIR, "champion_manifest.json")

def register_model_champion(model_manifest: Dict[str, Any]) -> None:
    """
    Registers a new model champion by saving its manifest.
    This overwrites the previous champion, establishing a new one.
    """
    os.makedirs(MODELS_DIR, exist_ok=True)
    try:
        with open(CHAMPION_MANIFEST_PATH, "w") as f:
            json.dump(model_manifest, f, indent=4)
        logger.info(f"New champion model registered and saved to {CHAMPION_MANIFEST_PATH}")
    except IOError as e:
        logger.error(f"Failed to write champion manifest: {e}")
        raise

def get_champion_manifest() -> Union[Dict[str, Any], None]:
    """
    Retrieves the manifest of the current champion model.
    """
    if not os.path.exists(CHAMPION_MANIFEST_PATH):
        logger.warning("No champion model manifest found.")
        return None

    try:
        with open(CHAMPION_MANIFEST_PATH, "r") as f:
            manifest = json.load(f)
        return manifest
    except (IOError, json.JSONDecodeError) as e:
        logger.error(f"Failed to read or parse champion manifest: {e}")
        return None
