import { z } from 'zod';
import type { SongInput } from '../types/song';

// Mirrors the server rules (server/src/schemas/song.schema.ts) so users get instant feedback.
// The server still validates everything; its messages are shown too.

/** Raw form state: every input holds a string. */
export interface SongFormValues {
  title: string;
  artist: string;
  album: string;
  year: string;
  lyrics: string;
}

export type SongFormField = keyof SongFormValues;

export const emptySongForm: SongFormValues = {
  title: '',
  artist: '',
  album: '',
  year: '',
  lyrics: '',
};

export const songFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long (max 200)'),
  artist: z.string().trim().min(1, 'Artist is required').max(200, 'Artist is too long (max 200)'),
  album: z
    .string()
    .trim()
    .max(200, 'Album is too long (max 200)')
    .transform((value) => value || null),
  year: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{4}$/.test(value), 'Year must be a 4-digit number')
    .transform((value) => (value === '' ? null : Number(value)))
    .refine(
      (value) => value === null || (value >= 1900 && value <= new Date().getFullYear()),
      'Year must be between 1900 and this year',
    ),
  lyrics: z
    .string()
    .trim()
    .min(1, 'Lyrics are required')
    .max(20_000, 'Lyrics are too long (max 20,000 characters)'),
}) satisfies z.ZodType<SongInput, SongFormValues>;

export function songToFormValues(song: SongInput): SongFormValues {
  return {
    title: song.title,
    artist: song.artist,
    album: song.album ?? '',
    year: song.year === null ? '' : String(song.year),
    lyrics: song.lyrics,
  };
}
