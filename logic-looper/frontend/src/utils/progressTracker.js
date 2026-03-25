// IndexedDB Progress Tracker
const DB_NAME = 'logicLooperDB';
const DB_VERSION = 1;
const STORE_NAME = 'puzzleProgress';

let db = null;

export const initProgressDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'date' });
        store.createIndex('date', 'date', { unique: true });
      }
    };
  });
};

export const savePuzzleProgress = (date, progress) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('DB not initialized'));
      return;
    }

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const dateStr = new Date(date).toISOString().split('T')[0];

    const progressData = {
      date: dateStr,
      solved: progress.solved,
      timeElapsed: progress.timeElapsed,
      hintsUsed: progress.hintsUsed,
      score: progress.score,
      timestamp: Date.now(),
      solution: progress.solution
    };

    const request = store.put(progressData);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(progressData);
  });
};

export const getPuzzleProgress = (date) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('DB not initialized'));
      return;
    }

    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const dateStr = new Date(date).toISOString().split('T')[0];

    const request = store.get(dateStr);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const getAllProgressData = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('DB not initialized'));
      return;
    }

    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const getStreakData = () => {
  return new Promise((resolve, reject) => {
    getAllProgressData()
      .then((data) => {
        if (!data || data.length === 0) {
          resolve({ streak: 0, lastDate: null });
          return;
        }

        // Sort by date descending
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        let streak = 0;
        let currentDate = new Date();
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

        for (const progress of sorted) {
          const progressDate = new Date(progress.date);
          const expectedDate = new Date(currentDate);
          expectedDate.setDate(expectedDate.getDate() - streak);

          if (progressDate.getTime() === expectedDate.getTime() && progress.solved) {
            streak++;
          } else {
            break;
          }
        }

        resolve({ streak, lastDate: sorted[0]?.date });
      })
      .catch(reject);
  });
};
