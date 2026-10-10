import { Link, Route, Routes } from 'react-router-dom';
import styles from './App.module.css';
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
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}
