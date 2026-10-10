import { Link, Route, Routes } from 'react-router-dom';
import styles from './App.module.css';
import ui from './components/ui.module.css';
import { SongDetailPage } from './pages/SongDetailPage';
import { SongFormPage } from './pages/SongFormPage';
import { SongListPage } from './pages/SongListPage';

export function App() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          Song Lyrics
        </Link>
      </header>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<SongListPage />} />
          <Route path="/songs/new" element={<SongFormPage />} />
          <Route path="/songs/:id" element={<SongDetailPage />} />
          <Route path="/songs/:id/edit" element={<SongFormPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

function NotFoundPage() {
  return (
    <section>
      <h1>Page not found</h1>
      <Link to="/" className={ui.button}>
        Go to my songs
      </Link>
    </section>
  );
}
