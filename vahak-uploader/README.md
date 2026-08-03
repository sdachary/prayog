# Vahak Uploader

A local, no-install uploader that carries a folder tree into Google Drive — file by file, moving each into a "processed" folder once it's safely confirmed uploaded.

## Features

- **Google Drive OAuth**: Connect with your own OAuth Client ID (stored in localStorage only)
- **Folder picker**: Choose source folder and processed folder via File System Access API
- **Destination folder**: Paste Drive folder ID, list root folders, or create new folders
- **Resumable uploads**: 8MB chunked uploads with automatic retry and exponential backoff
- **Pause/Resume/Cancel**: Full job control during upload
- **Progress tracking**: Per-file and overall progress with speed and ETA
- **Local mirror**: Files moved to "processed" folder mirroring the source tree structure

## Usage

1. Paste your Google OAuth Client ID and click Connect
2. Choose source folder (files to upload)
3. Choose processed folder (where uploaded files are moved)
4. Set destination Drive folder ID (or use root / browse / create)
5. Click "Start upload"

**Requires**: HTTPS or localhost (File System Access API and Google OAuth need secure context). All processing happens in your browser — nothing is uploaded except to your Google Drive.

## Technical

- Self-contained HTML file (Google OAuth JS loaded from CDN)
- Uses CSS custom properties from `/assets/theme.css`
- Navigation via `/assets/nav.js`
- Resumable upload via Google Drive API v3
- File System Access API for local folder handling