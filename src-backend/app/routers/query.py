import asyncio
from collections.abc import AsyncGenerator

from fastapi import APIRouter, Depends, Request
from sse_starlette.sse import EventSourceResponse

from app.core.dependencies import get_rag_service
from app.models.requests import QueryRequest
from app.models.responses import QueryResponse
from app.services.rag_service import RAGService

router = APIRouter(prefix="/query", tags=["Query"])


@router.post("/", response_model=QueryResponse)
async def query(
    request: QueryRequest,
    rag_service: RAGService = Depends(get_rag_service),
):
    """
    Execute a RAG query and return the complete response.
    """
    answer, sources = await rag_service.query(
        prompt=request.prompt,
        user_context=request.user_context,
        top_k=request.top_k,
    )
    return QueryResponse(answer=answer, sources=sources)


@router.post("/stream")
async def stream_query(
    request: Request,
    query_request: QueryRequest,
    rag_service: RAGService = Depends(get_rag_service),
):
    """
    Execute a RAG query with streaming response via SSE.
    """

    async def event_generator() -> AsyncGenerator[dict, None]:
        try:
            async for token in rag_service.stream_query(
                prompt=query_request.prompt,
                user_context=query_request.user_context,
                top_k=query_request.top_k,
            ):
                if await request.is_disconnected():
                    break

                yield {
                    "event": "token",
                    "data": token,
                }

            yield {
                "event": "done",
                "data": "[DONE]",
            }
        except asyncio.CancelledError:
            raise
        except Exception as e:
            yield {
                "event": "error",
                "data": str(e),
            }

    return EventSourceResponse(
        event_generator(),
        send_timeout=30,
        headers={"Cache-Control": "no-cache"},
    )
