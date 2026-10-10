import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { ErrorMessage } from '../components/ErrorMessage';
import ui from '../components/ui.module.css';
import { useDeleteSong, useSong } from '../hooks/useSongs';
import styles from './SongDetailPage.module.css';

export function SongDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: song, isPending, isError, error, refetch } = useSong(id);
  const deleteSong = useDeleteSong();

  function handleDelete() {
    if (!song) return;
    if (!window.confirm(`Delete "${song.title}" by ${song.artist}? This cannot be undone.`)) {
      return;
    }
    deleteSong.mutate(song.id, {
      onSuccess: () => navigate('/', { replace: true }),
    });
  }

  const backLink = (
    <Link to="/" className={ui.backLink}>
      ← All songs
    </Link>
  );

  if (isPending) {
    return <p className={ui.muted}>Loading song…</p>;
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <section>
        {backLink}
        {notFound ? (
          <>
            <h1>Song not found</h1>
            <p className={ui.muted}>This song doesn't exist or was deleted.</p>
          </>
        ) : (
          <ErrorMessage error={error} onRetry={() => void refetch()} />
        )}
      </section>
    );
  }

  const details = [song.album, song.year].filter((part) => part != null).join(' · ');

  return (
    <article>
      {backLink}

      <div className={ui.pageHeader}>
        <div>
          <h1>{song.title}</h1>
          <p className={styles.subtitle}>
            {song.artist}
            {details && <span className={ui.muted}> · {details}</span>}
          </p>
        </div>
        <div className={ui.actions}>
          <Link to={`/songs/${song.id}/edit`} className={ui.button}>
            Edit
          </Link>
          <button
            type="button"
            className={`${ui.button} ${ui.danger}`}
            onClick={handleDelete}
            disabled={deleteSong.isPending}
          >
            {deleteSong.isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {deleteSong.isError && (
        <div className={styles.deleteError}>
          <ErrorMessage error={deleteSong.error} />
        </div>
      )}

      <div className={styles.lyrics} data-testid="lyrics">
        {song.lyrics}
      </div>
    </article>
  );
}
