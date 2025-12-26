from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    """Request model for RAG queries."""

    prompt: str = Field(..., description="User's question or prompt")
    user_context: str | None = Field(
        None,
        description="Personal information or context about the user",
    )
    top_k: int = Field(
        default=5, ge=1, le=20, description="Number of documents to retrieve"
    )


class IngestRequest(BaseModel):
    """Request model for document ingestion."""

    directory_path: str | None = Field(
        None,
        description="Custom path to documents directory",
    )
    file_extensions: list[str] = Field(
        default=[".txt", ".md"],
        description="File extensions to process",
    )
