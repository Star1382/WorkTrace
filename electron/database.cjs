const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

let db = null;

function initDatabase() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'worktrace.db');
  
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  
  console.log('Database initialized at:', dbPath);
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

module.exports = { initDatabase, getDb };
