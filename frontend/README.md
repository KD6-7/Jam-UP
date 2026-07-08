# Frontend (Next.js)

## Local setup

Requires Node.js 18.18+ (this scaffold was authored without a local Node
install available — first `npm install` will fetch everything fresh).

```bash
cd frontend
cp .env.example .env.local   # then fill in NEXT_PUBLIC_API_URL
npm install
npm run dev
```

Open http://localhost:3000 — it fetches `GET /api/products` from the backend
and lists each product's name and price.

## Deployment (Vercel)

Set the `NEXT_PUBLIC_API_URL` environment variable in the Vercel dashboard to
the deployed Railway backend URL. It's inlined into the client bundle at
build time (that's expected — it's a public URL, not a secret).
