# Prayog

Standalone browser utilities — each tool is a self-contained HTML file, zero build step, zero backend.

| Tool | What |
|------|------|
| [Sandesh](sandesh/) | Local network file transfer via WebRTC. Pair devices with a 6-digit code and send files directly browser-to-browser. |
| [Drishti](drishti/) | Read-only file scanner. Point it at a folder and it reports which files fail to open — nothing is modified. |
| [Shuddhi](shuddhi/) | Windows PC cleanup guide and malware scanner. Step-by-step + automated script. |
| [Badhai](badhai/) | Video-to-audio converter — browser-based via FFmpeg.wasm. Drop video, pick format, download. |
| [Rachna](rachna/) | JSON / YAML / CSV formatter, validator & converter. Paste or drop, auto-detect, pretty-print, convert. |
| [Sanket](sanket/) | QR code generator & camera scanner. Generate with text/URLs, download PNG/SVG, scan with device camera. |
| [Sankshep](sankshep/) | Image compressor & resizer. Drop an image, adjust quality/dimensions, preview size, download. |
| [Tulna](tulna/) | Text diff tool. Compare two texts with side-by-side word-level diff highlighting. |
| [Zarya](zarya/) | External drive repair for Linux & macOS. Step-by-step guide with copy-ready commands. |
| [Games](games/) | Snake & Ladder and Color Match — two quick browser games. Formerly the saraswati project. |

## Deploy

Deploy as static pages to Cloudflare Pages, GitHub Pages, or any static host. No build step — point at the repo root.

```bash
# GitHub Pages: push to main, enable in repo Settings > Pages
# Cloudflare Pages: connect repo, Framework preset = None, Build output = /
```
