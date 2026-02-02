# 📡 iMery API Documentation (v2.6)

> **Base URL**: `http://localhost:3001` (Development) / `https://art-app-back-server.onrender.com` (Production)
> **Auth**: Bearer Token (JWT) in Header

---

## 1. 📊 Statistics & Analysis (I-Record)

### **Get User Taste Analysis**

returns aggregate data for the I-Record dashboard.

- **Endpoint**: `GET /users/:id/stats/analysis`
- **Auth**: Required
- **Response**:

```json
{
  "genres": [
    { "genre": "Realism", "count": 12 },
    { "genre": "Impressionism", "count": 8 }
  ],
  "styles": [
    { "style": "Oil Painting", "count": 15 },
    { "style": "Sketch", "count": 5 }
  ],
  "artists": [
    { "label": "Vincent van Gogh", "count": 4 },
    { "label": "Claude Monet", "count": 2 }
  ],
  "activity": [
    { "date": "2024-02-01", "count": 3 },
    { "date": "2024-02-02", "count": 1 }
  ]
}
```

---

## 2. 🖼️ Posts & Feed

### **Get Posts (Feed)**

Fetch posts with filtering.

- **Endpoint**: `GET /posts/`
- **Query Params**:
  - `type`: `community` | `following`
  - `viewer_id`: (Required) Current user ID for interaction checks (like/bookmark status).
  - `user_id`: (Optional) Target user filter.
- **Response**:

```json
{
  "posts": [
    {
      "id": 101,
      "title": "Starry Night",
      "image_url": "https://s3.aws.com/...",
      "is_liked": true,
      "is_bookmarked": false,
      "like_count": 42
    }
  ]
}
```

### **Create Post**

Upload new artwork.

- **Endpoint**: `POST /posts/`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `image`: File
  - `title`, `artist_name`, `description`: String
  - `tags`: JSON String (e.g. `["Cool", "Blue"]`)
  - `genre`, `style`: String

---

## 3. 🎫 Exhibitions (Tickets)

### **Get User Exhibitions**

Fetch list of visited exhibitions (Tickets).

- **Endpoint**: `GET /users/:id/exhibitions`
- **Response**: List of exhibition objects including `bg_color`, `review`, and `representative_image`.

---

## 4. 🔐 Authentication

### **Login**

- **Endpoint**: `POST /users/login`
- **Body**: `{ "username": "...", "password": "..." }`
- **Response**: `{ "token": "jwt...", "user_id": 1, "nickname": "..." }`

### **Signup**

- **Endpoint**: `POST /users/signup`
- **Body**: `{ "username": "...", "password": "...", "nickname": "..." }`

---

## 5. ⚠️ Error Handling

- **401 Unauthorized**: Invalid or missing Token.
- **404 Not Found**: Resource does not exist.
- **500 Internal Server Error**: Check server logs (usually DB or S3 issue).
