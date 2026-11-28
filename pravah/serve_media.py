#!/usr/bin/env python3
"""
Simple media server with Range support for video seeking.
Drop this in your media folder and run, or run from anywhere with --dir.

Usage:
    python3 serve_media.py                    # serves ~/ (home), port 8789
    python3 serve_media.py --dir ~/Videos     # serves ~/Videos
    python3 serve_media.py -p 9000 -d /media  # custom port & dir

Then open http://<laptop-ip>:8789 on your TV/phone browser.
"""

import argparse
import mimetypes
import os
import re
import sys
import urllib.parse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

# Video/audio MIME types
for ext, mime in {
    ".mkv": "video/x-matroska",
    ".mp4": "video/mp4",
    ".m4v": "video/mp4",
    ".webm": "video/webm",
    ".avi": "video/x-msvideo",
    ".mov": "video/quicktime",
    ".ts": "video/mp2t",
    ".m3u8": "application/x-mpegURL",
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
    ".flac": "audio/flac",
    ".opus": "audio/ogg",
    ".ogg": "audio/ogg",
    ".wav": "audio/wav",
}.items():
    mimetypes.add_type(mime, ext)


class MediaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, serve_dir=None, **kwargs):
        self.serve_dir = Path(serve_dir).resolve() if serve_dir else Path.home().resolve()
        super().__init__(*args, directory=str(self.serve_dir), **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Range")
        self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_head(self):
        path = Path(self.translate_path(self.path))
        if path.is_dir():
            return self.list_directory(path)
        return self.send_file(path)

    def send_file(self, path):
        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None

        fs = os.fstat(f.fileno())
        file_size = fs.st_size
        mime_type = self.guess_type(path)

        range_header = self.headers.get("Range")
        if range_header:
            return self.handle_range_request(f, file_size, mime_type, range_header)

        self.send_response(200)
        self.send_header("Content-Type", mime_type)
        self.send_header("Content-Length", str(file_size))
        self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
        self.end_headers()
        return f

    def handle_range_request(self, f, file_size, mime_type, range_header):
        match = re.match(r"bytes=(\d*)-(\d*)", range_header)
        if not match:
            f.close()
            self.send_error(416, "Invalid Range")
            return None

        start_str, end_str = match.groups()
        start = int(start_str) if start_str else 0
        end = int(end_str) if end_str else file_size - 1

        if start >= file_size or end >= file_size or start > end:
            f.close()
            self.send_error(416, "Range Not Satisfiable")
            self.send_header("Content-Range", f"bytes */{file_size}")
            self.end_headers()
            return None

        content_length = end - start + 1
        f.seek(start)

        self.send_response(206)
        self.send_header("Content-Type", mime_type)
        self.send_header("Content-Length", str(content_length))
        self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        return f

    def do_GET(self):
        path = Path(self.translate_path(self.path))
        if path.is_dir():
            self.list_directory(path)
            return
        f = self.send_file(path)
        if f:
            try:
                self.copyfile(f, self.wfile)
            finally:
                f.close()

    def do_HEAD(self):
        path = Path(self.translate_path(self.path))
        if path.is_dir():
            self.send_error(404, "Not a file")
            return
        f = self.send_file(path)
        if f:
            f.close()
            self.wfile.flush()

    def list_directory(self, path):
        try:
            entries = sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
        except OSError:
            self.send_error(404, "No permission to list directory")
            return

        rel = path.relative_to(self.serve_dir)

        html = [
            "<!DOCTYPE html>",
            "<html><head>",
            "<meta charset='utf-8'>",
            "<meta name='viewport' content='width=device-width, initial-scale=1'>",
            f"<title>Media Server — {rel if rel != Path('.') else 'Home'}</title>",
            "<style>",
            "body{font-family:system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem;background:#111;color:#eee}",
            "h1{font-size:1.5rem;margin-bottom:1rem}",
            "a{color:#4da3ff;text-decoration:none}", "a:hover{text-decoration:underline}",
            "table{width:100%;border-collapse:collapse}", "td,th{padding:0.5rem;text-align:left}",
            "tr:hover{background:#222}", ".size{color:#888;white-space:nowrap}",
            ".dir{font-weight:600}", ".video::before{content:'▶ '}",
            "@media (prefers-color-scheme: light){body{background:#fafafa;color:#222}}",
            "</style>",
            "</head><body>",
            f"<h1>📁 {rel if rel != Path('.') else 'Home'}</h1>",
            "<table>",
        ]

        if rel != Path("."):
            parent = urllib.parse.quote(str(rel.parent)) if rel.parent != Path(".") else ""
            html.append(f"<tr><td colspan=2><a href='/{parent}'>⬆ Parent directory</a></td></tr>")

        for entry in entries:
            name = entry.name
            href = urllib.parse.quote(str(rel / name)) if rel != Path(".") else urllib.parse.quote(name)
            if entry.is_dir():
                html.append(f"<tr><td class='dir'><a href='/{href}/'>📁 {name}/</a></td><td class='size'>—</td></tr>")
            else:
                suffix = entry.suffix.lower()
                is_video = suffix in {".mp4", ".mkv", ".webm", ".avi", ".mov", ".ts", ".m3u8", ".m4v"}
                is_audio = suffix in {".mp3", ".m4a", ".flac", ".opus", ".ogg", ".wav"}
                icon = "▶" if is_video else "♪" if is_audio else "📄"
                cls = "video" if is_video or is_audio else ""
                try:
                    size = entry.stat().st_size
                    size_str = self.format_size(size)
                except OSError:
                    size_str = "?"
                html.append(f"<tr><td class='{cls}'><a href='/{href}'>{icon} {name}</a></td><td class='size'>{size_str}</td></tr>")

        html.extend(["</table>", "</body></html>"])
        content = "\n".join(html).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    @staticmethod
    def format_size(n):
        for unit in ["B", "KB", "MB", "GB", "TB"]:
            if n < 1024:
                return f"{n:.1f} {unit}"
            n /= 1024
        return f"{n:.1f} PB"

    def log_message(self, format, *args):
        sys.stderr.write(f"[{self.address_string()}] {format % args}\n")


def lan_addresses():
    import socket
    found = []
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("10.255.255.255", 1))
        found.append(s.getsockname()[0])
        s.close()
    except OSError:
        pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            found.append(info[4][0])
    except OSError:
        pass
    out = []
    for ip in found:
        if not ip.startswith("127.") and not ip.startswith("169.254.") and ip not in out:
            out.append(ip)
    return out


def main():
    parser = argparse.ArgumentParser(description="Simple media server with Range support (seeking works)")
    parser.add_argument("--port", "-p", type=int, default=8789, help="Port to serve on (default: 8789)")
    parser.add_argument("--dir", "-d", type=str, default=str(Path.home()), help="Directory to serve (default: home)")
    parser.add_argument("--bind", "-b", type=str, default="0.0.0.0", help="Bind address (default: 0.0.0.0)")
    args = parser.parse_args()

    serve_dir = Path(args.dir).resolve()
    if not serve_dir.exists():
        print(f"Error: Directory does not exist: {serve_dir}", file=sys.stderr)
        sys.exit(1)

    handler = lambda *a, **kw: MediaHandler(*a, serve_dir=serve_dir, **kw)
    server = ThreadingHTTPServer((args.bind, args.port), handler)

    print(f"\nServing {serve_dir} at http://{args.bind}:{args.port}")
    for ip in lan_addresses():
        print(f"  TV/Phone:     http://{ip}:{args.port}   (same Wi-Fi)")
    print("\nPress Ctrl+C to stop\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        server.shutdown()


if __name__ == "__main__":
    main()