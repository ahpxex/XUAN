from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.core.dependencies import get_ingestion_service, get_llm_service
from app.models.responses import HealthResponse
from app.routers import divination, ingest, query, ziwei


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown."""
    llm_service = get_llm_service()
    llm_service.configure_global_settings()

    yield


app = FastAPI(
    title="Xuan RAG Backend",
    description="RAG API with LlamaIndex and Qdrant",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(query.router)
app.include_router(ingest.router)
app.include_router(ziwei.router)
app.include_router(divination.router)


@app.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    ingestion_service = get_ingestion_service()
    settings = get_settings()

    return HealthResponse(
        status="healthy",
        qdrant_connected=ingestion_service.check_connection(),
        llm_configured=bool(settings.llm_api_base and settings.llm_api_key),
    )


@app.get("/health", response_model=HealthResponse)
async def detailed_health():
    """Detailed health check."""
    return await health_check()
