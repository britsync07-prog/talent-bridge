# TalentBridge
<div align="center">

![License](https://img.shields.io/github/license/britsync07-prog/talent-bridge?style=flat-square&label=license&color=06b6d4) ![Language](https://img.shields.io/github/languages/top/britsync07-prog/talent-bridge?style=flat-square&color=0ea5e9) ![Stars](https://img.shields.io/github/stars/britsync07-prog/talent-bridge?style=flat-square&color=f59e0b) ![Last commit](https://img.shields.io/github/last-commit/britsync07-prog/talent-bridge?style=flat-square&color=22c55e) ![Repo size](https://img.shields.io/github/repo-size/britsync07-prog/talent-bridge?style=flat-square&color=94a3b8)

</div>

> A remote AI-workforce marketplace connecting employers with vetted engineers — jobs, contracts, timesheets, messaging, and payments in one platform.

TalentBridge is a two-sided job and talent platform for hiring remote AI engineers. Employers post jobs and contracts, engineers showcase profiles with certificates and endorsements, and the platform manages the full engagement lifecycle: interests, contracts, timesheets, tasks, invoices, and Stripe-backed payments. A TypeScript/Express backend built on Prisma exposes a REST API plus Socket.IO real-time messaging, while a Next.js App Router frontend ships to Cloudflare Pages with dedicated admin, employer, and engineer dashboards.

## Overview

The backend (`backend/`) is an Express 5 application hardened for cloud deployment: helmet, CORS allowlisting for multiple production origins, rate limiting, trust-proxy support for Render/Cloudflare, a global exception handler, and a health check registered before all middleware so uptime probes never get intercepted. Seventeen Prisma models cover users and role profiles (admin, employer, engineer), the hiring graph (Job, Interest, Contract, Timesheet, Task, Endorsement, Certificate, SavedCandidate), commerce (Invoice, Payment), communication (Message), and platform state (SystemConfig, Activity_log). File uploads (profile pictures, certification documents, intro videos) flow through Multer into S3-compatible object storage.

The frontend (`frontend/`) is a Next.js 16 + React 19 marketing site and application shell — landing pages (solutions, case studies, how-it-works, partners, resources) plus `/dashboard` areas per role — built for Cloudflare Pages via `@cloudflare/next-on-pages` with `nodejs_compat`. Socket.IO client powers live chat under `/dashboard/messages`.

## Features

- Role-based accounts: admin, employer, and engineer profiles with JWT authentication and auth middleware
- Job marketplace: job posting, browsing, saved candidates, and engineer interest expression
- Engagement lifecycle: contracts with hourly-fee or fixed terms, timesheets, task tracking, endorsements
- Billing: invoices, Stripe payment intents and checkout, webhook-driven payment state changes
- Real-time messaging between employers and engineers over Socket.IO
- Certificates and profile media uploads (images, PDFs, videos) to S3-compatible storage
- Admin console: user oversight, authorization requests, security alerts derived from logs, network growth stats wired to real data
- Meeting links generation utility for interviews
- Cross-platform integration hooks: LeadHunter API client variables for lead-driven outreach
- Public content site: about, solutions, case studies, partners, resources, privacy, terms, contact pages

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Node.js, Express 5, TypeScript (ts-node-dev) |
| ORM / Database | Prisma 5 over PostgreSQL |
| Real-time | Socket.IO (server + client) |
| Auth / Security | jsonwebtoken, bcryptjs, helmet, express-rate-limit, CORS allowlist, Morgan |
| Payments | Stripe SDK (raw-body webhooks) |
| Storage | @aws-sdk/client-s3 + lib-storage (S3/R2), Supabase JS client, Multer |
| HTTP utilities | Axios, dotenv/dotenvx |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, ESLint 9 |
| Edge deployment | Cloudflare Pages (@cloudflare/next-on-pages, Wrangler) |

## Architecture

`backend/src/index.ts` boots an HTTP server wrapping Express, applies `trust proxy`, builds a CORS allowlist from `FRONTEND_URL` plus known deployment domains (Pages previews, custom domain), mounts helmet/Morgan/rate limiting, and registers routes under versioned prefixes: `/api/auth`, `/api/engineers`, `/api/employers`, `/api/admin`, `/api/jobs`, `/api/payments`, `/api/tasks`, `/api/contracts` (plus message routes for Socket.IO pairing). The Stripe webhook route deliberately uses `express.raw()` before the JSON parser so signature verification sees the exact bytes. Startup verifies the database connection with `prisma.$connect()` before binding to `0.0.0.0:$PORT`, and a final error handler strips error details in production.

Data flows: hiring (Employer posts Job -> Engineer expresses Interest -> Contract -> Timesheets -> Tasks -> Invoice -> Payment via Stripe webhooks), social proof (Endorsements, Certificates), communication (Message rows mirrored through Socket.IO rooms), and administration (Activity_log feeding the admin stats tab: security alerts from logs, pending authorizations, network growth from real counts).

## Project Structure

```text
talent-bridge/
├── README.md
├── cred.txt                        # DO NOT COMMIT credentials file (flagged; contents ignored)
├── update_theme.js                 # frontend theming helper script
├── backend/
│   ├── package.json                # dev/build/seed scripts, Prisma generate hook
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma           # 17 models incl. Contract, Timesheet, Invoice
│   │   └── seed.ts                 # database seeding
│   ├── uploads/                    # local upload staging
│   └── src/
│       ├── index.ts                # server bootstrap, CORS, guards, health
│       ├── lib/prisma.ts           # Prisma client singleton
│       ├── middleware/auth.middleware.ts
│       ├── routes/                 # auth, engineer, employer, admin, job,
│       │                           #   payment, task, contract, message routes
│       ├── controllers/            # matching business logic per domain
│       ├── utils/                  # multer uploads, meeting links, r2 storage
│       └── dist/                   # compiled output (should be gitignored)
└── frontend/
    ├── package.json                # next, socket.io-client, wrangler pages tooling
    ├── wrangler.toml               # Cloudflare Pages config (nodejs_compat)
    └── src/
        ├── app/                    # marketing routes + login/signup
        │   └── dashboard/          # admin/, employer/, engineer/, messages/
        ├── components/             # shared UI components
        ├── context/                # client-side app context/providers
        └── lib/                    # api clients, helpers
```

## Getting Started

### Prerequisites

- Node.js 18+ (20+ recommended)
- PostgreSQL database
- pnpm or npm
- Stripe account keys for billing features
- S3-compatible bucket (AWS S3 or Cloudflare R2) for uploads

### Installation

```bash
# Backend
cd backend
pnpm install            # runs prisma generate via postinstall
cp .env.example .env    # create from variable names below if missing
npx prisma migrate dev
npm run seed
npm run dev             # ts-node-dev on PORT (default 5000)

# Frontend (new terminal)
cd ../frontend
pnpm install
npm run dev             # http://localhost:3000
```

### Environment Variables

Names referenced by backend/frontend code (placeholders only):

| Variable | Placeholder |
| --- | --- |
| NODE_ENV | development |
| PORT | 5000 |
| FRONTEND_URL | http://localhost:3000 |
| DATABASE_URL | postgresql://user:password@localhost:5432/talentbridge |
| JWT_SECRET | change-me-long-random-string |
| STRIPE_SECRET_KEY | sk_test_placeholder |
| STRIPE_WEBHOOK_SECRET | whsec_placeholder |
| LEADHUNTER_API_BASE_URL | https://leadhunter.example.com |
| LEADHUNTER_API_KEY | leadhunter-api-key-placeholder |

### Running

```bash
# Backend development
cd backend && npm run dev

# Backend production build/start
cd backend && npm run build && npm start

# Frontend local
cd frontend && npm run dev

# Frontend Cloudflare Pages build + preview
cd frontend && npm run preview      # pages:build then wrangler pages dev
```

No docker-compose ships in this repository; the backend targets managed platforms (Render-style) and the frontend deploys to Cloudflare Pages.

## Challenges Faced & Solutions

- **Stripe webhooks failed signature verification**: the global JSON body parser mutated the raw payload before verification. **Solution**: mounted `express.raw({ type: 'application/json' })` on `/api/payments/webhook` ahead of `express.json()`, preserving byte-exact bodies for Stripe's HMAC check.
- **Health checks were intercepted**: uptime probes behind proxies hit middleware or routers first and returned false negatives. **Solution**: registered `/api/health` as the very first route with an explicit "registered first to avoid interception" comment, returning a minimal liveness JSON.
- **Admin dashboard showed placeholder numbers**: stats did not reflect platform reality. **Solution**: rewired the admin stats page to compute security alerts from activity logs, network growth from real counts, and pending authorizations from live records (commit `fix: wire admin stats page to real data ...`).
- **Pricing model pivots broke UX**: hourly fees and pricing surfaces changed mid-development. **Solution**: removed hourly-fee inputs and stripped pricing UI in dedicated commits (`horly fee remove`, `pricing removed`), keeping contract creation consistent with the new fixed-scope model.
- **Next.js on Cloudflare Pages**: standard Next output does not run on Pages workers. **Solution**: adopted `@cloudflare/next-on-pages` with a `pages:build` script, enabled `nodejs_compat` in `wrangler.toml`, and validated locally with `wrangler pages dev`.
- **Multiple deploy origins broke CORS**: previews on Netlify/Pages/custom domains were rejected in production mode. **Solution**: explicit origin allowlist assembled from `FRONTEND_URL` plus known deployment hosts, with credential support and preflight caching (`maxAge: 86400`).
- **Merge drift after parallel feature work**: contract/payment features diverged. **Solution**: consolidated with a dedicated merge-fix commit (`aac8008 merge fix`) before continuing stabilization passes.
- **Large media uploads**: profile videos and portfolio files exceed typical JSON limits. **Solution**: raised parser limits (`100mb`) and routed binary uploads through Multer to S3-compatible storage instead of JSON bodies.

## Known Limitations & Roadmap

- No automated test suite (`test` script exits with an error); unit/integration coverage is the top engineering priority.
- Type safety gaps remain where controllers accept untyped payloads; tighten with zod or class-validator DTOs.
- Socket.IO scaling is single-instance; add a Redis adapter before horizontal scaling.
- Repository hygiene flags: `cred.txt` is committed by filename (contents intentionally never read here — remove it, rotate any credentials inside, and purge history); `.evn` is a misspelled environment file that should be renamed/gitignored; `backend/dist/` build artifacts and user-uploaded media under `uploads/` are tracked in git; many commit messages are placeholder noise.
- Roadmap candidates: escrow-style milestone payments, automated timesheet approvals, candidate screening workflows, notification center, and CI/CD pipelines for both apps.

## Security Notes

- Passwords hashed with bcryptjs; protected routes require JWT bearer tokens validated by auth middleware; rate limiting caps `/api/` at 1,000 requests per 15 minutes.
- Production error responses omit stack traces and error objects; detailed logging stays server-side only.
- Stripe webhook integrity depends on `STRIPE_WEBHOOK_SECRET`; the raw-body ordering must be preserved in any refactor.
- Because `cred.txt` exists in git history, treat those credentials as compromised: rotate them and rewrite history before making this repository public.
- Keep `JWT_SECRET`, database URL, and storage keys out of committed files; prefer platform-injected secrets (Render/Cloudflare) over checked-in env files.

## License
MIT License — Copyright (c) 2026 Musfiqur Rahman Saimon. See [LICENSE](./LICENSE).
