# Go2Img
Labeling tool for images.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React Router v7](https://reactrouter.com/) (formerly Remix) |
| **Language** | [TypeScript](https://typescriptlang.org) |
| **UI Library** | [Mantine v8](https://mantine.dev/) |
| **Canvas** | [Konva](https://konvajs.org/) + [react-konva](https://github.com/konvajs/react-konva) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + CSS Modules |
| **Database** | [PostgreSQL 15](https://www.postgresql.org/) |
| **ORM** | [Prisma v7](https://prisma.io) with `@prisma/adapter-pg` |
| **Auth** | [Better Auth](https://www.better-auth.com/) |
| **State** | [XState Store](https://xstate.js.org/docs/packages/xstate-store/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Storage** | Cloudflare R2 (via [aws4fetch](https://github.com/mhart/aws4fetch)) |
| **OG Images** | [Satori](https://github.com/vercel/satori) |
| **Rich Text** | [Tiptap](https://tiptap.dev/) |
| **Build** | [Vite](https://vitejs.dev/) |
| **Testing** | [Vitest](https://vitest.dev/) · [Cypress](https://cypress.io) |
| **Deployment** | [Docker](https://www.docker.com/) |

## Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL 15 (or use Docker)

### 1. Install dependencies

```sh
npm install
```

### 2. Set up environment variables

```sh
cp .env.example .env
```

Fill in the required values:

```env
DATABASE_URL="postgresql://postgres:prisma@localhost:5432/postgres"
SESSION_SECRET="your-session-secret"
BETTER_AUTH_SECRET="your-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. Start the database

Using Docker:

```sh
docker compose -f docker-compose.postgres.yml up -d
```

### 4. Run migrations

```sh
npm run db:deploy
```

### 5. Start the dev server

```sh
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Docker Deployment

Build and run the full stack (app + Postgres) with Docker Compose:

```sh
docker compose up --build
```

The app is exposed on port `3002` and connects to a Postgres container. Migrations run automatically at startup.


## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:deploy` | Run Prisma migrations + generate client |
| `npm run typecheck` | Type-check the project |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:e2e:dev` | Run E2E tests (Cypress) |

## Project Structure

```
app/
├── actions/        # Server actions
├── api/            # API routes
├── components/     # UI components
├── lib/            # Shared utilities & auth config
├── models/         # Prisma data access layer
├── routes/         # Route modules
├── server/         # Server-side logic
└── static/         # Static assets
prisma/             # Schema & migrations
```

## License

Private 
