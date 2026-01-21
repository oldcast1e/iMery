# iMery - 미술 작품 감상 기록 및 소셜 커뮤니티 앱

> iMery : 작품을 듣는 시간

iMery는 미술관에서 감상한 작품을 기록하고, 친구들과 감상을 공유하며 소통할 수 있는 Web-Community App입니다.
React 기반의 프론트엔드와 Node.js/Express/TiDB 기반의 Full-Stack 애플리케이션입니다.

## 📌 버전 및 브랜치 관리 (Version & Branch)

현재 프로젝트는 기능 업데이트에 따라 여러 브랜치로 관리되고 있습니다. **최신 안정화 버전인 `v.1.3`**에서 작업을 진행하는 것을 권장합니다.

```bash
# 1. 원격 저장소의 최신 브랜치 정보 가져오기
git fetch origin

# 2. v.1.3 브랜치로 전환 및 로컬 생성
git checkout v.1.3

# 3. 브랜치 확인 (현재 활성화된 브랜치 옆에 * 가 표시됨)
git branch
```

---

## 🎨 주요 기능

### 1. 지능형 작품 아카이빙 (Advanced!)
- ✅ **3단계 계층형 태그**: [작품/공간/경험] 구조로 세분화된 30여 개의 감각적 태그 제공 (아이콘 포함)
- ✅ **화풍(Style) 분석 기록**: 인상주의, 표현주의 등 작품 고유의 스타일을 문자열로 추가 기록
- ✅ **AI 기반 이미지 분석**: (진행 중) 업로드된 이미지를 AI가 분석하여 장르 및 화풍을 자동 추천
- ✅ **음악(Audio) 결합**: 감상 당시의 느낌을 담은 음악 URL(유튜브 등)을 함께 저장 및 플레이어 재생
- ✅ **유연한 레이아웃**: List, Grid, Large(피드형) 등 사용자가 원하는 뷰어 모드 지원

### 2. 소셜 커뮤니티 (Social)
- ✅ **실시간 친구 시스템**: 닉네임 검색을 통한 친구 요청/수락 및 친구 목록 관리
- ✅ **독립된 피드**: 홈 탭에서는 나의 기록만, 아카이브 탭에서는 친구들의 새 소식만 자동으로 필터링
- ✅ **반응형 소셜 액션**: 실시간 좋아요(💖) 및 북마크(🔖) 기능을 통한 관심 작품 저장
- ✅ **알림 센터**: 친구 요청 및 활동에 대한 알림을 즉시 확인 가능

### 3. 프리미엄 UI/UX
- ✅ **Modern & Glassmorphism**: 세련된 카드 디자인과 반투명 블러 효과를 적용한 프리미엄 UI
- ✅ **스마트 캘린더**: 날짜별로 저장된 작품을 한눈에 확인하고 해당 날짜의 기록으로 바로 이동
- ✅ **즉각적인 상태 피드백**: 모든 CRUD 작업에 대해 직관적인 토스트 메시지 및 애니메이션 제공
- ✅ **애플 스타일 디자인**: 둥근 모서리와 유려한 트랜지션을 적용한 모던한 디자인 시스템

---

## 🚀 설치 및 실행 방법 (매우 중요!)

이 앱은 Frontend(화면)와 Backend(서버)가 각각 실행되어야 정상 작동합니다. 터미널 2개를 열어주세요.

### 사전 요구사항
- Node.js (v14 이상)
- npm

### 1️⃣ Backend 서버 실행 (터미널 1)
데이터베이스와 API를 담당하는 서버를 먼저 켭니다.

```bash
# 1. 서버 디렉토리로 이동
cd server

# 2. 의존성 설치 (최초 1회)
npm install

# 3. 서버 실행
node index.js
```
*성공 시 메시지: `Server running on http://localhost:3000`*

### 2️⃣ Frontend 앱 실행 (터미널 2)
사용자가 보는 웹 화면을 실행합니다.

```bash
# 1. 프로젝트 루트 디렉토리로 이동 (새 터미널)
cd /Users/apple/Desktop/React/iMery

# 2. 의존성 설치 (최초 1회)
npm install

# 3. 앱 실행
npm run dev
```
*성공 시 메시지: `Local: http://localhost:5173/`*

### 3️⃣ 접속하기
브라우저 주소창에 `http://localhost:5173` 을 입력하여 접속합니다.

---

## 📖 사용 가이드

### 회원가입 및 로그인
1. 앱을 처음 실행하면 로그인/회원가입 화면이 나타납니다.
2. 원하는 ID/PW/닉네임으로 가입 후 로그인하세요. (데이터는 로컬 DB인 `server/database.sqlite`에 저장됩니다)

### 친구 추가 및 피드 보기
1. 하단 네비게이션 맨 오른쪽 [마이] 탭 클릭
2. 친구 찾기에서 친구의 닉네임 검색 후 '친구 요청'
3. 상대방이 [마이] 탭에서 요청을 '수락'하면 친구 관계 성립
4. 하단 [커뮤니티] (사람 2명 아이콘) 탭을 누르면 친구가 올린 글이 피드에 나타납니다.

### 작품 올리기
1. 하단 중앙 [+] 버튼 클릭
2. 사진 선택 후 '화풍(Style)' 및 '태그(Tags)' 선택
3. 내용 입력 후 업로드 (서버의 `uploads/` 폴더에 이미지 저장)
4. 태그는 대분류-중분류-소분류를 선택할 수 있으며, 가장 구체적인 태그가 저장됩니다.

---

## 🛠️ 기술 스택

| Frontend | React 19, Vite | 최신 React 버전과 빠른 빌드 시스템 |
| State | useLocalStorage, useState | 브라우저 저장소 연동 및 효율적인 상태 관리 |
| Animation | Framer Motion | 부드럽고 고급스러운 UI 트랜지션 |
| Icons | Lucide React | 확장성 높은 아이콘 시스템 |
| Style | Tailwind CSS | Utility-first CSS 프레임워크 |
| Backend | Node.js, Express | 가볍고 빠른 REST API 서버 |
| Database | SQLite3, TiDB | 로컬 개발용 SQLite 및 클라우드 MySQL 환경 지원 |
| Auth | JWT, bcrypt | 보안이 강화된 사용자 인증 기능 |

---

## 🛠️ 트러블슈팅 (Troubleshooting)

### ⚠️ `Error: listen EADDRINUSE: address already in use :::3001`
이 에러는 이미 3001번 포트에서 다른 서버가 실행 중일 때 발생합니다. 아래 명령어로 기존 프로세스를 종료하세요.

**Mac/Linux:**
```bash
kill -9 $(lsof -t -i:3001)
```

**Windows (PowerShell):**
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force
```

---

## 👨‍💻 개발자 노트
- 이 프로젝트는 Single Page Application (SPA) 구조이나, Full-Stack 기능을 위해 로컬 API 서버와 연동됩니다.
- DB 스키마는 서버 실행 시 `server/db.js`를 통해 자동으로 최신화(Migration)됩니다.
- 이미지 파일은 API 서버의 `server/uploads` 디렉토리에 저장됩니다.
