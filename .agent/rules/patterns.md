# iMery Architecture Patterns

## activeView Routing (Frontend)

Instead of traditional routing, we use a top-level `activeView` state in `App.jsx`.

```javascript
// App.jsx
const [activeView, setActiveView] = useState("home");

// Component rendering
{
  activeView === "home" && <HomeView onNavigate={setActiveView} />;
}
{
  activeView === "workDetail" && (
    <WorkDetailView work={selectedWork} onBack={() => setActiveView("home")} />
  );
}
```

## AI Analysis Flow

AI analysis involves RunPod (image) and Gemini (audio/summary).

```javascript
// Workflow in server/index.js
app.post("/analyze/:id", async (req, res) => {
  // 1. Get image from S3 URL
  // 2. Call RunPod API for style scores
  // 3. Call Gemini API for AI summary and audio prompt
  // 4. Update database (is_analyzed = 1)
  // 5. Return result to frontend
});
```

## S3 Image Upload Pattern

We use `multer-s3` for direct uploads to AWS.

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

## LocalStorage State Persistence

Use `useLocalStorage` for user sessions and local settings.

```javascript
const [user, setUser] = useLocalStorage("imery-user", null);
const [folders, setFolders] = useLocalStorage(`imery-folders-${user?.id}`, []);
```
