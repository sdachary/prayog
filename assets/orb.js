/* <thinking-orb> — dotted loading orb, vanilla.
 *
 * Wraps the framework-free thinking-orbs engine
 * (assets/vendor/thinking-orbs-engine.js, MIT, Jakub Antalik) as a custom
 * element. No React, no build step, no network.
 *
 *   <thinking-orb state="connecting" size="20"></thinking-orb>
 *
 * Attributes
 *   state   working | searching | solving | listening | connecting |
 *           weaving | composing | breathing | shaping   (default working)
 *   size    20 (inline) | 64 (card) — the two tuned upstream presets.
 *           These are separate designs, not a scale factor; other values
 *           fall back to 64.
 *   speed   multiplier on the preset's baked speed        (default 1)
 *   paused  freeze on the current frame
 *   theme   auto | dark | light — auto reads data-theme / .dark / .light on
 *           any ancestor, then prefers-color-scheme, and updates live.
 *   label   overrides the per-state aria-label
 *
 * Behaviour mirrors upstream's React component: role="img" + aria-label,
 * a static frame for prefers-reduced-motion, offscreen/hidden pausing,
 * device-pixel-ratio capped at 2, and one shared clock so every orb on the
 * page stays in phase.
 */
(function () {
  'use strict';

  var E = window.ThinkingOrbsEngine;
  if (!E) {
    console.warn('[thinking-orb] engine missing — load assets/vendor/thinking-orbs-engine.js first');
    return;
  }

  var LABELS = {
    working: 'Working…',
    searching: 'Searching…',
    solving: 'Solving…',
    listening: 'Listening…',
    connecting: 'Connecting…',
    weaving: 'Weaving…',
    composing: 'Composing…',
    breathing: 'Thinking…',
    shaping: 'Shaping…'
  };

  var instances = [];
  var raf = 0;
  var reduced = false;
  var sysDark = true;
  var mqReduce = null;
  var mqDark = null;

  /* ---- shared stylesheet, injected once ---- */
  if (!document.getElementById('thinking-orb-css')) {
    var st = document.createElement('style');
    st.id = 'thinking-orb-css';
    st.textContent =
      'thinking-orb{display:inline-block;line-height:0;vertical-align:middle}' +
      'thinking-orb[hidden]{display:none}';
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---- theme resolution ---- */
  function ancestorDark(el) {
    var n = el;
    while (n && n.nodeType === 1) {
      var a = n.getAttribute && n.getAttribute('data-theme');
      if (a === 'dark') return true;
      if (a === 'light') return false;
      if (n.classList) {
        if (n.classList.contains('dark')) return true;
        if (n.classList.contains('light')) return false;
      }
      n = n.parentElement;
    }
    return null;
  }

  /* ---- one shared rAF loop, one shared clock ---- */
  function tick() {
    raf = 0;
    var t = performance.now() / 1000;
    for (var i = 0; i < instances.length; i++) instances[i].draw(t);
    if (instances.length) raf = requestAnimationFrame(tick);
  }

  function start() {
    if (!raf && instances.length) raf = requestAnimationFrame(tick);
  }

  function stop() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function redrawAll() {
    for (var i = 0; i < instances.length; i++) {
      instances[i].resolveTheme();
      instances[i].dirty = true;
      instances[i].draw(performance.now() / 1000);
    }
  }

  class ThinkingOrb extends HTMLElement {
    static get observedAttributes() {
      return ['state', 'size', 'speed', 'paused', 'theme', 'label'];
    }

    connectedCallback() {
      this.visible = true;
      this.dirty = true;
      this.setup();
      if (instances.indexOf(this) === -1) instances.push(this);
      this.observe();
      start();
    }

    disconnectedCallback() {
      var i = instances.indexOf(this);
      if (i > -1) instances.splice(i, 1);
      if (this.io) {
        this.io.disconnect();
        this.io = null;
      }
      if (!instances.length) stop();
    }

    attributeChangedCallback(name, oldV, newV) {
      if (oldV === newV) return;
      if (name === 'label') {
        this.applyLabel();
        return;
      }
      if (name === 'theme') {
        this.resolveTheme();
        this.dirty = true;
        return;
      }
      if (name === 'paused') {
        this.dirty = true;
        return;
      }
      this.setup();
      this.dirty = true;
    }

    /* build (or rebuild) the canvas for the current attributes */
    setup() {
      var state = this.getAttribute('state') || 'working';
      var raw = parseInt(this.getAttribute('size'), 10);
      var size = raw === 20 ? 20 : 64;
      var speed = parseFloat(this.getAttribute('speed'));
      if (!isFinite(speed) || speed <= 0) speed = 1;

      this.state = state;
      this.size = size;
      this.speed = speed;

      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute('role', 'img');
        this.appendChild(this.canvas);
      }
      this.canvas.style.width = size + 'px';
      this.canvas.style.height = size + 'px';
      this.canvas.style.display = 'block';

      var dpr = Math.min(2, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1);
      this.canvas.width = Math.round(size * dpr);
      this.canvas.height = Math.round(size * dpr);
      this.dpr = dpr;
      this.ctx = this.canvas.getContext('2d');

      var r = E.resolvePreset(state, size);
      this.mode = r.mode;
      this.opts = r.opts;
      this.effSpeed = r.speed * speed;
      this.painter = E.MODE_DRAWS[r.mode];

      this.applyLabel();
      this.resolveTheme();
    }

    applyLabel() {
      if (!this.canvas) return;
      var label = this.getAttribute('label') || LABELS[this.state] || this.state;
      this.canvas.setAttribute('aria-label', label);
    }

    resolveTheme() {
      var theme = this.getAttribute('theme') || 'auto';
      if (theme === 'dark') this.dark = true;
      else if (theme === 'light') this.dark = false;
      else {
        var fromTree = ancestorDark(this);
        this.dark = fromTree === null ? sysDark : fromTree;
      }
    }

    observe() {
      if (typeof IntersectionObserver !== 'undefined' && !this.io) {
        var self = this;
        this.io = new IntersectionObserver(function (entries) {
          self.visible = entries[0].isIntersecting;
        });
        this.io.observe(this.canvas);
      }
    }

    /* t is seconds on the shared clock; instances scale it by their own speed */
    draw(t) {
      if (!this.ctx || !this.painter) return;
      var hidden = document.visibilityState === 'hidden';
      var paused = this.hasAttribute('paused');

      if (reduced) {
        /* one static representative frame, still following the live theme */
        if (!this.dirty) return;
        this.paint(0.6);
        this.dirty = false;
        return;
      }
      if (paused || hidden || !this.visible) {
        /* keep the last frame on screen; nothing to repaint */
        if (!this.dirty) return;
        this.paint(0.6);
        this.dirty = false;
        return;
      }
      this.paint(t * this.effSpeed);
      this.dirty = false;
    }

    paint(t) {
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.ctx.clearRect(0, 0, this.size, this.size);
      this.painter(this.ctx, this.size, t, this.dark, this.opts);
    }
  }

  customElements.define('thinking-orb', ThinkingOrb);

  /* ---- one reduced-motion listener for the whole page ---- */
  if (typeof matchMedia !== 'undefined') {
    mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
    reduced = mqReduce.matches;
    var onReduce = function (e) {
      reduced = e.matches;
      redrawAll();
    };
    if (mqReduce.addEventListener) mqReduce.addEventListener('change', onReduce);
    else if (mqReduce.addListener) mqReduce.addListener(onReduce);

    mqDark = matchMedia('(prefers-color-scheme: dark)');
    sysDark = mqDark.matches;
    var onDark = function (e) {
      sysDark = e.matches;
      redrawAll();
    };
    if (mqDark.addEventListener) mqDark.addEventListener('change', onDark);
    else if (mqDark.addListener) mqDark.addListener(onDark);
  }

  /* ---- one observer for live theme flips (data-theme / .dark / .light) ---- */
  if (typeof MutationObserver !== 'undefined') {
    var mo = new MutationObserver(redrawAll);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
      subtree: true
    });
  }

  window.ThinkingOrb = ThinkingOrb;
})();
