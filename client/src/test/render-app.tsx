import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { App } from '../App';

function LocationDisplay() {
  return <div data-testid="location">{useLocation().pathname}</div>;
}

/** Renders the whole app at `path`, with a fresh query cache and no retries. */
export function renderApp(path = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <App />
        <LocationDisplay />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

export function currentPath(): string {
  return screen.getByTestId('location').textContent ?? '';
}
