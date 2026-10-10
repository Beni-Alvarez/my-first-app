import { useQuery } from '@tanstack/react-query';
import { getHealth } from '../api/health';

// Placeholder page: will become the song list. For now it shows whether the API is reachable.
export function SongListPage() {
  const health = useQuery({ queryKey: ['health'], queryFn: getHealth });

  return (
    <section>
      <h1>My songs</h1>
      <p>The song list will appear here.</p>
      {health.isPending && <p>Checking API…</p>}
      {health.isError && <p role="alert">API not reachable. Is the server running?</p>}
      {health.isSuccess && <p>API status: {health.data.status}</p>}
    </section>
  );
}
