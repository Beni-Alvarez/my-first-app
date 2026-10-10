import { z } from 'zod';

const MAX_SHORT_TEXT = 200;
const MAX_LYRICS = 20_000;

export const songInputSchema = z.object({
  title: z
    .string({ error: 'Title is required' })
    .trim()
    .min(1, 'Title is required')
    .max(MAX_SHORT_TEXT),
  artist: z
    .string({ error: 'Artist is required' })
    .trim()
    .min(1, 'Artist is required')
    .max(MAX_SHORT_TEXT),
  // Optional fields: empty string, null or missing all mean "not set" and are stored as null.
  album: z
    .string()
    .trim()
    .max(MAX_SHORT_TEXT)
    .nullish()
    .transform((value) => value || null),
  year: z
    .number({ error: 'Year must be a number' })
    .int('Year must be a whole number')
    .min(1000, 'Year must be 1000 or later')
    .nullish()
    // Checked per request (not at module load) so the limit moves with the calendar.
    .refine((value) => value == null || value <= new Date().getFullYear(), {
      message: 'Year cannot be in the future',
    })
    .transform((value) => value ?? null),
  lyrics: z
    .string({ error: 'Lyrics are required' })
    .trim()
    .min(1, 'Lyrics are required')
    .max(MAX_LYRICS, `Lyrics can be at most ${MAX_LYRICS} characters`),
});

export type SongInput = z.infer<typeof songInputSchema>;
