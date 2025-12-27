from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls,
        init_settings,
        env_settings,
        dotenv_settings,
        file_secret_settings,
    ):
        return (dotenv_settings, env_settings, init_settings, file_secret_settings)

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

    # Embedding (can use separate API base and key)
    embedding_api_base: str | None = None
    embedding_api_key: str | None = None
    embedding_model_name: str = "text-embedding-3-small"

    # Ingestion
    documents_path: str = "./data/documents"
    chunk_size: int = 512
    chunk_overlap: int = 50



@lru_cache
def get_settings() -> Settings:
    return Settings()
