"""
Autonomous Todo Agent
An AI-powered agent that manages tasks through natural language interaction
"""

from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from ..models.task import Task
from ..schemas.task import TaskCreate
from ..skills.intent_analyzer_skill import intent_analyzer, IntentType


class TodoAgent:
    def __init__(self):
        self.intent_analyzer = intent_analyzer

    async def process_message(self, message: str, db_session: AsyncSession, user_id: str) -> Dict[str, Any]:
        """
        Process a user message and return an appropriate response
        """
        # Analyze the intent of the message
        intent_result = self.intent_analyzer.analyze_intent(message)

        intent = intent_result["intent"]

        # Process based on intent
        if intent == IntentType.TASK_CREATE:
            return await self._handle_task_creation(intent_result, db_session, user_id)
        elif intent == IntentType.TASK_READ:
            return await self._handle_task_reading(db_session, user_id)
        elif intent == IntentType.TASK_UPDATE:
            return await self._handle_task_update(intent_result, db_session, user_id)
        elif intent == IntentType.TASK_DELETE:
            return await self._handle_task_deletion(intent_result, db_session, user_id)
        elif intent == IntentType.CHAT_GENERAL:
            return await self._handle_general_chat(message)
        else:
            return {
                "response": "I'm not sure how to help with that. You can ask me to add, list, update, or delete tasks.",
                "intent": intent,
                "success": False
            }

    async def _handle_task_creation(self, intent_result: Dict, db_session: AsyncSession, user_id: str) -> Dict[str, Any]:
        """
        Handle task creation requests
        """
        task_description = intent_result.get("task_description", "").strip()

        if not task_description:
            # Try to extract from the original message
            # If we can't extract it properly from the intent, use the full message
            task_description = intent_result.get("original_message", "").strip()

        if not task_description:
            return {
                "response": "I heard you wanted to create a task, but I couldn't figure out what it is. Could you please tell me what task you'd like to add?",
                "intent": IntentType.TASK_CREATE,
                "success": False
            }

        try:
            # Create the task
            task_data = TaskCreate(
                description=task_description,
                priority="medium",  # Default priority
                category_id=None
            )

            new_task = Task(
                user_id=user_id,
                description=task_data.description,
                priority=task_data.priority,
                category_id=task_data.category_id
            )

            db_session.add(new_task)
            await db_session.commit()
            await db_session.refresh(new_task)

            return {
                "response": f"I've added '{task_description}' to your task list!",
                "intent": IntentType.TASK_CREATE,
                "success": True,
                "task": {
                    "id": new_task.id,
                    "description": new_task.description,
                    "is_completed": new_task.is_completed,
                    "priority": new_task.priority,
                    "category_id": new_task.category_id,
                    "created_at": new_task.created_at.isoformat(),
                    "updated_at": new_task.updated_at.isoformat()
                }
            }
        except Exception as e:
            return {
                "response": f"Sorry, I couldn't add that task: {str(e)}",
                "intent": IntentType.TASK_CREATE,
                "success": False
            }

    async def _handle_task_reading(self, db_session: AsyncSession, user_id: str) -> Dict[str, Any]:
        """
        Handle task reading/listing requests
        """
        try:
            # Get all tasks for the specific user
            result = await db_session.execute(
                select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
            )
            tasks = result.scalars().all()

            if not tasks:
                return {
                    "response": "You don't have any tasks yet. Would you like to add one?",
                    "intent": IntentType.TASK_READ,
                    "success": True,
                    "tasks": []
                }

            task_list = "\n".join([f"- {task.description}" for task in tasks])
            task_count = len(tasks)

            return {
                "response": f"You have {task_count} task(s):\n{task_list}",
                "intent": IntentType.TASK_READ,
                "success": True,
                "tasks": [
                    {
                        "id": task.id,
                        "description": task.description,
                        "is_completed": task.is_completed,
                        "priority": task.priority,
                        "category_id": task.category_id,
                        "created_at": task.created_at.isoformat(),
                        "updated_at": task.updated_at.isoformat()
                    }
                    for task in tasks
                ]
            }
        except Exception as e:
            return {
                "response": f"Sorry, I couldn't retrieve your tasks: {str(e)}",
                "intent": IntentType.TASK_READ,
                "success": False
            }

    async def _handle_task_update(self, intent_result: Dict, db_session: AsyncSession, user_id: str) -> Dict[str, Any]:
        """
        Handle task update requests
        """
        action = intent_result.get("action", "")

        if action == "mark_done":
            # For now, we'll just acknowledge that marking as done is understood
            return {
                "response": "I understand you want to mark a task as done. For this, please specify which task you want to mark as completed.",
                "intent": IntentType.TASK_UPDATE,
                "success": True,
                "action": "mark_done"
            }
        else:
            return {
                "response": "I understand you want to update a task. Please specify which task you want to update and what changes to make.",
                "intent": IntentType.TASK_UPDATE,
                "success": True,
                "action": "update"
            }

    async def _handle_task_deletion(self, intent_result: Dict, db_session: AsyncSession, user_id: str) -> Dict[str, Any]:
        """
        Handle task deletion requests
        """
        return {
            "response": "I understand you want to delete a task. Please specify which task you want to delete.",
            "intent": IntentType.TASK_DELETE,
            "success": True
        }

    async def _handle_general_chat(self, message: str) -> Dict[str, Any]:
        """
        Handle general chat that's not related to tasks
        """
        # Simple responses for general chat
        if any(word in message.lower() for word in ["hello", "hi", "hey", "greetings"]):
            return {
                "response": "Hello! I'm your task assistant. You can ask me to add, list, update, or delete tasks.",
                "intent": IntentType.CHAT_GENERAL,
                "success": True
            }
        elif any(word in message.lower() for word in ["bye", "goodbye", "see you", "farewell"]):
            return {
                "response": "Goodbye! Feel free to come back when you need help managing your tasks.",
                "intent": IntentType.CHAT_GENERAL,
                "success": True
            }
        elif any(word in message.lower() for word in ["thank", "thanks", "appreciate"]):
            return {
                "response": "You're welcome! I'm here to help you manage your tasks efficiently.",
                "intent": IntentType.CHAT_GENERAL,
                "success": True
            }
        else:
            return {
                "response": "I'm your task assistant. You can ask me to add, list, update, or delete tasks. For example: 'Add a task to buy groceries' or 'Show me my tasks'.",
                "intent": IntentType.CHAT_GENERAL,
                "success": True
            }


# Initialize the agent
todo_agent = TodoAgent()