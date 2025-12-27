from qdrant_client import QdrantClient
from llama_index.core import SimpleDirectoryReader, StorageContext, VectorStoreIndex
from llama_index.readers.file import MarkdownReader
from llama_index.vector_stores.qdrant import QdrantVectorStore

from app.config import Settings


class IngestionService:
    """Service for document ingestion and indexing."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self._qdrant_client: QdrantClient | None = None
        self._vector_store: QdrantVectorStore | None = None

    def get_qdrant_client(self) -> QdrantClient:
        """Get or create Qdrant client."""
        if self._qdrant_client is None:
            if self.settings.qdrant_url == "local":
                # Use local persistence
                self._qdrant_client = QdrantClient(path="./qdrant_data")
            else:
                self._qdrant_client = QdrantClient(
                    url=self.settings.qdrant_url,
                    api_key=self.settings.qdrant_api_key,
                )
        return self._qdrant_client

    def get_vector_store(self) -> QdrantVectorStore:
        """Get or create vector store."""
        if self._vector_store is None:
            self._vector_store = QdrantVectorStore(
                client=self.get_qdrant_client(),
                collection_name=self.settings.qdrant_collection_name,
            )
        return self._vector_store

    def load_documents(
        self,
        directory_path: str | None = None,
        extensions: list[str] | None = None,
    ):
        """Load documents from directory."""
        path = directory_path or self.settings.documents_path
        exts = extensions or [".txt", ".md"]

        file_extractor = {".md": MarkdownReader()}

        reader = SimpleDirectoryReader(
            input_dir=path,
            required_exts=exts,
            recursive=True,
            file_extractor=file_extractor,
        )
        return reader.load_data()

    def ingest_documents(
        self,
        directory_path: str | None = None,
        extensions: list[str] | None = None,
    ) -> int:
        """Load, chunk, embed, and store documents."""
        documents = self.load_documents(directory_path, extensions)

        storage_context = StorageContext.from_defaults(
            vector_store=self.get_vector_store()
        )

        VectorStoreIndex.from_documents(
            documents,
            storage_context=storage_context,
            show_progress=True,
        )

        return len(documents)

    def check_connection(self) -> bool:
        """Check if Qdrant is reachable."""
        try:
            self.get_qdrant_client().get_collections()
            return True
        except Exception:
            return False
