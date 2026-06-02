/**
 * Nila Arumbu — Typed API Client
 * All requests go through this client which handles auth headers,
 * token refresh, and error normalisation.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string;
  status: number;
}

export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// ── Token management ──────────────────────────────────────────────────────────

const TOKEN_KEY = 'nilarumbu-auth';

function getStoredAuth(): { access_token: string; refresh_token: string } | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state ?? null;
  } catch {
    return null;
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const auth = getStoredAuth();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (auth?.access_token) {
    headers['Authorization'] = `Bearer ${auth.access_token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers, redirect: 'follow' });

  // Token expired — attempt refresh once
  if (res.status === 401 && retry && auth?.refresh_token) {
    const refreshed = await refreshTokens(auth.refresh_token);
    if (refreshed) {
      return request<T>(path, options, false);
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    const err: ApiError = { detail: body.detail ?? 'Unknown error', status: res.status };
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function refreshTokens(refreshToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    // Update zustand persisted store directly
    const raw = localStorage.getItem(TOKEN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.state.access_token = data.access_token;
      parsed.state.refresh_token = data.refresh_token;
      localStorage.setItem(TOKEN_KEY, JSON.stringify(parsed));
    }
    return true;
  } catch {
    return false;
  }
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
