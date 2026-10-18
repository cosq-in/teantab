# Tea & Tab backend

Implemented in **kurukuru-honbu** (Go), branch `feat/tea-and-tab`: `internal/tea/`, `migrations/017_tea_and_tab.sql`, wired in `main.go`. A copy of the change is in `backend/kurukuru-honbu-tea.patch` (`git am` it onto honbu `main`).

The app calls these routes when `VITE_API_URL` is set. Any failure, timeout (4s) or missing sign-in is ignored and the UI keeps running on its mock seeds.

Auth: `Authorization: Bearer <token>`, verified by honbu's existing `auth.BearerSubject`. The app reads the token from `localStorage["tt_token"]`. Tea & Tab tables use the auth subject as `user_id` with no FK to `users`, so freelancers do not need a college account. The API only ever returns a pseudonymous handle.

| Route | Auth | Purpose | Body → response |
|---|---|---|---|
| `GET /tea/bootstrap` | optional | clients, posts (newest 200), counts | → `{clients, posts, totalFlags, roles, myVotes}`; a token adds `myVotes` and `mine` |
| `GET /tea/me` | yes | caller's handle, issued on first call | → `{handle, role}` |
| `PUT /tea/me` | yes | set role | `{role}` → `{handle, role}` |
| `POST /tea/flags` | yes | file a flag | `{client, gst, job, amount, story, web, insta, cats[], proofs[], pub}` → `Post` (201) |
| `PUT /tea/posts/{id}/vote` | yes | agree / doubtful | `{value: -1\|0\|1}` → `{score}` |
| `POST /tea/posts/{id}/comments` | yes | comment or reply (one level) | `{text, parentId?}` → `Comment` (201) |

`score` is the sum of everyone else's votes; the app adds the viewer's own (`myVotes`). Errors are `{error}` with 400 (invalid), 401, 404, 429, 500.

## Rules enforced
- Clients are matched by GSTIN, else by normalised name; new ones are created on first flag. Later flags fill blank website/social but never overwrite.
- Validation: client ≤120, story ≤2000, 1+ known categories, ≤10 proof labels, GSTIN format, amount whole rupees. Comments ≤1000.
- Rate limits: 5 flags per user per 24h, 30 comments per hour.
- Flags start with `v: 0`; a reviewer sets `proof_checked`. There is no reviewer UI yet.
- `pub: false` flags still return proof type labels only, never files.
- Client `total`, `owed` (₹ Indian grouping) and `tally` are derived from flags.

## Not done
- Proof file upload (UI records a type label only), reviewer/moderation tooling, takedown and right-of-reply flow, notifications.
- The Go SQL in `pgstore.go` is covered by handler and validation tests against an in-memory store, but has **not been run against Postgres** yet. Run the migration and smoke-test the routes on a dev database first.
- Defamation: have counsel review wording and the takedown process before launch.
