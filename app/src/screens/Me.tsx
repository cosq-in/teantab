import { countComments, ageOf, type Tea } from '../store';

export default function Me({ t }: { t: Tea }) {
  const mine = t.posts.filter((p) => p.mine);
  const stats = [{ v: mine.length + 3, l: 'flags' }, { v: 41, l: 'same here' }, { v: 18, l: 'comments' }];
  return (
    <div className="scroll" style={{ paddingBottom: 24 }}>
      <button className="link" onClick={() => t.setView(null)}>back to the tea</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 'none' }}>
        <div className="px" style={{ flex: 'none', width: 64, height: 64, background: 'var(--gold)', border: '3px solid var(--ink)', borderRadius: 6, boxShadow: 'inset 0 -5px 0 var(--gold-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>{t.handle[0]}</div>
        <div style={{ minWidth: 0 }}><h1 className="px" style={{ margin: 0, fontSize: 24, lineHeight: 1.1, overflowWrap: 'anywhere' }}>{t.handle}</h1><div style={{ font: '700 13px var(--sans)', color: 'var(--muted)', marginTop: 2 }}>{t.role} · scout</div></div>
      </div>
      <div style={{ display: 'flex', gap: 3, flex: 'none' }}>{Array.from({ length: 10 }, (_, i) => <div key={i} style={{ flex: 1, height: 14, border: '2px solid var(--ink)', borderRadius: 2, background: i < 4 + mine.length ? 'var(--green)' : '#D9D3BE' }} />)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, flex: 'none' }}>
        {stats.map((s) => <div key={s.l} className="tile" style={{ padding: '12px 6px', textAlign: 'center' }}><div className="px" style={{ fontSize: 28 }}>{s.v}</div><div style={{ font: '700 12px var(--sans)', color: 'var(--muted)' }}>{s.l}</div></div>)}
      </div>
      {t.signedIn && <button className="chip" onClick={t.logout} style={{ alignSelf: 'flex-start', background: '#fff' }}>log out</button>}
      <div className="lbl">MY FLAGS</div>
      {!mine.length && <div style={{ fontSize: 14, color: 'var(--muted)' }}>You have not flagged anyone yet.</div>}
      {mine.map((m) => (
        <button key={m.id} className="plain row col" onClick={() => t.setView({ k: 'thread', id: m.id })} style={{ flex: 'none', padding: '12px 14px', gap: 4 }}>
          <span className="px" style={{ fontSize: 16, lineHeight: 1.2 }}>{m.title}</span>
          <span style={{ font: '700 12px var(--sans)', color: 'var(--muted)' }}>{m.score + (t.votes[m.id] || 0)} agree · {countComments(m)} comments · {ageOf(m.t)}</span>
        </button>
      ))}
    </div>
  );
}
