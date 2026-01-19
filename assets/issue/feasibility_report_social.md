# Social & Community Features Feasibility Report

**Date:** 2026-01-16
**Status:** Requires Backend Upgrade

## 1. Feasibility Assessment (판단 결과)

Current backend (`art-app-back-server`) only supports basic **User Authentication** and **Post CRUD**.
The requested features (Friends, Community Interactions) **cannot be implemented** with the current backend.

### Missing Capabilities:
-   **Database**: No tables for `Friendships`, `Likes`, `Comments`, `Notifications`.
-   **API**: No endpoints for friend requests, searching users, liking, or commenting.

## 2. Development Plan (Development Roadmpa)

To implement these features, the Backend must be updated first.

### Phase 1: Backend Upgrade (Required)

#### 2.1 Database Schema Changes
Add the following tables:
```sql
-- Friendships
CREATE TABLE Friendships (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES Users(id),
    addressee_id INTEGER REFERENCES Users(id),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, ACCEPTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Likes
CREATE TABLE Likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id),
    post_id INTEGER REFERENCES Posts(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments
CREATE TABLE Comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id),
    post_id INTEGER REFERENCES Posts(id),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE Notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id), -- Recipient
    type VARCHAR(20), -- FRIEND_REQ, LIKE, COMMENT
    message, TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.2 API Endpoints Implementation
-   **Friends**:
    -   `GET /users/search?nickname={query}`: Search users.
    -   `POST /friends/request`: Send friend request.
    -   `PUT /friends/{id}/accept`: Accept request.
    -   `GET /friends`: List all friends.
-   **Community**:
    -   `POST /posts/{id}/likes`: Toggle like.
    -   `POST /posts/{id}/comments`: Add comment.
    -   `GET /posts/feed`: Get posts from friends (or filter existing list).
-   **Notifications**:
    -   `GET /notifications`: Get user notifications.

### Phase 2: Frontend Implementation (React)

Once Phase 1 is complete (or mocked), frontend work can proceed:

1.  **Friend Management UI**:
    -   Add "Find Friends" search bar in My Page.
    -   Create "Friend List" and "Request Box" components.
2.  **Community UI**:
    -   Update `WorksList` card to show Like/Comment buttons.
    -   Create `CommentSection` component in `WorkDetailView`.
3.  **Notification System**:
    -   Connect existing `NotificationPanel` to real `GET /notifications` API.
    -   Implement polling or WebSocket for real-time updates.

## 3. Recommendation (제안)

Since I do not have direct access to modify the Backend Server code, I recommend:

1.  **Request Backend Update**: Send this plan to the backend developer.
2.  **Alternative (Mock Mode)**: If you want to see the **UI/UX only**, I can implement a "Mock Mode" using `localStorage` to simulate these features entirely on the client side. This will not work across different devices/users but will demonstrate the design.
