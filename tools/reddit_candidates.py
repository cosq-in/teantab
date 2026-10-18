#!/usr/bin/env python3
"""Find Reddit threads worth a look for the "from around the web" feed. Official API only.

This only LISTS candidates (link, title, subreddit, date, counts). It never reads thread bodies
and never writes to Tea & Tab. A person reads each thread, decides, and adds the keepers
through the staff route (see docs/WEB_FEED.md).

Needs a Reddit "script" app (https://www.reddit.com/prefs/apps) and these env vars:
  REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT (e.g. "teantab-curation/0.1 by u/yourname")

  python3 tools/reddit_candidates.py "client not paying" "unpaid invoice" > candidates.json
"""
import base64, json, os, sys, time, urllib.parse, urllib.request

SUBREDDITS = ["IndiaFreelancers", "indianfreelancers", "freelance", "graphic_design", "DesignJobsIndia"]
LIMIT = 25


def need(name):
    v = os.environ.get(name)
    if not v:
        sys.exit(f"set {name} (see the docstring at the top of this file)")
    return v


def token(cid, secret, ua):
    req = urllib.request.Request(
        "https://www.reddit.com/api/v1/access_token",
        data=b"grant_type=client_credentials",
        headers={"Authorization": "Basic " + base64.b64encode(f"{cid}:{secret}".encode()).decode(), "User-Agent": ua},
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)["access_token"]


def search(tok, ua, sub, query):
    q = urllib.parse.urlencode({"q": query, "restrict_sr": "1", "sort": "relevance", "t": "year", "limit": LIMIT, "raw_json": "1"})
    req = urllib.request.Request(f"https://oauth.reddit.com/r/{sub}/search?{q}", headers={"Authorization": "bearer " + tok, "User-Agent": ua})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)["data"]["children"]


def main():
    queries = sys.argv[1:]
    if not queries:
        sys.exit(__doc__)
    cid, secret, ua = need("REDDIT_CLIENT_ID"), need("REDDIT_CLIENT_SECRET"), need("REDDIT_USER_AGENT")
    tok, seen, out = token(cid, secret, ua), set(), []
    for sub in SUBREDDITS:
        for query in queries:
            try:
                kids = search(tok, ua, sub, query)
            except Exception as e:  # keep going; one subreddit failing should not lose the rest
                print(f"skip r/{sub} {query!r}: {e}", file=sys.stderr)
                continue
            for k in kids:
                d = k["data"]
                url = "https://www.reddit.com" + d["permalink"]
                if url in seen:
                    continue
                seen.add(url)
                out.append({
                    "url": url, "sourceTitle": d["title"], "subreddit": d["subreddit"],
                    "threadDate": time.strftime("%Y-%m-%d", time.gmtime(d["created_utc"])),
                    "comments": d["num_comments"], "score": d["score"],
                })
            time.sleep(1)  # stay well inside the rate limit
    out.sort(key=lambda c: c["comments"], reverse=True)
    json.dump(out, sys.stdout, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
