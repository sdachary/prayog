# Prayog — Tool Reference

## vibhajan — Excel batch splitter

| | |
|---|---|
| **What** | Split a large XLSX/CSV into smaller files by row count. Pick a sheet (or combine all), choose which columns to include, auto-fill-down merged cells, download parts individually or as ZIP. |
| **Dependencies** | SheetJS xlsx 0.18.5 + JSZip 3.10.1 (CDN) |
| **Limits** | Very large files limited by browser memory. Large row counts may take a moment on chunking. |

---

## pahchan — ID card → Excel extractor

| | |
|---|---|
| **What** | OCR ID card photos/PDFs into Excel. Upload one sample card to define fields, then bulk-extract Name/ID/Mobile (or custom fields) from many files, review corrections, and export or append to an existing workbook. |
| **Dependencies** | Tesseract.js v5.0.4 (OCR), pdf.js 3.11.174 (PDF render), SheetJS xlsx 0.18.5 (Excel) — all CDN |
| **Limits** | First OCR run downloads Tesseract engine (~1–3MB). OCR accuracy depends on photo quality. Large batches limited by browser memory. |

---

## rin-ledger — Home loan amortization

| | |
|---|---|
| **What** | Calculate EMI, track payoff schedules, simulate prepayments, and compare rent vs buy — all in-browser. |
| **Dependencies** | None (pure JavaScript, SVG charts) |
| **Limits** | Large tenures (40+ years) may have many rows but still performant. |

---

## vahak-uploader — Mass uploader to Google Drive

| | |
|---|---|
| **What** | Pick a local folder, mirror its tree into Google Drive file by file, move each to a "processed" folder on success. Resumable chunked uploads with pause/resume/cancel. |
| **Dependencies** | Google Identity Services (CDN), File System Access API |
| **Limits** | Requires HTTPS/localhost. Browser memory limits large files. OAuth Client ID required. |

---

## sandesh — WebRTC file transfer

| | |
|---|---|
| **What** | Local network file transfer between two browsers. Pair devices with a 6-digit room code. |
| **Dependencies** | None (WebRTC is native in modern browsers) |
| **Limits** | Both devices must be on the same local network (or have STUN/TURN). Large files limited by browser memory. |

---

## drishti — Read-only file scanner

| | |
|---|---|
| **What** | Point it at a folder, it recursively lists every file and reports which ones fail to open. Read-only — nothing is modified. |
| **Dependencies** | None (File System Access API and FileReader) |
| **Limits** | Browser-dependent folder access. Some browsers limit the number of files you can select at once. |

---

## safai — Ubuntu app cleanup

| | |
|---|---|
| **What** | Step-by-step terminal guide to find and remove unwanted apps on Ubuntu — list installed packages by disk size, check live RAM/CPU with htop, see disk usage visually with baobab, then `remove`/`purge` apps and clean leftover dependencies and the apt cache. Includes a copy-ready one-liner to surface the 30 largest packages immediately. |
| **Dependencies** | None (static HTML guide) |
| **Limits** | Commands execute on the user's own machine. `purge` is not reversible for config/settings — the guide calls out using `remove` instead when that matters. |

---

## shuddhi — Windows PC cleanup

| | |
|---|---|
| **What** | Step-by-step cleanup guide for a compromised Windows PC, plus an automated scanner PowerShell script. |
| **Dependencies** | None (static guide + script download) |
| **Limits** | The script is a PowerShell `.ps1` — user must have execution rights on their Windows machine. |

---

## badhai — Video-to-audio extraction

| | |
|---|---|
| **What** | Drop a video file, pick output format (MP3/WAV/AAC/OGG), optionally set start/end times, download the audio. All processing is local via FFmpeg.wasm. |
| **Dependencies** | FFmpeg.wasm (loaded from CDN on first use, ~30MB cache) |
| **Formats** | Input: MP4, MKV, AVI, WebM, MOV. Output: MP3 (192kbps), WAV (lossless), AAC (128kbps), OGG (128kbps) |
| **Limits** | Large files (>2GB) may strain browser memory. First load fetches 30MB WASM. |

---

## rachna — JSON / YAML / CSV formatter

| | |
|---|---|
| **What** | Paste or drop a structured data file. Auto-detects format, pretty-prints, validates, and converts between JSON/YAML/CSV. |
| **Dependencies** | js-yaml (CDN) |
| **Limits** | Large files may impact performance. |

---

## sanket — QR code generator & scanner

| | |
|---|---|
| **What** | Generate QR codes from text/URLs (download as PNG or SVG). Scan QR codes using your device camera. |
| **Dependencies** | qrcodejs (CDN) for generation, jsQR (CDN) for scanning |
| **Limits** | Scanner requires camera permission and works best in good lighting. |

---

## sankshep — Image compressor & resizer

| | |
|---|---|
| **What** | Drop an image, adjust quality (JPEG/WebP) and max dimensions, preview the compressed result with size comparison, download. |
| **Dependencies** | None (Canvas API) |
| **Limits** | Very large images may be slow. Output limited to formats the browser's Canvas API supports. |

---

## sangrah — yt-dlp setup (clean install)

| | |
|---|---|
| **What** | Step-by-step terminal guide to install yt-dlp on Ubuntu the clean way via pipx — isolated environments, mp4-by-default config, deno JS runtime, and an animated `rich` progress bar. Ships with a downloadable one-shot `setup_sangrah.sh` that builds the venv, installs `yt-dlp` + `rich` + deno, writes the mp4 config, and drops `yt-dlp` + a `ytdl-nice` progress wrapper into `~/bin`. |
| **Dependencies** | Script needs Python 3 venv, `pip`, and `curl` (Ubuntu/Debian). `yt-dlp` and `rich` are pip-installed into the isolated venv; deno is fetched from deno.land. |
| **Limits** | Guide + script run on the user's own machine. PEP 668 (externally-managed-environment) is sidestepped via pipx or the included venv — both isolate yt-dlp from system Python. |

---

## tulna — Text diff

| | |
|---|---|
| **What** | Paste two texts side-by-side, click diff. Highlights additions and deletions at the word level using LCS. |
| **Dependencies** | None |
| **Limits** | Large texts may be slow with the O(n²) LCS algorithm. |

---

## zarya — External drive repair

| | |
|---|---|
| **What** | Step-by-step terminal command guide for repairing corrupted external drives on Linux and macOS. Includes OS-specific tabs, copy-ready commands, and an advanced tab with progress scripts, recovery tools, and S.M.A.R.T. health checks. |
| **Dependencies** | None (static HTML guide) |
| **Limits** | A reference guide — commands execute on the user's own machine. User must be comfortable with a terminal. |

---

## games — Browser games

| | |
|---|---|
| **What** | Two games: Snake & Ladder (vs CPU) and Color Match (guess the odd color). |
| **Dependencies** | None |
| **Limits** | Simple single-player games. No save state. |
