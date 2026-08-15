# Vibhajan

Split a large Excel or CSV file into smaller files by row count — entirely in your browser. No upload, no server, your data never leaves your device.

## Features

- **Row-based splitting**: Split a spreadsheet into chunks of N rows per file
- **Multi-sheet support**: Pick the sheet to split, or combine all sheets into one first
- **Column control**: Choose which columns to include; skip the ones you don't need
- **Merged-cell fill-down**: Auto-detects "grouped" columns (value only on first row of a block) and fills the value down to every row — with a manual override per column
- **Output format**: Produces `.xlsx` output (or `.csv` when the input was a single-sheet CSV)
- **Download individually or as ZIP**: Per-file links plus a one-click "Download all (.zip)"
- **Privacy**: Runs fully client-side via SheetJS — the file never leaves your machine

## Usage

1. Enter the number of **rows per file** (default 5000)
2. Enter an output file **prefix** (default `Split_Data`)
3. Drop or click to select a `.xlsx`, `.xls`, or `.csv` file
4. If the file has multiple sheets, pick the sheet — or check **combine all sheets**
5. Optionally adjust which columns to include and which grouped columns to fill down
6. Download each part individually, or grab the whole batch as a ZIP

**Requires**: nothing to install. The library (SheetJS + JSZip) is loaded from CDN — after that, all processing happens in your browser.

## Technical

- Self-contained HTML file (SheetJS `xlsx` 0.18.5 + JSZip 3.10.1 from cdnjs)
- Uses CSS custom properties from `/assets/theme.css`
- Navigation via `/assets/nav.js`
- Fill-down detection: blank-run analysis + email/phone heuristic to avoid filling identity columns
- Zip export generated in-memory with JSZip