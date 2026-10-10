import { Prisma, type PrismaClient, type Song } from '@prisma/client';
import type { SongInput } from '../schemas/song.schema.js';

export type SongSummary = Pick<Song, 'id' | 'title' | 'artist' | 'album' | 'year'>;

export interface SongsService {
  list(): Promise<SongSummary[]>;
  getById(id: string): Promise<Song | null>;
  create(input: SongInput): Promise<Song>;
  /** Returns null when no song has this id. */
  update(id: string, input: SongInput): Promise<Song | null>;
  /** Returns false when no song has this id. */
  remove(id: string): Promise<boolean>;
}

export function createSongsService(prisma: PrismaClient): SongsService {
  return {
    list: () =>
      prisma.song.findMany({
        select: { id: true, title: true, artist: true, album: true, year: true },
        orderBy: [{ artist: 'asc' }, { title: 'asc' }],
      }),

    getById: (id) => prisma.song.findUnique({ where: { id } }),

    create: (input) => prisma.song.create({ data: input }),

    async update(id, input) {
      try {
        return await prisma.song.update({ where: { id }, data: input });
      } catch (error) {
        if (isRecordNotFound(error)) return null;
        throw error;
      }
    },

    async remove(id) {
      try {
        await prisma.song.delete({ where: { id } });
        return true;
      } catch (error) {
        if (isRecordNotFound(error)) return false;
        throw error;
      }
    },
  };
}

function isRecordNotFound(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}
