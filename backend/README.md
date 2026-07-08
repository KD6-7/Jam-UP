# Backend (FastAPI)

## Local setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in DATABASE_URL
```

## Create tables + seed sample products

```bash
python -m app.seed
```

## Run locally

```bash
uvicorn app.main:app --reload
```

- `GET /health` → `{"status": "ok"}`
- `GET /api/products` → JSON array of products

## Deployment (Railway)

Railway runs `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT` (see `Procfile`).
Set `DATABASE_URL` and `FRONTEND_ORIGIN` as environment variables in the
Railway dashboard — never commit them.
