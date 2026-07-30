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

const storage = typeof sessionStorage !== 'undefined' ? sessionStorage : null;

function storageGet(key: string): string | null {
  return storage?.getItem(key) ?? null;
}

function storageSet(key: string, value: string) {
  storage?.setItem(key, value);
}

function storageRemove(key: string) {
  storage?.removeItem(key);
}

let accessToken: string | null = storageGet(TOKEN_KEY);
let refreshToken: string | null = storageGet(REFRESH_KEY);
let storedUser: StoredUser | null = JSON.parse(storageGet(USER_KEY) ?? 'null');

export function setAuth(access: string, refresh: string, user: StoredUser) {
  accessToken = access;
  refreshToken = refresh;
  storedUser = user;
  storageSet(TOKEN_KEY, access);
  storageSet(REFRESH_KEY, refresh);
  storageSet(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  accessToken = null;
  refreshToken = null;
  storedUser = null;
  storageRemove(TOKEN_KEY);
  storageRemove(REFRESH_KEY);
  storageRemove(USER_KEY);
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
