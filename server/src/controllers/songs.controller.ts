import type { RequestHandler } from 'express';
import { HttpError } from '../middleware/error-handler.js';
import type { SongInput } from '../schemas/song.schema.js';
import type { SongsService } from '../services/songs.service.js';

type IdParams = { id: string };

// Express 5 forwards rejected promises to the error handler, so no try/catch is needed here.
export function createSongsController(service: SongsService) {
  const songNotFound = (id: string) => new HttpError(404, `Song not found: ${id}`);

  const list: RequestHandler = async (_req, res) => {
    res.json(await service.list());
  };

  const get: RequestHandler<IdParams> = async (req, res) => {
    const song = await service.getById(req.params.id);
    if (!song) throw songNotFound(req.params.id);
    res.json(song);
  };

  const create: RequestHandler<Record<string, never>, unknown, SongInput> = async (req, res) => {
    res.status(201).json(await service.create(req.body));
  };

  const update: RequestHandler<IdParams, unknown, SongInput> = async (req, res) => {
    const song = await service.update(req.params.id, req.body);
    if (!song) throw songNotFound(req.params.id);
    res.json(song);
  };

  const remove: RequestHandler<IdParams> = async (req, res) => {
    const deleted = await service.remove(req.params.id);
    if (!deleted) throw songNotFound(req.params.id);
    res.status(204).end();
  };

  return { list, get, create, update, remove };
}
