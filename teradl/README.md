# teradl

Batch download files from TeraBox / 1024terabox share links.

## Usage

```bash
# create a file with one URL per line
cat urls.txt
# https://1024terabox.com/s/1ABC...
# https://1024terabox.com/s/1DEF...

# download all files to ./downloads/
python3 teradl.py urls.txt

# custom output dir and delay between downloads
python3 teradl.py urls.txt --out ~/Videos --delay 5
```

## How it works

1. Reads URLs from a text file (one per line, skips duplicates)
2. For each URL: resolves the share page, extracts API tokens
3. Calls TeraBox's share/list API to get file metadata + download links
4. Downloads files via `curl` with resume support (`-C -`)
5. Skips files that already exist at the correct size

## Requirements

- Python 3.7+ (no pip dependencies — uses only the standard library)
- `curl` (for downloading with resume + progress bar)

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `urls` | (required) | Text file with one TeraBox URL per line |
| `--out` | `./downloads` | Output directory |
| `--delay` | `2` | Seconds to wait between downloads (avoid rate limiting) |

## Output

```
Found 30 unique TeraBox links (35 total, 5 duplicates removed)

[1/30] Processing https://1024terabox.com/s/1ABC...
  Resolved: https://www.terabox.com/s/1ABC...
  Fetching share page...
  Found 2 file(s):
    video.mkv (1.4GB)
    subtitle.srt (12.3KB)
  Downloading video.mkv (1.4GB)...
  OK: ./downloads/video.mkv

Done: 2 downloaded, 0 skipped, 0 failed
```

## Limitations

- Only works with **public** TeraBox shares (no password-protected links)
- Some links may require login — the script doesn't handle authentication
- Rate limiting: if downloads fail, increase `--delay`
- Large files: curl handles resume, so interrupted downloads pick up where they left off
