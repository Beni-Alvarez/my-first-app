import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installFakeApi, makeSong } from '../test/fake-api';
import { currentPath, renderApp } from '../test/render-app';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SongListPage', () => {
  it('shows a table of songs sorted by author, then title', async () => {
    installFakeApi([
      makeSong({ id: 'a', artist: 'Zeta Group', title: 'Alpha', year: null }),
      makeSong({ id: 'b', artist: 'Alpha Duo', title: 'Second', year: 2019 }),
      makeSong({ id: 'c', artist: 'Alpha Duo', title: 'First', year: 2020 }),
    ]);

    renderApp('/');

    const table = await screen.findByRole('table');
    const headers = within(table).getAllByRole('columnheader');
    expect(headers.map((header) => header.textContent)).toEqual(['Song Lyrics', 'Author', 'Year']);

    const rows = within(table).getAllByRole('row').slice(1);
    expect(
      rows.map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent),
      ),
    ).toEqual([
      ['First', 'Alpha Duo', '2020'],
      ['Second', 'Alpha Duo', '2019'],
      ['Alpha', 'Zeta Group', '—'],
    ]);
    expect(screen.getByText('3 songs')).toBeInTheDocument();
  });

  it('opens a song when it is clicked', async () => {
    installFakeApi([makeSong({ id: 'song-1', title: 'Sample Song' })]);
    renderApp('/');

    fireEvent.click(await screen.findByRole('link', { name: /Sample Song/ }));

    expect(await screen.findByRole('heading', { name: 'Sample Song' })).toBeInTheDocument();
    expect(currentPath()).toBe('/songs/song-1');
  });

  it('shows an empty state when there are no songs', async () => {
    installFakeApi([]);
    renderApp('/');

    expect(await screen.findByText(/No songs yet/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add a song' })).toHaveAttribute('href', '/songs/new');
  });

  it('shows an error with a retry button when loading fails', async () => {
    const { fetchMock, json } = installFakeApi([makeSong()]);
    fetchMock.mockResolvedValueOnce(json(500, { error: { message: 'Internal server error' } }));

    renderApp('/');

    expect(await screen.findByRole('alert')).toHaveTextContent('Internal server error');

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(screen.getByRole('link', { name: /Sample Song/ })).toBeInTheDocument();
  });
});
