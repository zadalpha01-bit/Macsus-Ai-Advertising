/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SESSION HISTORY SYNC SERVICE
 * File: js/features/sessionSync.js
 * 
 * Handles:
 * - Save sessions to Supabase
 * - Load sessions from Supabase
 * - Sync conflict resolution
 * - Offline queue management
 * - UI sync indicators
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────
// SESSION SYNC CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────

const SESSION_SYNC_CONFIG = {
  SUPABASE_URL: 'https://spybvczjfixwsfbvmdol.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNweWJ2Y3pqZml4d3NmYnZtZG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5ODg0NjEsImV4cCI6MjA5NDU2NDQ2MX0.7siuN3HPprF6eRJU7FgylTIlx-hspUvqxPwHwqJRJ4I',
  BATCH_SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
  OFFLINE_QUEUE_KEY: 'macsus_sync_queue'
};

// State management
let syncState = {
  isSyncing: false,
  pendingQueue: [],
  lastSyncTime: null,
  syncErrors: []
};

// ─────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────

/**
 * Get auth token from cache
 */
function getAuthToken() {
  return localStorage.getItem('macsus_auth_token');
}

/**
 * Get user ID from cache
 */
function getUserId() {
  return localStorage.getItem('macsus_user_id');
}

/**
 * Update UI sync indicator
 */
function updateSyncIndicator(status) {
  const indicator = document.getElementById('sync-indicator');
  if (!indicator) return;

  if (status === 'syncing') {
    indicator.classList.remove('synced', 'error');
    indicator.classList.add('syncing');
    indicator.title = 'Syncing...';
    indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  } else if (status === 'error') {
    indicator.classList.remove('syncing', 'synced');
    indicator.classList.add('error');
    indicator.title = 'Sync error';
    indicator.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
  } else if (status === 'synced') {
    indicator.classList.remove('syncing', 'error');
    indicator.classList.add('synced');
    indicator.title = 'Synced';
    indicator.innerHTML = '<i class="fas fa-check-circle"></i>';
    // Keep synced state permanently - don't remove the class
  }
}

/**
 * Show sync toast notification
 */
function showSyncToast(message, type = 'info') {
  const t = document.getElementById('toast');
  if (!t) return;

  let icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-circle';
  if (type === 'warning') icon = 'fa-warning';

  t.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ─────────────────────────────────────────────────────────────────────────
// SAVE SESSION TO SUPABASE
// ─────────────────────────────────────────────────────────────────────────

/**
 * SAVE SESSION - Insert or update session in Supabase (⚠️ TELITI)
 * @param {string} sessionId - Unique session ID
 * @param {string} sessionTitle - Session title
 * @param {string} mode - Content mode (ig, gbisnis, wa, fb)
 * @param {object} contentData - Content object {nb, dok, cap, gb, wa, fb}
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function saveSessionToSupabase(sessionId, sessionTitle, mode, contentData) {
  try {
    const userId = getUserId();
    const authToken = getAuthToken();

    if (!userId || !authToken) {
      console.warn('⚠️ Not logged in, storing in offline queue');
      return { success: false, error: 'Not logged in' };
    }

    updateSyncIndicator('syncing');

    // Check if session already exists
    const existsResponse = await fetch(
      `${SESSION_SYNC_CONFIG.SUPABASE_URL}/rest/v1/user_sessions?session_id=eq.${encodeURIComponent(sessionId)}&select=id`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SESSION_SYNC_CONFIG.ANON_KEY,
          'Authorization': 'Bearer ' + SESSION_SYNC_CONFIG.ANON_KEY
        }
      }
    );

    const existing = await existsResponse.json();

    if (existing && existing.length > 0) {
      // UPDATE existing session
      const response = await fetch(
        `${SESSION_SYNC_CONFIG.SUPABASE_URL}/rest/v1/user_sessions?session_id=eq.${encodeURIComponent(sessionId)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SESSION_SYNC_CONFIG.ANON_KEY,
            'Authorization': 'Bearer ' + SESSION_SYNC_CONFIG.ANON_KEY,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            session_title: sessionTitle,
            content_data: contentData,
            updated_at: new Date().toISOString()
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }

      updateSyncIndicator('synced');
      console.log('✅ Session updated in Supabase:', sessionId);
      return { success: true };

    } else {
      // INSERT new session
      const response = await fetch(
        `${SESSION_SYNC_CONFIG.SUPABASE_URL}/rest/v1/user_sessions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SESSION_SYNC_CONFIG.ANON_KEY,
            'Authorization': 'Bearer ' + SESSION_SYNC_CONFIG.ANON_KEY,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: userId,
            session_id: sessionId,
            session_title: sessionTitle,
            mode: mode,
            content_data: contentData,
            pinned: false
          })
        }
      );

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        console.error('❌ Supabase insert error detail:', response.status, errBody);
        throw new Error(`Insert failed: ${response.status} - ${errBody}`);
      }

      updateSyncIndicator('synced');
      console.log('✅ Session saved to Supabase:', sessionId);
      return { success: true };
    }

  } catch (error) {
    console.error('❌ Save session error:', error);
    updateSyncIndicator('error');
    syncState.syncErrors.push(error.message);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// LOAD SESSIONS FROM SUPABASE
// ─────────────────────────────────────────────────────────────────────────

/**
 * LOAD ALL SESSIONS - Fetch all user's sessions from Supabase
 * @returns {Promise<array>} Array of sessions
 */
async function loadSessionsFromSupabase() {
  try {
    const userId = getUserId();
    const authToken = getAuthToken();

    if (!userId || !authToken) {
      console.warn('⚠️ Not logged in, cannot load sessions');
      return [];
    }

    updateSyncIndicator('syncing');

    // Fetch up to 200 sessions (range header), ordered newest first
    const response = await fetch(
      `${SESSION_SYNC_CONFIG.SUPABASE_URL}/rest/v1/user_sessions?user_id=eq.${userId}&order=created_at.desc&limit=200`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SESSION_SYNC_CONFIG.ANON_KEY,
          'Authorization': 'Bearer ' + SESSION_SYNC_CONFIG.ANON_KEY,
          'Range': '0-199',
          'Prefer': 'count=exact'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Load failed: ${response.status}`);
    }

    const sessions = await response.json();
    updateSyncIndicator('synced');
    console.log('✅ Loaded', sessions.length, 'sessions from Supabase');

    return sessions || [];

  } catch (error) {
    console.error('❌ Load sessions error:', error);
    updateSyncIndicator('error');
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────
// SYNC STRATEGIES
// ─────────────────────────────────────────────────────────────────────────

/**
 * SMART LOAD - Load from Supabase and merge with local history (⚠️ TELITI)
 * 
 * Strategy:
 * 1. Load from Supabase (source of truth)
 * 2. Compare with localStorage
 * 3. Merge with conflict resolution:
 *    - If session only in cloud: load it
 *    - If session only local: upload it
 *    - If in both but different content: Cloud version wins
 * 4. Update localStorage with merged result
 */
async function smartLoadAndMerge() {
  try {
    const localHistory = await HistoryDB.get('macsus_history') || [];
    const cloudSessions = await loadSessionsFromSupabase();

    if (cloudSessions.length === 0) {
      console.log('ℹ️ No sessions in cloud, using local');
      return localHistory;
    }

    // Convert cloud sessions to local format
    // session_id = the original Date.now() ID from local, used for matching
    const convertedCloud = cloudSessions.map(s => ({
      id: s.session_id || s.id,
      title: s.session_title,
      mode: s.mode,
      date: new Date(s.created_at).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }),
      data: s.content_data,
      pinned: s.pinned || false,
      _cloudId: s.id
    }));

    // Merge: Cloud sessions are source of truth
    const merged = [...convertedCloud];

    // Add local sessions that don't exist in cloud (match by session_id string)
    const cloudSessionIds = new Set(convertedCloud.map(cs => cs.id.toString()));
    for (const localSession of localHistory) {
      if (!cloudSessionIds.has(localSession.id.toString())) {
        merged.push(localSession);
        queueSessionForUpload(localSession);
      }
    }

    // Sort: pinned first, then by date descending (newest first)
    merged.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

    // Update both IndexedDB and in-memory historyData
    await HistoryDB.set('macsus_history', merged);
    historyData = merged;
    console.log('✅ Smart merge complete:', merged.length, 'sessions');

    return merged;

  } catch (error) {
    console.error('❌ Smart load error:', error);
    return (await HistoryDB.get('macsus_history')) || [];
  }
}

// ─────────────────────────────────────────────────────────────────────────
// DELETE SESSION FROM SUPABASE
// ─────────────────────────────────────────────────────────────────────────

async function deleteSessionFromSupabase(sessionId) {
  try {
    const userId = getUserId();
    const authToken = getAuthToken();
    if (!userId || !authToken) return { success: false, error: 'Not logged in' };

    const response = await fetch(
      `${SESSION_SYNC_CONFIG.SUPABASE_URL}/rest/v1/user_sessions?session_id=eq.${encodeURIComponent(sessionId)}&user_id=eq.${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SESSION_SYNC_CONFIG.ANON_KEY,
          'Authorization': 'Bearer ' + SESSION_SYNC_CONFIG.ANON_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`);
    }

    console.log('✅ Session deleted from Supabase:', sessionId);
    return { success: true };
  } catch (error) {
    console.error('❌ Delete session error:', error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// DELETE ALL SESSIONS FROM SUPABASE
// ─────────────────────────────────────────────────────────────────────────

async function deleteAllSessionsFromSupabase() {
  try {
    const userId = getUserId();
    const authToken = getAuthToken();
    if (!userId || !authToken) return { success: false, error: 'Not logged in' };

    const response = await fetch(
      `${SESSION_SYNC_CONFIG.SUPABASE_URL}/rest/v1/user_sessions?user_id=eq.${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SESSION_SYNC_CONFIG.ANON_KEY,
          'Authorization': 'Bearer ' + SESSION_SYNC_CONFIG.ANON_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Delete all failed: ${response.status}`);
    }

    console.log('✅ All sessions deleted from Supabase');
    return { success: true };
  } catch (error) {
    console.error('❌ Delete all sessions error:', error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// UPDATE PIN STATE IN SUPABASE
// ─────────────────────────────────────────────────────────────────────────

async function updatePinInSupabase(sessionId, pinned) {
  try {
    const userId = getUserId();
    const authToken = getAuthToken();
    if (!userId || !authToken) return { success: false, error: 'Not logged in' };

    const response = await fetch(
      `${SESSION_SYNC_CONFIG.SUPABASE_URL}/rest/v1/user_sessions?session_id=eq.${encodeURIComponent(sessionId)}&user_id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SESSION_SYNC_CONFIG.ANON_KEY,
          'Authorization': 'Bearer ' + SESSION_SYNC_CONFIG.ANON_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ pinned: pinned, updated_at: new Date().toISOString() })
      }
    );

    if (!response.ok) {
      throw new Error(`Pin update failed: ${response.status}`);
    }

    console.log('✅ Pin state updated in Supabase:', sessionId, pinned);
    return { success: true };
  } catch (error) {
    console.error('❌ Update pin error:', error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// OFFLINE QUEUE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────

/**
 * QUEUE SESSION - Add session to offline queue for later sync
 */
function queueSessionForUpload(sessionData) {
  try {
    const queue = JSON.parse(localStorage.getItem(SESSION_SYNC_CONFIG.OFFLINE_QUEUE_KEY)) || [];
    
    // Check if already in queue
    const exists = queue.find(q => q.sessionId === sessionData.id);
    if (exists) return;

    queue.push({
      sessionId: sessionData.id,
      title: sessionData.title,
      mode: sessionData.mode,
      data: sessionData.data,
      timestamp: new Date().toISOString()
    });

    localStorage.setItem(SESSION_SYNC_CONFIG.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    console.log('📦 Session queued for upload:', sessionData.id);

  } catch (error) {
    console.error('Queue error:', error);
  }
}

/**
 * PROCESS QUEUE - Upload all queued sessions (runs periodically or when online)
 */
async function processOfflineQueue() {
  try {
    const queue = JSON.parse(localStorage.getItem(SESSION_SYNC_CONFIG.OFFLINE_QUEUE_KEY)) || [];
    
    if (queue.length === 0) return;

    console.log('📤 Processing', queue.length, 'queued sessions...');
    updateSyncIndicator('syncing');

    let successful = 0;
    for (const item of queue) {
      try {
        const result = await saveSessionToSupabase(
          item.sessionId,
          item.title,
          item.mode,
          item.data
        );
        if (result.success) successful++;
      } catch (err) {
        console.error('Failed to upload queued session:', err);
      }
    }

    // Clear queue after processing
    localStorage.removeItem(SESSION_SYNC_CONFIG.OFFLINE_QUEUE_KEY);

    if (successful === queue.length) {
      updateSyncIndicator('synced');
      showSyncToast(`✅ Sync lengkap: ${successful} sesi uploaded`);
    } else {
      updateSyncIndicator('error');
      showSyncToast(`⚠️ Sync partial: ${successful}/${queue.length} sesi uploaded`, 'warning');
    }

  } catch (error) {
    console.error('❌ Process queue error:', error);
    updateSyncIndicator('error');
  }
}

// ─────────────────────────────────────────────────────────────────────────
// EVENT LISTENERS
// ─────────────────────────────────────────────────────────────────────────

/**
 * Setup auto-sync when app comes online
 */
window.addEventListener('online', () => {
  console.log('🌐 Back online, syncing...');
  showSyncToast('Connected! Syncing sessions...');
  processOfflineQueue();
});

window.addEventListener('offline', () => {
  console.log('📵 Offline mode');
  showSyncToast('Offline. Changes akan disync saat online', 'warning');
});

// ─────────────────────────────────────────────────────────────────────────
// INITIALIZATION & PERIODIC SYNC
// ─────────────────────────────────────────────────────────────────────────

/**
 * Initialize session sync (called on app startup)
 */
async function initSessionSync() {
  try {
    if (!navigator.onLine) {
      console.log('📵 Offline on startup, using local cache only');
      return;
    }

    console.log('🔄 Initializing session sync...');
    
    // Load and merge sessions
    await smartLoadAndMerge();
    
    // Process any offline queue
    await processOfflineQueue();

    // Re-render beranda history with merged data
    if (typeof renderBerandaHistory === 'function') {
      renderBerandaHistory();
    }

    console.log('✅ Session sync initialized');

  } catch (error) {
    console.error('❌ Session sync init error:', error);
  }
}

/**
 * Start periodic sync (every 5 minutes)
 */
function startPeriodicSync() {
  setInterval(() => {
    if (navigator.onLine) {
      console.log('🔄 Periodic sync');
      processOfflineQueue();
    }
  }, SESSION_SYNC_CONFIG.BATCH_SYNC_INTERVAL);
}

// ─────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  window.sessionSync = {
    saveSessionToSupabase,
    loadSessionsFromSupabase,
    smartLoadAndMerge,
    queueSessionForUpload,
    processOfflineQueue,
    initSessionSync,
    startPeriodicSync,
    updateSyncIndicator,
    deleteSessionFromSupabase,
    deleteAllSessionsFromSupabase,
    updatePinInSupabase
  };
}
