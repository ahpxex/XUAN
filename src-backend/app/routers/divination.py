from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from llama_index.core.llms import ChatMessage
from app.services.najia_adapter import NajiaAdapter
from app.services.prompt_builder import PromptBuilder
from app.core.dependencies import get_llm_service
from app.services.llm_service import LLMService

router = APIRouter(prefix="/divination", tags=["divination"])

class CastRequest(BaseModel):
    timestamp: Optional[str] = None
    question: Optional[str] = ""

@router.post("/cast")
async def cast_hexagram(
    request: CastRequest,
    llm_service: LLMService = Depends(get_llm_service)
):
    try:
        # 1. Cast
        result = NajiaAdapter.cast_and_compile(request.timestamp)
        
        # 2. Prompt
        question = request.question.strip() if request.question else "无具体提问 (General Forecast)"
        system_prompt = PromptBuilder.build_system_prompt()
        user_prompt = PromptBuilder.build_user_prompt(question, result)
        
        # 3. AI
        try:
            llm = llm_service.get_llm()
            messages = [
                ChatMessage(role="system", content=system_prompt),
                ChatMessage(role="user", content=user_prompt)
            ]
            resp = await llm.achat(messages)
            content = resp.message.content
            is_mock = False
        except Exception as e:
            # Fallback if LLM fails or keys missing
            content = f"AI Analysis Error: {str(e)}\n\nPrompt Preview:\n{user_prompt}"
            is_mock = True
            
        result['ai_analysis'] = {
            "question": question,
            "response": content,
            "is_mock": is_mock
        }
        
        return result

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
