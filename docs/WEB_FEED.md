# "From around the web"

A small, staff-curated list of links to public Reddit threads about clients. It is **not** a source of Tea & Tab flags and is never mixed with them.

## Rules
- Every item is labelled **UNVERIFIED**, names its source, thread date and the thread's own title, and links out. We store the link, the source's title and a short summary written by us. Never the thread text.
- Summaries are neutral and attributed ("a freelancer says..."). They don't state the allegation as fact.
- Nothing is bulk-loaded. A person reads each thread and adds it by hand.
- Any item can be hidden by a removal request. Filing one hides the item immediately; staff then restore it or remove it. Open requests: `GET /tea/admin/removals`.
- Have counsel review this policy and the summary style before launch.

## Setup
1. Run `migrations/020_tea_web_items.sql` on the database.
2. Create the staff account in the app (nickname `teantab_admin`) and set `TEA_ADMIN_EMAILS` on the server to that account's email (comma separated for more than one).
3. Staff routes use that account's token (`tt_token`, or the `token` returned by `POST /tea/auth/login`).

## Finding candidates
Needs a Reddit "script" app at https://www.reddit.com/prefs/apps (official API, no scraping).
```
export REDDIT_CLIENT_ID=... REDDIT_CLIENT_SECRET=... REDDIT_USER_AGENT="teantab-curation/0.1 by u/<you>"
python3 tools/reddit_candidates.py "client not paying" "unpaid invoice" > candidates.json
```
It only lists links, titles and counts. Read each thread yourself before adding anything.

## Adding and managing items
```
curl -X POST $API/tea/admin/web -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{
  "url": "https://www.reddit.com/r/IndiaFreelancers/comments/.../",
  "sourceTitle": "<the thread title, as posted>",
  "about": "<company the thread is about>",
  "summary": "A freelancer says ... (neutral, 20-400 chars)",
  "threadDate": "2026-03-14"
}'
curl -X PUT $API/tea/admin/web/<id> -H "Authorization: Bearer $TOKEN" -d '{"status":"published|held|removed"}'
```
Only `https://…reddit.com/r/…` thread links are accepted.
