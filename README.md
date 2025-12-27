# XUAN

A Chinese metaphysics app that uses Zi Wei Dou Shu (The Purple Star Astrology) to provide personal insights.

## Tech Stack

- **Frontend**: TanStack Start, React 19, Tailwind CSS v4, Jotai
- **Backend**: FastAPI, LlamaIndex, Qdrant
- **Deployment**: Cloudflare Workers (frontend)

## Deployment

### 1. Clone the project

```bash
git clone <repository-url>
cd xuanxue
```

### 2. Install uv (Python package manager)

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 3. Setup Backend

```bash
cd src-backend

# Copy environment config
cp .env.example .env

# Edit .env with your credentials:
# - QDRANT_URL, QDRANT_API_KEY
# - LLM_API_BASE, LLM_API_KEY, LLM_MODEL_NAME

# Install dependencies and run
uv sync
uv run python main.py
```

Backend runs at `http://localhost:8000`

### 4. Setup Frontend

```bash
# From project root
bun install
bun run dev
```

Frontend runs at `http://localhost:3000`

### 5. Deploy Frontend (Cloudflare Workers)

```bash
bun run deploy
```

## Environment Variables

Backend requires these in `src-backend/.env`:

| Variable | Description |
|----------|-------------|
| `QDRANT_URL` | Qdrant Cloud cluster URL |
| `QDRANT_API_KEY` | Qdrant API key |
| `QDRANT_COLLECTION_NAME` | Collection name (default: `xuan_documents`) |
| `LLM_API_BASE` | OpenAI-compatible API endpoint |
| `LLM_API_KEY` | LLM API key |
| `LLM_MODEL_NAME` | Model name |
| `EMBEDDING_MODEL_NAME` | Embedding model (default: `text-embedding-3-small`) |
