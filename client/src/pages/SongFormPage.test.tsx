import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installFakeApi, makeSong } from '../test/fake-api';
import { currentPath, renderApp } from '../test/render-app';

afterEach(() => {
  vi.unstubAllGlobals();
});

function fill(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe('SongFormPage — create', () => {
  it('creates a song and shows it', async () => {
    const { songs } = installFakeApi([]);
    renderApp('/songs/new');

    fill(/Title/, '  New Sample  ');
    fill(/Artist/, 'Example Band');
    fill(/Year/, '2021');
    fill(/Lyrics/, 'Placeholder line one\nPlaceholder line two');
    fireEvent.click(screen.getByRole('button', { name: 'Save song' }));

    expect(await screen.findByRole('heading', { name: 'New Sample' })).toBeInTheDocument();
    expect(currentPath()).toMatch(/^\/songs\/new-\d+$/);
    expect([...songs.values()][0]).toMatchObject({
      title: 'New Sample',
      artist: 'Example Band',
      album: null,
      year: 2021,
      lyrics: 'Placeholder line one\nPlaceholder line two',
    });
  });

  it('shows validation errors and does not call the API', async () => {
    const { fetchMock } = installFakeApi([]);
    renderApp('/songs/new');

    fill(/Year/, '0999');
    fireEvent.click(screen.getByRole('button', { name: 'Save song' }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Artist is required')).toBeInTheDocument();
    expect(screen.getByText('Lyrics are required')).toBeInTheDocument();
    expect(screen.getByText('Year must be between 1000 and this year')).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/)).toHaveAttribute('aria-invalid', 'true');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('clears a field error as soon as the field is edited', async () => {
    installFakeApi([]);
    renderApp('/songs/new');

    fireEvent.click(screen.getByRole('button', { name: 'Save song' }));
    expect(await screen.findByText('Title is required')).toBeInTheDocument();

    fill(/Title/, 'Sample');

    expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
  });

  it('shows field errors returned by the server', async () => {
    const { fetchMock, json } = installFakeApi([]);
    fetchMock.mockResolvedValueOnce(
      json(400, {
        error: {
          message: 'Validation failed',
          details: { formErrors: [], fieldErrors: { title: ['Title rejected by server'] } },
        },
      }),
    );
    renderApp('/songs/new');

    fill(/Title/, 'Sample');
    fill(/Artist/, 'Example Band');
    fill(/Lyrics/, 'Placeholder line');
    fireEvent.click(screen.getByRole('button', { name: 'Save song' }));

    expect(await screen.findByText('Title rejected by server')).toBeInTheDocument();
    expect(currentPath()).toBe('/songs/new');
  });

  it('shows a general error when the server is unreachable', async () => {
    const { fetchMock } = installFakeApi([]);
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    renderApp('/songs/new');

    fill(/Title/, 'Sample');
    fill(/Artist/, 'Example Band');
    fill(/Lyrics/, 'Placeholder line');
    fireEvent.click(screen.getByRole('button', { name: 'Save song' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach the server');
  });
});

describe('SongFormPage — edit', () => {
  it('loads the song into the form and saves changes', async () => {
    const { songs } = installFakeApi([makeSong({ id: 'song-1' })]);
    renderApp('/songs/song-1/edit');

    expect(await screen.findByLabelText(/Title/)).toHaveValue('Sample Song');
    expect(screen.getByLabelText(/Artist/)).toHaveValue('Example Band');
    expect(screen.getByLabelText(/Album/)).toHaveValue('Demo Album');
    expect(screen.getByLabelText(/Year/)).toHaveValue('2020');

    fill(/Title/, 'Renamed Sample');
    fill(/Album/, '');
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('heading', { name: 'Renamed Sample' })).toBeInTheDocument();
    expect(currentPath()).toBe('/songs/song-1');
    expect(songs.get('song-1')).toMatchObject({ title: 'Renamed Sample', album: null });
  });

  it('links Cancel back to the song', async () => {
    installFakeApi([makeSong({ id: 'song-1' })]);
    renderApp('/songs/song-1/edit');

    expect(await screen.findByRole('link', { name: 'Cancel' })).toHaveAttribute(
      'href',
      '/songs/song-1',
    );
  });

  it('shows "Song not found" for an unknown id', async () => {
    installFakeApi([]);
    renderApp('/songs/missing/edit');

    expect(await screen.findByRole('heading', { name: 'Song not found' })).toBeInTheDocument();
  });
});
