import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function verify() {
    console.log('🔍 Checking TiDB Connection...');
    const config = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Connected to TiDB successfully!');

        // 1. Check Tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`\n📋 Found ${tables.length} tables:`);
        tables.forEach(row => console.log(` - ${Object.values(row)[0]}`));

        // 2. Check Users
        const [users] = await connection.execute('SELECT id, username, nickname FROM Users LIMIT 5');
        console.log(`\n👤 Users (Top 5):`);
        if (users.length === 0) console.log("   (No users found)");
        users.forEach(u => console.log(`   [ID: ${u.id}] ${u.nickname} (${u.username})`));

        // 3. Check Posts
        const [posts] = await connection.execute('SELECT id, title, user_id FROM Posts LIMIT 5');
        console.log(`\n🖼️ Posts (Top 5):`);
        if (posts.length === 0) console.log("   (No posts found)");
        posts.forEach(p => console.log(`   [ID: ${p.id}] "${p.title}" (User ID: ${p.user_id})`));

        await connection.end();
    } catch (error) {
        console.error('❌ Database Check Failed:', error.message);
    }
}

verify();
