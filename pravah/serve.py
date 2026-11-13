#!/usr/bin/env python3
"""Pravah serve - share a folder of videos and music over your Wi-Fi.

    python3 serve.py ~/Videos            # then open the printed address on your phone
    python3 serve.py . --port 9000 --no-upload

Needs only Python 3.7+. No install, no internet.

Why not `python3 -m http.server`?  It has no Range support, so videos can't
seek and Safari refuses to play them. This one does ranges properly, plays
inline in the browser, and lets the phone upload files back (turn that off
with --no-upload).

Anyone on your Wi-Fi who knows the address can see the shared folder, so use it
on networks you trust. Files starting with "." are never shown or served.
"""
import argparse
import html
import ipaddress
import json
import mimetypes
import os
import re
import socket
import sys
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

for _ext, _type in {
    '.mkv': 'video/x-matroska', '.m4v': 'video/mp4', '.mov': 'video/quicktime', '.ts': 'video/mp2t',
    '.webm': 'video/webm', '.m4a': 'audio/mp4', '.aac': 'audio/aac', '.flac': 'audio/flac',
    '.opus': 'audio/ogg', '.oga': 'audio/ogg', '.weba': 'audio/webm', '.mp3': 'audio/mpeg',
}.items():
    mimetypes.add_type(_type, _ext)

CHUNK = 256 * 1024
INLINE = ('video/', 'audio/', 'image/', 'text/plain', 'application/pdf')


def natural_key(s):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r'(\d+)', s)]


def fmt_size(n):
    for unit in ('B', 'KB', 'MB', 'GB'):
        if n < 1024 or unit == 'GB':
            return '%d B' % n if unit == 'B' else '%.1f %s' % (n, unit)
        n /= 1024.0


class Handler(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'
    server_version = 'PravahServe'

    # ---- plumbing -------------------------------------------------------
    def log_message(self, fmt, *args):  # a seek makes dozens of requests; stay quiet
        pass

    def reply(self, code, body=b'', ctype='text/plain; charset=utf-8', extra=None, head=False):
        if isinstance(body, str):
            body = body.encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Cache-Control', 'no-store')
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        if not head:
            self.wfile.write(body)

    def send_error(self, code, message=None, explain=None):
        self.close_connection = True
        try:
            self.reply(code, '%d %s\n' % (code, message or ''), head=self.command == 'HEAD')
        except OSError:
            pass

    def host_ok(self):
        """Refuse odd Host headers: stops DNS-rebinding from a web page reaching this server."""
        host = (self.headers.get('Host') or '').strip().lower()
        if host.startswith('['):
            host = host[1:].split(']')[0]
        else:
            host = host.rsplit(':', 1)[0] if host.count(':') == 1 else host
        if host in self.server.allowed_hosts or host.endswith('.local'):
            return True
        try:
            ipaddress.ip_address(host)
            return True
        except ValueError:
            return False

    def resolve(self, urlpath):
        """URL path -> (absolute path, parts) strictly inside the shared root, or None."""
        p = urllib.parse.unquote(urlpath.split('?', 1)[0].split('#', 1)[0])
        parts = [x for x in p.split('/') if x not in ('', '.')]
        for x in parts:
            if x == '..' or x.startswith('.') or '\\' in x or '\x00' in x or ':' in x[:2]:
                return None
        root = self.server.root
        full = os.path.realpath(os.path.join(root, *parts))
        if full != root and not full.startswith(root + os.sep):
            return None
        return full, parts

    # ---- GET / HEAD -----------------------------------------------------
    def do_HEAD(self):
        self.do_GET(head=True)

    def do_GET(self, head=False):
        if not self.host_ok():
            return self.send_error(403, 'Forbidden')
        res = self.resolve(self.path)
        if not res:
            return self.send_error(404, 'Not found')
        full, parts = res
        if os.path.isdir(full):
            if not self.path.split('?', 1)[0].endswith('/'):
                return self.reply(301, b'', extra={'Location': self.path.split('?', 1)[0] + '/'}, head=head)
            return self.listing(full, parts, head)
        if os.path.isfile(full):
            return self.send_file(full, head)
        return self.send_error(404, 'Not found')

    def send_file(self, full, head):
        try:
            size = os.path.getsize(full)
            f = open(full, 'rb')
        except OSError:
            return self.send_error(404, 'Not found')
        with f:
            ctype = mimetypes.guess_type(full)[0] or 'application/octet-stream'
            inline = ctype.startswith(INLINE) and ctype != 'image/svg+xml'
            start, end, status = 0, size - 1, 200
            rng = self.headers.get('Range')
            if rng and size > 0:
                m = re.fullmatch(r'bytes=(\d*)-(\d*)', rng.strip())
                if m:  # a single range; anything fancier we just ignore (that's legal)
                    a, b = m.group(1), m.group(2)
                    ok = True
                    if a == '' and b == '':
                        ok = False
                    elif a == '':
                        n = int(b)
                        ok = n > 0
                        start, end = max(0, size - n), size - 1
                    else:
                        start = int(a)
                        end = size - 1 if b == '' else min(int(b), size - 1)
                        ok = start < size and start <= end
                    if not ok:
                        return self.reply(416, b'', extra={'Content-Range': 'bytes */%d' % size}, head=head)
                    status = 206
            name = os.path.basename(full)
            extra = {
                'Accept-Ranges': 'bytes',
                'Content-Disposition': "%s; filename*=UTF-8''%s" % ('inline' if inline else 'attachment', urllib.parse.quote(name)),
            }
            if status == 206:
                extra['Content-Range'] = 'bytes %d-%d/%d' % (start, end, size)
            if not inline:
                extra['Content-Security-Policy'] = 'sandbox'
            length = max(0, end - start + 1) if size else 0
            self.send_response(status)
            self.send_header('Content-Type', ctype if inline else 'application/octet-stream')
            self.send_header('Content-Length', str(length))
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Cache-Control', 'no-cache')
            for k, v in extra.items():
                self.send_header(k, v)
            self.end_headers()
            if head or not length:
                return
            try:
                f.seek(start)
                left = length
                while left > 0:
                    buf = f.read(min(CHUNK, left))
                    if not buf:
                        break
                    self.wfile.write(buf)
                    left -= len(buf)
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                self.close_connection = True  # the player moved on (seek / stop)

    # ---- directory page -------------------------------------------------
    def listing(self, full, parts, head):
        try:
            names = [n for n in os.listdir(full) if not n.startswith('.')]
        except OSError:
            return self.send_error(403, 'Forbidden')
        dirs, files = [], []
        for n in names:
            p = os.path.join(full, n)
            real = os.path.realpath(p)
            if real != self.server.root and not real.startswith(self.server.root + os.sep):
                continue  # symlink pointing outside the shared folder
            (dirs if os.path.isdir(p) else files).append(n)
        dirs.sort(key=natural_key)
        files.sort(key=natural_key)
        base = '/' + ''.join(urllib.parse.quote(x) + '/' for x in parts)
        crumbs = ['<a href="/">home</a>']
        acc = '/'
        for x in parts:
            acc += urllib.parse.quote(x) + '/'
            crumbs.append('<a href="%s">%s</a>' % (acc, html.escape(x)))
        rows = []
        if parts:
            rows.append('<li><a class="d" href="/%s">&#8593; ..</a></li>' % ''.join(urllib.parse.quote(x) + '/' for x in parts[:-1]))
        for n in dirs:
            rows.append('<li><a class="d" href="%s%s/">&#128193; %s</a></li>' % (base, urllib.parse.quote(n), html.escape(n)))
        for n in files:
            ctype = mimetypes.guess_type(n)[0] or ''
            kind = 'video' if ctype.startswith('video/') else 'audio' if ctype.startswith('audio/') else ''
            try:
                size = fmt_size(os.path.getsize(os.path.join(full, n)))
            except OSError:
                size = ''
            icon = '&#9654;' if kind == 'video' else '&#9834;' if kind == 'audio' else '&#128196;'
            rows.append('<li><a class="f" data-kind="%s" href="%s%s">%s %s</a><span>%s</span></li>' % (
                kind, base, urllib.parse.quote(n), icon, html.escape(n), size))
        if not rows:
            rows.append('<li class="e">This folder is empty.</li>')
        upload = ''
        if self.server.upload:
            upload = ('<section class="up"><b>Send files here</b>'
                      '<input id="pick" type="file" multiple><div id="msg" role="status"></div></section>')
        page = PAGE.replace('{{TITLE}}', html.escape('/'.join(parts) or 'Pravah')) \
                   .replace('{{CRUMBS}}', ' / '.join(crumbs)) \
                   .replace('{{ROWS}}', '\n'.join(rows)) \
                   .replace('{{UPLOAD}}', upload) \
                   .replace('{{CAN_UPLOAD}}', 'true' if self.server.upload else 'false')
        self.reply(200, page, 'text/html; charset=utf-8', head=head)

    # ---- PUT (upload) ---------------------------------------------------
    def do_OPTIONS(self):
        self.send_error(405, 'Method not allowed')  # no CORS: web pages can't talk to us

    def do_PUT(self):
        self.close_connection = True
        if not self.host_ok():
            return self.send_error(403, 'Forbidden')
        if not self.server.upload:
            return self.send_error(403, 'Uploads are turned off')
        res = self.resolve(os.path.dirname(urllib.parse.unquote(self.path.split('?', 1)[0])) or '/')
        if not res or not os.path.isdir(res[0]):
            return self.send_error(404, 'No such folder')
        target = res[0]
        name = os.path.basename(urllib.parse.unquote(self.path.split('?', 1)[0]))
        name = re.sub(r'[\x00-\x1f<>:"/\\|?*]', '_', name).strip().lstrip('.')[:200]
        if not name:
            return self.send_error(400, 'Bad file name')
        try:
            length = int(self.headers.get('Content-Length', ''))
            if length < 0:
                raise ValueError
        except ValueError:
            return self.send_error(411, 'Length required')
        stem, ext = os.path.splitext(name)
        final, i = os.path.join(target, name), 0
        while os.path.exists(final):
            i += 1
            final = os.path.join(target, '%s (%d)%s' % (stem, i, ext))
        tmp = os.path.join(target, '.upload-%d-%s.part' % (os.getpid(), os.urandom(4).hex()))
        try:
            with open(tmp, 'wb') as out:
                left = length
                while left > 0:
                    buf = self.rfile.read(min(1024 * 1024, left))
                    if not buf:
                        raise ConnectionError('client went away')
                    out.write(buf)
                    left -= len(buf)
            os.replace(tmp, final)
        except (OSError, ConnectionError):
            try:
                os.remove(tmp)
            except OSError:
                pass
            return self.send_error(500, 'Upload failed')
        print('  received  %s  (%s)' % (os.path.relpath(final, self.server.root), fmt_size(length)))
        self.reply(201, json.dumps({'name': os.path.basename(final)}), 'application/json')


PAGE = r'''<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{TITLE}} - Pravah</title>
<style>
:root{--bg:#0b0f14;--panel:#121922;--line:#23303d;--text:#e7ecf1;--muted:#7c8894;--amber:#e8a33d;--teal:#2fa39a}
@media(prefers-color-scheme:light){:root{--bg:#f4f5f7;--panel:#fff;--line:#d8dde3;--text:#14181d;--muted:#5c6773;--amber:#b87a1a;--teal:#1f7a72}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:760px;margin:0 auto;padding:20px 16px 64px}
h1{font:600 14px ui-monospace,Menlo,Consolas,monospace;letter-spacing:.06em;margin:0 0 4px}h1 span{color:var(--amber)}
nav{color:var(--muted);font:12px ui-monospace,Menlo,Consolas,monospace;margin-bottom:16px;word-break:break-all}
a{color:inherit}nav a{color:var(--teal)}
ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
li{display:flex;gap:10px;align-items:center;background:var(--panel);border:1px solid var(--line);border-radius:10px}
li a{flex:1;min-width:0;padding:12px;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
li a:hover,li a.on{color:var(--teal)}li.on{border-color:var(--teal)}
li span{color:var(--muted);font:12px ui-monospace,Menlo,Consolas,monospace;padding-right:12px;flex:none}
li.e{padding:18px;color:var(--muted);justify-content:center}
#player{margin-bottom:16px}video{width:100%;max-height:60vh;background:#000;border-radius:10px;display:block}audio{width:100%;display:block}
#now{font:12.5px ui-monospace,Menlo,Consolas,monospace;color:var(--muted);margin-top:8px;display:flex;gap:10px;flex-wrap:wrap}
#now button{font:inherit;background:none;border:1px solid var(--line);color:var(--text);border-radius:8px;padding:6px 10px;cursor:pointer}
.up{margin-top:22px;padding:16px;border:1px dashed var(--line);border-radius:10px}.up b{display:block;margin-bottom:8px}
#msg{margin-top:8px;color:var(--muted);font-size:13px}
</style></head><body><main>
<h1>PRAVAH<span>//</span>SERVE</h1>
<nav>{{CRUMBS}}</nav>
<div id="player" hidden><video id="v" controls playsinline hidden></video><audio id="a" controls hidden></audio>
<div id="now"><span id="nm"></span><button id="prev" type="button">&#9198;</button><button id="next" type="button">&#9197;</button></div></div>
<ul>
{{ROWS}}
</ul>
{{UPLOAD}}
</main>
<script>
(function(){
  var links=[].slice.call(document.querySelectorAll('a.f[data-kind="video"],a.f[data-kind="audio"]'));
  var box=document.getElementById('player'),v=document.getElementById('v'),a=document.getElementById('a'),nm=document.getElementById('nm'),cur=-1;
  function play(i){
    if(i<0||i>=links.length)return;cur=i;var l=links[i],m=l.dataset.kind==='audio'?a:v,o=m===a?v:a;
    o.pause();o.removeAttribute('src');o.load();o.hidden=true;m.hidden=false;box.hidden=false;
    m.src=l.getAttribute('href');m.play().catch(function(){});nm.textContent=l.textContent.slice(2);
    links.forEach(function(x){x.parentNode.classList.toggle('on',x===l)});
  }
  links.forEach(function(l,i){l.addEventListener('click',function(e){if(e.ctrlKey||e.metaKey||e.shiftKey)return;e.preventDefault();play(i)})});
  [v,a].forEach(function(m){m.addEventListener('ended',function(){play(cur+1)})});
  document.getElementById('next').onclick=function(){play(cur+1)};
  document.getElementById('prev').onclick=function(){play(cur-1)};
  var pick=document.getElementById('pick');
  if(pick&&{{CAN_UPLOAD}}){
    var msg=document.getElementById('msg');
    pick.addEventListener('change',function(){
      var files=[].slice.call(pick.files),done=0,fail=0;
      if(!files.length)return;
      (function next(){
        if(done+fail===files.length){msg.textContent=fail?fail+' failed':'Done.';if(!fail)setTimeout(function(){location.reload()},600);return}
        var f=files[done+fail],x=new XMLHttpRequest();
        x.open('PUT',location.pathname+encodeURIComponent(f.name));
        x.upload.onprogress=function(e){if(e.lengthComputable)msg.textContent=(done+fail+1)+'/'+files.length+'  '+f.name+'  '+Math.round(e.loaded/e.total*100)+'%'};
        x.onload=function(){x.status===201?done++:fail++;next()};x.onerror=function(){fail++;next()};
        x.send(f);
      })();
    });
  }
})();
</script></body></html>
'''


class Server(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def lan_addresses():
    found = []
    try:  # the address the OS would use to reach the internet - no packet is sent
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('10.255.255.255', 1))
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
        if not ip.startswith('127.') and not ip.startswith('169.254.') and ip not in out:
            out.append(ip)
    return out


def main():
    ap = argparse.ArgumentParser(description='Share a folder of videos and music over your Wi-Fi.')
    ap.add_argument('folder', nargs='?', default='.', help='folder to share (default: current folder)')
    ap.add_argument('-p', '--port', type=int, default=8000)
    ap.add_argument('--bind', default='0.0.0.0', help='address to listen on (default: all)')
    ap.add_argument('--no-upload', action='store_true', help="don't let other devices upload files")
    args = ap.parse_args()

    root = os.path.realpath(os.path.expanduser(args.folder))
    if not os.path.isdir(root):
        sys.exit('Not a folder: %s' % args.folder)

    srv = None
    for port in range(args.port, args.port + 10):
        try:
            srv = Server((args.bind, port), Handler)
            break
        except OSError:
            continue
    if not srv:
        sys.exit('Port %d (and the next 9) are busy. Try --port 9000.' % args.port)
    srv.root = root
    srv.upload = not args.no_upload
    host = socket.gethostname().lower()
    srv.allowed_hosts = {'localhost', host, host.split('.')[0]}

    print('\nPravah serve - sharing %s' % root)
    print('  this computer : http://localhost:%d' % port)
    for ip in lan_addresses():
        print('  your phone    : http://%s:%d   (same Wi-Fi)' % (ip, port))
    print('  uploads       : %s' % ('ON - other devices can send files into this folder (--no-upload to disable)' if srv.upload else 'off'))
    print('\nCtrl+C to stop.\n')
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
    finally:
        srv.server_close()


if __name__ == '__main__':
    main()
