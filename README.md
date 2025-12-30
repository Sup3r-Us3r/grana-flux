# NestJS API Template

A production-ready RESTful API template built with **NestJS** following **Clean Architecture** principles. This template provides a solid foundation for building scalable and maintainable backend applications.

## 🚀 Technologies

| Category | Technology | Description |
|----------|------------|-------------|
| **Runtime** | Node.js 20 (Alpine) | JavaScript runtime |
| **Framework** | NestJS 11 | Progressive Node.js framework |
| **Language** | TypeScript 5.7 | Typed JavaScript superset |
| **Database** | PostgreSQL 15 | Relational database |
| **ORM** | Prisma 7 | Next-generation TypeScript ORM |
| **Cache** | Redis | In-memory data store |
| **Messaging** | RabbitMQ 3 | Message broker |
| **Email** | Nodemailer + React Email | Email sending with React templates |
| **Real-time** | Socket.io | WebSocket library |
| **Documentation** | Swagger + Scalar | API documentation |
| **Testing** | Vitest | Fast unit test framework |
| **Linting** | Biome | Fast formatter and linter |
| **Containerization** | Docker + Docker Compose | Container platform |

## 📁 Project Structure

```
src/
├── main.ts                           # Application entry point
│
├── application/                      # Application Layer (Use Cases)
│   └── use-cases/
│       └── users/
│           ├── create-user/
│           │   ├── create-user-dto.ts
│           │   ├── create-user-use-case.ts
│           │   └── create-user-use-case.spec.ts
│           ├── delete-user/
│           │   ├── delete-user-dto.ts
│           │   ├── delete-user-use-case.ts
│           │   └── delete-user-use-case.spec.ts
│           ├── get-user-by-id/
│           │   ├── get-user-by-id-dto.ts
│           │   ├── get-user-by-id-use-case.ts
│           │   └── get-user-by-id-use-case.spec.ts
│           ├── list-users/
│           │   ├── list-users-dto.ts
│           │   ├── list-users-use-case.ts
│           │   └── list-users-use-case.spec.ts
│           └── update-user/
│               ├── update-user-dto.ts
│               ├── update-user-use-case.ts
│               └── update-user-use-case.spec.ts
│
├── domain/                           # Domain Layer (Business Logic)
│   ├── providers/
│   │   ├── cache-provider.ts         # Cache abstraction interface
│   │   ├── email-provider.ts         # Email abstraction interface
│   │   └── hash-provider.ts          # Hash abstraction interface
│   ├── shared/
│   │   └── value-objects/
│   │       ├── cpf-vo.ts             # CPF value object
│   │       └── email-vo.ts           # Email value object
│   └── users/
│       ├── entities/
│       │   └── user-entity.ts        # User domain entity
│       ├── repositories/
│       │   └── user-repository.ts    # User repository interface
│       └── value-objects/
│           └── address-vo.ts         # Address value object
│
├── infrastructure/                   # Infrastructure Layer (External Services)
│   ├── config/
│   │   └── rabbitmq-config.ts        # RabbitMQ configuration
│   ├── database/
│   │   ├── memory/
│   │   │   └── memory-user-repository.ts
│   │   ├── prisma/
│   │   │   ├── generated/            # Prisma generated client
│   │   │   ├── migrations/           # Database migrations
│   │   │   ├── models/
│   │   │   │   └── user.prisma       # User model schema
│   │   │   ├── prisma-service.ts     # Prisma service
│   │   │   └── schema.prisma         # Main Prisma schema
│   │   └── repositories/
│   │       └── prisma-user-repository.ts
│   ├── email/
│   │   ├── email-template-service.ts
│   │   └── templates/
│   │       └── welcome-email-template.tsx
│   ├── messaging/
│   │   ├── consumers/
│   │   │   └── users/
│   │   │       ├── user-created/
│   │   │       └── user-updated/
│   │   ├── publishers/
│   │   │   └── users/
│   │   │       └── user-events-publisher/
│   │   └── rabbitmq/
│   │       └── rabbitmq-service.ts
│   ├── providers/
│   │   ├── bcrypt-hash-provider.ts   # Bcrypt implementation
│   │   ├── redis-cache-provider.ts   # Redis cache implementation
│   │   └── smtp-email-provider.ts    # SMTP email implementation
│   └── websocket/
│       └── gateways/
│           └── users/
│               ├── user-gateway.ts
│               └── user-gateway-dto.ts
│
├── presentation/                     # Presentation Layer (API)
│   ├── http/
│   │   ├── controllers/
│   │   │   ├── users-controller.ts
│   │   │   └── users-controller-e2e.spec.ts
│   │   └── dtos/
│   │       └── users/
│   │           ├── create-user-dto.ts
│   │           └── update-user-dto.ts
│   └── modules/
│       ├── app-module.ts             # Main application module
│       ├── rabbitmq-module.ts        # RabbitMQ module
│       ├── users-module.ts           # Users feature module
│       └── websocket-module.ts       # WebSocket module
│
└── shared/                           # Shared Utilities
    ├── exceptions/
    │   ├── domain-exception.ts
    │   ├── internal-server-error-exception.ts
    │   ├── not-found-exception.ts
    │   └── validation-exception.ts
    ├── types/
    │   └── pagination-type.ts
    └── utils/
        └── dto-validator.ts
```

## ⚙️ Environment Variables

Create a `.env` file in the project root based on `.env.example`:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | API server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@postgres:5432/api?schema=public` |
| `E2E_DATABASE_URL` | E2E test database connection | `postgresql://postgres:postgres@postgres:5432/api_e2e?schema=public` |
| `POSTGRES_USER` | PostgreSQL username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres` |
| `POSTGRES_DB` | PostgreSQL database name | `api` |
| `RABBITMQ_URI` | RabbitMQ connection URI | `amqp://guest:guest@rabbitmq:5672` |
| `REDIS_HOST` | Redis host | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `SMTP_HOST` | SMTP server host | `smtp4dev` |
| `SMTP_PORT` | SMTP server port | `25` |
| `SMTP_FROM` | Default "from" email address | `noreply@api.com` |

## 🛠️ Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [npm](https://www.npmjs.com/)

### Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nestjs-api-template
   ```

2. **Copy environment variables**

   ```bash
   cp .env.example .env
   ```

3. **Start the development environment with Docker**

   ```bash
   docker-compose up -d
   ```

   This command will start all required services:
   - **API** on port `3000`
   - **PostgreSQL** on port `5432`
   - **Redis** on port `6379`
   - **RabbitMQ** on ports `5672` (AMQP) and `15672` (Management UI)
   - **SMTP4Dev** on port `8080` (Web UI) and `2525` (SMTP)

4. **Access the application**

   - API: http://localhost:3000
   - Swagger UI: http://localhost:3000/docs/swagger
   - Scalar API Reference: http://localhost:3000/docs
   - RabbitMQ Management: http://localhost:15672 (guest/guest)
   - SMTP4Dev: http://localhost:8080

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build the application for production |
| `npm run start` | Start the application |
| `npm run start:dev` | Start in development mode with hot reload |
| `npm run start:debug` | Start in debug mode with hot reload |
| `npm run start:prod` | Start the production build |
| `npm run lint` | Run Biome linter with auto-fix |
| `npm run format` | Format code with Biome |
| `npm run check` | Run Biome check with auto-fix |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:cov` | Run tests with coverage |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run db:studio` | Open Prisma Studio |

## 🏗️ Building for Production

### Option 1: Docker (Recommended)

1. **Build the production Docker image**

   ```bash
   docker build --target production -t nestjs-api:latest .
   ```

2. **Run the production container**

   ```bash
   docker run -d \
     -p 3000:3000 \
     -e DATABASE_URL="postgresql://user:password@host:5432/db?schema=public" \
     -e E2E_DATABASE_URL="postgresql://user:password@host:5432/api_e2e?schema=public" \
     -e RABBITMQ_URI="amqp://user:password@host:5672" \
     -e REDIS_HOST="redis-host" \
     -e REDIS_PORT=6379 \
     -e SMTP_HOST="smtp-host" \
     -e SMTP_PORT=587 \
     -e SMTP_FROM="noreply@yourdomain.com" \
     nestjs-api:latest
   ```

   The production image automatically:
   - Runs Prisma migrations (`prisma migrate deploy`)
   - Starts the Node.js server

### Option 2: Manual Build

1. **Install dependencies**

   ```bash
   npm ci
   ```

2. **Generate Prisma client**

   ```bash
   npx prisma generate
   ```

3. **Build the application**

   ```bash
   npm run build
   ```

4. **Run database migrations**

   ```bash
   npx prisma migrate deploy
   ```

5. **Start the production server**

   ```bash
   npm run start:prod
   ```

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

## 📚 API Documentation

Once the application is running, you can access the API documentation at:

- **Swagger UI**: http://localhost:3000/docs/swagger
- **Scalar API Reference**: http://localhost:3000/docs

## 🏛️ Architecture

This project follows **Clean Architecture** principles, separating the codebase into distinct layers:

| Layer | Description |
|-------|-------------|
| **Domain** | Contains business entities, value objects, and repository interfaces. This layer has no dependencies on external frameworks. |
| **Application** | Contains use cases that orchestrate the flow of data and implement business rules using domain entities. |
| **Infrastructure** | Contains implementations of interfaces defined in the domain layer (repositories, providers) and external service integrations. |
| **Presentation** | Contains HTTP controllers, DTOs, and NestJS modules that expose the API endpoints. |
| **Shared** | Contains shared utilities, exceptions, and types used across all layers. |

## 📄 License

This project is licensed under the MIT License.
