import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function updateUrls() {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    console.log('Updating Posts.image_url...');
    let result = await db.run(`
        UPDATE Posts 
        SET image_url = REPLACE(image_url, 'http://localhost:3000', 'http://localhost:3001')
        WHERE image_url LIKE 'http://localhost:3000%'
    `);
    console.log(`Updated ${result.changes} rows in Posts (image_url)`);

    console.log('Updating Posts.music_url...');
    result = await db.run(`
        UPDATE Posts 
        SET music_url = REPLACE(music_url, 'http://localhost:3000', 'http://localhost:3001')
        WHERE music_url LIKE 'http://localhost:3000%'
    `);
    console.log(`Updated ${result.changes} rows in Posts (music_url)`);

    console.log('Updating Users.profile_image_url...');
    result = await db.run(`
        UPDATE Users 
        SET profile_image_url = REPLACE(profile_image_url, 'http://localhost:3000', 'http://localhost:3001')
        WHERE profile_image_url LIKE 'http://localhost:3000%'
    `);
    console.log(`Updated ${result.changes} rows in Users (profile_image_url)`);
}

updateUrls().catch(console.error);
