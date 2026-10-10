export type FieldErrors = Partial<Record<string, string[]>>;

/** An error response from the API, e.g. 404 or a 400 with per-field validation messages. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors: FieldErrors = {},
  ) {
    super(message);
  }
}

interface ErrorBody {
  error?: { message?: string; details?: { fieldErrors?: FieldErrors } };
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      headers: init.body ? { 'Content-Type': 'application/json', ...init.headers } : init.headers,
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Is it running?');
  }

  if (!res.ok) {
    throw await toApiError(res);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

async function toApiError(res: Response): Promise<ApiError> {
  const fallback = `Request failed with status ${res.status}`;
  try {
    const body = (await res.json()) as ErrorBody;
    return new ApiError(
      res.status,
      body.error?.message ?? fallback,
      body.error?.details?.fieldErrors,
    );
  } catch {
    return new ApiError(res.status, fallback);
  }
}
