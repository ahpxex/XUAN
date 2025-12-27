from llama_index.core import Settings as LlamaSettings
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai_like import OpenAILike

from app.config import Settings


class LLMService:
    """Service for initializing and managing LLM and embedding models."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self._llm: OpenAILike | None = None
        self._embed_model: OpenAIEmbedding | None = None

    def get_llm(self) -> OpenAILike:
        """Get or create the LLM instance."""
        if self._llm is None:
            self._llm = OpenAILike(
                model=self.settings.llm_model_name,
                api_base=self.settings.llm_api_base,
                api_key=self.settings.llm_api_key,
                context_window=self.settings.llm_context_window,
                max_tokens=self.settings.llm_max_tokens,
                temperature=self.settings.llm_temperature,
                is_chat_model=True,
                is_function_calling_model=False,
            )
        return self._llm

    def get_embed_model(self) -> OpenAIEmbedding:
        """Get or create the embedding model instance (can use separate provider)."""
        if self._embed_model is None:
            self._embed_model = OpenAIEmbedding(
                model_name=self.settings.embedding_model_name,
                api_base=self.settings.embedding_api_base or self.settings.llm_api_base,
                api_key=self.settings.embedding_api_key or self.settings.llm_api_key,
            )
        return self._embed_model

    def configure_global_settings(self) -> None:
        """Configure LlamaIndex global settings."""
        LlamaSettings.llm = self.get_llm()
        LlamaSettings.embed_model = self.get_embed_model()
        LlamaSettings.chunk_size = self.settings.chunk_size
        LlamaSettings.chunk_overlap = self.settings.chunk_overlap
