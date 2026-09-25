import Database from "better-sqlite3";

export function createDb(path: string): Database.Database {
  const db = new Database(path);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      done INTEGER NOT NULL DEFAULT 0,
      due_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS error_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fingerprint TEXT NOT NULL UNIQUE,
      message TEXT NOT NULL,
      payload TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 1,
      first_seen TEXT NOT NULL DEFAULT (datetime('now')),
      last_seen TEXT NOT NULL DEFAULT (datetime('now')),
      github_issue_number INTEGER
    );
  `);

  return db;
}
