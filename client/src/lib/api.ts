const BASE_URL = '/api';

const TOKEN_KEY = 'alfredos_access_token';
const REFRESH_KEY = 'alfredos_refresh_token';

const USER_KEY = 'alfredos_user';

interface StoredUser {
  id: number;
  name: string;
  email: string;
  role: string;
  restaurantId: number;
}

let accessToken: string | null = sessionStorage.getItem(TOKEN_KEY) ?? null;
let refreshToken: string | null = sessionStorage.getItem(REFRESH_KEY) ?? null;
let storedUser: StoredUser | null = JSON.parse(sessionStorage.getItem(USER_KEY) ?? 'null');

export function setAuth(access: string, refresh: string, user: StoredUser) {
  accessToken = access;
  refreshToken = refresh;
  storedUser = user;
  sessionStorage.setItem(TOKEN_KEY, access);
  sessionStorage.setItem(REFRESH_KEY, refresh);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  accessToken = null;
  refreshToken = null;
  storedUser = null;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getAccessToken() {
  return accessToken;
}

export function getStoredUser() {
  return storedUser;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearAuth();
      return null;
    }
    const json = await res.json();
    accessToken = json.data.token;
    return accessToken;
  } catch {
    clearAuth();
    return null;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && refreshToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json();
  if (!res.ok) {
    const error = json.error ?? { code: 'UNKNOWN', message: 'Error desconocido' };
    throw error;
  }

  return json as T;
}
