/* Pravah service worker.
 *
 * Turns  <scope>/stream/<id>/<name>?s=<size>&t=<mime>  into a normal HTTP
 * Range response, so a plain <video>/<audio> element can seek through a file
 * that actually lives on the *other* device. The bytes are not fetched here:
 * for every request this worker asks the Pravah page (over a MessageChannel)
 * for the next piece, and the page gets it from the peer over WebRTC.
 *
 * Pull-based on purpose: a piece is only requested when the player has room
 * for it, so pausing a 2 GB film never buffers 2 GB in memory.
 */
const SCOPE_PATH = new URL(self.registration.scope).pathname;
const STREAM_PREFIX = SCOPE_PATH + 'stream/';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
// the page pings us while media plays; receiving a message resets the idle timer
self.addEventListener('message', () => {});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(STREAM_PREFIX)) return;
  e.respondWith(serve(e, url).catch(() => new Response('stream failed', { status: 502 })));
});

/* single "bytes=a-b" | "bytes=a-" | "bytes=-n".
   null = no usable header (serve everything), 'bad' = unsatisfiable (416) */
function parseRange(header, size) {
  if (!header) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m) return null; // multi-range or junk: ignoring Range is always legal
  const a = m[1], b = m[2];
  if (a === '' && b === '') return 'bad';
  let start, end;
  if (a === '') {
    const n = +b;
    if (n === 0) return 'bad';
    start = Math.max(0, size - n);
    end = size - 1;
  } else {
    start = +a;
    end = b === '' ? size - 1 : Math.min(+b, size - 1);
  }
  if (start >= size || start > end) return 'bad';
  return [start, end];
}

async function findPage(e) {
  if (e.clientId) {
    const c = await self.clients.get(e.clientId);
    if (c) return c;
  }
  // navigations (the "save" link) carry no clientId: use a visible Pravah page
  const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  const pages = all.filter((c) => c.url.startsWith(self.registration.scope) && c.url.indexOf('/stream/') < 0);
  pages.sort((x, y) => (y.visibilityState === 'visible') - (x.visibilityState === 'visible'));
  return pages[0] || null;
}

async function serve(e, url) {
  const parts = url.pathname.slice(STREAM_PREFIX.length).split('/');
  const fid = decodeURIComponent(parts[0] || '');
  const name = decodeURIComponent(parts.slice(1).join('/') || 'file').replace(/[\\/"\r\n]/g, '_');
  const size = Number(url.searchParams.get('s'));
  if (!fid || !Number.isFinite(size) || size < 0) return new Response('bad request', { status: 400 });

  // Only ever serve media types: a hostile peer must not be able to make this
  // origin hand out text/html or script.
  let type = url.searchParams.get('t') || '';
  if (!/^(video|audio)\/[\w.+-]+$/i.test(type)) type = 'application/octet-stream';

  const headers = new Headers({
    'Content-Type': type,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': 'sandbox'
  });
  if (url.searchParams.get('dl')) {
    headers.set('Content-Disposition', "attachment; filename*=UTF-8''" + encodeURIComponent(name));
  }

  if (size === 0) {
    headers.set('Content-Length', '0');
    return new Response(null, { status: 200, headers });
  }

  const range = parseRange(e.request.headers.get('Range'), size);
  if (range === 'bad') {
    headers.set('Content-Range', 'bytes */' + size);
    return new Response(null, { status: 416, headers });
  }
  const start = range ? range[0] : 0;
  const end = range ? range[1] : size - 1;
  headers.set('Content-Length', String(end - start + 1));
  if (range) headers.set('Content-Range', 'bytes ' + start + '-' + end + '/' + size);

  if (e.request.method === 'HEAD') return new Response(null, { status: range ? 206 : 200, headers });

  const page = await findPage(e);
  if (!page) return new Response('Open the Pravah page first', { status: 503 });

  const ch = new MessageChannel();
  const port = ch.port1;
  page.postMessage({ type: 'pravah-range', fid, start, end }, [ch.port2]);

  let release = null; // resolves the in-flight pull()
  const done = () => { if (release) { const r = release; release = null; r(); } };
  const body = new ReadableStream({
    start(controller) {
      port.onmessage = (m) => {
        const d = m.data || {};
        if (d.type === 'chunk') controller.enqueue(new Uint8Array(d.buf));
        else if (d.type === 'done') { controller.close(); port.close(); }
        else if (d.type === 'error') { controller.error(new Error(d.msg || 'peer error')); port.close(); }
        done();
      };
    },
    pull() {
      return new Promise((resolve) => { release = resolve; port.postMessage({ type: 'pull' }); });
    },
    cancel() {
      port.postMessage({ type: 'cancel' });
      port.close();
    }
  }, new CountQueuingStrategy({ highWaterMark: 2 }));

  return new Response(body, { status: range ? 206 : 200, headers });
}
