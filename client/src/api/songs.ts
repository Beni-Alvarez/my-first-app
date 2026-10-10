import type { Song, SongInput, SongSummary } from '../types/song';
import { apiRequest } from './client';

const songPath = (id: string) => `/songs/${encodeURIComponent(id)}`;

export const songsApi = {
  list: () => apiRequest<SongSummary[]>('/songs'),

  get: (id: string) => apiRequest<Song>(songPath(id)),

  create: (input: SongInput) =>
    apiRequest<Song>('/songs', { method: 'POST', body: JSON.stringify(input) }),

  update: (id: string, input: SongInput) =>
    apiRequest<Song>(songPath(id), { method: 'PUT', body: JSON.stringify(input) }),

  remove: (id: string) => apiRequest<void>(songPath(id), { method: 'DELETE' }),
};
