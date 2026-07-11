/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REALTIME UPDATE SYSTEM - VERSION CHECKING SERVICE
 * File: js/features/versionCheck.js
 * 
 * KONSEP:
 * - Supabase app_config table adalah SOURCE OF TRUTH untuk versi
 * - Client hanya tampilkan update modal kalau Supabase BENAR-BENAR lebih baru
 * - Service Worker & Cache di-kill setiap app load (force fresh fetch assets)
 * - Realtime listener ke Supabase untuk instant notification
 * 
 * DEPLOYMENT FLOW:
 * 1. Update code & naikkan CURRENT_VERSION (0.1.2 → 0.1.3)
 * 2. Update sw.js cache name (v0.1.2 → v0.1.3)
 * 3. Deploy ke Netlify
 * 4. User refresh page (SW/cache di-kill, assets fresh tapi UI sama)
 * 5. Update Supabase latest_version ke 0.2.0
 * 6. Client detect perubahan, show update modal
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────

const VERSION_CONFIG = {
  SUPABASE_URL: 'https://spybvczjfixwsfbvmdol.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNweWJ2Y3pqZml4d3NmYnZtZG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5ODg0NjEsImV4cCI6MjA5NDU2NDQ2MX0.7siuN3HPprF6eRJU7FgylTIlx-hspUvqxPwHwqJRJ4I',
  CURRENT_VERSION: '1.7.2',
  CACHE_KEY: 'macsus_current_version',
  LAST_CHECK_KEY: 'macsus_version_last_check',
  AUTO_CHECK_INTERVAL: 1 * 1000 // 1 second
};

let versionState = {
  isChecking: false,
  updateAvailable: false,
  forceUpdate: false,
  realtimeChannel: null
};

// ─────────────────────────────────────────────────────────────────────────
// KILL SW & CACHE ON APP LOAD (FORCE FRESH FETCH)
// ─────────────────────────────────────────────────────────────────────────

console.log('🔄 [VersionCheck] Initializing...');

// Kill Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister().then(() => {
        console.log('💀 [VersionCheck] Service Worker unregistered');
      });
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────

function getStoredVersion() {
  return localStorage.getItem(VERSION_CONFIG.CACHE_KEY) || VERSION_CONFIG.CURRENT_VERSION;
}

function saveCurrentVersion(version) {
  localStorage.setItem(VERSION_CONFIG.CACHE_KEY, version);
  console.log('✅ [VersionCheck] Version saved to localStorage:', version);
}

function compareVersions(v1, v2) {
  const v1parts = v1.split('.').map(Number);
  const v2parts = v2.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const p1 = v1parts[i] || 0;
    const p2 = v2parts[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

function getLastCheckTime() {
  const lastCheck = localStorage.getItem(VERSION_CONFIG.LAST_CHECK_KEY);
  return lastCheck ? new Date(lastCheck) : null;
}

function shouldCheckForUpdate() {
  const lastCheck = getLastCheckTime();
  if (!lastCheck) return true;
  const timeSinceCheck = Date.now() - lastCheck.getTime();
  return timeSinceCheck > VERSION_CONFIG.AUTO_CHECK_INTERVAL;
}

// ─────────────────────────────────────────────────────────────────────────
// UPDATE INDICATOR (RED DOT)
// ─────────────────────────────────────────────────────────────────────────

function showUpdateIndicator() {
  const settingsBtn = document.querySelector('button[onclick="toggleSettings()"]');
  if (!settingsBtn) {
    console.warn('⚠️ [VersionCheck] Settings button not found');
    return;
  }

  const existingIndicator = settingsBtn.querySelector('.update-badge-dot');
  if (existingIndicator) {
    existingIndicator.remove();
  }

  const badge = document.createElement('span');
  badge.className = 'update-badge-dot';
  badge.innerHTML = '●';
  badge.style.cssText = `
    position: absolute;
    top: 4px;
    right: 4px;
    width: 10px;
    height: 10px;
    background-color: #ff4444;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ff4444;
    font-size: 8px;
    animation: pulse 2s infinite;
  `;

  settingsBtn.style.position = 'relative';
  settingsBtn.appendChild(badge);
  console.log('🔴 [VersionCheck] Update indicator shown');
}

function hideUpdateIndicator() {
  const settingsBtn = document.querySelector('button[onclick="toggleSettings()"]');
  if (!settingsBtn) return;
  const badge = settingsBtn.querySelector('.update-badge-dot');
  if (badge) {
    badge.remove();
    console.log('✨ [VersionCheck] Update indicator hidden');
  }
}

// ─────────────────────────────────────────────────────────────────────────
// FETCH LATEST VERSION FROM SUPABASE (SOURCE OF TRUTH)
// ─────────────────────────────────────────────────────────────────────────

async function fetchLatestVersionFromSupabase() {
  try {
    console.log('🔍 [VersionCheck] Fetching latest version from Supabase...');
    
    // Query app_versions table, get the latest is_active version
    const response = await fetch(
      `${VERSION_CONFIG.SUPABASE_URL}/rest/v1/app_versions?is_active=eq.true&order=release_date.desc&limit=1`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': VERSION_CONFIG.ANON_KEY,
          'Authorization': `Bearer ${VERSION_CONFIG.ANON_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Handle array response
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('⚠️ [VersionCheck] No active version found in app_versions');
      return null;
    }

    const versionData = data[0];

    if (!versionData || !versionData.version_code) {
      console.warn('⚠️ [VersionCheck] No version_code in response');
      return null;
    }

    console.log('📦 [VersionCheck] Latest version from Supabase:', versionData.version_code);
    return versionData;

  } catch (error) {
    console.error('❌ [VersionCheck] Fetch version error:', error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// CHECK FOR UPDATES (COMPARE WITH SUPABASE)
// ─────────────────────────────────────────────────────────────────────────

async function checkForUpdates(silent = false) {
  try {
    if (versionState.isChecking) {
      console.log('⏳ [VersionCheck] Check already in progress');
      return { updateAvailable: false };
    }

    versionState.isChecking = true;
    console.log('🔍 [VersionCheck] Starting version check...', silent ? '(silent)' : '(manual)');

    if (!silent) {
      updateCheckButton('checking');
    }

    // Fetch latest version from Supabase (SOURCE OF TRUTH)
    const latestVersion = await fetchLatestVersionFromSupabase();

    if (!latestVersion) {
      if (!silent) {
        showVersionToast('Gagal memeriksa update', 'error');
        updateCheckButton('check');
      }
      versionState.isChecking = false;
      return { updateAvailable: false };
    }

    // Get current version stored in localStorage
    const currentVersion = getStoredVersion();

    console.log('📊 [VersionCheck] Version comparison:');
    console.log('   💾 Stored version (localStorage):', currentVersion);
    console.log('   ☁️  Latest version (Supabase):', latestVersion.version_code);

    // Compare versions
    const versionComparison = compareVersions(currentVersion, latestVersion.version_code);

    // Update last check time
    localStorage.setItem(VERSION_CONFIG.LAST_CHECK_KEY, new Date().toISOString());

    if (versionComparison < 0) {
      // ✅ NEW VERSION AVAILABLE
      console.log('🎉 [VersionCheck] New version available!');

      versionState.updateAvailable = true;
      versionState.forceUpdate = latestVersion.force_update || false;

      // Save update status to localStorage
      localStorage.setItem('macsus_update_available', JSON.stringify({
        available: true,
        version: latestVersion.version_code,
        force: latestVersion.force_update,
        timestamp: new Date().toISOString()
      }));

      // Show red dot indicator
      console.log('🔴 Showing update indicator');
      showUpdateIndicator();

      // Always show modal (FIXED!)
      console.log('📋 Showing update modal');
      showUpdateModal(currentVersion, latestVersion);

      if (!silent) {
        updateCheckButton('check');
      }

      versionState.isChecking = false;
      return {
        updateAvailable: true,
        newVersion: latestVersion.version_code,
        changelog: latestVersion.changelog,
        forceUpdate: latestVersion.force_update
      };

    } else if (versionComparison === 0) {
      // ✅ ALREADY ON LATEST VERSION
      console.log('✅ [VersionCheck] Already on latest version');

      hideUpdateIndicator();
      localStorage.removeItem('macsus_update_available');

      if (!silent) {
        showVersionToast('Sudah versi terbaru! (' + currentVersion + ')');
        updateCheckButton('check');
      }

      versionState.isChecking = false;
      return { updateAvailable: false };

    } else {
      // ⚠️ INSTALLED VERSION IS NEWER (DEV MODE?)
      console.log('ℹ️ [VersionCheck] Running newer version than server');

      hideUpdateIndicator();
      localStorage.removeItem('macsus_update_available');

      if (!silent) {
        updateCheckButton('check');
      }

      versionState.isChecking = false;
      return { updateAvailable: false };
    }

  } catch (error) {
    console.error('❌ [VersionCheck] Check error:', error);
    versionState.isChecking = false;

    if (!silent) {
      showVersionToast('Error memeriksa update: ' + error.message, 'error');
      updateCheckButton('check');
    }

    return { updateAvailable: false };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// UPDATE MODAL
// ─────────────────────────────────────────────────────────────────────────

function showUpdateModal(currentVersion, versionData) {
  console.log('🎬 [VersionCheck] Showing update modal');

  let modal = document.getElementById('update-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'update-modal';
    modal.className = 'update-modal-container';
    document.body.appendChild(modal);
  }

  const forceUpdate = versionData.force_update || false;

  modal.innerHTML = `
    <div class="update-modal-overlay" onclick="closeUpdateModal()"></div>
    <div class="update-modal">
      <div class="update-modal-header">
        <h2>Versi Baru Tersedia!</h2>
        <button class="update-modal-close" onclick="closeUpdateModal()" ${forceUpdate ? 'style=display:none' : ''}>
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="update-modal-body">
        <div class="version-info">
          <div class="version-row">
            <span class="version-label">Versi Saat Ini:</span>
            <span class="version-value">${currentVersion}</span>
          </div>
          <div class="version-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
          <div class="version-row">
            <span class="version-label">Versi Terbaru:</span>
            <span class="version-value version-new">${versionData.version_code}</span>
          </div>
        </div>
      </div>

      <div class="update-modal-footer">
        ${forceUpdate ? 
          `<button class="btn-update-now" onclick="performUpdate()">
            <i class="fas fa-download"></i> Update Sekarang
          </button>` :
          `<button class="btn-update-now" onclick="performUpdate()">
            <i class="fas fa-download"></i> Update Sekarang
          </button>
          <button class="btn-update-later" onclick="closeUpdateModal()">
            <i class="fas fa-clock"></i> Nanti
          </button>`
        }
      </div>

      ${forceUpdate ? `
        <div class="force-update-notice">
          ⚠️ Update ini wajib dilakukan. Aplikasi akan refresh otomatis dalam 30 detik.
        </div>
      ` : ''}
    </div>
  `;

  modal.classList.add('active');
  console.log('✅ [VersionCheck] Update modal displayed');

  if (forceUpdate) {
    setTimeout(() => {
      console.log('⏱️ Force update timeout');
      performUpdate();
    }, 30000);
  }
}

function closeUpdateModal() {
  const modal = document.getElementById('update-modal');
  if (modal) {
    modal.classList.remove('active');
    console.log('❌ [VersionCheck] Update modal closed');
  }
}

async function performUpdate() {
  try {
    console.log('🔄 [VersionCheck] Performing update...');

    closeUpdateModal();

    const loadingHtml = `
      <div class="update-loading">
        <div class="spinner"></div>
        <p>Sedang memperbarui aplikasi...</p>
        <p class="subtitle">Jangan tutup browser, mohon tunggu</p>
      </div>
    `;
    document.body.innerHTML = loadingHtml;

    // Get latest version and save
    const latestVersion = await fetchLatestVersionFromSupabase();
    if (latestVersion) {
      saveCurrentVersion(latestVersion.version_code);
      console.log('✅ [VersionCheck] Version updated:', latestVersion.version_code);
      localStorage.removeItem('macsus_update_available');
      hideUpdateIndicator();
    }

    await new Promise(r => setTimeout(r, 2000));

    console.log('🔃 [VersionCheck] Reloading page');
    window.location.reload(true);

  } catch (error) {
    console.error('❌ [VersionCheck] Update error:', error);
    showVersionToast('Error saat update: ' + error.message, 'error');
  }
}

function updateCheckButton(state) {
  const btn = document.getElementById('btn-check-version');
  if (!btn) return;

  if (state === 'checking') {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memeriksa...';
  } else if (state === 'check') {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-sync-alt"></i> Periksa Update';
  }
}

function showVersionToast(message, type = 'info') {
  const t = document.getElementById('toast');
  if (!t) {
    console.warn('⚠️ [VersionCheck] Toast element not found');
    return;
  }

  let icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-circle';
  if (type === 'warning') icon = 'fa-warning';

  t.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ─────────────────────────────────────────────────────────────────────────
// REALTIME LISTENER TO SUPABASE
// ─────────────────────────────────────────────────────────────────────────

function setupRealtimeVersionListener() {
  if (!window.supabaseAuth || !window.supabaseAuth.client) {
    console.warn('⚠️ [VersionCheck] Supabase client not initialized');
    return;
  }

  const client = window.supabaseAuth.client;

  console.log('🔌 [VersionCheck] Setting up realtime listener to app_versions table...');

  versionState.realtimeChannel = client
    .channel('public:app_versions')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'app_versions' },
      async (payload) => {
        console.log('🔔 [VersionCheck] Realtime change detected:', payload);

        // Fetch latest version after any change to app_versions
        const latestVersion = await fetchLatestVersionFromSupabase();
        
        if (!latestVersion) {
          console.warn('⚠️ [VersionCheck] Could not fetch latest version after change');
          return;
        }

        const currentStored = getStoredVersion();
        const comparison = compareVersions(currentStored, latestVersion.version_code);

        if (comparison < 0) {
          console.log('🎉 [VersionCheck] New version detected via realtime!');
          showUpdateIndicator();
          showUpdateModal(currentStored, latestVersion);
        } else if (comparison === 0) {
          console.log('✅ [VersionCheck] Already on latest version');
          hideUpdateIndicator();
        }
      }
    )
    .subscribe((status) => {
      console.log('📡 [VersionCheck] Realtime subscription status:', status);
    });
}

function unsubscribeRealtimeListener() {
  if (versionState.realtimeChannel) {
    versionState.realtimeChannel.unsubscribe();
    console.log('📡 [VersionCheck] Realtime listener unsubscribed');
  }
}

// ─────────────────────────────────────────────────────────────────────────
// INITIALIZATION & PERIODIC CHECKS
// ─────────────────────────────────────────────────────────────────────────

async function initVersionCheck() {
  try {
    console.log('🔄 [VersionCheck] Initializing...');
    console.log('📱 Current version:', VERSION_CONFIG.CURRENT_VERSION);
    console.log('💾 Stored version:', getStoredVersion());

    // Restore update indicator if it exists
    const savedUpdateStatus = localStorage.getItem('macsus_update_available');
    if (savedUpdateStatus) {
      try {
        const updateInfo = JSON.parse(savedUpdateStatus);
        if (updateInfo.available) {
          console.log('🔴 Restoring update indicator');
          showUpdateIndicator();
        }
      } catch (e) {
        console.error('❌ Failed to parse saved update status', e);
      }
    }

    // Check for updates on startup
    if (navigator.onLine) {
      console.log('🔍 Checking for updates on startup...');
      await checkForUpdates(true); // silent check
    } else {
      console.log('⚠️ Offline - skipping startup version check');
    }

    // Setup realtime listener
    setupRealtimeVersionListener();

  } catch (error) {
    console.error('❌ [VersionCheck] Init error:', error);
  }
}

function startPeriodicVersionCheck() {
  console.log('⏱️ [VersionCheck] Starting periodic check (every 1 sec)...');

  versionState.periodicCheckInterval = setInterval(async () => {
    if (navigator.onLine) {
      console.log('🔍 [VersionCheck] Periodic check...');
      await checkForUpdates(true); // silent
    }
  }, VERSION_CONFIG.AUTO_CHECK_INTERVAL);
}

function stopPeriodicVersionCheck() {
  if (versionState.periodicCheckInterval) {
    clearInterval(versionState.periodicCheckInterval);
    console.log('⏱️ [VersionCheck] Periodic check stopped');
  }
}

// ─────────────────────────────────────────────────────────────────────────
// EXPORT PUBLIC API
// ─────────────────────────────────────────────────────────────────────────

window.versionCheck = {
  initVersionCheck,
  startPeriodicVersionCheck,
  stopPeriodicVersionCheck,
  checkForUpdates,
  getStoredVersion,
  unsubscribeRealtimeListener
};
