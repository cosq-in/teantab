export interface Reply { who: string; text: string }
export interface Comment { id: number; who: string; text: string; replies: Reply[] }
export interface Post {
  id: number; cid: number; cname?: string; who: string; t: number; score: number; cat: string;
  v: 0 | 1; pub?: boolean; proofs?: string[]; mine?: boolean; title: string; text: string; comments: Comment[];
}
export interface Client {
  id: number; total: number; name: string; short: string; kind: string; loc: string;
  links: string[][]; owed: string; tally: [string, number][];
}
export interface FlagForm { client: string; gst: string; job: string; amount: string; story: string; web: string; insta: string; phones: string[] }
export interface Bootstrap { clients: Client[]; posts: Post[]; totalFlags: number; roles: Record<string, string>; myVotes: Record<string, -1 | 1> }
export interface WebItem { id: number; url: string; source: string; sourceTitle: string; about: string; summary: string; threadDate?: string; kind?: 'thread' | 'court'; court?: string }
