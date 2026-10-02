# Database & ORM Guide

This document describes the database design, container setup, Prisma ORM conventions, and migration workflows for **Jaga Warung BE**.

---

## 🐘 PostgreSQL Container (Podman / Docker)

The project uses **PostgreSQL 16 Alpine** running inside a container defined in `docker-compose.yml`.

### Container Commands

```bash
# Start PostgreSQL container in background
make db-up
# or manually:
podman-compose up -d  # (or docker compose up -d)

# Stop PostgreSQL container
make db-down
# or manually:
podman-compose down

# Check container status
podman ps
```

### Connection Configuration

Database connection settings in `.env`:

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jaga_warung?schema=public"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=jaga_warung
POSTGRES_PORT=5432
```

---

## 🗄️ Prisma ORM Conventions

### 1. Model & Field Naming Rules

- **Primary Keys**: Always use `UUID` format (`@id @default(uuid())`).
- **Table Names**: Database tables must be mapped to **plural `snake_case`** using `@@map("table_names")`.
- **Column Names**: Database columns must be mapped to **`snake_case`** using `@map("column_name")`, while TypeScript model properties remain **`camelCase`**.
- **Timestamps**: Every table must have `createdAt` (`@default(now()) @map("created_at")`) and `updatedAt` (`@updatedAt @map("updated_at")`).

### 2. Model Template Example

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

---

## 🔄 Migration Workflow

Always use the **Prisma Migrate** workflow so migration histories are tracked in version control (`prisma/migrations/`).

### Common Migration Commands

| Task | Command |
|---|---|
| Create & apply new migration | `make db-migrate` or `npx prisma migrate dev --name <migration_name>` |
| Re-generate Prisma Client | `make db-generate` or `npx prisma generate` |
| Open Prisma Studio (Database GUI) | `make db-studio` or `npx prisma studio` |
| Direct DB push (Prototyping only) | `npm run db:push` or `npx prisma db push` |

### Step-by-Step Schema Update Workflow

1. Update `prisma/schema.prisma` with your model changes.
2. Run `npm run db:migrate -- --name <descriptive_change_name>`.
3. Prisma automatically compiles the SQL migration in `prisma/migrations/` and updates the `@prisma/client` types.
4. Verify models and seed/query data via Prisma Studio (`npm run db:studio`).
