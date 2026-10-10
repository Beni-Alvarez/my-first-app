import { Router } from 'express';
import { createSongsController } from '../controllers/songs.controller.js';
import { validateBody } from '../middleware/validate.js';
import { songInputSchema } from '../schemas/song.schema.js';
import type { SongsService } from '../services/songs.service.js';

export function createSongsRouter(service: SongsService): Router {
  const controller = createSongsController(service);
  const router = Router();

  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', validateBody(songInputSchema), controller.create);
  router.put('/:id', validateBody(songInputSchema), controller.update);
  router.delete('/:id', controller.remove);

  return router;
}
