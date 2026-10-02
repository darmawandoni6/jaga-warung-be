# Architecture & System Design

This document outlines the system architecture, request lifecycle, module structure, and security design of **Jaga Warung BE**.

---

## 🏗️ Layered Architecture

The application strictly adheres to a **Layered Architecture** pattern. Each incoming HTTP request flows sequentially through the following layers:

```
Client Request
  ↓
Middlewares (Helmet, CORS, CookieParser, Morgan)
  ↓
Route Layer (src/routes/*.routes.ts)
  ↓
Route-Level Middleware:
  - Validation Middleware (validateRequest(schema))
  - Authentication Middleware (authenticate)
  - Role/Permission Check
  ↓
Controller Layer (src/controllers/*.controller.ts)
  - Parses HTTP request payload, cookies, and query params
  - Invokes Service functions
  - Sets cookies, HTTP status codes, and formats JSON responses
  ↓
Service Layer (src/services/*.service.ts)
  - Houses core business logic, hashing, calculations, and domain operations
  - Calls database models via Prisma ORM
  ↓
Prisma Client Singleton (src/config/prisma.ts)
  ↓
PostgreSQL Database (Docker / Podman)
```

### Module Boundaries & Responsibilities

| Layer / Directory | Primary Responsibility | Prohibited Actions |
|---|---|---|
| `src/routes/` | Route definitions and middleware chaining | No business logic, no direct DB queries |
| `src/controllers/` | HTTP request extraction and response formatting | No raw SQL/Prisma calls, no business calculations |
| `src/services/` | Business rules, transaction handling, token generation | No direct Express `req`/`res` manipulation |
| `src/schemas/` | Zod validation definitions for input contracts | No side effects, pure schema exports |
| `src/middlewares/` | Cross-cutting concerns (auth, logging, error handling) | Avoid business-specific state mutations |
| `src/config/` | Application-wide singletons (Prisma, Logger, Env) | Avoid business logic |
| `src/utils/` | Reusable pure helpers (response formatters) | No stateful application logic |

---

## 🔒 Security Architecture

### 1. Dual-Token JWT Authentication (Stateless)
- **Access Token**:
  - Sent via `Authorization: Bearer <token>` header.
  - Short-lived lifetime (`15m`).
  - Contains minimal user identity (`id`, `email`).
- **Refresh Token**:
  - Sent via `Set-Cookie` as an `HttpOnly`, `SameSite=Lax` (or `None` with HTTPS in production) cookie.
  - Long-lived lifetime (`7d`).
  - Used strictly at `POST /api-v1/auth/refresh` to issue a new Access Token.
- **Stateless Nature**: Refresh tokens are verified cryptographically via `JWT_REFRESH_SECRET` without requiring database session lookup.

### 2. Password Security
- Passwords are encrypted with `bcrypt` using **10 salt rounds**.
- Password hashes must **never** be exposed in API responses or logs. Always use sanitization helpers before returning user objects.

### 3. HTTP Security Headers & Cross-Origin
- **Helmet**: Injected at root middleware level to enforce CSP, HSTS, frameguard, and XSS filtering.
- **CORS**: Configured with `credentials: true` and restricted to trusted origins defined in `CORS_ORIGIN`.

### 4. Fail-Fast Configuration
- The app parses and validates all environment variables upon startup via `src/config/env.ts` using Zod schemas.
- If any required variable (or minimum secret length constraint) is violated, the process immediately exits with code `1`.
