---
name: backend-patterns
description: Backend architecture patterns, API design, and server-side best practices for iMery (Node.js, Express, MySQL/TiDB).
---

# iMery Backend Development Patterns

## Express.js API Structure

iMery uses a centralized `index.js` for routing.

```javascript
// ✅ Route grouping in index.js
app.post('/auth/login', async (req, res) => { ... });
app.get('/posts', async (req, res) => { ... });
app.post('/posts', upload.single('image'), async (req, res) => { ... });
```

## Database Patterns (MySQL/TiDB)

We use `mysql2` with `db.js` for initialization and schema management.

### Prepared Statements

ALWAYS use `?` placeholders to prevent SQL injection.

```javascript
// ✅ GOOD
const [results] = await db.execute("SELECT * FROM Posts WHERE user_id = ?", [
  userId,
]);

// ❌ BAD
const [results] = await db.execute(
  `SELECT * FROM Posts WHERE user_id = ${userId}`,
);
```

### Schema Initialization (`db.js`)

The database is automatically initialized on server start.

```javascript
const schema = `
CREATE TABLE IF NOT EXISTS Users ( ... );
CREATE TABLE IF NOT EXISTS Posts ( ... );
`;
await connection.query(schema);
```

## Authentication (JWT & bcryptjs)

- **bcryptjs**: Used for hashing passwords before saving to DB.
- **jsonwebtoken**: Used for generating tokens upon login.

```javascript
const token = jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: "24h" },
);
```

## AI Integration Workflow

### RunPod & Gemini Integration

The `/analyze/:id` endpoint orchestrates multiple external APIs.

1. **Input**: Image URL from S3.
2. **Step 1**: Call RunPod for style identification.
3. **Step 2**: Call Gemini for AI summary and audio prompt generation.
4. **Step 3**: Update the `Posts` table with analysis results.

## File Uploads (S3)

We use `multer-s3` to upload directly to AWS.

```javascript
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET,
    key: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});
```
