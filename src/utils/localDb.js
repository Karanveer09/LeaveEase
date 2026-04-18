const DB_KEY = 'leave_app_demo_db';

const getDb = () => {
  const dbStr = localStorage.getItem(DB_KEY);
  if (!dbStr) {
    const initDb = { 
      users: [], 
      leaves: [], 
      substitutionRequests: [], 
      holidays: [], 
      timetableOverrides: [] 
    };
    localStorage.setItem(DB_KEY, JSON.stringify(initDb));
    return initDb;
  }
  return JSON.parse(dbStr);
};

const saveDb = (db) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const localCollection = (name) => {
  return {
    getAll: () => {
      const db = getDb();
      return db[name] || [];
    },
    getById: (id) => {
      const db = getDb();
      return (db[name] || []).find(doc => doc._id === id);
    },
    add: (doc) => {
      const db = getDb();
      const newDoc = { _id: crypto.randomUUID(), ...doc };
      if (!db[name]) db[name] = [];
      db[name].push(newDoc);
      saveDb(db);
      return newDoc;
    },
    addWithId: (id, doc) => {
      const db = getDb();
      const newDoc = { _id: id, ...doc };
      if (!db[name]) db[name] = [];
      db[name].push(newDoc);
      saveDb(db);
      return newDoc;
    },
    update: (id, updates) => {
      const db = getDb();
      if (!db[name]) return null;
      const idx = db[name].findIndex(doc => doc._id === id);
      if (idx !== -1) {
        db[name][idx] = { ...db[name][idx], ...updates };
        saveDb(db);
        return db[name][idx];
      }
      return null;
    },
    delete: (id) => {
      const db = getDb();
      if (!db[name]) return false;
      const idx = db[name].findIndex(doc => doc._id === id);
      if (idx !== -1) {
        db[name].splice(idx, 1);
        saveDb(db);
        return true;
      }
      return false;
    },
    setAll: (docs) => {
      const db = getDb();
      db[name] = docs;
      saveDb(db);
    }
  };
};
