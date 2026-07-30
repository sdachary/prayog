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

### `assets/theme.css` (dark theme)
Defines the design tokens as CSS custom properties on `:root`:
- `--bg`, `--panel`, `--panel-2`, `--line` — background layers
- `--text`, `--muted` — foreground
- `--amber`, `--teal`, `--red` — accent colors
- `--mono`, `--sans` — font stacks (IBM Plex)
- Spacing/radius/motion/elevation scales (`--space-*`, `--radius-*`, `--ease-*`, `--shadow-*`)
- Shared component classes: `.btn` / `.btn-primary` / `.btn-secondary`, `.dropzone`, `.error`, `.visually-hidden`
- Layout classes: `.wrap`, `.grid`, `.card`, `.tool-name`, `.tool-desc`
- Footer styling + reduced-motion media query

Landing page, Sandesh, Drishti, Badhai, and consolidated tools (Rachna, Sanket, Sankshep, Tulna) link this directly.

### `assets/theme-friendly.css` (light/warm theme — Shuddhi only)
Shuddhi is deliberately visually distinct: warm, light, Outfit font. It targets non-technical users cleaning a compromised PC, where a dark hacker-terminal aesthetic would signal the wrong tone. Links `theme-friendly.css` instead of `theme.css`.

Provides the same variable shape (`--bg`, `--panel`, `--text`, `--muted`, `--accent`, etc.) with different values and its own `@media (prefers-color-scheme: dark)` override.

### `assets/nav.js`
Injects a breadcrumb trail at the top of each tool page. Usage:
```html
<script src="../assets/nav.js" data-tool="tulna"></script>
```
The `data-tool` attribute sets the current page name in the breadcrumb.

## Adding a new tool

1. Create `new-tool-name/index.html` — self-contained HTML file
2. Link shared CSS in `<head>`:
   - Default: `<link rel="stylesheet" href="/assets/theme.css">` (dark theme)
   - Exception: explicitly link `theme-friendly.css` if the tool targets non-technical users
3. Use shared classes: `.btn`/`.btn-primary`/`.btn-secondary` for buttons, `.dropzone` for drag-and-drop targets, `.error` for error banners, `.visually-hidden` for screen-reader-only labels, CSS variable tokens (`var(--bg)`, `var(--text)`, `var(--muted)`, etc.) instead of hardcoded colors
4. Add keyboard a11y: `tabindex="0" role="button"` + `onkeydown` handler on interactive non-button elements; `focus-visible` outlines on custom controls
5. Add `<script src="../assets/nav.js" defer data-tool="new-tool-name"></script>` in `<head>`
6. Add favicon + manifest links in `<head>`
7. Add a card to `index.html`'s `.grid`
8. Add a row to `README.md`'s tool table

## Browser support

Chrome, Firefox, Safari, Edge — latest 2 versions. ES6+ JavaScript. No polyfills.
