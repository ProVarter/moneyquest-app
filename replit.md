# MoneyQuest — Gamified Personal Finance App

## Overview

MoneyQuest is a full-stack gamified personal finance web application. It helps users track income/expenses, set savings goals, earn XP and achievements, complete daily challenges, and get smart insights into their spending.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: react-hook-form + Zod
- **State**: Zustand (UI state) + React Query (server state)
- **i18n**: react-i18next (en, es, de, pt, fr, ru)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle for server), Vite (frontend)
- **Auth**: Custom JWT (HMAC-SHA256, no external dependency)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── moneyquest/         # React frontend (served at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # Database seeding script
└── ...
```

## Key Features

1. **Authentication** — JWT-based email/password auth. Token stored in `localStorage` as `mq_token`
2. **Gamification** — XP system, levels (every 500 XP), streaks, daily challenges, achievements
3. **Dashboard** — Balance overview, XP bar, daily challenge, goal progress, smart insights
4. **Transactions** — Add/edit/delete income & expenses with categories, tags, notes, recurring
5. **Goals** — Savings goals with progress bars, contributions, projected completion date
6. **Budgets** — Monthly category budgets with spent/remaining tracking
7. **Subscriptions** — Recurring payments tracker with annual cost projection
8. **Insights** — Monthly bar chart, category breakdown pie chart, financial health score
9. **Savings Calculator** — Compound interest calculator with scenario comparison
10. **i18n** — English, Spanish, German, Portuguese, French, Russian

## Database Schema

Tables: `users`, `user_settings`, `transactions`, `goals`, `budgets`, `subscriptions`, `challenges`, `user_challenges`, `achievements`, `user_achievements`

## Demo Account

- Email: `demo@moneyquest.com`
- Password: `demo1234`

To reseed: `pnpm --filter @workspace/scripts run seed`

## API Endpoints

- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login (returns JWT)
- `GET /api/auth/me` — Get current user
- `GET/PATCH /api/users/settings` — User settings
- `GET /api/users/stats` — XP, level, streak stats
- `GET/POST/PATCH/DELETE /api/transactions` — Transactions CRUD
- `GET/POST/PATCH/DELETE /api/goals` — Goals CRUD
- `POST /api/goals/:id/contribute` — Add money to goal
- `GET/POST/PATCH/DELETE /api/budgets` — Budgets CRUD
- `GET/POST/PATCH/DELETE /api/subscriptions` — Subscriptions CRUD
- `GET /api/challenges` — Get all challenges
- `POST /api/challenges/:id/complete` — Complete a challenge (+XP)
- `GET /api/achievements` — Get achievements with unlock status
- `GET /api/insights/dashboard` — Dashboard summary
- `GET /api/insights/monthly` — Monthly income/expenses trend
- `GET /api/insights/categories` — Category spending breakdown
- `POST /api/savings/calculate` — Compound interest calculator

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`)
- **`emitDeclarationOnly`** — only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/scripts run seed` — seed demo data
- `pnpm --filter @workspace/db run push` — push schema to DB
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API types from OpenAPI spec
