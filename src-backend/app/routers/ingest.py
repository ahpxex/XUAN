from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from app.config import get_settings
from app.core.dependencies import get_ingestion_service
from app.models.requests import IngestRequest
from app.models.responses import IngestResponse
from app.services.ingestion_service import IngestionService

router = APIRouter(prefix="/ingest", tags=["Ingestion"])


@router.post("/", response_model=IngestResponse)
async def ingest_documents(
    request: IngestRequest,
    ingestion_service: IngestionService = Depends(get_ingestion_service),
):
    """
    Ingest documents from the specified directory.
    Loads, chunks, embeds, and stores documents in Qdrant.
    """
    try:
        count = ingestion_service.ingest_documents(
            directory_path=request.directory_path,
            extensions=request.file_extensions,
        )

        settings = get_settings()
        return IngestResponse(
            status="success",
            documents_processed=count,
            collection_name=settings.qdrant_collection_name,
            timestamp=datetime.now(timezone.utc),
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Directory not found: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {e}")


@router.post("/background")
async def ingest_documents_background(
    request: IngestRequest,
    background_tasks: BackgroundTasks,
    ingestion_service: IngestionService = Depends(get_ingestion_service),
):
    """
    Queue document ingestion as a background task.
    Returns immediately while processing continues.
    """

    def run_ingestion():
        ingestion_service.ingest_documents(
            directory_path=request.directory_path,
            extensions=request.file_extensions,
        )

    background_tasks.add_task(run_ingestion)

    return {"status": "queued", "message": "Ingestion started in background"}
