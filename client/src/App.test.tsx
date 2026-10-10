import { fireEvent, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { installFakeApi } from './test/fake-api';
import { currentPath, renderApp } from './test/render-app';

afterEach(() => {
  vi.unstubAllGlobals();
});

it('shows a not-found page for unknown routes', () => {
  installFakeApi([]);
  renderApp('/does/not/exist');

  expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
});

it('goes from the list to the create form via "New song"', async () => {
  installFakeApi([]);
  renderApp('/');

  fireEvent.click(screen.getByRole('link', { name: 'New song' }));

  expect(await screen.findByRole('heading', { name: 'New song' })).toBeInTheDocument();
  expect(currentPath()).toBe('/songs/new');
});
