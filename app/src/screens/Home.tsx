import { useEffect, useState } from 'react';
import { ageOf, countComments, type Tea } from '../store';
import WebFeed from '../components/WebFeed';
import type { Post } from '../data/types';

export const who = (t: Tea, h: string) => h + ', ' + t.roleOf(h);
const rankOf = (p: Post, sort: string) => sort === 'new' ? p.t : sort === 'top' ? -p.score : -(p.score + countComments(p) * 8) / Math.pow(p.t + 2, 0.4);

export default function Home({ t }: { t: Tea }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'hot' | 'new' | 'top'>('hot');
  const q = query.trim().toLowerCase();
  const digits = q.replace(/\D/g, '');
  const isPhone = /^[+\d][\d\s()-]*$/.test(q) && digits.length >= 10;
  const [phoneHit, setPhoneHit] = useState<{ id: number } | 'none' | 'wait' | null>(null);
  useEffect(() => {
    if (!isPhone) { setPhoneHit(null); return; }
    let live = true;
    setPhoneHit('wait');
    t.findByPhone(query).then((id) => live && setPhoneHit(id ? { id } : 'none'));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, isPhone]);
  const matches = isPhone ? (phoneHit && typeof phoneHit === 'object' ? t.clients.filter((c) => c.id === phoneHit.id) : []) : q ? t.clients.filter((c) => c.name.toLowerCase().includes(q)) : [];
  const posts = [...t.posts].sort((a, b) => rankOf(a, sort) - rankOf(b, sort));
  const top = t.sortedClients;
  const podium = ([[1, 2, 44, '#B8B6AC'], [0, 1, 62, '#E8B23A'], [2, 3, 30, '#C98A55']] as const).map(([i, r, h, c]) => ({ c: top[i], rank: r, h, color: c })).filter((x) => x.c);
  const openClient = (id: number) => id && t.setView({ k: 'dossier', id });

  return (
    <div className="col home" style={{ position: 'absolute', inset: 0 }}>
      <div style={{ flex: 'none', padding: '18px 14px 0', display: 'flex', gap: 10, alignItems: 'center', zIndex: 2 }}>
        <div className="card" style={{ flex: 1, minWidth: 0, padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div className="px" style={{ fontSize: 22 }}>tea &amp; tab</div>
          <div style={{ textAlign: 'right' }}><div className="px" style={{ fontSize: 20 }}>{t.totalFlags.toLocaleString('en-IN')}</div><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>flags so far</div></div>
        </div>
        <button className="px" onClick={() => t.setView({ k: 'me' })} style={{ flex: 'none', width: 56, height: 56, background: 'var(--gold)', border: '3px solid var(--ink)', borderRadius: 6, boxShadow: '0 4px 0 var(--ink),inset 0 -4px 0 var(--gold-d)', fontSize: 24 }}>{t.handle[0]}</button>
      </div>

      <div className="col" style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '16px 14px 20px', gap: 14, zIndex: 1 }}>
        <input className="field" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="check a client by name or phone number" style={{ flex: 'none', minHeight: 52, boxShadow: '0 3px 0 var(--ink)' }} />

        {q ? <>
          {matches.map((m) => (
            <button key={m.id} className="plain card" onClick={() => openClient(m.id)} style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px' }}>
              <div style={{ minWidth: 0 }}><div className="px" style={{ fontSize: 17 }}>{m.name}</div><div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>{[m.loc, m.owed + ' unpaid'].filter(Boolean).join(' · ')}</div></div>
              <span className="px" style={{ flex: 'none', background: 'var(--red)', color: '#fff', border: '3px solid var(--ink)', borderRadius: 6, padding: '2px 8px', fontSize: 14 }}>{m.total} flags</span>
            </button>
          ))}
          {!matches.length && phoneHit === 'wait' && <div className="card" style={{ padding: 16, fontSize: 14 }}>Checking that number...</div>}
          {!matches.length && phoneHit !== 'wait' && <div className="card" style={{ padding: 16, fontSize: 14, lineHeight: 1.5 }}>{isPhone ? 'No client is linked to that number. Numbers are never shown, only matched. ' : ''}No flags on this client yet. That is not a clean record, so agree payment terms in writing before you start. Had a bad time with them? Be the first to flag.</div>}
        </> : <>
          <div style={{ flex: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}><div className="px" style={{ fontSize: 20 }}>hall of shame</div><div style={{ font: '700 12px var(--sans)' }}>top 3 most flagged</div></div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              {podium.map((p) => (
                <button key={p.c.id} className="plain" onClick={() => openClient(p.c.id)} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ background: 'var(--cream)', border: '3px solid var(--ink)', borderRadius: '6px 6px 0 0', borderBottom: 0, padding: '6px 6px 4px', textAlign: 'center', display: 'block' }}>
                    <span className="px" style={{ display: 'block', fontSize: 13, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.c.short}</span>
                    <span style={{ display: 'block', font: '700 11px var(--sans)', color: 'var(--red)' }}>{p.c.total} flags</span>
                  </span>
                  <span className="px" style={{ height: p.h, background: p.color, border: '3px solid var(--ink)', boxShadow: 'inset 0 -5px 0 rgba(31,42,29,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{p.rank}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="px" style={{ fontSize: 20, marginRight: 'auto' }}>the tea</div>
            {(['hot', 'new', 'top'] as const).map((k) => <button key={k} className="chip" onClick={() => setSort(k)} style={{ minHeight: 34, background: sort === k ? 'var(--green)' : 'var(--paper)' }}>{k}</button>)}
          </div>

          {posts.map((p) => {
            const mv = t.votes[p.id] || 0, c = t.clientOf(p.cid);
            return (
              <div key={p.id} className="card" style={{ flex: 'none', display: 'flex', overflow: 'hidden' }}>
                <div className="col" style={{ flex: 'none', width: 46, background: 'var(--cream2)', borderRight: '3px solid var(--ink)', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '6px 0' }}>
                  <button className="plain" aria-label="agree" onClick={() => t.vote(p.id, 1)} style={{ padding: '6px 8px' }}><span style={{ display: 'block', borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: `11px solid ${mv === 1 ? '#4E8A2B' : '#7A7F6E'}` }} /></button>
                  <div className="px" style={{ fontSize: 15 }}>{p.score + mv}</div>
                  <button className="plain" aria-label="doubtful" onClick={() => t.vote(p.id, -1)} style={{ padding: '6px 8px' }}><span style={{ display: 'block', borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: `11px solid ${mv === -1 ? '#D0452F' : '#7A7F6E'}` }} /></button>
                </div>
                <div className="col" style={{ flex: 1, minWidth: 0, padding: '10px 12px', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <button className="plain tag" onClick={() => openClient(p.cid)} style={{ background: 'var(--ink)', color: 'var(--cream)' }}>{c ? c.short : p.cname}</button>
                    <span className="tag" style={{ background: 'var(--gold)', border: '2px solid var(--ink)', padding: '0 6px' }}>{p.cat}</span>
                  </div>
                  <button className="plain px" onClick={() => t.setView({ k: 'thread', id: p.id })} style={{ display: 'block', fontSize: 17, lineHeight: 1.2 }}>{p.title}</button>
                  <div style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--sub)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.text}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <button className="plain" onClick={() => t.setView({ k: 'thread', id: p.id })} style={{ font: '700 12px var(--sans)', color: 'var(--green-d)' }}>{countComments(p)} comments</button>
                    <span style={{ font: '700 11px var(--sans)', color: 'var(--muted)' }}>{who(t, p.who)} · {ageOf(p.t)}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <WebFeed t={t} />
        </>}
      </div>

      <div style={{ flex: 'none', padding: '12px 14px 18px', background: 'var(--cream)', borderTop: '3px solid var(--ink)', boxShadow: 'inset 0 4px 0 var(--green)', zIndex: 2 }}>
        <button className="btn" onClick={() => t.setView({ k: 'file', prefill: q && !isPhone && !matches.length ? query : '' })} style={{ width: '100%', marginTop: 6, marginBottom: 5 }}>flag a client</button>
      </div>
    </div>
  );
}
