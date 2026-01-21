// Delete users with plaintext passwords (keep only bcrypt hashed users)
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
    console.log('🔍 Analyzing users...\n');

    // 1. 현재 사용자 목록 조회
    const [allUsers] = await connection.execute('SELECT id, username, password, nickname FROM Users');

    console.log('📊 Current Users:');
    console.table(allUsers.map(u => ({
        id: u.id,
        username: u.username,
        nickname: u.nickname,
        status: u.password.startsWith('$2') ? '✅ HASHED' : '❌ PLAINTEXT'
    })));

    // 2. 평문 비밀번호 사용자 식별 (bcrypt 해시가 아닌 것)
    const plaintextUsers = allUsers.filter(u => !u.password.startsWith('$2'));
    const hashedUsers = allUsers.filter(u => u.password.startsWith('$2'));

    console.log(`\n📋 Summary:`);
    console.log(`   ✅ Hashed users: ${hashedUsers.length}`);
    console.log(`   ❌ Plaintext users: ${plaintextUsers.length}`);

    if (plaintextUsers.length === 0) {
        console.log('\n✅ No plaintext users found. Nothing to delete.');
        process.exit(0);
    }

    console.log('\n🗑️  Users to be deleted:');
    plaintextUsers.forEach(u => {
        console.log(`   - [${u.id}] ${u.username} (${u.nickname})`);
    });

    // 3. 삭제 실행
    console.log('\n⚠️  Starting deletion in 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    for (const user of plaintextUsers) {
        // 관련 데이터도 함께 삭제 (CASCADE) - 테이블이 없으면 무시
        try {
            await connection.execute('DELETE FROM Posts WHERE user_id = ?', [user.id]);
        } catch (e) { if (!e.message.includes("doesn't exist")) throw e; }

        try {
            await connection.execute('DELETE FROM Likes WHERE user_id = ?', [user.id]);
        } catch (e) { if (!e.message.includes("doesn't exist")) throw e; }

        try {
            await connection.execute('DELETE FROM Bookmarks WHERE user_id = ?', [user.id]);
        } catch (e) { if (!e.message.includes("doesn't exist")) throw e; }

        try {
            await connection.execute('DELETE FROM Comments WHERE user_id = ?', [user.id]);
        } catch (e) { if (!e.message.includes("doesn't exist")) throw e; }

        try {
            await connection.execute('DELETE FROM Friends WHERE user_id1 = ? OR user_id2 = ?', [user.id, user.id]);
        } catch (e) { if (!e.message.includes("doesn't exist")) throw e; }

        try {
            await connection.execute('DELETE FROM Notifications WHERE user_id = ?', [user.id]);
        } catch (e) { if (!e.message.includes("doesn't exist")) throw e; }

        await connection.execute('DELETE FROM Users WHERE id = ?', [user.id]);

        console.log(`   ✅ Deleted user ${user.id} (${user.username}) and related data`);
    }

    // 4. 결과 확인
    const [remainingUsers] = await connection.execute('SELECT id, username, nickname FROM Users');

    console.log('\n✅ Deletion complete!\n');
    console.log('📊 Remaining Users:');
    console.table(remainingUsers);

    console.log(`\n🎉 Deleted ${plaintextUsers.length} users with plaintext passwords`);
    console.log(`✅ ${remainingUsers.length} secure user(s) remain`);

} catch (error) {
    console.error('❌ Error:', error.message);
} finally {
    await connection.end();
}
