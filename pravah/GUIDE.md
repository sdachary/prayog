# Pravah Media Server Guide

Two ways to serve your media files to TV/phone over Wi-Fi.

---

## Option 1: Full-Featured (pravah/serve.py)

**Best for:** Daily use, inline video player, uploads, pretty UI.

```bash
# From anywhere
python3 pravah/serve.py ~/Videos

# Or with options
python3 pravah/serve.py ~/Videos --port 9000 --no-upload
```

**Features:**
- ✅ Range requests (seeking works on TV)
- ✅ Inline video/audio player in browser
- ✅ Auto-detects your LAN IP
- ✅ Dark/light theme
- ✅ Optional uploads from phone (`--no-upload` to disable)
- ✅ Host validation (blocks DNS rebinding)
- ✅ Symlink protection

---

## Option 2: Minimal (pravah/serve_media.py)

**Best for:** Drop in a folder, run once, bookmark the URL.

```bash
# Drop in your media folder, then:
python3 serve_media.py

# Or from anywhere:
python3 serve_media.py --dir ~/Videos --port 8789
```

**Features:**
- ✅ Range requests (seeking works)
- ✅ Simple file browser (dark/light theme)
- ✅ Auto-detects LAN IP
- ✅ CORS headers for TV browsers
- ❌ No inline player (direct links)
- ❌ No uploads

---

## Quick Start

### 1. Find your laptop's LAN IP
```bash
ip route get 1.1.1.1 | awk '{print $7; exit}'
# Example: 192.168.1.47
```

### 2. Run the server
```bash
# Option 1 (full)
python3 pravah/serve.py ~/Videos

# Option 2 (minimal)
python3 pravah/serve_media.py --dir ~/Videos
```

### 3. Open on TV/Phone
Open `http://<your-lan-ip>:8000` (Option 1) or `http://<your-lan-ip>:8789` (Option 2) in the TV browser.

---

## Run in Background

```bash
# Option 1
nohup python3 pravah/serve.py ~/Videos > pravah.log 2>&1 &

# Option 2
nohup python3 pravah/serve_media.py --dir ~/Videos > media.log 2>&1 &
```

### Stop it
```bash
pkill -f "serve.py"
pkill -f "serve_media.py"
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Address already in use" | Change port: `--port 9000` |
| TV says "Can't play" | Use Option 1 (better MIME, inline player) |
| Seeking doesn't work | Check Range header: `curl -I -H "Range: bytes=0-100" <url>` |
| Can't connect from TV | Same Wi-Fi? Firewall? Try `sudo ufw allow 8000` |
| "Permission denied" | `chmod +x pravah/serve.py` |

---

## Which One?

| Need | Use |
|------|-----|
| Just watch videos, bookmark URL | `serve_media.py` |
| Want inline player, playlist, pretty UI | `serve.py` |
| Need to receive files from phone | `serve.py` (uploads ON by default) |
| Running on a headless server | Either (both work via SSH) |

---

## Files in This Folder

```
pravah/
├── serve.py           # Full-featured media server
├── serve_media.py     # Minimal media server
├── sw.js              # Service worker (for PWA)
├── index.html         # (served by serve.py)
└── GUIDE.md           # This file
```