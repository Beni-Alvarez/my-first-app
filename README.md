# Song Lyrics

A personal web app for keeping the lyrics of songs by my favorite bands and singers.

## Features

- See all saved songs in a table (title, author, year), sorted by artist and then title
- Open a song to read its full lyrics
- Add a new song (title, artist, lyrics, and optionally album and year)
- Edit a song
- Delete a song (after a confirmation)

## Tech stack

- **Frontend:** React 19, Vite, React Router, TanStack Query, CSS Modules
- **Backend:** Node.js, Express 5, Zod validation
- **Database:** PostgreSQL 16 (in Docker), Prisma 6
- **Tooling:** TypeScript (strict), Vitest, React Testing Library, Supertest, ESLint, Prettier

## Getting started

### Requirements

- [Node.js](https://nodejs.org/) 22.12 or newer (24 recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Setup

```powershell
npm install                          # install dependencies
copy .env.example server\.env        # create the server config
docker compose up -d                 # start PostgreSQL
npm run db:migrate                   # create the database tables
npm run db:seed                      # optional: add sample songs
npm run dev                          # start the app
```

Then open http://localhost:5173. The API runs on http://localhost:4000/api.

## Scripts

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the server and client together           |
| `npm run test`      | Run the fast tests (no database needed)        |
| `npm run test:db`   | Run the server tests against the test database |
| `npm run lint`      | Check the code with ESLint                     |
| `npm run typecheck` | Check TypeScript types                         |
| `npm run format`    | Format all files with Prettier                 |
| `npm run build`     | Build for production                           |
| `npm run db:studio` | Open Prisma Studio to browse the data          |

## API

| Method | Path             | Description                    |
| ------ | ---------------- | ------------------------------ |
| GET    | `/api/health`    | Health check                   |
| GET    | `/api/songs`     | List songs (without lyrics)    |
| GET    | `/api/songs/:id` | Get one song, including lyrics |
| POST   | `/api/songs`     | Create a song                  |
| PUT    | `/api/songs/:id` | Update a song                  |
| DELETE | `/api/songs/:id` | Delete a song                  |

## Project structure

```
client/   React app (pages, components, hooks, API calls)
server/   Express API (routes, controllers, services, Prisma schema)
docker/   Database setup script
```

## Note on content

This app is for personal use. It only stores lyrics that you type in yourself, and the sample data uses placeholder text.
