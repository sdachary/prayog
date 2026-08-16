#!/usr/bin/env bash
#
# Sangrah — one-time setup: yt-dlp + mp4-by-default config + deno JS runtime
#                        + Docker-style animated progress downloader.
#
# Uses an isolated venv to avoid Debian/Ubuntu's PEP 668
# "externally-managed-environment" restriction.
#
# Run once:
#   chmod +x setup_sangrah.sh
#   ./setup_sangrah.sh
#
set -euo pipefail

VENV_DIR="$HOME/.local/share/ytdlp-venv"
BIN_DIR="$HOME/bin"

echo "==> 1/6  Creating isolated virtual environment at $VENV_DIR"
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
else
    echo "    venv already exists, skipping"
fi

echo "==> 2/6  Installing/upgrading yt-dlp and rich inside the venv"
"$VENV_DIR/bin/pip" install --upgrade pip
"$VENV_DIR/bin/pip" install --upgrade yt-dlp rich

echo "==> 3/6  Installing deno (JS runtime yt-dlp needs for full YouTube extraction)"
if ! command -v deno >/dev/null 2>&1; then
    curl -fsSL https://deno.land/install.sh | sh
    DENO_BIN="$HOME/.deno/bin"
    if ! echo "$PATH" | grep -q "$DENO_BIN"; then
        echo "export PATH=\"$DENO_BIN:\$PATH\"" >> "$HOME/.bashrc"
        export PATH="$DENO_BIN:$PATH"
    fi
else
    echo "    deno already installed, skipping"
fi

echo "==> 4/6  Writing yt-dlp config for mp4-by-default output"
mkdir -p "$HOME/.config/yt-dlp"
CONFIG_FILE="$HOME/.config/yt-dlp/config"

if [ ! -f "$CONFIG_FILE" ] || ! grep -q "merge-output-format" "$CONFIG_FILE"; then
    cat >> "$CONFIG_FILE" << 'EOF'
-f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"
--merge-output-format mp4
EOF
    echo "    Wrote $CONFIG_FILE"
else
    echo "    Config already present, skipping"
fi

echo "==> 5/6  Installing commands into $BIN_DIR"
mkdir -p "$BIN_DIR"

# Wrapper so plain 'yt-dlp' on your PATH uses the venv's yt-dlp
cat > "$BIN_DIR/yt-dlp" << EOF
#!/usr/bin/env bash
exec "$VENV_DIR/bin/yt-dlp" "\$@"
EOF
chmod +x "$BIN_DIR/yt-dlp"

# Docker-style animated progress downloader, using the venv's python
cat > "$BIN_DIR/ytdl-nice" << PYEOF
#!/usr/bin/env bash
exec "$VENV_DIR/bin/python" "$VENV_DIR/ytdl_nice.py" "\$@"
PYEOF
chmod +x "$BIN_DIR/ytdl-nice"

cat > "$VENV_DIR/ytdl_nice.py" << 'PYEOF'
#!/usr/bin/env python3
"""
Docker-style animated progress bar for yt-dlp downloads.
Forces mp4 output by default.

Usage:
    ytdl-nice "<URL>" [-f FORMAT] [-o OUTPUT_TEMPLATE]
"""

import sys
import yt_dlp
from rich.console import Console
from rich.progress import (
    Progress,
    SpinnerColumn,
    TextColumn,
    BarColumn,
    DownloadColumn,
    TransferSpeedColumn,
    TimeRemainingColumn,
)

console = Console()

progress = Progress(
    SpinnerColumn(style="cyan"),
    TextColumn("[bold blue]{task.fields[filename]}", justify="right"),
    BarColumn(bar_width=40, complete_style="green", finished_style="green"),
    "[progress.percentage]{task.percentage:>3.1f}%",
    DownloadColumn(),
    TransferSpeedColumn(),
    TimeRemainingColumn(),
    console=console,
    transient=False,
)

task_ids = {}


def short_name(name: str, limit: int = 30) -> str:
    return name if len(name) <= limit else name[: limit - 3] + "..."


def progress_hook(d):
    filename = short_name(d.get("filename", "unknown"))

    if d["status"] == "downloading":
        total = d.get("total_bytes") or d.get("total_bytes_estimate") or 0
        downloaded = d.get("downloaded_bytes", 0)

        if filename not in task_ids:
            task_ids[filename] = progress.add_task(
                "download", filename=filename, total=total or 100
            )
        elif total:
            progress.update(task_ids[filename], total=total)

        progress.update(task_ids[filename], completed=downloaded)

    elif d["status"] == "finished" and filename in task_ids:
        task = next(t for t in progress.tasks if t.id == task_ids[filename])
        progress.update(task_ids[filename], completed=task.total)
        console.print(f"[bold green]OK[/bold green] Post-processing {filename}...")


def main():
    if len(sys.argv) < 2:
        console.print("[bold red]Usage:[/bold red] ytdl-nice <URL> [-f FORMAT] [-o OUTPUT]")
        sys.exit(1)

    url = sys.argv[1]
    extra_args = sys.argv[2:]

    ydl_opts = {
        "progress_hooks": [progress_hook],
        "quiet": True,
        "no_warnings": True,
        "noprogress": True,
        "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "merge_output_format": "mp4",
    }

    for i, arg in enumerate(extra_args):
        if arg in ("-f", "--format") and i + 1 < len(extra_args):
            ydl_opts["format"] = extra_args[i + 1]
        if arg in ("-o", "--output") and i + 1 < len(extra_args):
            ydl_opts["outtmpl"] = extra_args[i + 1]

    with progress:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

    console.print("[bold green]All downloads complete.[/bold green]")


if __name__ == "__main__":
    main()
PYEOF

echo "==> 6/6  Done"
echo

if ! echo "$PATH" | grep -q "$BIN_DIR"; then
    echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$HOME/.bashrc"
    export PATH="$BIN_DIR:$PATH"
fi

echo "Setup complete. Restart your terminal or run:  source ~/.bashrc"
echo
echo "From now on:"
echo "  yt-dlp <url>       -> always downloads/merges to mp4 (runs from isolated venv)"
echo "  ytdl-nice <url>    -> same, but with a Docker-style animated progress bar"
echo
echo "Check it picked up the right one with:  which yt-dlp"
echo "It should point to: $BIN_DIR/yt-dlp"
