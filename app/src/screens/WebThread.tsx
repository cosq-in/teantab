import { useCallback, useEffect, useState } from 'react';
import { api, requestRemoval } from '../api';
import type { Comment, WebItem } from '../data/types';
import type { Tea } from '../store';

// One "from around the web" entry: what it is, where it came from, and the discussion under it.
export default function WebThread({ t, id }: { t: Tea; id: number }) {
  const [item, setItem] = useState<WebItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [state, setState] = useState<'loading' | 'ok' | 'gone'>('loading');
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [err, setErr] = useState('');
  const [asking, setAsking] = useState(false);
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [sent, setSent] = useState(false);

  const load = useCallback(() => api.webItem(id).then((r) => {
    if (!r) { setState((s) => s === 'loading' ? 'gone' : s); return; }
    setItem(r.item); setComments(r.comments); setRoles(r.roles || {}); setState('ok');
  }), [id]);
  useEffect(() => { setState('loading'); load(); }, [load]);

  const who = (h: string) => h + ', ' + (h === t.handle ? t.role : roles[h] || 'freelancer');
  const replyC = replyTo ? comments.find((c) => c.id === replyTo) : null;
  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    setErr('');
    const c = await api.webComment(id, text, replyTo ?? undefined);
    if (!c) { setErr(t.signedIn ? 'could not post, try again' : 'sign in to join the tea'); return; }
    setDraft(''); setReplyTo(null); load();
  };
  const ask = async () => {
    const e = await requestRemoval(id, email.trim(), reason.trim());
    if (e) setErr(e); else setSent(true);
  };
  const back = () => t.setView(null);
  const court = item?.kind === 'court';

  if (state !== 'ok' || !item) return (
    <div className="scroll"><button className="link" onClick={back}>back to the tea</button>
      <div style={{ fontSize: 14, color: 'var(--muted)' }}>{state === 'loading' ? 'Loading...' : 'This item is no longer available.'}</div></div>
  );
  return (
    <>
      <div className="scroll">
        <button className="link" onClick={back}>back to the tea</button>
        <div className="col" style={{ gap: 8, flex: 'none' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="tag" style={{ background: court ? 'var(--accent)' : 'var(--cream2)', border: '1px solid var(--line)', padding: '0 6px', fontSize: 12 }}>{court ? 'COURT RECORD' : 'UNVERIFIED'}</span>
            <span className="tag" style={{ background: 'var(--ink)', color: 'var(--cream)', fontSize: 12, padding: '3px 8px' }}>{item.about}</span>
          </div>
          <h1 className="serif" style={{ margin: 0, fontSize: 25, lineHeight: 1.15 }}>{item.sourceTitle}</h1>
          {court && <div style={{ font: '700 13px var(--sans)', color: 'var(--muted)' }}>{item.court}</div>}
          <div style={{ fontSize: 15, lineHeight: 1.55 }}>{item.summary}</div>
          <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ font: '700 13px/1.4 var(--sans)', overflowWrap: 'anywhere' }}>{court ? 'Read the judgment' : 'Open the original thread'} ({item.source}{item.threadDate ? ', ' + item.threadDate : ''})</a>
          <div style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--muted)' }}>{court ? 'A public record picked by us, not a Tea & Tab flag. Check whether it was appealed.' : 'Someone else\'s unverified claim, picked by us. Not a Tea & Tab flag.'}</div>
          {sent ? <div className="tile" style={{ padding: '10px 12px', font: '700 13px/1.4 var(--sans)' }}>Thanks. This item is hidden while we review your request.</div>
            : !asking ? <button className="plain" onClick={() => setAsking(true)} style={{ font: '700 12px var(--sans)', color: 'var(--muted)' }}>are you the company? ask for removal</button>
            : <div className="col" style={{ gap: 8 }}>
              <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your email, so we can reply" style={{ minHeight: 42, fontSize: 14 }} />
              <textarea className="field" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="what is wrong or out of date?" style={{ padding: '10px 14px', font: "400 14px/1.4 var(--sans)", resize: 'none' }} />
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>The item is hidden as soon as you send this, while we review it.</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="chip" onClick={() => setAsking(false)} style={{ background: '#fff' }}>cancel</button>
                <button className="chip" disabled={!email.trim() || !reason.trim()} onClick={ask} style={{ background: 'var(--accent)', opacity: !email.trim() || !reason.trim() ? 0.6 : 1 }}>hide it and send</button>
              </div>
            </div>}
        </div>
        <div className="lbl">{comments.reduce((n, c) => n + 1 + c.replies.length, 0)} COMMENTS</div>
        {!comments.length && <div style={{ fontSize: 14, color: 'var(--muted)' }}>Quiet in here. Start the conversation.</div>}
        {comments.map((cm) => (
          <div key={cm.id} className="col" style={{ flex: 'none', gap: 8 }}>
            <div className="row" style={{ padding: '10px 12px' }}>
              <div style={{ font: '700 12px var(--sans)', color: 'var(--muted)' }}>{who(cm.who)}</div>
              <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 3 }}>{cm.text}</div>
              <button className="plain" onClick={() => setReplyTo(cm.id)} style={{ font: '700 12px var(--sans)', color: 'var(--link)', marginTop: 6, display: 'block' }}>reply</button>
            </div>
            {cm.replies.map((r, i) => (
              <div key={i} className="tile" style={{ marginLeft: 18, padding: '8px 12px' }}>
                <div style={{ font: '700 12px var(--sans)', color: 'var(--muted)' }}>{who(r.who)}</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 3 }}>{r.text}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="col" style={{ flex: 'none', padding: '10px 14px 18px', borderTop: '1px solid var(--line)', background: 'var(--cream2)', gap: 6 }}>
        {replyC && <div style={{ display: 'flex', justifyContent: 'space-between', font: '700 12px var(--sans)' }}><span>replying to {who(replyC.who)}</span><button className="plain" onClick={() => setReplyTo(null)} style={{ color: 'var(--red)' }}>cancel</button></div>}
        {err && <div role="alert" style={{ font: '700 12px var(--sans)', color: 'var(--red)' }}>{err}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="field" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder={t.signedIn ? 'add to the tea' : 'sign in to join the tea'} style={{ flex: 1, minWidth: 0, minHeight: 46, fontSize: 15 }} />
          <button className="serif" onClick={send} style={{ flex: 'none', padding: '0 16px', background: 'var(--accent)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'none', fontSize: 16 }}>post</button>
        </div>
      </div>
    </>
  );
}
