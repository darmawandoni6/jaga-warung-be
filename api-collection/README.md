# 🐶 Jaga Warung BE — Bruno API Collection

This directory contains the complete, ready-to-use **Bruno API Collection** for testing and developing against the **Jaga Warung Backend API**.

---

## 🚀 Quick Start

### 1. Install Bruno
If you don't already have Bruno installed, download it from [usebruno.com](https://www.usebruno.com/) or install via Homebrew / Winget / Apt:

```bash
# macOS (Homebrew)
brew install bruno
```

### 2. Open Collection in Bruno
1. Launch the **Bruno** desktop application.
2. Click **"Open Collection"** from the home screen.
3. Select the `api-collection` directory located at `/Users/donidarmawan/Documents/me/jaga-warung-be/api-collection`.

### 3. Select Environment
In the top-right environment selector in Bruno:
- Select **`Local`** (`http://localhost:3000/api-v1`).
- Or select **`Production`** (`https://api.jagawarung.id/api-v1`).

---

## 🔐 Automated Authentication Flow

All protected endpoints automatically use `Bearer {{token}}`. You don't need to manually copy and paste JWT tokens!

1. Open **`01-auth / 01-register`** (or **`01-auth / 02-login`**).
2. Click **Send**.
3. A post-response script will automatically capture `data.accessToken` and store it in your `token` variable (both active environment and runtime memory).
4. All subsequent requests in any folder will automatically authenticate using this token!

---

## 📁 Collection Structure

| Folder | Description | Endpoints Included |
|---|---|---|
| **`00-health`** | Health checks & service uptime | `GET /health` |
| **`01-auth`** | User registration, login, profile, refresh & logout | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout` |
| **`02-settings`** | Store profile & receipt footer management | `GET /settings/profile`, `PUT /settings/profile` |
| **`03-categories`** | Category catalog management | `GET /categories`, `POST /categories`, `GET /categories/:id`, `PUT /categories/:id`, `DELETE /categories/:id` |
| **`04-products`** | Inventory products & barcode scanner lookups | `GET /products`, `POST /products`, `GET /products/:id`, `GET /products/barcode/:barcode`, `PUT /products/:id`, `DELETE /products/:id` |
| **`05-stock-movements`** | Restock & inventory loss/gain adjustments | `GET /stock-movements`, `GET /stock-movements/stats`, `POST /stock-movements/restock`, `POST /stock-movements/adjust` |
| **`06-transactions`** | POS cashier checkout & sales transaction audit | `POST /transactions`, `GET /transactions`, `GET /transactions/:id` |
| **`07-debts`** | Customer debt / kasbon & installment tracking | `GET /debts`, `POST /debts`, `GET /debts/:id`, `POST /debts/:id/payments`, `PATCH /debts/:id/status`, `DELETE /debts/:id` |
| **`08-cash-flows`** | Cash journal entries & financial balance summary | `GET /cash-flows`, `GET /cash-flows/summary`, `POST /cash-flows`, `DELETE /cash-flows/:id` |
| **`09-dashboard-and-reports`** | Owner dashboard KPI & financial analytics | `GET /dashboard`, `GET /reports/financial` |

---

## ⚡ Running Automated Tests with Bruno CLI

You can also run the entire collection headlessly in your terminal or CI/CD pipelines using the Bruno CLI:

```bash
# Run entire collection against Local environment
npx @usebruno/cli run api-collection --env Local

# Run a specific folder (e.g. Auth)
npx @usebruno/cli run api-collection/01-auth --env Local
```
