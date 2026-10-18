# Tea & Tab backend

Implemented in **kurukuru-honbu** (Go), branch `feat/tea-and-tab`: `internal/tea/`, `migrations/017_tea_and_tab.sql`, wired in `main.go`.

The app calls these routes when `VITE_API_URL` is set. Any failure, timeout (4s) or missing sign-in is ignored and the UI keeps running on its mock seeds.

Auth: Tea & Tab has its own accounts (`tea_accounts`, migration 019), separate from Kurukuru users and login. `POST /tea/auth/signup {email, password, handle, role}` and `POST /tea/auth/login {email, password}` return `{token, handle, role}`; send it as `Authorization: Bearer <token>`. Tokens are HS256, audience `tea`, 30 days, signed with **`TEA_TOKEN_SECRET`** (16+ chars; without it sign-in returns 503). Passwords are bcrypt; login is throttled (10 tries per 15 min per email and per IP). Email is used only to sign in and is never returned. The app stores the token in `localStorage["tt_token"]`. Not built yet: email verification and password reset.

| Route | Auth | Purpose | Body → response |
|---|---|---|---|
| `POST /tea/auth/signup` | no | make account + profile with chosen nickname (3-20 chars, letters/digits/_) | → `{token, handle, role}` (201); 409 if email or nickname taken |
| `POST /tea/auth/login` | no | sign in | → `{token, handle, role}`; 401 wrong login |
| `GET /tea/bootstrap` | optional | clients, posts (newest 200), counts | → `{clients, posts, totalFlags, roles, myVotes}`; a token adds `myVotes` and `mine` |
| `GET /tea/me` | yes | caller's handle, issued on first call | → `{handle, role}` |
| `GET /tea/clients/by-phone?phone=` | yes | find the client a reported number belongs to | → same shape as bootstrap, narrowed to that client; 404 if none; 20 lookups/hour/user |
| `PUT /tea/me` | yes | set role | `{role}` → `{handle, role}` |
| `POST /tea/flags` | yes | file a flag | `{client, gst, job, amount, story, web, insta, phones[], cats[], proofs[], pub}` → `Post` (201) |
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

## Client phone numbers
Flags can carry up to 5 Indian mobile numbers (normalised to 10 digits). Only an HMAC-SHA256 hash is stored (key `TEA_PHONE_PEPPER`, falling back to `SUPABASE_JWT_SECRET`), in `tea_client_phones` (migration 018). No route ever returns a number; searching a full number returns the matching client. Set the pepper before launch and keep it stable, since changing it orphans stored hashes.

## Not done
- Proof file upload (UI records a type label only), reviewer/moderation tooling, takedown and right-of-reply flow, notifications.
- The Go SQL in `pgstore.go` is covered by handler and validation tests against an in-memory store, but has **not been run against Postgres** yet. Run the migration and smoke-test the routes on a dev database first.
- Defamation: have counsel review wording and the takedown process before launch.
