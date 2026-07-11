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

const VERSION_CONFIG = {
  SUPABASE_URL: 'https://spybvczjfixwsfbvmdol.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNweWJ2Y3pqZml4d3NmYnZtZG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5ODg0NjEsImV4cCI6MjA5NDU2NDQ2MX0.7siuN3HPprF6eRJU7FgylTIlx-hspUvqxPwHwqJRJ4I',
  CURRENT_VERSION: '1.8.0',
  CACHE_KEY: 'macsus_current_version',
  LAST_CHECK_KEY: 'macsus_version_last_check',
  AUTO_CHECK_INTERVAL: 1 * 1000
};

let versionState = {
  isChecking: false,
  updateAvailable: false,
  forceUpdate: false,
  realtimeChannel: null
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

function getStoredVersion() {
  return localStorage.getItem(VERSION_CONFIG.CACHE_KEY) || VERSION_CONFIG.CURRENT_VERSION;
}

function saveCurrentVersion(version) {
  localStorage.setItem(VERSION_CONFIG.CACHE_KEY, version);
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

function showUpdateIndicator() {
  const settingsBtn = document.querySelector('button[onclick="toggleSettings()"]');
  if (!settingsBtn) return;

  const existingIndicator = settingsBtn.querySelector('.update-badge-dot');
  if (existingIndicator) existingIndicator.remove();

  const badge = document.createElement('span');
  badge.className = 'update-badge-dot';
  badge.innerHTML = '●';
  badge.style.cssText = 'position:absolute;top:4px;right:4px;width:10px;height:10px;background-color:#ff4444;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#ff4444;font-size:8px;animation:pulse 2s infinite;';

  settingsBtn.style.position = 'relative';
  settingsBtn.appendChild(badge);
}

function hideUpdateIndicator() {
  const settingsBtn = document.querySelector('button[onclick="toggleSettings()"]');
  if (!settingsBtn) return;
  const badge = settingsBtn.querySelector('.update-badge-dot');
  if (badge) badge.remove();
}

async function fetchLatestVersionFromSupabase() {
  try {
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

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) return null;

    const versionData = data[0];
    if (!versionData || !versionData.version_code) return null;

    return versionData;
  } catch (error) {
    return null;
  }
}

async function checkForUpdates(silent = false) {
  try {
    if (versionState.isChecking) return { updateAvailable: false };

    versionState.isChecking = true;

    if (!silent) updateCheckButton('checking');

    const latestVersion = await fetchLatestVersionFromSupabase();

    if (!latestVersion) {
      if (!silent) {
        showVersionToast('Gagal memeriksa update', 'error');
        updateCheckButton('check');
      }
      versionState.isChecking = false;
      return { updateAvailable: false };
    }

    const currentVersion = getStoredVersion();
    const versionComparison = compareVersions(currentVersion, latestVersion.version_code);

    localStorage.setItem(VERSION_CONFIG.LAST_CHECK_KEY, new Date().toISOString());

    if (versionComparison < 0) {
      versionState.updateAvailable = true;
      versionState.forceUpdate = latestVersion.force_update || false;

      localStorage.setItem('macsus_update_available', JSON.stringify({
        available: true,
        version: latestVersion.version_code,
        force: latestVersion.force_update,
        timestamp: new Date().toISOString()
      }));

      showUpdateIndicator();
      showUpdateModal(currentVersion, latestVersion);

      if (!silent) updateCheckButton('check');
      versionState.isChecking = false;

      return {
        updateAvailable: true,
        newVersion: latestVersion.version_code,
        changelog: latestVersion.changelog,
        forceUpdate: latestVersion.force_update
      };
    } else if (versionComparison === 0) {
      hideUpdateIndicator();
      localStorage.removeItem('macsus_update_available');

      if (!silent) {
        showVersionToast('Sudah versi terbaru! (' + currentVersion + ')');
        updateCheckButton('check');
      }

      versionState.isChecking = false;
      return { updateAvailable: false };
    } else {
      hideUpdateIndicator();
      localStorage.removeItem('macsus_update_available');

      if (!silent) updateCheckButton('check');
      versionState.isChecking = false;
      return { updateAvailable: false };
    }
  } catch (error) {
    versionState.isChecking = false;

    if (!silent) {
      showVersionToast('Error memeriksa update: ' + error.message, 'error');
      updateCheckButton('check');
    }

    return { updateAvailable: false };
  }
}

function showUpdateModal(currentVersion, versionData) {
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
          <div class="version-arrow"><i class="fas fa-arrow-right"></i></div>
          <div class="version-row">
            <span class="version-label">Versi Terbaru:</span>
            <span class="version-value version-new">${versionData.version_code}</span>
          </div>
        </div>
      </div>
      <div class="update-modal-footer">
        <button class="btn-update-now" onclick="performUpdate()">
          <i class="fas fa-download"></i> Update Sekarang
        </button>
        ${forceUpdate ? '' : `<button class="btn-update-later" onclick="closeUpdateModal()"><i class="fas fa-clock"></i> Nanti</button>`}
      </div>
      ${forceUpdate ? `<div class="force-update-notice">⚠️ Update ini wajib dilakukan. Aplikasi akan refresh otomatis dalam 30 detik.</div>` : ''}
    </div>
  `;

  modal.classList.add('active');

  if (forceUpdate) {
    setTimeout(() => performUpdate(), 30000);
  }
}

function closeUpdateModal() {
  const modal = document.getElementById('update-modal');
  if (modal) modal.classList.remove('active');
}

async function performUpdate() {
  try {
    closeUpdateModal();

    document.body.innerHTML = `<div class="update-loading"><div class="spinner"></div><p>Sedang memperbarui aplikasi...</p><p class="subtitle">Jangan tutup browser, mohon tunggu</p></div>`;

    const latestVersion = await fetchLatestVersionFromSupabase();
    if (latestVersion) {
      saveCurrentVersion(latestVersion.version_code);
      localStorage.removeItem('macsus_update_available');
      hideUpdateIndicator();
    }

    await new Promise(r => setTimeout(r, 2000));
    window.location.reload(true);
  } catch (error) {
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
  showToast(message, type);
}

function setupRealtimeVersionListener() {
  if (!window.supabaseAuth || !window.supabaseAuth.client) return;

  const client = window.supabaseAuth.client;

  versionState.realtimeChannel = client
    .channel('public:app_versions')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'app_versions' },
      async (payload) => {
        const latestVersion = await fetchLatestVersionFromSupabase();
        if (!latestVersion) return;

        const currentStored = getStoredVersion();
        const comparison = compareVersions(currentStored, latestVersion.version_code);

        if (comparison < 0) {
          showUpdateIndicator();
          showUpdateModal(currentStored, latestVersion);
        } else if (comparison === 0) {
          hideUpdateIndicator();
        }
      }
    )
    .subscribe();
}

function unsubscribeRealtimeListener() {
  if (versionState.realtimeChannel) {
    versionState.realtimeChannel.unsubscribe();
  }
}

async function initVersionCheck() {
  try {
    const savedUpdateStatus = localStorage.getItem('macsus_update_available');
    if (savedUpdateStatus) {
      try {
        const updateInfo = JSON.parse(savedUpdateStatus);
        if (updateInfo.available) showUpdateIndicator();
      } catch (e) {}
    }

    if (navigator.onLine) {
      await checkForUpdates(true);
    }

    setupRealtimeVersionListener();
  } catch (error) {}
}

function startPeriodicVersionCheck() {
  versionState.periodicCheckInterval = setInterval(async () => {
    if (navigator.onLine) {
      await checkForUpdates(true);
    }
  }, VERSION_CONFIG.AUTO_CHECK_INTERVAL);
}

function stopPeriodicVersionCheck() {
  if (versionState.periodicCheckInterval) {
    clearInterval(versionState.periodicCheckInterval);
  }
}

window.versionCheck = {
  initVersionCheck,
  startPeriodicVersionCheck,
  stopPeriodicVersionCheck,
  checkForUpdates,
  getStoredVersion,
  unsubscribeRealtimeListener
};
