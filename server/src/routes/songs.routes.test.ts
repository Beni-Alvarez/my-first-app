import type { Express } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createInMemorySongsService } from '../test/in-memory-songs-service.js';

// Placeholder text only — never use real song lyrics in tests.
const validSong = {
  title: 'Sample Song',
  artist: 'Example Band',
  album: 'Demo Album',
  year: 2020,
  lyrics: 'First placeholder line\nSecond placeholder line',
};

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

describe('/api/songs', () => {
  let app: Express;

  beforeEach(() => {
    app = createApp({ songsService: createInMemorySongsService() });
  });

  async function createSong(overrides: Record<string, unknown> = {}) {
    const res = await request(app)
      .post('/api/songs')
      .send({ ...validSong, ...overrides });
    expect(res.status).toBe(201);
    return res.body;
  }

  describe('GET /api/songs', () => {
    it('returns an empty list when there are no songs', async () => {
      const res = await request(app).get('/api/songs');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns songs sorted by artist then title, without lyrics', async () => {
      await createSong({ artist: 'Zeta Group', title: 'Alpha' });
      await createSong({ artist: 'Alpha Duo', title: 'Second' });
      await createSong({ artist: 'Alpha Duo', title: 'First' });

      const res = await request(app).get('/api/songs');

      expect(res.status).toBe(200);
      expect(res.body.map((s: { artist: string; title: string }) => [s.artist, s.title])).toEqual([
        ['Alpha Duo', 'First'],
        ['Alpha Duo', 'Second'],
        ['Zeta Group', 'Alpha'],
      ]);
      expect(res.body[0]).not.toHaveProperty('lyrics');
    });
  });

  describe('GET /api/songs/:id', () => {
    it('returns the full song including lyrics', async () => {
      const created = await createSong();

      const res = await request(app).get(`/api/songs/${created.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(validSong);
    });

    it('returns 404 for an unknown id', async () => {
      const res = await request(app).get(`/api/songs/${UNKNOWN_ID}`);
      expect(res.status).toBe(404);
      expect(res.body.error.message).toContain('Song not found');
    });
  });

  describe('POST /api/songs', () => {
    it('creates a song and returns it with an id and timestamps', async () => {
      const res = await request(app).post('/api/songs').send(validSong);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject(validSong);
      expect(res.body.id).toEqual(expect.any(String));
      expect(res.body.createdAt).toEqual(expect.any(String));
    });

    it('trims text fields and stores missing or empty optional fields as null', async () => {
      const res = await request(app)
        .post('/api/songs')
        .send({ title: '  Sample Song  ', artist: ' Example Band ', album: '', lyrics: ' Text ' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        title: 'Sample Song',
        artist: 'Example Band',
        album: null,
        year: null,
        lyrics: 'Text',
      });
    });

    it('ignores fields that are not part of a song', async () => {
      const res = await request(app)
        .post('/api/songs')
        .send({ ...validSong, id: 'my-own-id', createdAt: '2000-01-01' });

      expect(res.status).toBe(201);
      expect(res.body.id).not.toBe('my-own-id');
    });

    it.each([
      ['title is missing', { title: undefined }, 'title'],
      ['title is only whitespace', { title: '   ' }, 'title'],
      ['artist is missing', { artist: undefined }, 'artist'],
      ['lyrics are missing', { lyrics: undefined }, 'lyrics'],
      ['title is too long', { title: 'a'.repeat(201) }, 'title'],
      ['lyrics are too long', { lyrics: 'a'.repeat(20_001) }, 'lyrics'],
      ['year is before 1900', { year: 1899 }, 'year'],
      ['year is in the future', { year: new Date().getFullYear() + 1 }, 'year'],
      ['year is not a whole number', { year: 2020.5 }, 'year'],
      ['year is a string', { year: '2020' }, 'year'],
    ])('returns 400 when %s', async (_case, overrides, field) => {
      const res = await request(app)
        .post('/api/songs')
        .send({ ...validSong, ...overrides });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Validation failed');
      expect(res.body.error.details.fieldErrors).toHaveProperty(field);
    });

    it('returns 400 for malformed JSON', async () => {
      const res = await request(app)
        .post('/api/songs')
        .set('Content-Type', 'application/json')
        .send('{"title": ');

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Request body is not valid JSON');
    });
  });

  describe('PUT /api/songs/:id', () => {
    it('updates a song', async () => {
      const created = await createSong();
      const changes = { ...validSong, title: 'Renamed Song', year: null };

      const res = await request(app).put(`/api/songs/${created.id}`).send(changes);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: created.id, title: 'Renamed Song', year: null });

      const fetched = await request(app).get(`/api/songs/${created.id}`);
      expect(fetched.body.title).toBe('Renamed Song');
    });

    it('returns 404 for an unknown id', async () => {
      const res = await request(app).put(`/api/songs/${UNKNOWN_ID}`).send(validSong);
      expect(res.status).toBe(404);
    });

    it('returns 400 for invalid data', async () => {
      const created = await createSong();
      const res = await request(app)
        .put(`/api/songs/${created.id}`)
        .send({ ...validSong, title: '' });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/songs/:id', () => {
    it('deletes a song', async () => {
      const created = await createSong();

      const res = await request(app).delete(`/api/songs/${created.id}`);

      expect(res.status).toBe(204);
      const fetched = await request(app).get(`/api/songs/${created.id}`);
      expect(fetched.status).toBe(404);
    });

    it('returns 404 for an unknown id', async () => {
      const res = await request(app).delete(`/api/songs/${UNKNOWN_ID}`);
      expect(res.status).toBe(404);
    });
  });
});
