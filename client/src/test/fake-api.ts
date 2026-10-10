import { vi } from 'vitest';
import type { Song, SongInput } from '../types/song';

// Placeholder text only — never use real song lyrics in tests.
export function makeSong(overrides: Partial<Song> = {}): Song {
  return {
    id: 'song-1',
    title: 'Sample Song',
    artist: 'Example Band',
    album: 'Demo Album',
    year: 2020,
    lyrics: 'First placeholder line\nSecond placeholder line\n\nPlaceholder chorus',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Replaces global fetch with an in-memory version of the songs API.
 * Use `fetchMock.mockResolvedValueOnce(...)` to simulate a specific server response.
 */
export function installFakeApi(initialSongs: Song[] = []) {
  const songs = new Map(initialSongs.map((song) => [song.id, song]));
  let nextId = 1;

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const { pathname } = new URL(String(input), 'http://localhost');
    const method = init.method ?? 'GET';
    const match = pathname.match(/^\/api\/songs(?:\/([^/]+))?$/);
    if (!match) return json(404, { error: { message: 'Route not found' } });

    const id = match[1] ? decodeURIComponent(match[1]) : undefined;
    const body = init.body ? (JSON.parse(String(init.body)) as SongInput) : undefined;
    const notFound = () => json(404, { error: { message: `Song not found: ${id}` } });

    if (!id && method === 'GET') {
      const list = [...songs.values()]
        .sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title))
        .map(({ id, title, artist, album, year }) => ({ id, title, artist, album, year }));
      return json(200, list);
    }
    if (!id && method === 'POST' && body) {
      const song = makeSong({ ...body, id: `new-${nextId++}` });
      songs.set(song.id, song);
      return json(201, song);
    }
    if (id && method === 'GET') {
      const song = songs.get(id);
      return song ? json(200, song) : notFound();
    }
    if (id && method === 'PUT' && body) {
      const existing = songs.get(id);
      if (!existing) return notFound();
      const song = { ...existing, ...body };
      songs.set(id, song);
      return json(200, song);
    }
    if (id && method === 'DELETE') {
      return songs.delete(id) ? json(204) : notFound();
    }
    return json(400, { error: { message: 'Unsupported request in fake API' } });
  });

  vi.stubGlobal('fetch', fetchMock);
  return { songs, fetchMock, json };
}
