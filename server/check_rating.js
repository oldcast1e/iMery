import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkRatings() {
    console.log('🔍 Checking Post Ratings...');
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

        // Fetch posts, ordered by ID desc (newest first, or assuming user edited a recent one)
        // Since we don't have updated_at, checking all usually helps or sorting by ID.
        const [posts] = await connection.execute('SELECT id, title, rating, artist_name FROM Posts ORDER BY id DESC LIMIT 10');

        console.log(`\n⭐ Latest Posts Ratings:`);
        posts.forEach(p => {
            console.log(`   [ID: ${p.id}] "${p.title}" (Artist: ${p.artist_name}) => Rating: ${p.rating}`);
        });

        await connection.end();
    } catch (error) {
        console.error('❌ Check Failed:', error.message);
    }
}

checkRatings();
