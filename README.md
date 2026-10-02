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

## 🌐 API Endpoints

All endpoints are versioned under `/api-v1`:

| Method | Endpoint                |  Auth Required  | Description                                  |
| ------ | ----------------------- | :-------------: | -------------------------------------------- |
| `GET`  | `/api-v1/health`        |    ❌ Public    | Service health & uptime status               |
| `POST` | `/api-v1/auth/register` |    ❌ Public    | Register a new user & set refresh cookie     |
| `POST` | `/api-v1/auth/login`    |    ❌ Public    | Login & set refresh cookie                   |
| `POST` | `/api-v1/auth/refresh`  |    🍪 Cookie    | Obtain new Access Token using refresh cookie |
| `GET`  | `/api-v1/auth/me`       | 🔒 Bearer Token | Fetch authenticated user profile             |
| `POST` | `/api-v1/auth/logout`   | 🔒 Bearer Token | Invalidate & clear refresh cookie            |

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
    └── utils/              # Response & formatting helpers
```

---

## 📚 Documentation & Developer Guides

- 📖 **[System Architecture & Design](docs/architecture.md)**
- 🐘 **[Database & Prisma Guide](docs/database.md)**
- 🌐 **[API Conventions & Standards](docs/api-conventions.md)**
- 🤖 **[AI Agents & Developer Rules](AGENTS.md)**
