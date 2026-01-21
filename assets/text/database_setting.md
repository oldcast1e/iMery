## 1. 기본 설정 (Configuration)

- **서버 주소 (Base URL):** `https://art-app-back-server.onrender.com` (배포 시) / `http://localhost:3001` (로컬)
- **통신 방식:** REST API (HTTP)
- **데이터 형식:** JSON
- **인증 방식:** JWT Token (Authorization Header: Bearer <TOKEN>)
  - 로그인 시 Token 발급
  - 클라이언트에서 LocalStorage에 저장 후 요청 시 헤더에 포함

---

## 2. 데이터베이스 스키마 (Database Schema)

프론트엔드에서 다루게 될 데이터의 구조입니다. (현재 SQLite 기준, MySQL 호환)

### 📌 Users (사용자)

| 필드명 | 타입 | 설명 | 비고 |
| :--- | :--- | :--- | :--- |
| `id` | Integer | 사용자 고유 ID | PK, 자동 생성 |
| `username` | String | 로그인 아이디 (이메일) | 중복 불가 |
| `password` | String | 비밀번호 (Hashed) | |
| `nickname` | String | 닉네임 | 화면 표시용 |
| `profile_image_url` | String | 프로필 이미지 URL | **[New]** |
| `bio` | String | 자기소개 | **[New]** |

### 📌 Posts (게시글/작품)

| 필드명 | 타입 | 설명 | 비고 |
| :--- | :--- | :--- | :--- |
| `id` | Integer | 게시글 고유 ID | PK, 자동 생성 |
| `user_id` | Integer | 작성자 ID | FK, Users 참조 |
| `title` | String | 작품 제목 | 필수 |
| `artist_name` | String | 작가 이름 | 선택 (Default: 작가 미상) |
| `image_url` | String | 이미지 주소 (URL) | 필수 |
| `description` | String | 사용자 감상평 | |
| `ai_summary` | String | AI 분석 내용 | 객체 인식 결과 등 |
| `music_url` | String | 배경음악 URL | |
| `rating` | Integer | 별점 | 1~5점 |
| `genre` | String | 장르 (그림, 조각, 사진 등) | **[Sync]** |
| `work_date` | String | 작품 날짜 (YYYY.MM.DD) | **[New]** |
| `created_at` | DateTime | 작성일 | 자동 생성 |

### 📌 Friendships (친구 관계) **[New]**

| 필드명 | 타입 | 설명 | 비고 |
| :--- | :--- | :--- | :--- |
| `id` | Integer | 관계 고유 ID | PK |
| `requester_id` | Integer | 요청자 ID | FK, Users 참조 |
| `addressee_id` | Integer | 수신자 ID | FK, Users 참조 |
| `status` | String | 상태 ('PENDING', 'ACCEPTED') | 기본: PENDING |
| `created_at` | DateTime | 생성일 | |

### 📌 Likes (좋아요) **[New]**

| 필드명 | 타입 | 설명 | 비고 |
| :--- | :--- | :--- | :--- |
| `id` | Integer | 고유 ID | PK |
| `user_id` | Integer | 사용자 ID | FK, Users 참조 |
| `post_id` | Integer | 게시글 ID | FK, Posts 참조 |
| `created_at` | DateTime | 생성일 | |

### 📌 Comments (댓글) **[New]**

| 필드명 | 타입 | 설명 | 비고 |
| :--- | :--- | :--- | :--- |
| `id` | Integer | 고유 ID | PK |
| `user_id` | Integer | 작성자 ID | FK, Users 참조 |
| `post_id` | Integer | 게시글 ID | FK, Posts 참조 |
| `content` | String | 댓글 내용 | |
| `created_at` | DateTime | 생성일 | |

### 📌 Bookmarks (북마크/저장) **[New]**

| 필드명 | 타입 | 설명 | 비고 |
| :--- | :--- | :--- | :--- |
| `id` | Integer | 고유 ID | PK |
| `user_id` | Integer | 사용자 ID | FK, Users 참조 |
| `post_id` | Integer | 게시글 ID | FK, Posts 참조 |
| `created_at` | DateTime | 생성일 | |

### 📌 Notifications (알림) **[New]**

| 필드명 | 타입 | 설명 | 비고 |
| :--- | :--- | :--- | :--- |
| `id` | Integer | 고유 ID | PK |
| `user_id` | Integer | 수신자 ID | FK, Users 참조 |
| `type` | String | 알림 유형 ('like', 'comment', 'work', 'friend_req') | |
| `message` | String | 알림 메시지 | |
| `is_read` | Boolean | 읽음 여부 | 기본: false |
| `created_at` | DateTime | 생성일 | |

---

## 3. API 상세 명세 (API Endpoints)

*(기존 명세 유지 + 소셜 기능 API 추가됨)*

- **친구 요청:** `POST /friends/request`
- **친구 수락:** `PUT /friends/accept`
- **친구 목록:** `GET /friends/:userId`
- **좋아요 토글:** `POST /posts/:id/likes`
- **북마크 토글:** `POST /bookmarks`
- **댓글 작성:** `POST /posts/:id/comments`
- **알림 조회:** `GET /notifications/:userId`
- **통계 조회:** `GET /users/:id/stats`