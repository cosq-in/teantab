import { useEffect, useState } from 'react';
import { api, requestRemoval } from '../api';
import type { WebItem } from '../data/types';

// Staff-curated links to public threads. Always labelled unverified; companies can ask for removal.
export default function WebFeed() {
  const [items, setItems] = useState<WebItem[]>([]);
  useEffect(() => { api.web().then((r) => r && setItems(r.items)); }, []);
  if (!items.length) return null;
  return (
    <div className="col" style={{ flex: 'none', gap: 10 }}>
      <div><div className="px" style={{ fontSize: 20 }}>from around the web</div>
        <div style={{ font: '700 12px/1.4 var(--sans)', color: 'var(--muted)' }}>Links to public threads, picked by us. Unverified: these are other people's claims, not Tea &amp; Tab flags.</div></div>
      {items.map((it) => <Item key={it.id} it={it} onHidden={() => setItems((xs) => xs.filter((x) => x.id !== it.id))} />)}
    </div>
  );
}

function Item({ it, onHidden }: { it: WebItem; onHidden: () => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true); setErr('');
    const e = await requestRemoval(it.id, email.trim(), reason.trim());
    setBusy(false);
    if (e) setErr(e); else onHidden();
  };
  return (
    <div className="row col" style={{ padding: '10px 12px', gap: 6, flex: 'none' }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="tag" style={{ background: 'var(--cream2)', border: '2px solid var(--ink)', padding: '0 6px' }}>UNVERIFIED</span>
        <span className="tag" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>{it.about}</span>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.45 }}>{it.summary}</div>
      <a href={it.url} target="_blank" rel="noopener noreferrer" style={{ font: '700 12px/1.4 var(--sans)', overflowWrap: 'anywhere' }}>Source: {it.source}{it.threadDate ? ', ' + it.threadDate : ''}: "{it.sourceTitle}"</a>
      {!open && <button className="plain" onClick={() => setOpen(true)} style={{ font: '700 12px var(--sans)', color: 'var(--muted)' }}>are you the company? ask for removal</button>}
      {open && <div className="col" style={{ gap: 8 }}>
        <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your email, so we can reply" style={{ minHeight: 42, fontSize: 14 }} />
        <textarea className="field" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="what is wrong or out of date?" style={{ padding: '10px 14px', font: "400 14px/1.4 var(--sans)", resize: 'none' }} />
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>The item is hidden as soon as you send this, while we review it.</div>
        {err && <div role="alert" style={{ font: '700 12px var(--sans)', color: 'var(--red)' }}>{err}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="chip" onClick={() => setOpen(false)} style={{ background: '#fff' }}>cancel</button>
          <button className="chip" disabled={busy || !email.trim() || !reason.trim()} onClick={send} style={{ background: 'var(--green)', opacity: busy || !email.trim() || !reason.trim() ? 0.6 : 1 }}>{busy ? 'sending...' : 'hide it and send'}</button>
        </div>
      </div>}
    </div>
  );
}
