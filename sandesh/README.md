# Sandesh — Local File Drop

Local network file transfer via WebRTC. Pair two devices with a 6-digit code, then drag and drop a file to send it directly, browser to browser.

**How it works:** Both devices open the same page. One generates a 6-digit session code, the other enters it. PeerJS (via CDN) handles the handshake through a public broker. Once paired, file data transfers directly between browsers over WebRTC — nothing passes through the broker.

**Limitation:** Needs a brief internet connection for the initial peer handshake (loads PeerJS library, reaches its public broker). The transfer itself is direct between browsers and fast on a shared local network.

**No internet on either laptop (cable only):** A bare ethernet cable between two laptops works fully offline — terminal only, nothing to install. Assign link-local IPs (`sudo ip addr add 169.254.10.1/24 dev <iface>` / `...10.2/24`), verify with `ping`, then share via `python3 -m http.server 8000` in the folder and browse `http://169.254.10.1:8000` from the other laptop, or `scp -r` if the receiver already runs `openssh-server`. Full guide embedded at the bottom of the page.

**Live URL:** `https://prayog.pages.dev/sandesh/`
