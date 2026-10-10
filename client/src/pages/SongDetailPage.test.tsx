import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installFakeApi, makeSong } from '../test/fake-api';
import { currentPath, renderApp } from '../test/render-app';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('SongDetailPage', () => {
  it('shows the full song with its line breaks preserved', async () => {
    const song = makeSong({ id: 'song-1' });
    installFakeApi([song]);

    renderApp('/songs/song-1');

    expect(await screen.findByRole('heading', { name: 'Sample Song' })).toBeInTheDocument();
    expect(screen.getByText('Example Band')).toBeInTheDocument();
    expect(screen.getByText(/Demo Album · 2020/)).toBeInTheDocument();
    expect(screen.getByTestId('lyrics').textContent).toBe(song.lyrics);
    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/songs/song-1/edit',
    );
  });

  it('shows "Song not found" for an unknown id', async () => {
    installFakeApi([]);
    renderApp('/songs/missing');

    expect(await screen.findByRole('heading', { name: 'Song not found' })).toBeInTheDocument();
  });

  it('deletes the song after confirmation and returns to the list', async () => {
    const { songs } = installFakeApi([makeSong({ id: 'song-1' })]);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderApp('/songs/song-1');

    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }));

    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('Sample Song'));
    expect(await screen.findByText(/No songs yet/)).toBeInTheDocument();
    expect(currentPath()).toBe('/');
    expect(songs.size).toBe(0);
  });

  it('keeps the song when deletion is cancelled', async () => {
    const { songs, fetchMock } = installFakeApi([makeSong({ id: 'song-1' })]);
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderApp('/songs/song-1');

    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }));

    expect(songs.size).toBe(1);
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(currentPath()).toBe('/songs/song-1');
  });

  it('shows an error when deleting fails', async () => {
    const { fetchMock, json } = installFakeApi([makeSong({ id: 'song-1' })]);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderApp('/songs/song-1');
    await screen.findByRole('heading', { name: 'Sample Song' });

    fetchMock.mockResolvedValueOnce(json(500, { error: { message: 'Internal server error' } }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Internal server error');
    expect(currentPath()).toBe('/songs/song-1');
  });
});
