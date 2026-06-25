#!/usr/bin/env bash
# Start both the backend (FastAPI) and frontend (Vite) for local development.
# Stops both on Ctrl-C.
set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "→ Starting backend on :8123"
( cd "$ROOT/backend" && VIRTUAL_ENV=.venv PYTHONPATH=. .venv/bin/python -m uvicorn app.main:app --port 8123 --reload ) &
BACK=$!

echo "→ Starting frontend on :5173"
( cd "$ROOT/frontend" && npm run dev ) &
FRONT=$!

trap "echo; echo 'Stopping…'; kill $BACK $FRONT 2>/dev/null" INT TERM
wait
