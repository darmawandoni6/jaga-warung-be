# AGENTS.md — Global Rules & AI Developer Guide

This file defines the **global rules, non-negotiable constraints, and essential commands** for AI coding assistants and developers working on the **Jaga Warung BE** repository.

---

## 📌 Tech Stack Quick Reference

| Layer | Technology |
|---|---|
| **Runtime & Language** | Node.js v24 (`.nvmrc`), TypeScript 5.8 (`tsconfig.json`) |
| **Web Framework** | Express.js 4.21 |
| **Database & ORM** | PostgreSQL 16 Alpine via Prisma ORM 6 (Prisma Migrate workflow) |
| **Auth & Security** | JWT Dual-Token (Stateless Header + HttpOnly Cookie), `bcrypt`, `helmet`, `cors`, `cookie-parser` |
| **Validation** | Zod 3.24 (Request validation + Fail-fast Env loader) |
| **Logging** | Winston 3.17 (`logs/combined.log`, `logs/error.log`) + Morgan 1.10 (HTTP stream) |
| **Containerization** | Podman (`podman-compose`) / Docker (`docker-compose`) |

---

## ⚡ Global Non-Negotiable Rules & Constraints

1. **Path Aliases**:
   - **MUST** use `@/*` for all imports within `src/` (e.g., `import { env } from '@/config/env';`).
   - **NEVER** use relative imports like `../../config/env`.

2. **Logging Standards**:
   - **NEVER** use `console.log` in production, service, or controller code.
   - **MUST** use `logger` from `@/config/logger` (`logger.info()`, `logger.error()`, `logger.warn()`).

3. **Request Validation**:
   - **MUST** validate all endpoints receiving `body`, `query`, or `params` with Zod schemas in `src/schemas/`.
   - **MUST** attach `validateRequest(schema)` middleware in route definitions.

4. **Standardized Responses**:
   - **MUST** return JSON responses using helper functions from `@/utils/response`:
     - Success: `successResponse(data, message)`
     - Error: `errorResponse(message, errors)`

5. **Error Handling**:
   - **MUST** throw `createHttpError` (e.g. `createHttpError.NotFound()`, `createHttpError.Unauthorized()`) from `http-errors` for operational HTTP errors.
   - Controllers **MUST** wrap async logic in `try { ... } catch (error) { next(error); }`.

6. **Database Conventions**:
   - Primary keys **MUST** use `UUID` format (`@id @default(uuid())`).
   - Table names **MUST** be mapped to `snake_case` plural via `@@map("table_names")`.
   - Column names **MUST** be mapped to `snake_case` via `@map("column_name")`.
   - Schema modifications **MUST** be accompanied by a migration (`make db-migrate`).

7. **Environment Variables**:
   - New environment variables **MUST** be added to `src/config/env.ts` with Zod validation and documented in `.env.example`.

8. **Security**:
   - **NEVER** return hashed passwords or sensitive credentials in API responses.
   - Refresh tokens **MUST** be handled via secure `HttpOnly` cookies.

---

## 🛠️ Essential Commands

```bash
# Development server (with hot reload)
make dev         # or: npm run dev

# Build & Start production
make build       # or: npm run build
make start       # or: npm run start

# Code quality
make lint        # or: npm run lint
make format      # or: npm run format

# Database & Container management
make db-up       # Start PostgreSQL container (Podman / Docker)
make db-down     # Stop PostgreSQL container
make db-migrate  # Apply Prisma migrations (npm run db:migrate)
make db-generate # Generate Prisma Client (npm run db:generate)
make db-studio   # Open Prisma Studio GUI (npm run db:studio)
```

---

## 📚 Detailed Documentation Index

For in-depth explanations, diagrams, and code patterns, consult the dedicated guides in the `docs/` folder:

- **[System Architecture & Design](docs/architecture.md)**: Layered request flow, module boundaries, and security architecture.
- **[Database & Prisma Guide](docs/database.md)**: Container setup, schema conventions, and migration workflows.
- **[API Conventions & Standards](docs/api-conventions.md)**: Endpoint catalog, Zod schema patterns, JSON formats, error handling, and logging.
