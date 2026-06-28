# Pawar Online — Backend API

REST API for **Pawar Online Retail LLP**. Serves products and CMS content to the
storefront, and powers the admin panel (auth, product management, image uploads).

Built with **Express + Mongoose (MongoDB)**, ESM, JWT auth.

## Setup

Requires **Node 18+** and a running **MongoDB**.

```bash
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, CDN_BASE_URL, etc.
npm install
npm run seed           # create seed admin + sample products + CMS blocks
npm run dev            # http://localhost:4055
```

> ⚠️ Set a strong `JWT_SECRET` and change the seed admin password before production.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start API with `--watch` (default port 4055) |
| `npm start` | Start API (production) |
| `npm run seed` | Seed admin, sample products, and CMS blocks (idempotent) |

## Configuration

| Env var | Description |
|---|---|
| `PORT` | API port (default 4055) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing admin JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `CORS_ORIGINS` | Comma-separated allowed origins (storefront + admin) |
| `UPLOAD_DIR` | Disk path where uploaded images are written |
| `CDN_BASE_URL` | Public base URL that serves uploaded images |
| `SEED_ADMIN_*` | Seed admin name / email / password |

## API overview

**Public**
- `GET /api/products` — list published products (filter: `category`, `q`, `featured`, paging)
- `GET /api/products/:slug` — product detail
- `GET /api/categories` — distinct published categories
- `GET /api/content` / `GET /api/content/:key` — CMS blocks

**Auth**
- `POST /api/auth/login` → `{ token, admin }`
- `GET /api/auth/me`

**Admin** (require `Authorization: Bearer <token>`)
- `GET|POST|PUT|DELETE /api/admin/products[...]`
- `GET|PUT|DELETE /api/admin/content[...]`
- `POST /api/admin/uploads` — multipart image upload (field `files`)

## Deploy (VPS)

Run with a process manager, e.g. `pm2 start src/server.js --name pawar-api`. Point
your CDN / Nginx at `UPLOAD_DIR` and set `CDN_BASE_URL` accordingly. Set real
`CORS_ORIGINS` for your storefront and admin domains.

## Architecture

- `src/app.js` — Express app; `src/server.js` — Mongo connect + listen
- `src/routes/index.js` — single route table (public vs `/admin` guarded by JWT)
- `src/models/` — `Admin`, `Product` (auto-slug), `Content` (generic CMS blocks)
- `src/middleware/` — auth, error handling, Multer upload
