import { Link } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage';
import ui from '../components/ui.module.css';
import { useSongs } from '../hooks/useSongs';
import type { SongSummary } from '../types/song';
import styles from './SongListPage.module.css';

// The API already sorts by artist, then title, so songs of one artist are next to each other.
function groupByArtist(songs: SongSummary[]): [string, SongSummary[]][] {
  const groups = new Map<string, SongSummary[]>();
  for (const song of songs) {
    const group = groups.get(song.artist) ?? [];
    group.push(song);
    groups.set(song.artist, group);
  }
  return [...groups.entries()];
}

function songDetails(song: SongSummary): string {
  return [song.album, song.year].filter((part) => part != null).join(' · ');
}

export function SongListPage() {
  const { data: songs, isPending, isError, error, refetch } = useSongs();

  return (
    <section>
      <div className={ui.pageHeader}>
        <div>
          <h1>My songs</h1>
          {songs && songs.length > 0 && (
            <p className={`${styles.count} ${ui.muted}`}>
              {songs.length} {songs.length === 1 ? 'song' : 'songs'}
            </p>
          )}
        </div>
        <Link to="/songs/new" className={`${ui.button} ${ui.primary}`}>
          New song
        </Link>
      </div>

      {isPending && <p className={ui.muted}>Loading songs…</p>}

      {isError && <ErrorMessage error={error} onRetry={() => void refetch()} />}

      {songs && songs.length === 0 && (
        <div className={styles.empty}>
          <p>No songs yet. Add the first one!</p>
          <Link to="/songs/new" className={`${ui.button} ${ui.primary}`}>
            Add a song
          </Link>
        </div>
      )}

      {songs &&
        groupByArtist(songs).map(([artist, artistSongs], index) => (
          // Index-based id: aria-labelledby treats spaces in an id as separators.
          <section key={artist} className={styles.group} aria-labelledby={`artist-${index}`}>
            <h2 id={`artist-${index}`} className={styles.artist}>
              {artist}
            </h2>
            <ul className={styles.list}>
              {artistSongs.map((song) => (
                <li key={song.id}>
                  <Link to={`/songs/${song.id}`} className={styles.songLink}>
                    <span className={styles.songTitle}>{song.title}</span>
                    <span className={ui.muted}>{songDetails(song)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </section>
  );
}
