# API Conventions & Standards

This document establishes the API standards, request/response formats, validation schemas, error handling, and authentication contracts for **Jaga Warung BE**.

---

## 🌐 Route Structure & Versioning

All API routes must be prefixed with the `/api-v1` namespace:

```
http://localhost:3000/api-v1/<resource>
```

### Endpoints Inventory

#### 🔑 Authentication & Health
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api-v1/health` | ❌ Public | Service healthcheck & uptime |
| `POST` | `/api-v1/auth/register` | ❌ Public | Register user & seed default categories |
| `POST` | `/api-v1/auth/login` | ❌ Public | Authenticate user & issue refresh cookie |
| `POST` | `/api-v1/auth/refresh` | 🍪 Refresh Cookie | Issue new Access Token from refresh cookie |
| `GET` | `/api-v1/auth/me` | 🔒 Bearer | Fetch authenticated user profile |
| `POST` | `/api-v1/auth/logout` | 🔒 Bearer | Clear refresh token cookie |

#### 🏷️ Categories (`/api-v1/categories`)
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api-v1/categories` | 🔒 Bearer | List categories with product counts |
| `GET` | `/api-v1/categories/:id` | 🔒 Bearer | Get category detail |
| `POST` | `/api-v1/categories` | 🔒 Bearer | Create new category |
| `PUT` | `/api-v1/categories/:id` | 🔒 Bearer | Update category |
| `DELETE` | `/api-v1/categories/:id` | 🔒 Bearer | Delete category |

#### 📦 Products (`/api-v1/products`)
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api-v1/products` | 🔒 Bearer | List products (`search`, `categoryId`, `lowStock`) |
| `GET` | `/api-v1/products/barcode/:barcode` | 🔒 Bearer | Lookup product by barcode (scanner) |
| `GET` | `/api-v1/products/:id` | 🔒 Bearer | Get product detail |
| `POST` | `/api-v1/products` | 🔒 Bearer | Create product (auto initial stock movement) |
| `PUT` | `/api-v1/products/:id` | 🔒 Bearer | Update product |
| `DELETE` | `/api-v1/products/:id` | 🔒 Bearer | Delete product |

#### 🔄 Stock Movements (`/api-v1/stock-movements`)
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api-v1/stock-movements` | 🔒 Bearer | Query stock movement audit history |
| `GET` | `/api-v1/stock-movements/stats` | 🔒 Bearer | Total restocked, sold, adjusted statistics |
| `POST` | `/api-v1/stock-movements/restock` | 🔒 Bearer | Restock inventory & record cash flow expense |
| `POST` | `/api-v1/stock-movements/adjust` | 🔒 Bearer | Adjust stock (`ADJUSTMENT_LOSS`/`GAIN`) |

#### 🛒 POS Transactions (`/api-v1/transactions`)
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api-v1/transactions` | 🔒 Bearer | List transactions with date filter & pagination |
| `GET` | `/api-v1/transactions/:id` | 🔒 Bearer | Get transaction receipt with line items |
| `POST` | `/api-v1/transactions` | 🔒 Bearer | Checkout POS transaction (atomic stock & cash flow) |

#### 📒 Debts / Kasbon (`/api-v1/debts`)
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api-v1/debts` | 🔒 Bearer | List customer debts (`status`, `search`) |
| `GET` | `/api-v1/debts/:id` | 🔒 Bearer | Get debt detail with installment history |
| `POST` | `/api-v1/debts` | 🔒 Bearer | Create new debt / kasbon |
| `POST` | `/api-v1/debts/:id/payments` | 🔒 Bearer | Record installment payment (auto status & cash flow) |
| `PATCH` | `/api-v1/debts/:id/status` | 🔒 Bearer | Update debt status (e.g. `BAD_DEBT`) |
| `DELETE` | `/api-v1/debts/:id` | 🔒 Bearer | Delete debt record |

#### 💵 Cash Flows (`/api-v1/cash-flows`)
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api-v1/cash-flows` | 🔒 Bearer | List cash journal entries (`type`, `startDate`, `endDate`) |
| `GET` | `/api-v1/cash-flows/summary` | 🔒 Bearer | Get cash balance summary (Income, Expense, Balance) |
| `POST` | `/api-v1/cash-flows` | 🔒 Bearer | Create manual cash flow entry |
| `DELETE` | `/api-v1/cash-flows/:id` | 🔒 Bearer | Delete cash flow entry |

#### 📊 Dashboard & Reports (`/api-v1/dashboard` & `/api-v1/reports`)
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api-v1/dashboard` | 🔒 Bearer | Daily sales summary, stock alerts, active debts |
| `GET` | `/api-v1/reports/financial` | 🔒 Bearer | Financial report: Omset, HPP, Gross/Net Profit, Margin %, Top Products, Timeline |

#### ⚙️ Settings (`/api-v1/settings`)
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api-v1/settings/profile` | 🔒 Bearer | Get store profile (name, phone, address, footer) |
| `PUT` | `/api-v1/settings/profile` | 🔒 Bearer | Update store profile |

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
