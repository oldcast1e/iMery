// Test Friend Functionality
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true }
});

try {
    console.log('🔍 Testing Friend Functionality\n');

    // 1. Check Friendships table structure
    console.log('📋 Friendships Table Structure:');
    const [columns] = await connection.execute('DESCRIBE Friendships');
    console.table(columns);

    // 2. Check current friendships
    console.log('\n📊 Current Friendships:');
    const [friendships] = await connection.execute(`
        SELECT f.*, 
               u1.nickname as requester_name,
               u2.nickname as addressee_name
        FROM Friendships f
        LEFT JOIN Users u1 ON f.requester_id = u1.id
        LEFT JOIN Users u2 ON f.addressee_id = u2.id
    `);

    if (friendships.length === 0) {
        console.log('   (No friendships found)');
    } else {
        console.table(friendships);
    }

    // 3. Check Users table
    console.log('\n👥 Available Users:');
    const [users] = await connection.execute('SELECT id, username, nickname FROM Users');
    console.table(users);

    console.log('\n✅ Friend functionality test complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Create UserB account via signup API');
    console.log('   2. UserA sends friend request to UserB');
    console.log('   3. UserB accepts the request');
    console.log('   4. Check if friendship appears in community feed');

} catch (error) {
    console.error('❌ Error:', error.message);
} finally {
    await connection.end();
}
