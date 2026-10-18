import { countComments, type Tea } from '../store';

export default function Dossier({ t, id }: { t: Tea; id: number }) {
  const d = t.clientOf(id);
  if (!d) return null;
  const posts = t.posts.filter((p) => p.cid === d.id);
  return (
    <>
      <div className="scroll">
        <button className="link" onClick={() => t.setView(null)}>back to the tea</button>
        <div style={{ minWidth: 0 }}><div className="lbl">{[d.kind, d.loc].filter(Boolean).join(' · ').toUpperCase()}</div><h1 className="px" style={{ margin: '4px 0 0', fontSize: 28, lineHeight: 1.05 }}>{d.name}</h1></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 'none' }}>
          {d.links.map(([k, v]) => <span key={k + v} style={{ display: 'inline-flex', gap: 6, padding: '6px 10px', borderRadius: 6, background: '#fff', border: '3px solid var(--ink)', font: '700 12px var(--sans)' }}><span style={{ color: 'var(--muted)' }}>{k}</span>{v}</span>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 'none' }}>
          <div className="tile" style={{ padding: '12px 14px' }}><div style={{ font: '700 12px var(--sans)', color: 'var(--muted)' }}>flagged by</div><div className="px" style={{ fontSize: 32 }}>{d.total}</div></div>
          <div className="tile" style={{ padding: '12px 14px' }}><div style={{ font: '700 12px var(--sans)', color: 'var(--muted)' }}>left unpaid</div><div className="px" style={{ fontSize: 28 }}>{d.owed}</div></div>
        </div>
        <div className="lbl">WHAT HAPPENED</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 'none' }}>{d.tally.map(([l, n]) => <span key={l} style={{ padding: '6px 12px', borderRadius: 6, background: 'var(--cream2)', border: '3px solid var(--ink)', font: '700 13px var(--sans)' }}>{l} x{n}</span>)}</div>
        <div className="lbl">THREADS</div>
        {posts.map((p) => (
          <button key={p.id} className="plain row col" onClick={() => t.setView({ k: 'thread', id: p.id })} style={{ flex: 'none', padding: '12px 14px', gap: 6 }}>
            <span className="px" style={{ fontSize: 16, lineHeight: 1.2 }}>{p.title}</span>
            <span style={{ font: '700 12px var(--sans)', color: 'var(--muted)' }}>{p.score + (t.votes[p.id] || 0)} agree · {countComments(p)} comments</span>
          </button>
        ))}
        <div style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.5 }}>Flags are statements by individual freelancers, checked against the proof they upload. The client can reply.</div>
      </div>
      <div style={{ flex: 'none', padding: '12px 18px 20px', borderTop: '3px solid var(--ink)', background: 'var(--cream2)' }}>
        <button className="btn" onClick={() => t.setView({ k: 'file', prefill: d.name })} style={{ width: '100%', marginBottom: 5 }}>flag this client</button>
      </div>
    </>
  );
}
