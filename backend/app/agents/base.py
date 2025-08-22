"""
Base class for all agents. Defines a common interface and contract.
"""
import asyncio
from typing import Protocol, Dict, Any

class Agent(Protocol):
    """
    Protocol for an agent. All agents must implement this.
    """
    name: str
    version: str

    async def run(self, ctx: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the agent's task.
        
        Args:
            ctx (Dict[str, Any]): The context dictionary to pass between agents.
        
        Returns:
            Dict[str, Any]: The updated context dictionary.
        """
        ...
