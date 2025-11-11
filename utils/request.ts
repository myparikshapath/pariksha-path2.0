import api from "@/utils/api";

type CacheEntry<T> = { data: T; expiresAt: number };
const cache = new Map<string, CacheEntry<any>>();
const inFlight = new Map<string, Promise<any>>();

const now = () => Date.now();

type RequestOptions = { ttlMs?: number; signal?: AbortSignal };

export async function request<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs = 0
): Promise<T> {
  const cached = cache.get(key) as CacheEntry<T> | undefined;
  if (cached && (ttlMs === 0 || cached.expiresAt > now())) return cached.data;

  const existing = inFlight.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const p = fn()
    .then((data) => {
      if (ttlMs > 0) cache.set(key, { data, expiresAt: now() + ttlMs });
      inFlight.delete(key);
      return data;
    })
    .catch((e) => {
      inFlight.delete(key);
      throw e;
    });

  inFlight.set(key, p);
  return p;
}

export async function get<T = any>(
  url: string,
  params?: Record<string, any>,
  options: RequestOptions = {}
): Promise<T> {
  const { ttlMs = 0, signal } = options;
  const key = `GET:${url}:${JSON.stringify(params || {})}`;
  return request<T>(
    key,
    async () => {
      const res = await api.get(url, { params, signal });
      return res.data as T;
    },
    ttlMs
  );
}

export async function post<T = any>(url: string, body?: any): Promise<T> {
  const res = await api.post(url, body);
  return res.data as T;
}
