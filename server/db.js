import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export const initDb = async () => {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      nickname TEXT
    );

    CREATE TABLE IF NOT EXISTS Posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      artist_name TEXT,
      image_url TEXT,
      description TEXT,
      ai_summary TEXT,
      music_url TEXT,
      rating INTEGER,
      work_date TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES Users(id)
    );

    CREATE TABLE IF NOT EXISTS Friendships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_id INTEGER,
      addressee_id INTEGER,
      status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(requester_id) REFERENCES Users(id),
      FOREIGN KEY(addressee_id) REFERENCES Users(id)
    );

    CREATE TABLE IF NOT EXISTS Likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      post_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES Users(id),
      FOREIGN KEY(post_id) REFERENCES Posts(id),
      UNIQUE(user_id, post_id)
    );

    CREATE TABLE IF NOT EXISTS Comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      post_id INTEGER,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES Users(id),
      FOREIGN KEY(post_id) REFERENCES Posts(id)
    );

    CREATE TABLE IF NOT EXISTS Notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT,
      message TEXT,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES Users(id)
    );

    CREATE TABLE IF NOT EXISTS Bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      post_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES Users(id),
      FOREIGN KEY(post_id) REFERENCES Posts(id),
      UNIQUE(user_id, post_id)
    );
  `);

  // Migration for existing tables (safe to run multiple times)
  try {
    await db.exec("ALTER TABLE Users ADD COLUMN profile_image_url TEXT");
  } catch (e) { /* Column likely exists */ }

  try {
    await db.exec("ALTER TABLE Users ADD COLUMN bio TEXT");
  } catch (e) { /* Column likely exists */ }

  try {
    await db.exec("ALTER TABLE Posts ADD COLUMN work_date TEXT");
  } catch (e) { /* Column likely exists */ }

  try {
    await db.exec("ALTER TABLE Posts ADD COLUMN category TEXT");
  } catch (e) { /* Column likely exists */ }

  return db;
};
