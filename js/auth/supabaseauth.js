/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUPABASE AUTHENTICATION SERVICE
 * File: js/auth/supabaseAuth.js
 * 
 * Handles:
 * - User registration
 * - User login
 * - User logout
 * - Auto-login on refresh
 * - Token management
 * - Cache management
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────

const SUPABASE_CONFIG = {
  PROJECT_URL: 'https://spybvczjfixwsfbvmdol.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNweWJ2Y3pqZml4d3NmYnZtZG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5ODg0NjEsImV4cCI6MjA5NDU2NDQ2MX0.7siuN3HPprF6eRJU7FgylTIlx-hspUvqxPwHwqJRJ4I'
};

// Cache keys
const CACHE_KEYS = {
  USER_ID: 'macsus_user_id',
  EMAIL: 'macsus_email',
  SESSION_ID: 'macsus_session_id',
  AUTH_TOKEN: 'macsus_auth_token',
  REFRESH_TOKEN: 'macsus_refresh_token',
  DEVICE_ID: 'macsus_device_id',
  CACHE_TIMESTAMP: 'macsus_cache_ts'
};

// ─────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────

/**
 * Generate a simple device ID (browser fingerprint)
 */
function generateDeviceId() {
  const existing = localStorage.getItem(CACHE_KEYS.DEVICE_ID);
  if (existing) return existing;
  
  const id = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem(CACHE_KEYS.DEVICE_ID, id);
  return id;
}

/**
 * SHA-256 pure JS implementation — works on HTTP (no Web Crypto needed)
 * Fallback-safe: tries crypto.subtle first, falls back to pure JS
 */
async function hashPassword(password, email = '') {
  const salt = 'macsus_salt_v1_' + (email || 'default');
  const input = password + salt;

  // Try Web Crypto first (HTTPS / localhost)
  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // fall through to pure JS
    }
  }

  // Pure JS SHA-256 (works on HTTP / local IP)
  return sha256PureJS(input);
}

/**
 * Pure JavaScript SHA-256 — no browser API required
 */
function sha256PureJS(message) {
  const K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ];
  const H = [
    0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,
    0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19
  ];

  // Pre-processing
  const bytes = [];
  for (let i = 0; i < message.length; i++) {
    const c = message.charCodeAt(i);
    if (c < 128) {
      bytes.push(c);
    } else if (c < 2048) {
      bytes.push((c >> 6) | 192, (c & 63) | 128);
    } else {
      bytes.push((c >> 12) | 224, ((c >> 6) & 63) | 128, (c & 63) | 128);
    }
  }
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push((bitLen / Math.pow(2, i * 8)) & 0xff);

  const words = [];
  for (let i = 0; i < bytes.length; i += 4) {
    words.push((bytes[i] << 24) | (bytes[i+1] << 16) | (bytes[i+2] << 8) | bytes[i+3]);
  }

  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  const add  = (...args) => args.reduce((a, b) => (a + b) >>> 0);

  for (let i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16);
    for (let j = 16; j < 64; j++) {
      const s0 = rotr(w[j-15], 7) ^ rotr(w[j-15], 18) ^ (w[j-15] >>> 3);
      const s1 = rotr(w[j-2], 17) ^ rotr(w[j-2], 19)  ^ (w[j-2] >>> 10);
      w[j] = add(w[j-16], s0, w[j-7], s1);
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let j = 0; j < 64; j++) {
      const S1   = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch   = (e & f) ^ (~e & g);
      const temp1 = add(h, S1, ch, K[j], w[j]);
      const S0   = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj  = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = add(S0, maj);
      h = g; g = f; f = e; e = add(d, temp1);
      d = c; c = b; b = a; a = add(temp1, temp2);
    }
    H[0] = add(H[0], a); H[1] = add(H[1], b);
    H[2] = add(H[2], c); H[3] = add(H[3], d);
    H[4] = add(H[4], e); H[5] = add(H[5], f);
    H[6] = add(H[6], g); H[7] = add(H[7], h);
  }
  return H.map(x => x.toString(16).padStart(8, '0')).join('');
}

/**
 * Generate unique session ID
 */
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Generate JWT-like token for auth
 */
function generateAuthToken() {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    iss: 'macsus-ai',
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
    iat: Math.floor(Date.now() / 1000),
    type: 'auth'
  }));
  return `${header}.${payload}`;
}

/**
 * Generate refresh token
 */
function generateRefreshToken() {
  const payload = btoa(JSON.stringify({
    iss: 'macsus-ai',
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
    iat: Math.floor(Date.now() / 1000),
    type: 'refresh'
  }));
  return `refresh_${payload}`;
}

// ─────────────────────────────────────────────────────────────────────────
// AUTHENTICATION FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────

/**
 * REGISTER - Create new user account
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{success: boolean, user_id: string, error?: string}>}
 */
async function registerUser(email, password) {
  try {
    // Client-side validation
    if (!email || !password) {
      return { success: false, error: 'Email dan password tidak boleh kosong' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Format email tidak valid' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password minimal 6 karakter' };
    }

    // Hash password (client-side for demo, should be server-side in production)
    // IMPORTANT: Pass email to ensure consistent salt for this user
    const passwordHash = await hashPassword(password, email);

    // Call Supabase API to insert user
    const response = await fetch(
      `${SUPABASE_CONFIG.PROJECT_URL}/rest/v1/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_CONFIG.ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_CONFIG.ANON_KEY}`
        },
        body: JSON.stringify({
          email: email,
          password_hash: passwordHash,
          is_active: true
        })
      }
    );

    if (!response.ok) {
      try {
        const errData = await response.json();
        const errorMsg = errData?.message || 'Email sudah terdaftar atau error lainnya';
        return { success: false, error: errorMsg };
      } catch (e) {
        return { success: false, error: 'Email sudah terdaftar atau error lainnya' };
      }
    }

    // Try to get user ID from response
    let userId = null;
    try {
      const data = await response.json();
      userId = data[0]?.id || data?.id;
    } catch (e) {
      // Response might be empty - that's ok, we'll query for the ID
    }

    // If we don't have userId from response, query the database to get it
    if (!userId) {
      try {
        const queryResponse = await fetch(
          `${SUPABASE_CONFIG.PROJECT_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=id`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_CONFIG.ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_CONFIG.ANON_KEY}`
            }
          }
        );

        if (queryResponse.ok) {
          const queryData = await queryResponse.json();
          userId = queryData[0]?.id;
        }
      } catch (e) {
        console.warn('Could not query user ID, but registration succeeded');
      }
    }

    // Generate session tokens
    const sessionId = generateSessionId();
    const authToken = generateAuthToken();
    const refreshToken = generateRefreshToken();

    // Save to cache (use email as fallback if no userId)
    if (userId) {
      localStorage.setItem(CACHE_KEYS.USER_ID, userId);
    }
    localStorage.setItem(CACHE_KEYS.EMAIL, email);
    localStorage.setItem(CACHE_KEYS.SESSION_ID, sessionId);
    localStorage.setItem(CACHE_KEYS.AUTH_TOKEN, authToken);
    localStorage.setItem(CACHE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, new Date().toISOString());

    return { 
      success: true, 
      user_id: userId || email,
      message: 'Akun berhasil dibuat! Selamat datang di Macsus AI' 
    };

  } catch (error) {
    console.error('Register error:', error);
    return { success: false, error: 'Gagal registrasi: ' + error.message };
  }
}

/**
 * LOGIN - Authenticate user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{success: boolean, user_id: string, error?: string}>}
 */
async function loginUser(email, password) {
  try {
    // Client-side validation
    if (!email || !password) {
      return { success: false, error: 'Email dan password tidak boleh kosong' };
    }

    // Hash password (must use same email for consistent salt)
    const passwordHash = await hashPassword(password, email);

    // Fetch user from Supabase
    const response = await fetch(
      `${SUPABASE_CONFIG.PROJECT_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=id,email,password_hash,is_active`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_CONFIG.ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_CONFIG.ANON_KEY}`
        }
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Gagal menghubungi server' };
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      return { success: false, error: 'Email tidak terdaftar' };
    }

    const user = data[0];

    // Check if user is active
    if (!user.is_active) {
      return { success: false, error: 'Akun ini sudah dinonaktifkan' };
    }

    // ⚠️ SECURITY WARNING: Password comparison should be on server-side!
    // This is a demo. In production, use proper authentication.
    if (user.password_hash !== passwordHash) {
      return { success: false, error: 'Password salah' };
    }

    // Update last_login
    await fetch(
      `${SUPABASE_CONFIG.PROJECT_URL}/rest/v1/users?id=eq.${user.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_CONFIG.ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_CONFIG.ANON_KEY}`
        },
        body: JSON.stringify({ last_login: new Date().toISOString() })
      }
    ).catch(err => console.log('Update last_login failed:', err));

    // Generate tokens
    const sessionId = generateSessionId();
    const authToken = generateAuthToken();
    const refreshToken = generateRefreshToken();

    // Save to cache
    localStorage.setItem(CACHE_KEYS.USER_ID, user.id);
    localStorage.setItem(CACHE_KEYS.EMAIL, email);
    localStorage.setItem(CACHE_KEYS.SESSION_ID, sessionId);
    localStorage.setItem(CACHE_KEYS.AUTH_TOKEN, authToken);
    localStorage.setItem(CACHE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, new Date().toISOString());

    return { 
      success: true, 
      user_id: user.id,
      message: 'Login berhasil! Selamat datang kembali'
    };

  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Gagal login: ' + error.message };
  }
}

/**
 * LOGOUT - Clear all caches and logout user (⚠️ TELITI)
 * @returns {Promise<{success: boolean}>}
 */
async function logoutUser() {
  try {
    // Clear auth data from localStorage
    localStorage.removeItem(CACHE_KEYS.USER_ID);
    localStorage.removeItem(CACHE_KEYS.EMAIL);
    localStorage.removeItem(CACHE_KEYS.SESSION_ID);
    localStorage.removeItem(CACHE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(CACHE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(CACHE_KEYS.CACHE_TIMESTAMP);
    localStorage.removeItem(CACHE_KEYS.DEVICE_ID);
    localStorage.removeItem('macsus_history');

    sessionStorage.clear();

    console.log('✅ Logout berhasil');
    return { success: true, message: 'Logout berhasil' };

  } catch (error) {
    console.error('Logout error:', error);
    return { success: true, message: 'Logout berhasil (partial)' };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// AUTO-LOGIN & SESSION MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────

/**
 * CHECK AUTH STATUS - Verify if user is logged in
 * @returns {boolean} true if user has valid cache
 */
function isUserLoggedIn() {
  const userId = localStorage.getItem(CACHE_KEYS.USER_ID);
  const authToken = localStorage.getItem(CACHE_KEYS.AUTH_TOKEN);
  return !!(userId && authToken);
}

/**
 * GET CURRENT USER - Retrieve logged-in user info
 * @returns {object|null} User object or null
 */
function getCurrentUser() {
  if (!isUserLoggedIn()) return null;

  return {
    user_id: localStorage.getItem(CACHE_KEYS.USER_ID),
    email: localStorage.getItem(CACHE_KEYS.EMAIL),
    session_id: localStorage.getItem(CACHE_KEYS.SESSION_ID),
    auth_token: localStorage.getItem(CACHE_KEYS.AUTH_TOKEN),
    timestamp: localStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP)
  };
}

/**
 * VALIDATE AUTH TOKEN - Check if token is still valid
 * @returns {boolean}
 */
function isAuthTokenValid() {
  const token = localStorage.getItem(CACHE_KEYS.AUTH_TOKEN);
  if (!token) return false;

  try {
    // Decode JWT-like token
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const payload = JSON.parse(atob(parts[1]));
    const expTime = payload.exp * 1000; // Convert to ms
    const now = Date.now();

    return now < expTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

/**
 * REFRESH TOKEN - Get new auth token using refresh token
 * @returns {Promise<boolean>} true if refresh successful
 */
async function refreshAuthToken() {
  try {
    const refreshToken = localStorage.getItem(CACHE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) return false;

    // In production, send refresh_token to server to get new auth_token
    // For now, just generate new token
    const newAuthToken = generateAuthToken();
    localStorage.setItem(CACHE_KEYS.AUTH_TOKEN, newAuthToken);

    return true;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
}

/**
 * AUTO-LOGIN - Called on app startup
 * @returns {Promise<{isLoggedIn: boolean, user?: object}>}
 */
async function autoLogin() {
  try {
    // Check if user has cache
    if (!isUserLoggedIn()) {
      return { isLoggedIn: false };
    }

    // Check if token is still valid
    if (isAuthTokenValid()) {
      const user = getCurrentUser();
      console.log('✅ Auto-login successful:', user.email);
      return { isLoggedIn: true, user };
    }

    // Try to refresh token
    if (await refreshAuthToken()) {
      const user = getCurrentUser();
      console.log('✅ Token refreshed, auto-login successful');
      return { isLoggedIn: true, user };
    }

    // Token expired and refresh failed
    console.log('⚠️ Token expired, manual login required');
    return { isLoggedIn: false };

  } catch (error) {
    console.error('Auto-login error:', error);
    return { isLoggedIn: false };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// EXPORT FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────

// Make functions available globally (if not using modules)
if (typeof window !== 'undefined') {
  window.supabaseAuth = {
    registerUser,
    loginUser,
    logoutUser,
    isUserLoggedIn,
    getCurrentUser,
    isAuthTokenValid,
    refreshAuthToken,
    autoLogin,
    CACHE_KEYS
  };
}

// For ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    isUserLoggedIn,
    getCurrentUser,
    isAuthTokenValid,
    refreshAuthToken,
    autoLogin,
    CACHE_KEYS
  };
}
