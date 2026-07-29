# Prayog — Architecture

Standalone browser utilities. Zero backend, zero build step, zero dependencies beyond CDN-loaded libraries where a tool needs them.

## Philosophy

- **Every tool is a self-contained HTML file.** Open it in a browser, it works. No server, no install, no build.
- **Nothing leaves your machine.** File processing is local — Canvas API, WebRTC, FFmpeg.wasm, jsQR. The only exception is CDN library loads for specific features.
- **Dark theme, monospace-leaning aesthetic.** Shared `assets/theme.css` provides CSS custom properties and base layout classes. Each tool page can inline its own styles or import the shared sheet.
- **Mobile-first responsive.** All tools work at 375px and scale up.

## Structure

```
prayog/
├── assets/
│   ├── theme.css      Shared CSS variables and base card layout
│   └── nav.js         Breadcrumb navigation injected into every tool page
├── index.html         Landing page (grid of tool cards)
├── favicon.svg        Site favicon (shared)
├── site.webmanifest   PWA manifest (shared)
├── _headers           Cloudflare/static host security headers
├── README.md          Overview with tool table
├── ARCHITECTURE.md    This file
├── TOOLS.md           Detailed tool reference
├── ROADMAP.md         Progress and future plans
├── sandesh/           WebRTC file transfer
├── drishti/           Read-only file scanner
├── shuddhi/           Windows PC cleanup guide + script
├── badhai/            Video-to-audio via FFmpeg.wasm
├── rachna/            JSON/YAML/CSV formatter & converter
├── sanket/            QR code generator + scanner
├── sankshep/          Image compressor & resizer
├── tulna/             Text diff
├── zarya/             External drive repair guide (Linux/macOS)
└── games/             Browser games (Snake & Ladder, Color Match)
```

## Shared assets

### `assets/theme.css`
Defines the design tokens as CSS custom properties on `:root`:
- `--bg`, `--panel`, `--panel-2`, `--line` — background layers
- `--text`, `--muted` — foreground
- `--amber`, `--teal`, `--red` — accent colors
- `--mono`, `--sans` — font stacks (IBM Plex)
- Layout classes: `.wrap`, `.grid`, `.card`, `.tool-name`, `.tool-desc`
- Footer styling

Landing page uses this directly. Individual tools may inline their own styles for full control.

### `assets/nav.js`
Injects a breadcrumb trail at the top of each tool page. Usage:
```html
<script src="../assets/nav.js" data-tool="tulna"></script>
```
The `data-tool` attribute sets the current page name in the breadcrumb.

## Adding a new tool

1. Create `new-tool-name/index.html` — self-contained HTML file
2. Match the dark theme aesthetic (use `--` variable names from `theme.css` or inline similar values)
3. Add `<script src="../assets/nav.js" data-tool="new-tool-name"></script>` at the end of `<body>`
4. Add favicon + manifest links in `<head>` if you want (all existing tools have them)
5. Add a card to `index.html`'s `.grid`
6. Add a row to `README.md`'s tool table

## Browser support

Chrome, Firefox, Safari, Edge — latest 2 versions. ES6+ JavaScript. No polyfills.
