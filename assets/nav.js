(function(){
  var name = document.currentScript && document.currentScript.getAttribute('data-tool') || '';
  var nav = document.createElement('div');
  nav.style.cssText = 'width:100%;max-width:700px;margin:0 auto 16px;padding:0 16px;';
  nav.innerHTML = '<a href="/" style="font-family:var(--mono);font-size:11px;color:var(--muted);text-decoration:none;letter-spacing:0.06em">PRAYOG<span style="color:var(--amber)">//</span>TOOLS</a>' +
    (name ? '<span style="font-family:var(--mono);font-size:11px;color:var(--muted);margin:0 6px">/</span><span style="font-family:var(--mono);font-size:11px;color:var(--teal)">' + name + '</span>' : '');
  var el = document.querySelector('.wrap') || document.querySelector('.container');
  if(el) el.insertBefore(nav, el.firstChild);
})();
