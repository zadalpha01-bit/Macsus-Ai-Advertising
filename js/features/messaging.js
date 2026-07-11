/* ═══════════════════════════════════════════════════════════════════════════
   MESSAGING MODULE
   ═══════════════════════════════════════════════════════════════════════════ */

const MSG_CONFIG = {
  SUPABASE_URL: 'https://spybvczjfixwsfbvmdol.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNweWJ2Y3pqZml4d3NmYnZtZG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5ODg0NjEsImV4cCI6MjA5NDU2NDQ2MX0.7siuN3HPprF6eRJU7FgylTIlx-hspUvqxPwHwqJRJ4I'
};

let _supabaseClient = null;
let _msgChannel = null;
let _currentConversationId = null;
let _msgPollInterval = null;
let _convoPollInterval = null;

function getMsgHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': MSG_CONFIG.ANON_KEY,
    'Authorization': 'Bearer ' + MSG_CONFIG.ANON_KEY,
    'Prefer': 'return=representation'
  };
}

function getMsgUserId() {
  return localStorage.getItem('macsus_user_id');
}

function getMsgEmail() {
  return localStorage.getItem('macsus_email');
}

function initSupabaseClient() {
  if (_supabaseClient) return _supabaseClient;
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    _supabaseClient = supabase.createClient(MSG_CONFIG.SUPABASE_URL, MSG_CONFIG.ANON_KEY);
  }
  return _supabaseClient;
}

/* ── NAVIGATION ────────────────────────────────────────────── */

async function openMessages() {
  // --- EXIT ANIMATION: animate current page out ---
  var ow = document.getElementById('output-wrapper');
  var isInSession = ow && ow.style.display !== 'none' && ow.classList.contains('visible');

  if (isInSession) {
    await animateSessionOut();
  } else if (currentMode !== null) {
    await animateModeOut(currentMode);
  } else {
    await animateBerandaOut();
  }

  // --- RESET & SHOW MESSAGES ---
  const bv = document.getElementById('beranda-view');
  if (bv) bv.style.display = 'none';
  ['ig-fields', 'gbisnis-fields', 'wa-fields', 'fb-fields', 'tt-fields', 'notes-card', 'error-box'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('visible'); el.style.display = 'none'; }
  });
  if (ow) { anime.remove(ow); ow.querySelectorAll('.output-section, .notes-card-wrapper').forEach(function(s) { anime.remove(s); }); ow.classList.remove('visible'); ow.style.display = ''; ow.style.opacity = ''; ow.style.transform = ''; }
  var ic = document.getElementById('input-container');
  if (ic) ic.style.display = 'none';
  var cp = document.getElementById('chat-page');
  if (cp) cp.style.display = 'none';

  ['akun-page','pengaturan-page'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const page = document.getElementById('messages-page') || document.getElementById('page-pesan');
  if (page) {
    page.style.display = 'flex';
    page.style.opacity = '0';
    page.style.transform = 'translateX(30px)';
  }

  anime({
    targets: page,
    opacity: [0, 1],
    translateX: [30, 0],
    duration: 250,
    easing: 'easeOutCubic'
  });

  updateTopbarTitleCustom('Pesan');
  updateFooterNav(null);
  loadConversations();
}

function openChat(conversationId, otherUserId, otherEmail) {
  _currentConversationId = conversationId;
  var msgsPage = document.getElementById('messages-page') || document.getElementById('page-pesan');
  if (msgsPage) msgsPage.style.display = 'none';

  const page = document.getElementById('chat-page') || document.getElementById('page-chat');
  if (page) {
    page.style.display = 'flex';
    page.style.opacity = '0';
    page.style.transform = 'translateX(30px)';
  }

  const initials = otherEmail ? otherEmail.substring(0, 2).toUpperCase() : '??';
  var chatAvatar = document.getElementById('chat-avatar') || document.getElementById('chat-user-avatar');
  if (chatAvatar) chatAvatar.textContent = initials;

  var chatName = document.getElementById('chat-user-name');
  var chatEmail = document.getElementById('chat-user-email');
  if (chatName) { chatName.textContent = ''; }
  if (chatEmail) { chatEmail.textContent = ''; }

  anime({
    targets: page,
    opacity: [0, 1],
    translateX: [30, 0],
    duration: 250,
    easing: 'easeOutCubic'
  });

  updateTopbarTitleCustom(otherEmail.split('@')[0]);
  loadMessages(conversationId);
  markAsRead(conversationId);
  subscribeToMessages(conversationId);
}

function closeChat() {
  _currentConversationId = null;
  _lastChatMsgId = null;
  unsubscribeMessages();

  const page = document.getElementById('chat-page') || document.getElementById('page-chat');
  if (page) {
    anime({
      targets: page,
      opacity: [1, 0],
      translateX: [0, 30],
      duration: 200,
      easing: 'easeInCubic',
      complete: function() {
        page.style.display = 'none';
      }
    });
  }

  const msgsPage = document.getElementById('messages-page') || document.getElementById('page-pesan');
  if (msgsPage) {
    msgsPage.style.display = 'flex';
    msgsPage.style.opacity = '0';
    msgsPage.style.transform = 'translateX(-30px)';
    anime({
      targets: msgsPage,
      opacity: [0, 1],
      translateX: [-30, 0],
      duration: 250,
      easing: 'easeOutCubic'
    });
  }

  loadConversations();
  updateTopbarTitleCustom('Pesan');
}

function updateTopbarTitleCustom(title) {
  if (typeof animateTitleText === 'function') {
    animateTitleText(title);
  } else {
    var el = document.getElementById('topbar-page-title');
    if (el) { var s = el.querySelector('span'); if (s) s.textContent = title; }
  }
}

/* ── SEARCH USERS ─────────────────────────────────────────── */

let _searchTimeout = null;

function searchUsersForChat(query) {
  clearTimeout(_searchTimeout);
  const resultsEl = document.getElementById('msg-search-results');
  if (!query || query.length < 2) {
    resultsEl.style.display = 'none';
    resultsEl.innerHTML = '';
    return;
  }
  _searchTimeout = setTimeout(async () => {
    const myId = getMsgUserId();
    const email = query.toLowerCase();
    try {
      const res = await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/users?email=ilike.*' + encodeURIComponent(email) + '*&id=neq.' + myId + '&select=id,email&limit=10', {
        headers: getMsgHeaders()
      });
      const users = await res.json();
      if (!res.ok || !Array.isArray(users) || users.length === 0) {
        resultsEl.innerHTML = '<div class="msg-search-empty">Tidak ditemukan user</div>';
        resultsEl.style.display = '';
        return;
      }
      resultsEl.innerHTML = users.map(u => {
        const initials = u.email.substring(0, 2).toUpperCase();
        return '<button class="msg-search-item" onclick="startChatWith(\'' + u.id + '\', \'' + u.email + '\')">' +
          '<div class="msg-avatar-sm">' + initials + '</div>' +
          '<span>' + u.email + '</span>' +
        '</button>';
      }).join('');
      resultsEl.style.display = '';
    } catch (e) {
      console.error('Search error:', e);
    }
  }, 300);
}

async function startChatWith(userId, email) {
  document.getElementById('msg-search-results').style.display = 'none';
  document.getElementById('msg-search-input').value = '';
  const conversationId = await getOrCreateConversation(getMsgUserId(), userId);
  if (!conversationId) {
    alert('Gagal membuat percakapan. Pastikan tabel conversations sudah dibuat di database.');
    return;
  }
  openChat(conversationId, userId, email);
}

/* ── CONVERSATIONS ────────────────────────────────────────── */

async function getOrCreateConversation(user1Id, user2Id) {
  if (!user1Id || !user2Id) return null;
  const sorted = [user1Id, user2Id].sort();
  const a = sorted[0], b = sorted[1];

  try {
    const res = await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/conversations?user1_id=eq.' + a + '&user2_id=eq.' + b + '&select=id', {
      headers: getMsgHeaders()
    });
    if (res.ok) {
      const existing = await res.json();
      if (Array.isArray(existing) && existing.length > 0) return existing[0].id;
    }
  } catch (e) {}

  try {
    const res = await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/conversations', {
      method: 'POST',
      headers: getMsgHeaders(),
      body: JSON.stringify({ user1_id: a, user2_id: b })
    });
    if (res.ok) {
      const created = await res.json();
      if (Array.isArray(created) && created.length > 0) return created[0].id;
    } else {
      console.error('Create conversation failed:', res.status, await res.text());
    }
  } catch (e) {
    console.error('Create conversation error:', e);
  }
  return null;
}

async function loadConversations() {
  const myId = getMsgUserId();
  if (!myId) return;
  const listEl = document.getElementById('msg-conversation-list');
  try {
    const res = await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/conversations?or=(user1_id.eq.' + myId + ',user2_id.eq.' + myId + ')&select=*&order=last_message_at.desc', {
      headers: getMsgHeaders()
    });
    const convos = await res.json();
    if (!res.ok || !Array.isArray(convos) || convos.length === 0) {
      _lastConvoCount = 0;
      listEl.innerHTML = '<div class="msg-empty">Belum ada percakapan.<br>Cari user berdasarkan email untuk memulai chat.</div>';
      return;
    }
    _lastConvoCount = convos.length;

    const otherIds = convos.map(c => c.user1_id === myId ? c.user2_id : c.user1_id);
    const uniqueIds = [...new Set(otherIds)];
    const usersRes = await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/users?id=in.(' + uniqueIds.join(',') + ')&select=id,email', {
      headers: getMsgHeaders()
    });
    const users = await usersRes.json();
    const userMap = {};
    users.forEach(u => userMap[u.id] = u.email);

    const unreadCounts = await getUnreadCounts(myId);

    listEl.innerHTML = convos.map(c => {
      const otherId = c.user1_id === myId ? c.user2_id : c.user1_id;
      const otherEmail = userMap[otherId] || 'Unknown';
      const initials = otherEmail.substring(0, 2).toUpperCase();
      const lastMsg = c.last_message || '—';
      const unread = unreadCounts[c.id] || 0;
      const time = c.last_message_at ? formatMsgTime(c.last_message_at) : '';
      return '<button class="msg-convo-item" onclick="openChat(\'' + c.id + '\', \'' + otherId + '\', \'' + otherEmail + '\')">' +
        '<div class="msg-avatar">' + initials + '</div>' +
        '<div class="msg-convo-info">' +
          '<span class="msg-convo-name">' + otherEmail.split('@')[0] + '</span>' +
          '<div class="msg-convo-preview">' + escapeHtml(lastMsg) + '</div>' +
        '</div>' +
        '<div class="msg-convo-meta">' +
          (unread > 0 ? '<span class="msg-unread-badge">' + unread + '</span>' : '') +
          '<span class="msg-convo-time">' + time + '</span>' +
        '</div>' +
      '</button>';
    }).join('');
  } catch (e) {
    console.error('Load conversations error:', e);
    listEl.innerHTML = '<div class="msg-empty">Gagal memuat percakapan.</div>';
  }
}

async function getUnreadCounts(myId) {
  try {
    const convRes = await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/conversations?or=(user1_id.eq.' + myId + ',user2_id.eq.' + myId + ')&select=id', {
      headers: getMsgHeaders()
    });
    const convos = await convRes.json();
    if (!convRes.ok || !Array.isArray(convos) || convos.length === 0) return {};
    const convIds = convos.map(c => c.id);
    const msgRes = await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/messages?conversation_id=in.(' + convIds.join(',') + ')&sender_id=neq.' + myId + '&read=eq.false&select=conversation_id', {
      headers: getMsgHeaders()
    });
    const unread = await msgRes.json();
    if (!msgRes.ok || !Array.isArray(unread)) return {};
    const counts = {};
    unread.forEach(m => { counts[m.conversation_id] = (counts[m.conversation_id] || 0) + 1; });
    return counts;
  } catch (e) { return {}; }
}

/* ── MESSAGES ─────────────────────────────────────────────── */

async function loadMessages(conversationId) {
  const msgEl = document.getElementById('chat-messages');
  msgEl.innerHTML = '<div class="msg-loading"><i class="fas fa-spinner fa-spin"></i></div>';
  try {
    const res = await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/messages?conversation_id=eq.' + conversationId + '&select=*&order=created_at.asc&limit=200', {
      headers: getMsgHeaders()
    });
    const messages = await res.json();
    if (!res.ok || !Array.isArray(messages)) {
      msgEl.innerHTML = '<div class="msg-empty">Gagal memuat pesan.</div>';
      return;
    }
    renderMessages(messages);
    if (messages.length > 0) {
      _lastChatMsgId = messages[messages.length - 1].id;
    }
    scrollChatToBottom();
  } catch (e) {
    console.error('Load messages error:', e);
    msgEl.innerHTML = '<div class="msg-empty">Gagal memuat pesan.</div>';
  }
}

function renderMessages(messages) {
  const msgEl = document.getElementById('chat-messages');
  const myId = getMsgUserId();
  msgEl.innerHTML = messages.map(m => {
    const isMine = m.sender_id === myId;
    const time = formatMsgTimeShort(m.created_at);
    return '<div class="chat-bubble ' + (isMine ? 'mine' : 'theirs') + '" data-id="' + m.id + '" data-sender="' + m.sender_id + '" onclick="showBubblePopup(event, this)">' +
      '<div class="bubble-text">' + escapeHtml(m.content) + '</div>' +
      '<div class="bubble-time">' + time + '</div>' +
    '</div>';
  }).join('');
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || !_currentConversationId) return;
  input.value = '';
  const myId = getMsgUserId();

  const optimisticId = 'temp_' + Date.now();
  const msgEl = document.getElementById('chat-messages');
  const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const tempHtml = '<div class="chat-bubble mine" id="' + optimisticId + '">' +
    '<div class="bubble-text">' + escapeHtml(text) + '</div>' +
    '<div class="bubble-time">' + time + '</div>' +
  '</div>';
  msgEl.insertAdjacentHTML('beforeend', tempHtml);
  scrollChatToBottom();

  try {
    const res = await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/messages', {
      method: 'POST',
      headers: getMsgHeaders(),
      body: JSON.stringify({
        conversation_id: _currentConversationId,
        sender_id: myId,
        content: text
      })
    });
    const created = await res.json();
    const tempEl = document.getElementById(optimisticId);
    if (tempEl) tempEl.remove();
    if (created && created[0]) {
      appendSingleMessage(created[0]);
      _lastChatMsgId = created[0].id;
    }
  } catch (e) {
    console.error('Send message error:', e);
    const tempEl = document.getElementById(optimisticId);
    if (tempEl) tempEl.remove();
    showToast('Gagal mengirim pesan');
  }

  updateConversationLastMessage(_currentConversationId, text);
}

function appendSingleMessage(m) {
  if (document.querySelector('.chat-bubble[data-id="' + m.id + '"]')) return;
  const msgEl = document.getElementById('chat-messages');
  const myId = getMsgUserId();
  const isMine = m.sender_id === myId;
  const time = formatMsgTimeShort(m.created_at);
  const html = '<div class="chat-bubble ' + (isMine ? 'mine' : 'theirs') + '" data-id="' + m.id + '" data-sender="' + m.sender_id + '" onclick="showBubblePopup(event, this)">' +
    '<div class="bubble-text">' + escapeHtml(m.content) + '</div>' +
    '<div class="bubble-time">' + time + '</div>' +
  '</div>';
  msgEl.insertAdjacentHTML('beforeend', html);
  scrollChatToBottom();
}

/* ── BUBBLE POPUP MENU ────────────────────────────────────── */

let _activeBubblePopup = null;

function showBubblePopup(e, bubbleEl) {
  e.stopPropagation();
  hideBubblePopup();

  const msgId = bubbleEl.dataset.id;
  const senderId = bubbleEl.dataset.sender;
  const myId = getMsgUserId();
  const isMine = senderId === myId;

  const overlay = document.createElement('div');
  overlay.className = 'bubble-popup-overlay';
  overlay.onclick = hideBubblePopup;

  const popup = document.createElement('div');
  popup.className = 'bubble-popup';

  let html = '<button onclick="copyBubbleText(\'' + msgId + '\')"><i class="fas fa-copy"></i> Salin</button>';
  if (isMine) {
    html += '<button class="btn-danger" onclick="deleteBubbleMessage(\'' + msgId + '\')"><i class="fas fa-trash"></i> Hapus</button>';
  }
  popup.innerHTML = html;

  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  const rect = bubbleEl.getBoundingClientRect();
  let top = rect.bottom + 4;
  let left = rect.left;
  if (left + 140 > window.innerWidth) {
    left = window.innerWidth - 140 - 10;
  }
  if (left < 10) left = 10;
  if (top + 80 > window.innerHeight) {
    top = rect.top - 80 - 4;
  }

  popup.style.top = top + 'px';
  popup.style.left = left + 'px';

  _activeBubblePopup = popup;
  requestAnimationFrame(function() { popup.classList.add('show'); });
}

function hideBubblePopup() {
  if (_activeBubblePopup) {
    _activeBubblePopup.classList.remove('show');
    _activeBubblePopup = null;
  }
  const overlay = document.querySelector('.bubble-popup-overlay');
  if (overlay) overlay.remove();
  const oldPopup = document.querySelector('.bubble-popup');
  if (oldPopup) oldPopup.remove();
}

function copyBubbleText(msgId) {
  const bubble = document.querySelector('.chat-bubble[data-id="' + msgId + '"]');
  if (!bubble) return;
  const text = bubble.querySelector('.bubble-text').textContent;
  fallbackCopyText(text).then(function() {
    showToast('Teks disalin');
  });
  hideBubblePopup();
}

function fallbackCopyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(function() {
      return execFallbackCopy(text);
    });
  }
  return execFallbackCopy(text);
}

function execFallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  ta.style.top = '-9999px';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  var ok = document.execCommand('copy');
  document.body.removeChild(ta);
  return ok ? Promise.resolve() : Promise.reject();
}

async function deleteBubbleMessage(msgId) {
  hideBubblePopup();
  try {
    const res = await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/messages?id=eq.' + msgId, {
      method: 'DELETE',
      headers: getMsgHeaders()
    });
    if (res.ok) {
      const bubble = document.querySelector('.chat-bubble[data-id="' + msgId + '"]');
      if (bubble) {
        bubble.style.transition = 'opacity 0.2s, transform 0.2s';
        bubble.style.opacity = '0';
        bubble.style.transform = 'scale(0.8)';
        setTimeout(function() { bubble.remove(); }, 200);
      }
    }
  } catch (e) {
    console.error('Delete message error:', e);
  }
}

async function markAsRead(conversationId) {
  const myId = getMsgUserId();
  try {
    await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/messages?conversation_id=eq.' + conversationId + '&sender_id=neq.' + myId + '&read=eq.false', {
      method: 'PATCH',
      headers: getMsgHeaders(),
      body: JSON.stringify({ read: true })
    });
    updateBadgeCount();
  } catch (e) {}
}

async function updateConversationLastMessage(conversationId, text) {
  try {
    await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/conversations?id=eq.' + conversationId, {
      method: 'PATCH',
      headers: getMsgHeaders(),
      body: JSON.stringify({ last_message: text, last_message_at: new Date().toISOString() })
    });
  } catch (e) {}
}

/* ── REALTIME ─────────────────────────────────────────────── */

function subscribeToMessages(conversationId) {
  unsubscribeMessages();
  const client = initSupabaseClient();
  if (!client) {
    startPolling(conversationId);
    return;
  }
  try {
    _msgChannel = client
      .channel('messages-' + conversationId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: 'conversation_id=eq.' + conversationId
      }, (payload) => {
        const myId = getMsgUserId();
        if (payload.new.sender_id !== myId) {
          appendSingleMessage(payload.new);
          markAsRead(conversationId);
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
        filter: 'conversation_id=eq.' + conversationId
      }, (payload) => {
        const old = payload.old;
        if (old && old.id) {
          const bubble = document.querySelector('.chat-bubble[data-id="' + old.id + '"]');
          if (bubble) {
            bubble.style.transition = 'opacity 0.2s, transform 0.2s';
            bubble.style.opacity = '0';
            bubble.style.transform = 'scale(0.8)';
            setTimeout(function() { bubble.remove(); }, 200);
          }
        }
      })
      .subscribe();
  } catch (e) {
    startPolling(conversationId);
  }
}

function startPolling(conversationId) {
  stopPolling();
  _msgPollInterval = setInterval(() => {
    if (_currentConversationId === conversationId) {
      loadMessages(conversationId);
    }
  }, 3000);
}

function stopPolling() {
  if (_msgPollInterval) { clearInterval(_msgPollInterval); _msgPollInterval = null; }
}

function unsubscribeMessages() {
  stopPolling();
  const client = initSupabaseClient();
  if (_msgChannel && client) {
    client.removeChannel(_msgChannel);
  }
  _msgChannel = null;
}

/* ── BADGE COUNT ──────────────────────────────────────────── */

async function updateBadgeCount() {
  const myId = getMsgUserId();
  if (!myId) return;
  try {
    const convRes = await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/conversations?or=(user1_id.eq.' + myId + ',user2_id.eq.' + myId + ')&select=id', {
      headers: getMsgHeaders()
    });
    const convos = await convRes.json();
    if (!convRes.ok || !Array.isArray(convos) || convos.length === 0) {
      hideBadge();
      return;
    }
    const convIds = convos.map(c => c.id);
    const msgRes = await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/messages?conversation_id=in.(' + convIds.join(',') + ')&sender_id=neq.' + myId + '&read=eq.false&select=id', {
      headers: getMsgHeaders()
    });
    const unread = await msgRes.json();
    const count = unread ? unread.length : 0;
    const countIncreased = !_badgeFirstRun && count > _prevUnreadCount;
    _prevUnreadCount = count;
    _badgeFirstRun = false;

    ['dock-msg-badge', 'pc-sidebar-msg-badge'].forEach(function(id) {
      const badge = document.getElementById(id);
      if (!badge) return;
      if (count > 0) {
        badge.style.display = '';
        if (countIncreased) {
          expandBadge(badge, count);
        } else {
          badge.textContent = count > 99 ? '99+' : count;
          badge.classList.remove('expanded');
        }
      } else {
        badge.style.display = 'none';
        badge.classList.remove('expanded');
      }
    });
  } catch (e) {}
}

function hideBadge() {
  ['dock-msg-badge', 'pc-sidebar-msg-badge'].forEach(function(id) {
    const badge = document.getElementById(id);
    if (badge) {
      badge.style.display = 'none';
      badge.classList.remove('expanded');
    }
  });
}

function expandBadge(badge, count) {
  if (_badgeCollapseTimer) clearTimeout(_badgeCollapseTimer);

  var sidebarBadge = document.getElementById('pc-sidebar-msg-badge');
  if (sidebarBadge) {
    var rect = sidebarBadge.getBoundingClientRect();
    sidebarBadge.textContent = count + ' pesan baru';
    sidebarBadge.style.top = rect.top + 'px';
    sidebarBadge.style.left = rect.left + 'px';
    sidebarBadge.classList.add('expanded');
  }

  var dockBadge = document.getElementById('dock-msg-badge');
  if (dockBadge) {
    dockBadge.textContent = count + ' pesan baru';
    dockBadge.classList.add('expanded');
  }

  _badgeCollapseTimer = setTimeout(function() {
    var sb = document.getElementById('pc-sidebar-msg-badge');
    if (sb) {
      sb.textContent = count > 99 ? '99+' : count;
      sb.classList.remove('expanded');
      sb.style.top = '';
      sb.style.left = '';
    }
    var db = document.getElementById('dock-msg-badge');
    if (db) {
      db.textContent = count > 99 ? '99+' : count;
      db.classList.remove('expanded');
    }
  }, 3000);
}

/* ── SUBSCRIBE GLOBAL (unread dari semua percakapan) ──────── */

function subscribeGlobalMessages() {
  startConvoPolling();
  const client = initSupabaseClient();
  if (!client) return;
  try {
    client
      .channel('global-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const myId = getMsgUserId();
        if (payload.new.sender_id !== myId) {
          if (payload.new.conversation_id === _currentConversationId) {
            appendSingleMessage(payload.new);
            markAsRead(_currentConversationId);
          } else {
            updateBadgeCount();
            var msgsPage = document.getElementById('messages-page') || document.getElementById('page-pesan');
            if (msgsPage && msgsPage.style.display !== 'none') {
              loadConversations();
            }
          }
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const old = payload.old;
        if (old && old.id) {
          const bubble = document.querySelector('.chat-bubble[data-id="' + old.id + '"]');
          if (bubble) {
            bubble.style.transition = 'opacity 0.2s, transform 0.2s';
            bubble.style.opacity = '0';
            bubble.style.transform = 'scale(0.8)';
            setTimeout(function() { bubble.remove(); }, 200);
          }
        }
      })
      .subscribe();
  } catch (e) {}
}

let _lastConvoMsgCount = 0;
let _lastConvoCount = 0;
let _lastChatMsgId = null;
let _prevUnreadCount = 0;
let _badgeCollapseTimer = null;
let _badgeFirstRun = true;

function startConvoPolling() {
  stopConvoPolling();
  _convoPollInterval = setInterval(async () => {
    const myId = getMsgUserId();
    if (!myId) return;
    try {
      const convRes = await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/conversations?or=(user1_id.eq.' + myId + ',user2_id.eq.' + myId + ')&select=id', {
        headers: getMsgHeaders()
      });
      const convos = await convRes.json();
      if (!convRes.ok || !Array.isArray(convos)) return;
      const convIds = convos.map(c => c.id);

      if (convIds.length !== _lastConvoCount) {
        _lastConvoCount = convIds.length;
        updateBadgeCount();
        var msgsPage = document.getElementById('messages-page') || document.getElementById('page-pesan');
        if (msgsPage && msgsPage.style.display !== 'none') {
          loadConversations();
        }
      }

      if (convIds.length === 0) return;
      const msgRes = await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/messages?conversation_id=in.(' + convIds.join(',') + ')&sender_id=neq.' + myId + '&read=eq.false&select=id', {
        headers: getMsgHeaders()
      });
      const unread = await msgRes.json();
      const count = unread ? unread.length : 0;
      if (count !== _lastConvoMsgCount) {
        _lastConvoMsgCount = count;
        updateBadgeCount();
        var msgsPage = document.getElementById('messages-page') || document.getElementById('page-pesan');
        if (msgsPage && msgsPage.style.display !== 'none') {
          loadConversations();
        }
      }
      if (_currentConversationId) {
        const latestRes = await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/messages?conversation_id=eq.' + _currentConversationId + '&select=id&order=created_at.desc&limit=1', {
          headers: getMsgHeaders()
        });
        const latestArr = await latestRes.json();
        if (Array.isArray(latestArr) && latestArr.length > 0 && latestArr[0].id !== _lastChatMsgId) {
          const allRes = await fetch(MSG_CONFIG.SUPABASE_URL + '/rest/v1/messages?conversation_id=eq.' + _currentConversationId + '&select=*&order=created_at.asc', {
            headers: getMsgHeaders()
          });
          const allMsgs = await allRes.json();
          if (Array.isArray(allMsgs)) {
            allMsgs.forEach(m => {
              if (!document.querySelector('.chat-bubble[data-id="' + m.id + '"]') && m.sender_id !== myId) {
                appendSingleMessage(m);
              }
            });
            _lastChatMsgId = allMsgs[allMsgs.length - 1].id;
          }
        }
      }
    } catch (e) {}
  }, 3000);
}

function stopConvoPolling() {
  if (_convoPollInterval) { clearInterval(_convoPollInterval); _convoPollInterval = null; }
}

/* ── HELPERS ──────────────────────────────────────────────── */

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function formatMsgTime(isoStr) {
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffDay === 0) return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  if (diffDay === 1) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function formatMsgTimeShort(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function scrollChatToBottom() {
  const el = document.getElementById('chat-messages');
  if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
}
