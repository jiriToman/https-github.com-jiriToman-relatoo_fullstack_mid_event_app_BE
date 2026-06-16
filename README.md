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

### Seed sample data

To start dev with 20 sample events (replaces existing events in the DB):

```bash
yarn dev:generateEvents
```

### API reference

Endpoints, request/response schemas, and the `Event` model are defined in the OpenAPI contract:

- **JSON spec:** [http://localhost:3000/openapi.json](http://localhost:3000/openapi.json)
- **Committed spec:** [`openapi/openapi.json`](openapi/openapi.json)

## Scripts

| Command                  | Description                              |
|--------------------------|------------------------------------------|
| `yarn dev`               | Start dev server with hot reload         |
| `yarn dev:generateEvents`| Dev server + seed 20 sample events       |
| `yarn build`             | Generate OpenAPI spec and compile TS     |
| `yarn start`             | Run production build                     |
| `yarn typecheck`         | Type-check without emitting              |
| `yarn openapi:generate`  | Write `openapi/openapi.json` from code   |

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
  config/         # env & database
  models/         # Mongoose models
  openapi/        # shared schemas & swagger-jsdoc config
  routes/         # Express routers (events, openapi)
  scripts/        # dev utilities (event seeding)
  app.ts          # Express app setup
  index.ts        # entry point
openapi/
  openapi.json    # generated API contract (committed, auto-updated on commit)
scripts/
  generate-openapi.ts
```
