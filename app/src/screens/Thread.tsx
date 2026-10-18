import { useState } from 'react';
import { ageOf, countComments, type Tea } from '../store';
import { who } from './Home';

export default function Thread({ t, id }: { t: Tea; id: number }) {
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const p = t.posts.find((x) => x.id === id);
  if (!p) return null;
  const c = t.clientOf(p.cid), mv = t.votes[p.id] || 0, pr = p.proofs || [];
  const replyC = replyTo ? p.comments.find((x) => x.id === replyTo) : null;
  const send = () => { const txt = draft.trim(); if (!txt) return; t.addComment(p.id, txt, replyTo); setDraft(''); setReplyTo(null); };
  return (
    <>
      <div className="scroll">
        <button className="link" onClick={() => t.setView(null)}>back to the tea</button>
        <div className="col" style={{ gap: 8, flex: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <button className="plain tag" onClick={() => p.cid && t.setView({ k: 'dossier', id: p.cid })} style={{ fontSize: 12, padding: '3px 8px', background: 'var(--ink)', color: 'var(--cream)' }}>{c ? c.name : p.cname}</button>
            <span className="tag" style={{ fontSize: 12, background: 'var(--accent)', border: '1px solid var(--line)', padding: '0 6px' }}>{p.cat}</span>
          </div>
          <h1 className="serif" style={{ margin: 0, fontSize: 25, lineHeight: 1.15 }}>{p.title}</h1>
          <div style={{ fontSize: 15, lineHeight: 1.55 }}>{p.text}</div>
          {!!pr.length && p.pub && <div style={{ display: 'flex', gap: 8, overflow: 'auto' }}>{pr.map((f, i) => <div key={i} style={{ flex: 'none', width: 92, height: 92, border: '1px solid var(--line)', borderRadius: 14, background: 'repeating-linear-gradient(45deg,#E6D6DD 0 8px,#F2E7EA 8px 16px)', display: 'flex', alignItems: 'flex-end', padding: 6, font: '700 11px/1.2 var(--sans)' }}>{f}</div>)}</div>}
          {!!pr.length && !p.pub && <div style={{ border: '1.5px dashed var(--line-strong)', borderRadius: 14, padding: '10px 12px', font: '700 13px/1.4 var(--sans)', background: 'var(--paper)' }}>Proof kept private. Reviewers have seen it and marked this flag.</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', font: '700 12px var(--sans)', color: 'var(--muted)' }}><span>{who(t, p.who)} · {ageOf(p.t)}</span><span style={{ color: 'var(--link)' }}>{p.v ? 'PROOF CHECKED' : 'PROOF PENDING'}</span></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="chip" onClick={() => t.vote(p.id, 1)} style={{ background: mv === 1 ? 'var(--accent)' : 'var(--paper)' }}>same here</button>
            <button className="chip" onClick={() => t.vote(p.id, -1)} style={{ background: mv === -1 ? '#E8CBDA' : 'var(--paper)' }}>doubtful</button>
            <span className="serif" style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 18 }}>{p.score + mv}</span>
          </div>
        </div>
        <div className="lbl">{countComments(p)} COMMENTS</div>
        {!p.comments.length && <div style={{ fontSize: 14, color: 'var(--muted)' }}>Quiet in here. Start the conversation.</div>}
        {p.comments.map((cm) => (
          <div key={cm.id} className="col" style={{ flex: 'none', gap: 8 }}>
            <div className="row" style={{ padding: '10px 12px' }}>
              <div style={{ font: '700 12px var(--sans)', color: 'var(--muted)' }}>{who(t, cm.who)}</div>
              <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 3 }}>{cm.text}</div>
              <button className="plain" onClick={() => setReplyTo(cm.id)} style={{ font: '700 12px var(--sans)', color: 'var(--link)', marginTop: 6, display: 'block' }}>reply</button>
            </div>
            {cm.replies.map((r, i) => (
              <div key={i} className="tile" style={{ marginLeft: 18, padding: '8px 12px' }}>
                <div style={{ font: '700 12px var(--sans)', color: 'var(--muted)' }}>{who(t, r.who)}</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 3 }}>{r.text}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="col" style={{ flex: 'none', padding: '10px 14px 18px', borderTop: '1px solid var(--line)', background: 'var(--cream2)', gap: 6 }}>
        {replyC && <div style={{ display: 'flex', justifyContent: 'space-between', font: '700 12px var(--sans)' }}><span>replying to {who(t, replyC.who)}</span><button className="plain" onClick={() => setReplyTo(null)} style={{ color: 'var(--red)' }}>cancel</button></div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="field" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="add to the tea" style={{ flex: 1, minWidth: 0, minHeight: 46, fontSize: 15 }} />
          <button className="serif" onClick={send} style={{ flex: 'none', padding: '0 16px', background: 'var(--accent)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'none', fontSize: 16 }}>post</button>
        </div>
      </div>
    </>
  );
}
