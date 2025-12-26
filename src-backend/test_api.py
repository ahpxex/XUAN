"""Test script for the RAG API endpoints."""

import httpx

BASE_URL = "http://localhost:8000"


def test_health():
    """Test the health check endpoint."""
    print("Testing health endpoint...")
    response = httpx.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")


def test_query_sync():
    """Test the synchronous query endpoint."""
    print("Testing /query/ endpoint...")
    response = httpx.post(
        f"{BASE_URL}/query/",
        json={
            "prompt": "What is this document about?",
            "user_context": "I am a developer testing the API",
            "top_k": 3,
        },
        timeout=60.0,
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")


def test_query_stream():
    """Test the streaming query endpoint via SSE."""
    print("Testing /query/stream endpoint...")
    with httpx.stream(
        "POST",
        f"{BASE_URL}/query/stream",
        json={
            "prompt": "What is this document about?",
            "user_context": "I am a developer testing the API",
            "top_k": 3,
        },
        timeout=60.0,
    ) as response:
        print(f"Status: {response.status_code}")
        print("Streaming response: ", end="", flush=True)
        for line in response.iter_lines():
            if line.startswith("data:"):
                data = line[5:].strip()
                if data == "[DONE]":
                    print("\n[Stream complete]")
                else:
                    print(data, end="", flush=True)
    print()


def test_ingest():
    """Test the document ingestion endpoint."""
    print("Testing /ingest/ endpoint...")
    response = httpx.post(
        f"{BASE_URL}/ingest/",
        json={
            "file_extensions": [".txt", ".md"],
        },
        timeout=120.0,
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")


if __name__ == "__main__":
    print("=" * 50)
    print("RAG API Test Script")
    print("=" * 50 + "\n")

    # Test health first
    test_health()

    # Ingest documents before querying
    test_ingest()

    # Test sync query
    test_query_sync()

    # Test streaming query
    test_query_stream()
