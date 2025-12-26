from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Qdrant
    qdrant_url: str
    qdrant_api_key: str
    qdrant_collection_name: str = "Xuan_documents"

    # LLM
    llm_api_base: str
    llm_api_key: str
    llm_model_name: str
    llm_context_window: int = 8192
    llm_max_tokens: int = 2048
    llm_temperature: float = 0.7

    # Embedding (uses same API base and key as LLM)
    embedding_model_name: str = "text-embedding-3-small"

    # Ingestion
    documents_path: str = "./data/documents"
    chunk_size: int = 512
    chunk_overlap: int = 50


@lru_cache
def get_settings() -> Settings:
    return Settings()
