# Sanket — QR Code Generator & Scanner

Generate QR codes from text or URLs, download as PNG or SVG. Scan QR codes using your device camera.

**How it works:** Uses qrcode.js (via CDN) for generation and jsQR for scanning. Generation works fully offline after first load; scanning uses `getUserMedia` for camera access. No data is sent anywhere — everything runs in your browser.

**Browser support:** QR scanning requires a device with a rear camera and works in most modern browsers on HTTPS or localhost.

**Live URL:** `https://prayog.pages.dev/sanket/`
