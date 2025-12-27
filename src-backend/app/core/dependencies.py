from functools import lru_cache

from app.config import Settings, get_settings
from app.services.ingestion_service import IngestionService
from app.services.llm_service import LLMService
from app.services.rag_service import RAGService
from app.services.ziwei_rag import ZiweiRAGService


@lru_cache
def get_llm_service() -> LLMService:
    settings = get_settings()
    service = LLMService(settings)
    service.configure_global_settings()
    return service


@lru_cache
def get_ingestion_service() -> IngestionService:
    settings = get_settings()
    return IngestionService(settings)


@lru_cache
def get_rag_service() -> RAGService:
    settings = get_settings()
    return RAGService(
        settings=settings,
        ingestion_service=get_ingestion_service(),
        llm_service=get_llm_service(),
    )


@lru_cache
def get_ziwei_rag_service() -> ZiweiRAGService:
    return ZiweiRAGService()

