import json

from fastapi import APIRouter, Depends
from llama_index.core.llms import ChatMessage

from app.core.dependencies import get_llm_service
from app.models.requests import AstrolabeSubmitRequest
from app.models.responses import AstrolabeResponse
from app.services.llm_service import LLMService

router = APIRouter(prefix="/ziwei", tags=["Ziwei"])

SYSTEM_PROMPT = """You are an expert in Zi Wei Dou Shu (Purple Star Astrology), a traditional Chinese astrological system.
Based on the provided astrolabe data, provide a brief, insightful interpretation focusing on:
1. The person's core personality traits based on their Life Palace (命宮)
2. Key strengths and potential challenges
3. General life direction and opportunities

Keep your response concise (2-3 paragraphs), written in Chinese, and focus on practical insights.
Do not list technical astrology terms extensively - explain in accessible language."""


@router.post("/astrolabe", response_model=AstrolabeResponse)
async def submit_astrolabe(
    request: AstrolabeSubmitRequest,
    llm_service: LLMService = Depends(get_llm_service),
):
    """Submit astrolabe and generate AI interpretation."""
    # Format astrolabe data for LLM
    birth_info = request.birth_info
    user_context = f"""
User: {birth_info.name or 'Unknown'}
Gender: {'Male' if birth_info.gender == 'male' else 'Female'}
Birth: {birth_info.birth_year}-{birth_info.birth_month}-{birth_info.birth_day}
Birth Time: {birth_info.birth_shichen}

Astrolabe Data:
{json.dumps(request.astrolabe, ensure_ascii=False, indent=2)[:4000]}
"""

    # Generate interpretation using LLM
    try:
        llm = llm_service.get_llm()
        messages = [
            ChatMessage(role="system", content=SYSTEM_PROMPT),
            ChatMessage(role="user", content=user_context),
        ]
        response = await llm.achat(messages)
        report = response.message.content
    except Exception as e:
        report = f"Unable to generate report: {str(e)}"

    return AstrolabeResponse(astrolabe=request.astrolabe, report=report)
