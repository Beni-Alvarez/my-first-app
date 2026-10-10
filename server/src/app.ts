import cors from 'cors';
import express, { type Express } from 'express';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { createSongsRouter } from './routes/songs.routes.js';
import type { SongsService } from './services/songs.service.js';

export interface AppDependencies {
  songsService: SongsService;
}

// Dependencies are passed in so tests can swap the database for an in-memory fake.
export function createApp({ songsService }: AppDependencies): Express {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
  // Lyrics can be up to 20,000 characters; leave room for multi-byte characters.
  app.use(express.json({ limit: '200kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api/songs', createSongsRouter(songsService));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
