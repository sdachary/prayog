#!/usr/bin/env python3
"""teradl — batch download files from TeraBox share links.

Usage:
    python3 teradl.py <urls-file> [--out DIR] [--delay SECS]

Reads one TeraBox/1024terabox URL per line from <urls-file>, resolves each
to a direct download link via the TeraBox share API, and downloads files
sequentially using curl (supports resume).

No pip dependencies — uses only the Python standard library plus curl.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

MIRROR_DOMAINS = [
    "1024terabox.com",
    "terabox.com",
    "terabox.app",
    "1024tera.com",
    "mirrobox.com",
    "nephobox.com",
    "freeterabox.com",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

DL_HEADERS = {
    "User-Agent": HEADERS["User-Agent"],
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": "https://www.terabox.com/",
}


def extract_surl(url):
    """Extract the share ID (surl) from a TeraBox URL."""
    m = re.search(r"/s/([A-Za-z0-9_-]+)", url)
    return m.group(1) if m else None


def resolve_url(url):
    """Follow redirects to get the canonical URL (handles domain switches)."""
    req = urllib.request.Request(url, headers=HEADERS, method="GET")
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        return resp.url
    except urllib.error.HTTPError as e:
        if e.code in (301, 302, 303, 307, 308):
            return e.headers.get("Location", url)
        raise
    except Exception:
        return url


def fetch_page(url, cookies=None):
    """Fetch a page and return (body, cookie_header_value)."""
    req = urllib.request.Request(url, headers=HEADERS)
    if cookies:
        req.add_header("Cookie", cookies)
    try:
        resp = urllib.request.urlopen(req, timeout=20)
        body = resp.read().decode("utf-8", errors="replace")
        # collect set-cookie
        hdrs = resp.headers.get_all("Set-Cookie") or []
        cookie_str = "; ".join(
            c.split(";")[0] for c in hdrs if "=" in c
        )
        return body, cookie_str
    except Exception as e:
        return None, str(e)


def extract_tokens(html):
    """Extract jsToken, dpLogid, and shorturl from the share page HTML."""
    tokens = {}
    # jsToken
    m = re.search(r'window\.__INITIAL_STATE__\s*=\s*({.*?});?\s*</script>', html, re.S)
    if m:
        try:
            obj = json.loads(m.group(1))
            if "jsToken" in obj:
                tokens["jsToken"] = obj["jsToken"]
        except (json.JSONDecodeError, KeyError):
            pass
    # fallback: jsToken from meta or script
    if "jsToken" not in tokens:
        m = re.search(r'"jsToken"\s*:\s*"([^"]+)"', html)
        if m:
            tokens["jsToken"] = m.group(1)
    # dpLogid
    m = re.search(r'"dpLogid"\s*:\s*"([^"]+)"', html)
    if m:
        tokens["dpLogid"] = m.group(1)
    else:
        tokens["dpLogid"] = str(int(time.time() * 1000))
    return tokens


def list_files(surl, tokens, cookies=""):
    """Call TeraBox share/list API and return file list."""
    base = "https://www.terabox.com"
    params = {
        "app_id": "250528",
        "shorturl": surl,
        "root": "1",
        "page": "1",
        "num": "100",
        "channel": "dubox",
        "clienttype": "0",
        "jsToken": tokens.get("jsToken", ""),
        "dplogid": tokens.get("dpLogid", ""),
    }
    url = f"{base}/share/list?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={
        **HEADERS,
        "Referer": f"{base}/s/{surl}",
        "Cookie": cookies,
    })
    try:
        resp = urllib.request.urlopen(req, timeout=20)
        data = json.loads(resp.read().decode("utf-8", errors="replace"))
        if data.get("errno") == 0:
            return data.get("list", []), None
        return [], f"API error: errno={data.get('errno')} msg={data.get('errmsg','')}"
    except Exception as e:
        return [], f"API request failed: {e}"


def collect_files(file_list):
    """Flatten recursive file list into [(server_filename, dlink, size)]."""
    files = []
    for f in file_list:
        if f.get("isdir") == "0":
            name = f.get("server_filename", "unknown")
            link = f.get("direct_link") or f.get("dlink") or ""
            size = int(f.get("size", 0))
            if link:
                files.append((name, link, size))
    return files


def fmt_size(n):
    for u in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.1f}{u}"
        n /= 1024
    return f"{n:.1f}TB"


def download_file(name, url, out_dir):
    """Download a file using curl with resume support and progress bar."""
    safe_name = re.sub(r'[\\/*?:"<>|]', "_", name)
    path = os.path.join(out_dir, safe_name)
    cmd = [
        "curl", "-L", "-C", "-",
        "-o", path,
        "-H", f"User-Agent: {DL_HEADERS['User-Agent']}",
        "-H", f"Referer: {DL_HEADERS['Referer']}",
        "--progress-bar",
        "--retry", "3",
        "--retry-delay", "2",
        "--connect-timeout", "15",
        "--max-time", "0",
        url,
    ]
    return subprocess.run(cmd).returncode, path


def main():
    ap = argparse.ArgumentParser(description="Batch download from TeraBox share links")
    ap.add_argument("urls", help="Text file with one TeraBox URL per line")
    ap.add_argument("--out", default="./downloads", help="Output directory (default: ./downloads)")
    ap.add_argument("--delay", type=float, default=2, help="Seconds between downloads (default: 2)")
    args = ap.parse_args()

    if not os.path.isfile(args.urls):
        print(f"File not found: {args.urls}", file=sys.stderr)
        sys.exit(1)

    os.makedirs(args.out, exist_ok=True)

    # read and dedupe URLs
    with open(args.urls) as f:
        raw = [line.strip() for line in f if line.strip()]
    seen = set()
    urls = []
    for u in raw:
        surl = extract_surl(u)
        if surl and surl not in seen:
            seen.add(surl)
            urls.append(u)
    print(f"Found {len(urls)} unique TeraBox links ({len(raw)} total, {len(raw)-len(urls)} duplicates removed)")

    success = 0
    failed = []
    skipped = 0

    for i, url in enumerate(urls, 1):
        surl = extract_surl(url)
        print(f"\n[{i}/{len(urls)}] Processing {url}")

        # resolve to canonical domain
        resolved = resolve_url(url)
        print(f"  Resolved: {resolved}")

        # fetch share page for cookies and tokens
        print("  Fetching share page...")
        html, cookies = fetch_page(resolved)
        if not html:
            print(f"  FAILED: could not fetch page: {cookies}")
            failed.append((url, "page fetch failed"))
            continue

        tokens = extract_tokens(html)
        print(f"  jsToken: {'yes' if tokens.get('jsToken') else 'no'}")

        # call list API
        file_list, err = list_files(surl, tokens, cookies)
        if err:
            print(f"  FAILED: {err}")
            failed.append((url, err))
            continue

        files = collect_files(file_list)
        if not files:
            print("  No downloadable files found")
            failed.append((url, "no files"))
            continue

        print(f"  Found {len(files)} file(s):")
        for name, link, size in files:
            print(f"    {name} ({fmt_size(size)})")

        # download each file
        for name, link, size in files:
            safe = re.sub(r'[\\/*?:"<>|]', "_", name)
            dest = os.path.join(args.out, safe)
            if os.path.exists(dest) and os.path.getsize(dest) >= size:
                print(f"  SKIP (already exists): {safe}")
                skipped += 1
                continue
            print(f"  Downloading {safe} ({fmt_size(size)})...")
            rc, path = download_file(name, link, args.out)
            if rc == 0:
                print(f"  OK: {path}")
                success += 1
            else:
                print(f"  FAILED (exit {rc}): {safe}")
                failed.append((url, f"download failed: {safe}"))

        if i < len(urls) and args.delay > 0:
            time.sleep(args.delay)

    # summary
    print(f"\n{'='*50}")
    print(f"Done: {success} downloaded, {skipped} skipped, {len(failed)} failed")
    if failed:
        print("\nFailed:")
        for url, reason in failed:
            print(f"  {url} — {reason}")


if __name__ == "__main__":
    main()
