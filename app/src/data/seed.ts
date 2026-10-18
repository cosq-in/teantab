import type { Client, Post } from './types';

export const CATS = ['Payment delayed or unpaid', 'Scope creep', 'Ghosting', 'Abusive behaviour', 'IP misuse', 'Unpaid trial work', 'Contract dispute'];
export const ROLES = ['designer', 'video editor', 'developer', 'writer', 'photographer', 'marketer', 'illustrator'];
export const HANDLES = ['QuietMaina42', 'SilentSparrow88', 'PaperKite21', 'AmberReed90', 'MintLynx07', 'CobaltMoth15'];
export const PROOF_TYPES = ['WhatsApp chat', 'Invoice', 'Email', 'Bank statement', 'Voice note', 'Contract'];
export const SEED_ROLES: Record<string, string> = { SilentSparrow88: 'designer', LateNightLynx: 'video editor', PaperKite21: 'copywriter', CobaltMoth15: 'web developer', DriftingBanyan: 'illustrator', SlateKoel33: 'photographer', MintLynx07: 'motion designer', QuietMaina42: 'writer' };

export const SEED_CLIENTS: Client[] = [
  { id: 1, total: 14, name: 'Zenith Brandworks Pvt Ltd', short: 'Zenith Brandworks', kind: 'Marketing agency', loc: 'Mumbai', links: [['web', 'zenithbrand.in'], ['instagram', '@zenithbrandworks']], owed: '₹1,42,000', tally: [['Late payment', 9], ['Scope creep', 3], ['Ghosting', 2]] },
  { id: 2, total: 9, name: 'Nimbus Edtech LLP', short: 'Nimbus Edtech', kind: 'Edtech startup', loc: 'Bengaluru', links: [['web', 'nimbus.edu.in'], ['linkedin', '/company/nimbus-edtech']], owed: '₹65,000', tally: [['Unpaid trial', 5], ['IP misuse', 4]] },
  { id: 3, total: 6, name: 'Rajdhani Retail Co.', short: 'Rajdhani Retail', kind: 'E-commerce', loc: 'Gurugram', links: [['web', 'rajdhaniretail.in']], owed: '₹38,500', tally: [['Abusive', 3], ['Contract dispute', 3]] },
  { id: 4, total: 3, name: 'Saffron Studios', short: 'Saffron Studios', kind: 'Production house', loc: 'Pune', links: [['instagram', '@saffronstudios']], owed: '₹23,000', tally: [['Late payment', 3]] },
  { id: 5, total: 2, name: 'Orbit Fintech Pvt Ltd', short: 'Orbit Fintech', kind: 'Fintech', loc: 'Hyderabad', links: [['web', 'orbitpay.in']], owed: '₹0', tally: [['Ghosting', 2]] },
];

export const SEED_POSTS: Post[] = [
  { id: 1, cid: 1, who: 'SilentSparrow88', t: 5, score: 312, cat: 'Late payment', v: 1, pub: true, proofs: ['WhatsApp chat', 'Invoice'], title: "5 reminders, same excuse: 'finance will release this week'", text: 'Invoice sent 3 March, due in 15 days. Client confirmed on WhatsApp on 20 March and has not paid. It is now October.', comments: [
    { id: 11, who: 'LateNightLynx', text: 'Same story in March. They paid me 3 months late, and only after I mentioned the MSME Samadhaan portal.', replies: [{ who: 'SilentSparrow88', text: 'Wait, you can file there? Nobody told me this.' }, { who: 'LateNightLynx', text: 'If they are a registered MSME, payment is due within 45 days by law.' }] },
    { id: 12, who: 'PaperKite21', text: 'Their creative director asks for three free revisions before even saying hello.', replies: [] }] },
  { id: 2, cid: 2, who: 'CobaltMoth15', t: 9, score: 244, cat: 'Unpaid trial', v: 1, pub: true, proofs: ['Email thread', 'Live page screenshot'], title: "My free 'test task' was a full landing page. It is live on their site now.", text: 'They said it was a paid-after-approval trial. No contract, no reply, and the page is on their homepage.', comments: [
    { id: 21, who: 'DriftingBanyan', text: 'They did it to me with illustrations too. Check their investor deck.', replies: [{ who: 'CobaltMoth15', text: 'Found it. Same style as my work, slide 7.' }] }] },
  { id: 3, cid: 3, who: 'SlateKoel33', t: 20, score: 171, cat: 'Abusive', v: 1, pub: false, proofs: ['Call log'], title: '11pm calls over a font size change', text: 'Repeated late-night calls and threats to withhold payment over minor revisions. Saved the call log.', comments: [{ id: 31, who: 'MintLynx07', text: 'Block the number and keep everything in email from now on.', replies: [] }] },
  { id: 4, cid: 4, who: 'MintLynx07', t: 70, score: 67, cat: 'Late payment', v: 1, title: 'Paid 74 days late, only after a legal notice', text: 'Agreed terms were net 15. Nothing moved until a lawyer sent a notice.', comments: [] },
  { id: 5, cid: 5, who: 'QuietMaina42', t: 50, score: 41, cat: 'Ghosting', v: 0, title: 'Ghosted for six weeks, then wanted quick changes', text: 'Went silent mid-project, then came back with new demands and no mention of the delay.', comments: [] },
];
