export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api';
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) }, cache: 'no-store' });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}
