import AsyncStorage from "@react-native-async-storage/async-storage";

// Set in the app's .env, then restart Metro:
//   EXPO_PUBLIC_API_URL=http://192.168.x.x:4000/api     (local dev, your laptop's LAN IP)
//   EXPO_PUBLIC_API_URL=https://your-app.onrender.com/api   (deployed)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const TOKEN_KEY = "laksh-token";

export class ApiError extends Error {
  status: number; // 0 means the request never got a response (offline, timeout)
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}



let cachedToken: string | null | undefined; // undefined = not loaded from disk yet

export async function getToken(): Promise<string | null> {
  if (cachedToken !== undefined) return cachedToken;
  cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
  return cachedToken;
}

export async function setToken(token: string): Promise<void> {
  cachedToken = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  cachedToken = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
}


let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

// ── Core request function ────────────────────────────────────────────────────

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  timeoutMs?: number;
  auth?: boolean;
};

function safeParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  { method = "GET", body, timeoutMs = 30000, auth = true }: RequestOptions = {}
): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError(0, "EXPO_PUBLIC_API_URL is not set. Add it to .env and restart Metro.");
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    const data = text ? safeParse(text) : null;

    if (!res.ok) {
      // Only treat 401 as "logged out" for authenticated calls; a wrong OTP is also a 401
      if (res.status === 401 && auth) {
        await clearToken();
        onUnauthorized?.();
      }
      throw new ApiError(res.status, data?.error ?? `Request failed (${res.status})`);
    }

    return data as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if ((e as { name?: string })?.name === "AbortError") {
      throw new ApiError(0, "Request timed out. Please try again.");
    }
    throw new ApiError(0, "Network error. Check your connection.");
  } finally {
    clearTimeout(timer);
  }
}


export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "POST", body: body ?? {} }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "PATCH", body: body ?? {} }),
  delete: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "DELETE" }),
};