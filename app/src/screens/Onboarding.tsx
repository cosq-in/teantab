import { useState } from 'react';
import { ROLES } from '../data/seed';
import type { Tea } from '../store';

const RULES = [
  { n: 1, t: 'angry? flag them', d: 'Report a client who stiffed, ghosted or crossed a line. Add proof.' },
  { n: 2, t: 'unsure? check them', d: 'Search a client before you sign and see what others went through.' },
  { n: 3, t: 'curious? join the tea', d: 'Read threads, vote, comment and reply. Nicknames only.' },
];
const H = (s: string) => <div className="serif" style={{ fontSize: 26, lineHeight: 1.1 }}>{s}</div>;

export default function Onboarding({ t }: { t: Tea }) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const last = t.apiEnabled ? 3 : 2;
  const canGo = step < 3 || (!!email.trim() && !!password && !busy);
  const go = async () => {
    if (step < last) { setStep(step + 1); return; }
    if (!t.apiEnabled) { t.setOnboard(false); return; }
    setBusy(true); setErr('');
    const e = await t.authenticate(mode, email.trim(), password);
    setBusy(false);
    if (e) setErr(e);
  };
  return (
    <>
      <div className="col ob" style={{ position: 'absolute', inset: 0, padding: 'min(40px,4vh) 22px 0', gap: 'min(10px,1.2vh)', zIndex: 2, overflow: 'hidden' }}>
        <div style={{ alignSelf: 'center', flex: 'none', width: 72, height: 72, background: 'var(--accent)', borderRadius: 22, boxShadow: '0 10px 24px rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'bob 2.4s ease-in-out infinite' }}>
          <svg width="46" height="46" viewBox="0 0 48 48" fill="none" stroke="#241A2B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M10 20h24v8a12 12 0 0 1-12 12h0a12 12 0 0 1-12-12z" fill="#F2E7EA" /><path d="M34 23h3a4 4 0 0 1 0 8h-4" /><path d="M17 8c-2 3 2 4 0 7M24 8c-2 3 2 4 0 7" /></svg>
        </div>
        <div className="serif" style={{ textAlign: 'center', fontSize: 50, lineHeight: 1, color: 'var(--cream)', letterSpacing: -0.5, fontStyle: 'italic' }}>tea &amp; tab</div>
        <div style={{ textAlign: 'center', font: '500 11px var(--mono)', letterSpacing: 1, textTransform: 'uppercase', color: 'var(--accent)', marginTop: -4, whiteSpace: 'nowrap' }}>check the tab. spill the tea.</div>
        <div className="card col" style={{ padding: '20px 18px', gap: 12, marginTop: 6, minHeight: 0, flex: 1, overflow: 'auto' }}>
          {step === 0 && <>
            {H("what's a flag?")}
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>A flag is one report on a client. It says "something went wrong here", with a date, a reason and your proof.</p>
            {t.apiEnabled && <button className="link" onClick={() => { setMode('login'); setStep(3); }}>i already have an account</button>}
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'var(--sub)' }}>The tab is what a client owes you. The tea is everything people say about it. The more flags a client collects, the higher they climb the hall of shame.</p>
          </>}
          {step === 1 && <>
            {H('pick how you use it')}
            {RULES.map((r) => (
              <div key={r.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div className="serif" style={{ flex: 'none', width: 32, height: 32, background: 'var(--accent)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{r.n}</div>
                <div><div className="serif" style={{ fontSize: 17 }}>{r.t}</div><div style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--sub)', marginTop: 2 }}>{r.d}</div></div>
              </div>
            ))}
          </>}
          {step === 2 && <>
            {H('pick a nickname')}
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>This is the only name shown on your flags and comments.</p>
            {t.apiEnabled
              ? <input className="field serif" value={t.handle} onChange={(e) => t.editHandle(e.target.value)} maxLength={20} aria-label="nickname" style={{ textAlign: 'center', fontSize: 22, minHeight: 64 }} />
              : <div className="tile serif" style={{ padding: '18px 12px', textAlign: 'center', fontSize: 22, overflowWrap: 'anywhere' }}>{t.handle}</div>}
            <button className="chip" onClick={t.nextHandle} style={{ minHeight: 44, background: '#fff', boxShadow: 'var(--shadow-soft)', fontSize: 14 }}>try another</button>
            <div className="lbl" style={{ marginTop: 4 }}>WHAT DO YOU DO?</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ROLES.map((r) => <button key={r} className="chip" onClick={() => t.setRole(r)} style={{ background: t.role === r ? 'var(--accent)' : 'var(--paper)' }}>{r}</button>)}
            </div>
          </>}
          {step === 3 && <>
            {H(mode === 'signup' ? 'make your account' : 'welcome back')}
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--sub)' }}>{mode === 'signup' ? 'Your email is only for signing in. It is never shown, only your nickname is.' : 'Sign in with the email you used before.'}</p>
            <input className="field" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
            <input className="field" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && canGo && go()} placeholder="password (8+ characters)" />
            {err && <div role="alert" style={{ font: '700 13px/1.4 var(--sans)', color: 'var(--red)' }}>{err}</div>}
            <button className="link" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setErr(''); }}>{mode === 'signup' ? 'i already have an account' : 'new here? make an account'}</button>
          </>}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flex: 'none' }}>
          {Array.from({ length: last + 1 }, (_, i) => i).map((i) => <div key={i} style={{ width: i === step ? 28 : 10, height: 10, border: '1px solid var(--line)', borderRadius: 9999, background: i === step ? 'var(--accent)' : '#fff' }} />)}
        </div>
        <button className="btn" onClick={go} disabled={!canGo} style={{ flex: 'none', marginBottom: 'min(36px,3.5vh)', opacity: canGo ? 1 : 0.6 }}>{step === last ? (busy ? 'one sec...' : t.apiEnabled ? (mode === 'signup' ? 'make account' : 'sign in') : 'enter tea & tab') : 'next'}</button>
      </div>
    </>
  );
}
