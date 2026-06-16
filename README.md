# Event App — Backend

Express.js + TypeScript API with MongoDB.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Yarn](https://yarnpkg.com/)
- [Homebrew](https://brew.sh/) (for local MongoDB)

## Local MongoDB (Homebrew)

```bash
# One-time setup
brew tap mongodb/brew
brew trust mongodb/brew
brew install mongodb-community@8.0

# Start MongoDB (runs in background, restarts on login)
brew services start mongodb/brew/mongodb-community@8.0

# Stop when needed
brew services stop mongodb/brew/mongodb-community@8.0
```

Default connection: `mongodb://127.0.0.1:27017/event_app`

Verify MongoDB is running:

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

## Setup

```bash
yarn install
cp .env.example .env   # adjust values if needed
```

## Development

```bash
yarn dev
```

API runs at [http://localhost:3000](http://localhost:3000).

| Endpoint          | Description              |
|-------------------|--------------------------|
| `GET /`           | API welcome              |
| `GET /health`     | Health + DB status       |
| `GET /openapi.json` | OpenAPI spec (JSON)    |
| `GET /api-docs`   | Swagger UI               |

## OpenAPI contract

The backend owns the API contract. Route handlers are annotated with `@openapi` JSDoc; the spec is generated from code:

```bash
yarn openapi:generate   # writes openapi/openapi.json
```

This runs automatically on every commit (via Husky) so the committed spec stays in sync with the routes.

The frontend generates TypeScript types from `openapi/openapi.json` with `npm run api:types`.

## Production build

```bash
yarn build
yarn start
```

## Project structure

```
src/
  config/       # env & database
  openapi/      # shared schemas & swagger-jsdoc config
  routes/       # Express routers
  app.ts        # Express app setup
  index.ts      # entry point
openapi/
  openapi.json  # generated API contract (committed, auto-updated on commit)
scripts/
  generate-openapi.ts
```
