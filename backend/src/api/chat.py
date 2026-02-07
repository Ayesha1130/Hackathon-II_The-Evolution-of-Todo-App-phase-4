import asyncio
import json
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..agents.todo_agent import todo_agent
from ..models import Conversation, Message, MessageRole, User
from .deps import get_current_user, get_db

router = APIRouter()


class ChatRequest(BaseModel):
    content: str
    conversation_id: Optional[str] = None


@router.post("/")
async def chat_with_agent(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Handles a chat message using the autonomous Todo Agent and streams the response."""
    conv_id = request.conversation_id
    if conv_id:
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == conv_id, Conversation.user_id == current_user.id
            )
        )
        conversation = result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = Conversation(id=str(uuid.uuid4()), user_id=current_user.id)
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
        conv_id = conversation.id

    history_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conv_id)
        .order_by(Message.created_at)
        .limit(20)
    )
    history = [
        {"role": msg.role.value, "content": msg.content}
        for msg in history_result.scalars()
    ]

    history.append({"role": "user", "content": request.content})
    user_msg_db = Message(
        conversation_id=conv_id, role=MessageRole.USER, content=request.content
    )
    db.add(user_msg_db)
    await db.commit()

    async def event_generator():
        full_reply = ""
        yield f"data: {json.dumps({'conversation_id': conv_id})}\n\n"
        try:
            # Process the message using the autonomous agent
            response_data = await todo_agent.process_message(request.content, db, current_user.id)

            # Get the response text
            response_text = response_data.get("response", "")

            # Stream the response in chunks
            words = response_text.split()
            for i, word in enumerate(words):
                chunk = word + (" " if i < len(words) - 1 else "")
                full_reply += chunk
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
                await asyncio.sleep(0.01)  # Small delay for streaming effect

            assistant_msg_db = Message(
                conversation_id=conv_id,
                role=MessageRole.ASSISTANT,
                content=full_reply,
            )
            db.add(assistant_msg_db)
            await db.commit()

            # Determine if the session should exit
            exit_session = any(word in full_reply.lower() for word in ['goodbye', 'bye', 'exit', 'quit'])
            yield f"data: {json.dumps({'exit_session': exit_session, 'done': True})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")