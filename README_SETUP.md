# iMery Setup & Execution Guide (v1.5)

**Complete Developer & Agent Handoff Documentation**

이 문서는 iMery 프로젝트의 설치, 설정, 실행 방법 및 전체 아키텍처를 상세히 설명합니다.  
다른 개발자나 AI 에이전트가 이 문서만으로도 프로젝트를 완전히 이해하고 작업을 이어받을 수 있도록 작성되었습니다.

---

## 📋 목차

1. [사전 요구 사항](#1-사전-요구-사항-prerequisites)
2. [프로젝트 설치](#2-프로젝트-설치-installation)
3. [환경 설정](#3-환경-설정-environment-setup)
4. [프로젝트 실행](#4-프로젝트-실행-running-the-project)
5. [개발 환경 상세](#5-개발-환경-상세-development-environment)
6. [프로젝트 구조](#6-프로젝트-구조-project-structure)
7. [프론트엔드 아키텍처](#7-프론트엔드-아키텍처-frontend-architecture)
8. [백엔드 아키텍처](#8-백엔드-아키텍처-backend-architecture)
9. [주요 기능 사용법](#9-주요-기능-사용법-features-guide)
10. [최근 개발 이력 (v.1.5)](#10-최근-개발-이력-v15)
11. [에이전트 인수인계 가이드](#11-에이전트-인수인계-가이드-agent-handoff)
12. [주요 설정 파일](#12-주요-설정-파일-configuration-files)
13. [문제 해결](#13-문제-해결-troubleshooting)
14. [모바일 테스트](#14-모바일-테스트-mobile-testing)

---

## 1. 사전 요구 사항 (Prerequisites)

프로젝트 실행을 위해 다음 소프트웨어가 설치되어 있어야 합니다.

### 필수 요구사항
- **Node.js** v18.0.0 이상 (v20+ 권장)
- **npm** 9.0+ (Node.js 설치 시 자동 설치)
- **Git** 2.30+ (버전 관리 및 협업용)

### 클라우드 서비스
- **AWS Account** - S3 이미지 스토리지용
- **TiDB Cloud Account** - MySQL 호환 데이터베이스
- **RunPod Account** (선택) - AI 이미지 분석용

### 권장 개발 도구
- **VSCode** with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets

---

## 2. 프로젝트 설치 (Installation)

### 2.1 저장소 클론

```bash
# GitHub에서 프로젝트 클론
git clone https://github.com/oldcast1e/iMery.git
cd iMery

# 최신 안정 버전으로 전환
git checkout v.1.5
```

### 2.2 의존성 설치

```bash
# 프론트엔드 의존성 설치
npm install

# 백엔드 의존성 설치
cd server
npm install
cd ..
```

**설치되는 주요 패키지:**
- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend**: Express, MySQL2, bcryptjs, JWT, AWS SDK S3, Multer

---

## 3. 환경 설정 (Environment Setup)

### 3.1 데이터베이스 설정

이 프로젝트는 **TiDB Cloud** (MySQL 호환)를 사용합니다.  
서버 실행 시 `server/db.js`가 자동으로 테이블을 생성합니다.

**데이터베이스 스키마:**
- `Users` - 사용자 계정 (bcrypt 해싱)
- `Posts` - 작품 기록 및 AI 분석 결과
- `Friendships` - 친구 관계
- `Bookmarks` - 북마크
- `Likes` - 좋아요
- `Comments` - 댓글

### 3.2 AWS S3 설정 (중요!)

이미지 업로드를 위해 AWS S3 자격 증명을 설정해야 합니다.

#### Step 1: AWS 자격 증명 획득

1. [AWS Console](https://console.aws.amazon.com) 로그인
2. **IAM** → **사용자** → 사용자 선택 또는 새로 생성
3. **보안 자격 증명** 탭 → **액세스 키 만들기**
4. `Access Key ID`와 `Secret Access Key` 복사

#### Step 2: 환경 변수 파일 생성

`server/.env` 파일을 생성하고 다음 내용을 입력합니다:

```bash
# 데이터베이스 설정
DB_HOST=gateway01.ap-northeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=2xT7BQvhhuaABjr.root
DB_PASSWORD=ojm4dVHzyXqWJK6S
DB_NAME=test

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_HERE
AWS_S3_BUCKET=imery
AWS_REGION=ap-southeast-2
```

> **⚠️ 보안 주의**: `.env` 파일은 절대 Git에 커밋하지 마세요. `.gitignore`에 이미 포함되어 있습니다.

#### Step 3: S3 버킷 확인

버킷 이름 `imery`가 `ap-southeast-2` 리전에 존재하는지 확인하세요.

---

## 4. 프로젝트 실행 (Running the Project)

서버와 클라이언트를 **각각 별도의 터미널**에서 실행해야 합니다.

### 터미널 1: 백엔드 서버 실행

```bash
# iMery 루트 디렉토리에서
cd server

# 서버 실행
node index.js
```

**성공 시 출력:**
```
[dotenv] injecting env (9) from .env
Connecting to TiDB/MySQL...
Connected to TiDB successfully.
Database initialized
Server running on http://localhost:3001
```

### 터미널 2: 프론트엔드 클라이언트 실행

```bash
# iMery 루트 디렉토리에서 (새 터미널)
npm run dev
```

**성공 시 출력:**
```
VITE v7.3.1  ready in 733 ms

➜  Local:   http://localhost:5173/
➜  Network: http://172.16.2.3:5173/
```

### 접속하기

브라우저 주소창에 `http://localhost:5173`을 입력하여 접속합니다.

---

## 5. 개발 환경 상세 (Development Environment)

### 5.1 운영체제 지원
- **macOS** (Primary) - Apple Silicon 및 Intel 모두 지원
- **Linux** - Ubuntu 20.04+, Fedora 34+
- **Windows** - WSL2 권장 (네이티브 지원 가능)

### 5.2 Git 워크플로우

**브랜치 전략:**
- `main` - 프로덕션 안정 버전
- `v.1.5`, `v.1.4` 등 - 기능 버전 브랜치
- 작업 시 항상 최신 버전 브랜치에서 pull

**일반적인 작업 흐름:**
```bash
# 최신 v.1.5 브랜치로 전환
git checkout v.1.5
git pull origin v.1.5

# 작업 후 커밋
git add .
git commit -m "feat: 기능 설명"

# main에 병합 (필요시)
git checkout main
git merge v.1.5
git push origin main v.1.5
```

### 5.3 터미널 설정

**필수 터미널 2개:**
1. **터미널 1** - 백엔드 서버 (`node index.js`)
2. **터미널 2** - 프론트엔드 개발 서버 (`npm run dev`)

**권장 터미널:**
- macOS: iTerm2 또는 기본 Terminal
- Windows: Windows Terminal + WSL2
- Linux: GNOME Terminal 또는 Konsole

### 5.4 에디터 설정 (VSCode)

**.vscode/settings.json** (권장):
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "tailwindCSS.experimental.classRegex": [
    ["className\\s*=\\s*[\"'`]([^\"'`]*)[\"'`]"]
  ]
}
```

---

## 6. 프로젝트 구조 (Project Structure)

### 6.1 전체 디렉토리 트리

```
iMery/
├── .git/                       # Git 버전 관리
├── .gitignore                  # Git 제외 파일 목록
├── node_modules/               # 프론트엔드 의존성
├── package.json                # 프론트엔드 패키지 설정
├── package-lock.json           # 의존성 잠금 파일
│
├── public/                     # 정적 자산
│   └── vite.svg               # Vite 로고
│
├── src/                        # 프론트엔드 소스코드
│   ├── main.jsx               # React 앱 진입점
│   ├── App.jsx                # 메인 애플리케이션 컴포넌트 (17KB)
│   ├── App.css                # 전역 스타일
│   ├── index.css              # Tailwind 디렉티브
│   │
│   ├── api/                   # API 클라이언트
│   │   └── client.js          # HTTP 요청 유틸리티
│   │
│   ├── pages/                 # 페이지 컴포넌트 (10개)
│   │   ├── LoginView.jsx     # 로그인 페이지
│   │   ├── SignupView.jsx    # 회원가입 페이지
│   │   ├── HomeView.jsx      # 홈 대시보드
│   │   ├── WorksView.jsx     # 폴더 기반 작품 관리
│   │   ├── WorkDetailView.jsx # 작품 상세 + AI 분석
│   │   ├── ArchiveView.jsx   # 캘린더 및 타임라인
│   │   ├── DayWorksView.jsx  # 특정 날짜 작품 목록
│   │   ├── MyView.jsx        # 사용자 프로필
│   │   ├── CommunityView.jsx # 소셜 피드 (deprecated)
│   │   └── SearchView.jsx    # 검색 페이지
│   │
│   ├── features/              # 기능 컴포넌트 (6개)
│   │   ├── UploadModal.jsx   # 이미지 업로드 모달
│   │   ├── ReviewForm.jsx    # 작품 리뷰 폼
│   │   ├── UserSearchModal.jsx # 친구 검색
│   │   ├── FolderCreationDialog.jsx
│   │   ├── EditProfileModal.jsx
│   │   └── SettingsModal.jsx
│   │
│   ├── widgets/               # 레이아웃 위젯 (5개)
│   │   ├── Header.jsx        # 상단 헤더
│   │   ├── BottomNav.jsx     # 하단 네비게이션
│   │   ├── WorksList.jsx     # 작품 목록 컴포넌트
│   │   ├── NotificationPanel.jsx # 알림 패널
│   │   └── HighlightCarousel.jsx
│   │
│   ├── shared/                # 공유 컴포넌트
│   │   └── ui/
│   │       └── DeleteConfirmDialog.jsx
│   │
│   ├── hooks/                 # 커스텀 React 훅
│   │   └── useLocalStorage.js
│   │
│   ├── utils/                 # 유틸리티 함수
│   │   └── imageCompression.js
│   │
│   ├── constants/             # 앱 상수
│   │   └── tags.js           # 태그 카테고리 정의
│   │
│   ├── data/                  # 정적 데이터
│   │   └── tagCategories.js
│   │
│   └── entities/              # 비즈니스 로직 컴포넌트
│
├── server/                    # 백엔드 서버
│   ├── node_modules/          # 백엔드 의존성
│   ├── package.json           # 백엔드 패키지 설정
│   ├── .env                   # 환경 변수 (생성 필요, Git 제외)
│   ├── .env.example           # 환경 변수 예제
│   │
│   ├── index.js               # Express 서버 메인 (23KB)
│   ├── db.js                  # 데이터베이스 초기화 및 스키마
│   ├── database.sqlite        # 로컬 SQLite (개발용, Git 제외)
│   │
│   ├── uploads/               # 로컬 업로드 디렉토리 (사용 안 함)
│   │
│   └── [utility scripts]      # 데이터베이스 유틸리티 스크립트
│       ├── check_db_images.js
│       ├── check_style_columns.js
│       ├── delete_plaintext_users.js
│       ├── setup_test_friendship.js
│       ├── test_friendships.js
│       └── update_user_1.js
│
├── assets/                    # 프로젝트 문서 및 이슈
│   ├── issue/                 # 이슈 트래킹 문서
│   └── text/                  # 메모 및 참고 문서
│
├── README.md                  # 프로젝트 개요
├── README_SETUP.md            # 본 문서
├── README_API.md              # API 문서
├── README_MUSIC_ASY.md        # 음악 생성 가이드
│
├── vite.config.js             # Vite 빌드 설정
├── tailwind.config.js         # Tailwind CSS 설정
├── postcss.config.js          # PostCSS 설정
├── eslint.config.js           # ESLint 설정
└── index.html                 # HTML 진입점
```

### 6.2 핵심 파일 설명

| 파일 경로 | 크기 | 역할 |
|---------|------|------|
| `src/App.jsx` | 17KB | 메인 애플리케이션, 라우팅, 전역 상태 |
| `server/index.js` | 23KB | Express API 서버, 모든 엔드포인트 |
| `server/db.js` | 6KB | DB 초기화, 스키마 정의 |
| `src/api/client.js` | - | HTTP 클라이언트, API 호출 래퍼 |

---

## 7. 프론트엔드 아키텍처 (Frontend Architecture)

### 7.1 기술 스택

**Core:**
- **React 19** - 최신 React with Concurrent Features
- **Vite 7** - 빠른 개발 서버 및 HMR

**Styling:**
- **Tailwind CSS 3.4** - Utility-first CSS
- **Framer Motion 12** - 애니메이션 라이브러리
- **Lucide React** - 아이콘 라이브러리

### 7.2 컴포넌트 아키텍처

**계층 구조:**
```
App.jsx (Root)
├── Header (Widget)
├── NotificationPanel (Widget)
├── [Current View] (Page)
│   ├── WorksList (Widget)
│   └── [Feature Components]
└── BottomNav (Widget)
```

**라우팅 전략:**
- SPA (Single Page Application)
- `activeView` 상태로 뷰 전환
- 뒤로가기 버튼은 `onBack` 콜백 사용

### 7.3 상태 관리

**글로벌 상태 (App.jsx):**
```javascript
// 인증 상태
const [user, setUser] = useLocalStorage('imery-user', null);

// UI 상태
const [activeView, setActiveView] = useState('home');
const [selectedWork, setSelectedWork] = useState(null);

// 데이터 상태
const [works, setWorks] = useState([]);
const [folders, setFolders] = useLocalStorage(foldersKey, []);
const [bookmarkedIds, setBookmarkedIds] = useLocalStorage(bookmarksKey, []);
```

**로컬 스토리지 사용:**
- `imery-user` - 사용자 정보 및 JWT 토큰
- `imery-folders-{user_id}` - 사용자별 폴더
- `imery-bookmarks-{user_id}` - 사용자별 북마크

### 7.4 주요 페이지 설명

#### HomeView.jsx
- 사용자의 작품 대시보드
- 장르별 필터링
- 평점별 필터링
- "더보기" 페이지네이션 (5개씩)

#### WorkDetailView.jsx
- 작품 상세 정보 표시
- **AI 분석 기능** - 버튼 클릭 시 AI 분석 실행
- **음악 자동 재생** - 1초 간격 루프
- **자동 스크롤** - 페이지 진입 시 최상단
- 댓글 시스템

#### ArchiveView.jsx
- 캘린더 뷰
- 날짜별 작품 필터링
- 음악 토글 (deprecated, WorkDetailView로 이동)

#### WorksView.jsx
- 폴더 기반 작품 관리
- 그리드 레이아웃
- 편집/삭제 버튼 (호버 시 표시)

### 7.5 API 클라이언트 구조

**src/api/client.js:**
```javascript
const BASE_URL = 'http://localhost:3001';

const api = {
  // Auth
  login: async (email, password) => { ... },
  register: async (email, password, nickname) => { ... },
  
  // Posts
  getPosts: async () => { ... },
  createPost: async (formData) => { ... },
  updatePost: async (id, formData) => { ... },
  deletePost: async (id) => { ... },
  
  // AI Analysis
  analyzePost: async (postId) => { ... },
  
  // Social
  searchUsers: async (nickname) => { ... },
  sendFriendRequest: async (requesterId, addresseeId) => { ... },
  getFriends: async (userId) => { ... },
  
  // Interactions
  toggleLike: async (postId, userId) => { ... },
  toggleBookmark: async (userId, postId) => { ... },
  getComments: async (postId) => { ... },
  addComment: async (postId, userId, content) => { ... },
};
```

---

## 8. 백엔드 아키텍처 (Backend Architecture)

### 8.1 기술 스택

**Core:**
- **Node.js 20+** - JavaScript 런타임
- **Express 4** - 웹 프레임워크

**Database:**
- **TiDB Cloud** (Production) - MySQL 호환 클라우드 DB
- **SQLite3** (Development) - 로컬 개발용

**Security:**
- **bcryptjs** - 비밀번호 해싱
- **jsonwebtoken** - JWT 인증

**Storage:**
- **AWS SDK S3** - 이미지 저장
- **Multer** - 파일 업로드 미들웨어
- **Multer-S3** - S3 직접 업로드

### 8.2 데이터베이스 스키마

**Users Table:**
```sql
CREATE TABLE Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,  -- bcrypt hashed
  nickname TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Posts Table:**
```sql
CREATE TABLE Posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  artist_name TEXT,
  description TEXT,
  image_url TEXT,          -- S3 URL
  music_url TEXT,          -- S3 URL (AI generated)
  work_date DATE,
  genre TEXT,
  rating INTEGER,
  tags TEXT,               -- JSON array
  style TEXT,
  -- AI Analysis Fields
  style1 TEXT, score1 REAL,
  style2 TEXT, score2 REAL,
  style3 TEXT, score3 REAL,
  style4 TEXT, score4 REAL,
  style5 TEXT, score5 REAL,
  ai_summary TEXT,
  is_analyzed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id)
);
```

**Friendships Table:**
```sql
CREATE TABLE Friendships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER NOT NULL,
  addressee_id INTEGER NOT NULL,
  status TEXT DEFAULT 'PENDING',  -- PENDING, ACCEPTED, BLOCKED
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES Users(id),
  FOREIGN KEY (addressee_id) REFERENCES Users(id)
);
```

**Bookmarks, Likes, Comments** - 유사한 구조

### 8.3 API 엔드포인트

**인증:**
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인

**작품 관리:**
- `GET /posts/` - 모든 작품 조회 (⚠️ user_id 필터 없음 - 알려진 이슈)
- `GET /posts/:id` - 특정 작품 조회
- `POST /posts/` - 작품 생성 (Multer S3 업로드)
- `PUT /posts/:id` - 작품 수정
- `DELETE /posts/:id` - 작품 삭제

**AI 분석:**
- `POST /analyze/:id` - AI 이미지 분석 실행
  - RunPod API 호출
  - Gemini API 호출 (음악 생성)
  - 결과 DB 저장

**소셜:**
- `GET /users/search?nickname=...` - 사용자 검색
- `POST /friends/request` - 친구 요청
- `GET /friends/:userId` - 친구 목록
- `POST /friends/accept/:friendshipId` - 친구 승인

**상호작용:**
- `POST /likes/toggle` - 좋아요 토글
- `POST /bookmarks/toggle` - 북마크 토글
- `GET /comments/:postId` - 댓글 조회
- `POST /comments/` - 댓글 작성

### 8.4 S3 이미지 업로드 플로우

```javascript
// Multer-S3 설정
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET,
    key: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    }
  })
});

// 사용 예
app.post('/posts/', upload.single('image'), async (req, res) => {
  const imageUrl = req.file.location; // S3 URL
  // DB에 저장
});
```

### 8.5 AI 분석 워크플로우

1. 프론트엔드에서 `POST /analyze/:id` 호출
2. 백엔드가 이미지 URL을 RunPod API로 전송
3. RunPod이 이미지를 분석하고 스타일 점수 반환
4. Gemini API로 AI 요약 및 음악 생성 요청
5. 결과를 DB에 저장 (`is_analyzed = 1`)
6. 프론트엔드로 결과 반환

---

## 9. 주요 기능 사용법 (Features Guide)

### 9.1 회원가입 및 로그인

1. 앱 첫 실행 시 로그인 화면 표시
2. **회원가입** 클릭:
   - 이메일 형식 ID
   - 비밀번호 (bcrypt 해싱)
   - 닉네임 (중복 불가)
3. 가입 후 자동 로그인 또는 수동 로그인

**테스트 계정:**
```
ID: usera@example.com
PW: password123
Nickname: UserA
```

### 9.2 작품 업로드

1. 하단 중앙 **[+]** 버튼 클릭
2. 이미지 선택:
   - 카메라 촬영
   - 갤러리 선택
   - URL 입력
3. 작품 정보 입력:
   - 제목, 작가명
   - 화풍 (Style)
   - 장르 (Genre)
   - 평점 (1-5)
   - 태그 (계층형, 최대 5개)
   - 감상평
4. **업로드** → S3 자동 업로드

### 9.3 AI 작품 분석

1. 작품 상세 페이지 진입
2. **"AI 작품 분석 받아보기"** 버튼 클릭
3. AI 분석 (30-90초 소요):
   - 장르 분류
   - 화풍 Top 5 + 신뢰도 점수
   - AI 요약 생성
   - 배경 음악 생성 (S3 URL)
4. 결과 시각화 (차트 + 텍스트)
5. 음악 자동 재생 (1초 간격 루프)

### 9.4 친구 추가 및 소셜

**친구 추가:**
1. **[마이]** 탭 → 친구 찾기
2. 닉네임 검색
3. **친구 요청** 클릭
4. 상대방이 알림에서 수락

**친구 작품 보기:**
1. **[커뮤니티]** 탭 (deprecated, 현재 미사용)
2. 친구 작품 피드 표시
3. 좋아요/북마크 가능

### 9.5 음악 재생 (v.1.5 신규)

**WorkDetailView:**
- 페이지 진입 시 자동 재생
- 1초 간격으로 반복 재생
- 페이지 나가면 자동 정지
- 음악 버튼으로 수동 제어 가능

---

## 10. 최근 개발 이력 (v.1.5)

### 10.1 주요 변경사항 (2026.01.22)

#### UI/UX 개선
1. **음악 재생 강화**
   - 무조건 자동 재생 (`autoPlay` 속성)
   - 1초 간격 루프 재생 (`setTimeout` 사용)
   - 페이지 이탈 시 자동 정리 (`useEffect` cleanup)

2. **네비게이션 개선**
   - 페이지 진입 시 자동 스크롤 최상단 (`window.scrollTo(0, 0)`)
   - "Go to Top" 버튼 제거 (사용자 요청)

3. **버튼 디자인**
   - 삭제 버튼: 빨간색으로 변경
   - 편집/삭제: 호버 시 페이드인 효과
   - 북마크: 항상 표시

4. **레이아웃 조정**
   - 감상평-댓글 섹션 간격 축소 (`pt-2 mt-2`)
   - WorkDetailView 불필요한 여백 제거

#### 버그 수정
1. 비동기 `music_url` 로딩 문제 해결
   - `useEffect` dependency에 `work.music_url` 추가
2. 중복 `setTimeout` 클로저 해결
3. `App.jsx` 중복 import 제거
4. 불필요한 `)}` 제거

#### 파일 변경
```
Modified:
- src/App.jsx (중복 import 수정)
- src/pages/WorkDetailView.jsx (음악 루프, 스크롤)
- src/widgets/WorksList.jsx (버튼 호버)

Deleted:
- src/shared/ui/ScrollToTopButton.jsx
```

### 10.2 알려진 이슈

1. **백엔드 API 필터 부족**
   - `GET /posts/` 엔드포인트에 `user_id` 필터 없음
   - 모든 사용자의 작품 반환
   - **해결 방법**: 프론트엔드에서 필터링 (`App.jsx:391`)

2. **RunPod AI 분석**
   - 간헐적 "list index out of range" 에러
   - 네트워크 타임아웃 발생 가능
   - **해결 방법**: 재시도 또는 타임아웃 증가

### 10.3 다음 개발 우선순위

1. **백엔드 API 개선**
   - `/posts/` 엔드포인트에 user_id 필터 추가
   - 친구 요청 수락/거절 API 추가

2. **UI/UX**
   - 친구 요청 알림 UI
   - AI 분석 진행 상태 표시 개선

3. **성능 최적화**
   - 동시 다중 API 호출 최적화
   - 이미지 로딩 lazy loading

---

## 11. 에이전트 인수인계 가이드 (Agent Handoff)

### 11.1 코드베이스 이해 방법

**1단계: 문서 읽기**
```
1. README.md - 프로젝트 개요
2. README_SETUP.md (본 문서) - 전체 구조
3. task.md - 작업 체크리스트
4. walkthrough.md - 구현 상세 및 검증 결과
```

**2단계: 핵심 파일 탐색**
```
1. src/App.jsx - 전역 상태 및 라우팅 이해
2. server/index.js - API 엔드포인트 파악
3. server/db.js - DB 스키마 확인
4. src/api/client.js - API 호출 방식 이해
```

**3단계: 기능별 컴포넌트 분석**
- 특정 기능 수정 시 관련 페이지 컴포넌트 먼저 확인
- `pages/` → `features/` → `widgets/` 순서로 탐색

### 11.2 일반적인 작업 패턴

**UI 컴포넌트 수정:**
1. 해당 페이지 컴포넌트 (`src/pages/`) 찾기
2. Tailwind CSS 클래스 수정
3. 필요시 `App.jsx` 전역 상태 확인

**API 추가:**
1. `server/index.js`에 엔드포인트 추가
2. `src/api/client.js`에 클라이언트 함수 추가
3. 페이지 컴포넌트에서 호출

**DB 스키마 변경:**
1. `server/db.js` 수정
2. 로컬 `database.sqlite` 삭제 (자동 재생성)
3. TiDB에 수동 마이그레이션 (필요시)

### 11.3 테스트 및 검증 절차

**로컬 테스트:**
```bash
# 1. 백엔드 시작
cd server && node index.js

# 2. 프론트엔드 시작 (새 터미널)
npm run dev

# 3. 브라우저 개발자 도구에서 콘솔 확인
# 4. 네트워크 탭에서 API 호출 확인
```

**기능 검증:**
1. 회원가입/로그인 테스트
2. 작품 업로드 테스트
3. AI 분석 테스트
4. 친구 추가 테스트
5. 북마크/좋아요 테스트

### 11.4 디버깅 팁

**프론트엔드 에러:**
- 브라우저 콘솔 확인 (`F12`)
- React DevTools 사용
- `console.log()` 적극 활용

**백엔드 에러:**
- 터미널 1 (서버) 로그 확인
- `server.log` 파일 확인 (있는 경우)
- Postman으로 API 직접 테스트

**데이터베이스 이슈:**
- `server/check_*.js` 스크립트 실행
- SQLite Browser로 로컬 DB 직접 확인

### 11.5 Git 협업 가이드

**브랜치 생성:**
```bash
git checkout v.1.5
git pull origin v.1.5
git checkout -b feature/새기능명
```

**커밋 메시지 규칙:**
```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 리팩토링
test: 테스트 추가
```

**병합 전 체크리스트:**
- [ ] 로컬에서 정상 작동 확인
- [ ] 콘솔 에러 없음
- [ ] 주요 기능 테스트 완료
- [ ] README 업데이트 (필요시)

---

## 12. 주요 설정 파일 (Configuration Files)

### 12.1 package.json (Frontend)

```json
{
  "scripts": {
    "dev": "vite --host",      // 개발 서버 (네트워크 노출)
    "build": "vite build",     // 프로덕션 빌드
    "preview": "vite preview"  // 빌드 미리보기
  },
  "dependencies": {
    "react": "^19.2.0",        // React 19
    "framer-motion": "^12.26.2", // 애니메이션
    "lucide-react": "^0.562.0"  // 아이콘
  }
}
```

### 12.2 vite.config.js

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // 네트워크 접근 허용
    port: 5173   // 포트
  }
});
```

### 12.3 tailwind.config.js

**커스텀 색상:**
```javascript
theme: {
  extend: {
    colors: {
      main: '#23549D',  // 브랜드 메인 컬러
    },
    animation: {
      'fade-in': 'fadeIn 0.3s ease-in',
      'shimmer': 'shimmer 2s infinite'
    }
  }
}
```

### 12.4 서버 환경 변수 (.env)

**필수 변수:**
```bash
DB_HOST=...           # TiDB 호스트
DB_PORT=4000          # TiDB 포트
DB_USER=...           # DB 사용자명
DB_PASSWORD=...       # DB 비밀번호
DB_NAME=test          # DB 이름

AWS_ACCESS_KEY_ID=... # AWS 액세스 키
AWS_SECRET_ACCESS_KEY=... # AWS 시크릿 키
AWS_S3_BUCKET=imery   # S3 버킷 이름
AWS_REGION=ap-southeast-2 # S3 리전
```

---

## 13. 문제 해결 (Troubleshooting)

### Q1. 서버 실행 시 `Error: bucket is required`

**원인**: `.env` 파일 누락 또는 변수명 오류

**해결:**
```bash
cd server
cat .env  # 파일 존재 확인
# AWS_S3_BUCKET=imery 확인
```

### Q2. 이미지 업로드 실패

**원인**: S3 권한 또는 리전 불일치

**해결:**
1. AWS IAM에서 S3 권한 확인
2. `.env`의 `AWS_REGION` 확인
3. 버킷 정책에서 Public Access 확인

### Q3. 포트 충돌 (`EADDRINUSE`)

**해결 (Mac/Linux):**
```bash
lsof -ti:3001 | xargs kill -9  # 백엔드 포트
lsof -ti:5173 | xargs kill -9  # 프론트엔드 포트
```

**해결 (Windows PowerShell):**
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force
```

### Q4. `npm install` 실패

**해결:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Q5. Vite `import` 에러

**해결:**
```bash
rm -rf .vite
npm run dev
```

### Q6. AI 분석 타임아웃

**원인**: RunPod 서버 응답 지연

**해결:**
- 네트워크 연결 확인
- 서버 로그에서 요청 URL 확인
- 재시도 (30-90초 대기)

---

## 14. 모바일 테스트 (Mobile Testing)

### 방법 1: Chrome DevTools (권장)

1. `http://localhost:5173` 접속
2. `F12` → Device Toggle (`Cmd/Ctrl + Shift + M`)
3. iPhone 12 Pro 또는 원하는 기기 선택

### 방법 2: 실제 기기 (동일 Wi-Fi)

1. PC와 모바일 동일 Wi-Fi 연결
2. 터미널에서 Network 주소 확인:
   ```
   ➜ Network: http://172.16.2.3:5173/
   ```
3. 모바일 브라우저에서 해당 주소 접속

**⚠️ API 주소 변경 필요:**
```javascript
// src/api/client.js
const BASE_URL = 'http://172.16.2.3:3001'; // PC의 Network IP
```

---

## 📞 문의 및 지원

**문제 발생 시:**
1. 이 문서의 문제 해결 섹션 확인
2. GitHub Issues 검색
3. 새 Issue 생성 (상세 로그 첨부)

**개발자:** oldcast1e  
**Repository:** https://github.com/oldcast1e/iMery

**Happy Coding! 🎨✨**
