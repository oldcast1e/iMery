## 1. 기본 설정 (Configuration)

- **서버 주소 (Base URL):** `https://art-app-back-server.onrender.com`
- **통신 방식:** REST API (HTTP)
- **데이터 형식:** JSON
- **인증 방식:** 별도의 토큰 없이, 로그인 시 발급받은 `user_id`를 사용하여 인증합니다.

---

## 2. 데이터베이스 스키마 (Database Schema)

프론트엔드에서 다루게 될 데이터의 구조입니다.

### 📌 Users (사용자)

| 필드명 | 타입 | 설명 | 비고 |
| :--- | :--- | :--- | :--- |
| `id` | Integer | 사용자 고유 ID | PK, 자동 생성 |
| `username` | String | 로그인 아이디 | 중복 불가 |
| `password` | String | 비밀번호 | |
| `nickname` | String | 닉네임 | 화면 표시용 |

### 📌 Posts (게시글)

| 필드명 | 타입 | 설명 | 비고 |
| :--- | :--- | :--- | :--- |
| `id` | Integer | 게시글 고유 ID | PK, 자동 생성 |
| `user_id` | Integer | 작성자 ID | FK, Users 테이블 참조 |
| `title` | String | 작품 제목 | 필수 |
| `artist_name` | String | 작가 이름 | 선택 (Default: 작가 미상) |
| `image_url` | String | 이미지 주소 (URL) | 필수 |
| `description` | String | 사용자 감상평 | 사용자가 쓴 리뷰 |
| `ai_summary` | String | AI 분석 내용 | 객체 인식 결과 등 |
| `music_url` | String | 배경음악 URL | 생성된 음악 링크 |
| `rating` | Integer | 별점 | 1~5점 |
| `created_at` | DateTime | 작성일 | 자동 생성 |

---

## 3. API 상세 명세 (API Endpoints)

### ✅ 1. 회원가입 (Sign Up)

- **URL:** `/users/signup`
- **Method:** `POST`
- **Request Body:**

{
  "username": "artlover",
  "password": "securepassword",
  "nickname": "Picasso"
}

Response (200 OK):

{
  "message": "가입 성공",
  "id": 1,
  "nickname": "Picasso"
}

### ✅ 2. 로그인 (Login)
URL: /users/login
Method: POST
Request Body:

{
  "username": "artlover",
  "password": "securepassword"
}
Response (200 OK):
🚨 중요: 로그인 성공 시 받은 user_id를 앱 내부에 저장해야 글을 쓸 수 있습니다.

{
  "message": "로그인 성공",
  "user_id": 1,
  "nickname": "Picasso"
}

### ✅ 3. 게시글 작성 (Create Post)
URL: /posts/
Method: POST
Request Body:

{
  "user_id": 1,                       // (필수) 로그인한 유저 ID
  "title": "별이 빛나는 밤",          // (필수)
  "image_url": "[https://imgur.com/](https://imgur.com/)...", // (필수)
  "artist_name": "고흐",
  "description": "밤하늘의 색감이 너무 아름다워서 감동적이다.",
  "ai_summary": "소용돌이치는 밤하늘과 노란 별들이 특징적인 인상파 작품...",
  "music_url": "[https://cdn.suno.ai/music_file.mp3](https://cdn.suno.ai/music_file.mp3)",
  "rating": 5
}
Response (200 OK):

{
  "message": "업로드 성공",
  "id": 24
}

### ✅ 4. 피드 조회 (Get Feed)
URL: /posts/
Method: GET
Response (200 OK):

{
  "posts": [
    {
      "id": 24,
      "user_id": 1,
      "nickname": "Picasso",       // 작성자 닉네임이 포함됨
      "title": "별이 빛나는 밤",
      "artist_name": "고흐",
      "image_url": "[https://imgur.com/](https://imgur.com/)...",
      "description": "밤하늘의 색감이...",
      "ai_summary": "소용돌이치는...",
      "music_url": "[https://cdn.suno.ai/](https://cdn.suno.ai/)...",
      "rating": 5,
      "created_at": "2026-01-15T12:00:00"
    },
    { ... }
  ]
}