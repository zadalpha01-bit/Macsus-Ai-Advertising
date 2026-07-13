/* ═══════════════════════════════════════════════════════════════════════════
   MACSUS AI — MAIN APPLICATION SCRIPT
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   CUSTOM SPLASH SCREEN
   ═══════════════════════════════════════════════════════════════════════════ */

const _splash = {
  el: null,
  minTime: 1500,
  maxTime: 4000,
  startTime: Date.now(),
  ready: false,

  init() {
    this.el = document.getElementById('custom-splash');
    if (this.el) {
      this.startTime = Date.now();
      setTimeout(() => this.tryHide(), this.maxTime);
    }
  },

  markReady() {
    this.ready = true;
    this.tryHide();
  },

  tryHide() {
    if (!this.el || !this.ready) return;
    const elapsed = Date.now() - this.startTime;
    const wait = Math.max(0, this.minTime - elapsed);
    setTimeout(() => this.hide(), wait);
  },

  hide() {
    if (!this.el) return;
    this.el.classList.add('fade-out');
    setTimeout(() => {
      if (this.el && this.el.parentNode) {
        this.el.parentNode.removeChild(this.el);
      }
      this.el = null;
    }, 500);
  }
};

_splash.init();

/* ═══════════════════════════════════════════════════════════════════════════
   THEME TOGGLE — DARK MODE & LIGHT MODE
   ═══════════════════════════════════════════════════════════════════════════ */

function initTheme() {
  const saved = localStorage.getItem('theme-mode') || 'light';
  if (saved === 'light') {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.add('dark-mode');
  }
  updateThemeIcon();
}

/* ═══════════════════════════════════════════════════════════════════════════
   HISTORY VIEW & ITEM TOGGLES
   ═══════════════════════════════════════════════════════════════════════════ */

var _historyViewMode = localStorage.getItem('historyView') || 'list';

function toggleHistoryView() {
  var list = document.getElementById('riwayat-history-list');
  var icon = document.getElementById('riwayat-view-toggle-icon');
  var btn = document.getElementById('riwayat-btn-view-toggle');
  if (!list || !icon || !btn) return;
  if (_historyViewMode === 'list') {
    _historyViewMode = 'grid';
    list.classList.add('grid-view');
    icon.textContent = 'grid_view';
    btn.classList.add('active');
  } else {
    _historyViewMode = 'list';
    list.classList.remove('grid-view');
    icon.textContent = 'view_list';
    btn.classList.remove('active');
  }
  localStorage.setItem('historyView', _historyViewMode);
}

function applyHistoryView() {
  var list = document.getElementById('riwayat-history-list');
  var icon = document.getElementById('riwayat-view-toggle-icon');
  var btn = document.getElementById('riwayat-btn-view-toggle');
  if (!list) return;
  if (_historyViewMode === 'grid') {
    list.classList.add('grid-view');
    if (icon) icon.textContent = 'grid_view';
    if (btn) btn.classList.add('active');
  } else {
    list.classList.remove('grid-view');
    if (icon) icon.textContent = 'view_list';
    if (btn) btn.classList.remove('active');
  }
}

function toggleHistoryItem(btn) {
  var item = btn.closest('.beranda-history-item');
  if (!item) return;
  var wasOpen = item.classList.contains('open');
  document.querySelectorAll('.beranda-history-item.open').forEach(function(el) {
    el.classList.remove('open');
    var s = el.querySelector('.beranda-history-surface');
    if (s) { s.classList.remove('open'); s.style.transform = ''; }
  });
  if (!wasOpen) {
    item.classList.add('open');
    var surface = item.querySelector('.beranda-history-surface');
    if (surface) surface.classList.add('open');
  }
}

function toggleNotesCard(mode) {
  var idMap = {
    'ig': 'notes-card-ig',
    'gbisnis': 'notes-card-gbisnis',
    'wa': 'notes-card-wa',
    'fb': 'notes-card-fb',
    'tt': 'notes-card-tt'
  };
  var card = document.getElementById(idMap[mode] || 'notes-card');
  if (card) {
    var isExpanded = card.classList.toggle('expanded');
    var body = card.querySelector('.notes-card-body');
    if (body) body.style.display = isExpanded ? 'block' : 'none';
    var header = card.querySelector('[onclick]');
    if (header) {
      var arrows = header.querySelectorAll('.material-symbols-outlined');
      var arrow = arrows[arrows.length - 1];
      if (arrow) arrow.style.transform = isExpanded ? '' : 'rotate(-90deg)';
    }
    if (isExpanded) {
      card.style.flex = '1';
      card.style.minHeight = '0';
    } else {
      card.style.flex = 'none';
      card.style.minHeight = 'auto';
    }
  }
}

function autoResizeTA(el) {
  el.style.height = 'auto';
  var maxH = 200;
  el.style.height = Math.min(el.scrollHeight, maxH) + 'px';
}

function selectDuration(btn) {
  document.querySelectorAll('.duration-btn').forEach(function(b) {
    b.style.borderColor = 'transparent';
    var span = b.querySelector('span:first-child');
    if (span) span.style.color = 'var(--text-primary)';
  });
  btn.style.borderColor = 'rgba(9,76,178,0.3)';
  var span = btn.querySelector('span:first-child');
  if (span) span.style.color = 'var(--accent)';
}

/* ═══════════════════════════════════════════════════════════════════════════
   LAYER DUPLICATION THEME TRANSITION
   Two stacked layers: bottom (old theme), top (new theme).
   Top layer clip-path animates inset(0 0 0 100%) → inset(0) = right-to-left wipe.
   Text/icons always visible because both layers have identical DOM content.
   ═══════════════════════════════════════════════════════════════════════════ */

var _DARK_VARS = {
  '--bg-page':'#0F1117','--bg-surface':'#1A1D27','--bg-elevated':'#1A1D27',
  '--bg-hover':'#252833','--bg-active':'#2E3140',
  '--border':'#2E3140','--border-light':'#252833','--border-focus':'#14B8A6',
  '--text-primary':'#F1F5F9','--text-secondary':'#CBD5E1',
  '--text-tertiary':'#64748B','--text-inverse':'#0F1117',
  '--accent':'#14B8A6','--accent-hover':'#2DD4BF',
  '--accent-light':'rgba(20,184,166,0.15)','--accent-muted':'rgba(20,184,166,0.1)',
  '--green':'#22C55E','--green-light':'rgba(34,197,94,0.12)',
  '--red':'#F87171','--red-light':'rgba(248,113,113,0.12)',
  '--yellow':'#FBBF24','--yellow-light':'rgba(251,191,36,0.12)',
  '--blue':'#60A5FA','--blue-light':'rgba(96,165,250,0.12)',
  '--ig':'#F472B6','--ig-light':'rgba(244,114,182,0.1)',
  '--wa':'#4ADE80','--wa-light':'rgba(74,222,128,0.1)',
  '--fb':'#60A5FA','--fb-light':'rgba(96,165,250,0.1)',
  '--gb':'#FBBF24','--gb-light':'rgba(251,191,36,0.1)',
  '--tt':'#E2E8F0','--tt-light':'rgba(226,232,240,0.08)',
  '--shadow-sm':'none','--shadow-md':'none',
  '--shadow-lg':'none',
  '--btn-grad-end':'rgba(0,0,0,0.2)','--btn-grad-end-hover':'rgba(0,0,0,0.25)',
  '--btn-ig':'#E1306C','--btn-gb':'#D97706','--btn-wa':'#25D366',
  '--btn-fb':'#1877F2','--btn-tt':'#000000'
};

var _LIGHT_VARS = {
  '--bg-page':'#E8EAED','--bg-surface':'#FFFFFF','--bg-elevated':'#FFFFFF',
  '--bg-hover':'#F0F2F5','--bg-active':'#E8EAED',
  '--border':'#E2E8F0','--border-light':'#F0F2F5','--border-focus':'#0D9488',
  '--text-primary':'#111827','--text-secondary':'#4B5563',
  '--text-tertiary':'#9CA3AF','--text-inverse':'#FFFFFF',
  '--accent':'#0D9488','--accent-hover':'#0F766E',
  '--accent-light':'#CCFBF1','--accent-muted':'rgba(13,148,136,0.08)',
  '--green':'#16A34A','--green-light':'#DCFCE7',
  '--red':'#DC2626','--red-light':'#FEE2E2',
  '--yellow':'#D97706','--yellow-light':'#FEF3C7',
  '--blue':'#2563EB','--blue-light':'#DBEAFE',
  '--ig':'#E1306C','--ig-light':'rgba(225,48,108,0.08)',
  '--wa':'#25D366','--wa-light':'rgba(37,211,102,0.08)',
  '--fb':'#1877F2','--fb-light':'rgba(24,119,242,0.08)',
  '--gb':'#D97706','--gb-light':'rgba(217,119,6,0.08)',
  '--tt':'#000000','--tt-light':'rgba(0,0,0,0.06)',
  '--shadow-sm':'none','--shadow-md':'none',
  '--shadow-lg':'none',
  '--btn-grad-end':'rgba(255,255,255,0.15)','--btn-grad-end-hover':'rgba(255,255,255,0.12)',
  '--btn-ig':'#E1306C','--btn-gb':'#D97706','--btn-wa':'#25D366',
  '--btn-fb':'#1877F2','--btn-tt':'#000000'
};

var _themeAnimating = false;

function toggleTheme() {
  if (_themeAnimating) return;
  _themeAnimating = true;

  var isDark = document.body.classList.contains('dark-mode');
  var goingDark = !isDark;
  var duration = 500;
  var targetVars = goingDark ? _DARK_VARS : _LIGHT_VARS;

  var clone = document.body.cloneNode(true);

  clone.className = '';
  clone.removeAttribute('id');
  clone.classList.add('theme-clone-layer');
  clone.style.cssText =
    'position:fixed;inset:0;z-index:2147483647;pointer-events:none;' +
    'overflow-y:auto;-ms-overflow-style:none;scrollbar-width:none;' +
    'clip-path:inset(0 0 0 100%);will-change:clip-path;';
  clone.querySelectorAll('style').forEach(function(s) { s.remove(); });
  clone.querySelectorAll('.wipe-glow-line, .theme-clone-layer').forEach(function(e) { e.remove(); });
  clone.querySelectorAll('button, a, input, textarea, select').forEach(function(el) {
    el.setAttribute('disabled', 'true');
    el.style.pointerEvents = 'none';
  });

  Object.keys(targetVars).forEach(function(k) {
    clone.style.setProperty(k, targetVars[k]);
  });

  document.body.appendChild(clone);

  var origContent = document.querySelector('.content-area');
  var cloneContent = clone.querySelector('.content-area');
  if (origContent && cloneContent) {
    cloneContent.scrollTop = origContent.scrollTop;
  }

  var glowLine = document.createElement('div');
  glowLine.className = 'wipe-glow-line';
  glowLine.style.left = '100%';
  document.body.appendChild(glowLine);

  var scrollSync = setInterval(function() {
    if (origContent && cloneContent) {
      cloneContent.scrollTop = origContent.scrollTop;
    }
  }, 16);

  var tl = anime.timeline({ easing: 'linear' });

  tl.add({
    targets: clone,
    clipPath: ['inset(0 0 0 100%)', 'inset(0 0 0 0%)'],
    duration: duration
  }, 0);

  tl.add({
    targets: glowLine,
    left: ['100%', '0%'],
    duration: duration
  }, 0);

  tl.finished.then(function() {
    clearInterval(scrollSync);
    if (isDark) {
      document.body.classList.remove('dark-mode');
    } else {
      document.body.classList.add('dark-mode');
    }
    localStorage.setItem('theme-mode', goingDark ? 'dark' : 'light');
    updateThemeIcon();
    clone.remove();
    glowLine.remove();
    _themeAnimating = false;
  });
}

function updateThemeIcon() {
  const btn = document.getElementById('btn-theme-toggle');
  if (!btn) return;
  
  const isDark = document.body.classList.contains('dark-mode');
  btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION TOGGLE
   ═══════════════════════════════════════════════════════════════════════════ */

function initAnimationPreference() {
  const saved = localStorage.getItem('animations-disabled') === 'true';
  if (saved) {
    document.body.classList.add('disable-animations');
    updateAnimationToggleButton();
  }
}

function toggleAnimations() {
  const isDisabled = document.body.classList.contains('disable-animations');
  
  if (isDisabled) {
    document.body.classList.remove('disable-animations');
    localStorage.setItem('animations-disabled', 'false');
  } else {
    document.body.classList.add('disable-animations');
    localStorage.setItem('animations-disabled', 'true');
  }
  
  updateAnimationToggleButton();
}

function updateAnimationToggleButton() {
  const btn = document.getElementById('btn-toggle-animation');
  if (!btn) return;
  
  const isDisabled = document.body.classList.contains('disable-animations');
  
  if (isDisabled) {
    btn.classList.add('active');
    btn.innerHTML = '<i class="fas fa-check"></i>';
    btn.title = 'Animasi sedang dimatikan';
  } else {
    btn.classList.remove('active');
    btn.innerHTML = '<i class="fas fa-film"></i>';
    btn.title = 'Klik untuk matikan animasi';
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   INITIALIZATION
   ═══════════════════════════════════════════════════════════════════════════ */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAnimationPreference();
  });
} else {
  initTheme();
  initAnimationPreference();
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('App initializing...');
  
  try {
    if (typeof window.supabaseAuth !== 'undefined') {
      const authResult = await window.supabaseAuth.autoLogin();
      
      if (authResult.isLoggedIn) {
        console.log('Auto-login successful:', authResult.user.email);
        
        if (typeof window.versionCheck !== 'undefined') {
          const version = window.versionCheck.getStoredVersion();
          const versionEl = document.getElementById('current-version');
          if (versionEl) versionEl.textContent = 'v' + version;
        }
        
        if (typeof window.sessionSync !== 'undefined') {
          await window.sessionSync.initSessionSync();
          window.sessionSync.startPeriodicSync();
        }
        
        if (typeof window.versionCheck !== 'undefined') {
          await window.versionCheck.initVersionCheck();
          window.versionCheck.startPeriodicVersionCheck();
        }
      } else {
        console.log('Not logged in, redirecting to login page');
        window.location.href = 'login.html';
      }
    }
  } catch (error) {
    console.error('Auth initialization error:', error);
  }
  
  updateAccountDisplay();
  _splash.markReady();
});

/* ═══════════════════════════════════════════════════════════════════════════
   ACCOUNT DROPDOWN MENU
   ═══════════════════════════════════════════════════════════════════════════ */

let _activeAccountMenuTimeout = null;

function toggleAccountMenu() {
  const dropdown = document.getElementById('account-dropdown');
  const syncBtn = document.getElementById('sync-indicator');
  
  const isVisible = dropdown.classList.contains('visible');
  
  if (isVisible) {
    closeAccountMenu();
  } else {
    openAccountMenu(syncBtn);
  }
}

function openAccountMenu(btn) {
  const dropdown = document.getElementById('account-dropdown');
  const overlay = document.getElementById('account-overlay');
  updateAccountDisplay();

  if (btn) {
    const btnRect = btn.getBoundingClientRect();
    dropdown.style.top = (btnRect.bottom + 8) + 'px';
  } else {
    dropdown.style.top = '56px';
    dropdown.style.right = '32px';
    dropdown.style.left = 'auto';
  }

  if (overlay) {
    overlay.style.display = 'block';
    anime({ targets: overlay, opacity: [0, 1], duration: 200, easing: 'easeOutQuad' });
  }

  dropdown.style.transform = 'translateY(-100%)';
  dropdown.classList.add('visible');
  dropdown.style.display = 'block';
  anime({
    targets: dropdown,
    translateY: ['-100%', '0%'],
    duration: 250,
    easing: 'easeOutCubic'
  });

  if (_activeAccountMenuTimeout) clearTimeout(_activeAccountMenuTimeout);
  _activeAccountMenuTimeout = setTimeout(() => {
    document.addEventListener('click', closeAccountMenu, { once: true });
  }, 10);
}

function closeAccountMenu() {
  const dropdown = document.getElementById('account-dropdown');
  const overlay = document.getElementById('account-overlay');
  if (_activeAccountMenuTimeout) clearTimeout(_activeAccountMenuTimeout);

  anime({
    targets: dropdown,
    translateY: ['0%', '-100%'],
    duration: 200,
    easing: 'easeInCubic',
    complete: function() {
      dropdown.classList.remove('visible');
      dropdown.style.display = 'none';
    }
  });

  if (overlay) {
    anime({
      targets: overlay,
      opacity: [1, 0],
      duration: 150,
      easing: 'easeInQuad',
      complete: function() { overlay.style.display = 'none'; }
    });
  }
}

function updateAccountDisplay() {
  const email = localStorage.getItem('macsus_email') || 'User';
  const displayName = email.split('@')[0] || email;
  
  const nameEl = document.getElementById('account-display-name');
  const emailEl = document.getElementById('account-display-email');
  const akunName = document.getElementById('akun-display-name');
  const akunEmail = document.getElementById('akun-display-email');
  
  if (nameEl) nameEl.textContent = displayName;
  if (emailEl) emailEl.textContent = email;
  if (akunName) akunName.textContent = displayName;
  if (akunEmail) akunEmail.textContent = email;
}

async function handleSwitchAccount() {
  try {
    closeAccountMenu();
    await window.supabaseAuth.logoutUser();
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Switch account error:', error);
    window.location.href = 'login.html';
  }
}

async function handleAddAccount() {
  try {
    closeAccountMenu();
    await window.supabaseAuth.logoutUser();
    window.location.href = 'register.html';
  } catch (error) {
    console.error('Add account error:', error);
    window.location.href = 'register.html';
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   SERVICE WORKER & PWA
   ═══════════════════════════════════════════════════════════════════════════ */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker terdaftar!', reg))
      .catch(err => console.log('SW Gagal:', err));
  });
}

let deferredPrompt;
const installBtn = document.getElementById('btn-install-pwa');

function updateInstallBtn() {
  if (!installBtn) return;
  if (deferredPrompt) {
    installBtn.classList.remove('disabled');
    installBtn.disabled = false;
  } else {
    installBtn.classList.add('disabled');
    installBtn.disabled = true;
  }
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  updateInstallBtn();
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  updateInstallBtn();
});

async function installPWA() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    deferredPrompt = null;
    updateInstallBtn();
  }
}

updateInstallBtn();

/* ═══════════════════════════════════════════════════════════════════════════
   STATE & STORAGE
   ═══════════════════════════════════════════════════════════════════════════ */

let currentMode = null;
let currentTab  = 0;
let historyData = [];

// Load history from IndexedDB on startup
HistoryDB.migrateFromLocalStorage('macsus_history').then(() => {
  return HistoryDB.get('macsus_history');
}).then(data => {
  if (data) historyData = data;
  if (typeof renderBerandaStats === 'function') renderBerandaStats();
}).catch(() => {});

// Save history to IndexedDB (replaces localStorage.setItem)
function saveHistory() {
  HistoryDB.set('macsus_history', historyData).catch(e => {
    console.warn('⚠️ Failed to save history to IndexedDB:', e);
  });
}

const THEME_CLASSES = ['theme-ig', 'theme-gbisnis', 'theme-wa', 'theme-fb', 'theme-tt'];

var DI_MODE_GRADIENTS = {
  ig: 'linear-gradient(135deg, rgba(90,40,130,0.93) 0%, rgba(150,40,100,0.93) 25%, rgba(180,30,80,0.93) 50%, rgba(180,80,40,0.93) 75%, rgba(180,120,40,0.93) 100%)',
  wa: 'linear-gradient(135deg, rgba(7,60,50,0.93) 0%, rgba(15,90,75,0.93) 50%, rgba(30,150,90,0.93) 100%)',
  fb: 'linear-gradient(135deg, rgba(18,70,160,0.93) 0%, rgba(40,100,190,0.93) 50%, rgba(80,140,200,0.93) 100%)',
  gbisnis: 'linear-gradient(135deg, rgba(170,50,35,0.93) 0%, rgba(190,140,20,0.93) 33%, rgba(15,120,70,0.93) 66%, rgba(170,50,35,0.93) 100%)',
  tt: 'linear-gradient(135deg, rgba(15,15,15,0.93) 0%, rgba(0,180,175,0.93) 50%, rgba(200,30,60,0.93) 100%)'
};

function applyModeTheme(mode) {
  document.body.classList.remove(...THEME_CLASSES);
  document.body.dataset.mode = mode || '';
  if (mode) {
    document.body.classList.add('theme-' + mode);
  }
}

/* ── CUSTOM SELECT MODAL ── */
class CustomSelect {
  constructor(container, opts) {
    this.container = typeof container === 'string' ? document.getElementById(container) : container;
    this.options = opts.options || [];
    this.placeholder = opts.placeholder || 'Pilih...';
    this.searchable = opts.searchable !== false;
    this.onSelect = opts.onSelect || (() => {});
    this.value = opts.value || '';
    this.autoFocus = opts.autoFocus !== false;
    this._overlay = null;
    this._modal = null;
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    this.container.classList.add('cs-wrap');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cs-trigger';
    this._btn = btn;
    this._updateBtnLabel();
    btn.addEventListener('click', () => this.open());
    this.container.appendChild(btn);
  }

  _updateBtnLabel() {
    const match = this.options.find(o => o.value === this.value);
    if (match) {
      this._btn.textContent = match.label;
      this._btn.classList.remove('cs-placeholder');
    } else {
      this._btn.textContent = this.placeholder;
      this._btn.classList.add('cs-placeholder');
    }
    const chevron = document.createElement('span');
    chevron.className = 'cs-chevron';
    chevron.innerHTML = '<i class="fas fa-chevron-down"></i>';
    this._btn.appendChild(chevron);
  }

  setValue(val) {
    this.value = val;
    this._updateBtnLabel();
  }

  getValue() {
    return this.value;
  }

  open() {
    if (this._overlay) this.close();

    this._overlay = document.createElement('div');
    this._overlay.className = 'cs-overlay';
    this._overlay.addEventListener('click', () => this.close());

    this._modal = document.createElement('div');
    this._modal.className = 'cs-modal';
    this._modal.style.position = 'fixed';
    this._modal.addEventListener('click', e => e.stopPropagation());

    const head = document.createElement('div');
    head.className = 'cs-modal-head';
    const title = document.createElement('span');
    title.className = 'cs-modal-title';
    title.textContent = this.placeholder;
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'cs-modal-close';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.addEventListener('click', () => this.close());
    head.appendChild(title);
    head.appendChild(closeBtn);
    this._modal.appendChild(head);

    if (this.searchable) {
      const search = document.createElement('input');
      search.type = 'text';
      search.className = 'cs-search';
      search.placeholder = 'Cari...';
      search.addEventListener('input', () => {
        const q = search.value.toLowerCase();
        this._list.querySelectorAll('.cs-option').forEach(el => {
          el.style.display = el.dataset.label.toLowerCase().includes(q) ? '' : 'none';
        });
      });
      this._modal.appendChild(search);
    }

    this._list = document.createElement('div');
    this._list.className = 'cs-list';
    this._renderOptions();
    this._modal.appendChild(this._list);

    document.body.appendChild(this._overlay);
    document.body.appendChild(this._modal);

    const btnRect = this._btn.getBoundingClientRect();
    const modalWidth = btnRect.width;
    const modalHeight = this._modal.offsetHeight;
    const gap = 8;

    this._modal.style.width = modalWidth + 'px';
    this._modal.style.left = btnRect.left + 'px';
    this._modal.style.top = (btnRect.top - modalHeight - gap) + 'px';
    this._modal.style.transform = 'scale(0.95)';
    this._overlay.style.opacity = '0';
    this._modal.style.opacity = '0';

    anime({ targets: this._overlay, opacity: [0, 1], duration: 200, easing: 'easeOutQuad' });
    anime({ targets: this._modal, opacity: [0, 1], scale: [0.95, 1], duration: 200, easing: 'easeOutQuad' });

    if (this.searchable && this.autoFocus) {
      const s = this._modal.querySelector('.cs-search');
      if (s) setTimeout(function() { s.focus(); }, 50);
    }
  }

  _renderOptions() {
    this._list.innerHTML = '';
    this.options.forEach(opt => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'cs-option' + (opt.value === this.value ? ' active' : '');
      item.dataset.label = opt.label;
      item.innerHTML = `<i class="fas fa-check cs-option-check"></i><span>${opt.label}</span>`;
      if (opt.desc) {
        item.innerHTML += `<span style="font-size:11px;color:var(--text-tertiary);margin-left:auto;">${opt.desc}</span>`;
      }
      item.addEventListener('click', () => {
        this.value = opt.value;
        this._updateBtnLabel();
        this.onSelect(opt.value);
        this.close();
      });
      this._list.appendChild(item);
    });
  }

  close() {
    if (!this._overlay && !this._modal) return;
    const overlay = this._overlay;
    const modal = this._modal;
    this._overlay = null;
    this._modal = null;

    anime({
      targets: modal,
      opacity: [1, 0],
      scale: [1, 0.95],
      duration: 150,
      easing: 'easeInQuad',
      complete: function() { if (modal.parentNode) modal.remove(); }
    });
    anime({
      targets: overlay,
      opacity: [1, 0],
      duration: 150,
      easing: 'easeInQuad',
      complete: function() { if (overlay.parentNode) overlay.remove(); }
    });
  }
}

/* ── API KEY MANAGEMENT ── */
const API_KEY_STORAGE = 'macsus_gemini_api_key';
const MODEL_STORAGE   = 'macsus_gemini_model';
const DEFAULT_MODEL   = 'gemini-2.5-flash';


// Fallback models

/* ── API KEY ── */
function loadApiKeyToInput() {
  const saved = localStorage.getItem(API_KEY_STORAGE) || '';
  const input = document.getElementById('gemini-api-key-input');
  if (input) {
    input.dataset.realValue = saved;
    input.dataset.masked = 'true';
    input.value = saved ? '•'.repeat(saved.length) : '';
  }
  const icon = document.getElementById('eye-icon');
  if (icon) icon.className = 'fas fa-eye';
  updateApiKeyStatus();
}

function saveApiKey() {
  const input = document.getElementById('gemini-api-key-input');
  if (!input) return;
  const key = input.dataset.masked === 'true' ? (input.dataset.realValue || '').trim() : input.value.trim();
  if (!key) {
    showToast('API Key tidak boleh kosong!', 'error');
    return;
  }
  localStorage.setItem(API_KEY_STORAGE, key);
  input.dataset.realValue = key;
  input.dataset.masked = 'true';
  input.value = '•'.repeat(key.length);
  const icon = document.getElementById('eye-icon');
  if (icon) icon.className = 'fas fa-eye';
  updateApiKeyStatus();
    showToast('API Key tersimpan!', 'success');
}

function updateApiKeyStatus() {
  const key = localStorage.getItem(API_KEY_STORAGE) || '';
  const btn = document.getElementById('btn-save-api');
  if (!btn) return;
  if (key) {
    btn.innerHTML = '<i class="fas fa-check-circle"></i> API Key Tersimpan';
    btn.style.background  = 'var(--green-light)';
    btn.style.borderColor = 'var(--green)';
    btn.style.color       = 'var(--green)';
  } else {
    btn.innerHTML = '<i class="fas fa-save"></i> Simpan API Key';
    btn.style.background  = '';
    btn.style.borderColor = '';
    btn.style.color       = '';
  }
}

/* ── MODEL ── */
const GEMINI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'gemini-2.5-flash', desc: 'Rekomendasi' },
  { value: 'gemini-2.5-pro', label: 'gemini-2.5-pro', desc: 'Paling Pintar' },
  { value: 'gemini-2.5-flash-lite', label: 'gemini-2.5-flash-lite', desc: 'Paling Ringan' },
  { value: 'gemini-2.0-flash', label: 'gemini-2.0-flash', desc: '' },
  { value: 'gemini-2.0-flash-001', label: 'gemini-2.0-flash-001', desc: '' },
  { value: 'gemini-2.0-flash-lite', label: 'gemini-2.0-flash-lite', desc: '' },
  { value: 'gemini-2.0-flash-lite-001', label: 'gemini-2.0-flash-lite-001', desc: '' },
  { value: 'gemini-flash-latest', label: 'gemini-flash-latest', desc: '' },
  { value: 'gemini-flash-lite-latest', label: 'gemini-flash-lite-latest', desc: '' },
  { value: 'gemini-pro-latest', label: 'gemini-pro-latest', desc: '' },
  { value: 'gemma-4-26b-a4b-it', label: 'gemma-4-26b-a4b-it', desc: '' },
  { value: 'gemma-4-31b-it', label: 'gemma-4-31b-it', desc: '' },
  { value: 'gemini-3-flash-preview', label: 'gemini-3-flash-preview', desc: '' },
  { value: 'gemini-3-pro-preview', label: 'gemini-3-pro-preview', desc: '' },
  { value: 'gemini-3.1-flash-lite-preview', label: 'gemini-3.1-flash-lite-preview', desc: '' },
  { value: 'gemini-3.1-pro-preview', label: 'gemini-3.1-pro-preview', desc: '' },
];

const FALLBACK_MODELS = GEMINI_MODELS.map(function(m) { return m.value; });

let csModel = null;

function initModelSelect() {
  const saved = getSelectedModel();
  csModel = new CustomSelect('cs-gemini-model', {
    options: GEMINI_MODELS,
    placeholder: 'Pilih model AI',
    value: saved,
    autoFocus: false,
    onSelect(val) {
      localStorage.setItem(MODEL_STORAGE, val);
      updateModelBadge(val);
    }
  });
  updateModelBadge(saved);
}

function getSelectedModel() {
  return localStorage.getItem(MODEL_STORAGE) || DEFAULT_MODEL;
}

function loadModelToDropdown() {
  const saved = getSelectedModel();
  if (csModel) csModel.setValue(saved);
  updateModelBadge(saved);
}

function saveModel() {
  if (!csModel) return;
  const val = csModel.getValue();
  localStorage.setItem(MODEL_STORAGE, val);
  updateModelBadge(val);
}

function updateModelBadge(model) {
  const badge = document.getElementById('model-active-name');
  if (badge) badge.textContent = model || DEFAULT_MODEL;
}

const IG_TEMPLATES = [
  { value: '', label: 'Pilih template', title: '' },
  { value: 'Overheat treatment - deep cleaning thermal paste yang sudah kering, penggantian thermal paste baru dengan kualitas tinggi, pembersihan debu pada fan dan heatsink, penggantian cooler jika diperlukan, optimasi ventilasi udara dalam casing untuk mencegah overheating berulang', label: 'Overheat Treatment', title: 'Tips Mencegah Laptop Overheat' },
  { value: 'Penggantian layar laptop rusak/pecah/bergaris dengan LCD/IPS panel berkualitas tinggi, kalibrasi warna setelah penggantian, pemasangan presisi oleh teknisi berpengalaman, garansi panel 6 bulan', label: 'Ganti Layar', title: 'Solusi Layar Laptop Rusak' },
  { value: 'Water spill treatment untuk laptop terkena cairan - pembersihan menyeluruh motherboard menggunakan ultrasonic cleaner, pengeringan komponen internal, testing fungsi satu per satu, pencegahan korosi jangka panjang', label: 'Liquid Spill Treatment', title: 'Laptop Kena Air? Ini Solusinya' },
  { value: 'Upgrade atau penggantian hardisk/SSD dengan kapasitas lebih besar untuk mempercepat booting, loading aplikasi, dan transfer data. Konsultasi kapasitas yang sesuai kebutuhan, migrasi data tanpa kehilangan', label: 'Ganti HDD/SSD', title: 'Upgrade SSD untuk Laptop Lebih Cepat' },
  { value: 'Diagnosis dan perbaikan kerusakan motherboard seperti short circuit, power issue, no display. Penggantian komponen SMD jika diperlukan, testing stabilitas setelah perbaikan', label: 'Perbaikan Motherboard', title: 'Perbaikan Motherboard Laptop' },
  { value: 'Install ulang Windows 10/11 dengan optimasi sistem penuh - partitioning hardisk, instalasi driver original, update ke versi terbaru, uninstall bloatware, optimasi startup agar laptop lebih cepat', label: 'Install Ulang OS', title: 'Install Ulang Windows + Optimasi' },
  { value: 'Pembersihan virus, malware, spyware, dan adware dari sistem. Optimasi performa laptop dengan membersihkan file sampah, defrag hardisk, dan setting ulang sistem untuk performa maksimal', label: 'Remove Virus/Malware', title: 'Hapus Virus & Optimasi Laptop' },
  { value: 'Penambahan RAM untuk meningkatkan performa multitasking - konsultasi jenis RAM yang kompatibel, pemasangan dual channel jika memungkinkan, testing stabilitas setelah upgrade', label: 'Upgrade RAM', title: 'Upgrade RAM untuk Multitasking' },
  { value: 'Ganti baterai laptop original dengan kapasitas lebih besar, testing daya tahan baterai, kalibrasi baterai agar terbaca akurat, garansi baterai 3 bulan', label: 'Ganti Baterai', title: 'Ganti Baterai Laptop Awet' },
  { value: 'Pembersihan keyboard laptop dari debu, kotoran, dan cairan yang tersangkut. Penggantian keycaps yang aus atau patah, testing fungsi setiap tombol', label: 'Bersih Keyboard', title: 'Bersih Keyboard Laptop Menyeluruh' },
  { value: 'Perbaikan atau penggantian port USB, HDMI, charging port yang rusak atau longgar. Soldering presisi oleh teknisi berpengalaman, testing konektivitas setelah perbaikan', label: 'Perbaikan Port', title: 'Perbaikan Port USB & Charging' },
  { value: 'Upgrade atau penggantian fan laptop yang berisik atau mati. Pembersihan debu pada fan dan heatsink, pemberian oli pada bearing jika diperlukan', label: 'Ganti Fan', title: 'Ganti Fan Laptop Berisik' },
  { value: 'Pembersihan menyeluruh seluruh komponen laptop dari debu dan kotoran yang menumpuk. Pembersihan layar, keyboard, ventilasi udara, dan bagian dalam casing', label: 'Deep Cleaning', title: 'Deep Cleaning Laptop Total' },
  { value: 'Penggantian hinges/engsel laptop yang patah atau longgar. Pemasangan presisi agar layar dapat dibuka dan ditutup dengan stabil', label: 'Ganti Engsel', title: 'Ganti Engsel Laptop Patah' },
  { value: 'Service laptop ringan - pembersihan debu, update driver, optimasi sistem, testing fungsi semua komponen. Cocok untuk laptop yang sudah mulai lemot tapi tidak ada kerusakan hardware', label: 'Service Ringan', title: 'Service Ringan Laptop Lemot' },
];

let csIgTemplate = null;
let csWaTemplate = null;

const WA_TEMPLATES = [
  { value: '', label: 'Pilih template', title: '' },
  { value: 'Promo spesial bulan ini: diskon hingga 50% untuk semua layanan service laptop. Berlaku terbatas sampai akhir bulan, jangan lewatkan kesempatan ini!', label: 'Promo Diskon', title: 'Promo Diskon Spesial' },
  { value: 'Flash sale 3 hari saja! Service laptop hanya Rp99.000 (normal Rp200.000). Kuota terbatas untuk 20 pelanggan pertama. Booking sekarang!', label: 'Flash Sale', title: 'Flash Sale 3 Hari' },
  { value: 'Halo kak! Laptopnya bermasalah? Kami buka service laptop panggilan ke rumah. Teknisi berpengalaman, garansi service 30 hari. Gratis konsultasi!', label: 'Service Panggilan', title: 'Service Laptop Panggilan' },
  { value: 'Promo referal: Ajak teman service laptop di Macsus, dapatkan diskon Rp50.000 untuk service berikutnya. Berlaku kelipatan!', label: 'Promo Referral', title: 'Promo Ajak Teman' },
  { value: 'Gratis diagnostic untuk semua jenis kerusakan laptop! Datang ke workshop kami atau panggil teknisi ke lokasi. Tanpa biaya, tanpa komitmen.', label: 'Gratis Diagnostic', title: 'Gratis Diagnostic Laptop' },
  { value: 'Paket maintenance laptop: deep cleaning + optimasi sistem + update driver. Harga spesial Rp150.000 (normal Rp300.000). Buat laptop kamu seperti baru lagi!', label: 'Paket Maintenance', title: 'Paket Maintenance Laptop' },
  { value: 'Warning sign laptop kamu? Lambat, panas, atau sering freeze? Jangan tunggu parah! Bawa ke Macsus sekarang untuk pencegahan. Mulai dari Rp75.000.', label: 'Early Bird', title: 'Early Bird Service' },
  { value: 'Laptop baru beli tapi sudah bermasalah? Tenang, kami bantu klaim garansi sekaligus service ringan. Gratis untuk pembelian di Macsus!', label: 'Garansi + Service', title: 'Klaim Garansi + Service' },
  { value: 'Promo pelajar/mahasiswa: Tunjukkan KTP/KTM, dapatkan diskon 30% untuk semua service. Berlaku setiap hari!', label: 'Diskon Pelajar', title: 'Promo Pelajar/Mahasiswa' },
  { value: 'End of year sale! Service laptop diskon hingga 40%. Berlaku untuk semua jenis kerusakan. Buruan, kuota terbatas!', label: 'End of Year Sale', title: 'End of Year Sale' },
];

function initWaTemplateSelect() {
  csWaTemplate = new CustomSelect('cs-wa-template', {
    options: WA_TEMPLATES,
    placeholder: 'Pilih template',
    searchable: false,
    onSelect(val) {
      if (val) {
        const selected = WA_TEMPLATES.find(t => t.value === val);
        if (selected && selected.title) {
          document.getElementById('waTitle').value = selected.title;
        }
        document.getElementById('waPromoType').value = val;
      }
      csWaTemplate.setValue('');
    }
  });
}

function initIgTemplateSelect() {
  csIgTemplate = new CustomSelect('cs-ig-template', {
    options: IG_TEMPLATES,
    placeholder: 'Pilih template',
    searchable: false,
    onSelect(val) {
      if (val) {
        const selected = IG_TEMPLATES.find(t => t.value === val);
        if (selected && selected.title) {
          document.getElementById('contentTitle').value = selected.title;
        }
        document.getElementById('serviceInfo').value = val;
      }
      csIgTemplate.setValue('');
    }
  });
}

function toggleApiKeyVisibility() {
  const input = document.getElementById('gemini-api-key-input');
  const icon  = document.getElementById('eye-icon');
  if (input.dataset.masked === 'true') {
    input.value = input.dataset.realValue || '';
    input.dataset.masked = 'false';
    icon.className = 'fas fa-eye-slash';
  } else {
    input.dataset.realValue = input.value;
    input.dataset.masked = 'true';
    input.value = input.value ? '•'.repeat(input.value.length) : '';
    icon.className = 'fas fa-eye';
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   UI TOGGLES
   ═══════════════════════════════════════════════════════════════════════════ */

function toggleSettings() {
  const modal = document.getElementById('settings-modal');
  const overlay = document.getElementById('settings-overlay');
  const isOpen = modal.classList.contains('active');

  if (isOpen) {
    anime({
      targets: overlay,
      opacity: [1, 0],
      duration: 200,
      easing: 'easeInQuad',
      complete: function() { overlay.classList.remove('active'); }
    });
    anime({
      targets: modal,
      opacity: [1, 0],
      duration: 200,
      easing: 'easeInCubic',
      complete: function() {
        modal.classList.remove('active');
        modal.style.opacity = '';
      }
    });
  } else {
    overlay.classList.add('active');
    modal.classList.add('active');
    modal.style.opacity = '0';
    loadApiKeyToInput();
    loadModelToDropdown();
    updateAnimationToggleButton();
    initAccordion();

    anime({
      targets: overlay,
      opacity: [0, 1],
      duration: 200,
      easing: 'easeOutQuad'
    });
    anime({
      targets: modal,
      opacity: [0, 1],
      duration: 250,
      easing: 'easeOutCubic'
    });

    var sections = modal.querySelectorAll('.accordion-item');
    sections.forEach(function(s) { s.style.opacity = '0'; });
    anime({
      targets: sections,
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 250,
      delay: anime.stagger(60, { start: 150 }),
      easing: 'easeOutCubic'
    });

    var footer = modal.querySelector('.settings-footer');
    if (footer) {
      footer.style.opacity = '0';
      anime({
        targets: footer,
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 200,
      delay: 450,
      easing: 'easeOutQuad'
      });
    }
  }
}

/* ── SETTINGS ACCORDION ── */
var _openAccordionOrder = [];

function toggleAccordion(id) {
  var item = document.querySelector('.accordion-item[data-id="' + id + '"]');
  if (!item) return;

  var isOpen = item.getAttribute('data-open') === 'true';
  var content = item.querySelector('.accordion-content');
  var desc = item.querySelector('.accordion-description');

  if (isOpen) {
    item.setAttribute('data-close', 'true');
    item.setAttribute('data-open', 'false');
    content.style.height = '0px';
    _openAccordionOrder = _openAccordionOrder.filter(function(x) { return x !== id; });
  } else {
    if (_openAccordionOrder.length >= 2) {
      var oldest = _openAccordionOrder.shift();
      var oldestItem = document.querySelector('.accordion-item[data-id="' + oldest + '"]');
      if (oldestItem) {
        oldestItem.setAttribute('data-close', 'true');
        oldestItem.setAttribute('data-open', 'false');
        oldestItem.querySelector('.accordion-content').style.height = '0px';
      }
    }
    item.setAttribute('data-close', 'false');
    item.setAttribute('data-open', 'true');
    content.style.height = desc.scrollHeight + 'px';
    _openAccordionOrder.push(id);
  }
}

function initAccordion() {
  _openAccordionOrder = [];
  document.querySelectorAll('.accordion-item').forEach(function(item) {
    item.setAttribute('data-open', 'false');
    item.setAttribute('data-close', 'true');
    var content = item.querySelector('.accordion-content');
    if (content) content.style.height = '0px';
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   BERANDA & NAVIGATION
   ═══════════════════════════════════════════════════════════════════════════ */

const MODE_META = {
  ig:      { name: 'Instagram',    headline: 'Instagram Studio',    icon: 'fab fa-instagram', color: 'ig', desc: 'Buat konten feed, dokumen, dan caption Instagram yang menarik dengan AI.' },
  gbisnis: { name: 'G-Bisnis',     headline: 'Google Business Studio', icon: 'fab fa-google',     color: 'gb', desc: 'Buat postingan Google Bisnis dengan storytelling yang bikin pelanggan datang.' },
  wa:      { name: 'WhatsApp',     headline: 'WhatsApp Studio',     icon: 'fab fa-whatsapp',  color: 'wa', desc: 'Siapkan broadcast pesan WhatsApp promosi, follow-up, dan info layanan.' },
  fb:      { name: 'Facebook',     headline: 'Facebook Studio',     icon: 'fab fa-facebook',  color: 'fb', desc: 'Buat post Facebook bisnis dengan copywriting yang engaging dan persuasif.' },
  tt:      { name: 'TikTok',       headline: 'TikTok Studio',       icon: 'fab fa-tiktok',    color: 'tt', desc: 'Buat caption video TikTok yang viral dengan hook kuat dan CTA jelas.' }
};

let _activeModeInfo = null;

function showDefaultPanel() {
  var dp = document.getElementById('default-panel');
  if (dp) { dp.style.display = ''; dp.style.opacity = '1'; }
}
function hideDefaultPanel() {
  var dp = document.getElementById('default-panel');
  if (dp) dp.style.display = 'none';
}

function toggleModeInfo(mode) {
  const panel = document.getElementById('mode-info-panel');
  if (!panel) return;

  // Toggle off if same mode
  if (_activeModeInfo === mode) {
    _activeModeInfo = null;
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    var closeColor = panel.className.replace('expanded', '').replace('closing', '').trim();
    panel.className = closeColor + ' closing';
    anime({
      targets: panel,
      opacity: [1, 0],
      translateY: [0, -6],
      duration: 300,
      easing: 'easeInQuad',
      complete: function() {
        panel.style.display = 'none';
        panel.className = 'mode-info-panel';
        panel.style.opacity = '';
        panel.style.transform = '';
        showDefaultPanel();
      }
    });
    return;
  }

  hideDefaultPanel();
  _activeModeInfo = mode;
  const m = MODE_META[mode];

  panel.className = 'mode-info-panel ' + m.color;

  document.querySelectorAll('.mode-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === mode);
  });

  const icon = document.getElementById('mode-info-icon');
  icon.className = 'mode-info-icon ' + m.color + ' ' + m.icon;
  document.getElementById('mode-info-name').textContent = m.name;
  document.getElementById('mode-info-desc').textContent = m.desc;
  document.getElementById('btn-use-mode').dataset.mode = mode;

  panel.style.display = '';
  panel.style.opacity = '0';
  anime({
    targets: panel,
    opacity: [0, 1],
    translateY: [-6, 0],
    duration: 200,
    easing: 'easeOutCubic',
    complete: function() {
      panel.classList.add('expanded');
    }
  });

  var nameEl = document.getElementById('mode-info-name');
  var descEl = document.getElementById('mode-info-desc');
  if (nameEl) setTimeout(function() { animateText(nameEl, m.name, { stagger: 25, duration: 100 }); }, 100);
  if (descEl) setTimeout(function() { animateText(descEl, m.desc, { stagger: 15, duration: 80, delay: 150 }); }, 100);
}

async function useModeFromInfo() {
  const mode = document.getElementById('btn-use-mode').dataset.mode;
  if (mode) {
    _activeModeInfo = null;
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    const panel = document.getElementById('mode-info-panel');
    if (panel && panel.style.display !== 'none') {
      await new Promise(function(resolve) {
        anime({
          targets: panel,
          opacity: [1, 0],
          translateY: [0, -6],
          duration: 200,
          easing: 'easeInQuad',
          complete: function() { panel.style.display = 'none'; resolve(); }
        });
      });
    }
    setMode(mode);
  }
}

function updateFooterNav(mode) {
  document.querySelectorAll('.dock-item[data-page]').forEach(item => {
    const page = item.dataset.page;
    const isActive = page === (mode || 'beranda');
    item.classList.toggle('active', isActive);
    item.classList.remove('mode-ig', 'mode-gb', 'mode-wa', 'mode-fb', 'mode-tt');
    if (isActive && page !== 'beranda') {
      const color = page === 'gbisnis' ? 'gb' : page;
      if (['ig', 'gb', 'wa', 'fb', 'tt'].includes(color)) {
        item.classList.add('mode-' + color);
      }
    }
  });

  var modeTab = document.getElementById('mode-tab');
  if (modeTab) {
    modeTab.classList.remove('mode-ig', 'mode-gb', 'mode-wa', 'mode-fb', 'mode-tt');
    if (mode) {
      var color = mode === 'gbisnis' ? 'gb' : mode;
      if (['ig', 'gb', 'wa', 'fb', 'tt'].includes(color)) {
        modeTab.classList.add('mode-' + color);
      }
    } else {
      modeTab.classList.remove('active');
    }
  }

  closeAllExpandables();
}

var activeExpandable = null;

function toggleExpandable(type) {
  var shell = document.getElementById(type + '-shell');
  var tab = document.getElementById(type + '-tab');
  if (!shell || !tab) return;

  var isOpen = shell.classList.contains('show');

  if (isOpen) {
    shell.classList.remove('show');
    tab.classList.remove('mode-ig', 'mode-gb', 'mode-wa', 'mode-fb', 'mode-tt');
    activeExpandable = null;
  } else {
    if (activeExpandable && activeExpandable !== type) {
      var prevShell = document.getElementById(activeExpandable + '-shell');
      var prevTab = document.getElementById(activeExpandable + '-tab');
      if (prevShell) prevShell.classList.remove('show');
      if (prevTab) prevTab.classList.remove('mode-ig', 'mode-gb', 'mode-wa', 'mode-fb', 'mode-tt');
    }
    shell.classList.add('show');
    activeExpandable = type;
    if (type === 'akun') updateAccountDisplay();

    if (currentMode) {
      var color = currentMode === 'gbisnis' ? 'gb' : currentMode;
      if (['ig', 'gb', 'wa', 'fb', 'tt'].includes(color)) {
        tab.classList.add('mode-' + color);
      }
    }
  }
}

function closeAllExpandables() {
  if (!activeExpandable) return;
  var shell = document.getElementById(activeExpandable + '-shell');
  var tab = document.getElementById(activeExpandable + '-tab');
  if (shell) shell.classList.remove('show');
  if (tab) tab.classList.remove('mode-ig', 'mode-gb', 'mode-wa', 'mode-fb', 'mode-tt');
  activeExpandable = null;
}

document.addEventListener('click', function(e) {
  if (!activeExpandable) return;
  var expandable = document.querySelector('.dock-expandable:has(.expandable-shell.show)');
  if (expandable && !expandable.contains(e.target)) {
    closeAllExpandables();
  }
});

var _topbarVersion = 0;

function animateTitleText(text) {
  var span = document.querySelector('#topbar-page-title span');
  if (!span) return;
  _topbarVersion++;
  var ver = _topbarVersion;
  anime.remove(span);
  anime.remove(span.querySelectorAll('span'));
  span.innerHTML = '';
  var chars = text.split('');
  chars.forEach(function(ch) {
    var s = document.createElement('span');
    s.textContent = ch;
    s.style.display = 'inline-block';
    s.style.whiteSpace = 'pre';
    s.style.opacity = '0';
    s.style.transform = 'translateY(10px)';
    span.appendChild(s);
  });
  setTimeout(function() {
    if (ver !== _topbarVersion) return;
    span.textContent = text;
  }, (chars.length * 30) + 200);
  anime({
    targets: span.querySelectorAll('span'),
    opacity: [0, 1],
    translateY: [10, 0],
    duration: 150,
    delay: anime.stagger(30),
    easing: 'easeOutCubic'
  });

  var icon = document.getElementById('topbar-icon');
  if (icon) {
    icon.style.opacity = '0';
    anime({
      targets: icon,
      opacity: [0, 1],
      duration: 300,
      easing: 'easeOutCubic'
    });
  }
}

function animateText(el, text, opts) {
  if (!el || !text) return;
  var delay = (opts && opts.delay) || 0;
  var staggerMs = (opts && opts.stagger) || 25;
  var dur = (opts && opts.duration) || 120;
  var dir = (opts && opts.direction) || 'up';
  var fromY = dir === 'up' ? 10 : -10;
  el.innerHTML = '';
  text.split('').forEach(function(ch) {
    var s = document.createElement('span');
    s.textContent = ch;
    s.style.display = 'inline-block';
    s.style.whiteSpace = 'pre';
    s.style.opacity = '0';
    s.style.transform = 'translateY(' + fromY + 'px)';
    el.appendChild(s);
  });
  var totalMs = (text.length * staggerMs) + dur + delay;
  setTimeout(function() { el.textContent = text; }, totalMs + 50);
  anime({
    targets: el.querySelectorAll('span'),
    opacity: [0, 1],
    translateY: [fromY, 0],
    duration: dur,
    delay: anime.stagger(staggerMs, { start: delay }),
    easing: 'easeOutCubic'
  });
}

function updateTopbarTitle(mode) {
  const el = document.getElementById('topbar-page-title');
  if (!el) return;
  let icon = document.getElementById('topbar-icon');
  if (!icon) return;

  if (icon.tagName === 'svg') {
    const svgIcon = icon;
    const newIcon = document.createElement('i');
    newIcon.id = 'topbar-icon';
    newIcon.className = 'topbar-icon';
    svgIcon.parentNode.replaceChild(newIcon, svgIcon);
    icon = newIcon;
  }

  if (mode && MODE_META[mode]) {
    icon.className = 'topbar-icon topbar-icon-mode ' + MODE_META[mode].color + ' ' + MODE_META[mode].icon;
    icon.style.transform = 'rotate(0deg)';
    anime({ targets: icon, rotate: '1turn', duration: 800, easing: 'easeOutQuad' });
    animateTitleText(MODE_META[mode].headline);
  } else {
    icon.className = 'topbar-icon topbar-icon-img';
    icon.style.transform = 'rotate(0deg)';
    anime({ targets: icon, rotate: '1turn', duration: 800, easing: 'easeOutQuad' });
    animateTitleText('Macsus AI');
  }

  // Sync sidebar page icon (for collapsed state)
  var sidebarPageIcon = document.getElementById('pc-sidebar-page-icon');
  if (sidebarPageIcon) {
    sidebarPageIcon.className = 'topbar-icon pc-sidebar-page-icon';
    sidebarPageIcon.style.transform = '';
    if (mode && MODE_META[mode]) {
      sidebarPageIcon.classList.add('topbar-icon-mode', MODE_META[mode].color);
      var iconParts = MODE_META[mode].icon.split(' ');
      iconParts.forEach(function(c) { sidebarPageIcon.classList.add(c); });
    } else {
      sidebarPageIcon.classList.add('topbar-icon-img');
    }
  }
}

let _berandaFilter = '';

function filterBerandaHistory(text) {
  _berandaFilter = text.toLowerCase();
  renderBerandaHistory();
}

/* ── SWIPE CONFIG (matches daftargeser.tsx) ── */
const SWIPE_ACTION_WIDTH = 56;
const SWIPE_OPEN_RATIO = 0.46;
const SWIPE_CLOSE_RATIO = 0.72;
const SWIPE_OPEN_VELOCITY = 720;
const SWIPE_CLOSE_VELOCITY = 320;
const SWIPE_FLING_DISTANCE = 14;
const SWIPE_VELOCITY_LIMIT = 1500;
let _swipeOpenId = null;

function clampSwipeVelocity(v) {
  return Math.max(-SWIPE_VELOCITY_LIMIT, Math.min(SWIPE_VELOCITY_LIMIT, v));
}

function snapHistoryItem(surface, velocity) {
  var item = surface.closest('.beranda-history-item');
  var id = item ? item.dataset.id : null;

  if (_swipeOpenId && _swipeOpenId !== id) {
    var prevItem = document.querySelector('.beranda-history-item.open');
    if (prevItem) {
      prevItem.classList.remove('open');
      var prevSurface = prevItem.querySelector('.beranda-history-surface');
      if (prevSurface) {
        prevSurface.classList.remove('open');
        prevSurface.style.transform = '';
      }
    }
  }

  item.classList.remove('open');
  surface.classList.remove('open');
  surface.style.transform = '';

  if (surface._shouldOpen) {
    surface.classList.add('open');
    item.classList.add('open');
    _swipeOpenId = id;
  } else {
    _swipeOpenId = null;
  }
}

function closeAllSwipeItems() {
  var openItems = document.querySelectorAll('.beranda-history-item.open');
  openItems.forEach(function(item) {
    item.classList.remove('open');
    var s = item.querySelector('.beranda-history-surface');
    if (s) {
      s.classList.remove('open');
      s.style.transform = '';
    }
  });
  _swipeOpenId = null;
}

function initSwipeHandlers() {
  var ACTION_WIDTH = SWIPE_ACTION_WIDTH * 2;
  var OPEN_DIST = ACTION_WIDTH * SWIPE_OPEN_RATIO;

  document.addEventListener('click', function(e) {
    var action = e.target.closest('.beranda-history-action');
    if (action) {
      e.preventDefault();
      e.stopPropagation();
      var item = action.closest('.beranda-history-item');
      if (!item) return;
      var id = item.dataset.id;
      if (action.classList.contains('pin')) {
        closeAllSwipeItems();
        togglePin(id);
      } else if (action.classList.contains('delete')) {
        closeAllSwipeItems();
        deleteSession(id);
      }
      return;
    }

    var surface = e.target.closest('.beranda-history-surface');
    if (surface) {
      var item = surface.closest('.beranda-history-item');
      if (!item) return;
      if (surface.classList.contains('open')) {
        e.preventDefault();
        closeAllSwipeItems();
        return;
      }
      e.preventDefault();
      loadSession(item.dataset.id);
      return;
    }

    closeAllSwipeItems();
  });

  var startX = 0, startY = 0, startTime = 0;
  var dragging = null, hasMoved = false;

  function getX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }
  function getY(e) {
    return e.touches ? e.touches[0].clientY : e.clientY;
  }

  function onStart(e) {
    var surface = e.target.closest('.beranda-history-surface');
    if (!surface) return;

    document.querySelectorAll('.beranda-history-item.hint').forEach(function(el) {
      el.classList.remove('hint');
    });

    if (surface.classList.contains('open')) {
      closeAllSwipeItems();
      return;
    }

    closeAllSwipeItems();

    startX = getX(e);
    startY = getY(e);
    startTime = Date.now();
    dragging = surface;
    hasMoved = false;
  }

  function onMove(e) {
    if (!dragging) return;
    var dx = getX(e) - startX;
    var dy = getY(e) - startY;

    if (!hasMoved) {
      if (Math.abs(dy) > Math.abs(dx)) {
        dragging = null;
        return;
      }
      hasMoved = true;
      dragging.classList.add('swiping');
      dragging.closest('.beranda-history-item').classList.add('swiping');
    }

    e.preventDefault();
    var tx = Math.min(0, Math.max(-ACTION_WIDTH, dx));
    dragging.style.transform = 'translateX(' + tx + 'px)';
  }

  function onEnd(e) {
    if (!dragging) return;
    var surface = dragging;
    dragging = null;
    surface.classList.remove('swiping');
    surface.closest('.beranda-history-item').classList.remove('swiping');

    if (!hasMoved) return;

    var endX = getX(e.changedTouches ? e.changedTouches[0] : e);
    var dx = endX - startX;
    var dt = Date.now() - startTime;
    var velocity = dt > 0 ? (dx / dt) * 1000 : 0;
    velocity = clampSwipeVelocity(velocity);

    surface._shouldOpen = (dx < -OPEN_DIST || velocity < -SWIPE_OPEN_VELOCITY);
    snapHistoryItem(surface, velocity);
  }

  document.addEventListener('touchstart', onStart, { passive: true });
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd);
  document.addEventListener('wheel', function() { closeAllSwipeItems(); });
  if (window.innerWidth < 1024) {
    document.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
  }
}

var MODE_COLORS = {
  ig:       { bg: 'rgba(225,48,108,0.10)', fg: '#E1306C', icon: 'fab fa-instagram' },
  gbisnis:  { bg: 'rgba(66,133,244,0.10)', fg: '#4285F4', icon: 'fab fa-google' },
  wa:       { bg: 'rgba(37,211,102,0.10)', fg: '#25D366', icon: 'fab fa-whatsapp' },
  fb:       { bg: 'rgba(24,119,242,0.10)', fg: '#1877F2', icon: 'fab fa-facebook' },
  tt:       { bg: 'rgba(0,0,0,0.06)',      fg: '#1b1c1d', icon: 'fab fa-tiktok' }
};

function renderBerandaStats() {
  var data = historyData || [];
  var now = Date.now();

  /* ── Greeting ── */
  var hour = new Date().getHours();
  var greet = 'Selamat Malam';
  if (hour >= 4 && hour < 11) greet = 'Selamat Pagi';
  else if (hour >= 11 && hour < 15) greet = 'Selamat Siang';
  else if (hour >= 15 && hour < 18) greet = 'Selamat Sore';
  var email = localStorage.getItem('macsus_email') || '';
  var name = email.split('@')[0] || '';
  var greetEl = document.getElementById('greeting-title');
  if (greetEl) greetEl.textContent = name ? greet + ', ' + name : greet;
  var dateEl = document.getElementById('greeting-date');
  if (dateEl) {
    var d = new Date();
    var days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabit'];
    var months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    dateEl.textContent = days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  /* ── Stats Cards ── */
  var total = data.length;
  var pinned = data.filter(function(s) { return s.pinned; }).length;
  var weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  var weekCount = data.filter(function(s) { return s.id > weekAgo; }).length;
  var todayStart = new Date(); todayStart.setHours(0,0,0,0);
  var todayCount = data.filter(function(s) { return s.id >= todayStart.getTime(); }).length;

  var setTxt = function(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
  setTxt('stat-total', total);
  setTxt('stat-week', weekCount);
  setTxt('stat-pinned', pinned);
  setTxt('stat-today', todayCount);

  var modes = ['ig', 'gbisnis', 'wa', 'fb', 'tt'];
  var modeLabels = { ig: 'Instagram', gbisnis: 'G-Bisnis', wa: 'WhatsApp', fb: 'Facebook', tt: 'TikTok' };

  /* ── Mode Breakdown ── */
  var barsEl = document.getElementById('stat-mode-bars');
  var emptyEl = document.getElementById('stat-empty');
  if (barsEl) {
    if (total === 0) {
      barsEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = '';
    } else {
      barsEl.style.display = '';
      if (emptyEl) emptyEl.style.display = 'none';
      var counts = {};
      data.forEach(function(s) { counts[s.mode] = (counts[s.mode] || 0) + 1; });
      var maxCount = Math.max.apply(null, modes.map(function(m) { return counts[m] || 0; })) || 1;
      var html = '';
      modes.forEach(function(m) {
        var c = counts[m] || 0;
        var pct = Math.round((c / maxCount) * 100);
        var mc = MODE_COLORS[m];
        html +=
          '<div style="display: flex; align-items: center; gap: 10px;">' +
            '<div style="width: 28px; height: 28px; border-radius: 6px; background: ' + mc.bg + '; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">' +
              '<i class="' + mc.icon + '" style="font-size: 13px; color: ' + mc.fg + ';"></i>' +
            '</div>' +
            '<div style="flex: 1; min-width: 0;">' +
              '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">' +
                '<span style="font-size: 11px; font-weight: 500; color: var(--text-secondary);">' + modeLabels[m] + '</span>' +
                '<span style="font-size: 11px; font-weight: 600; color: var(--text-primary);">' + c + '</span>' +
              '</div>' +
              '<div style="height: 4px; background: var(--bg-page); border-radius: 2px; overflow: hidden;">' +
                '<div style="height: 100%; width: ' + pct + '%; background: ' + mc.fg + '; border-radius: 2px; transition: width 0.4s ease;"></div>' +
              '</div>' +
            '</div>' +
          '</div>';
      });
      barsEl.innerHTML = html;
    }
  }

  /* ── Heatmap (4 weeks) ── */
  var heatmapGrid = document.getElementById('heatmap-grid');
  var heatmapEmpty = document.getElementById('heatmap-empty');
  if (heatmapGrid) {
    var dayMs = 86400000;
    var today2 = new Date(); today2.setHours(0,0,0,0);
    var startDate = new Date(today2.getTime() - 27 * dayMs);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    var dayCounts = {};
    data.forEach(function(s) {
      var dd = new Date(s.id);
      dd.setHours(0,0,0,0);
      dayCounts[dd.getTime()] = (dayCounts[dd.getTime()] || 0) + 1;
    });
    var allCounts = Object.values(dayCounts);
    var maxDayCount = Math.max.apply(null, allCounts.concat([1]));
    if (allCounts.length === 0) {
      heatmapGrid.style.display = 'none';
      if (heatmapEmpty) heatmapEmpty.style.display = '';
    } else {
      heatmapGrid.style.display = '';
      if (heatmapEmpty) heatmapEmpty.style.display = 'none';
      var colors = ['var(--border)', 'rgba(13,148,136,0.2)', 'rgba(13,148,136,0.5)', 'var(--accent)'];
      var hhtml = '<div style="display: grid; grid-template-columns: repeat(7, 1fr); grid-template-rows: repeat(4, 1fr); gap: 4px; height: 100%;">';
      for (var i = 0; i < 28; i++) {
        var cellDate = new Date(startDate.getTime() + i * dayMs);
        var cc = dayCounts[cellDate.getTime()] || 0;
        var intensity = cc === 0 ? 0 : Math.ceil((cc / maxDayCount) * 3);
        var tip = cellDate.getDate() + '/' + (cellDate.getMonth()+1) + ': ' + cc + ' konten';
        hhtml += '<div title="' + tip + '" style="border-radius: 3px; background: ' + colors[intensity] + '; transition: background 0.2s;"></div>';
      }
      hhtml += '</div>';
      heatmapGrid.innerHTML = hhtml;
    }
  }

  /* ── Recent Activity ── */
  var recentEl = document.getElementById('beranda-recent-list');
  var recentEmpty = document.getElementById('beranda-recent-empty');
  if (recentEl) {
    var sorted = data.slice().sort(function(a, b) { return (b.id || 0) - (a.id || 0); });
    var recent = sorted.slice(0, 5);
    if (recent.length === 0) {
      recentEl.style.display = 'none';
      if (recentEmpty) recentEmpty.style.display = '';
    } else {
      recentEl.style.display = '';
      if (recentEmpty) recentEmpty.style.display = 'none';
      var rhtml = '';
      recent.forEach(function(s) {
        var mc = MODE_COLORS[s.mode] || MODE_COLORS.ig;
        var ml = modeLabels[s.mode] || s.mode;
        var title = (s.title || 'Tanpa Judul');
        if (title.length > 40) title = title.substring(0, 40) + '...';
        var dateStr = s.date || '';
        rhtml +=
          '<div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--bg-page); border-radius: 8px; cursor: pointer;" onclick="sidebarNav(\'riwayat\')">' +
            '<div style="width: 32px; height: 32px; border-radius: 8px; background: ' + mc.bg + '; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">' +
              '<i class="' + mc.icon + '" style="font-size: 14px; color: ' + mc.fg + ';"></i>' +
            '</div>' +
            '<div style="flex: 1; min-width: 0;">' +
              '<div style="font-size: 12px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + title + '</div>' +
              '<div style="font-size: 10px; color: var(--text-tertiary); margin-top: 1px;">' + ml + ' &middot; ' + dateStr + '</div>' +
            '</div>' +
          '</div>';
      });
      recentEl.innerHTML = rhtml;
    }
  }

  /* ── Insights ── */
  var insightText = document.getElementById('insight-text');
  var insightIcon = document.getElementById('insight-icon');
  if (insightText) {
    var tips = [
      { icon: 'tips_and_updates', text: 'Gunakan template IG atau WA untuk mempercepat pembuatan konten.' },
      { icon: 'push_pin', text: 'Pin konten favorit agar mudah diakses kembali dari Riwayat.' },
      { icon: 'schedule', text: 'Buat konten di pagi hari untuk engagement lebih baik.' },
      { icon: 'auto_awesome', text: 'Ganti judul konten agar lebih spesifik dan mudah ditemukan.' },
      { icon: 'search', text: 'Gunakan pencarian di Riwayat untuk menemukan konten lama.' },
      { icon: 'bolt', text: 'Kombinasikan beberapa mode untuk multi-platform publishing.' }
    ];
    if (total === 0) {
      if (insightIcon) insightIcon.textContent = 'rocket_launch';
      insightText.textContent = 'Mulai buat konten pertama Anda! Pilih mode di atas dan mulai generate.';
    } else {
      var tipIdx = Math.floor(Math.random() * tips.length);
      if (insightIcon) insightIcon.textContent = tips[tipIdx].icon;
      insightText.textContent = tips[tipIdx].text;
    }
  }
}

function renderBerandaHistory() {
  const list = document.getElementById('riwayat-history-list');
  if (!list) return;

  let items = historyData;
  if (_berandaFilter) {
    const q = _berandaFilter;
    const titleMatches = [];
    const previewMatches = [];
    items.forEach(s => {
      const title = (s.title || '').toLowerCase();
      const preview = ((s.data.gb || '') + (s.data.wa || '') + (s.data.fb || '') + (s.data.nb || '') + (s.data.cap || '') + (s.data.tt || '')).toLowerCase();
      if (title.includes(q)) titleMatches.push(s);
      else if (preview.includes(q)) previewMatches.push(s);
    });
    items = titleMatches.concat(previewMatches);
  }

  const recent = items.slice(0, _berandaFilter ? items.length : 10);
  if (recent.length === 0) {
    list.innerHTML = '<div class="beranda-history-empty">Tidak ditemukan riwayat</div>';
    return;
  }

  recent.sort(function(a, b) {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  list.innerHTML = '';
  recent.forEach(item => {
    const m = MODE_META[item.mode] || { name: item.mode, icon: 'fas fa-file', color: 'ig' };
    const isPinned = item.pinned;
    const pinIcon = isPinned
      ? '<i class="fas fa-thumbtack" style="transform:rotate(45deg)"></i>'
      : '<i class="fas fa-thumbtack"></i>';

    const el = document.createElement('div');
    el.className = 'beranda-history-item';
    el.dataset.id = item.id;

    const pinBadge = isPinned
      ? '<span class="beranda-history-pin-badge"><i class="fas fa-thumbtack"></i> PIN</span>'
      : '';

    el.innerHTML =
      '<div class="beranda-history-rail ' + m.color + '">' +
        '<div class="beranda-history-action pin">' +
          '<div class="beranda-history-action-icon">' + pinIcon + '</div>' +
        '</div>' +
        '<div class="beranda-history-action delete">' +
          '<div class="beranda-history-action-icon"><i class="fas fa-trash"></i></div>' +
        '</div>' +
      '</div>' +
      '<div class="beranda-history-surface ' + m.color + '">' +
        '<div class="beranda-history-icon ' + m.color + '"><i class="' + m.icon + '"></i></div>' +
        '<div class="beranda-history-info">' +
          '<div class="beranda-history-title">' + item.title + '</div>' +
          '<div class="beranda-history-meta">' + item.date + '</div>' +
        '</div>' +
        '<div class="beranda-history-badges">' +
          pinBadge +
          '<span class="beranda-history-badge ' + m.color + '">' + m.name + '</span>' +
        '</div>' +
        '<button class="beranda-history-dots" onclick="event.stopPropagation(); toggleHistoryItem(this)"><i class="fas fa-ellipsis-vertical"></i></button>' +
      '</div>';

    list.appendChild(el);
  });

  var firstItem = list.querySelector('.beranda-history-item');
  if (firstItem) firstItem.classList.add('hint');

  if (typeof applyHistoryView === 'function') applyHistoryView();
}

/* ── RESET ANIMATED ELEMENTS ── */
function resetBerandaElements() {
  var eyebrow = document.querySelector('#beranda-view .section-eyebrow');
  if (eyebrow) { eyebrow.style.opacity = '0'; eyebrow.style.transform = 'translateY(8px)'; }

  var tabs = document.querySelectorAll('#beranda-view .mode-tab');
  tabs.forEach(function(t) { t.style.opacity = '0'; t.style.transform = 'translateY(10px)'; });

  var histHeader = document.querySelector('.beranda-history-header');
  if (histHeader) { histHeader.style.opacity = '0'; histHeader.style.transform = 'translateY(8px)'; }

  var searchBar = histHeader && histHeader.querySelector('.beranda-search');
  if (searchBar) { searchBar.style.opacity = '0'; searchBar.style.transform = 'translateX(15px)'; }

  var items = document.querySelectorAll('#riwayat-history-list .beranda-history-item');
  items.forEach(function(it) { it.style.opacity = '0'; it.style.transform = 'translateX(30px)'; });

  var emptyState = document.querySelector('#riwayat-history-list .beranda-history-empty');
  if (emptyState) { emptyState.style.opacity = '0'; emptyState.style.transform = 'translateY(10px)'; }
}

// Mode panel ID mapping
var MODE_PANELS = {
  'ig': 'ig-fields',
  'gbisnis': 'gbisnis-fields',
  'wa': 'wa-fields',
  'fb': 'fb-fields',
  'tt': 'tt-fields'
};

function getModeElementIds(mode) {
  return {
    panel: MODE_PANELS[mode],
    notesCard: 'notes-card-' + mode,
    submitBtn: 'submit-btn-' + mode
  };
}

function resetModeElements(mode) {
  var ids = getModeElementIds(mode);
  var modePanel = document.getElementById(ids.panel);
  if (modePanel) { modePanel.style.opacity = '0'; modePanel.style.transform = 'translateX(30px)'; }

  var notesCard = modePanel ? modePanel.querySelector('#' + ids.notesCard) : null;
  if (notesCard) { notesCard.style.opacity = '0'; notesCard.style.transform = 'translateX(30px)'; }

  var submitBtn = modePanel ? modePanel.querySelector('#' + ids.submitBtn) : null;
  if (submitBtn) { submitBtn.style.opacity = '0'; submitBtn.style.transform = 'translateX(30px)'; }
}

/* ═══════════════════════════════════════════════════════════════════════════
   SIDEBAR NAVIGATION
   ═══════════════════════════════════════════════════════════════════════════ */

async function sidebarNav(page, mode) {
  document.querySelectorAll('.pc-nav-link').forEach(function(el) {
    var dp = el.getAttribute('data-page');
    var dm = el.getAttribute('data-mode');
    if (dm) {
      el.classList.toggle('active', page === 'mode' && dm === mode);
    } else {
      el.classList.toggle('active', dp === page);
    }
  });

  closeAllExpandables();

  if (page === 'beranda') {
    if (typeof goBeranda === 'function') await goBeranda();
  } else if (page === 'mode') {
    var rv = document.getElementById('riwayat-view');
    if (rv) rv.style.display = 'none';
    if (mode && typeof setMode === 'function') await setMode(mode);
  } else if (page === 'riwayat') {
    if (currentMode !== null) {
      currentMode = null;
      if (typeof applyModeTheme === 'function') applyModeTheme(null);
    }
    var bv = document.getElementById('beranda-view');
    if (bv) bv.style.display = 'none';
    ['input-container','output-wrapper','messages-page','chat-page'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    var rv = document.getElementById('riwayat-view');
    if (rv) {
      rv.style.display = 'flex';
      rv.style.opacity = '0';
      rv.style.transform = 'translateX(30px)';
      anime({ targets: rv, opacity: [0, 1], translateX: [30, 0], duration: 250, easing: 'easeOutCubic' });
    }
    if (typeof renderBerandaHistory === 'function') renderBerandaHistory();
  } else if (page === 'pesan') {
    var rv = document.getElementById('riwayat-view');
    if (rv) rv.style.display = 'none';
    if (typeof openMessages === 'function') await openMessages();
  } else if (page === 'akun' || page === 'pengaturan') {
    if (currentMode !== null) {
      currentMode = null;
      if (typeof applyModeTheme === 'function') applyModeTheme(null);
    }
    ['input-container','output-wrapper','messages-page','chat-page','riwayat-view'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    var ap = document.getElementById('akun-page');
    if (ap) {
      ap.style.display = '';
      ap.style.opacity = '0';
      ap.style.transform = 'translateX(30px)';
      anime({ targets: ap, opacity: [0, 1], translateX: [30, 0], duration: 250, easing: 'easeOutCubic' });
    }
    var n = document.getElementById('account-display-name');
    var e = document.getElementById('account-display-email');
    var pn = document.getElementById('akun-page-name');
    var pe = document.getElementById('akun-page-email');
    if (n && pn) pn.textContent = n.textContent;
    if (e && pe) pe.textContent = e.textContent;
    if (typeof loadApiKeyToInput === 'function') loadApiKeyToInput();
    if (typeof initModelSelect === 'function') initModelSelect();
  }

  var titles = { beranda:'Macsus AI', riwayat:'Riwayat', pesan:'Pesan', akun:'Account & Settings', pengaturan:'Account & Settings' };
  var iconClasses = { beranda:'topbar-icon topbar-icon-img', riwayat:'topbar-icon fas fa-clock-rotate-left', pesan:'topbar-icon fas fa-comment-dots', akun:'topbar-icon fas fa-user', pengaturan:'topbar-icon fas fa-cog' };
  var topbarSpan = document.querySelector('#topbar-page-title span');
  if (topbarSpan && page !== 'mode') topbarSpan.textContent = titles[page] || 'Macsus AI';

  var topIcon = document.getElementById('topbar-icon');
  if (topIcon && topIcon.tagName === 'svg') {
    var newI = document.createElement('i');
    newI.id = 'topbar-icon';
    topIcon.parentNode.replaceChild(newI, topIcon);
    topIcon = newI;
  }
  if (page === 'mode' && mode) {
    // setMode() already calls updateTopbarTitle(mode)
  } else if (iconClasses[page] && topIcon) {
    topIcon.className = iconClasses[page];
    topIcon.style.transform = '';
    topIcon.style.opacity = '';
  }

  var sidebarPageIcon = document.getElementById('pc-sidebar-page-icon');
  if (sidebarPageIcon) {
    sidebarPageIcon.className = 'topbar-icon pc-sidebar-page-icon';
    sidebarPageIcon.style.transform = '';
    if (page === 'mode' && mode && MODE_META[mode]) {
      sidebarPageIcon.classList.add('topbar-icon-mode', MODE_META[mode].color);
      var iconParts = MODE_META[mode].icon.split(' ');
      iconParts.forEach(function(c) { sidebarPageIcon.classList.add(c); });
    } else if (iconClasses[page]) {
      var ic = iconClasses[page].replace('topbar-icon ', '');
      if (ic) ic.split(' ').forEach(function(c) { if (c) sidebarPageIcon.classList.add(c); });
    }
  }
}

async function goBeranda() {
  // --- EXIT ANIMATION: detect current page and animate out ---
  var msgsPage = document.getElementById('messages-page') || document.getElementById('page-pesan');
  var chatPage = document.getElementById('chat-page') || document.getElementById('page-chat');
  var ow = document.getElementById('output-wrapper');
  var isInMessages = msgsPage && msgsPage.style.display !== 'none';
  var isInChat = chatPage && chatPage.style.display !== 'none';
  var isInSession = ow && ow.style.display !== 'none' && ow.classList.contains('visible');
  var isInMode = currentMode !== null;

  if (isInChat) {
    if (typeof closeChat === 'function') { _currentConversationId = null; unsubscribeMessages(); }
  }
  if (isInMode) {
    await animateModeOut(currentMode);
  } else if (isInSession) {
    await animateSessionOut();
  } else if (isInMessages) {
    await animateMessagesOut();
  } else {
    await animateBerandaOut();
  }

  // --- RESET & SHOW BERANDA ---
  currentMode = null;
  applyModeTheme(null);
  document.body.classList.remove('has-output', 'is-loading');

  clearAllOutputSections();
  var igTabs = document.getElementById('ig-tabs');
  if (igTabs) igTabs.style.display = 'none';

  _berandaFilter = '';
  const searchInput = document.getElementById('riwayat-search-input');
  if (searchInput) searchInput.value = '';

  _activeModeInfo = null;
  const mip = document.getElementById('mode-info-panel');
  if (mip) mip.style.display = 'none';
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));

  if (msgsPage) msgsPage.style.display = 'none';
  if (chatPage) chatPage.style.display = 'none';
  if (typeof closeChat === 'function') { _currentConversationId = null; unsubscribeMessages(); }

  var rv = document.getElementById('riwayat-view');
  if (rv) rv.style.display = 'none';

  ['akun-page','pengaturan-page'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  ['ig-fields', 'gbisnis-fields', 'wa-fields', 'fb-fields', 'tt-fields'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('visible', 'expanded');
      el.style.display = 'none';
    }
  });

  var fsa = document.getElementById('form-scroll-area');
  if (fsa) fsa.style.display = 'none';
  anime.remove(ow);
  ow.querySelectorAll('.output-card, .notes-card-wrapper').forEach(function(s) { anime.remove(s); });
  ow.classList.remove('visible');
  ow.style.display = '';
  ow.style.opacity = '';
  ow.style.transform = '';

  resetBerandaElements();

  const bv = document.getElementById('beranda-view');
  if (bv) bv.style.display = '';

  document.getElementById('input-container').style.display = '';

  updateFooterNav(null);
  if (typeof updateTopbarTitle === 'function') updateTopbarTitle(null);
  renderBerandaStats();
  renderBerandaHistory();
  if (typeof initBerandaCards === 'function') initBerandaCards();

  var newItems = document.querySelectorAll('#riwayat-history-list .beranda-history-item');
  newItems.forEach(function(it) { it.style.opacity = '0'; it.style.transform = 'translateX(30px)'; });
  var newEmpty = document.querySelector('#riwayat-history-list .beranda-history-empty');
  if (newEmpty) { newEmpty.style.opacity = '0'; newEmpty.style.transform = 'translateY(10px)'; }

  animateBeranda();
}

function animateBeranda() {
  var eyebrow = document.querySelector('#beranda-view .section-eyebrow');
  var tabs = document.querySelectorAll('#beranda-view .mode-tab');
  var histHeader = document.querySelector('.beranda-history-header');

  if (eyebrow) {
    var origText = eyebrow.textContent;
    eyebrow.style.opacity = '0';
    eyebrow.style.transform = 'translateY(8px)';
    anime({ targets: eyebrow, opacity: [0, 1], translateY: [8, 0], duration: 250, easing: 'easeOutQuad' });
    setTimeout(function() { animateText(eyebrow, origText, { stagger: 20, duration: 100 }); }, 50);
  }

  tabs.forEach(function(t) { t.style.opacity = '0'; });
  anime({
    targets: tabs,
    opacity: [0, 1],
    translateY: [10, 0],
    duration: 250,
    delay: anime.stagger(50, { start: 100 }),
    easing: 'easeOutCubic'
  });

  if (histHeader) {
    var titleEl = histHeader.querySelector('.beranda-section-title');
    var searchBar = histHeader.querySelector('.beranda-search');
    histHeader.style.opacity = '0';
    histHeader.style.transform = 'translateY(8px)';
    anime({ targets: histHeader, opacity: [0, 1], translateY: [8, 0], duration: 250, delay: 200, easing: 'easeOutQuad' });
    if (titleEl) {
      var titleText = titleEl.textContent;
      setTimeout(function() { animateText(titleEl, titleText, { delay: 200, stagger: 20, duration: 100 }); }, 50);
    }
    if (searchBar) {
      searchBar.style.opacity = '0';
      searchBar.style.transform = 'translateX(15px)';
      anime({ targets: searchBar, opacity: [0, 1], translateX: [15, 0], duration: 250, delay: 300, easing: 'easeOutCubic' });
    }
  }

  var items = document.querySelectorAll('#riwayat-history-list .beranda-history-item');
  var emptyState = document.querySelector('#riwayat-history-list .beranda-history-empty');
  if (items.length) {
    items.forEach(function(it) {
      it.style.opacity = '0';
      it.style.transform = 'translateX(30px)';
    });
    anime({
      targets: items,
      opacity: [0, 1],
      translateX: [30, 0],
      duration: 250,
      delay: anime.stagger(40, { start: 300 }),
      easing: 'easeOutCubic'
    });
  } else if (emptyState) {
    emptyState.style.opacity = '0';
    emptyState.style.transform = 'translateY(10px)';
    anime({ targets: emptyState, opacity: [0, 1], translateY: [10, 0], duration: 250, delay: 300, easing: 'easeOutCubic' });
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXIT ANIMATIONS — animate elements OUT before switching pages
   ═══════════════════════════════════════════════════════════════════════════ */

function animateBerandaOut() {
  return new Promise(function(resolve) {
    var eyebrow = document.querySelector('#beranda-view .section-eyebrow');
    var tabs = document.querySelectorAll('#beranda-view .mode-tab');
    var histHeader = document.querySelector('.beranda-history-header');
    var items = document.querySelectorAll('#riwayat-history-list .beranda-history-item');
    var emptyState = document.querySelector('#riwayat-history-list .beranda-history-empty');
    var targets = [];

    if (eyebrow && parseFloat(getComputedStyle(eyebrow).opacity) > 0) {
      targets.push(eyebrow);
    }
    tabs.forEach(function(t) {
      if (parseFloat(getComputedStyle(t).opacity) > 0) targets.push(t);
    });
    if (histHeader && parseFloat(getComputedStyle(histHeader).opacity) > 0) {
      targets.push(histHeader);
    }
    items.forEach(function(it) {
      if (parseFloat(getComputedStyle(it).opacity) > 0) targets.push(it);
    });
    if (emptyState && parseFloat(getComputedStyle(emptyState).opacity) > 0) {
      targets.push(emptyState);
    }

    if (!targets.length) { resolve(); return; }

    anime({
      targets: targets,
      opacity: [1, 0],
      translateY: [0, -8],
      duration: 250,
      easing: 'easeInQuad',
      complete: function() { resolve(); }
    });
  });
}

function animateModeOut(mode) {
  return new Promise(function(resolve) {
    var ids = getModeElementIds(mode);
    var targets = [];

    var modePanel = document.getElementById(MODE_PANELS[mode]);
    if (modePanel && parseFloat(getComputedStyle(modePanel).opacity) > 0) targets.push(modePanel);

    var notesCard = modePanel ? modePanel.querySelector('#' + ids.notesCard) : null;
    if (notesCard && parseFloat(getComputedStyle(notesCard).opacity) > 0) targets.push(notesCard);

    var submitBtn = modePanel ? modePanel.querySelector('#' + ids.submitBtn) : null;
    if (submitBtn && parseFloat(getComputedStyle(submitBtn).opacity) > 0) targets.push(submitBtn);

    if (!targets.length) { resolve(); return; }

    anime({
      targets: targets,
      opacity: [1, 0],
      translateX: [0, -30],
      duration: 250,
      easing: 'easeInQuad',
      complete: function() { resolve(); }
    });
  });
}

function animateMessagesOut() {
  return new Promise(function(resolve) {
    var page = document.getElementById('messages-page') || document.getElementById('page-pesan');
    if (!page || page.style.display === 'none') { resolve(); return; }

    anime({
      targets: page,
      opacity: [1, 0],
      translateX: [0, -30],
      duration: 250,
      easing: 'easeInQuad',
      complete: function() { resolve(); }
    });
  });
}

function animateSessionOut() {
  return new Promise(function(resolve) {
    var ow = document.getElementById('output-wrapper');
    if (!ow || ow.style.display === 'none' || !ow.classList.contains('visible')) { resolve(); return; }

    anime({
      targets: ow,
      opacity: [1, 0],
      translateY: [0, 15],
      duration: 250,
      easing: 'easeInQuad',
      complete: function() { resolve(); }
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   SESSION MANAGEMENT
   ═══════════════════════════════════════════════════════════════════════════ */

function newSession() {
  goBeranda();
}

async function backToInput() {
  // --- EXIT ANIMATION: animate session out ---
  await animateSessionOut();

  // --- RESET & GO BACK ---
  document.body.classList.remove('has-output');
  var ow = document.getElementById('output-wrapper');
  anime.remove(ow);
  ow.querySelectorAll('.output-card, .notes-card-wrapper').forEach(function(s) { anime.remove(s); });
  ow.classList.remove('visible');
  ow.style.display = '';
  ow.style.opacity = '';
  ow.style.transform = '';
  document.getElementById('input-container').style.display = '';

  clearAllOutputSections();
  var igTabs = document.getElementById('ig-tabs');
  if (igTabs) igTabs.style.display = 'none';

  var contentArea = document.querySelector('.content-area');
  if (contentArea) contentArea.scrollTop = 0;

  goBeranda();
}

async function setMode(mode) {
  // --- EXIT ANIMATION: animate current page out ---
  var msgsPage = document.getElementById('messages-page') || document.getElementById('page-pesan');
  var chatPage = document.getElementById('chat-page') || document.getElementById('page-chat');
  var ow = document.getElementById('output-wrapper');
  var isInMessages = msgsPage && msgsPage.style.display !== 'none';
  var isInChat = chatPage && chatPage.style.display !== 'none';
  var isInSession = ow && ow.style.display !== 'none' && ow.classList.contains('visible');

  if (isInChat) {
    if (typeof closeChat === 'function') { _currentConversationId = null; unsubscribeMessages(); }
  }
  if (isInSession) {
    await animateSessionOut();
  } else if (isInMessages) {
    await animateMessagesOut();
  } else if (currentMode !== null) {
    await animateModeOut(currentMode);
  } else {
    await animateBerandaOut();
  }

  // --- RESET & SHOW MODE ---
  currentMode = mode;
  applyModeTheme(mode);

  const bv = document.getElementById('beranda-view');
  if (bv) bv.style.display = 'none';

  var rv = document.getElementById('riwayat-view');
  if (rv) rv.style.display = 'none';

  if (msgsPage) msgsPage.style.display = 'none';
  if (chatPage) chatPage.style.display = 'none';
  if (typeof _currentConversationId !== 'undefined') { _currentConversationId = null; unsubscribeMessages(); }

  ['akun-page','pengaturan-page'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  clearAllOutputSections();
  var igTabs = document.getElementById('ig-tabs');
  if (igTabs) igTabs.style.display = 'none';

  ['ig-fields', 'gbisnis-fields', 'wa-fields', 'fb-fields', 'tt-fields', 'notes-card-ig', 'notes-card-gbisnis', 'notes-card-wa', 'notes-card-fb', 'notes-card-tt'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('visible');
      el.style.display = 'none';
    }
  });

  resetModeElements(mode);

  if (MODE_PANELS[mode]) {
    var panel = document.getElementById(MODE_PANELS[mode]);
    panel.style.display = '';
    panel.classList.add('visible');
  }
  var ids = getModeElementIds(mode);
  var notesCard = panel ? panel.querySelector('#' + ids.notesCard) : null;
  if (notesCard) {
    notesCard.classList.remove('expanded');
    notesCard.style.display = '';
    notesCard.classList.add('visible');
  }

  var fsa2 = document.getElementById('form-scroll-area');
  if (fsa2) fsa2.style.display = 'block';

  ['serviceInfo', 'contentTitle'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.hidden = false;
      el.disabled = false;
    }
  });

  var ids = getModeElementIds(mode);
  var submitBtn = panel ? panel.querySelector('#' + ids.submitBtn) : null;
  if (submitBtn) submitBtn.style.display = '';

  anime.remove(ow);
  ow.querySelectorAll('.output-card, .notes-card-wrapper').forEach(function(s) { anime.remove(s); });
  ow.classList.remove('visible');
  ow.style.display = '';
  ow.style.opacity = '';
  ow.style.transform = '';
  document.body.classList.remove('has-output', 'is-loading');
  clearError();

  document.getElementById('input-container').style.display = '';

  updateFooterNav(mode);
  if (typeof updateTopbarTitle === 'function') updateTopbarTitle(mode);

  // Animate in
  var modePanel = document.getElementById(MODE_PANELS[mode]);

  anime({
    targets: modePanel,
    translateX: [30, 0],
    opacity: [0, 1],
    duration: 250,
    easing: 'easeOutCubic'
  });
  if (notesCard) {
    anime({
      targets: notesCard,
      translateX: [30, 0],
      opacity: [0, 1],
      duration: 250,
      delay: 100,
      easing: 'easeOutCubic'
    });
  }
  if (submitBtn) {
    anime({
      targets: submitBtn,
      translateX: [30, 0],
      opacity: [0, 1],
      duration: 250,
      delay: 200,
      easing: 'easeOutCubic'
    });
  }
}

function switchTab(idx) {
  currentTab = idx;
  const ids  = ['section-notebooklm', 'section-dokumen', 'section-caption'];
  const pills = document.querySelectorAll('#ig-tabs .tab-pill');
  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (i === idx) {
      el.classList.add('active');
      el.style.display = 'flex';
    } else {
      el.classList.remove('active');
      el.style.display = 'none';
    }
  });
  pills.forEach((p, i) => p.classList.toggle('active', i === idx));
}

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST & COPY
   ═══════════════════════════════════════════════════════════════════════════ */

function showToast(msg, type) {
  var container = document.getElementById('toast-container');
  if (!container) return;

  var existing = container.querySelectorAll('.toast');
  if (existing.length >= 2) {
    existing[0].remove();
  }

  var icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-circle';
  else if (type === 'warning') icon = 'fa-warning';

  var t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = '<i class="fas ' + icon + '"></i> ' + (msg || 'Done!');
  container.appendChild(t);

  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      t.classList.add('show');
    });
  });

  setTimeout(function() {
    t.classList.remove('show');
    setTimeout(function() { t.remove(); }, 400);
  }, 2500);
}

function copySection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const text = el.innerText;
  fallbackCopyText(text).then(() => showToast('Teks disalin!', 'success'));
}

function copyAll() {
  const ids = ['notebooklm-body', 'dokumen-body', 'caption-body', 'gbisnis-body', 'wa-body', 'fb-body', 'tt-body'];
  let full  = '';
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.innerText.trim()) full += el.innerText + '\n\n---\n\n';
  });
  fallbackCopyText(full.trim()).then(() => showToast('Semua disalin!', 'success'));
}

/* ═══════════════════════════════════════════════════════════════════════════
   ERROR & LOADING
   ═══════════════════════════════════════════════════════════════════════════ */

function setError(html) {
  const box = document.getElementById('error-box');
  const textEl = document.getElementById('error-text') || document.getElementById('error-message');
  if (textEl) textEl.innerHTML = html;
  if (box) { box.style.display = ''; box.classList.add('visible'); }
}

function clearError() {
  const box = document.getElementById('error-box');
  if (box) { box.style.display = 'none'; box.classList.remove('visible'); }
}

function setLoading(on) {
  const panel = currentMode ? document.getElementById(MODE_PANELS[currentMode]) : null;
  var ids = getModeElementIds(currentMode);
  const submitBtn = panel ? panel.querySelector('#' + ids.submitBtn) : document.getElementById(ids.submitBtn);
  if (submitBtn) submitBtn.disabled = on;
  document.body.classList.toggle('is-loading', on);
  if (on) {
    document.getElementById('output-wrapper').classList.remove('visible');
    document.body.classList.remove('has-output');
    showDynamicIsland();
  } else {
    closeDynamicIsland();
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   CHAR COUNTERS
   ═══════════════════════════════════════════════════════════════════════════ */

function updateCharCounter(count) {
  const fill  = document.getElementById('char-fill');
  const label = document.getElementById('char-label');
  if (!fill || !label) return;
  const pct   = Math.min((count / 1500) * 100, 100);
  fill.style.width = pct + '%';
  fill.className   = 'char-fill ' + (count > 1500 ? 'over' : 'ok');
  label.textContent = count + ' / 1500';
  label.className   = 'char-text' + (count > 1500 ? ' over' : '');
}

function updateCaptionCharCounter(count) {
  const fill = document.getElementById('char-fill-caption');
  const label = document.getElementById('char-label-caption');
  if (!fill || !label) return;
  const pct = Math.min((count / 2200) * 100, 100);
  fill.style.width = pct + '%';
  fill.className = 'char-fill ' + (count > 2200 ? 'over' : 'ok');
  label.textContent = count + ' / 2200';
  label.className = 'char-text' + (count > 2200 ? ' over' : '');
}

function updateWACharCounter(count) {
  const fill = document.getElementById('char-fill-wa');
  const label = document.getElementById('char-label-wa');
  if (!fill || !label) return;
  const pct = Math.min((count / 400) * 100, 100);
  fill.style.width = pct + '%';
  fill.className = 'char-fill ' + (count > 400 ? 'over' : 'ok');
  label.textContent = count + ' / 400';
  label.className = 'char-text' + (count > 400 ? ' over' : '');
}

function updateFBCharCounter(count) {
  const fill = document.getElementById('char-fill-fb');
  const label = document.getElementById('char-label-fb');
  if (!fill || !label) return;
  const pct = Math.min((count / 5000) * 100, 100);
  fill.style.width = pct + '%';
  fill.className = 'char-fill ' + (count > 5000 ? 'over' : 'ok');
  label.textContent = count + ' / 5000';
  label.className = 'char-text' + (count > 5000 ? ' over' : '');
}

function updateTTCharCounter(count) {
  const fill = document.getElementById('char-fill-tt');
  const label = document.getElementById('char-label-tt');
  if (!fill || !label) return;
  const pct = Math.min((count / 2200) * 100, 100);
  fill.style.width = pct + '%';
  fill.className = 'char-fill ' + (count > 2200 ? 'over' : 'ok');
  label.textContent = count + ' / 2200';
  label.className = 'char-text' + (count > 2200 ? ' over' : '');
}

/* ═══════════════════════════════════════════════════════════════════════════
   HISTORY MANAGEMENT
   ═══════════════════════════════════════════════════════════════════════════ */

function saveSession(title, mode, dataObj) {
  const session = {
    id: Date.now(),
    title: title || (mode === 'gbisnis' ? 'Google Bisnis Post' : mode === 'wa' ? 'WhatsApp Broadcast' : mode === 'fb' ? 'Facebook Post' : mode === 'tt' ? 'TikTok Caption' : 'Tanpa Judul'),
    mode: mode,
    date: new Date().toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }),
    data: dataObj,
    pinned: false
  };
  historyData.unshift(session);
  if (historyData.length > 50) {
    while (historyData.length > 50) {
      const lastUnpinnedIdx = [...historyData].reverse().findIndex(s => !s.pinned);
      if (lastUnpinnedIdx === -1) break;
      historyData.splice(historyData.length - 1 - lastUnpinnedIdx, 1);
    }
  }
  saveHistory();
  
  if (typeof window.sessionSync !== 'undefined' && typeof window.supabaseAuth !== 'undefined') {
    if (window.supabaseAuth.isUserLoggedIn()) {
      window.sessionSync.saveSessionToSupabase(session.id.toString(), session.title, session.mode, session.data);
    }
  }
  
  renderBerandaHistory();
}

function deleteSession(id) {
  customConfirm(
    'Hapus Sesi',
    'Sesi ini akan dihapus permanen dan tidak bisa dikembalikan.',
    'Ya, Hapus',
    function() {
      historyData = historyData.filter(function(s) { return s.id.toString() !== id.toString(); });
      saveHistory();
      renderBerandaHistory();
      showToast('Sesi dihapus', 'success');

      // Sync delete to Supabase
      if (typeof window.sessionSync !== 'undefined' && typeof window.supabaseAuth !== 'undefined') {
        if (window.supabaseAuth.isUserLoggedIn()) {
          window.sessionSync.deleteSessionFromSupabase(id.toString());
        }
      }
    },
    'danger'
  );
}

function togglePin(id) {
  const session = historyData.find(function(s) { return s.id.toString() === id.toString(); });
  if (session) {
    session.pinned = !session.pinned;
    saveHistory();
    renderBerandaHistory();
    showToast(session.pinned ? 'Sesi di-pin' : 'Sesi un-pin', 'success');

    // Sync pin state to Supabase
    if (typeof window.sessionSync !== 'undefined' && typeof window.supabaseAuth !== 'undefined') {
      if (window.supabaseAuth.isUserLoggedIn()) {
        window.sessionSync.updatePinInSupabase(id.toString(), session.pinned);
      }
    }
  }
}



/* ═══════════════════════════════════════════════════════════════════════════
   CUSTOM CONFIRM DIALOG
   ═══════════════════════════════════════════════════════════════════════════ */

let _customAlertCallback = null;

function customConfirm(title, message, confirmLabel, onConfirm, type) {
  type = type || 'danger';
  _customAlertCallback = onConfirm;

  const existing = document.getElementById('custom-alert-overlay');
  if (existing) existing.remove();

  var iconMap = {
    danger: '<i class="fas fa-triangle-exclamation"></i>',
    info:   '<i class="fas fa-circle-info"></i>',
  };
  var icon = iconMap[type] || iconMap.danger;

  var overlay = document.createElement('div');
  overlay.className = 'custom-alert-overlay';
  overlay.id = 'custom-alert-overlay';
  overlay.innerHTML = '<div class="custom-alert ' + type + '">' +
    '<div class="custom-alert-icon">' + icon + '</div>' +
    '<h4 class="custom-alert-title">' + title + '</h4>' +
    '<p class="custom-alert-msg">' + message + '</p>' +
    '<div class="custom-alert-actions">' +
      '<button class="custom-alert-btn cancel" onclick="closeCustomAlert()">Batal</button>' +
      '<button class="custom-alert-btn confirm-btn ' + type + '" onclick="confirmCustomAlert()">' + confirmLabel + '</button>' +
    '</div>' +
  '</div>';
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeCustomAlert();
  });
}

function confirmCustomAlert() {
  var cb = _customAlertCallback;
  _customAlertCallback = null;
  closeCustomAlert();
  if (cb) {
    cb();
  }
}

function closeCustomAlert() {
  var overlay = document.getElementById('custom-alert-overlay');
  if (overlay) overlay.remove();
  _customAlertCallback = null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOAD SESSION
   ═══════════════════════════════════════════════════════════════════════════ */

async function loadSession(id) {
  const session = historyData.find(function(s) { return s.id === Number(id) || s.id.toString() === id.toString(); });
  if (!session) return;

  // --- EXIT ANIMATION: animate current page out ---
  var msgsPage = document.getElementById('messages-page') || document.getElementById('page-pesan');
  var chatPage = document.getElementById('chat-page') || document.getElementById('page-chat');
  var ow = document.getElementById('output-wrapper');
  var isInMessages = msgsPage && msgsPage.style.display !== 'none';
  var isInChat = chatPage && chatPage.style.display !== 'none';
  var isInSession = ow && ow.style.display !== 'none' && ow.classList.contains('visible');

  if (isInChat) {
    if (typeof closeChat === 'function') { _currentConversationId = null; unsubscribeMessages(); }
  }
  if (isInSession) {
    await animateSessionOut();
  } else if (isInMessages) {
    await animateMessagesOut();
  } else if (currentMode !== null) {
    await animateModeOut(currentMode);
  } else {
    await animateBerandaOut();
  }

  // --- RESET & SHOW SESSION ---
  currentMode = session.mode;
  applyModeTheme(session.mode);
  if (typeof updateTopbarTitle === 'function') updateTopbarTitle(session.mode);

  ['akun-page','pengaturan-page'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  clearAllOutputSections();

  document.getElementById('input-container').style.display = 'none';

  document.getElementById('output-title').innerText = session.title;

  if (session.mode === 'ig') {
    document.getElementById('notebooklm-body').innerText = session.data.nb || '';
    document.getElementById('dokumen-body').innerText = session.data.dok || '';
    document.getElementById('caption-body').innerText = session.data.cap || '';
    updateCaptionCharCounter((session.data.cap || '').length);
    var igTabs = document.getElementById('ig-tabs');
    if (igTabs) igTabs.style.display = 'flex';
    switchTab(0);
  } else if (session.mode === 'gbisnis') {
    document.getElementById('gbisnis-body').innerText = session.data.gb || '';
    updateCharCounter((session.data.gb || '').length);
    var gbEl = document.getElementById('section-gbisnis');
    gbEl.style.display = 'flex';
    gbEl.classList.add('active');
  } else if (session.mode === 'wa') {
    document.getElementById('wa-body').innerText = session.data.wa || '';
    updateWACharCounter((session.data.wa || '').length);
    var waEl = document.getElementById('section-wa');
    waEl.style.display = 'flex';
    waEl.classList.add('active');
  } else if (session.mode === 'fb') {
    document.getElementById('fb-body').innerText = session.data.fb || '';
    updateFBCharCounter((session.data.fb || '').length);
    var fbEl = document.getElementById('section-fb');
    fbEl.style.display = 'flex';
    fbEl.classList.add('active');
  } else if (session.mode === 'tt') {
    document.getElementById('tt-body').innerText = session.data.tt || '';
    updateTTCharCounter((session.data.tt || '').length);
    var ttEl = document.getElementById('section-tt');
    ttEl.style.display = 'flex';
    ttEl.classList.add('active');
  }

  var ids = getModeElementIds(currentMode);
  var panel = document.getElementById(MODE_PANELS[currentMode]);
  var submitBtn = panel ? panel.querySelector('#' + ids.submitBtn) : document.getElementById(ids.submitBtn);
  if (submitBtn) submitBtn.style.display = 'none';

  var outputWrapper = document.getElementById('output-wrapper');
  anime.remove(outputWrapper);
  var outputSections = outputWrapper.querySelectorAll('.output-card, .notes-card-wrapper');
  outputSections.forEach(function(s) { anime.remove(s); });

  outputWrapper.style.display = '';
  outputWrapper.style.opacity = '0';
  outputWrapper.style.transform = 'translateY(15px)';
  outputWrapper.classList.remove('visible');
  void outputWrapper.offsetWidth;
  outputWrapper.classList.add('visible');
  document.body.classList.add('has-output');

  var contentArea = document.querySelector('.content-area');
  if (contentArea) contentArea.scrollTop = 0;

  anime({
    targets: outputWrapper,
    opacity: [0, 1],
    translateY: [15, 0],
    duration: 250,
    delay: 150,
    easing: 'easeOutCubic'
  });

  var outputTitle = document.getElementById('output-title');
  if (outputTitle) {
    var titleText = outputTitle.textContent;
    outputTitle.textContent = '';
    setTimeout(function() { animateText(outputTitle, titleText, { delay: 200, stagger: 25, duration: 100 }); }, 50);
  }

  var sections = outputWrapper.querySelectorAll('.output-card, .notes-card-wrapper');
  if (sections.length) {
    sections.forEach(function(s) { s.style.opacity = '0'; s.style.transform = 'translateY(10px)'; });
    anime({
      targets: sections,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 250,
      delay: anime.stagger(60, { start: 350 }),
      easing: 'easeOutCubic'
    });
  }
}

function clearHistory() {
  customConfirm(
    'Hapus Semua Riwayat',
    'Semua sesi riwayat akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.',
    'Ya, Hapus Semua',
    function() {
      historyData = [];
      HistoryDB.remove('macsus_history');
      renderBerandaHistory();
      toggleSettings();
      showToast('Riwayat dihapus!', 'success');

      // Sync delete all to Supabase
      if (typeof window.sessionSync !== 'undefined' && typeof window.supabaseAuth !== 'undefined') {
        if (window.supabaseAuth.isUserLoggedIn()) {
          window.sessionSync.deleteAllSessionsFromSupabase();
        }
      }
    },
    'danger'
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOADERS (Dither + Helix)
   ═══════════════════════════════════════════════════════════════════════════ */

var BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

var DITHER_COLORS = ['#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#10b981'];

function createDitherLoader(opts) {
  opts = opts || {};
  var cell = opts.cell || 5;
  var gap = opts.gap || 1;
  var speed = opts.speed || 1;
  var colors = opts.colors || DITHER_COLORS;

  var el = document.createElement('span');
  el.className = 'loader-dither';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-label', 'Loading');
  el.style.setProperty('--dither-cell', cell + 'px');
  el.style.setProperty('--dither-gap', gap + 'px');
  el.style.setProperty('--dither-speed', speed + 's');

  for (var i = 0; i < 16; i++) {
    var dot = document.createElement('span');
    dot.style.animationDelay = ((BAYER_4[i] / 16) * speed) + 's';
    dot.style.background = colors[i % colors.length];
    el.appendChild(dot);
  }
  return el;
}

function createHelixLoader(opts) {
  opts = opts || {};
  var size = opts.size || 24;
  var speed = opts.speed || 1;
  var rows = opts.rows || 7;
  var color = opts.color || '#fff';
  var dot = Math.max(2, size * 0.14);
  var amp = size * 0.32;

  var el = document.createElement('span');
  el.className = 'loader-helix';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-label', 'Loading');
  el.style.setProperty('--helix-size', size + 'px');
  el.style.setProperty('--helix-dot', dot + 'px');
  el.style.setProperty('--helix-amp', amp + 'px');
  el.style.setProperty('--helix-speed', speed + 's');
  el.style.color = color;

  for (var r = 0; r < rows; r++) {
    var top = (r / (rows - 1)) * (size - dot);
    var delay = (r / rows) * speed;

    var dotA = document.createElement('span');
    dotA.style.top = top + 'px';
    dotA.style.animationDelay = delay + 's';
    el.appendChild(dotA);

    var dotB = document.createElement('span');
    dotB.style.top = top + 'px';
    dotB.style.animationDelay = delay + 's';
    el.appendChild(dotB);
  }
  return el;
}

/* ═══════════════════════════════════════════════════════════════════════════
   DYNAMIC ISLAND LOADING
   ═══════════════════════════════════════════════════════════════════════════ */

function positionDynamicIsland() {
  var di = document.getElementById('dynamic-island');
  if (!di) return;
  if (window.innerWidth < 1024) {
    di.style.left = '50%';
    di.style.transform = 'translateX(-50%)';
    return;
  }
  var mainArea = document.querySelector('.main-area');
  if (!mainArea) return;
  var rect = mainArea.getBoundingClientRect();
  var cx = rect.left + rect.width / 2;
  di.style.left = cx + 'px';
  di.style.transform = 'translateX(-50%)';
  di.style.right = 'auto';
}

function showDynamicIsland() {
  var di = document.getElementById('dynamic-island');
  var overlay = document.getElementById('di-overlay');
  var compact = document.getElementById('di-compact');
  var expanded = document.getElementById('di-expanded');
  var shell = di.querySelector('.di-shell');
  var ditherWrap = document.getElementById('di-compact-dither');

  di.style.display = 'block';
  overlay.style.display = 'block';
  shell.classList.remove('expanded');
  compact.classList.remove('hidden');
  expanded.classList.remove('visible');
  expanded.style.display = 'none';

  positionDynamicIsland();

  var gradient = DI_MODE_GRADIENTS[currentMode] || DI_MODE_GRADIENTS.ig;
  shell.style.background = gradient;

  if (ditherWrap && !ditherWrap.firstChild) {
    ditherWrap.appendChild(createDitherLoader({ cell: 4, gap: 1, speed: 1 }));
  }

  di.onclick = function(e) {
    if (e.target.closest('.di-btn')) return;
    if (!shell.classList.contains('expanded')) {
      expandDynamicIsland();
    }
  };

  overlay.onclick = function() {
    collapseDynamicIsland();
  };
}

function expandDynamicIsland() {
  var shell = document.querySelector('.di-shell');
  var compact = document.getElementById('di-compact');
  var expanded = document.getElementById('di-expanded');
  var headerSpinner = document.getElementById('di-expanded-spinner');

  compact.classList.add('hidden');
  shell.classList.add('expanded');

  positionDynamicIsland();

  if (headerSpinner && !headerSpinner.firstChild) {
    headerSpinner.appendChild(createDitherLoader({ cell: 4, gap: 1, speed: 1, color: '#fff' }));
  }

  setTimeout(function() {
    expanded.style.display = 'block';
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        expanded.classList.add('visible');
      });
    });
  }, 150);
}

function collapseDynamicIsland() {
  var shell = document.querySelector('.di-shell');
  var compact = document.getElementById('di-compact');
  var expanded = document.getElementById('di-expanded');

  expanded.classList.remove('visible');

  setTimeout(function() {
    expanded.style.display = 'none';
    shell.classList.remove('expanded');
    compact.classList.remove('hidden');
  }, 250);
}

function closeDynamicIsland() {
  var di = document.getElementById('dynamic-island');
  var overlay = document.getElementById('di-overlay');
  var shell = di.querySelector('.di-shell');
  var compact = document.getElementById('di-compact');
  var expanded = document.getElementById('di-expanded');

  expanded.classList.remove('visible');
  shell.classList.remove('expanded');

  setTimeout(function() {
    expanded.style.display = 'none';
    compact.classList.remove('hidden');
    di.style.display = 'none';
    overlay.style.display = 'none';
  }, 300);

  di.onclick = null;
  overlay.onclick = null;
}

function showDiSuccess(title) {
  var shell = document.querySelector('.di-shell');
  var compact = document.getElementById('di-compact');
  var expanded = document.getElementById('di-expanded');
  var headerSpinner = document.getElementById('di-expanded-spinner');
  var headerTitle = document.getElementById('di-expanded-title');
  var footer = document.getElementById('di-expanded-footer');

  if (!shell.classList.contains('expanded')) {
    expandDynamicIsland();
    setTimeout(showDiSuccess, 400);
    return;
  }

  headerSpinner.style.display = 'none';
  headerTitle.textContent = title || 'Berhasil!';
  headerTitle.style.color = '#22c55e';
  footer.style.display = 'none';

  setTimeout(function() {
    closeDynamicIsland();
    headerSpinner.style.display = '';
    headerTitle.style.color = '';
  }, 1200);
}

function showDiError(title) {
  var shell = document.querySelector('.di-shell');
  var compact = document.getElementById('di-compact');
  var expanded = document.getElementById('di-expanded');
  var headerSpinner = document.getElementById('di-expanded-spinner');
  var headerTitle = document.getElementById('di-expanded-title');
  var footer = document.getElementById('di-expanded-footer');

  if (!shell.classList.contains('expanded')) {
    expandDynamicIsland();
    setTimeout(showDiError, 400, title);
    return;
  }

  headerSpinner.style.display = 'none';
  headerTitle.textContent = title || 'Gagal';
  headerTitle.style.color = '#ef4444';
  footer.style.display = 'flex';
}

function renderModelProgress(models, currentIdx, status) {
  var di = document.getElementById('dynamic-island');
  var list = document.getElementById('di-expanded-list');
  var headerSpinner = document.getElementById('di-expanded-spinner');
  var headerTitle = document.getElementById('di-expanded-title');

  if (di.style.display === 'none') {
    showDynamicIsland();
  }

  if (status === 'success') {
    showDiSuccess('Berhasil!');
    return;
  } else if (status === 'all-failed') {
    showDiError('Semua model gagal');
  } else if (status === 'trying') {
    headerSpinner.style.display = '';
    headerTitle.textContent = 'AI sedang memproses...';
    headerTitle.style.color = '#fff';
  }

  var html = '';
  for (var j = 0; j < models.length; j++) {
    var cls = 'di-expanded-item';
    var icon = '';
    if (j < currentIdx) {
      cls += ' failed';
      icon = '<i class="fas fa-times item-icon"></i>';
    } else if (j === currentIdx) {
      if (status === 'trying') {
        cls += ' trying';
        icon = '<span class="item-dither" data-dither="1"></span>';
      } else if (status === 'success') {
        cls += ' success';
        icon = '<i class="fas fa-check item-icon"></i>';
      } else if (status === 'failed' || status === 'all-failed') {
        cls += ' failed';
        icon = '<i class="fas fa-times item-icon"></i>';
      }
    } else {
      icon = '<i class="fas fa-circle item-icon" style="font-size:5px;opacity:0.3;"></i>';
    }
    html += '<div class="' + cls + '">' + icon + '<span>' + models[j] + '</span></div>';
  }
  list.innerHTML = html;

  var dithers = list.querySelectorAll('[data-dither]');
  for (var d = 0; d < dithers.length; d++) {
    dithers[d].appendChild(createDitherLoader({ cell: 3, gap: 1, speed: 0.8 }));
  }
}

function retryGenerate() {
  closeDynamicIsland();
  generateAds();
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN GENERATE FUNCTION
   ═══════════════════════════════════════════════════════════════════════════ */

async function generateAds() {
  var serviceInfo  = document.getElementById('serviceInfo').value.trim();
  var contentTitle = document.getElementById('contentTitle').value.trim();
  var reportData   = document.getElementById('reportData').value.trim();
  var waPromoType  = document.getElementById('waPromoType').value.trim();
  var fbReportData = document.getElementById('fbReportData').value.trim();
  var commandEl    = document.getElementById('command');
  var command      = commandEl ? commandEl.value.trim() : '';
  var gbisnisCommandEl = document.getElementById('gbisnis-command');
  var gbisnisCommand   = gbisnisCommandEl ? gbisnisCommandEl.value.trim() : '';
  var waCommandEl  = document.getElementById('wa-command');
  var waCommand    = waCommandEl ? waCommandEl.value.trim() : '';
  var fbCommandEl  = document.getElementById('fb-command');
  var fbCommand    = fbCommandEl ? fbCommandEl.value.trim() : '';
  var ttCommandEl  = document.getElementById('tt-command');
  var ttCommand    = ttCommandEl ? ttCommandEl.value.trim() : '';
  var gbisnisTitle = document.getElementById('gbisnisTitle').value.trim();
  var waTitle      = document.getElementById('waTitle').value.trim();
  var fbTitle      = document.getElementById('fbTitle').value.trim();
  var ttTitle      = document.getElementById('ttTitle').value.trim();
  var ttVideoDesc  = document.getElementById('ttVideoDesc').value.trim();
  
  clearError();
  if (!currentMode) { showToast('Pilih mode konten terlebih dahulu', 'warning'); return; }
  if (currentMode === 'ig' && !serviceInfo) { showToast('Isi kolom Layanan / Masalah dulu', 'warning'); return; }
  if (currentMode === 'ig' && !contentTitle) { showToast('Isi Judul / Topik Konten IG dulu', 'warning'); return; }
  if (currentMode === 'gbisnis' && !gbisnisTitle) { showToast('Isi Judul dulu', 'warning'); return; }
  if (currentMode === 'gbisnis' && !reportData) { showToast('Paste data report pelanggan dulu', 'warning'); return; }
  if (currentMode === 'wa' && !waTitle) { showToast('Isi Judul dulu', 'warning'); return; }
  if (currentMode === 'wa' && !waPromoType) { showToast('Isi Jenis Promo / Layanan dulu', 'warning'); return; }
  if (currentMode === 'fb' && !fbTitle) { showToast('Isi Judul dulu', 'warning'); return; }
  if (currentMode === 'fb' && !fbReportData) { showToast('Paste data report pelanggan untuk Facebook dulu', 'warning'); return; }
  if (currentMode === 'tt' && !ttTitle) { showToast('Isi Judul dulu', 'warning'); return; }
  if (currentMode === 'tt' && !ttVideoDesc) { showToast('Isi Tema / Deskripsi Video TikTok dulu', 'warning'); return; }
    
  setLoading(true);

  var geminiApiKey = localStorage.getItem(API_KEY_STORAGE) || '';
  if (!geminiApiKey) {
    setLoading(false);
    showToast('API Key Gemini belum diset. Buka Pengaturan dan masukkan API Key kamu terlebih dahulu.', 'error');
    return;
  }
  
  var prompt = '';
  if (currentMode === 'ig') {
    prompt = 'Anda adalah asisten periklanan senior untuk Macsus Company. DATA PERUSAHAAN (wajib selalu digunakan): - Nama: Macsus Company - Layanan: Jasa servis & perbaikan laptop (hardware + software) di Surabaya & Sidoarjo - Hardware: Overheat treatment, ganti thermal paste, penggantian layar, perbaikan motherboard, water spill treatment - Software: Optimasi sistem, install ulang, remove virus - Keunggulan: Teknisi ahli, pengerjaan cepat & transparan, harga terjangkau, free diagnosa - Alamat: Jl. Keputih Makam Blk. E No.26, Keputih, Kec. Sukolilo, Surabaya, Jawa Timur 60295 - WhatsApp: 0858-5256-1993 - Hashtag utama: #MacsusCompany #ServiceLaptopSurabaya INPUT: - Layanan hari ini: ' + serviceInfo + ' - Judul/Topik Konten IG: ' + contentTitle + (command ? ' - Catatan tambahan: ' + command : '') + ' TUGAS: Buat 3 output berikut secara lengkap dan dipisah dengan jelas: ===OUTPUT 1: PROMPT NOTEBOOKLM=== Tulis prompt instruksi untuk NotebookLM agar membuat konten slide IG vertikal (rasio 4:5 / Portrait) mengatasnamakan Macsus Company. Prompt harus menyebut nama dokumen sumber yang akan dibuat di Output 2, menyebutkan hook yang kuat, poin-poin konten utama, dan CTA layanan Macsus yang relevan. ===OUTPUT 2: DOKUMEN SUMBER DATA=== Buat dokumen sumber teks teknis dengan nama "DIAGNOSA [TOPIK] MACSUS COMPANY" yang akan digunakan sebagai basis data di NotebookLM. Isi dengan: analisis gejala/masalah, langkah diagnosa mandiri yang bisa dilakukan user, value preposition layanan Macsus untuk masalah ini. Format dengan bullet points yang informatif. ===OUTPUT 3: CAPTION INSTAGRAM=== Buat caption IG yang menarik dengan struktur: Headline all-caps dengan emoji relevan, paragraf pembuka yang relatable dan bikin orang penasaran, numbered list langkah atau tips praktis, paragraf solusi Macsus dengan checklist, info lokasi & WhatsApp, dan hashtag yang relevan (min. 10 hashtag). Pastikan ketiga output terpisah jelas dengan header masing-masing. PENTING: DILARANG KERAS menggunakan markdown bintang ganda (**) untuk menebalkan teks.';
  } else if (currentMode === 'gbisnis') {
    prompt = 'Kamu adalah seorang IT consultant spesialis laptop dan PC. Kamu diminta membuat storytelling berbasis Google Business untuk Macsus Company dengan ketentuan berikut: - Gaya bahasa Gen Z: santai, relatable, sedikit lebay/hiperbola tapi tetap informatif - Nada: persuasif, menyentuh perasaan pembaca, bikin orang mau langsung ke workshop - Tujuan: meningkatkan income pelanggan Macsus Company dan mendorong kunjungan kantor agar mau maintenance / perbaikan laptop/PC - Maksimal 1500 karakter (hitung dengan ketat, jangan melebihi) - Jangan sebut nama lengkap pelanggan, cukup sebut nama depan atau panggilan akrab saja - Akhiri dengan info Macsus Company: nama, alamat (Jl. Keputih Makam Blk. E No.26, Keputih, Kec. Sukolilo, Surabaya, Jawa Timur 60295), WhatsApp: 0858-5256-1993, dan tagline penutup yang memorable DATA REPORT PELANGGAN: ' + reportData + (command ? '\nCatatan tambahan: ' + command : '') + ' PENTING: Output hanya berisi teks storytelling-nya saja, langsung tanpa label/header apapun. Mulai langsung dari kalimat pembuka yang hook. DILARANG KERAS menggunakan markdown bintang ganda (**) untuk menebalkan teks. Gunakan teks biasa saja, tapi kamu boleh menggunakan emoji.';
  } else if (currentMode === 'wa') {
    prompt = 'Buatkan saya pesan WhatsApp broadcast untuk Macsus Company dengan ketentuan berikut: - Panjang ideal: 200-400 karakter - Gaya: santai, ramah, pakai emoji yang relevan - Isi: promosi tentang ' + waPromoType + ' - Include: manfaat, harga/diskon jika ada, CTA untuk menghubungi - Akhiri dengan: Alamat: Jl. Keputih Makam Blk. E No.26, Keputih, Kec. Sukolilo, Surabaya, Jawa Timur 60295 - WhatsApp: 0858-5256-1993' + (command ? '\nCatatan: ' + command : '') + ' PENTING: Output hanya teks broadcast siap kirim, tanpa penjelasan tambahan. DILARANG menggunakan markdown (**) untuk teks tebal.';
  } else if (currentMode === 'fb') {
    prompt = 'Buatkan saya postingan Facebook untuk Macsus Company dengan ketentuan berikut: - Panjang: 1000-5000 karakter - Gaya bahasa: formal tapi tetap friendly, Gen Z friendly - Nada: persuasif, storytelling, bikin orang peduli dengan layanan - Maksimal 5000 karakter - Include: data dari report yang relevan, value preposition Macsus, CTA untuk hubungi/kunjungi - Akhiri dengan info Macsus Company: Alamat: Jl. Keputih Makam Blk. E No.26, Keputih, Kec. Sukolilo, Surabaya, Jawa Timur 60295 - WhatsApp: 0858-5256-1993 - Layanan: Servis laptop hardware & software (overheat treatment, ganti layar, liquid spill, perbaikan motherboard, install ulang OS, remove virus) DATA REPORT: ' + fbReportData + (command ? '\nCatatan: ' + command : '') + ' PENTING: Output hanya teks postingan siap dipublish, tanpa penjelasan. Jangan gunakan markdown (**).';
  } else if (currentMode === 'tt') {
    var ttVideoDesc = document.getElementById('ttVideoDesc').value.trim();
    prompt = 'Kamu adalah spesialis konten digital untuk Macsus Company, sebuah jasa servis & perbaikan laptop profesional di Surabaya & Sidoarjo. DATA PERUSAHAAN: - Nama: Macsus Company - Layanan: Servis laptop hardware & software (overheat treatment, ganti layar, liquid spill, perbaikan motherboard, install ulang OS, remove virus, upgrade RAM/SSD) - Keunggulan: Teknisi ahli, pengerjaan cepat & transparan, harga terjangkau, free diagnosa - Alamat: Jl. Keputih Makam Blk. E No.26, Keputih, Kec. Sukolilo, Surabaya, Jawa Timur 60295 - WhatsApp: 0858-5256-1993 - Hashtag utama: #MacsusCompany #ServiceLaptopSurabaya TUGAS: Buat caption TikTok yang viral dan engaging untuk video dengan tema/konten berikut: "' + ttVideoDesc + '" ' + (command ? '\nCatatan tambahan: ' + command : '') + ' KETENTUAN CAPTION TIKTOK: - Panjang: 150-300 karakter (singkat, padat, langsung to the point) - Mulai dengan hook kuat dalam 1-2 kalimat pertama yang bikin orang stop scrolling - Gunakan bahasa Gen Z yang santai, relatable, sedikit humor - Sertakan 1 kalimat soft-sell atau CTA ke Macsus (tidak harus selalu, bisa tersirat) - Akhiri dengan 5-10 hashtag yang relevan dan trending (mix: niche + broad) - Emoji yang tepat dan tidak berlebihan - Cocok untuk algoritma TikTok PENTING: Output langsung caption-nya saja, siap copy-paste. Jangan pakai markdown (**) atau penjelasan tambahan.';
  }

  async function callGemini(model, prompt) {
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + geminiApiKey;
    var res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 8192 }
      })
    });
    if (!res.ok) {
      var errData = await res.json().catch(function() { return {}; });
      var errMsg = (errData && errData.error && errData.error.message) || (errData && errData.error) || 'HTTP ' + res.status;
      var err = new Error('[' + model + '] ' + errMsg);
      err.status = res.status;
      throw err;
    }
    var data = await res.json();
    var text = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text || '';
    if (!text) throw new Error('[' + model + '] Respons kosong dari API.');
    return text;
  }

  function renderModelProgress(models, currentIdx, status) {
    var di = document.getElementById('dynamic-island');
    var list = document.getElementById('di-expanded-list');
    var headerSpinner = document.getElementById('di-expanded-spinner');
    var headerTitle = document.getElementById('di-expanded-title');

    if (di.style.display === 'none') {
      showDynamicIsland();
    }

    if (status === 'success') {
      showDiSuccess('Berhasil!');
      return;
    } else if (status === 'all-failed') {
      showDiError('Semua model gagal');
    } else if (status === 'trying') {
      headerSpinner.style.display = '';
      headerTitle.textContent = 'AI sedang memproses...';
      headerTitle.style.color = '#fff';
    }

    var html = '';
    for (var j = 0; j < models.length; j++) {
      var cls = 'di-expanded-item';
      var icon = '';
      if (j < currentIdx) {
        cls += ' failed';
        icon = '<i class="fas fa-times item-icon"></i>';
      } else if (j === currentIdx) {
        if (status === 'trying') {
          cls += ' trying';
          icon = '<span class="item-dither" data-dither="1"></span>';
        } else if (status === 'success') {
          cls += ' success';
          icon = '<i class="fas fa-check item-icon"></i>';
        } else if (status === 'failed' || status === 'all-failed') {
          cls += ' failed';
          icon = '<i class="fas fa-times item-icon"></i>';
        }
      } else {
        icon = '<i class="fas fa-circle item-icon" style="font-size:5px;opacity:0.3;"></i>';
      }
      html += '<div class="' + cls + '">' + icon + '<span>' + models[j] + '</span></div>';
    }
    list.innerHTML = html;

    var dithers = list.querySelectorAll('[data-dither]');
    for (var d = 0; d < dithers.length; d++) {
      dithers[d].appendChild(createDitherLoader({ cell: 3, gap: 1, speed: 0.8 }));
    }
  }

  var selectedModel = getSelectedModel();
  var fallbackQueue = [selectedModel].concat(FALLBACK_MODELS.filter(function(m) { return m !== selectedModel; }));

  var rawText = null;
  var lastError = null;
  var usedModel = selectedModel;

  renderModelProgress(fallbackQueue, 0, 'trying');

  for (var i = 0; i < fallbackQueue.length; i++) {
    var model = fallbackQueue[i];
    try {
      rawText = await callGemini(model, prompt);
      usedModel = model;
      renderModelProgress(fallbackQueue, i, 'success');
      break;
    } catch (err) {
      lastError = err;
      renderModelProgress(fallbackQueue, i, 'failed');
      var isRetryable = err.status === 429 || err.status === 503 ||
        /overload|high.demand|unavailable|resource_exhausted|quota/i.test(err.message);
      if (!isRetryable || i === fallbackQueue.length - 1) break;
      if (i + 1 < fallbackQueue.length) {
        renderModelProgress(fallbackQueue, i + 1, 'trying');
      }
      await new Promise(function(r) { setTimeout(r, 1200); });
    }
  }

  try {
    if (!rawText) {
      renderModelProgress(fallbackQueue, fallbackQueue.length - 1, 'all-failed');
      throw lastError || new Error('Semua model gagal.');
    }

    rawText = rawText.replace(/\*\*/g, '');
    
    document.getElementById('input-container').style.display = 'none';
    
    var savedDataObj = {};
    if (currentMode === 'ig') {
      savedDataObj = parseAndShowIG(rawText, contentTitle);
    } else if (currentMode === 'gbisnis') {
      savedDataObj = parseAndShowGBisnis(rawText);
    } else if (currentMode === 'wa') {
      savedDataObj = parseAndShowWA(rawText);
    } else if (currentMode === 'fb') {
      savedDataObj = parseAndShowFB(rawText);
    } else if (currentMode === 'tt') {
      savedDataObj = parseAndShowTT(rawText);
    }
    
    var sessionTitle = 'Tanpa Judul';
    if (currentMode === 'ig') {
      sessionTitle = contentTitle || 'Tanpa Judul';
    } else if (currentMode === 'gbisnis') {
      sessionTitle = gbisnisTitle || 'Tanpa Judul';
    } else if (currentMode === 'wa') {
      sessionTitle = waTitle || 'Tanpa Judul';
    } else if (currentMode === 'fb') {
      sessionTitle = fbTitle || 'Tanpa Judul';
    } else if (currentMode === 'tt') {
      sessionTitle = ttTitle || 'Tanpa Judul';
    }
    
    saveSession(sessionTitle, currentMode, savedDataObj);
    
  } catch (err) {
    var msg = (err.message || '').toLowerCase();
    var isHighDemand = 
      msg.includes('503') || msg.includes('overload') || msg.includes('high demand') || 
      msg.includes('unavailable') || msg.includes('resource_exhausted') || msg.includes('429') || msg.includes('quota');
    var isAllFailed = msg.includes('semua model gagal');
    
    if (!isAllFailed) {
      if (isHighDemand) {
        showToast('Semua model lagi antri! Tunggu ~1 menit lalu generate ulang, atau ganti model di Pengaturan.', 'error');
      } else {
        showToast('Terjadi kesalahan: ' + (err.message || err), 'error');
      }
    }
  } finally {
    setLoading(false);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH & FILTER
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   DOWNLOAD
   ═══════════════════════════════════════════════════════════════════════════ */

function downloadSection(elementId, filename) {
  var el = document.getElementById(elementId);
  if (!el) return;
  var text = el.innerText;
  var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename || 'macsus-' + Date.now() + '.txt';
  link.click();
  showToast('File diunduh!', 'success');
}

function downloadAllAsText() {
  var ids = ['notebooklm-body', 'dokumen-body', 'caption-body', 'gbisnis-body', 'wa-body', 'fb-body', 'tt-body'];
  var full = '';
  ids.forEach(function(id) {
    var el = document.getElementById(id);
    if (el && el.innerText.trim()) {
      var header = id.replace('-body', '').toUpperCase();
      full += '=== ' + header + ' ===\n' + el.innerText + '\n\n';
    }
  });
  var blob = new Blob([full.trim()], { type: 'text/plain;charset=utf-8' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'macsus-konten-' + new Date().toLocaleDateString('id-ID') + '.txt';
  link.click();
  showToast('Semua file diunduh!', 'success');
}

/* ═══════════════════════════════════════════════════════════════════════════
   EDIT & REGENERATE
   ═══════════════════════════════════════════════════════════════════════════ */

function editSection(elementId) {
  var el = document.getElementById(elementId);
  if (!el) return;
  if (el.contentEditable === 'true') {
    el.contentEditable = 'false';
    el.classList.remove('editing');
  } else {
    el.contentEditable = 'true';
    el.classList.add('editing');
    el.focus();
    el.onblur = function() {
      el.contentEditable = 'false';
      el.classList.remove('editing');
      var current = historyData[0];
      if (current) {
        if (elementId === 'notebooklm-body') current.data.nb = el.innerText;
        else if (elementId === 'dokumen-body') current.data.dok = el.innerText;
        else if (elementId === 'caption-body') {
          current.data.cap = el.innerText;
          updateCaptionCharCounter(el.innerText.length);
        }
        else if (elementId === 'gbisnis-body') {
          current.data.gb = el.innerText;
          updateCharCounter(el.innerText.length);
        }
        else if (elementId === 'wa-body') {
          current.data.wa = el.innerText;
          updateWACharCounter(el.innerText.length);
        }
        else if (elementId === 'fb-body') {
          current.data.fb = el.innerText;
          updateFBCharCounter(el.innerText.length);
        }
        else if (elementId === 'tt-body') {
          current.data.tt = el.innerText;
          updateTTCharCounter(el.innerText.length);
        }
        saveHistory();
      }
    };
  }
}

async function regenerateSection(elementId, sectionIndex) {
  var geminiApiKey = localStorage.getItem(API_KEY_STORAGE) || '';
  if (!geminiApiKey) {
    showToast('API Key belum diset', 'error');
    return;
  }

  setLoading(true);
  var prompt = '';
  var regeneratingFor = '';

  if (currentMode === 'ig') {
    var serviceInfo = document.getElementById('serviceInfo').value.trim();
    var contentTitle = document.getElementById('contentTitle').value.trim();
    var command = document.getElementById('command').value.trim();
    
    if (!serviceInfo || !contentTitle) {
      setLoading(false);
      showToast('Isi field layanan dan judul dulu', 'warning');
      return;
    }

    var basePrompt = 'Anda adalah asisten periklanan senior untuk Macsus Company. DATA PERUSAHAAN (wajib selalu digunakan): - Nama: Macsus Company - Layanan: Jasa servis & perbaikan laptop (hardware + software) di Surabaya & Sidoarjo - Hardware: Overheat treatment, ganti thermal paste, penggantian layar, perbaikan motherboard, water spill treatment - Software: Optimasi sistem, install ulang, remove virus - Keunggulan: Teknisi ahli, pengerjaan cepat & transparan, harga terjangkau, free diagnosa - Alamat: Jl. Keputih Makam Blk. E No.26, Keputih, Kec. Sukolilo, Surabaya, Jawa Timur 60295 - WhatsApp: 0858-5256-1993 - Hashtag utama: #MacsusCompany #ServiceLaptopSurabaya INPUT: - Layanan hari ini: ' + serviceInfo + ' - Judul/Topik Konten IG: ' + contentTitle + (command ? ' - Catatan tambahan: ' + command : '') + ' TUGAS: ';

    if (sectionIndex === 0) {
      prompt = basePrompt + 'Buat ulang HANYA bagian OUTPUT 1: PROMPT NOTEBOOKLM.';
      regeneratingFor = 'notebooklm-body';
    } else if (sectionIndex === 1) {
      prompt = basePrompt + 'Buat ulang HANYA bagian OUTPUT 2: DOKUMEN SUMBER DATA.';
      regeneratingFor = 'dokumen-body';
    } else if (sectionIndex === 2) {
      prompt = basePrompt + 'Buat ulang HANYA bagian OUTPUT 3: CAPTION INSTAGRAM.';
      regeneratingFor = 'caption-body';
    }
  } else if (currentMode === 'gbisnis') {
    var reportData = document.getElementById('reportData').value.trim();
    var command = document.getElementById('command').value.trim();
    if (!reportData) { setLoading(false); showToast('Isi data report dulu', 'warning'); return; }
    prompt = 'Kamu adalah seorang IT consultant spesialis laptop dan PC. Kamu diminta membuat storytelling berbasis Google Business untuk Macsus Company dengan ketentuan berikut: - Gaya bahasa Gen Z: santai, relatable, sedikit lebay/hiperbola tapi tetap informatif - Nada: persuasif, menyentuh perasaan pembaca, bikin orang mau langsung ke workshop - Tujuan: meningkatkan income pelanggan Macsus Company dan mendorong kunjungan kantor agar mau maintenance / perbaikan laptop/PC - Maksimal 1500 karakter (hitung dengan ketat, jangan melebihi) - Jangan sebut nama lengkap pelanggan, cukup sebut nama depan atau panggilan akrab saja - Akhiri dengan info Macsus Company: nama, alamat (Jl. Keputih Makam Blk. E No.26, Keputih, Kec. Sukolilo, Surabaya, Jawa Timur 60295), WhatsApp: 0858-5256-1993, dan tagline penutup yang memorable DATA REPORT PELANGGAN: ' + reportData + (command ? '\nCatatan tambahan: ' + command : '') + ' PENTING: Output hanya berisi teks storytelling-nya saja, langsung tanpa label/header apapun. Mulai langsung dari kalimat pembuka yang hook. DILARANG KERAS menggunakan markdown bintang ganda (**) untuk menebalkan teks.';
    regeneratingFor = 'gbisnis-body';
  } else if (currentMode === 'wa') {
    var waPromoType = document.getElementById('waPromoType').value.trim();
    var command = document.getElementById('command').value.trim();
    if (!waPromoType) { setLoading(false); showToast('Isi jenis promo dulu', 'warning'); return; }
    prompt = 'Buatkan saya pesan WhatsApp broadcast untuk Macsus Company dengan ketentuan berikut: - Panjang ideal: 200-400 karakter - Gaya: santai, ramah, pakai emoji yang relevan - Isi: promosi tentang ' + waPromoType + ' - Include: manfaat, harga/diskon jika ada, CTA untuk menghubungi - Akhiri dengan: Alamat: Jl. Keputih Makam Blk. E No.26, Keputih, Kec. Sukolilo, Surabaya, Jawa Timur 60295 - WhatsApp: 0858-5256-1993' + (command ? '\nCatatan: ' + command : '') + ' PENTING: Output hanya teks broadcast siap kirim, tanpa penjelasan tambahan.';
    regeneratingFor = 'wa-body';
  } else if (currentMode === 'fb') {
    var fbReportData = document.getElementById('fbReportData').value.trim();
    var command = document.getElementById('command').value.trim();
    if (!fbReportData) { setLoading(false); showToast('Isi data report dulu', 'warning'); return; }
    prompt = 'Buatkan saya postingan Facebook untuk Macsus Company dengan ketentuan berikut: - Panjang: 1000-5000 karakter - Gaya bahasa: formal tapi tetap friendly, Gen Z friendly - Nada: persuasif, storytelling, bikin orang peduli dengan layanan - Maksimal 5000 karakter - Include: data dari report yang relevan, value preposition Macsus, CTA untuk hubungi/kunjungi - Akhiri dengan info Macsus Company: Alamat: Jl. Keputih Makam Blk. E No.26, Keputih, Kec. Sukolilo, Surabaya, Jawa Timur 60295 - WhatsApp: 0858-5256-1993 - Layanan: Servis laptop hardware & software (overheat treatment, ganti layar, liquid spill, perbaikan motherboard, install ulang OS, remove virus) DATA REPORT: ' + fbReportData + (command ? '\nCatatan: ' + command : '') + ' PENTING: Output hanya teks postingan siap dipublish, tanpa penjelasan.';
    regeneratingFor = 'fb-body';
  } else if (currentMode === 'tt') {
    var ttVideoDesc = document.getElementById('ttVideoDesc').value.trim();
    var command = document.getElementById('command').value.trim();
    if (!ttVideoDesc) { setLoading(false); showToast('Isi deskripsi video TikTok dulu', 'warning'); return; }
    prompt = 'Kamu adalah spesialis konten digital untuk Macsus Company, sebuah jasa servis & perbaikan laptop profesional di Surabaya & Sidoarjo. DATA PERUSAHAAN: - Nama: Macsus Company - Layanan: Servis laptop hardware & software (overheat treatment, ganti layar, liquid spill, perbaikan motherboard, install ulang OS, remove virus, upgrade RAM/SSD) - Keunggulan: Teknisi ahli, pengerjaan cepat & transparan, harga terjangkau, free diagnosa - Alamat: Jl. Keputih Makam Blk. E No.26, Keputih, Kec. Sukolilo, Surabaya, Jawa Timur 60295 - WhatsApp: 0858-5256-1993 - Hashtag utama: #MacsusCompany #ServiceLaptopSurabaya TUGAS: Buat caption TikTok yang viral dan engaging untuk video dengan tema/konten berikut: "' + ttVideoDesc + '" ' + (command ? '\nCatatan tambahan: ' + command : '') + ' KETENTUAN CAPTION TIKTOK: - Panjang: 150-300 karakter (singkat, padat, langsung to the point) - Mulai dengan hook kuat dalam 1-2 kalimat pertama yang bikin orang stop scrolling - Gunakan bahasa Gen Z yang santai, relatable, sedikit humor - Sertakan 1 kalimat soft-sell atau CTA ke Macsus (tidak harus selalu, bisa tersirat) - Akhiri dengan 5-10 hashtag yang relevan dan trending (mix: niche + broad) - Emoji yang tepat dan tidak berlebihan - Cocok untuk algoritma TikTok PENTING: Output langsung caption-nya saja, siap copy-paste.';
    regeneratingFor = 'tt-body';
  }

  if (!prompt) { setLoading(false); showToast('Mode tidak terdeteksi', 'error'); return; }

  prompt += ' DILARANG KERAS menggunakan markdown bintang ganda (**) untuk menebalkan teks.';

  try {
    var selectedModel = getSelectedModel();
    var fallbackQueue = [selectedModel].concat(FALLBACK_MODELS.filter(function(m) { return m !== selectedModel; }));

    var rawText = null;
    for (var i = 0; i < fallbackQueue.length; i++) {
      var model = fallbackQueue[i];
      try {
        var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + geminiApiKey;
        var res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.9, maxOutputTokens: 8192 }
          })
        });
        if (!res.ok) throw new Error('API Error');
        var data = await res.json();
        rawText = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text || '';
        if (rawText) break;
      } catch (err) {
        if (i === fallbackQueue.length - 1) throw err;
        await new Promise(function(r) { setTimeout(r, 1200); });
      }
    }

    if (!rawText) throw new Error('Tidak ada respons dari AI');

    rawText = rawText.replace(/\*\*/g, '');

    var element = document.getElementById(regeneratingFor);
    element.innerText = rawText;

    if (historyData.length > 0) {
      var current = historyData[0];
      if (regeneratingFor === 'notebooklm-body') current.data.nb = rawText;
      else if (regeneratingFor === 'dokumen-body') current.data.dok = rawText;
      else if (regeneratingFor === 'caption-body') {
        current.data.cap = rawText;
        updateCaptionCharCounter(rawText.length);
      }
      else if (regeneratingFor === 'gbisnis-body') {
        current.data.gb = rawText;
        updateCharCounter(rawText.length);
      }
      else if (regeneratingFor === 'wa-body') {
        current.data.wa = rawText;
        updateWACharCounter(rawText.length);
      }
      else if (regeneratingFor === 'fb-body') {
        current.data.fb = rawText;
        updateFBCharCounter(rawText.length);
      }
      else if (regeneratingFor === 'tt-body') {
        current.data.tt = rawText;
        updateTTCharCounter(rawText.length);
      }
      saveHistory();
    }

    showToast('Section berhasil di-regenerate!', 'success');
  } catch (err) {
    showToast('Error regenerate: ' + err.message, 'error');
  } finally {
    setLoading(false);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   WHATSAPP INTEGRATION
   ═══════════════════════════════════════════════════════════════════════════ */

function shareToWhatsApp(elementId) {
  var text = document.getElementById(elementId).innerText;
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  showToast('Membuka WhatsApp...', 'info');
}

function openInWhatsApp(elementId) {
  var text = document.getElementById(elementId).innerText;
  window.open('https://wa.me/62858-5256-1993?text=' + encodeURIComponent(text), '_blank');
  showToast('Membuka WhatsApp...', 'info');
}

/* ═══════════════════════════════════════════════════════════════════════════
   TEMPLATE PRESETS
   ═══════════════════════════════════════════════════════════════════════════ */

function applyServiceTemplate(value) {
  document.getElementById('serviceInfo').value = value;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLEAR ALL OUTPUT SECTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

function clearAllOutputSections() {
  var allSections = [
    'section-notebooklm', 'section-dokumen', 'section-caption',
    'section-gbisnis', 'section-wa', 'section-fb', 'section-tt'
  ];
  allSections.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active');
    el.style.display = 'none';
  });
  var igTabs = document.getElementById('ig-tabs');
  if (igTabs) igTabs.style.display = 'none';
}

/* ═══════════════════════════════════════════════════════════════════════════
   OUTPUT PARSERS
   ═══════════════════════════════════════════════════════════════════════════ */

function parseAndShowIG(rawText, title) {
  clearAllOutputSections();
  var o1 = rawText.match(/OUTPUT\s*1[:\s\S]*?(?=OUTPUT\s*2|===OUTPUT\s*2|$)/i);
  var o2 = rawText.match(/OUTPUT\s*2[:\s\S]*?(?=OUTPUT\s*3|===OUTPUT\s*3|$)/i);
  var o3 = rawText.match(/OUTPUT\s*3[:\s\S]*/i);

  var nb  = cleanSection(o1 ? o1[0] : rawText, ['OUTPUT 1', 'NOTEBOOKLM', 'PROMPT']);
  var dok = cleanSection(o2 ? o2[0] : '', ['OUTPUT 2', 'DOKUMEN SUMBER', 'SUMBER DATA']);
  var cap = cleanSection(o3 ? o3[0] : '', ['OUTPUT 3', 'CAPTION INSTAGRAM', 'CAPTION']);

  if (!dok && !cap) {
    var parts = rawText.split(/\n={3,}\n/);
    nb  = parts[0] ? parts[0].trim() : rawText;
    dok = parts[1] ? parts[1].trim() : '';
    cap = parts[2] ? parts[2].trim() : '';
  }

  document.getElementById('notebooklm-body').innerText = nb  || rawText;
  document.getElementById('dokumen-body').innerText    = dok || '(Tidak terdeteksi. Lihat output bagian 1)';
  document.getElementById('caption-body').innerText    = cap || '(Tidak terdeteksi. Lihat output bagian 1)';
  updateCaptionCharCounter((cap || '').length);

  var igTabs2 = document.getElementById('ig-tabs');
  if (igTabs2) igTabs2.style.display = 'flex';
  switchTab(0);

  document.getElementById('output-title').innerText = title || 'Konten Instagram';
  var igPanel = document.getElementById('ig-fields');
  if (igPanel) igPanel.querySelector('#submit-btn-ig').style.display = 'none';
  document.getElementById('output-wrapper').classList.add('visible');
  document.body.classList.add('has-output');

  return { nb: nb, dok: dok, cap: cap, gb: '', wa: '', fb: '', tt: '' };
}

function parseAndShowGBisnis(rawText) {
  clearAllOutputSections();
  var cleaned = rawText.trim();
  document.getElementById('gbisnis-body').innerText = cleaned;
  updateCharCounter(cleaned.length);

  var gbEl = document.getElementById('section-gbisnis');
  gbEl.style.display = 'flex';
  gbEl.classList.add('active');

  document.getElementById('output-title').innerText = 'Postingan Google Bisnis';
  var gbPanel = document.getElementById('gbisnis-fields');
  if (gbPanel) gbPanel.querySelector('#submit-btn-gbisnis').style.display = 'none';
  document.getElementById('output-wrapper').classList.add('visible');
  document.body.classList.add('has-output');

  return { nb: '', dok: '', cap: '', gb: cleaned, wa: '', fb: '', tt: '' };
}

function parseAndShowWA(rawText) {
  clearAllOutputSections();
  var cleaned = rawText.trim();
  document.getElementById('wa-body').innerText = cleaned;
  updateWACharCounter(cleaned.length);

  var waEl = document.getElementById('section-wa');
  waEl.style.display = 'flex';
  waEl.classList.add('active');

  document.getElementById('output-title').innerText = 'WhatsApp Broadcast';
  var waPanel = document.getElementById('wa-fields');
  if (waPanel) waPanel.querySelector('#submit-btn-wa').style.display = 'none';
  document.getElementById('output-wrapper').classList.add('visible');
  document.body.classList.add('has-output');

  return { nb: '', dok: '', cap: '', gb: '', wa: cleaned, fb: '', tt: '' };
}

function parseAndShowFB(rawText) {
  clearAllOutputSections();
  var cleaned = rawText.trim();
  document.getElementById('fb-body').innerText = cleaned;
  updateFBCharCounter(cleaned.length);

  var fbEl = document.getElementById('section-fb');
  fbEl.style.display = 'flex';
  fbEl.classList.add('active');

  document.getElementById('output-title').innerText = 'Postingan Facebook';
  var fbPanel = document.getElementById('fb-fields');
  if (fbPanel) fbPanel.querySelector('#submit-btn-fb').style.display = 'none';
  document.getElementById('output-wrapper').classList.add('visible');
  document.body.classList.add('has-output');

  return { nb: '', dok: '', cap: '', gb: '', wa: '', fb: cleaned, tt: '' };
}

function parseAndShowTT(rawText) {
  clearAllOutputSections();
  var cleaned = rawText.trim();
  document.getElementById('tt-body').innerText = cleaned;
  updateTTCharCounter(cleaned.length);

  var ttEl = document.getElementById('section-tt');
  ttEl.style.display = 'flex';
  ttEl.classList.add('active');

  document.getElementById('output-title').innerText = 'Caption TikTok';
  var ttPanel = document.getElementById('tt-fields');
  if (ttPanel) ttPanel.querySelector('#submit-btn-tt').style.display = 'none';
  document.getElementById('output-wrapper').classList.add('visible');
  document.body.classList.add('has-output');

  return { nb: '', dok: '', cap: '', gb: '', wa: '', fb: '', tt: cleaned };
}

function cleanSection(text, headers) {
  if (!text) return '';
  var result = text.trim();
  headers.forEach(function(h) {
    result = result.replace(new RegExp('^[=\\s]*' + h + '[^\\n]*\\n', 'i'), '');
  });
  return result.replace(/^===.*===\n?/gm, '').trim();
}

/* ═══════════════════════════════════════════════════════════════════════════
   SPLASH SCREEN & INIT
   ═══════════════════════════════════════════════════════════════════════════ */

window.addEventListener('DOMContentLoaded', function() {
  updateApiKeyStatus();
  initModelSelect();
  initIgTemplateSelect();
  initWaTemplateSelect();
  goBeranda();
  initSwipeHandlers();

  // Init messaging badge count & realtime
  if (typeof updateBadgeCount === 'function' && window.supabaseAuth && window.supabaseAuth.isUserLoggedIn()) {
    updateBadgeCount();
    subscribeGlobalMessages();
  }

  var captionBody = document.getElementById('caption-body');
  var waBody = document.getElementById('wa-body');
  var fbBody = document.getElementById('fb-body');
  var gbBody = document.getElementById('gbisnis-body');
  var ttBody = document.getElementById('tt-body');
  
  if (captionBody) {
    captionBody.addEventListener('input', function() { updateCaptionCharCounter(captionBody.innerText.length); });
  }
  if (waBody) {
    waBody.addEventListener('input', function() { updateWACharCounter(waBody.innerText.length); });
  }
  if (fbBody) {
    fbBody.addEventListener('input', function() { updateFBCharCounter(fbBody.innerText.length); });
  }
  if (gbBody) {
    gbBody.addEventListener('input', function() { updateCharCounter(gbBody.innerText.length); });
  }
  if (ttBody) {
    ttBody.addEventListener('input', function() { updateTTCharCounter(ttBody.innerText.length); });
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORT / IMPORT
   ═══════════════════════════════════════════════════════════════════════════ */

function exportHistoryAsJSON() {
  var dataStr = JSON.stringify(historyData, null, 2);
  var blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'macsus-riwayat-' + new Date().toLocaleDateString('id-ID') + '.json';
  link.click();
  showToast('Riwayat diekspor!', 'success');
}

function triggerImportHistory() {
  document.getElementById('import-history-file').click();
}

function importHistoryFromFile(event) {
  var file = event.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        customConfirm(
          'Import Riwayat',
          'Ditemukan ' + imported.length + ' sesi. Merge dengan riwayat yang ada?',
          'Merge',
          function() {
            var existingIds = new Set(historyData.map(function(s) { return s.id.toString(); }));
            var newSessions = imported.filter(function(s) { return !existingIds.has(s.id.toString()); });
            historyData = historyData.concat(newSessions);
            saveHistory();
            renderBerandaHistory();
            showToast(newSessions.length + ' sesi diimpor!', 'success');
          },
          'info'
        );
      } else {
        showToast('Format file tidak valid', 'error');
      }
    } catch (err) {
      showToast('Error membaca file: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
  document.getElementById('import-history-file').value = '';
}

/* ═══════════════════════════════════════════════════════════════════════════
   TEST API KEY
   ═══════════════════════════════════════════════════════════════════════════ */

async function testApiKey() {
  var apiKey = localStorage.getItem(API_KEY_STORAGE);
  if (!apiKey) {
    showToast('API Key belum disimpan', 'error');
    return;
  }

  var btn = document.getElementById('btn-test-api');
  if (!btn) return;
  btn.disabled = true;
  var originalHTML = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner"></i> Menguji...';

  try {
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;
    var res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hi' }] }],
        generationConfig: { maxOutputTokens: 10 }
      })
    });

    if (res.ok) {
      btn.classList.add('success');
      btn.innerHTML = '<i class="fas fa-check-circle"></i> API Key Valid';
      showToast('API Key valid!', 'success');
    } else {
      btn.classList.add('error');
      btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> API Key Tidak Valid';
      showToast('API Key tidak valid', 'error');
    }

    setTimeout(function() {
      btn.classList.remove('success', 'error');
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }, 3000);
  } catch (err) {
    btn.classList.add('error');
    btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Koneksi Gagal';
    showToast('Gagal test koneksi', 'error');
    setTimeout(function() {
      btn.classList.remove('success', 'error');
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }, 3000);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   DRAG & DROP + RESIZE CARDS
   ═══════════════════════════════════════════════════════════════════════════ */
(function() {
  var STORAGE_KEY = 'beranda_cards_layout';
  var _dragSrc = null;

  function getLayout() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch(e) { return {}; }
  }
  function saveLayout(layout) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }

  function initCards() {
    var container = document.getElementById('beranda-view');
    if (!container) return;

    var sections = container.querySelectorAll('section');
    sections.forEach(function(sec) {
      if (sec.id === 'beranda-greeting' || sec.id === 'beranda-insights') return;
      var cards = sec.querySelectorAll(':scope > [style*="background: var(--bg-surface)"], :scope > .beranda-card');
      cards.forEach(function(card, idx) {
        if (card.dataset.cardInited) return;
        card.dataset.cardInited = '1';

        if (!card.dataset.cardId) {
          card.dataset.cardId = 'card-' + Math.random().toString(36).substr(2, 6);
        }

        card.classList.add('beranda-card');
        card.draggable = false;

        if (!card.dataset.origW) {
          card.dataset.origW = card.offsetWidth;
          card.dataset.origH = card.offsetHeight;
        }

        var grip = document.createElement('div');
        grip.className = 'beranda-drag-handle';
        grip.addEventListener('mousedown', function(e) { e.preventDefault(); startDrag(card, e); });
        card.appendChild(grip);

        var rr = document.createElement('div');
        rr.className = 'beranda-resize-handle beranda-resize-right';
        rr.addEventListener('mousedown', function(e) { e.preventDefault(); e.stopPropagation(); startResize(card, e, 'right'); });
        card.appendChild(rr);

        var rb = document.createElement('div');
        rb.className = 'beranda-resize-handle beranda-resize-bottom';
        rb.addEventListener('mousedown', function(e) { e.preventDefault(); e.stopPropagation(); startResize(card, e, 'bottom'); });
        card.appendChild(rb);

        var rc = document.createElement('div');
        rc.className = 'beranda-resize-handle beranda-resize-corner';
        rc.addEventListener('mousedown', function(e) { e.preventDefault(); e.stopPropagation(); startResize(card, e, 'both'); });
        card.appendChild(rc);

        var sizeInd = document.createElement('div');
        sizeInd.className = 'beranda-card-size-indicator';
        card.appendChild(sizeInd);

        var layout = getLayout();
        var key = card.dataset.cardId;
        if (layout[key]) {
          card.style.flex = 'none';
          if (layout[key].w) card.style.width = layout[key].w;
          if (layout[key].h) card.style.height = layout[key].h;
          if (layout[key].z) card.style.zoom = layout[key].z;
        }
      });
    });

    var layout = getLayout();
    if (layout._order) {
      var allCards = Array.from(container.querySelectorAll('.beranda-card'));
      layout._order.forEach(function(cardId) {
        var card = container.querySelector('[data-card-id="' + cardId + '"]');
        if (card) {
          var nextSibling = null;
          var cardIdx = layout._order.indexOf(cardId);
          for (var i = cardIdx + 1; i < layout._order.length; i++) {
            var next = container.querySelector('[data-card-id="' + layout._order[i] + '"]');
            if (next && next.parentElement) { nextSibling = next; break; }
          }
          if (nextSibling) {
            nextSibling.parentElement.insertBefore(card, nextSibling);
          } else {
            card.parentElement.appendChild(card);
          }
        }
      });
    }
  }

  /* ── DRAG ── */
  function startDrag(card, e) {
    _dragSrc = card;
    card.classList.add('dragging');
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
  }

  function onDragMove(e) {
    if (!_dragSrc) return;
    var container = document.getElementById('beranda-view');
    var cards = container.querySelectorAll('.beranda-card');
    cards.forEach(function(c) { c.classList.remove('drag-over'); });

    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;
    var target = el.closest('.beranda-card');
    if (target && target !== _dragSrc) {
      target.classList.add('drag-over');
    }
  }

  function onDragEnd(e) {
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    if (!_dragSrc) return;

    var container = document.getElementById('beranda-view');
    var cards = container.querySelectorAll('.beranda-card');
    cards.forEach(function(c) { c.classList.remove('drag-over'); });

    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (el) {
      var target = el.closest('.beranda-card');
      if (target && target !== _dragSrc) {
        var srcParent = _dragSrc.parentElement;
        var tgtParent = target.parentElement;
        var allCards = Array.from(tgtParent.querySelectorAll('.beranda-card'));
        var tgtIdx = allCards.indexOf(target);
        var srcIdx = allCards.indexOf(_dragSrc);
        if (srcIdx !== -1 && srcIdx < tgtIdx) {
          tgtParent.insertBefore(_dragSrc, target.nextSibling);
        } else {
          tgtParent.insertBefore(_dragSrc, target);
        }
      }
    }

    _dragSrc.classList.remove('dragging');
    _dragSrc = null;
    saveOrder();
  }

  function saveOrder() {
    var layout = getLayout();
    var order = [];
    document.querySelectorAll('#beranda-view .beranda-card').forEach(function(c) {
      if (c.dataset.cardId) order.push(c.dataset.cardId);
    });
    layout._order = order;
    saveLayout(layout);
  }

  /* ── RESIZE ── */
  function startResize(card, e, dir) {
    var startX = e.clientX || e.pageX;
    var startY = e.clientY || e.pageY;
    var startW = card.offsetWidth;
    var startH = card.offsetHeight;
    var origW = parseFloat(card.dataset.origW) || startW;
    var origH = parseFloat(card.dataset.origH) || startH;
    var ind = card.querySelector('.beranda-card-size-indicator');
    var startZoom = parseFloat(card.style.zoom) || 1;
    var savedFlex = card.style.flex;
    card.style.flex = 'none';

    function onMove(ev) {
      var cx = ev.clientX || ev.pageX;
      var cy = ev.clientY || ev.pageY;
      var zoom = startZoom;
      var dx = (cx - startX) / zoom;
      var dy = (cy - startY) / zoom;

      var newW = startW;
      var newH = startH;
      if (dir === 'right' || dir === 'both') newW = Math.max(100, startW + dx);
      if (dir === 'bottom' || dir === 'both') newH = Math.max(60, startH + dy);

      card.style.width = newW + 'px';
      card.style.height = newH + 'px';

      if (dir === 'both') {
        var zw = newW / origW;
        var zh = newH / origH;
        var z = Math.min(zw, zh);
        z = Math.max(0.3, Math.min(2, z));
        card.style.zoom = z;
        if (ind) ind.textContent = Math.round(z * 100) + '%';
      } else {
        if (ind) ind.textContent = Math.round(zoom * 100) + '%';
      }
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      var layout = getLayout();
      layout[card.dataset.cardId] = {
        w: card.style.width,
        h: card.style.height,
        z: card.style.zoom
      };
      saveLayout(layout);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initCards, 300);
  });

  window.initBerandaCards = initCards;
})();
