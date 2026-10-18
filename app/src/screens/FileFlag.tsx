import { useState } from 'react';
import { CATS, PROOF_TYPES } from '../data/seed';
import { EMPTY_FORM, type Tea } from '../store';
import type { FlagForm } from '../data/types';

const TITLES = ['who is the client?', 'what went wrong?', 'tell us what happened', 'flag is up'];

export default function FileFlag({ t }: { t: Tea }) {
  const prefill = t.view && t.view.k === 'file' ? t.view.prefill || '' : '';
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FlagForm>({ ...EMPTY_FORM, client: prefill });
  const [cats, setCats] = useState<string[]>([]);
  const [proofs, setProofs] = useState<string[]>([]);
  const [pub, setPub] = useState(true);
  const [attest, setAttest] = useState(false);
  const set = (k: keyof FlagForm) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });
  const ok = (step === 0 && !!form.client.trim()) || (step === 1 && !!cats.length) || (step === 2 && attest && !!form.story.trim());
  const next = () => {
    if (!ok) return;
    if (step === 2) t.submitFlag(form, cats, proofs, pub);
    setStep(step + 1);
  };
  const close = () => t.setView(null);
  const text = (k: keyof FlagForm, ph: string, extra?: object) => <input className="field" value={form[k]} onChange={set(k)} placeholder={ph} {...extra} />;

  return (
    <div className="scroll" style={{ paddingBottom: 20 }}>
      <button className="link" onClick={close}>cancel</button>
      <div><div className="lbl">{step === 3 ? 'ALL DONE' : `STEP ${step + 1} OF 3`}</div><h1 className="px" style={{ margin: '4px 0 0', fontSize: 34, lineHeight: 1.05 }}>{TITLES[step]}</h1></div>
      <div style={{ display: 'flex', gap: 3, flex: 'none' }}>{[0, 1, 2].map((i) => <div key={i} style={{ flex: 1, height: 14, border: '2px solid var(--ink)', borderRadius: 2, background: i <= step ? 'var(--green)' : '#D9D3BE' }} />)}</div>

      {step === 0 && <>
        {text('client', 'client or company name')}
        {text('gst', 'gstin (optional, matches the right company)')}
        {text('job', 'what you did, e.g. logo and website')}
        <div className="lbl" style={{ marginTop: 4 }}>THEIR LINKS (OPTIONAL)</div>
        {text('web', 'website, e.g. zenithbrand.in')}
        {text('insta', 'instagram, linkedin or x handle')}
        <div style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>Only describe how the client behaved during the work. Leave out private personal details.</div>
      </>}
      {step === 1 && <>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {CATS.map((c) => { const on = cats.includes(c); return <button key={c} className="chip" onClick={() => setCats(on ? cats.filter((x) => x !== c) : [...cats, c])} style={{ minHeight: 44, padding: '0 14px', fontSize: 14, background: on ? 'var(--green)' : 'var(--paper)', boxShadow: on ? '0 3px 0 var(--ink)' : 'none' }}>{c}</button>; })}
        </div>
        {text('amount', 'amount unpaid in ₹ (optional)', { inputMode: 'numeric' })}
      </>}
      {step === 2 && <>
        <textarea className="field" value={form.story} onChange={set('story')} rows={5} placeholder="stick to facts and dates. invoice sent 3 march, due in 15 days. client confirmed on whatsapp on 20 march and has not paid." style={{ padding: '12px 14px', font: "400 15px/1.5 var(--sans)", resize: 'none' }} />
        <div className="lbl">ADD PROOF</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{PROOF_TYPES.map((k) => <button key={k} className="chip" onClick={() => setProofs([...proofs, k])} style={{ borderStyle: 'dashed', background: 'var(--paper)' }}>+ {k}</button>)}</div>
        {proofs.map((n, i) => (
          <div key={i} className="row" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', boxShadow: 'none' }}>
            <div style={{ flex: 'none', width: 44, height: 44, border: '2px solid var(--ink)', borderRadius: 4, background: 'repeating-linear-gradient(45deg,#E6DFC9 0 6px,#F5EEDC 6px 12px)' }} />
            <div style={{ flex: 1, minWidth: 0, font: '700 13px var(--sans)' }}>{n} {i + 1}.png</div>
            <button className="plain" onClick={() => setProofs(proofs.filter((_, j) => j !== i))} style={{ font: '700 12px var(--sans)', color: 'var(--red)', padding: 6 }}>remove</button>
          </div>
        ))}
        <div className="lbl" style={{ marginTop: 2 }}>WHO CAN SEE YOUR PROOF</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {([['public', true], ['private', false]] as const).map(([l, v]) => <button key={l} className="px" onClick={() => setPub(v)} style={{ flex: 1, minHeight: 46, borderRadius: 6, border: '3px solid var(--ink)', background: pub === v ? 'var(--green)' : 'var(--paper)', fontSize: 15 }}>{l}</button>)}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--sub)' }}>{pub ? 'Everyone can view your proof on the thread. Hide any phone numbers or names before you upload.' : 'Only reviewers see your proof. The thread shows that it was checked, not the files themselves.'}</div>
        <button className="plain" onClick={() => setAttest(!attest)} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span className="px" style={{ flex: 'none', width: 26, height: 26, borderRadius: 6, border: '3px solid var(--ink)', background: attest ? 'var(--green)' : 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{attest ? 'x' : ''}</span>
          <span style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--sub)' }}>This is accurate as far as I know. Flags are checked against my proof before they go public.</span>
        </button>
      </>}
      {step === 3 && <>
        <div className="row" style={{ boxShadow: '0 4px 0 var(--ink)', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="px" style={{ fontSize: 24, lineHeight: 1.15 }}>{form.client} is flagged</div>
          <div style={{ color: 'var(--sub)', fontSize: 14, lineHeight: 1.5 }}>Your flag is live as a thread. A reviewer will check your proof and reach out to {t.handle} if they need more.</div>
        </div>
        <button className="btn" onClick={close}>see it in the tea</button>
      </>}

      {step < 3 && (
        <div style={{ display: 'flex', gap: 12, marginTop: 'auto', flex: 'none', paddingBottom: 5 }}>
          {step > 0 && <button className="btn ghost" onClick={() => setStep(step - 1)}>back</button>}
          <button className="btn" onClick={next} style={{ flex: 1, opacity: ok ? 1 : 0.5 }}>{step === 2 ? 'put the flag up' : 'next'}</button>
        </div>
      )}
    </div>
  );
}
