"""Meiwen divination router."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from llama_index.core.llms import ChatMessage

from app.core.dependencies import get_llm_service
from app.models.requests import MeiwenCastRequest
from app.models.responses import MeiwenCastResponse
from app.services.llm_service import LLMService
from app.services.meiwen.najia_adapter import NajiaAdapter
from app.services.meiwen.prompt_builder import PromptBuilder

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/meiwen", tags=["Meiwen"])


@router.post("/cast", response_model=MeiwenCastResponse)
async def cast_hexagram(
    payload: MeiwenCastRequest,
    llm_service: LLMService = Depends(get_llm_service),
):
    try:
        result = NajiaAdapter.cast_and_compile(payload.timestamp)

        question = payload.question.strip() if payload.question else "无具体提问 (General Forecast)"

        system_prompt = PromptBuilder.build_system_prompt()
        user_prompt = PromptBuilder.build_user_prompt(question, result)

        ai_response = None
        try:
            llm = llm_service.get_llm()
            messages = [
                ChatMessage(role="system", content=system_prompt),
                ChatMessage(role="user", content=user_prompt),
            ]
            response = await llm.achat(messages)
            ai_response = response.message.content if response.message else None
        except Exception:
            logger.exception("[Meiwen] AI analysis failed")

        if ai_response:
            result["ai_analysis"] = {
                "question": question,
                "response": ai_response,
                "is_mock": False,
            }
        else:
            mock_resp = f"""
> **[系统提示]** 
> AI 服务暂不可用或未配置。

---
**发送给 AI 的 Prompt 预览：**
{user_prompt}
"""
            result["ai_analysis"] = {
                "question": question,
                "response": mock_resp,
                "is_mock": True,
            }

        return result
    except Exception as e:
        logger.exception("[Meiwen] Cast failed")
        raise HTTPException(status_code=500, detail=str(e)) from e
