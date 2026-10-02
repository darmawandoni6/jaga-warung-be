# 🏪 Jaga Warung BE

Backend RESTful API service for the **Jaga Warung** platform, built with **TypeScript**, **Express.js**, **Prisma ORM**, and **PostgreSQL**.

---

## ⚡ Tech Stack

- **Runtime**: [Node.js v24](https://nodejs.org/) (`.nvmrc`)
- **Language**: [TypeScript 5.8](https://www.typescriptlang.org/)
- **Framework**: [Express.js 4.21](https://expressjs.com/)
- **Database & ORM**: [PostgreSQL 16 Alpine](https://www.postgresql.org/) via [Prisma ORM 6](https://www.prisma.io/)
- **Authentication**: JWT Dual-Token (Stateless Header + HttpOnly Cookie) + `bcrypt`
- **Security**: `helmet`, `cors`, `cookie-parser`
- **Validation**: [Zod 3.24](https://zod.dev/) (Request validation + Fail-fast Env config)
- **Error Standardization**: [http-errors](https://github.com/jshttp/http-errors) (`createHttpError` + unified error middleware)
- **Logging**: [Winston 3.17](https://github.com/winstonjs/winston) + [Morgan 1.10](https://github.com/expressjs/morgan)
- **Containerization**: Podman (`podman-compose`) / Docker (`docker-compose`)

---

## 📋 Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: `v24.x` (or use `nvm use`)
- **Container Runtime**: [Podman](https://podman.io/) (with `podman-compose`) or [Docker](https://www.docker.com/) (with `docker compose`)

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd jaga-warung-be
nvm use
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

_(Adjust secrets and database credentials in `.env` if necessary)_

### 3. Start PostgreSQL Container

```bash
make db-up
# or: podman-compose up -d
```

### 4. Run Database Migrations

```bash
make db-migrate
# or: npm run db:migrate
```

### 5. Start Development Server

```bash
make dev
# or: npm run dev
```

The API will be available at: **`http://localhost:3000/api-v1`**  
Healthcheck endpoint: **`http://localhost:3000/api-v1/health`**

---

## 🛠️ Available Scripts & Makefile Targets

| Command            | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `make dev`         | Start development server with hot-reload (`tsx watch`) |
| `make build`       | Compile TypeScript to `dist/`                          |
| `make start`       | Run compiled production build                          |
| `make lint`        | Run ESLint check                                       |
| `make format`      | Format codebase using Prettier                         |
| `make db-up`       | Spin up PostgreSQL container                           |
| `make db-down`     | Stop PostgreSQL container                              |
| `make db-migrate`  | Apply Prisma schema migrations                         |
| `make db-generate` | Re-generate Prisma Client types                        |
| `make db-studio`   | Open Prisma Studio Web GUI (`http://localhost:5555`)   |

---

## 🚨 Error Handling & Standardization

Errors across the service are standardized using **`http-errors`** and handled globally by `src/middlewares/error.middleware.ts`:

```typescript
import createHttpError from 'http-errors';
// Or import helpers from '@/utils/errors':
// import { NotFound, Unauthorized, Conflict } from '@/utils/errors';

// Throw standard operational HTTP errors:
throw createHttpError.NotFound('Product not found'); // 404
throw createHttpError.Unauthorized('Invalid credentials'); // 401
throw createHttpError.Conflict('Email already exists'); // 409
throw createHttpError.Forbidden('Access denied'); // 403
```

All responses (success & error) return a consistent JSON schema:

```json
// Error Response
{
  "success": false,
  "message": "Product not found"
}

// Validation Error (Zod)
{
  "success": false,
  "message": "Validation error",
  "errors": [
    { "field": "body.email", "message": "Invalid email address" }
  ]
}
```

---

## 🌐 API Endpoints

All endpoints are versioned under `/api-v1`:

| Module               | Base Path                        | Key Endpoints & Actions                                                                    |
| -------------------- | -------------------------------- | ------------------------------------------------------------------------------------------ |
| **Auth & Health**    | `/api-v1/auth`, `/api-v1/health` | Register, Login, Refresh, Profile (`/me`), Logout, Healthcheck                             |
| **Categories**       | `/api-v1/categories`             | List with product counts, Create, Get by ID, Update, Delete                                |
| **Products**         | `/api-v1/products`               | Search, Barcode lookup (`/barcode/:code`), Create, Update, Delete                          |
| **Stock Movements**  | `/api-v1/stock-movements`        | Restock inventory, Adjust stock (`/adjust`), History, Stats (`/stats`)                     |
| **POS Transactions** | `/api-v1/transactions`           | Atomic checkout POS (`POST /`), History with date filter, Receipts                         |
| **Kasbon / Debts**   | `/api-v1/debts`                  | Track customer debts, Installment payments (`/:id/payments`), Status (`/:id/status`)       |
| **Cash Flows**       | `/api-v1/cash-flows`             | Cash journal list, Net balance summary (`/summary`), Manual entries                        |
| **Dashboard**        | `/api-v1/dashboard`              | Daily sales, Low stock alerts, Active debts, Today cash balance                            |
| **Reports**          | `/api-v1/reports/financial`      | Period financial breakdown: Omset, HPP, Gross/Net Profit, Margin %, Top Products, Timeline |
| **Store Settings**   | `/api-v1/settings/profile`       | Get & Update store profile (name, phone, address, receipt footer)                          |

_For complete endpoint contracts and payloads, see [docs/api-conventions.md](docs/api-conventions.md)._
_To test endpoints immediately in [Bruno](https://www.usebruno.com/), open the [`api-collection/`](api-collection/README.md) folder collection._

---

## 📁 Project Structure

```
jaga-warung-be/
├── .env.example            # Environment variables template
├── .nvmrc                  # Node version (v24)
├── docker-compose.yml      # PostgreSQL 16 Alpine container definition
├── Makefile                # Dev and task shortcuts
├── package.json            # Project dependencies & scripts
├── tsconfig.json           # TypeScript configuration with @/* path alias
├── prisma/
│   ├── schema.prisma       # Database schema & models
│   └── migrations/         # SQL migration history
├── logs/                   # Log files (combined.log, error.log)
├── docs/                   # Detailed technical documentation
│   ├── architecture.md     # Layered architecture & security design
│   ├── database.md         # Database & Prisma conventions
│   └── api-conventions.md  # API standards, validation, & error handling
├── api-collection/         # Bruno API Collection & environments
├── AGENTS.md               # Rules and guidelines for AI agents & developers
└── src/
    ├── index.ts            # Application entry point & graceful shutdown
    ├── app.ts              # Express configuration & middleware stack
    ├── config/             # Config singletons (Env, Logger, Prisma)
    ├── controllers/        # HTTP handlers
    ├── middlewares/        # Auth, Validation, & Error middlewares
    ├── routes/             # API routes
    ├── schemas/            # Zod validation schemas
    ├── services/           # Business logic
    └── utils/              # Response, error, & formatting helpers
```

---

## 📚 Documentation & Developer Guides

- 📖 **[System Architecture & Design](docs/architecture.md)**
- 🐘 **[Database & Prisma Guide](docs/database.md)**
- 🌐 **[API Conventions & Standards](docs/api-conventions.md)**
- 🐶 **[API Collection Guide](api-collection/README.md)**
- 🤖 **[AI Agents & Developer Rules](AGENTS.md)**
