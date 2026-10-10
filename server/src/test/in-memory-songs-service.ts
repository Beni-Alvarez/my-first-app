import type { Song } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { SongsService } from '../services/songs.service.js';

// Test double for SongsService: same behavior as the Prisma version, but stored in a Map.
export function createInMemorySongsService(): SongsService {
  const songs = new Map<string, Song>();

  return {
    async list() {
      return [...songs.values()]
        .sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title))
        .map(({ id, title, artist, album, year }) => ({ id, title, artist, album, year }));
    },

    async getById(id) {
      return songs.get(id) ?? null;
    },

    async create(input) {
      const now = new Date();
      const song: Song = { id: randomUUID(), ...input, createdAt: now, updatedAt: now };
      songs.set(song.id, song);
      return song;
    },

    async update(id, input) {
      const existing = songs.get(id);
      if (!existing) return null;
      const song: Song = { ...existing, ...input, updatedAt: new Date() };
      songs.set(id, song);
      return song;
    },

    async remove(id) {
      return songs.delete(id);
    },
  };
}
