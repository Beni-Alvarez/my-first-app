import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { ErrorMessage } from '../components/ErrorMessage';
import { SongForm } from '../components/SongForm';
import ui from '../components/ui.module.css';
import { useCreateSong, useSong, useUpdateSong } from '../hooks/useSongs';
import { songToFormValues } from '../schemas/song-form.schema';

/** Handles both /songs/new (create) and /songs/:id/edit (edit). */
export function SongFormPage() {
  const { id } = useParams();
  // `key` resets the form state when switching between songs.
  return id ? <EditSong key={id} id={id} /> : <NewSong />;
}

function NewSong() {
  const navigate = useNavigate();
  const createSong = useCreateSong();

  return (
    <section>
      <Link to="/" className={ui.backLink}>
        ← All songs
      </Link>
      <h1>New song</h1>
      <SongForm
        submitLabel="Save song"
        cancelTo="/"
        isSubmitting={createSong.isPending}
        submitError={createSong.error}
        onSubmit={(input) =>
          createSong.mutate(input, {
            onSuccess: (song) => navigate(`/songs/${song.id}`, { replace: true }),
          })
        }
      />
    </section>
  );
}

function EditSong({ id }: { id: string }) {
  const navigate = useNavigate();
  const { data: song, isPending, isError, error, refetch } = useSong(id);
  const updateSong = useUpdateSong(id);

  if (isPending) {
    return <p className={ui.muted}>Loading song…</p>;
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <section>
        <Link to="/" className={ui.backLink}>
          ← All songs
        </Link>
        {notFound ? (
          <h1>Song not found</h1>
        ) : (
          <ErrorMessage error={error} onRetry={() => void refetch()} />
        )}
      </section>
    );
  }

  return (
    <section>
      <Link to={`/songs/${id}`} className={ui.backLink}>
        ← Back to song
      </Link>
      <h1>Edit song</h1>
      <SongForm
        initialValues={songToFormValues(song)}
        submitLabel="Save changes"
        cancelTo={`/songs/${id}`}
        isSubmitting={updateSong.isPending}
        submitError={updateSong.error}
        onSubmit={(input) =>
          updateSong.mutate(input, {
            onSuccess: () => navigate(`/songs/${id}`, { replace: true }),
          })
        }
      />
    </section>
  );
}
