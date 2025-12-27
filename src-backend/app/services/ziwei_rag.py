"""
Ziwei RAG (Retrieval-Augmented Generation) service.
Uses keyword-based search to retrieve relevant ancient texts from the knowledge base.
"""

import json
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

# Path to the knowledge base
ZIWEI_INDEX_PATH = Path(__file__).parent.parent / "data" / "ziwei_index.json"


class ZiweiRAGService:
    """
    RAG service for Ziwei Dou Shu ancient texts.
    Uses keyword-based search to find relevant nodes from the knowledge base.
    """

    def __init__(self):
        self._index_data: dict[str, Any] | None = None
        self._all_nodes: list[dict[str, Any]] = []

    def _load_index(self) -> None:
        """Load the knowledge base index from JSON file."""
        if self._index_data is not None:
            return

        try:
            with open(ZIWEI_INDEX_PATH, encoding="utf-8") as f:
                self._index_data = json.load(f)

            # Flatten all nodes for easier searching
            self._flatten_nodes(self._index_data.get("structure", []))
            logger.info(
                f"Loaded Ziwei knowledge base with {len(self._all_nodes)} nodes"
            )
        except FileNotFoundError:
            logger.warning(f"Ziwei index file not found: {ZIWEI_INDEX_PATH}")
            self._index_data = {"structure": []}
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Ziwei index: {e}")
            self._index_data = {"structure": []}

    def _flatten_nodes(self, nodes: list[dict[str, Any]]) -> None:
        """Recursively flatten all nodes into a flat list."""
        for node in nodes:
            if node.get("text"):
                self._all_nodes.append({
                    "title": node.get("title", ""),
                    "node_id": node.get("node_id", ""),
                    "text": node.get("text", ""),
                    "summary": node.get("summary", ""),
                })
            if node.get("nodes"):
                self._flatten_nodes(node["nodes"])

    def search_context(self, query: str, max_results: int = 3) -> str:
        """
        Search the knowledge base for relevant ancient texts using keyword matching.

        Args:
            query: The search query (e.g., "命宫 紫微星")
            max_results: Maximum number of text excerpts to return

        Returns:
            Formatted string with relevant ancient text excerpts
        """
        self._load_index()

        if not self._all_nodes:
            logger.warning("No nodes loaded, returning empty context")
            return ""

        # Extract keywords from query
        keywords = [k.strip() for k in query.replace("紫微斗数", "").split() if k.strip()]
        logger.info(f"Ziwei RAG searching for keywords: {keywords}")

        # Score each node by keyword matches
        scored_nodes = []
        for node in self._all_nodes:
            score = 0
            text_lower = (node["text"] + node["title"] + node.get("summary", "")).lower()
            for keyword in keywords:
                if keyword.lower() in text_lower:
                    score += text_lower.count(keyword.lower())
            if score > 0:
                scored_nodes.append((score, node))

        # Sort by score and take top results
        scored_nodes.sort(key=lambda x: x[0], reverse=True)
        top_nodes = scored_nodes[:max_results]

        logger.info(f"Ziwei RAG found {len(scored_nodes)} matching nodes, returning top {len(top_nodes)}")

        for i, (score, node) in enumerate(top_nodes):
            logger.info(f"Ziwei Node {i+1} [score: {score}, title: {node['title']}]:")
            logger.info(f"Content: {node['text'][:200]}...")

        if not top_nodes:
            logger.warning("No matching nodes found for query")
            return ""

        # Format results
        texts = [f"### {node['title']}\n{node['text']}" for _, node in top_nodes]
        result = "\n\n".join(texts)

        logger.info(f"Total Ziwei retrieved context length: {len(result)} characters")

        return result
