"""
Intent Analyzer Skill for the Autonomous Agent
Analyzes user input to determine if they want to add a task or just chat
"""

import re
from typing import Dict, Literal
from enum import Enum


class IntentType(str, Enum):
    TASK_CREATE = "task_create"
    TASK_READ = "task_read"
    TASK_UPDATE = "task_update"
    TASK_DELETE = "task_delete"
    CHAT_GENERAL = "chat_general"


class IntentAnalyzerSkill:
    def __init__(self):
        # Patterns for task creation
        self.create_patterns = [
            r'\b(add|create|make|new|put|enter)\s+(a\s+)?(task|todo|to-do|item|thing|do|work)\b',
            r'\b(need\s+to|want\s+to|have\s+to|must|should)\s+.+',
            r'\b(todo|to-do|task):\s*(.+)',
            r'\b(got|have)\s+(to|this)\b',
            r'\b(remind\s+me|help\s+me\s+remember)\b',
        ]

        # Patterns for task reading
        self.read_patterns = [
            r'\b(show|list|display|view|see|get|fetch|tell\s+me)\s+(all\s+)?(tasks|todos|to-dos|items)\b',
            r'\b(what\s+(do\s+i|should\s+i|am\s+i\s+supposed\s+to)\s+(do|have))\b',
            r'\b(my\s+)?(tasks|todos|to-dos)\b',
        ]

        # Patterns for task updating
        self.update_patterns = [
            r'\b(update|change|modify|edit|complete|finish|done|mark\s+as\s+done|check\s+off)\s+(a\s+)?(task|todo|to-do|item)\b',
            r'\b(mark|set)\s+(as\s+)?(completed|done|finished|inactive)\b',
        ]

        # Patterns for task deletion
        self.delete_patterns = [
            r'\b(delete|remove|erase|eliminate|get\s+rid\s+of|cancel)\s+(a\s+)?(task|todo|to-do|item)\b',
            r'\b(done\s+with|finished\s+with)\s+(a\s+)?(task|todo|to-do|item)\b',
        ]

    def analyze_intent(self, user_input: str) -> Dict[str, str]:
        """
        Analyzes the user input and determines the intent
        """
        user_input_lower = user_input.lower().strip()

        # Check for task creation
        for pattern in self.create_patterns:
            if re.search(pattern, user_input_lower):
                # Extract potential task description
                task_desc = self._extract_task_description(user_input_lower)
                return {
                    "intent": IntentType.TASK_CREATE,
                    "confidence": "high",
                    "task_description": task_desc
                }

        # Check for task reading
        for pattern in self.read_patterns:
            if re.search(pattern, user_input_lower):
                return {
                    "intent": IntentType.TASK_READ,
                    "confidence": "high"
                }

        # Check for task updating
        for pattern in self.update_patterns:
            if re.search(pattern, user_input_lower):
                # Check if it's marking as done
                if any(word in user_input_lower for word in ['complete', 'done', 'finish', 'finished', 'mark as done', 'check off']):
                    return {
                        "intent": IntentType.TASK_UPDATE,
                        "confidence": "high",
                        "action": "mark_done"
                    }
                else:
                    return {
                        "intent": IntentType.TASK_UPDATE,
                        "confidence": "high",
                        "action": "update"
                    }

        # Check for task deletion
        for pattern in self.delete_patterns:
            if re.search(pattern, user_input_lower):
                return {
                    "intent": IntentType.TASK_DELETE,
                    "confidence": "high"
                }

        # If none of the above, it's general chat
        return {
            "intent": IntentType.CHAT_GENERAL,
            "confidence": "medium"
        }

    def _extract_task_description(self, user_input: str) -> str:
        """
        Extracts the likely task description from the user input
        """
        # Remove common prefixes
        prefixes = [
            r'^add\s+', r'^create\s+', r'^make\s+', r'^new\s+', r'^need\s+to\s+',
            r'^want\s+to\s+', r'^have\s+to\s+', r'^must\s+', r'^should\s+'
        ]

        task_text = user_input
        for prefix in prefixes:
            task_text = re.sub(prefix, '', task_text, flags=re.IGNORECASE)

        # Remove common suffixes
        suffixes = [
            r'\s+please$', r'\s+thanks$', r'\s+thank\s+you$'
        ]

        for suffix in suffixes:
            task_text = re.sub(suffix, '', task_text, flags=re.IGNORECASE)

        # Clean up extra whitespace
        task_text = ' '.join(task_text.split())

        return task_text if task_text else user_input


# Initialize the intent analyzer skill
intent_analyzer = IntentAnalyzerSkill()