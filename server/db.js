import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// SQLite-compatible Wrapper for MySQL
class DatabaseWrapper {
  constructor(pool) {
    this.pool = pool;
  }

  async run(sql, params = []) {
    // Convert SQLite '?' params to MySQL '?' params (same)
    // But handle lastID/changes
    const [result] = await this.pool.execute(sql, params);
    return {
      lastID: result.insertId,
      changes: result.affectedRows
    };
  }

  async get(sql, params = []) {
    const [rows] = await this.pool.execute(sql, params);
    return rows[0];
  }

  async all(sql, params = []) {
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }
}

export const initDb = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  console.log('Connecting to TiDB/MySQL...');

  // Test Connection
  await pool.getConnection();
  console.log('Connected to TiDB successfully.');

  // Migration / Schema Sync
  // NOTE: MySQL uses AUTO_INCREMENT instead of AUTOINCREMENT

  // 1. Users
  await pool.execute(`
        CREATE TABLE IF NOT EXISTS Users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE,
            password VARCHAR(255),
            nickname VARCHAR(255),
            profile_image_url TEXT,
            bio TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

  // 2. Posts
  await pool.execute(`
        CREATE TABLE IF NOT EXISTS Posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            title VARCHAR(255),
            artist_name VARCHAR(255),
            image_url TEXT,
            description TEXT,
            ai_summary TEXT,
            music_url TEXT,
            rating INT,
            work_date VARCHAR(50),
            genre VARCHAR(100),
            style VARCHAR(50),
            tags TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES Users(id)
        )
    `);

  // 3. Friendships
  await pool.execute(`
        CREATE TABLE IF NOT EXISTS Friendships (
            id INT AUTO_INCREMENT PRIMARY KEY,
            requester_id INT,
            addressee_id INT,
            status VARCHAR(50) DEFAULT 'PENDING',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(requester_id) REFERENCES Users(id),
            FOREIGN KEY(addressee_id) REFERENCES Users(id)
        )
    `);

  // 4. Likes
  await pool.execute(`
        CREATE TABLE IF NOT EXISTS Likes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            post_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES Users(id),
            FOREIGN KEY(post_id) REFERENCES Posts(id),
            UNIQUE(user_id, post_id)
        )
    `);

  // 5. Comments
  await pool.execute(`
        CREATE TABLE IF NOT EXISTS Comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            post_id INT,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES Users(id),
            FOREIGN KEY(post_id) REFERENCES Posts(id)
        )
    `);

  // 6. Notifications
  await pool.execute(`
        CREATE TABLE IF NOT EXISTS Notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            type VARCHAR(50),
            message TEXT,
            is_read BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES Users(id)
        )
    `);

  // 7. Bookmarks
  await pool.execute(`
        CREATE TABLE IF NOT EXISTS Bookmarks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            post_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES Users(id),
            FOREIGN KEY(post_id) REFERENCES Posts(id),
            UNIQUE(user_id, post_id)
        )
    `);

  // 8. Art Analysis Results
  await pool.execute(`
        CREATE TABLE IF NOT EXISTS art_analysis (
            id INT AUTO_INCREMENT PRIMARY KEY,
            post_id INT,
            genre VARCHAR(255),
            style1 VARCHAR(255),
            score1 FLOAT,
            style2 VARCHAR(255),
            score2 FLOAT,
            style3 VARCHAR(255),
            score3 FLOAT,
            style4 VARCHAR(255),
            score4 FLOAT,
            style5 VARCHAR(255),
            score5 FLOAT,
            image_url TEXT,
            music_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(post_id) REFERENCES Posts(id) ON DELETE CASCADE
        )
    `);

  // --- Schema Updates for Existing Tables (ALTER) ---
  // Because CREATE TABLE IF NOT EXISTS doesn't add missing columns.

  // Users: add profile_image_url, bio
  try { await pool.execute("ALTER TABLE Users ADD COLUMN profile_image_url TEXT"); } catch (e) { }
  try { await pool.execute("ALTER TABLE Users ADD COLUMN bio TEXT"); } catch (e) { }

  // Posts: add work_date, genre, style, tags
  try { await pool.execute("ALTER TABLE Posts ADD COLUMN work_date VARCHAR(50)"); } catch (e) { }
  try { await pool.execute("ALTER TABLE Posts ADD COLUMN genre VARCHAR(100)"); } catch (e) { }
  try { await pool.execute("ALTER TABLE Posts ADD COLUMN style VARCHAR(50)"); } catch (e) { }
  try { await pool.execute("ALTER TABLE Posts ADD COLUMN tags TEXT"); } catch (e) { }
  try { await pool.execute("ALTER TABLE Posts ADD COLUMN analysis_id INT"); } catch (e) { }
  // Use TINYINT(1) for MySQL/TiDB compatibility instead of BOOLEAN
  try { await pool.execute("ALTER TABLE Posts ADD COLUMN is_analyzed TINYINT(1) DEFAULT 0"); } catch (e) { }

  return new DatabaseWrapper(pool);
};
