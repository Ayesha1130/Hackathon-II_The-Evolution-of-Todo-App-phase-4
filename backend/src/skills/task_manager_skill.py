"""
Task Manager Skill for the Autonomous Agent
Provides tools for creating, reading, updating, and deleting tasks
"""

from typing import Dict, List, Optional
from pydantic import BaseModel


class TaskManagerSkill:
    def __init__(self):
        pass

    def create_task(self, description: str, priority: str = "medium", category_id: Optional[str] = None) -> Dict:
        """
        Creates a new task with the provided description and optional priority/category
        """
        # This is now a utility function that just prepares the data
        # The actual database operation is handled by the agent
        return {
            "description": description,
            "priority": priority,
            "category_id": category_id
        }

    def get_task(self, task_id: str) -> Optional[Dict]:
        """
        Retrieves a specific task by its ID
        """
        # This is now a utility function that just prepares the data
        # The actual database operation is handled by the agent
        return {
            "task_id": task_id
        }

    def get_all_tasks(self) -> List[Dict]:
        """
        Retrieves all tasks
        """
        # This is now a utility function that just prepares the data
        # The actual database operation is handled by the agent
        return []

    def update_task(self, task_id: str, description: Optional[str] = None,
                         is_completed: Optional[bool] = None, priority: Optional[str] = None) -> Optional[Dict]:
        """
        Updates an existing task with provided attributes
        """
        # This is now a utility function that just prepares the data
        # The actual database operation is handled by the agent
        return {
            "task_id": task_id,
            "description": description,
            "is_completed": is_completed,
            "priority": priority
        }

    def delete_task(self, task_id: str) -> Dict:
        """
        Deletes a task by its ID
        """
        # This is now a utility function that just prepares the data
        # The actual database operation is handled by the agent
        return {
            "task_id": task_id
        }


# Initialize the task manager skill
task_manager = TaskManagerSkill()