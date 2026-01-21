개발자 에이전트(Cursor, Windsurf 등)나 프론트엔드 개발자에게 이 문서 하나만 던져주면 개발이 끝날 수 있도록 완벽하게 정리된 마스터 문서입니다.
이 내용을 그대로 복사해서 .md 파일로 저장하거나, AI 채팅창에 붙여넣으시면 됩니다.

# 📘 Art App Backend Master Documentation (v1.0)

## 1. 프로젝트 개요 (Project Overview)
이 문서는 AI 기반 미술 작품 분석 및 음악 생성 애플리케이션의 백엔드 연동 명세서입니다.
서버는 클라우드(Render)에 배포되어 있으며, AWS S3(이미지 저장), TiDB(데이터 저장), Google Gemini(AI 분석)가 연동되어 있습니다.

### 🌐 서버 접속 정보

| 항목 | 값 (Value) | 비고 |
| :--- | :--- | :--- |
| **Base URL** | `https://art-app-back-server.onrender.com` | Live Server |
| **Test Page** | Swagger UI | API 테스트용 |
| **Status** | Render Free Tier | ⚠️ Cold Start 주의: 15분 미사용 시 절전모드 진입. 첫 요청 시 50초 지연 가능. |

---

## 2. 데이터 구조 (Data Models)
프론트엔드에서 처리할 데이터의 필드명과 타입입니다.

### 📌 User (사용자)
- **id (Int)**: 유저 고유 ID (로그인 후 로컬 스토리지 저장 필수)
- **username (Str)**: 아이디
- **nickname (Str)**: 닉네임

### 📌 Post (게시글 & AI 데이터)
- **id (Int)**: 게시글 ID
- **image_url (Str)**: AWS S3에 저장된 이미지 주소
- **title, artist_name**: 작품 정보
- **description (Str)**: 사용자가 직접 쓴 감상평
- **ai_summary (Str, Nullable)**: AI 그림 분석 결과 (초기값: null)
- **music_prompt (Str, Nullable)**: AI 음악 생성 프롬프트 (초기값: null)

---

## 3. API 엔드포인트 명세 (API Endpoints)

### 🔐 인증 (Auth)

#### 1. 회원가입
- **Endpoint**: `POST /users/signup`
- **Body**: `{ "username": "test", "password": "123", "nickname": "Artist" }`
- **Response**: `{ "message": "가입 성공", "id": 1 }`

#### 2. 로그인
- **Endpoint**: `POST /users/login`
- **Body**: `{ "username": "test", "password": "123" }`
- **Response**:
```json
{
  "message": "로그인 성공",
  "user_id": 1,  // 🚨 중요: 이 값을 저장해야 글쓰기 가능
  "nickname": "Artist"
}
```

### 🖼️ 게시글 (Posts)

#### 3. 게시글 목록 조회 (Main Feed)
- **Endpoint**: `GET /posts/`
- **Response**: 게시글 배열 반환 (최신순)
```json
{
  "posts": [
    {
      "id": 10,
      "image_url": "https://bucket.s3.../img.jpg",
      "title": "별이 빛나는 밤",
      "ai_summary": null,       // null이면 '분석' 버튼 노출
      "music_prompt": null      // null이면 '음악생성' 버튼 노출
    }
  ]
}
```

#### 4. 게시글 업로드 (S3 연동)
- **Endpoint**: `POST /posts/`
- **Content-Type**: `multipart/form-data` (필수)
- **FormData**:
  - `user_id` (Int): 필수
  - `title` (Str): 필수
  - `image` (File): 필수 (이미지 파일)
  - `artist_name` (Str): 선택
  - `description` (Str): 선택
- **Response**: `{ "message": "업로드 성공", "id": 11, "image_url": "..." }`

### 🤖 AI 기능 (Gemini Integration)

#### 5. 그림 분석 요청 (Vision AI)
- **Endpoint**: `POST /posts/{post_id}/analyze`
- **FormData**: `genre("인상주의")`, `style("유화")` (선택사항, 기본값 있음)
- **Action**: 서버가 이미지를 분석하여 DB의 `ai_summary` 컬럼에 저장함.
- **Response**:
```json
{
  "message": "분석 완료",
  "result": {
    "art_review": "강렬한 색채가 돋보이는 작품입니다..." // 화면에 즉시 표시
  }
}
```

#### 6. 음악 프롬프트 생성 (Generative AI)
- **Endpoint**: `POST /posts/{post_id}/music`
- **Body**: 없음 (URL 파라미터만 사용)
- **Action**: 감상평을 기반으로 음악 프롬프트를 생성하여 DB의 `music_prompt` 컬럼에 저장함.
- **Response**:
```json
{
  "message": "생성 완료",
  "result": {
    "music_prompt": "A sad piano ballad...", // 영어 프롬프트
    "explanation": "슬픈 분위기를 위해 피아노를..." // 한글 설명
  }
}
```

---

## 4. 프론트엔드 개발 로직 (Implementation Logic)
개발자(또는 에이전트)는 아래 UI 상태 머신(State Machine) 로직을 따라 구현해야 합니다.

1. **초기 상태**: `GET /posts/`로 데이터를 불러와 카드를 렌더링합니다.
2. **카드 UI 분기 처리**:
   - **Case A (ai_summary is NULL)**:
     - 👉 [🖼️ 그림 분석] 버튼을 표시합니다.
     - 클릭 시: 로딩 스피너 -> `/posts/{id}/analyze` 호출 -> 성공 시 텍스트 표시 및 버튼 숨김.
   - **Case B (ai_summary exists, music_prompt is NULL)**:
     - 👉 분석된 텍스트를 보여줍니다.
     - 👉 [🎵 음악 생성] 버튼을 표시합니다.
     - 클릭 시: 로딩 스피너 -> `/posts/{id}/music` 호출 -> 성공 시 프롬프트 표시.
   - **Case C (music_prompt exists)**:
     - 👉 분석 텍스트와 **음악 프롬프트(영어)**를 모두 보여줍니다.
     - 👉 프롬프트 옆에 [복사] 버튼을 둡니다.

---

## 5. [복사용] AI 에이전트 프롬프트 (Prompt for Agent)
AI 코딩 도구에게 작업을 지시할 때, 아래 박스 안의 내용을 그대로 복사해서 붙여넣으세요.

```markdown
# Role
You are a Senior Frontend Developer. 
Your task is to build a web application interface that connects to a live backend server.

# Backend Configuration
- **Base URL:** https://art-app-back-server.onrender.com
- **Server State:** Live (Render Free Tier). Note that the first request might take up to 50 seconds due to cold start. Please implement a loading indicator.

# Requirements (Step-by-Step)

1. **View Feed (Main Page):**
   - Fetch data from `GET /posts/`.
   - Render a grid of cards showing the image, title, artist, and user description.

2. **Upload Feature:**
   - Create a floating action button (FAB) or a clearly visible "Upload" button.
   - On click, open a modal with a form.
   - Inputs: User ID (hidden or manual for test), Title, Artist, Description, Image File.
   - Submit to `POST /posts/` using `FormData` (multipart/form-data).

3. **AI Feature Logic (Crucial):**
   - Inside each post card, check the data fields:
   - **If `ai_summary` is null:** Show an "Analyze Art 🖼️" button.
     - On click -> Call `POST /posts/{id}/analyze`.
     - On success -> Display the `result.art_review` in the card.
   - **If `ai_summary` exists:** Display the summary text.
     - AND check if `music_prompt` is null.
     - If null -> Show a "Generate Music 🎵" button.
     - On click -> Call `POST /posts/{id}/music`.
     - On success -> Display the `result.music_prompt` and `result.explanation`.

4. **UI/UX:**
   - Use a modern, clean design (e.g., card layout).
   - Implement loading states for all async actions (uploading, analyzing, generating).
   - Use `alert()` or `toast` for success/error messages.

Please generate the complete Frontend code (HTML/CSS/JS single file OR React App structure).
```
