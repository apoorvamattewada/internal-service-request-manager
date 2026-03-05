# 🔧 Internal Service Request Manager (ISRM)

> A production-grade, enterprise-ready full-stack internal web application built to demonstrate proficiency in the CubX full-stack software developer tech stack.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Running with Docker](#running-with-docker)
  - [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [CI/CD Pipeline](#cicd-pipeline)
- [Azure Deployment](#azure-deployment)
- [Project Structure](#project-structure)
- [Git Workflow](#git-workflow)
- [Future Improvements](#future-improvements)
- [Relevance to CubX](#relevance-to-cubx)

---

## Project Overview

The **Internal Service Request Manager (ISRM)** simulates a real internal tool that a managed service company like CubX might use to track, assign, and manage internal IT or operational service requests.

It provides:
- JWT-based authentication with role-based access control (Admin / Employee)
- Full CRUD for service requests with priority, status, and assignment
- Search, filter, and pagination
- Clean, responsive UI with contextual role-based permissions
- Fully containerised with Docker and automated CI/CD via GitHub Actions
- Designed for Azure cloud deployment

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (React / TS)                   │
│  Context API ─ Hooks ─ Components ─ Pages ─ Axios       │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API (JSON / HTTP)
┌──────────────────────▼──────────────────────────────────┐
│                  Server (Node / Express / TS)            │
│   Routes → Middleware → Controllers → Services → Repos  │
└──────────────────────┬──────────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────────┐
│                 MongoDB (Atlas / Cosmos DB)              │
└─────────────────────────────────────────────────────────┘
```

### Backend Architecture (Clean Architecture)

The server follows a **Controller → Service → Repository** pattern:

- **Routes** — Express router, maps HTTP verbs to controller methods
- **Middleware** — Authentication (JWT), Authorization (RBAC), Validation (express-validator), Error handling
- **Controllers** — Thin HTTP layer: parse request, call service, send response
- **Services** — Business logic: ownership checks, role enforcement, orchestration
- **Repositories** — Data access layer: all Mongoose queries isolated here
- **Models** — Mongoose schemas with validators and indexes

This separation ensures code is testable, swappable (e.g. switch DB), and scalable.

### Frontend Architecture

- **Context API + useReducer** — Global authentication state
- **Custom hooks** — `useServiceRequests` encapsulates all async data fetching logic
- **Component breakdown** — layout, common (reusable), feature-specific, pages
- **Protected Routes** — HOC-style route guard that checks auth state and role
- **Axios interceptors** — Attaches JWT to every request; handles 401 globally

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript (strict), React Router v6 |
| State Management | Context API + useReducer |
| HTTP Client | Axios with interceptors |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | express-validator |
| Logging | Winston |
| Testing | Jest + ts-jest |
| Containerisation | Docker (multi-stage), Docker Compose |
| CI/CD | GitHub Actions |
| Cloud | Azure App Service, Azure Static Web Apps, Azure Cosmos DB |

---

## Features

- ✅ **JWT Authentication** — Stateless, expiring tokens with secure storage
- ✅ **Role-based Access Control** — Admin and Employee roles with enforced permissions
- ✅ **Full CRUD** — Create, Read, Update, Delete service requests
- ✅ **Search & Filter** — Real-time search with debouncing; filter by status and priority
- ✅ **Pagination** — Server-side with configurable page size
- ✅ **Input Validation** — Client-side + server-side (express-validator)
- ✅ **Error Handling** — Centralised error middleware with operational vs unexpected errors
- ✅ **Logging** — Winston structured logging (JSON in production)
- ✅ **Rate Limiting** — express-rate-limit on all API routes
- ✅ **Security Headers** — Helmet.js for HTTP security hardening
- ✅ **CORS** — Configured per environment
- ✅ **Graceful Shutdown** — Handles SIGTERM/SIGINT for zero-downtime deployments
- ✅ **Docker** — Multi-stage builds for minimal production images
- ✅ **CI/CD** — GitHub Actions with test, build, and push stages

---

## Screenshots

> _Screenshots would go here in a deployed version_

| Page | Description |
|---|---|
| Login | JWT auth with validation |
| Dashboard | Stats overview + recent requests |
| Requests List | Filterable, searchable, paginated table |
| Request Detail | Full view with edit/delete |
| Users (Admin) | User management for admins |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+
- MongoDB 7.0 (or Docker)
- Docker & Docker Compose (optional but recommended)

### Local Development

#### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/internal-service-request-manager.git
cd internal-service-request-manager
```

#### 2. Set up the backend

```bash
cd server
cp .env.example .env
# Edit .env and set your MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

The API will start at `http://localhost:5000`

#### 3. Set up the frontend

```bash
cd ../client
npm install
npm start
```

The app will open at `http://localhost:3000`

#### 4. Seed demo users (optional)

Use the `/api/auth/register` endpoint to create accounts, or use the demo credentials shown on the login page.

---

### Running with Docker

This runs the full stack (MongoDB + API + React) with a single command:

```bash
# From the project root
cp server/.env.example server/.env
# Edit server/.env as needed

docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| MongoDB | mongodb://localhost:27017 |

To stop:

```bash
docker-compose down
# To also remove volumes:
docker-compose down -v
```

---

### Running Tests

```bash
# Backend unit tests
cd server
npm test

# With coverage report
npm test -- --coverage

# Watch mode (during development)
npm run test:watch
```

---

## API Documentation

All API routes are prefixed with `/api`.

### Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login, receive JWT | Public |
| GET | `/auth/me` | Get current user profile | Private |

### Service Requests

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/requests` | List all (with filters, pagination) | Private |
| GET | `/requests/:id` | Get single request | Private |
| POST | `/requests` | Create new request | Private |
| PATCH | `/requests/:id` | Update request | Owner or Admin |
| DELETE | `/requests/:id` | Delete request | Owner or Admin |
| GET | `/requests/stats` | Status summary counts | Admin |

**Query parameters for GET /requests:**
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 10, max: 100)
- `status` — Filter by: `Open`, `In Progress`, `Closed`
- `priority` — Filter by: `Low`, `Medium`, `High`
- `search` — Searches title and description

### Users

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/users` | List all users | Admin |
| GET | `/users/:id` | Get user by ID | Admin |
| PATCH | `/users/:id` | Update user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) runs on every push and pull request:

```
push/PR to main or develop
        │
        ├── test-server (parallel)
        │       ├── Install deps
        │       ├── ESLint
        │       └── Jest unit tests + coverage
        │
        ├── build-client (parallel)
        │       ├── Install deps
        │       ├── TypeScript type check
        │       └── Production build
        │
        └── (on main push only)
            build-and-push
                ├── Build server Docker image
                ├── Push to GitHub Container Registry
                ├── Build client Docker image
                └── Push to GitHub Container Registry
```

**Secrets required in GitHub:**
- `REACT_APP_API_URL` — Production API URL for frontend builds

---

## Azure Deployment

### Backend → Azure App Service (Container)

```bash
# 1. Create resource group
az group create --name isrm-rg --location uksouth

# 2. Create App Service Plan
az appservice plan create \
  --name isrm-plan \
  --resource-group isrm-rg \
  --sku B2 \
  --is-linux

# 3. Create Web App (from Docker image)
az webapp create \
  --resource-group isrm-rg \
  --plan isrm-plan \
  --name isrm-api \
  --deployment-container-image-name ghcr.io/YOUR_USERNAME/isrm-server:latest

# 4. Set environment variables
az webapp config appsettings set \
  --resource-group isrm-rg \
  --name isrm-api \
  --settings \
    NODE_ENV=production \
    PORT=5000 \
    MONGODB_URI="<your-cosmos-db-connection-string>" \
    JWT_SECRET="<your-production-secret>" \
    CLIENT_URL="https://your-static-web-app.azurestaticapps.net"
```

### Database → Azure Cosmos DB (MongoDB API)

```bash
# Create Cosmos DB account with MongoDB API
az cosmosdb create \
  --name isrm-cosmos \
  --resource-group isrm-rg \
  --kind MongoDB \
  --server-version 4.2 \
  --default-consistency-level Session

# Create database
az cosmosdb mongodb database create \
  --account-name isrm-cosmos \
  --resource-group isrm-rg \
  --name isrm_db

# Get connection string
az cosmosdb keys list \
  --name isrm-cosmos \
  --resource-group isrm-rg \
  --type connection-strings
```

### Frontend → Azure Static Web Apps

```bash
# Option 1: Via Azure CLI
az staticwebapp create \
  --name isrm-frontend \
  --resource-group isrm-rg \
  --source https://github.com/YOUR_USERNAME/internal-service-request-manager \
  --location "West Europe" \
  --branch main \
  --app-location "/client" \
  --output-location "build" \
  --login-with-github

# Option 2: Via GitHub Actions (Azure provides the workflow automatically)
# Azure Static Web Apps auto-creates a GitHub Actions workflow file
```

**Environment variables for Static Web App:**
- Set `REACT_APP_API_URL` = `https://isrm-api.azurewebsites.net/api` in Azure portal → Static Web App → Configuration

---

## Project Structure

```
internal-service-request-manager/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml              # GitHub Actions CI/CD pipeline
│
├── client/                        # React TypeScript frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/                   # Axios API modules
│   │   │   ├── client.ts          # Axios instance + interceptors
│   │   │   ├── authApi.ts
│   │   │   ├── serviceRequestApi.ts
│   │   │   └── usersApi.ts
│   │   ├── components/
│   │   │   ├── common/            # Reusable components (Badge, Modal, etc.)
│   │   │   ├── layout/            # AppLayout, Sidebar
│   │   │   └── requests/          # ServiceRequestForm
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # Global auth state
│   │   ├── hooks/
│   │   │   └── useServiceRequests.ts
│   │   ├── pages/                 # Route-level page components
│   │   ├── styles/
│   │   │   └── main.css
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx                # Router + route definitions
│   │   └── index.tsx
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── server/                        # Node.js Express TypeScript API
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts        # MongoDB connection
│   │   │   └── environment.ts     # Config with validation
│   │   ├── controllers/           # HTTP request handlers
│   │   ├── middleware/
│   │   │   ├── auth.ts            # authenticate + authorize
│   │   │   ├── errorHandler.ts    # Centralised error handling
│   │   │   └── validation.ts      # express-validator rules
│   │   ├── models/                # Mongoose schemas
│   │   ├── repositories/          # Data access layer
│   │   ├── routes/                # Express route definitions
│   │   ├── services/              # Business logic layer
│   │   ├── tests/                 # Jest unit tests
│   │   ├── types/
│   │   │   └── index.ts           # Shared TypeScript types + enums
│   │   ├── utils/
│   │   │   ├── errors.ts          # Custom error classes
│   │   │   ├── logger.ts          # Winston logger
│   │   │   └── response.ts        # Response helpers
│   │   ├── app.ts                 # Express app factory
│   │   └── index.ts               # Server entry point
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docker/
│   └── mongo-init.js              # MongoDB seed script
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Git Workflow

### Initial setup

```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/internal-service-request-manager.git
git add .
git commit -m "feat: initial project scaffold with full-stack ISRM application"
git push -u origin main
```

### Commit message convention (Conventional Commits)

```
feat:     A new feature
fix:      A bug fix
docs:     Documentation changes
style:    Formatting (no logic change)
refactor: Code change that's neither fix nor feat
test:     Adding or modifying tests
chore:    Build process or tooling changes
ci:       CI/CD configuration changes
```

**Examples:**
```bash
git commit -m "feat(auth): add JWT refresh token support"
git commit -m "fix(requests): resolve pagination count off-by-one error"
git commit -m "test(services): add unit tests for service request ownership checks"
git commit -m "ci: add Docker image push to GitHub Container Registry on main"
git commit -m "docs: update Azure deployment steps in README"
```

### Branching strategy

```
main          — Production-ready code only
develop       — Integration branch
feature/*     — Individual features (e.g. feature/add-comments)
fix/*         — Bug fixes
release/*     — Release preparation
```

---

## Future Improvements

- [ ] **Email notifications** — Notify assigned users via SendGrid when request status changes
- [ ] **File attachments** — Upload attachments to Azure Blob Storage
- [ ] **Comment threads** — Conversation history per service request
- [ ] **Audit log** — Immutable history of all changes to a request
- [ ] **Real-time updates** — WebSocket (Socket.io) for live status changes
- [ ] **Dashboard analytics** — Charts with trend data using Chart.js or Recharts
- [ ] **2FA / SSO** — Azure Active Directory integration for enterprise auth
- [ ] **i18n** — Multi-language support
- [ ] **E2E tests** — Playwright or Cypress integration tests
- [ ] **OpenAPI / Swagger** — Auto-generated API documentation
- [ ] **Microservices split** — Separate notification service, auth service
- [ ] **Redis caching** — Cache frequent queries (user list, stats)
- [ ] **Kubernetes** — Helm chart for AKS deployment

---

## Relevance to CubX

This project directly mirrors CubX's technical requirements:

| CubX Requirement | How It's Demonstrated |
|---|---|
| Node.js + Express | REST API built with Express, proper middleware chain, async/await throughout |
| React + TypeScript (strict) | All components in strict TypeScript, no `any`, proper prop types |
| MongoDB | Mongoose ODM with compound indexes, population, aggregation pipeline |
| Docker | Multi-stage Dockerfiles, Docker Compose for local full-stack dev |
| CI/CD (GitHub Actions) | Full pipeline: lint → test → build → Docker push |
| Azure deployment | Detailed App Service + Static Web Apps + Cosmos DB deployment guide |
| RESTful API design | Proper HTTP verbs, status codes, resource naming, pagination |
| Clean architecture | Controller/Service/Repository pattern with clear separation of concerns |
| Scalable code | Rate limiting, indexes, pagination, env-based config, graceful shutdown |
| Internal web application | Directly simulates the kind of internal tooling CubX builds for clients |

---

*Built with ❤️ as a portfolio project demonstrating production-grade full-stack development.*
