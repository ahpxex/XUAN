from collections.abc import AsyncGenerator

from llama_index.core import VectorStoreIndex
from llama_index.core.llms import ChatMessage

from app.config import Settings
from app.services.ingestion_service import IngestionService
from app.services.llm_service import LLMService


class RAGService:
    """Service for RAG query pipeline."""

    def __init__(
        self,
        settings: Settings,
        ingestion_service: IngestionService,
        llm_service: LLMService,
    ):
        self.settings = settings
        self.ingestion_service = ingestion_service
        self.llm_service = llm_service
        self._index: VectorStoreIndex | None = None

    def get_index(self) -> VectorStoreIndex:
        """Get or create the vector store index."""
        if self._index is None:
            vector_store = self.ingestion_service.get_vector_store()
            self._index = VectorStoreIndex.from_vector_store(
                vector_store=vector_store,
                embed_model=self.llm_service.get_embed_model(),
            )
        return self._index

    def build_prompt_with_context(
        self,
        prompt: str,
        user_context: str | None,
        retrieved_context: str,
    ) -> str:
        """Build the final prompt with user and retrieved context."""
        parts = []

        if user_context:
            parts.append(f"User Information:\n{user_context}\n")

        parts.append(f"Relevant Context:\n{retrieved_context}\n")
        parts.append(f"Question: {prompt}")

        return "\n".join(parts)

    async def query(
        self,
        prompt: str,
        user_context: str | None = None,
        top_k: int = 5,
    ) -> tuple[str, list[str]]:
        """Execute a RAG query and return response with sources."""
        index = self.get_index()

        retriever = index.as_retriever(similarity_top_k=top_k)
        nodes = retriever.retrieve(prompt)

        retrieved_context = "\n\n".join([node.get_content() for node in nodes])
        sources = [node.metadata.get("file_name", "unknown") for node in nodes]

        final_prompt = self.build_prompt_with_context(
            prompt, user_context, retrieved_context
        )

        llm = self.llm_service.get_llm()
        messages = [
            ChatMessage(
                role="system",
                content="You are a helpful assistant. Answer based on the provided context.",
            ),
            ChatMessage(role="user", content=final_prompt),
        ]
        response = llm.chat(messages)

        return str(response.message.content), list(set(sources))

    async def stream_query(
        self,
        prompt: str,
        user_context: str | None = None,
        top_k: int = 5,
    ) -> AsyncGenerator[str, None]:
        """Execute a streaming RAG query."""
        index = self.get_index()

        retriever = index.as_retriever(similarity_top_k=top_k)
        nodes = retriever.retrieve(prompt)

        retrieved_context = "\n\n".join([node.get_content() for node in nodes])

        final_prompt = self.build_prompt_with_context(
            prompt, user_context, retrieved_context
        )

        llm = self.llm_service.get_llm()
        messages = [
            ChatMessage(
                role="system",
                content="You are a helpful assistant. Answer based on the provided context.",
            ),
            ChatMessage(role="user", content=final_prompt),
        ]

        response_stream = llm.stream_chat(messages)
        for chunk in response_stream:
            if chunk.delta:
                yield chunk.delta
