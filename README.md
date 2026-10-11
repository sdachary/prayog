# Prayog

Standalone browser utilities — each tool is a self-contained HTML file, zero build step, zero backend.

| Tool | What |
|------|------|
| [Rin Ledger](rin-ledger/) | Home loan amortization calculator — track payoff, prepayments, and rent-vs-buy math. |
| [Vahak](vahak-uploader/) | Mass uploader to Google Drive — mirror a local folder tree, file by file. |
| [Sandesh](sandesh/) | Device-to-device file transfer via WebRTC. Pair devices with an 8-digit code and send files directly browser-to-browser. |
| [Drishti](drishti/) | Read-only file scanner. Point it at a folder and it reports which files fail to open — nothing is modified. |
| [Badhai](badhai/) | Video-to-audio converter — browser-based via FFmpeg.wasm. Drop video, pick format, download. |
| [Rachna](rachna/) | JSON / YAML / CSV formatter, validator & converter. Paste or drop, auto-detect, pretty-print, convert. |
| [Sanket](sanket/) | QR code generator & camera scanner. Generate with text/URLs, download PNG/SVG, scan with device camera. |
| [Sankshep](sankshep/) | Image compressor & resizer. Drop an image, adjust quality/dimensions, preview size, download. |
| [Tulna](tulna/) | Text diff tool. Compare two texts with side-by-side line-level diff highlighting. |
| [Vibhajan](vibhajan/) | Excel/CSV batch splitter — chunk a large spreadsheet into smaller files by row count, download parts individually or as ZIP. |
| [Pahchan](pahchan/) | ID card → Excel extractor — OCR one sample card to define fields, then bulk-extract Name/ID/Mobile from many photos/PDFs. |

## Deploy

Deploy as static pages to Cloudflare Pages, GitHub Pages, or any static host. No build step — point at the repo root.

```bash
# GitHub Pages: push to main, enable in repo Settings > Pages
# Cloudflare Pages: connect repo, Framework preset = None, Build output = /
```
