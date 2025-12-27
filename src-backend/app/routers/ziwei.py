"""
Ziwei Dou Shu (Purple Star Astrology) router.
Provides endpoints for astrolabe analysis with detailed palace reports.
"""

import asyncio
import contextlib
import json
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from llama_index.core.llms import ChatMessage

from app.core.dependencies import get_llm_service, get_ziwei_rag_service
from app.models.requests import AstrolabeSubmitRequest
from app.models.responses import (
    AstrolabeResponse,
    PalaceAnalysisResponse,
    PalaceReport,
)
from app.services.llm_service import LLMService
from app.services.ziwei_rag import ZiweiRAGService
from app.services.ziwei_rules import (
    format_mutagen_info,
    format_palace_stars,
    format_three_parties_context,
    get_three_parties_four_areas,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ziwei", tags=["Ziwei"])

# Simple prompt for quick overview (legacy endpoint)
SIMPLE_SYSTEM_PROMPT = """You are an expert in Zi Wei Dou Shu (Purple Star Astrology), a traditional Chinese astrological system.
Based on the provided astrolabe data, provide a brief, insightful interpretation focusing on:
1. The person's core personality traits based on their Life Palace
2. Key strengths and potential challenges
3. General life direction and opportunities

Keep your response concise (2-3 paragraphs), written in Chinese, and focus on practical insights.
Do not list technical astrology terms extensively - explain in accessible language."""


def build_palace_analysis_prompt(
    palace_name: str,
    major_stars: str,
    minor_stars: str,
    adjective_stars: str,
    decadal_range: str,
    three_parties_context: str,
    mutagen_info: str,
    rag_context: str,
    context: str,
) -> str:
    """Build the detailed prompt for palace analysis."""
    return f"""你是紫薇斗数大师. 对**{palace_name}**进行深度分析，能用朴实的语言为求问人提供翔实易懂的分析.

## 1. 本宫
- 主星: {major_stars}
- 辅星: {minor_stars}
- 杂曜: {adjective_stars}
- 大限范围: {decadal_range}

## 2. 三方四正 & 宫干四化
{three_parties_context}
{mutagen_info}

## 3. 古籍智慧 (RAG Context)
{rag_context or 'No ancient texts found.'}

## 4. 全局背景
{context or 'No context provided'}

## Constraints & Principles
1.  **深度优先**: 严禁简略。必须对每一颗主星、辅星及其组合进行深度剖析。不限字数，以分析透彻为准。
2.  **星曜互涉**: 必须分析本宫星曜与对宫星曜的"冲、照、拱、夹"关系，不能孤立论命。
3.  **四化驱动**: 必须详细解释"宫干四化"及"生年四化"如何引动吉凶，这是动态分析的关键。
4.  **古今结合**: 将RAG提供的古籍在分析中使用，引用古籍时，必须完整引用，并结合语境进行解释，拒绝生搬硬套。
5.  **语气基调**: 保持神秘感与权威感。多用"此局"、"命主"、"迹象显示"等术语，但解释必须通俗易懂。
6.  **格式规范**: 使用Markdown输出。

IMPORTANT: Output the report in Chinese (Simplified).

## Analysis Workflow
请按以下逻辑步骤进行深呼吸式思考，保持语言通俗易懂，生成报告：
1.  **引经典**: 从 RAG 数据中提取相关断语，完整地引用，并融入分析推理中。
2.  **定格局**: 观察本宫主星的庙旺利陷，判断该宫位的"地基"是否稳固。
3.  **看交互**: 结合三方四正。对宫是外界的照映，三合宫是资源的来源。分析它们是"辅佐"本宫还是"冲击"本宫。
4.  **寻变数**: 寻找四化（禄、权、科、忌）。哪里有化忌的纠缠？哪里有化禄的机缘？这是吉凶的关键。
5.  **下断语**: 综合所有信息，给出最终的性格/运势/建议判断。
"""


async def analyze_single_palace(
    palace: dict[str, Any],
    palace_index: int,
    all_palaces: list[dict[str, Any]],
    context: str,
    llm_service: LLMService,
    ziwei_rag: ZiweiRAGService,
) -> PalaceReport:
    """Analyze a single palace and return a report."""
    palace_name = palace.get("name", f"Palace {palace_index}")

    # Format stars
    major_stars, minor_stars, adjective_stars = format_palace_stars(palace)

    # Get decadal range
    decadal = palace.get("decadal", {})
    decadal_range = decadal.get("range", [])
    decadal_str = f"{decadal_range[0]}-{decadal_range[1]}" if len(decadal_range) >= 2 else "N/A"

    # Calculate Three Parties and Four Areas
    three_parties = get_three_parties_four_areas(palace_index, all_palaces)
    three_parties_context = format_three_parties_context(three_parties)

    # Get mutagen info
    mutagen_info = format_mutagen_info(palace)

    # Search for relevant ancient texts
    query = f"紫微斗数 {palace_name} {major_stars} {minor_stars}"
    try:
        rag_context = ziwei_rag.search_context(query, max_results=3)
    except Exception as e:
        logger.error(f"RAG search failed for {palace_name}: {e}")
        rag_context = ""

    # Build the prompt
    prompt = build_palace_analysis_prompt(
        palace_name=palace_name,
        major_stars=major_stars,
        minor_stars=minor_stars,
        adjective_stars=adjective_stars,
        decadal_range=decadal_str,
        three_parties_context=three_parties_context,
        mutagen_info=mutagen_info,
        rag_context=rag_context,
        context=context,
    )

    # Generate analysis using LLM
    try:
        llm = llm_service.get_llm()
        messages = [ChatMessage(role="user", content=prompt)]
        logger.info(f"[Palace {palace_index}] Calling LLM for {palace_name}...")
        response = await llm.achat(messages)
        analysis = response.message.content or "Analysis generation failed."
        logger.info(f"[Palace {palace_index}] LLM response received, length: {len(analysis)}")
    except asyncio.CancelledError:
        logger.info(f"[Palace {palace_index}] Cancelled for {palace_name}")
        raise
    except Exception as e:
        logger.error(f"[Palace {palace_index}] LLM analysis failed for {palace_name}: {e}")
        analysis = f"Unable to generate analysis for {palace_name}: {str(e)}"

    return PalaceReport(
        name=palace_name,
        index=palace_index,
        analysis=analysis,
    )


async def cancel_on_disconnect(
    request: Request,
    tasks: list[asyncio.Task[PalaceReport]],
) -> None:
    while True:
        if await request.is_disconnected():
            logger.info("[analyze-palaces] Client disconnected, cancelling tasks")
            for task in tasks:
                task.cancel()
            return
        await asyncio.sleep(0.25)


@router.post("/astrolabe", response_model=AstrolabeResponse)
async def submit_astrolabe(
    request: AstrolabeSubmitRequest,
    llm_service: LLMService = Depends(get_llm_service),
):
    """Submit astrolabe and generate AI interpretation (simple overview)."""
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
            ChatMessage(role="system", content=SIMPLE_SYSTEM_PROMPT),
            ChatMessage(role="user", content=user_context),
        ]
        response = await llm.achat(messages)
        report = response.message.content
    except Exception as e:
        report = f"Unable to generate report: {str(e)}"

    return AstrolabeResponse(astrolabe=request.astrolabe, report=report)


@router.post("/analyze-palaces", response_model=PalaceAnalysisResponse)
async def analyze_palaces(
    payload: AstrolabeSubmitRequest,
    request: Request,
    llm_service: LLMService = Depends(get_llm_service),
    ziwei_rag: ZiweiRAGService = Depends(get_ziwei_rag_service),
):
    """
    Analyze all 12 palaces in parallel and return detailed reports.

    This endpoint generates comprehensive analysis for each palace including:
    - Star compositions and their brightness/mutagen status
    - Three Parties and Four Areas (sanfang sizheng) relationships
    - Palace Stem Mutagens (gonggan sihua)
    - Ancient texts context via RAG
    """
    logger.info("[analyze-palaces] Request received")
    birth_info = payload.birth_info
    astrolabe = payload.astrolabe

    # Extract palaces from astrolabe
    palaces = astrolabe.get("palaces", [])
    logger.info(f"[analyze-palaces] Found {len(palaces)} palaces in astrolabe")
    if not palaces:
        return PalaceAnalysisResponse(palaces=[])

    # Build context string
    context = f"""User: {birth_info.name or 'Unknown'}
Gender: {'Male' if birth_info.gender == 'male' else 'Female'}
Birth: {birth_info.birth_year}-{birth_info.birth_month}-{birth_info.birth_day}
Birth Time: {birth_info.birth_shichen}"""

    # Analyze all palaces in parallel
    tasks = [
        asyncio.create_task(
            analyze_single_palace(
                palace=palace,
                palace_index=idx,
                all_palaces=palaces,
                context=context,
                llm_service=llm_service,
                ziwei_rag=ziwei_rag,
            )
        )
        for idx, palace in enumerate(palaces)
    ]
    disconnect_task = asyncio.create_task(cancel_on_disconnect(request, tasks))

    try:
        palace_reports = await asyncio.gather(*tasks)
    except asyncio.CancelledError:
        logger.info("[analyze-palaces] Cancelled due to client disconnect")
        raise HTTPException(status_code=499, detail="Client closed request")
    finally:
        disconnect_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await disconnect_task

    logger.info(f"[analyze-palaces] Completed, returning {len(palace_reports)} reports")
    return PalaceAnalysisResponse(palaces=list(palace_reports))
