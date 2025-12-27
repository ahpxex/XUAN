from datetime import datetime

from pydantic import BaseModel


class QueryResponse(BaseModel):
    """Response model for non-streaming queries."""

    answer: str
    sources: list[str] = []


class IngestResponse(BaseModel):
    """Response model for document ingestion."""

    status: str
    documents_processed: int
    collection_name: str
    timestamp: datetime


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    qdrant_connected: bool
    llm_configured: bool


class AstrolabeResponse(BaseModel):
    """Response model for Ziwei astrolabe generation."""

    astrolabe: dict
    report: str | None = None
