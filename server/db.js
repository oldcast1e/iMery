import mysql from "mysql2/promise";
import dotenv from "dotenv";
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
      changes: result.affectedRows,
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
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  console.log("Connecting to TiDB/MySQL...");

  // Test Connection
  await pool.getConnection();
  console.log("Connected to TiDB successfully.");

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

  // 8. Art Analysis Results (DEPRECATED - Removed)
  await pool.execute('DROP TABLE IF EXISTS art_analysis');

  // 9. Folders
  await pool.execute(`
        CREATE TABLE IF NOT EXISTS Folders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            name VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES Users(id)
        )
    `);

  // 10. Folder Items
  await pool.execute(`
        CREATE TABLE IF NOT EXISTS FolderItems (
            id INT AUTO_INCREMENT PRIMARY KEY,
            folder_id INT,
            post_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(folder_id) REFERENCES Folders(id) ON DELETE CASCADE,
            FOREIGN KEY(post_id) REFERENCES Posts(id) ON DELETE CASCADE
        )
    `);

  // 11. Exhibitions (NEW)
  await pool.execute(`
      CREATE TABLE IF NOT EXISTS Exhibitions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          name VARCHAR(255),
          visit_date VARCHAR(50),
          location VARCHAR(255),
          review TEXT,
          rating FLOAT DEFAULT 0,
          bg_color VARCHAR(20),
          representative_post_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES Users(id),
          FOREIGN KEY(representative_post_id) REFERENCES Posts(id)
      )
  `);

  // --- Schema Updates for Existing Tables (ALTER) ---
  // Because CREATE TABLE IF NOT EXISTS doesn't add missing columns.

  // Users: add profile_image_url, bio
  try {
    await pool.execute("ALTER TABLE Users ADD COLUMN profile_image_url TEXT");
  } catch (e) {}
  try {
    await pool.execute("ALTER TABLE Users ADD COLUMN bio TEXT");
  } catch (e) {}

  // Posts: add work_date, genre, style, tags
  try {
    await pool.execute("ALTER TABLE Posts ADD COLUMN work_date VARCHAR(50)");
  } catch (e) {}
  try {
    await pool.execute("ALTER TABLE Posts ADD COLUMN genre VARCHAR(100)");
  } catch (e) {}
  try {
    await pool.execute("ALTER TABLE Posts ADD COLUMN style VARCHAR(50)");
  } catch (e) {}
  try {
    await pool.execute("ALTER TABLE Posts ADD COLUMN tags TEXT");
  } catch (e) {}
  try {
    await pool.execute("ALTER TABLE Posts ADD COLUMN analysis_id INT");
  } catch (e) {}
  // Use TINYINT(1) for MySQL/TiDB compatibility instead of BOOLEAN
  try {
    await pool.execute(
      "ALTER TABLE Posts ADD COLUMN is_analyzed TINYINT(1) DEFAULT 0",
    );
  } catch (e) {}
  try {
    await pool.execute(
      "ALTER TABLE Posts ADD COLUMN visibility VARCHAR(20) DEFAULT 'public'",
    );
  } catch (e) {}

  // Folders: add color
  try {
    await pool.execute("ALTER TABLE Folders ADD COLUMN color VARCHAR(20)");
  } catch (e) {}

  // Posts: add location columns
  try {
    await pool.execute(
      "ALTER TABLE Posts ADD COLUMN location_country VARCHAR(100)",
    );
  } catch (e) {}
  try {

    await pool.execute("ALTER TABLE Exhibitions ADD COLUMN director VARCHAR(255)");
  } catch (e) {}
  try {
    await pool.execute("ALTER TABLE Exhibitions ADD COLUMN cast_members VARCHAR(255)");
  } catch (e) {}
  try {
    await pool.execute("ALTER TABLE Exhibitions ADD COLUMN visit_time VARCHAR(50)");
  } catch (e) {}
  try {
    await pool.execute(
      "ALTER TABLE Posts ADD COLUMN location_province VARCHAR(100)",
    );
  } catch (e) {}
  try {
    await pool.execute(
      "ALTER TABLE Posts ADD COLUMN location_city VARCHAR(100)",
    );
  } catch (e) {
    console.error("Migration error (location_city):", e.message);
  }
  try {
    await pool.execute(
      "ALTER TABLE Posts ADD COLUMN location_district VARCHAR(100)",
    );
  } catch (e) {
    console.error("Migration error (location_district):", e.message);
  }

  // Posts: Linking to Exhibitions
  try {
    await pool.execute("ALTER TABLE Posts ADD COLUMN exhibition_id INT");
  } catch (e) {}
  
  // Posts: NFC Support (v2.7)
  try {
    await pool.execute("ALTER TABLE Posts ADD COLUMN price VARCHAR(50)");
  } catch (e) {}
  try {
    await pool.execute("ALTER TABLE Posts ADD COLUMN source VARCHAR(50) DEFAULT 'manual'");
  } catch (e) {}

  // Exhibitions: Ensure columns exist (if table existed previously without them)
  try {
    await pool.execute("ALTER TABLE Exhibitions ADD COLUMN user_id INT");
  } catch (e) {}
  try {
    await pool.execute("ALTER TABLE Exhibitions ADD COLUMN name VARCHAR(255)");
  } catch (e) {}
  // Fix for 'title' column error (legacy column?)
  try {
      await pool.execute("ALTER TABLE Exhibitions MODIFY COLUMN title VARCHAR(255) DEFAULT NULL");
  } catch(e) {}
  try {
    await pool.execute(
      "ALTER TABLE Exhibitions ADD COLUMN representative_post_id INT",
    );
  } catch (e) {}
  try {
    await pool.execute(
      "ALTER TABLE Exhibitions ADD COLUMN bg_color VARCHAR(20)",
    );
  } catch (e) {}
  try {
    await pool.execute(
      "ALTER TABLE Exhibitions ADD COLUMN rating FLOAT DEFAULT 0",
    );
  } catch (e) {}
  try {
    await pool.execute("ALTER TABLE Exhibitions ADD COLUMN review TEXT");
  } catch (e) {}
  try {
    await pool.execute(
      "ALTER TABLE Exhibitions ADD COLUMN visit_date VARCHAR(50)",
    );
  } catch (e) {}
  try {
    await pool.execute(
      "ALTER TABLE Exhibitions ADD COLUMN location VARCHAR(255)",
    );
  } catch (e) {}
  try {
    await pool.execute(
      "ALTER TABLE Exhibitions ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    );
  } catch (e) {}

  // New Columns for v2.5
  try {
    await pool.execute("ALTER TABLE Exhibitions ADD COLUMN director VARCHAR(100)");
  } catch (e) {}
  try {
    await pool.execute("ALTER TABLE Exhibitions ADD COLUMN cast_members VARCHAR(255)");
  } catch (e) {} // 'cast' is reserved keyword in some SQL, safer to use cast_members

  // Migration: Fix White BG Colors
  try {
    const whiteColors = ['#FFFFFF', '#ffffff', '#FFF', '#fff', 'white'];
    const placeHolder = whiteColors.map(() => '?').join(',');
    // Update to a safe default (e.g., Paper Color #EAD5B7) or Random? 
    // Let's use #EAD5B7 (Warm Paper) as a safe fallback for existing valid tickets
    await pool.execute(
      `UPDATE Exhibitions SET bg_color = '#EAD5B7' WHERE bg_color IN (${placeHolder}) OR bg_color IS NULL`,
      [...whiteColors]
    );
  } catch (e) {
      console.error("BG Color Fix failed:", e);
  }

  // Migration: Set default location for existing posts without location
  // Requirement: Korea/Seoul/Gwangjin-gu
    // Migration: Set default location for existing posts without location
    try {
        await pool.execute(`
            UPDATE Posts 
            SET location_country = '대한민국', 
                location_province = '서울특별시', 
                location_district = '광진구' 
            WHERE location_country IS NULL
        `);
        console.log("Migrated existing posts to default location.");
    } catch (e) {
        console.error("Migration failed:", e);
    }

    // Migration V2: Smart Exhibition Creation
    // 1. Find posts without exhibition_id OR posts linked to the "Default Sejong" exhibition (to fix '2024.01.01' issue)
    try {
        const defaultName = "세종뮤지엄갤러리";
        const hardcodedDate = "2024.01.01";
        
        // Find ID of the hardcoded default exhibition if it exists
        const [defaultExhibitions] = await pool.execute(
            "SELECT id FROM Exhibitions WHERE name = ? AND visit_date = ?", 
            [defaultName, hardcodedDate]
        );
        
        const defaultExhibitionIds = defaultExhibitions.map(e => e.id);
        
        let query = "SELECT id, user_id, work_date, image_url, title FROM Posts WHERE exhibition_id IS NULL";
        if (defaultExhibitionIds.length > 0) {
            query += ` OR exhibition_id IN (${defaultExhibitionIds.join(',')})`;
        }

        const [postsToMigrate] = await pool.execute(query);

        if (postsToMigrate.length > 0) {
            console.log(`Found ${postsToMigrate.length} posts to migrate/fix exhibitions.`);
            
            // Group by User + Date
            const postsGrouped = {};
            for (const p of postsToMigrate) {
                // Use work_date or fall back to created_at date or hardcoded if absolutely missing
                let dateKey = p.work_date || hardcodedDate; 
                // Normalize date key to ensure consistency
                dateKey = dateKey.replace(/-/g, '.');
                
                const key = `${p.user_id}_${dateKey}`;
                if (!postsGrouped[key]) {
                    postsGrouped[key] = {
                        userId: p.user_id,
                        date: dateKey,
                        posts: []
                    };
                }
                postsGrouped[key].posts.push(p);
            }

            for (const key in postsGrouped) {
                const group = postsGrouped[key];
                const userId = group.userId;
                const visitDate = group.date; // Use existing Work Date!
                const defaultAddress = "서울특별시 광진구 능동로 209 세종대학교 대양AI센터";

                // Check/Create Exhibition for this specific date
                let exId = null;
                const [existing] = await pool.execute(
                    "SELECT id FROM Exhibitions WHERE user_id = ? AND name = ? AND visit_date = ? LIMIT 1",
                    [userId, defaultName, visitDate]
                );

                if (existing.length > 0) {
                    exId = existing[0].id;
                } else {
                    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
                    const [res] = await pool.execute(
                        "INSERT INTO Exhibitions (user_id, name, visit_date, location, review, bg_color, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [
                            userId,
                            defaultName,
                            visitDate, // REAL DATE
                            defaultAddress,
                            "나의 전시 기록",
                            randomColor,
                            new Date(),
                        ],
                    );
                    exId = res.insertId;
                }

                // Update Posts
                for (const post of group.posts) {
                    await pool.execute(
                        "UPDATE Posts SET exhibition_id = ? WHERE id = ?",
                        [exId, post.id]
                    );
                }
                
                // Set Representative Post
                const [exInfo] = await pool.execute(
                    "SELECT representative_post_id FROM Exhibitions WHERE id = ?",
                    [exId],
                );
                 if (!exInfo[0].representative_post_id && group.posts.length > 0) {
                    await pool.execute(
                        "UPDATE Exhibitions SET representative_post_id = ? WHERE id = ?",
                        [group.posts[0].id, exId],
                    );
                }
            }
            
            // Clean up empty default exhibitions (the '2024.01.01' ones if they are now empty)
            if (defaultExhibitionIds.length > 0) {
                 await pool.execute(`DELETE FROM Exhibitions WHERE id IN (${defaultExhibitionIds.join(',')}) AND (SELECT COUNT(*) FROM Posts WHERE exhibition_id = Exhibitions.id) = 0`);
            }
        }
    } catch (e) {
        console.error("Exhibition Migration V2 failed:", e);
    }

  return new DatabaseWrapper(pool);
};
