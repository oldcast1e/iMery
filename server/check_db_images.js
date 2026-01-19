import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function checkImages() {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    const posts = await db.all('SELECT id, title, image_url FROM Posts');
    console.log('--- Posts Images ---');
    posts.forEach(p => console.log(`[${p.id}] ${p.title}: ${p.image_url}`));

    const users = await db.all('SELECT id, nickname, profile_image_url FROM Users');
    console.log('\n--- Users Profile Images ---');
    users.forEach(u => console.log(`[${u.id}] ${u.nickname}: ${u.profile_image_url}`));
}

checkImages().catch(console.error);
