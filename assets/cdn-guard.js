/* CDN load-failure guard — include BEFORE any CDN <script>.
   ponytail: catches resource error events in capture phase and shows one
   inline banner; page-specific code can read window.__cdnFailed. */
(function(){
  function banner(src){
    function show(){
      if(document.getElementById('cdn-guard-msg')) return;
      var d=document.createElement('div');
      d.id='cdn-guard-msg';
      d.setAttribute('role','alert');
      d.style.cssText='margin:0 auto 20px;max-width:960px;box-sizing:border-box;width:calc(100% - 32px);padding:12px 16px;background:rgba(217,83,79,.12);border:1px solid var(--red);color:var(--text);font:13.5px/1.5 var(--sans);border-radius:10px;';
      d.textContent='Some features could not load ('+src.split('/').pop()+') — check your internet connection and reload. The rest of this page still works.';
      var wrap=document.querySelector('.wrap');
      if(wrap) wrap.insertBefore(d, wrap.firstChild);
      else document.body.insertBefore(d, document.body.firstChild);
    }
    if(document.body) show();
    else document.addEventListener('DOMContentLoaded', show);
  }
  // analytics/tracking scripts are injected by the host (Cloudflare Pages
  // beacon etc.) — their failure is never a missing feature. Skip them.
  var IGNORE = /cloudflareinsights|google-analytics|googletagmanager|doubleclick|facebook\.net|hotjar|segment\.io|mixpanel/i;
  window.addEventListener('error', function(e){
    var t=e.target;
    if(t && t.tagName==='SCRIPT' && t.src && /^https?:/.test(t.src) && !IGNORE.test(t.src)){
      window.__cdnFailed=(window.__cdnFailed||[]).concat(t.src);
      banner(t.src);
    }
  }, true);
})();
