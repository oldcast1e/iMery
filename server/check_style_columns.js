// Check Posts table schema and style1 field
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true }
});

async function checkStyle1() {
    try {
        // Check table schema
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Posts' AND COLUMN_NAME LIKE 'style%'
            ORDER BY COLUMN_NAME
        `);

        console.log('📋 Posts table style columns:');
        console.table(columns);

        // Check actual data
        const [posts] = await connection.query(`
            SELECT id, title, genre, style, style1, style2, style3, style4, style5 
            FROM Posts 
            LIMIT 5
        `);

        console.log('\n📊 Sample posts with style fields:');
        console.table(posts);

        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkStyle1();
