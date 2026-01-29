import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const SECRET_KEY = 'imery-secret-key'; // In prod, use .env

app.use(cors());
app.use(express.json());
// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request Logging Middleware
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`  └─ Status: ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// AWS S3 Configuration
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'imery';

// Multer S3 Setup
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const extension = path.extname(file.originalname);
            cb(null, `uploads/${Date.now()}-${file.originalname}`);
        }
    })
});

let db;

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

initDb().then(async _db => {
    db = _db;
    // Database initialized in initDb including migrations
    console.log('Database initialized');
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});

// --- Routes ---

// 1. Auth
app.post('/users/signup', async (req, res) => {
    const { username, password, nickname } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.run(
            'INSERT INTO Users (username, password, nickname) VALUES (?, ?, ?)',
            [username, hashedPassword, nickname]
        );
        res.json({ message: '가입 성공', id: result.lastID, nickname });
    } catch (error) {
        res.status(400).json({ detail: '회원가입 실패 (이미 존재하는 ID일 수 있습니다)' });
    }
});

app.post('/users/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM Users WHERE username = ?', [username]);

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
        res.json({
            message: '로그인 성공',
            user_id: user.id,
            nickname: user.nickname,
            token // Send token
        });
    } else {
        res.status(401).json({ detail: '로그인 실패' });
    }
});

// 2. Posts
app.get('/posts/', async (req, res) => {
    const { type, user_id } = req.query; // type: 'community' | 'following'

    try {
        let query = `
            SELECT Posts.*, Posts.is_analyzed, Users.nickname, Users.profile_image_url as user_profile_image,
            (SELECT COUNT(*) FROM Likes WHERE post_id = Posts.id) as like_count,
            (SELECT COUNT(*) FROM Comments WHERE post_id = Posts.id) as comment_count,
            EXISTS (SELECT 1 FROM Likes WHERE post_id = Posts.id AND user_id = ?) as is_liked,
            EXISTS (SELECT 1 FROM Bookmarks WHERE post_id = Posts.id AND user_id = ?) as is_bookmarked
            FROM Posts 
            JOIN Users ON Posts.user_id = Users.id
        `;
        
        // Params management for the subqueries
        // We need 'current_user_id' for is_liked/is_bookmarked checks.
        // The endpoint is public but interactions are user-specific. 
        // If user_id is passed in query (for following feed), use it. Or better, check header?
        // Simple approach: Use query param 'viewer_id' or just reuse 'user_id' if context implies 'viewer'.
        // BUT 'user_id' currently means 'target user for following feed'.
        // Let's expect an optional 'viewer_id' query param for interaction checks.
        
        const viewer_id = req.query.viewer_id || null;
        let params = [viewer_id, viewer_id]; // For the two subqueries

        if (type === 'following') {
            if (!user_id) return res.status(400).json({ detail: 'User ID required for following feed' });
            // Show Public/Friends posts from Friends
            // Note: This requires Friendships table to be fully working.
            query += `
                WHERE Posts.visibility IN ('public', 'friends') 
                AND Posts.user_id IN (
                    SELECT addressee_id FROM Friendships WHERE requester_id = ? AND status = 'ACCEPTED'
                    UNION
                    SELECT requester_id FROM Friendships WHERE addressee_id = ? AND status = 'ACCEPTED'
                )
            `;
            // Improved Friend Logic: Check both directions
            params.push(user_id, user_id);
        } else {
            // Default: Community (Public only)
            query += ` WHERE Posts.visibility = 'public'`;
        }

        query += ` ORDER BY Posts.created_at DESC`;

        const posts = await db.all(query, params);
        res.json({ posts });
    } catch (e) {
        console.error(e);
        res.status(500).json({ detail: 'Failed to fetch posts' });
    }
});

app.get('/users/:id/likes', async (req, res) => {
    const { id } = req.params;
    const likes = await db.all('SELECT post_id FROM Likes WHERE user_id = ?', [id]);
    res.json(likes.map(l => l.post_id));
});

app.post('/posts/', upload.single('image'), async (req, res) => {
    // Supports both Multipart (with file) and JSON (base64 fallback or text only)
    // If file exists, use file path. If not, check body.image_url
    const { user_id, title, artist_name, description, rating, ai_summary, music_url, work_date, genre, tags, style, visibility } = req.body;
    const finalGenre = genre || '그림';
    const finalVisibility = visibility || 'public'; // 'public', 'friends', 'private'
    let image_url = req.body.image_url;

    // Fix: Tags come as JSON string from FormData. Parse it first to avoid double-stringification.
    let finalTags = tags;
    try {
        if (typeof tags === 'string') {
            finalTags = JSON.parse(tags);
        }
    } catch (e) {
        finalTags = [];
    }

    try {
        if (req.file) {
            console.log(`[S3] File uploaded successfully to: ${req.file.location}`);
            image_url = req.file.location;
        } else {
            console.warn('[Multer] No file detected in request. Using image_url from body if provided.');
        }

        const result = await db.run(
            `INSERT INTO Posts (user_id, title, artist_name, image_url, description, rating, ai_summary, music_url, work_date, genre, tags, style, visibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id, 
                title, 
                artist_name, 
                image_url, 
                description || '', 
                rating, 
                ai_summary || null, // Fix: Ensure undefined becomes null
                music_url || null,  // Fix: Ensure undefined becomes null
                work_date || new Date().toISOString().split('T')[0].replace(/-/g, '.'), 
                finalGenre, 
                JSON.stringify(finalTags || []), 
                style || '',
                finalVisibility
            ]
        );
        res.json({ message: '업로드 성공', id: result.lastID });

        // Create Notification (Self-notification? Or notify followers? For now, simple logic)
        await db.run(
            `INSERT INTO Notifications (user_id, type, message) VALUES (?, ?, ?)`,
            [user_id, 'work', `'${title}' 작품이 저장되었습니다.`]
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            detail: '업로드 실패', 
            error: error.message, 
            sql: error.sql, // Optional: if using mysql driver that exposes this
            sqlMessage: error.sqlMessage 
        });
    }
});

app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.run('DELETE FROM Posts WHERE id = ?', [id]);
        // Also delete related? (Likes, Comments) - DB cascading might handle or we leave them.
        // Clean manually to be safe or ignore. sqlite usually needs PRAGMA foreign_keys = ON.
        await db.run('DELETE FROM Likes WHERE post_id = ?', [id]);
        await db.run('DELETE FROM Comments WHERE post_id = ?', [id]);
        res.json({ message: '삭제 성공' });
    } catch (e) {
        res.status(500).json({ detail: '삭제 실패' });
    }
});

// --- Interactions ---

// Toggle Like
app.post('/posts/:id/like', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    try {
        const existing = await db.get('SELECT * FROM Likes WHERE post_id = ? AND user_id = ?', [id, user_id]);
        if (existing) {
            await db.run('DELETE FROM Likes WHERE post_id = ? AND user_id = ?', [id, user_id]);
            res.json({ liked: false });
        } else {
            await db.run('INSERT INTO Likes (post_id, user_id) VALUES (?, ?)', [id, user_id]);
            res.json({ liked: true });
        }
    } catch (e) {
        res.status(500).json({ detail: 'Like failed' });
    }
});

// Toggle Bookmark
app.post('/posts/:id/bookmark', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    try {
        const existing = await db.get('SELECT * FROM Bookmarks WHERE post_id = ? AND user_id = ?', [id, user_id]);
        if (existing) {
            await db.run('DELETE FROM Bookmarks WHERE post_id = ? AND user_id = ?', [id, user_id]);
            res.json({ bookmarked: false });
        } else {
            await db.run('INSERT INTO Bookmarks (post_id, user_id, created_at) VALUES (?, ?, ?)', [id, user_id, new Date().toISOString()]);
            res.json({ bookmarked: true });
        }
    } catch (e) {
        res.status(500).json({ detail: 'Bookmark failed' });
    }
});

// Get Comments
app.get('/posts/:id/comments', async (req, res) => {
    const { id } = req.params;
    try {
        const comments = await db.all(`
            SELECT Comments.*, Users.nickname, Users.profile_image_url 
            FROM Comments 
            JOIN Users ON Comments.user_id = Users.id 
            WHERE post_id = ? 
            ORDER BY created_at ASC
        `, [id]);
        res.json(comments);
    } catch (e) {
        res.status(500).json({ detail: 'Failed to fetch comments' });
    }
});

// Add Comment
app.post('/posts/:id/comments', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;
    try {
        const result = await db.run(
            'INSERT INTO Comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)',
            [id, user_id, content, new Date().toISOString()]
        );
        const newComment = await db.get(`
            SELECT Comments.*, Users.nickname, Users.profile_image_url 
            FROM Comments 
            JOIN Users ON Comments.user_id = Users.id 
            WHERE Comments.id = ?
        `, [result.lastID]);
        res.json(newComment);
    } catch (e) {
        res.status(500).json({ detail: 'Comment failed' });
    }
});

// GET User Profile
app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await db.get('SELECT id, nickname, profile_image_url, bio FROM Users WHERE id = ?', [id]);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ detail: 'User not found' });
        }
    } catch (e) {
        res.status(500).json({ detail: 'Failed to fetch user' });
    }
});

app.put('/posts/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title, artist_name, description, rating, ai_summary, music_url, work_date, genre, tags, style } = req.body;
    const finalGenre = genre || '그림';

    console.log('Updating Post:', id);
    console.log('Genre:', finalGenre);
    console.log('Date:', work_date);

    let image_url = req.body.image_url;

    if (req.file) {
        image_url = req.file.location; // S3 URL
    }

    // Fetch current post to preserve existing values (like ai_summary, music_url)
    let currentPost = {};
    try {
        currentPost = await db.get('SELECT * FROM Posts WHERE id = ?', [id]);
        if (!currentPost) return res.status(404).json({ detail: 'Post not found' });
    } catch (e) {
        return res.status(500).json({ detail: 'Error fetching post' });
    }

    try {
        await db.run(
            `UPDATE Posts SET title=?, artist_name=?, image_url=?, description=?, rating=?, ai_summary=?, music_url=?, work_date=?, genre=?, tags=?, style=? WHERE id=?`,
            [
                title !== undefined ? title : currentPost.title,
                artist_name !== undefined ? artist_name : currentPost.artist_name,
                image_url !== undefined ? image_url : currentPost.image_url,
                description !== undefined ? description : currentPost.description,
                rating !== undefined ? rating : currentPost.rating,
                // Preserve AI Summary & Music URL if they exist in DB but not in request
                ai_summary !== undefined ? ai_summary : currentPost.ai_summary, 
                music_url !== undefined ? music_url : currentPost.music_url,
                work_date !== undefined ? work_date : currentPost.work_date,
                finalGenre !== undefined ? finalGenre : currentPost.genre,
                tags !== undefined ? (tags || '[]') : currentPost.tags,
                style !== undefined ? style : currentPost.style,
                id
            ]
        );
        res.json({ message: '수정 성공' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ detail: '수정 실패' });
    }
});

// Update Profile (Bio & Image)
app.put('/users/profile', upload.single('image'), async (req, res) => {
    // Expects: user_id, bio. Optional: file or image_url
    const { user_id, bio } = req.body;
    let profile_image_url = req.body.image_url;

    if (req.file) {
        profile_image_url = req.file.location; // S3 URL
    }

    try {
        // Construct Dynamic Query
        let query = 'UPDATE Users SET bio = ?';
        let params = [bio];

        if (profile_image_url) {
            query += ', profile_image_url = ?';
            params.push(profile_image_url);
        }

        query += ' WHERE id = ?';
        params.push(user_id);

        await db.run(query, params);

        // Return updated user info
        const updatedUser = await db.get('SELECT id, nickname, profile_image_url, bio FROM Users WHERE id = ?', [user_id]);
        res.json({ message: '프로필 수정 성공', user: updatedUser });
    } catch (e) {
        console.error(e);
        res.status(500).json({ detail: '프로필 수정 실패' });
    }
});

// Change Password
app.put('/users/password', async (req, res) => {
    const { user_id, oldPassword, newPassword } = req.body;
    try {
        const user = await db.get('SELECT password FROM Users WHERE id = ?', [user_id]);
        if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
            return res.status(401).json({ detail: '기존 비밀번호가 일치하지 않습니다.' });
        }

        const hashedIds = await bcrypt.hash(newPassword, 10);
        await db.run('UPDATE Users SET password = ? WHERE id = ?', [hashedIds, user_id]);
        res.json({ message: '비밀번호 변경 성공' });
    } catch (e) {
        res.status(500).json({ detail: '비밀번호 변경 실패' });
    }
});

// Delete Account
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Simple Delete - In real app, consider soft delete or cascading
        await db.run('DELETE FROM Users WHERE id = ?', [id]);
        await db.run('DELETE FROM Posts WHERE user_id = ?', [id]);
        await db.run('DELETE FROM Likes WHERE user_id = ?', [id]);
        await db.run('DELETE FROM Comments WHERE user_id = ?', [id]);
        await db.run('DELETE FROM Bookmarks WHERE user_id = ?', [id]);
        await db.run('DELETE FROM Friendships WHERE requester_id = ? OR addressee_id = ?', [id, id]);

        res.json({ message: '회원 탈퇴 처리되었습니다.' });
    } catch (e) {
        res.status(500).json({ detail: '탈퇴 실패' });
    }
});

// Get User Stats (Followers, Following, Post Count)
app.get('/users/:id/stats', async (req, res) => {
    const { id } = req.params;
    try {
        const postCount = await db.get('SELECT COUNT(*) as count FROM Posts WHERE user_id = ?', [id]);

        const friendCount = await db.get(`
            SELECT COUNT(*) as count FROM Friendships 
            WHERE (requester_id = ? OR addressee_id = ?) AND status = 'ACCEPTED'
        `, [id, id]);

        res.json({
            posts: postCount.count,
            followers: friendCount.count,
            following: friendCount.count
        });
    } catch (e) {
        res.status(500).json({ detail: '통계 조회 실패' });
    }
});

// 3. Social Features

// Search Users
app.get('/users/search', async (req, res) => {
    const { nickname } = req.query;
    if (!nickname) return res.json([]);
    const users = await db.all('SELECT id, nickname FROM Users WHERE nickname LIKE ?', [`%${nickname}%`]);
    res.json(users);
});

// Friend Request
app.post('/friends/request', async (req, res) => {
    const { requester_id, addressee_id } = req.body;
    try {
        await db.run('INSERT INTO Friendships (requester_id, addressee_id) VALUES (?, ?)', [requester_id, addressee_id]);

        // Notify Receiver
        const requester = await db.get('SELECT nickname FROM Users WHERE id = ?', [requester_id]);
        await db.run(
            `INSERT INTO Notifications (user_id, type, message) VALUES (?, ?, ?)`,
            [addressee_id, 'friend_req', `${requester.nickname}님이 친구 요청을 보냈습니다.`]
        );

        res.json({ message: '친구 요청 전송' });
    } catch (e) {
        res.status(400).json({ detail: '이미 요청했거나 친구 상태입니다.' });
    }
});

// Accept Friend
app.put('/friends/accept', async (req, res) => {
    const { id } = req.body; // Friendship ID
    await db.run('UPDATE Friendships SET status = "ACCEPTED" WHERE id = ?', [id]);
    res.json({ message: '친구 수락' });
    // Notify Requester? (Optional)
});

// Get Friends
app.get('/friends/:userId', async (req, res) => {
    const { userId } = req.params;
    const friends = await db.all(`
        SELECT u.id, u.nickname, f.status, f.id as friendship_id, f.requester_id
        FROM Friendships f
        JOIN Users u ON (f.requester_id = u.id OR f.addressee_id = u.id)
        WHERE (f.requester_id = ? OR f.addressee_id = ?) AND u.id != ?
    `, [userId, userId, userId]);
    res.json(friends);
});

// Delete Friend (Unfollow/Cancel)
app.delete('/friends/:id', async (req, res) => {
    const { id } = req.params; // Friendship ID
    try {
        await db.run('DELETE FROM Friendships WHERE id = ?', [id]);
        res.json({ message: '친구가 삭제되었습니다.' });
    } catch (e) {
        res.status(500).json({ detail: '친구 삭제 실패' });
    }
});

// Get Notifications
// 4. Notifications
app.get('/notifications/:userId', async (req, res) => {
    const { userId } = req.params;
    const notes = await db.all('SELECT * FROM Notifications WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(notes);
});

app.delete('/notifications/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.run('DELETE FROM Notifications WHERE id = ?', [id]);
        res.json({ message: '알림 삭제 성공' });
    } catch (e) {
        res.status(500).json({ detail: '알림 삭제 실패' });
    }
});

// Toggle Like
app.post('/posts/:id/likes', async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body; // In real app, get from req.user

    try {
        // Check if liked
        const existing = await db.get('SELECT * FROM Likes WHERE user_id = ? AND post_id = ?', [user_id, id]);

        if (existing) {
            await db.run('DELETE FROM Likes WHERE user_id = ? AND post_id = ?', [user_id, id]);
            res.json({ liked: false });
        } else {
            await db.run('INSERT INTO Likes (user_id, post_id) VALUES (?, ?)', [user_id, id]);

            // Notify Author
            const post = await db.get('SELECT user_id, title FROM Posts WHERE id = ?', [id]);
            if (post.user_id !== user_id) { // Don't notify self
                const liker = await db.get('SELECT nickname FROM Users WHERE id = ?', [user_id]);
                await db.run(
                    `INSERT INTO Notifications (user_id, type, message) VALUES (?, ?, ?)`,
                    [post.user_id, 'like', `${liker.nickname}님이 회원님의 '${post.title}' 작품을 좋아합니다.`]
                );
            }
            res.json({ liked: true });
        }
    } catch (e) {
        res.status(500).json({ detail: '좋아요 처리 실패' });
    }
});


// Toggle Bookmark
app.post('/bookmarks', async (req, res) => {
    const { user_id, post_id } = req.body;
    try {
        const existing = await db.get('SELECT * FROM Bookmarks WHERE user_id = ? AND post_id = ?', [user_id, post_id]);
        if (existing) {
            await db.run('DELETE FROM Bookmarks WHERE user_id = ? AND post_id = ?', [user_id, post_id]);
            res.json({ bookmarked: false });
        } else {
            await db.run('INSERT INTO Bookmarks (user_id, post_id) VALUES (?, ?)', [user_id, post_id]);
            res.json({ bookmarked: true });
        }
    } catch (e) {
        console.error("Bookmark Error:", e);
        res.status(500).json({ detail: '북마크 처리 실패', error: e.message });
    }
});

// GET Comments for a post
app.get('/posts/:id/comments', async (req, res) => {
    const { id } = req.params;
    try {
        const comments = await db.all(`
            SELECT c.*, u.nickname, u.profile_image_url
            FROM Comments c
            JOIN Users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        `, [id]);
        res.json(comments);
    } catch (e) {
        res.status(500).json({ detail: '댓글 조회 실패' });
    }
});

// GET Comments by User (Activity)
app.get('/users/:id/comments', async (req, res) => {
    const { id } = req.params;
    try {
        const comments = await db.all(`
            SELECT c.*, p.title as post_title, p.image_url as post_image, p.artist_name as artist
            FROM Comments c
            JOIN Posts p ON c.post_id = p.id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `, [id]);
        res.json(comments);
    } catch (e) {
        console.error(e);
        res.status(500).json({ detail: '사용자 댓글 조회 실패' });
    }
});

// POST a comment
app.post('/posts/:id/comments', async (req, res) => {
    const { id } = req.params;
    const { user_id, content } = req.body;
    try {
        const result = await db.run('INSERT INTO Comments (user_id, post_id, content) VALUES (?, ?, ?)', [user_id, id, content]);
        
        // Notify Author
        const post = await db.get('SELECT user_id, title FROM Posts WHERE id = ?', [id]);
        if (post.user_id !== user_id) {
            const commenter = await db.get('SELECT nickname FROM Users WHERE id = ?', [user_id]);
            await db.run(
                `INSERT INTO Notifications (user_id, type, message) VALUES (?, ?, ?)`,
                [post.user_id, 'comment', `${commenter.nickname}님이 회원님의 '${post.title}' 작품에 댓글을 남겼습니다.`]
            );
        }
        
        res.json({ message: '댓글 작성 성공', id: result.lastID });
    } catch (e) {
        res.status(500).json({ detail: '댓글 작성 실패' });
    }
});

// Get Bookmarks
app.get('/users/:id/bookmarks', async (req, res) => {
    const { id } = req.params;
    try {
       const bookmarks = await db.all(`
           SELECT b.post_id, b.created_at, p.* 
           FROM Bookmarks b
           JOIN Posts p ON b.post_id = p.id
           WHERE b.user_id = ?
           ORDER BY b.created_at DESC
       `, [id]);
       res.json(bookmarks);
    } catch (e) {
       res.status(500).json({ detail: '북마크 조회 실패' });
    }
});

// 2. Posts (continued)
// RULE: AI analysis uses ONLY Posts.ai_summary field (analysis_id/art_analysis table NOT used)
app.get('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const post = await db.get(`
        SELECT p.*, u.nickname,
        (SELECT COUNT(*) FROM Likes WHERE post_id = p.id) as like_count
        FROM Posts p
        JOIN Users u ON p.user_id = u.id
        WHERE p.id = ?
    `, [id]);
    res.json(post);
});

// AI Analyze Post
// ================================================================================
// CRITICAL RULES:
// 1. This endpoint ONLY returns existing Posts.ai_summary field
// 2. NEVER creates new analysis data
// 3. NEVER modifies existing ai_summary
// 4. If ai_summary exists: return { has_analysis: true, ai_summary: "..." }
// 5. If ai_summary is NULL/empty: return { has_analysis: false, ai_summary: null }
// 6. analysis_id and art_analysis table are NOT used (deprecated)
// ================================================================================
app.post('/posts/:id/analyze', async (req, res) => {
    const { id } = req.params;
    try {
        const post = await db.get('SELECT * FROM Posts WHERE id = ?', [id]);
        if (!post) return res.status(404).json({ detail: 'Post not found' });

        // Check if ai_summary exists
        if (post.ai_summary && post.ai_summary.trim() !== '') {
            console.log(`[Analysis] Returning existing ai_summary for post ${id}`);
            
            // Set is_analyzed flag
            await db.run('UPDATE Posts SET is_analyzed = 1 WHERE id = ? AND is_analyzed = 0', [id]);
            
            // Return ai_summary AND derived style data for UI charts
            return res.json({
                message: 'Analysis available',
                ai_summary: post.ai_summary,
                has_analysis: true,
                // Provide data for UI charts (derived from Posts table)
                result: {
                    genre: post.genre || 'Unknown',
                    styles: [
                        { name: post.style || 'General', score: 0.85 },
                        { name: 'Composition', score: 0.10 },
                        { name: 'Color', score: 0.05 }
                    ]
                }
            });
        }

        // ai_summary does NOT exist - return special status
        console.log(`[Analysis] No ai_summary found for post ${id}`);
        return res.json({
            message: 'Analysis not available',
            ai_summary: null,
            has_analysis: false
        });

    } catch (e) {
        console.error('[Analysis Error]', e);
        res.status(500).json({ detail: 'AI 분석 실패' });
    }
});

// --- FOLDERS ---

// Get User Folders
app.get('/users/:id/folders', async (req, res) => {
    const { id } = req.params;
    try {
        // Return folders with item count
        const folders = await db.all(`
            SELECT f.*, COUNT(fi.post_id) as item_count
            FROM Folders f
            LEFT JOIN FolderItems fi ON f.id = fi.folder_id
            WHERE f.user_id = ?
            GROUP BY f.id
            ORDER BY f.created_at DESC
        `, [id]);
        res.json(folders);
    } catch (e) {
        res.status(500).json({ detail: '폴더 목록 조회 실패' });
    }
});

// Create Folder (and optionally add items)
app.post('/folders', async (req, res) => {
    const { user_id, name, post_ids } = req.body; // post_ids is array
    try {
        const result = await db.run('INSERT INTO Folders (user_id, name) VALUES (?, ?)', [user_id, name]);
        const folderId = result.lastID;

        if (post_ids && Array.isArray(post_ids) && post_ids.length > 0) {
            for (const pid of post_ids) {
                await db.run('INSERT INTO FolderItems (folder_id, post_id) VALUES (?, ?)', [folderId, pid]);
            }
        }
        res.json({ message: '폴더 생성 성공', id: folderId });
    } catch (e) {
        res.status(500).json({ detail: '폴더 생성 실패', error: e.message });
    }
});

// Get Folder Items
app.get('/folders/:id/items', async (req, res) => {
    const { id } = req.params;
    try {
        const items = await db.all(`
            SELECT p.* 
            FROM FolderItems fi
            JOIN Posts p ON fi.post_id = p.id
            WHERE fi.folder_id = ?
            ORDER BY fi.created_at DESC
        `, [id]);
        res.json(items);
    } catch (e) {
        res.status(500).json({ detail: '폴더 내용 조회 실패' });
    }
});