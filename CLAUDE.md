# CLAUDE.md

This file gives Claude Code guidance on working in this repository.

## Project overview

**Song Lyrics** is a personal full-stack web app for keeping the lyrics of songs by my favorite bands and singers.

Core features (MVP):

1. **List** all saved songs (title + artist), sorted by artist and then title.
2. **View** a song: clicking a song in the list opens its full text.
3. **Create** a new song (title, artist, lyrics, optional album/year).
4. **Edit** an existing song.
5. **Delete** a song (with a confirmation dialog).

Out of scope for now: user accounts/auth, sharing, importing lyrics from external sites. Ask before adding any of these.

## Tech stack

| Layer       | Technology                                                           |
| ----------- | -------------------------------------------------------------------- |
| Language    | TypeScript 6.0 (strict mode) everywhere                              |
| Frontend    | React 19 + Vite, React Router, TanStack Query for server state       |
| Styling     | CSS Modules (no UI framework unless agreed)                          |
| Backend     | Node.js 22.12+ (24 recommended) + Express 5                          |
| Database    | PostgreSQL 16 (run locally through Docker Compose)                   |
| ORM         | Prisma 6 (schema, migrations, client)                                |
| Validation  | Zod (request bodies on the server, forms on the client)              |
| Testing     | Vitest + React Testing Library (client), Vitest + Supertest (server) |
| Lint/format | ESLint + Prettier                                                    |

## Repository structure

npm workspaces monorepo:

```
my-first-app/
├── CLAUDE.md
├── package.json            # root: workspaces + shared scripts
├── docker-compose.yml      # PostgreSQL service
├── .env.example            # template for env vars (commit this, never .env)
├── client/                 # React app (Vite)
│   └── src/
│       ├── api/            # typed fetch functions for the REST API
│       ├── components/     # reusable UI components
│       ├── pages/          # SongListPage, SongDetailPage, SongFormPage
│       ├── hooks/          # TanStack Query hooks (useSongs, useSong, ...)
│       └── types/
└── server/                 # Express API
    ├── prisma/
    │   ├── schema.prisma
    │   ├── migrations/
    │   └── seed.ts
    └── src/
        ├── index.ts        # app bootstrap
        ├── app.ts          # express app (exported for tests)
        ├── routes/         # songs.routes.ts
        ├── controllers/    # request/response handling
        ├── services/       # business logic + Prisma calls
        ├── schemas/        # Zod schemas
        └── middleware/     # error handler, validation
```

## Data model

```prisma
model Song {
  id        String   @id @default(uuid())
  title     String
  artist    String
  album     String?
  year      Int?
  lyrics    String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([artist, title])
}
```

Any schema change must go through a Prisma migration (`npm run db:migrate`). Never edit the database by hand.

## REST API

Base URL: `http://localhost:4000/api`

| Method | Path         | Description                                                | Success   |
| ------ | ------------ | ---------------------------------------------------------- | --------- |
| GET    | `/songs`     | List songs (id, title, artist, album, year; **no lyrics**) | 200       |
| GET    | `/songs/:id` | Full song including lyrics                                 | 200 / 404 |
| POST   | `/songs`     | Create a song                                              | 201       |
| PUT    | `/songs/:id` | Update a song                                              | 200 / 404 |
| DELETE | `/songs/:id` | Delete a song                                              | 204 / 404 |

- Validate every request body with Zod. Invalid input returns `400` with `{ error: { message, details } }`.
- All errors go through one central error-handling middleware. Never leak stack traces in responses.
- Validation rules: `title` and `artist` are required, trimmed, 1–200 chars. `lyrics` is required, max 20,000 chars. `year` is optional, 1900 to the current year.

## Frontend routes

| Route             | Page                                                          |
| ----------------- | ------------------------------------------------------------- |
| `/`               | Song list (grouped/sorted by artist) with a "New song" button |
| `/songs/new`      | Create form                                                   |
| `/songs/:id`      | Song detail: full lyrics, Edit and Delete buttons             |
| `/songs/:id/edit` | Edit form (same component as create)                          |

UI rules: show lyrics with preserved line breaks (`white-space: pre-wrap`). Show loading and error states for every query. Ask for confirmation before deleting. Invalidate the `songs` queries after every mutation.

## Commands

Run from the repository root (Windows / PowerShell). First-time setup: install [Docker Desktop](https://www.docker.com/products/docker-desktop/), then copy `.env.example` to `server/.env`.

```powershell
npm install               # install all workspaces
docker compose up -d      # start PostgreSQL
npm run db:migrate        # apply Prisma migrations (prisma migrate dev)
npm run db:seed           # insert sample data
npm run db:studio         # open Prisma Studio to browse data
npm run dev               # start server (:4000) and client (:5173) together
npm run test              # run all tests
npm run lint              # ESLint
npm run typecheck         # tsc --noEmit in all workspaces
npm run build             # production build
```

## Environment variables

Defined in `server/.env` (copy from `.env.example`):

```
DATABASE_URL="postgresql://songs:songs@localhost:5432/songs?schema=public"
PORT=4000
CORS_ORIGIN=http://localhost:5173
```

Never commit `.env` files or real credentials.

## Tooling notes

- TypeScript is pinned to 6.0.x because typescript-eslint does not support TypeScript 7 yet. Don't upgrade it without checking.
- Prisma is pinned to v6 (classic `prisma-client-js` generator, `url = env("DATABASE_URL")`). Moving to Prisma 7 is a deliberate migration. Ask first.
- npm blocks dependency install scripts by default. New packages that need one (like Prisma or esbuild) must be approved with `npm install-scripts approve <pkg>`.
- During development, Vite forwards `/api` requests to the server (`client/vite.config.ts`), so the client calls relative URLs like `/api/songs`.

## Coding conventions

- TypeScript `strict: true`. Avoid `any`. Prefer explicit return types on exported functions.
- Use functional React components with hooks only. One component per file, named in PascalCase.
- Keep layers separate on the server: routes → controllers → services → Prisma. Controllers never call Prisma directly.
- Use `async/await`. Don't leave promises unhandled.
- Name files in kebab-case or `name.role.ts` (e.g. `songs.service.ts`). Name components in PascalCase (`SongList.tsx`).
- Keep functions small and code self-explanatory. Add comments only where the _why_ isn't obvious.
- Format with Prettier: 2 spaces, single quotes, semicolons.

## Content & copyright

- Seed data, tests and examples must use **placeholder or self-written text** (e.g. "Line one of a sample verse"). Never insert real, copyrighted song lyrics.
- The app only stores text that the user types in for personal use. Don't add features that scrape or fetch lyrics from external websites.

## Testing

- Server: integration tests for every endpoint with Supertest, against a separate test database (`DATABASE_URL` in `.env.test`).
- Client: component tests for the list, detail and form pages, with the API mocked.
- New features and bug fixes come with tests. Run `npm run test` and `npm run typecheck` before you call a task done.

## Workflow for Claude

- Build in small, working increments. Suggested order: (1) monorepo scaffolding, (2) Docker + Prisma schema + migration, (3) API + tests, (4) React pages, (5) polish.
- After changes, run lint, typecheck and tests, and report the real results.
- Explain what you did in beginner-friendly terms: this is the owner's first app.
- Ask before adding new dependencies, changing the data model, or making architectural changes.
- Never commit secrets. Commit only when asked, using clear messages (e.g. `feat: add song edit page`).
