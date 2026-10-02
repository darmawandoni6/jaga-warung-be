# API Conventions & Standards

This document establishes the API standards, request/response formats, validation schemas, error handling, and authentication contracts for **Jaga Warung BE**.

---

## 🌐 Route Structure & Versioning

All API routes must be prefixed with the `/api-v1` namespace:

```
http://localhost:3000/api-v1/<resource>
```

### Endpoints Inventory

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api-v1/health` | ❌ Public | Service healthcheck & uptime |
| `POST` | `/api-v1/auth/register` | ❌ Public | Register a new user & issue refresh cookie |
| `POST` | `/api-v1/auth/login` | ❌ Public | Authenticate user & issue refresh cookie |
| `POST` | `/api-v1/auth/refresh` | 🍪 Refresh Cookie | Issue new Access Token from refresh cookie |
| `GET` | `/api-v1/auth/me` | 🔒 Bearer Token | Fetch authenticated user profile |
| `POST` | `/api-v1/auth/logout` | 🔒 Bearer Token | Clear refresh token cookie |

---

## 📝 Request Validation (Zod)

Every incoming HTTP request with `body`, `query`, or `params` must define a dedicated Zod validation schema located in `src/schemas/`.

### Schema Pattern

```typescript
// src/schemas/auth.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    name: z.string().trim().min(1).optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
```

### Route Middleware Attachment

```typescript
// src/routes/auth.routes.ts
import { Router } from 'express';
import { validateRequest } from '@/middlewares/validate.middleware';
import { registerSchema } from '@/schemas/auth.schema';
import * as authController from '@/controllers/auth.controller';

const router = Router();
router.post('/register', validateRequest(registerSchema), authController.registerHandler);
```

---

## 📦 Standard JSON Response Format

All JSON responses must utilize the response helpers in `src/utils/response.ts`.

### Success Response (`successResponse`)

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "a83e2a8e-ee2e-4714-8e48-c278a9b5f4cd",
      "email": "owner@jagawarung.id",
      "name": "Juragan Warung",
      "createdAt": "2026-10-02T13:18:01.436Z",
      "updatedAt": "2026-10-02T13:18:01.436Z"
    },
    "accessToken": "eyJhbGciOi..."
  }
}
```

### Validation Error Response (400 Bad Request)

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "body.email",
      "message": "Invalid email address"
    },
    {
      "field": "body.password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

### Generic Error Response (4xx / 5xx)

```json
{
  "success": false,
  "message": "Unauthorized: Access token has expired"
}
```

---

## 🚨 Error Handling & HTTP Exceptions

1. **Standard HTTP Errors**: Use `createHttpError` from `http-errors` (or imported from `@/middlewares/error.middleware`) to throw structured operational errors:
   ```typescript
   import createHttpError from 'http-errors';

   // Using status code or named helper
   if (!user) {
     throw createHttpError.Unauthorized('Invalid email or password'); // 401
   }
   if (existingEmail) {
     throw createHttpError.Conflict('Email is already registered'); // 409
   }
   if (!item) {
     throw createHttpError.NotFound('Item not found'); // 404
   }
   ```
2. **Controller Try/Catch**: Wrap controller logic in `try { ... } catch (error) { next(error); }`.
3. **Global Error Middleware**: Automatically intercepts `ZodError` (400), `HttpError` via `isHttpError(err)` (maps `err.statusCode`), and unhandled runtime exceptions (500), logging them to Winston with full stack traces.

---

## 🪵 Logging Standards

- **Strictly Prohibited**: `console.log` inside application, service, or controller code.
- **Allowed**: `logger.info()`, `logger.warn()`, `logger.error()`, `logger.debug()` from `src/config/logger.ts`.
- All HTTP requests are automatically recorded into `logs/combined.log` via Morgan stream.
