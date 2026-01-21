// Update username for user id = 1
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
    console.log('🔄 Updating username for user id = 1...');

    // Update username
    const [updateResult] = await connection.execute(
        'UPDATE Users SET username = ? WHERE id = ?',
        ['jiyoonheo@test.com', 1]
    );

    console.log('✅ Update complete:', updateResult);

    // Verify the change
    const [rows] = await connection.execute(
        'SELECT id, username, nickname FROM Users WHERE id = ?',
        [1]
    );

    console.log('\n📊 Updated user data:');
    console.table(rows);

} catch (error) {
    console.error('❌ Error:', error.message);
} finally {
    await connection.end();
}
