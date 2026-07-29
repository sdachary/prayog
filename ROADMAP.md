# Prayog — Roadmap

## Current (Phase 0-4 complete)

9 tools across 3 categories:

| Type | Tools |
|------|-------|
| **File** | Sandesh (transfer), Drishti (scan), Rachna (convert), Sankshep (compress), Badhai (extract) |
| **Dev** | Tulna (diff), Sanket (QR) |
| **Guide** | Shuddhi (Windows cleanup), Zarya (drive repair) |

Infrastructure: shared `assets/theme.css` + `assets/nav.js`, `favicon.svg`, `site.webmanifest`, privacy footers, git hygiene (`.wrangler/` untracked, `.editorconfig`, MIT LICENSE).

## Under consideration

### New tools

- **Vayu** — A lightweight browser-based speed reader (RSVP). Paste text or load a URL, set WPM, read.
- **Dhwani** — A browser-based tone/frequency generator. Useful for audio testing, meditation, or hearing range checks.
- **Sparsh** — A color palette extractor from images. Upload an image, get dominant colors as hex codes.

### Improvements

- **Sandesh**: Add file transfer progress indicator and estimated time remaining.
- **Sankshep**: Add batch processing (compress multiple images at once).
- **Badhai**: Add waveform visualization preview before extraction.
- **Tulna**: Add character-level diff mode for code comparison.
- **Shared nav**: Make nav.js inject a full top-nav bar with links to all tools instead of just a breadcrumb.

### Infrastructure

- Add a search bar to the landing page
- Add a `CNAME` or Cloudflare Pages custom domain setup guide to README
- Sitemap.xml for SEO
