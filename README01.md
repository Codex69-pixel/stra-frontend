# STRA System Backend

Production-ready backend for a hospital management system built with TypeScript, Express, Drizzle ORM, and Socket.io. It provides modules for authentication, triage, queue management, doctor workflows, inventory, resources, and analytics, with Swagger API documentation and optional Redis-backed caching/pub-sub (with in-memory fallback).

## Features
- Authentication with JWT (access/refresh) and role-based access
- Smart triage (TEWS/MEWS) and legacy triage compatibility
- Department queues with prioritization and wait-time analytics
- Doctor workflows: prescriptions, lab orders, vitals, disposition updates
- Inventory and resource management with utilization analytics
- Real-time updates via Socket.io
- Redis caching/pub-sub with automatic in-memory fallback
- Swagger API docs served at `/api-docs`
- Strict TypeScript configuration and structured logging

## Tech Stack
- Runtime: Node.js, Express
- Language: TypeScript (strict mode)
- Database: PostgreSQL via Drizzle ORM
- Realtime: Socket.io
- Caching/Queues: Redis (ioredis) with in-memory fallback
- Validation: Zod
- Docs: Swagger UI
- Logging: Winston with daily rotate

## Project Structure
```
src/
  controllers/      // Express controllers per domain
  routes/           // Route definitions (mounted under /api/v1)
  services/         // Business logic and integrations
  db/               // Drizzle schema and db bootstrap
  middleware/       // Error handling, auth, rate limiting, validation
  utils/            // Validators and helpers
  config/           // env loader, logger
  docs/             // swagger.json
  index.ts          // App bootstrap and Socket.io setup
```

## Getting Started
1. Install dependencies:
   ```
   npm install
   ```
2. Configure environment:
   - Copy `.env.example` to `.env.development.local` (or appropriate env file)
   - Set required variables (see Environment Variables)
3. Initialize database:
   - Ensure `DATABASE_URL` points to a reachable Postgres instance
   - Generate and run migrations (Drizzle):
     ```
     npm run db:generate
     npm run db:migrate
     ```
4. Run in development:
   ```
   npm run dev
   ```
5. Build and start:
   ```
   npm run build
   npm start
   ```

## Scripts
- `npm run dev` — Start dev server with tsx watch (hot-reload)
- `npm run build` — Compile TypeScript to `dist/`
- `npm start` — Run compiled server (`dist/server.js`)
- `npm run db:generate` — Generate Drizzle SQL from schema
- `npm run db:migrate` — Apply migrations
- `npm run db:push` — Push schema (alternative workflow)
- `npm run db:studio` — Open Drizzle Studio
- `npm run db:drop` — Drop database (use with caution)

## Environment Variables
Loaded via [env.js](file:///c:/Users/Whitemimir/Desktop/Work/stra-sys-backend/src/config/env.js). Suggested `.env.development.local` keys:
- Server: `PORT`, `NODE_ENV`, `CLIENT_URL`
- Database: `DATABASE_URL`, or `POSTGRES_*` (host, port, database, user, password)
- JWT: `JWT_SECRET`, `JWT_EXPIRY`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRY`
- Rate Limit: `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`
- Redis: `REDIS_ENABLED` (`true`/`false`), `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`
- Socket: `WEBSOCKET_PORT`, `WEBSOCKET_CORS_ORIGIN`
- Notifications: `AFRICASTALKING_API_KEY`, `AFRICASTALKING_USERNAME`, `SENDGRID_API_KEY`, `EMAIL_FROM`

Notes:
- If `REDIS_ENABLED` is `false` or Redis fails, services automatically use in-memory fallback for cache, queues, and pub/sub.
- `CLIENT_URL` must match the frontend origin for CORS and Socket.io.

## API Overview
- Auth: `/api/v1/auth/*` — login, register, profile, password flows
- Triage: `/api/v1/triage/*` — smart/legacy triage, queue, patient details
- Doctor: `/api/v1/doctor/*` — prescriptions, lab orders, vitals, statistics, lab results
- Inventory: `/api/v1/inventory/*` — stock, adjustments, analytics
- Resources: `/api/v1/resources/*` — allocation, release, maintenance, utilization
- Analytics: `/api/v1/analytics/*` — patient volume, wait times, medication analytics, financials
- Health: `/api/v1/health` and `/api/v1/health/db`
- Docs: `/api-docs` — Swagger UI (served from [swagger.json](file:///c:/Users/Whitemimir/Desktop/Work/stra-sys-backend/src/docs/swagger.json))

## Realtime
- Socket.io server initialized in [index.ts](file:///c:/Users/Whitemimir/Desktop/Work/stra-sys-backend/src/index.ts)
- Path: `/socket.io/`, transports: `websocket` + `polling`
- Test endpoint: `/socket-test` returns server socket configuration

## Database & Migrations
- Schema defined in [app.ts](file:///c:/Users/Whitemimir/Desktop/Work/stra-sys-backend/src/db/schema/app.ts)
- Use Drizzle scripts to generate/apply migrations
- Ensure `DATABASE_URL` has appropriate privileges for migration operations

## Security
- Helmet CSP with sane defaults
- CORS restricted to `CLIENT_URL`
- Rate limiting for `/api/` routes
- JWT authentication with strict validation
- No secrets checked into VCS; use environment variables

## Logging & Errors
- Structured logging via Winston ([logger.ts](file:///c:/Users/Whitemimir/Desktop/Work/stra-sys-backend/src/config/logger.ts))
- Centralized error handling ([error.ts](file:///c:/Users/Whitemimir/Desktop/Work/stra-sys-backend/src/middleware/error.ts))
- 404 handling for API and non-API routes

## Development Notes
- TypeScript strict mode enabled; prefer explicit types
- Zod validators at [validators.ts](file:///c:/Users/Whitemimir/Desktop/Work/stra-sys-backend/src/utils/validators.ts)
- Follow existing patterns in controllers/routes/services for new features

## License
Proprietary — internal use only unless otherwise specified.
