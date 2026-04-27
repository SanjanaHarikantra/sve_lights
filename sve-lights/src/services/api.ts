const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const AUTH_STORAGE_KEY = 'sve-auth';

const parseErrorMessage = (response: Response, bodyText: string) => {
  const trimmed = bodyText.trim();

  if (!trimmed) {
    return `Request failed with status ${response.status}.`;
  }

  try {
    const parsed = JSON.parse(trimmed) as { error?: string };
    return parsed.error || `Request failed with status ${response.status}.`;
  } catch {
    return `Request failed with status ${response.status}.`;
  }
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const bodyText = await response.text();

  if (!response.ok) {
    const message = parseErrorMessage(response, bodyText);

    // If the saved session points to a deleted user or expired token,
    // clear the stale auth snapshot so the next login starts cleanly.
    if (
      response.status === 401 &&
      (message === 'User no longer exists.' || message === 'Invalid or expired token.')
    ) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    throw new Error(message);
  }

  if (!bodyText) {
    return {} as T;
  }

  return JSON.parse(bodyText) as T;
};
