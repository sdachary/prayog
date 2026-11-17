/* ============================================================
   Prayog Tool Pages — Shared Interactions
   ============================================================ */

(() => {
  'use strict';

  // ============================================================
  // Reduced Motion Check
  // ============================================================
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================================
  // Toast Notifications
  // ============================================================
  function createToastContainer() {
    let container = document.querySelector('.tool-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'tool-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  window.showToast = function(message, type = 'info', duration = 4000) {
    const container = createToastContainer();
    const toast = document.createElement('div');
    toast.className = `tool-toast tool-toast--${type}`;
    toast.innerHTML = `
      <span class="tool-toast-icon" aria-hidden="true">
        ${type === 'success' ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
        ${type === 'error' ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>' : ''}
        ${type === 'info' ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>' : ''}
      </span>
      <span class="tool-toast-message">${message}</span>
      <button class="tool-toast-close" aria-label="Dismiss"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
    `;
    toast.querySelector('.tool-toast-close').addEventListener('click', () => removeToast(toast));
    container.appendChild(toast);
    if (duration > 0) setTimeout(() => removeToast(toast), duration);
    return toast;
  };

  function removeToast(toast) {
    toast.style.animation = 'toast-in 0.2s ease-in reverse';
    setTimeout(() => toast.remove(), 200);
  }

  // ============================================================
  // Dialog / Modal
  // ============================================================
  window.showDialog = function({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, variant = 'default' }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'tool-dialog-overlay';
      overlay.innerHTML = `
        <div class="tool-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
          <h3 id="dialog-title" class="tool-dialog-title">${title}</h3>
          <p class="tool-dialog-text">${message}</p>
          <div class="tool-dialog-actions">
            <button type="button" class="tool-btn tool-btn--secondary tool-dialog-cancel">${cancelText}</button>
            <button type="button" class="tool-btn tool-btn--${variant === 'danger' ? 'danger' : 'primary'} tool-dialog-confirm">${confirmText}</button>
          </div>
        </div>
      `;
      const dialog = overlay.querySelector('.tool-dialog');
      const close = () => {
        overlay.classList.remove('tool-dialog-overlay--open');
        setTimeout(() => overlay.remove(), 200);
      };
      overlay.querySelector('.tool-dialog-cancel').addEventListener('click', () => { resolve(false); close(); });
      overlay.querySelector('.tool-dialog-confirm').addEventListener('click', () => { resolve(true); close(); });
      overlay.addEventListener('click', (e) => { if (e.target === overlay) { resolve(false); close(); } });
      document.body.appendChild(overlay);
      // Force reflow for animation
      requestAnimationFrame(() => overlay.classList.add('tool-dialog-overlay--open'));
      // Focus trap
      const focusable = dialog.querySelectorAll('button');
      focusable[1].focus();
      dialog.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { resolve(false); close(); }
        if (e.key === 'Tab') {
          const first = focusable[0], last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
    });
  };

  // ============================================================
  // Copy to Clipboard
  // ============================================================
  window.copyToClipboard = async function(text, successMessage = 'Copied!') {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage, 'success');
      return true;
    } catch (e) {
      showToast('Failed to copy', 'error');
      return false;
    }
  };

  // ============================================================
  // File Size Formatting
  // ============================================================
  window.formatBytes = function(bytes, decimals = 1) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };

  // ============================================================
  // Time Formatting (HH:MM:SS)
  // ============================================================
  window.formatTime = function(seconds) {
    seconds = Math.floor(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
  };

  window.parseTime = function(timeStr) {
    const parts = timeStr.split(':').map(Number);
    if (parts.length !== 3) return 0;
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  };

  // ============================================================
  // Duration Formatting (human readable)
  // ============================================================
  window.formatDuration = function(ms) {
    const s = Math.floor(ms / 1000);
    if (s < 60) return s + 's';
    const m = Math.floor(s / 60);
    return m + 'm ' + (s % 60) + 's';
  };

  // ============================================================
  // HTML Escaping
  // ============================================================
  window.escapeHtml = function(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&', '<': '<', '>': '>', '"': '"', "'": '''
    }[c]));
  };

  // ============================================================
  // Dropzone Helpers
  // ============================================================
  window.initDropzone = function(dropzoneEl, fileInputEl, onFiles) {
    const dz = dropzoneEl;
    const input = fileInputEl;

    ['dragover', 'dragenter'].forEach(evt => dz.addEventListener(evt, e => {
      e.preventDefault(); dz.classList.add('drag');
    }));
    ['dragleave', 'drop'].forEach(evt => dz.addEventListener(evt, e => {
      e.preventDefault(); dz.classList.remove('drag');
    }));
    dz.addEventListener('drop', e => {
      const files = Array.from(e.dataTransfer.files);
      if (files.length) onFiles(files);
    });
    dz.addEventListener('click', () => input.click());
    dz.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    input.addEventListener('change', e => {
      const files = Array.from(e.target.files);
      if (files.length) onFiles(files);
      input.value = '';
    });
  };

  window.collectFolderEntries = function(dataTransfer) {
    return new Promise(resolve => {
      const out = [];
      const entries = [];
      for (const item of dataTransfer.items) {
        const entry = item.webkitGetAsEntry && item.webkitGetAsEntry();
        if (entry) entries.push(entry);
      }
      async function walkAll() {
        if (entries.length === 0) {
          for (const f of dataTransfer.files) out.push({ file: f });
          resolve(out);
          return;
        }
        async function walk(entry, prefix) {
          if (entry.isFile) {
            const f = await new Promise(res => entry.file(res, () => res(null)));
            if (f) out.push({ file: f, relPath: (prefix ? prefix + '/' : '') + f.name });
            return;
          }
          const reader = entry.createReader();
          const sub = (prefix ? prefix + '/' : '') + entry.name;
          for (;;) {
            const batch = await new Promise((res, rej) => reader.readEntries(res, rej));
            if (!batch.length) break;
            for (const child of batch) await walk(child, sub);
          }
        }
        for (const entry of entries) await walk(entry, '');
        resolve(out);
      }
      walkAll().catch(err => { console.error('drop traversal failed', err); resolve([]); });
    });
  };

  // ============================================================
  // Mode / Tab Switching
  // ============================================================
  window.initModeSelectors = function(containerSelector, onChange) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    container.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('tool-mode--active', 'active'));
        btn.classList.add('tool-mode--active');
        onChange?.(btn.dataset.mode);
      });
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
      });
    });
  };

  window.initTabs = function(tabsSelector, panelsSelector, onChange) {
    const tabs = document.querySelector(tabsSelector);
    const panels = document.querySelector(panelsSelector);
    if (!tabs || !panels) return;
    tabs.querySelectorAll('.tool-tab').forEach((tab, i) => {
      tab.addEventListener('click', () => {
        tabs.querySelectorAll('.tool-tab').forEach(t => t.classList.remove('tool-tab--active'));
        tab.classList.add('tool-tab--active');
        panels.querySelectorAll('[role="tabpanel"]').forEach((p, j) => {
          p.classList.toggle('hidden', j !== i);
        });
        onChange?.(i, tab.dataset.tab);
      });
    });
  };

  // ============================================================
  // Progress Bar Animation
  // ============================================================
  window.animateProgress = function(fillEl, percent, duration = 300) {
    if (!fillEl) return;
    if (prefersReduced) {
      fillEl.style.transform = 'scaleX(' + percent / 100 + ')';
      return;
    }
    fillEl.style.transition = 'transform ' + duration + 'ms ease-out';
    fillEl.style.transform = 'scaleX(' + percent / 100 + ')';
  };

  // ============================================================
  // Scroll Reveal (IntersectionObserver)
  // ============================================================
  function initScrollReveal() {
    if (prefersReduced) {
      document.querySelectorAll('.tool-card').forEach(el => el.style.opacity = 1);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    document.querySelectorAll('.tool-card').forEach((el, i) => {
      el.style.opacity = 0;
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
      el.style.transitionDelay = (i * 60) + 'ms';
      observer.observe(el);
    });
  }

  // ============================================================
  // Keyboard Shortcuts (Global)
  // ============================================================
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      // Escape closes dialogs
      if (e.key === 'Escape') {
        document.querySelectorAll('.tool-dialog-overlay').forEach(o => o.click());
      }
      // Cmd/Ctrl + K focuses search (if exists)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        const search = document.querySelector('input[type="search"]');
        if (search) { e.preventDefault(); search.focus(); }
      }
    });
  }

  // ============================================================
  // Theme Toggle Sync (with nav.js)
  // ============================================================
  function initThemeSync() {
    // Listen for storage changes from other tabs
    window.addEventListener('storage', e => {
      if (e.key === 'prayog-theme' && e.newValue) {
        document.documentElement.setAttribute('data-theme', e.newValue);
      }
    });
  }

  // ============================================================
  // Initialize on DOM Ready
  // ============================================================
  function init() {
    initScrollReveal();
    initKeyboardShortcuts();
    initThemeSync();

    // Add entrance animation to tool-main
    const main = document.querySelector('.tool-main');
    if (main && !prefersReduced) {
      main.style.opacity = 0;
      main.style.transform = 'translateY(20px)';
      main.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      requestAnimationFrame(() => {
        main.style.opacity = 1;
        main.style.transform = 'translateY(0)';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();