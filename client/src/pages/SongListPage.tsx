import { Link } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage';
import ui from '../components/ui.module.css';
import { useSongs } from '../hooks/useSongs';
import styles from './SongListPage.module.css';

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

      {/* The API already sorts by artist, then title. */}
      {songs && songs.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Song Lyrics</th>
              <th scope="col">Author</th>
              <th scope="col" className={styles.year}>
                Year
              </th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr key={song.id}>
                <td>
                  <Link to={`/songs/${song.id}`} className={styles.songLink}>
                    {song.title}
                  </Link>
                </td>
                <td>{song.artist}</td>
                <td className={styles.year}>{song.year ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
