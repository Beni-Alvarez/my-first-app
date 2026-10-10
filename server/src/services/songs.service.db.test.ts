import { PrismaClient } from '@prisma/client';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import type { SongInput } from '../schemas/song.schema.js';
import { createSongsService } from './songs.service.js';

const prisma = new PrismaClient({ datasourceUrl: process.env.TEST_DATABASE_URL });
const service = createSongsService(prisma);

// Placeholder text only — never use real song lyrics in tests.
const input: SongInput = {
  title: 'Sample Song',
  artist: 'Example Band',
  album: null,
  year: 2020,
  lyrics: 'First placeholder line\nSecond placeholder line',
};

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

describe('songs service (PostgreSQL)', () => {
  beforeEach(async () => {
    await prisma.song.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a song and reads it back', async () => {
    const created = await service.create(input);

    expect(created).toMatchObject(input);
    expect(await service.getById(created.id)).toEqual(created);
  });

  it('lists songs sorted by artist then title, without lyrics', async () => {
    await service.create({ ...input, artist: 'Zeta Group', title: 'Alpha' });
    await service.create({ ...input, artist: 'Alpha Duo', title: 'Second' });
    await service.create({ ...input, artist: 'Alpha Duo', title: 'First' });

    const songs = await service.list();

    expect(songs.map((s) => [s.artist, s.title])).toEqual([
      ['Alpha Duo', 'First'],
      ['Alpha Duo', 'Second'],
      ['Zeta Group', 'Alpha'],
    ]);
    expect(songs[0]).not.toHaveProperty('lyrics');
  });

  it('updates a song', async () => {
    const created = await service.create(input);

    const updated = await service.update(created.id, { ...input, title: 'Renamed Song' });

    expect(updated?.title).toBe('Renamed Song');
    expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
  });

  it('deletes a song', async () => {
    const created = await service.create(input);

    expect(await service.remove(created.id)).toBe(true);
    expect(await service.getById(created.id)).toBeNull();
  });

  it('returns null / false for unknown ids', async () => {
    expect(await service.getById(UNKNOWN_ID)).toBeNull();
    expect(await service.update(UNKNOWN_ID, input)).toBeNull();
    expect(await service.remove(UNKNOWN_ID)).toBe(false);
  });
});
