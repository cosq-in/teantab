import type { Bootstrap, FlagForm, Post, Comment } from './data/types';

// Talks to the /tea routes of kurukuru-honbu (see docs/BACKEND_SPEC.md). Every call resolves to
// null on failure so the UI keeps running on mock seeds with no backend, or with no sign-in.
const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';
const TOKEN_KEY = 'tt_token';

export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };
export const setToken = (t: string | null) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* storage blocked */ } };

async function call<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!BASE) return null;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 4000);
  const token = getToken();
  try {
    const res = await fetch(BASE + path, {
      ...init, signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...init?.headers },
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
const send = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

export const api = {
  bootstrap: () => call<Bootstrap>('/tea/bootstrap'),
  me: () => call<{ handle: string; role: string }>('/tea/me'),
  setRole: (role: string) => call<{ handle: string; role: string }>('/tea/me', send('PUT', { role })),
  createFlag: (f: FlagForm, cats: string[], proofs: string[], pub: boolean) => call<Post>('/tea/flags', send('POST', { ...f, cats, proofs, pub })),
  vote: (postId: number, value: -1 | 0 | 1) => call<{ score: number }>('/tea/posts/' + postId + '/vote', send('PUT', { value })),
  comment: (postId: number, text: string, parentId?: number) => call<Comment>('/tea/posts/' + postId + '/comments', send('POST', { text, parentId })),
};
