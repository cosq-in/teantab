#!/usr/bin/env python3
"""Tag court judgments as designer-side or not, with a keyword check. A first filter, never a verdict.

Reads Indian Kanoon links from the seed CSVs, gets each judgment, counts design-related and
legal-practice words, and writes a CSV for a person to review. It stores keyword counts only,
not judgment text.

Where the text comes from (pick one):
  --dir DIR     files you saved yourself, named <docid>.html or <docid>.txt   (no network)
  API           Indian Kanoon's official API (https://api.indiankanoon.org). Needs a paid key:
                  export INDIANKANOON_TOKEN=...
It does not crawl or search. It only opens the doc ids listed in the CSVs, one at a time,
every few seconds, so it stays a handful of requests, not a scrape.

  python3 tools/classify_judgments.py ~/Downloads/india_*_seed_*.csv --dir ./judgments > review.csv
"""
import argparse, csv, html, json, os, re, sys, time, urllib.request

DESIGN = re.compile(r"\b(graphic|web ?design\w*|ui/?ux|user interface|interior design\w*|architect(?:s|ure|ural)?|architectural|logo|brand(?:ing)?|illustrat\w+|animation|motion graphics|video edit\w*|thumbnail|packaging|creative (?:work|services|agency)|design(?:er|ers|ing)?|freelanc\w+)\b", re.I)
LEGAL = re.compile(r"\b(advocate|vakalatnama|counsel fees?|law firm|solicitors?|legal (?:fees|services|notice)|bar council|brief fee|appearance fee)\b", re.I)
DOC_ID = re.compile(r"indiankanoon\.org/doc/(\d+)")
PAUSE_SECONDS = 4


def doc_ids(paths):
    seen = {}
    for p in paths:
        with open(p, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                m = DOC_ID.search(row.get("source_url", ""))
                if m and m.group(1) not in seen:
                    seen[m.group(1)] = row.get("entity_name", "")
    return seen


def text_from_dir(d, doc):
    for ext in ("html", "txt"):
        p = os.path.join(d, f"{doc}.{ext}")
        if os.path.exists(p):
            raw = open(p, encoding="utf-8", errors="replace").read()
            return html.unescape(re.sub(r"<[^>]+>", " ", raw))
    return None


def text_from_api(token, doc):
    req = urllib.request.Request(f"https://api.indiankanoon.org/doc/{doc}/", data=b"", method="POST",
                                 headers={"Authorization": f"Token {token}", "User-Agent": "teantab-curation/0.1"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    return html.unescape(re.sub(r"<[^>]+>", " ", data.get("doc", "")))


def classify(design_hits, legal_hits):
    if legal_hits >= 3 and design_hits < 3:
        return "legal-fees"           # lawyer-fee suit: out of scope
    if design_hits >= 5 and legal_hits < 3:
        return "likely-design"
    if design_hits >= 3:
        return "possible-design"
    return "not-design"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("csv", nargs="+")
    ap.add_argument("--dir")
    a = ap.parse_args()
    token = os.environ.get("INDIANKANOON_TOKEN")
    if not a.dir and not token:
        sys.exit("give --dir with saved judgments, or set INDIANKANOON_TOKEN (see the top of this file)")
    w = csv.writer(sys.stdout)
    w.writerow(["doc_id", "entity_name", "design_hits", "legal_hits", "top_design_terms", "tag", "note"])
    for doc, entity in doc_ids(a.csv).items():
        try:
            text = text_from_dir(a.dir, doc) if a.dir else text_from_api(token, doc)
        except Exception as e:
            w.writerow([doc, entity, "", "", "", "error", str(e)[:80]])
            continue
        finally:
            if not a.dir:
                time.sleep(PAUSE_SECONDS)
        if text is None:
            w.writerow([doc, entity, "", "", "", "missing", f"no {doc}.html/.txt in {a.dir}"])
            continue
        d = [m.group(0).lower() for m in DESIGN.finditer(text)]
        top = ";".join(f"{t}:{d.count(t)}" for t in sorted(set(d), key=d.count, reverse=True)[:4])
        legal = len(LEGAL.findall(text))
        w.writerow([doc, entity, len(d), legal, top, classify(len(d), legal), "keyword guess: a person must read the judgment"])


if __name__ == "__main__":
    main()
