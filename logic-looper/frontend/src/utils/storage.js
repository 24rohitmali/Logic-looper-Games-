// IndexedDB utilities for offline storage
const DB_NAME = 'LogicLooper';
const DB_VERSION = 1;

let db = null;

export const initDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      if (!database.objectStoreNames.contains('puzzles')) {
        database.createObjectStore('puzzles', { keyPath: 'id' });
      }
      
      if (!database.objectStoreNames.contains('progress')) {
        database.createObjectStore('progress', { keyPath: 'date' });
      }
      
      if (!database.objectStoreNames.contains('user')) {
        database.createObjectStore('user', { keyPath: 'id' });
      }
    };
  });
};

export const savePuzzle = async (puzzle) => {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['puzzles'], 'readwrite');
    const store = transaction.objectStore('puzzles');
    const request = store.put(puzzle);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(puzzle);
  });
};

export const getPuzzle = async (id) => {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['puzzles'], 'readonly');
    const store = transaction.objectStore('puzzles');
    const request = store.get(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const saveProgress = async (date, progress) => {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['progress'], 'readwrite');
    const store = transaction.objectStore('progress');
    const request = store.put({ date, ...progress });
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(progress);
  });
};

export const getProgress = async (date) => {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['progress'], 'readonly');
    const store = transaction.objectStore('progress');
    const request = store.get(date);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
};

export const saveUser = async (user) => {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['user'], 'readwrite');
    const store = transaction.objectStore('user');
    const request = store.put(user);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(user);
  });
};

export const getUser = async () => {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['user'], 'readonly');
    const store = transaction.objectStore('user');
    const request = store.get('current');
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
};
