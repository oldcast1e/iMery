import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkActivityLogs() {
    console.log('🔍 Fetching Activity Logs from TiDB...');
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

        // 1. Recent Notifications (Action Log)
        const [notes] = await connection.execute(`
            SELECT n.type, n.message, n.created_at, u.nickname as receiver 
            FROM Notifications n
            JOIN Users u ON n.user_id = u.id
            ORDER BY n.created_at DESC LIMIT 5
        `);
        console.log(`\n🔔 Recent Notifications (User Actions):`);
        notes.forEach(n => console.log(`   [${n.created_at}] ${n.type}: ${n.message} (to ${n.receiver})`));

        // 2. Recent Comments
        const [comments] = await connection.execute(`
            SELECT c.content, c.created_at, u.nickname as author, p.title as post
            FROM Comments c
            JOIN Users u ON c.user_id = u.id
            JOIN Posts p ON c.post_id = p.id
            ORDER BY c.created_at DESC LIMIT 5
        `);
        console.log(`\n💬 Recent Comments:`);
        comments.forEach(c => console.log(`   [${c.created_at}] ${c.author} on "${c.post}": ${c.content}`));

        await connection.end();
    } catch (error) {
        console.error('❌ Check Failed:', error.message);
    }
}

checkActivityLogs();
