/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INDEXEDDB WRAPPER — HistoryDB
 * Replaces localStorage for large data (macsus_history)
 * Unlimited storage vs localStorage 5MB limit
 * ═══════════════════════════════════════════════════════════════════════════
 */

const HistoryDB = (function () {
  const DB_NAME = 'macsus_history_db';
  const DB_VERSION = 1;
  const STORE_NAME = 'keyvalue';
  let dbInstance = null;

  function open() {
    return new Promise((resolve, reject) => {
      if (dbInstance) { resolve(dbInstance); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = (e) => {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async function get(key) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function set(key, value) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async function remove(key) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Migrate data from localStorage to IndexedDB (one-time migration)
   */
  async function migrateFromLocalStorage(key) {
    try {
      const localData = localStorage.getItem(key);
      if (localData !== null) {
        await set(key, JSON.parse(localData));
        localStorage.removeItem(key);
        console.log('✅ Migrated', key, 'from localStorage to IndexedDB');
      }
    } catch (e) {
      console.warn('⚠️ Migration failed for', key, e);
    }
  }

  return { get, set, remove, migrateFromLocalStorage };
})();
