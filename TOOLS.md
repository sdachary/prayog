# Prayog — Tool Reference

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
