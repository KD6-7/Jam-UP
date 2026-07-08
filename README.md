# Jam Up

B2C e-commerce store for a jam brand.

This is currently a **walking skeleton**: an empty-but-fully-deployed pipeline
proving browser → Vercel → FastAPI → Postgres → back works end to end. No
real storefront features (cart, checkout, payments, auth) exist yet.

## Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind, deployed to Vercel
- **Backend**: FastAPI (Python), deployed to Render
- **Database**: PostgreSQL on Neon

## Repo layout

```
frontend/   Next.js app
backend/    FastAPI app
```

Each folder has its own `.env.example` — copy it to `.env` (or `.env.local`
for the frontend) and fill in real values locally. Never commit real secrets.

## Local development

See `backend/README.md` and `frontend/README.md` for setup instructions.
