# Vendored third-party code

Self-hosted copies of external libraries. No CDN at runtime, no npm, no build step.

| File | Library | Version | Licence | Why vendored |
|---|---|---|---|---|
| `js-yaml.min.js` | [js-yaml](https://github.com/nodeca/js-yaml) | 4.1.0 | MIT | YAML parsing for **rachna** |
| `qrcode.min.js` | qrcode-generator (API: `QRCode`) | unversioned build | MIT | QR generation for **sanket** |
| `thinking-orbs-engine.js` | [thinking-orbs](https://github.com/Jakubantalik/thinking-orbs) | v0.3.1 | MIT | dotted loading orbs for **sandesh**, **badhai**, **drishti** |

The first two files carry their upstream licence banner inline as the first
line. `thinking-orbs-engine.js` carries the full MIT text in its header.

## thinking-orbs-engine.js

* **Source:** `https://github.com/Jakubantalik/thinking-orbs`
* **Version:** git tag `v0.3.1`, commit `bd204b73c9b6660fad7210b1ad48d9dc2adbb89d`
* **Licence:** MIT © 2026 Jakub Antalik
* **What it is:** upstream's `./engine` entry point — pure geometry and 2D-canvas
  painters, zero React and zero DOM. The React component is *not* included.
* **Built with:** `esbuild src/engine/index.ts --bundle --format=iife
  --global-name=ThinkingOrbsEngine --minify`
* **Size:** 12,864 bytes raw / ~5.5 KB gzipped

### Why v0.3.1 and not the newer npm release

npm has `thinking-orbs@0.3.2` (published 2026-09-22) which adds a "Gravity"
cursor-warp effect. It has **no matching git tag or public commit** — upstream
`main` is still at the v0.3.1 era — so that release cannot be audited from
source. The two releases' engine geometry is byte-identical across all 18
state × size combinations, so vendoring the tagged v0.3.1 source costs nothing
visually and keeps the whole dependency auditable.

### Why a classic script and not an ES module

prayog's tools are meant to open straight from disk. ES modules are blocked by
CORS under `file://`, so the engine is bundled as an IIFE and `assets/orb.js`
reads it off `window.ThinkingOrbsEngine`. Load order matters — the engine first.

### Upgrading

1. `git clone https://github.com/Jakubantalik/thinking-orbs` and check out the tag.
2. Re-run the esbuild command above into `assets/vendor/thinking-orbs-engine.js`.
3. Update the header comment and this table.
4. Verify all nine states render, in both themes, at both sizes.
