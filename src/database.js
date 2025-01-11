const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "chat.db"));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT,
    message TEXT,
    timestamp TEXT,
    color TEXT,
    fileUrl TEXT NULL,
    fileName TEXT NULL
  )`);
});

module.exports = db;
