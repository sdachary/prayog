# Prayog — Tool Reference

## pravah — Phone ⇄ laptop media streaming

| | |
|---|---|
| **What** | Pick videos/music on one device; the other device lists them and plays them in a normal `<video>`/`<audio>` player with full seeking and next/previous. Symmetric: each side can share and watch at the same time. Nothing is uploaded — bytes are read from the sharing device on demand. Pair with an 8-digit code or by scanning the QR. Both screens show a 6-digit link code (hash of the two DTLS fingerprints) to confirm nobody sits in between; the sharing side must accept each connection. A "save" button downloads a file straight to disk. |
| **How** | PeerJS data channel (raw binary, 16 KB frames, back-pressured). A service worker (`pravah/sw.js`) answers the player's HTTP Range requests by asking the page for the next 1 MB piece, which the page fetches from the peer. Pull-based, so pausing never buffers the whole file. STUN only — no TURN relay, so media stays on the local network. |
| **Dependencies** | PeerJS 1.5.4 (signalling only — same pinned CDN build + SRI as Sandesh); `qrcode.min.js` (vendored) |
| **Offline option** | `pravah/serve.py` — one-file Python 3 server (no dependencies): `python3 serve.py ~/Videos`, open the printed address on the phone. Proper Range support (unlike `python3 -m http.server`), inline player, optional upload from the phone (`--no-upload` to disable), dotfiles hidden, Host-header check against DNS rebinding. |
| **Limits** | Needs HTTPS (or localhost) for the service worker, and internet once to pair. Both devices must be on the same Wi-Fi with no client isolation. The sharing tab must stay open (phones: don't lock the screen — a wake lock is requested). What plays depends on the *watching* browser's codecs (MP4/H.264, WebM, MP3, AAC, … yes; MKV/AVI/FLAC often not — use "save"). |

---

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

## sandesh — WebRTC file transfer + E2EE chat

| | |
|---|---|
| **What** | Send files between two browsers only after the receiver accepts each batch (per-batch folder or downloads destination). Chat tab with end-to-end encrypted ephemeral messages (ECDH + AES-GCM, safety-number verification). Pair devices with an 8-digit code. |
| **Dependencies** | PeerJS 1.5.4 (signaling only — no file/chat data passes through it); WebCrypto (native) |
| **Limits** | Works over the internet when STUN/TURN can find a path (a TURN relay on oradev covers symmetric NAT); very restrictive networks may still fail. Large files limited by browser memory. Chat messages vanish on disconnect. |

---

## drishti — Read-only file scanner

| | |
|---|---|
| **What** | Point it at a folder, it recursively lists every file and reports which ones fail to open. Read-only — nothing is modified. |
| **Dependencies** | None (File System Access API and FileReader) |
| **Limits** | Browser-dependent folder access. Some browsers limit the number of files you can select at once. |

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

## tulna — Text diff

| | |
|---|---|
| **What** | Paste two texts side-by-side, click diff. Highlights added and removed lines using LCS. |
| **Dependencies** | None |
| **Limits** | Large texts may be slow with the O(n²) LCS algorithm. |

---
