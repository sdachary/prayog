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
│   ├── nav.js         Breadcrumb navigation injected into every tool page
│   ├── orb.js         <thinking-orb> custom element (loading-state animation)
│   ├── vendor/        Self-hosted third-party code (see vendor/README.md)
│   ├── landing.css    Landing page styles
│   ├── cdn-guard.js   Banner shown when a CDN <script> fails to load
│   └── cookie-banner.js
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
├── badhai/            Video-to-audio via FFmpeg.wasm
├── rachna/            JSON/YAML/CSV formatter & converter
├── sanket/            QR code generator + scanner
├── sankshep/          Image compressor & resizer
├── tulna/             Text diff
├── vibhajan/          Excel/CSV batch splitter
├── pahchan/           ID card → Excel OCR extractor
├── rin-ledger/        Home loan amortization calculator
├── vahak-uploader/    Mass uploader to Google Drive
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

### `assets/nav.js`
Injects a breadcrumb trail at the top of each tool page. Usage:
```html
<script src="../assets/nav.js" data-tool="tulna"></script>
```
The `data-tool` attribute sets the current page name in the breadcrumb.

### `assets/orb.js` + `assets/vendor/thinking-orbs-engine.js`
A `<thinking-orb>` custom element that renders the dotted loading orbs from
[thinking-orbs](https://github.com/Jakubantalik/thinking-orbs) (MIT). It turns
"something is happening" into a *state* the user can read at a glance — a
globe being scanned, a constellation being wired up — instead of a generic
spinner.

The engine is upstream's framework-free `./engine` entry: pure geometry, zero
React, zero DOM. No npm, no build step, no runtime CDN.

Usage — load the engine first, then the wrapper, both with `defer`:
```html
<script src="../assets/vendor/thinking-orbs-engine.js" defer></script>
<script src="../assets/orb.js" defer></script>
...
<thinking-orb state="connecting" size="20" aria-hidden="true"></thinking-orb>
```

| Attribute | Values | Default |
|---|---|---|
| `state` | `working` `searching` `solving` `listening` `connecting` `weaving` `composing` `breathing` `shaping` | `working` |
| `size` | `20` (inline) or `64` (card) — two separately tuned upstream presets, not a scale factor | `64` |
| `speed` | multiplier on the preset's baked speed | `1` |
| `paused` | freeze on the current frame | off |
| `theme` | `auto` `dark` `light` — `auto` reads `data-theme` / `.dark` / `.light` on any ancestor, then `prefers-color-scheme`, and updates live | `auto` |
| `label` | overrides the per-state `aria-label` | per-state |

Rules for using it:

- **The orb is decoration; the text is the message.** Mark it `aria-hidden="true"`
  and put the state in an adjacent `role="status"` element. Two live regions
  saying the same thing is noise, and screen readers announce the text anyway.
- **Classic script, not `type="module"`.** ES modules are CORS-blocked under
  `file://`; the tools are meant to open straight from disk. Reference the two
  files with a *relative* path (`../assets/...`) for the same reason — the rest
  of the repo's absolute `/assets/…` paths already make the pages server-only.
- **`prefers-reduced-motion` is handled in the wrapper, not CSS.** The global
  rule in `theme.css` only kills CSS animations; canvas `requestAnimationFrame`
  would keep running. The wrapper renders a static frame instead.
- **Prefer the tuned sizes.** `20` is designed for inline text, `64` for a card.
  At inline scale `searching` and `working` read clearly; `connecting` is a
  sparse 8-dot constellation, so reserve it for a moment that earns it.

Provenance, licence, and how to regenerate: `assets/vendor/README.md`.

## Adding a new tool

1. Create `new-tool-name/index.html` — self-contained HTML file
2. Link shared CSS in `<head>`:
   - `<link rel="stylesheet" href="/assets/theme.css">`
3. Use shared classes: `.btn`/`.btn-primary`/`.btn-secondary` for buttons, `.dropzone` for drag-and-drop targets, `.error` for error banners, `.visually-hidden` for screen-reader-only labels, CSS variable tokens (`var(--bg)`, `var(--text)`, `var(--muted)`, etc.) instead of hardcoded colors
4. Add keyboard a11y: `tabindex="0" role="button"` + `onkeydown` handler on interactive non-button elements; `focus-visible` outlines on custom controls
5. Add `<script src="../assets/nav.js" defer data-tool="new-tool-name"></script>` in `<head>`
6. Add favicon + manifest links in `<head>`
7. Add a card to `index.html`'s `.grid`
8. Add a row to `README.md`'s tool table
9. If the tool has a long-running step, add a `<thinking-orb>` next to the
   status text — see `assets/orb.js` above for the attributes and the
   `aria-hidden` + `role="status"` pairing

## Browser support

Chrome, Firefox, Safari, Edge — latest 2 versions. ES6+ JavaScript. No polyfills.
