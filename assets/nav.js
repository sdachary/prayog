(function(){
  function mountToggle(parent, root, ml){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    if (ml) btn.style.marginLeft = ml + 'px';
    function paint(){
      var light = root.getAttribute('data-theme') === 'light';
      btn.textContent = light ? 'Dark' : 'Light';
      btn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    }
    btn.addEventListener('click', function(){
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('prayog-theme', next); } catch (e) {}
      paint();
    });
    paint();
    parent.appendChild(btn);
  }

  /* ---- theme boot (landing also inlines this in <head> to avoid a flash) ---- */
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem('prayog-theme'); } catch (e) {}
  root.setAttribute('data-theme',
    (stored === 'light' || stored === 'dark')
      ? stored
      : ((window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark'));

  var name = (document.currentScript && document.currentScript.getAttribute('data-tool')) || '';
  var hasTokens = !!document.querySelector('link[href*="theme.css"]');
  var slot = document.getElementById('theme-slot');

  /* Landing: toggle only — the hero already carries the brand. */
  if (slot) {
    if (hasTokens) mountToggle(slot, root, 0);
    return;
  }

  /* Tool page: breadcrumb + toggle + legal links. */
  var esc = name.replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
  });
  // ponytail: one shared responsive rule — on phones the crumb + legal links
  // collapse, leaving brand + theme toggle (fixes overflow on all 16 tools).
  if (!document.getElementById('prayog-nav-css')) {
    var st = document.createElement('style');
    st.id = 'prayog-nav-css';
    st.textContent = '@media (max-width:640px){.prayog-nav .nav-tool,.prayog-nav .nav-legal{display:none}}';
    document.head.appendChild(st);
  }
  var nav = document.createElement('div');
  nav.className = 'prayog-nav';
  nav.style.cssText = 'width:100%;max-width:700px;margin:0 auto 16px;padding:0 16px;display:flex;align-items:center';
  nav.innerHTML = '<a href="/" style="font-family:var(--mono);font-size:11px;color:var(--muted);text-decoration:none;letter-spacing:0.06em">PRAYOG<span style="color:var(--amber)">//</span>TOOLS</a>' +
    (esc ? '<span class="nav-tool" style="font-family:var(--mono);font-size:11px;color:var(--muted);margin:0 6px">/</span><span class="nav-tool" style="font-family:var(--mono);font-size:11px;color:var(--teal)">' + esc + '</span>' : '') +
    '<span style="flex:1"></span>';
  if (hasTokens) mountToggle(nav, root, 10);
  nav.insertAdjacentHTML('beforeend',
    '<a class="nav-legal" href="/privacy.html" style="font-family:var(--mono);font-size:11px;color:var(--muted);text-decoration:none;letter-spacing:0.06em;margin-left:10px">PRIVACY</a>' +
    '<span class="nav-legal" style="font-family:var(--mono);font-size:11px;color:var(--muted);margin:0 6px">·</span>' +
    '<a class="nav-legal" href="/terms.html" style="font-family:var(--mono);font-size:11px;color:var(--muted);text-decoration:none;letter-spacing:0.06em">TERMS</a>');

  var el = document.querySelector('.wrap') || document.querySelector('.container');
  if (el) el.insertBefore(nav, el.firstChild);
})();
