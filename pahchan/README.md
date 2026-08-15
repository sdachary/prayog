# Pahchan

Extract fields from ID cards — Name, ID, Mobile, or any fields you define — from many ID photos or PDFs into Excel. Show it one sample, define the fields once, then bulk-process the rest. All OCR runs in your browser.

## Features

- **Sample-based field definition**: Upload one sample ID, OCR reads the card, and pre-fills the fields it detects (label + column title) — edit, untick, or add fields manually
- **Bulk OCR**: Drop in any number of JPG/PNG/PDF ID files; one card per file (first page for PDFs)
- **Smart extraction**: Extracts each field by searching for its label on the card; auto-guesses mobile numbers with an Indian number fallback regex
- **Review table**: Every row shows a thumbnail, editable values, and an OK / Check badge so you can correct OCR misses before exporting
- **Raw OCR drill-down**: Expand any row to see the full raw OCR text for that card
- **Export to Excel**: Create a new workbook, or append into an existing Excel file (matching columns by header, or adding new ones)
- **Privacy**: OCR (Tesseract.js), PDF rendering (pdf.js), and Excel handling (SheetJS) all run locally — nothing leaves your browser

## Usage

1. **Define fields** — upload one sample ID. Edit the auto-guessed columns (Name, ID, Mobile...) and click "Save fields & continue"
2. **Upload IDs** — drag in all the ID photos/PDFs, then click "Extract data from all files"
3. **Review** — correct any misread values in the table
4. **Export** — create a new Excel file, or upload an existing one to append into. Name the output and download.

**Requires**: nothing to install. The libraries load from CDN on first use — the first OCR is slower while Tesseract's engine (~1–3MB) downloads. Processing is fully local after that.

## Technical

- Self-contained HTML file (SheetJS xlsx 0.18.5 + Tesseract.js v5.0.4 + pdf.js 3.11.174 from CDN)
- Uses CSS custom properties from `/assets/theme.css`
- Navigation via `/assets/nav.js`
- Reuses a single shared Tesseract worker across all files for speed
- Field guessing: colon / multi-space line patterns from the sample's OCR text, deduped