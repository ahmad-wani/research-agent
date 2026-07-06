# Autonomous Research Agent

A full-stack research assistant that plans sub-tasks, searches the web, fetches source pages, verifies coverage, and streams a cited report back to the browser.

## Architecture

```text
React UI
  |  POST /api/research/stream (SSE)
FastAPI
  |  streams LangGraph node updates
LangGraph
  |-> planner -> worker -> verifier --retry--> worker -> synthesizer
Tools
  |-> SerpApi Google Search API
  |-> Trafilatura page extraction
LLM
  |-> Groq primary, Gemini fallback/configurable
```

## Backend Setup

Python 3.13 is the recommended target. Python 3.12 also works with the pinned packages.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

Fill `backend/.env` with:

- `GROQ_API_KEY`
- `GEMINI_API_KEY`
- `SERPAPI_API_KEY`

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend expects the backend at `http://localhost:8000` unless `VITE_API_BASE_URL` is changed.

## Useful Endpoints

- `GET /health`
- `POST /api/research/stream`

Example stream request:

```bash
curl -N -X POST http://localhost:8000/api/research/stream \
  -H "Content-Type: application/json" \
  -d '{"query":"Compare current browser automation libraries for Python"}'
```

## Notes

SerpApi plan quotas can be consumed quickly because each research query may run several searches. Keep sample queries small during development.
