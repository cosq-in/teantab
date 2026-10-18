import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, apiEnabled, authCall, getToken, setToken } from './api';
import { HANDLES, SEED_CLIENTS, SEED_POSTS, SEED_ROLES } from './data/seed';
import type { Client, FlagForm, Post } from './data/types';

export const EMPTY_FORM: FlagForm = { client: '', gst: '', job: '', amount: '', story: '', web: '', insta: '', phones: [] };
export type View = null | { k: 'thread'; id: number } | { k: 'dossier'; id: number } | { k: 'web'; id: number } | { k: 'me' } | { k: 'file'; prefill?: string };

export function useTea() {
  const [role, setRole] = useState('designer');
  const [handle, setHandle] = useState(HANDLES[0]);
  const [onboard, setOnboard] = useState(true);
  const [clients, setClients] = useState<Client[]>(SEED_CLIENTS);
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [roles, setRoles] = useState<Record<string, string>>(SEED_ROLES);
  const [totalFlags, setTotalFlags] = useState(2418);
  const [votes, setVotes] = useState<Record<number, -1 | 0 | 1>>({});
  const [view, setView] = useState<View>(null);

  const [signedIn, setSignedIn] = useState(false);

  // Try the real backend; any failure leaves the mock seeds in place.
  const load = useCallback(() => {
    api.bootstrap().then((b) => {
      if (!b) return;
      setClients(b.clients); setPosts(b.posts); setTotalFlags(b.totalFlags);
      setRoles((r) => ({ ...r, ...b.roles }));
      setVotes(Object.fromEntries(Object.entries(b.myVotes || {}).map(([k, v]) => [Number(k), v])));
    });
  }, []);
  useEffect(() => {
    load();
    // A stored token that still works means the person is already signed in: skip onboarding.
    if (getToken()) api.me().then((m) => { if (m) { setHandle(m.handle); setRole(m.role); setSignedIn(true); setOnboard(false); } else setToken(null); });
  }, [load]);

  /** Create an account (signup) or sign in. Resolves to an error message, or null on success. */
  const authenticate = useCallback(async (kind: 'signup' | 'login', email: string, password: string) => {
    const r = await authCall(kind, kind === 'signup' ? { email, password, handle, role } : { email, password });
    if (!r.ok) return r.error;
    setToken(r.session.token); setHandle(r.session.handle); setRole(r.session.role);
    setSignedIn(true); setOnboard(false); load();
    return null;
  }, [handle, role, load]);

  const logout = useCallback(() => { setToken(null); setSignedIn(false); setVotes({}); setView(null); setOnboard(true); load(); }, [load]);

  const pickRole = useCallback((r: string) => { setRole(r); if (signedIn) api.setRole(r); }, [signedIn]);

  const vote = useCallback((id: number, d: 1 | -1) => {
    const next = votes[id] === d ? 0 : d;
    setVotes({ ...votes, [id]: next });
    api.vote(id, next);
  }, [votes]);

  const addComment = useCallback((postId: number, text: string, parentId: number | null) => {
    const temp = -Date.now();
    setPosts((ps) => ps.map((p) => p.id !== postId ? p : {
      ...p,
      comments: parentId ? p.comments.map((c) => c.id === parentId ? { ...c, replies: [...c.replies, { who: handle, text }] } : c) : [...p.comments, { id: temp, who: handle, text, replies: [] }],
    }));
    // Swap in the server id so replies to this comment have something real to point at.
    api.comment(postId, text, parentId && parentId > 0 ? parentId : undefined).then((c) => {
      if (c && !parentId) setPosts((ps) => ps.map((p) => p.id !== postId ? p : { ...p, comments: p.comments.map((x) => x.id === temp ? { ...x, id: c.id } : x) }));
    });
  }, [handle]);

  const submitFlag = useCallback((form: FlagForm, cats: string[], proofs: string[], pub: boolean) => {
    const c = clients.find((x) => x.name.toLowerCase() === form.client.trim().toLowerCase());
    const temp = -Date.now();
    const post: Post = { id: temp, cid: c ? c.id : 0, cname: form.client, who: handle, t: 0, score: 0, cat: cats[0].replace(' or unpaid', ''), v: 0, pub, proofs, mine: true, title: form.client + ': ' + cats[0].toLowerCase(), text: form.story, comments: [] };
    setPosts((ps) => [post, ...ps]);
    setTotalFlags((n) => n + 1);
    setVotes((v) => ({ ...v, [temp]: 1 }));
    api.createFlag(form, cats, proofs, pub).then((p) => {
      if (!p) return;
      setPosts((ps) => ps.map((x) => x.id === temp ? p : x));
      setVotes((v) => { const { [temp]: mine, ...rest } = v; return { ...rest, [p.id]: mine ?? 1 }; });
      api.vote(p.id, 1);
      api.bootstrap().then((b) => b && setClients(b.clients));
    });
  }, [clients, handle]);

  // Search by a client's phone number. The backend never returns numbers, only the matching client and its flags.
  const findByPhone = useCallback(async (phone: string) => {
    const b = await api.byPhone(phone);
    if (!b || !b.clients.length) return null;
    setClients((cs) => [...cs.filter((c) => !b.clients.some((n) => n.id === c.id)), ...b.clients]);
    setPosts((ps) => [...ps.filter((p) => !b.posts.some((n) => n.id === p.id)), ...b.posts]);
    setRoles((r) => ({ ...r, ...b.roles }));
    return b.clients[0].id;
  }, []);

  const editHandle = (h: string) => setHandle(h.replace(/[^A-Za-z0-9_]/g, '').slice(0, 20));
  const nextHandle = () => setHandle(HANDLES[(HANDLES.indexOf(handle) + 1) % HANDLES.length]);
  const clientOf = useCallback((id: number) => clients.find((c) => c.id === id), [clients]);
  const sortedClients = useMemo(() => [...clients].sort((a, b) => b.total - a.total), [clients]);
  const roleOf = (h: string) => (h === handle ? role : roles[h] || 'freelancer');
  return { role, setRole: pickRole, handle, nextHandle, editHandle, signedIn, authenticate, logout, apiEnabled, onboard, setOnboard, clients, sortedClients, posts, totalFlags, votes, vote, addComment, submitFlag, findByPhone, view, setView, clientOf, roleOf };
}
export type Tea = ReturnType<typeof useTea>;

export const ageOf = (t: number) => t < 1 ? 'just now' : t < 24 ? t + 'h ago' : Math.floor(t / 24) + 'd ago';
export const countComments = (p: Post) => p.comments.reduce((n, c) => n + 1 + c.replies.length, 0);
