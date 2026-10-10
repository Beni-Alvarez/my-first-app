// Shapes of the data returned by the server API (dates arrive as ISO strings).

export interface SongSummary {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  year: number | null;
}

export interface Song extends SongSummary {
  lyrics: string;
  createdAt: string;
  updatedAt: string;
}

/** What the API accepts when creating or updating a song. */
export interface SongInput {
  title: string;
  artist: string;
  album: string | null;
  year: number | null;
  lyrics: string;
}
