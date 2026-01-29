# 📘 Art App API Integration Guide (v2.0)

> **⚠️ 핵심 주의사항 (Critical Warning)**
> "이미지가 Localhost로 저장되는 문제"를 방지하기 위해, 반드시 아래 Base URL을 사용해야 합니다.
> 과거에 사용하던 **3001번 포트(Node.js 등 구버전 서버)를 절대 사용하지 마세요.**

## 1. 서버 접속 정보 (Base URL)

개발 환경에 따라 아래 두 가지 주소 중 하나를 선택하여 `const BASE_URL`을 설정하세요.

| 환경 (Environment)                 | Base URL                                   | 특징                                                                      |
| :--------------------------------- | :----------------------------------------- | :------------------------------------------------------------------------ |
| **✅ 1. 배포 서버 (Production)**   | `https://art-app-back-server.onrender.com` | **권장.** 언제 어디서든 접속 가능 (S3 저장됨)                             |
| **✅ 2. 로컬 파이썬 서버 (Local)** | `http://127.0.0.1:8000`                    | 내 컴퓨터에서 uvicorn 실행 시 (S3 저장됨)                                 |
| **❌ 3. 구버전 서버 (Legacy)**     | `http://localhost:3001`                    | **절대 사용 금지.** 이미지가 서버 로컬 경로로 저장되어 외부에서 접근 불가 |

---

## 2. 데이터 흐름 요약 (Workflow)

모든 이미지는 백엔드를 거쳐 **AWS S3**에 저장되며, 클라이언트는 S3 URL(`https://bucket...`)을 응답받습니다.

1.  **로그인** (`POST /users/login`) 👉 `user_id` 획득 (로컬 스토리지 저장 필수)
2.  **게시글 업로드** (`POST /posts/`) 👉 이미지 파일 전송 👉 서버가 S3 업로드 후 URL을 DB에 저장
3.  **목록 조회** (`GET /posts/`) 👉 S3 URL이 포함된 JSON 수신
4.  **AI 분석** (`POST /.../analyze`) 👉 S3 이미지를 Gemini가 분석
5.  **음악 생성** (`POST /.../music`) 👉 분석 텍스트 기반 프롬프트 생성

---

## 3. API 상세 명세 (Endpoints)

### 🔐 1. 인증 (Authentication)

#### **로그인 (Login)**

- **URL**: `/users/login`
- **Method**: `POST`
- **Body**:

```json
{
  "username": "myuser",
  "password": "mypassword"
}
```

- **Response (200 OK)**:
  > 🚨 **중요**: 응답받은 `user_id`를 반드시 저장하세요. 글 작성 시 필요합니다.

```json
{
  "message": "로그인 성공",
  "user_id": 1,
  "nickname": "Vincent"
}
```

### 🖼️ 2. 게시글 (Posts & Upload)

#### **게시글 목록 조회 (Fetch Feed)**

- **URL**: `/posts/`
- **Method**: `GET`
- **URL**: `/posts/?type={community|following}&user_id={id}&viewer_id={id}`
- **Method**: `GET`
- **Query Params**:
  - `type`: `community` (전체 공개 글) 또는 `following` (친구 글)
  - `user_id`: (Optional) 특정 유저 필터링
  - `viewer_id`: (Required for Like/Bookmark status) 현재 보고 있는 유저 ID
- **Response**:
  모든 image_url은 `https://{bucket}.s3...` 형식이어야 정상입니다.

```json
{
  "posts": [
    {
      "id": 105,
      "image_url": "https://art-app-bucket.s3.ap-northeast-2.amazonaws.com/uuid.jpg",
      "title": "Sunset",
      "ai_summary": null, // null이면 '분석하기' 버튼 노출
      "music_prompt": null, // null이면 '음악생성' 버튼 노출
      "visibility": "public", // 'public' | 'friends' | 'private'
      "is_liked": false, // viewer_id 기준 좋아요 여부
      "is_bookmarked": false // viewer_id 기준 북마크 여부
    }
  ]
}
```

#### **게시글 업로드 (Upload)**

- **URL**: `/posts/`
- **Method**: `POST`
- **Header**: `Content-Type: multipart/form-data` (필수)
- **Form Data (Body)**:
  | Key | Type | 필수 | 설명 |
  | :--- | :--- | :--- | :--- |
  | `user_id` | Integer | YES | 로그인한 유저 ID |
  | `title` | String | YES | 제목 |
  | `image` | File | YES | 이미지 파일 객체 |
  | `artist_name` | String | NO | 작가명 |
  | `description` | String | NO | 설명 |
  | `visibility` | String | NO | 공개 설정 (`public`, `friends`, `private`) 기본값: `public` |

---

### 🤖 3. AI 기능 (Gemini)

#### **그림 분석 요청 (Vision AI)**

- **URL**: `/posts/{post_id}/analyze`
- **Method**: `POST`
- **Form Data**:
  - `genre` (예: "인상주의")
  - `style` (예: "유화")
- **Response**:

```json
{
  "message": "분석 완료",
  "result": {
    "art_review": "이 그림은..." // 화면에 즉시 업데이트
  }
}
```

#### **음악 프롬프트 생성 (Music AI)**

- **URL**: `/posts/{post_id}/music`
- **Method**: `POST`
- **Description**: DB에 저장된 감상평(description 혹은 ai_summary)을 기반으로 생성합니다.
- **Response**:

```json
{
  "message": "생성 완료",
  "result": {
    "music_prompt": "A sad piano song...", // 영어 프롬프트
    "explanation": "슬픈 느낌을 주기 위해..." // 한글 설명
  }
}


4. 프론트엔드 코드 예시 (Snippet)
아래 코드를 사용하여 반드시 3001번 포트가 아닌 8000번 또는 배포 주소로 요청하는지 확인하세요.

JavaScript


// ❌ 절대 사용 금지 (이미지가 localhost로 저장됨)
// const BASE_URL = "http://localhost:3001";

// ✅ 권장 설정 (배포 서버 - S3 저장됨)
const BASE_URL = "https://art-app-back-server.onrender.com";

async function uploadPost(file, userId, title) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("user_id", userId);
    formData.append("title", title);

    // 8000번 또는 배포 서버로 요청을 보냅니다.
    const response = await fetch(`${BASE_URL}/posts/`, {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    console.log("업로드 된 이미지 주소:", data.image_url);
    // 결과가 https://...s3... 로 시작하는지 확인하세요.
}


5. 자주 묻는 질문 (FAQ)
Q. DB를 봤는데 http://localhost:3001/... 이미지가 아직 있어요.
A. 과거에 3001번 포트 서버를 이용해 업로드된 옛날 데이터입니다. 배포 서버에서는 이미지가 보이지 않으니, DB에서 해당 행을 삭제(DELETE)하는 것을 권장합니다.
Q. 배포 서버(onrender.com) 반응이 너무 느려요.
A. 무료 호스팅 특성상 일정 시간 미사용 시 서버가 잠듭니다. 깨어나는 데 최대 1분이 걸릴 수 있으니, UI에 "서버 깨우는 중..." 같은 로딩 표시를 넣어주세요.
```
