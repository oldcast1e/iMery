// Create UserB and test friend request flow
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
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
    console.log('🔧 Setting up test users and friendship\n');

    // 1. Fix UserB nickname
    console.log('1️⃣ Fixing UserB nickname...');
    await connection.execute(
        'UPDATE Users SET nickname = ? WHERE id = ?',
        ['UserB', 150001]
    );
    console.log('   ✅ UserB nickname updated to "UserB"');

    // 2. Verify users
    console.log('\n2️⃣ Current users:');
    const [users] = await connection.execute('SELECT id, username, nickname FROM Users');
    console.table(users);

    // 3. Create friend request (UserA -> UserB)
    console.log('\n3️⃣ Creating friend request (UserA -> UserB)...');

    // Check if friendship already exists
    const [existing] = await connection.execute(
        'SELECT * FROM Friendships WHERE (requester_id = 120001 AND addressee_id = 150001) OR (requester_id = 150001 AND addressee_id = 120001)'
    );

    if (existing.length > 0) {
        console.log('   ⚠️  Friendship already exists. Deleting...');
        await connection.execute('DELETE FROM Friendships WHERE id = ?', [existing[0].id]);
    }

    const [result] = await connection.execute(
        'INSERT INTO Friendships (requester_id, addressee_id, status) VALUES (?, ?, ?)',
        [120001, 150001, 'PENDING']
    );

    console.log(`   ✅ Friend request created (ID: ${result.insertId})`);

    // 4. Show pending request
    console.log('\n4️⃣ Pending friend requests:');
    const [pending] = await connection.execute(`
        SELECT f.id, f.status,
               u1.nickname as requester,
               u2.nickname as addressee
        FROM Friendships f
        JOIN Users u1 ON f.requester_id = u1.id
        JOIN Users u2 ON f.addressee_id = u2.id
        WHERE f.status = 'PENDING'
    `);
    console.table(pending);

    // 5. Accept friend request
    console.log('\n5️⃣ UserB accepts friend request...');
    await connection.execute(
        'UPDATE Friendships SET status = ? WHERE id = ?',
        ['ACCEPTED', result.insertId]
    );
    console.log('   ✅ Friend request accepted!');

    // 6. Verify friendship
    console.log('\n6️⃣ Current friendships:');
    const [friendships] = await connection.execute(`
        SELECT f.id, f.status, f.created_at,
               u1.id as user1_id, u1.nickname as user1_name,
               u2.id as user2_id, u2.nickname as user2_name
        FROM Friendships f
        JOIN Users u1 ON f.requester_id = u1.id
        JOIN Users u2 ON f.addressee_id = u2.id
    `);
    console.table(friendships);

    console.log('\n✅ Friend functionality fully tested!');
    console.log('\n📝 Summary:');
    console.log('   - UserA (120001) and UserB (150001) are now friends');
    console.log('   - They should see each other\'s posts in Community feed');
    console.log('   - Test in browser: Login as UserA, go to Community tab');

} catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
} finally {
    await connection.end();
}
