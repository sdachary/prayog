# Sandesh — Local File Drop

Local network file transfer via WebRTC. Pair two devices with a 6-digit code, then share files or entire folders directly, browser to browser.

**How it works:** Both devices open the same page. One generates a 6-digit session code, the other enters it. PeerJS (via CDN) handles the handshake through a public broker. Once paired, file data transfers directly between browsers over WebRTC — nothing passes through the broker.

**Folders & bulk transfer:** Pick a folder (`webkitdirectory`) or drop one onto the dropzone — subfolders are traversed and every file is queued and sent **one by one**, preserving relative paths. An overall panel shows aggregate %, live speed, ETA, current file name and queued count (per-file rows are capped in the DOM so 6000-file queues stay smooth).

**Destination folder (receiver):** Chrome/Edge receivers can pick a destination folder once (File System Access API). Incoming files then stream straight to disk — chunk by chunk, no RAM buffering — recreating the sender's folder structure inside it. Name collisions get `-1` suffixes instead of overwriting. Without a picked folder (or on Firefox/Safari), files arrive as regular browser downloads with per-file "save" links (whole file buffered in RAM first).

**Limitation:** Needs a brief internet connection for the initial peer handshake (loads PeerJS library, reaches its public broker). The transfer itself is direct between browsers and fast on a shared local network. For multi-GB single files prefer the terminal route below — WebRTC tops out around 20–60 MB/s and the tab must stay foregrounded.

**No internet on either laptop (cable only):** A bare ethernet cable between two laptops works fully offline — terminal only, nothing to install. Assign link-local IPs (`sudo ip addr add 169.254.10.1/24 dev <iface>` / `...10.2/24`), verify with `ping`, then share via `python3 -m http.server 8000` in the folder and browse `http://169.254.10.1:8000` from the other laptop, or `scp -r` if the receiver already runs `openssh-server`. Full guide embedded at the bottom of the page.

**Live URL:** `https://prayog.pages.dev/sandesh/`
