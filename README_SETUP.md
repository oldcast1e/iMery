# iMery Setup & Execution Guide (v1.3)

이 문서는 iMery 프로젝트의 설치, 설정 및 실행 방법을 상세히 설명합니다.

## 📋 목차
- [사전 요구 사항](#1-사전-요구-사항-prerequisites)
- [프로젝트 설치](#2-프로젝트-설치-installation)
- [환경 설정](#3-환경-설정-environment-setup)
- [프로젝트 실행](#4-프로젝트-실행-running-the-project)
- [주요 기능 사용법](#5-주요-기능-사용법-features-guide)
- [문제 해결](#6-문제-해결-troubleshooting)

---

## 1. 사전 요구 사항 (Prerequisites)

프로젝트 실행을 위해 다음 소프트웨어가 설치되어 있어야 합니다.

- **Node.js** (v18.0.0 이상 권장)
- **npm** (Node.js 설치 시 자동 설치)
- **AWS Account** (S3 이미지 스토리지용)
- **Git** (선택 사항)

---

## 2. 프로젝트 설치 (Installation)

### 2.1 저장소 클론 (선택 사항)
```bash
# GitHub에서 프로젝트 클론
git clone https://github.com/oldcast1e/React.git
cd React/iMery

# v1.3 브랜치로 전환
git checkout v.1.3
```

### 2.2 의존성 설치

```bash
# 프로젝트 루트 디렉토리로 이동
cd /path/to/iMery

# 프론트엔드 의존성 설치
npm install

# 백엔드 의존성 설치
cd server
npm install
cd ..
```

---

## 3. 환경 설정 (Environment Setup)

### 3.1 데이터베이스 설정

이 프로젝트는 **TiDB Cloud** (MySQL 호환)를 사용합니다. 서버 실행 시 자동으로 테이블이 생성됩니다.

> **참고**: `server/db.js` 파일에서 데이터베이스 연결 설정을 확인할 수 있습니다.

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
# 데이터베이스 설정 (이미 설정되어 있을 수 있음)
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

> **⚠️ 중요**: `YOUR_ACCESS_KEY_HERE`와 `YOUR_SECRET_KEY_HERE`를 실제 AWS 자격 증명으로 교체하세요.

#### Step 3: S3 버킷 확인

버킷 이름 `imery`가 `ap-southeast-2` 리전에 존재하는지 확인하세요. 다른 버킷이나 리전을 사용하는 경우 `.env` 파일의 값을 수정하세요.

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

**성공 시 출력 메시지:**
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

**성공 시 출력 메시지:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### 접속하기

브라우저 주소창에 `http://localhost:5173`을 입력하여 접속합니다.

---

## 5. 주요 기능 사용법 (Features Guide)

### 5.1 회원가입 및 로그인

1. 앱을 처음 실행하면 로그인 화면이 나타납니다
2. **회원가입**을 클릭하여 계정 생성:
   - 사용자 ID (이메일 형식)
   - 비밀번호
   - 닉네임
3. 가입 후 로그인하여 메인 화면 진입

**테스트 계정** (이미 생성되어 있음):
```
ID: master@imery.com
PW: master@1234
Nickname: master
```

### 5.2 작품 업로드

1. 하단 중앙의 **[+]** 버튼 클릭
2. 이미지 선택 방법:
   - **카메라**: 직접 촬영
   - **갤러리**: 저장된 이미지 선택
   - **URL**: 이미지 URL 입력
3. 작품 정보 입력:
   - **제목**: 작품명
   - **작가명**: 작가 이름 (선택사항)
   - **화풍(Style)**: 인상주의, 표현주의 등
   - **장르**: 그림, 사진, 조각 등
   - **평점**: ⭐ 1-5점
   - **태그**: 계층형 태그 선택 (작품/공간/경험)
   - **감상평**: 자유로운 텍스트
4. **업로드** 버튼 클릭

> **📸 이미지 저장**: 모든 이미지는 AWS S3에 자동 저장되며, 고유한 공개 URL이 생성됩니다.

### 5.3 AI 작품 분석 (v1.3 신규)

업로드한 작품의 상세 페이지에서:

1. **"AI 작품 분석 받아보기"** 버튼 클릭
2. AI가 이미지를 분석하여:
   - 장르 분류 (인상주의, 표현주의 등)
   - 화풍 Top 5 및 신뢰도 점수
   - 어울리는 음악 자동 생성
3. 분석 결과가 작품 상세 페이지에 시각화됨

> **⏱️ 분석 시간**: 약 30-60초 소요 (RunPod GPU 서버 처리)

### 5.4 친구 추가 및 소셜 기능

#### 친구 추가:
1. 하단 **[마이]** 탭 이동
2. **친구 찾기** 섹션에서 닉네임 검색
3. **친구 요청** 버튼 클릭
4. 상대방이 알림에서 **수락**하면 친구 관계 성립

#### 친구 작품 보기:
1. 하단 **[커뮤니티]** 탭 (사람 2명 아이콘)
2. 친구들이 업로드한 작품 피드 확인
3. 좋아요 💖 및 북마크 🔖 가능

### 5.5 북마크 및 캘린더

- **북마크**: 마음에 드는 작품을 즐겨찾기에 저장
- **캘린더**: [아카이브] 탭에서 날짜별 작품 기록 확인
  - 날짜 클릭 시 해당 날짜에 저장된 작품만 필터링

### 5.6 다국어 지원

- 상단 헤더의 **언어 버튼** (🌐) 클릭
- 한국어(KO) ↔ 영어(EN) 전환
- UI 레이아웃 텍스트만 변경 (사용자 입력 콘텐츠는 유지)

---

## 6. 문제 해결 (Troubleshooting)

### Q1. 서버 실행 시 `Error: bucket is required` 에러 발생

**원인**: `.env` 파일에 AWS 자격 증명이 없거나 변수명이 잘못됨

**해결**:
```bash
# server/.env 파일 확인
cat server/.env

# 다음 변수들이 정확히 설정되어 있는지 확인:
# AWS_ACCESS_KEY_ID=AKIA...
# AWS_SECRET_ACCESS_KEY=...
# AWS_S3_BUCKET=imery
# AWS_REGION=ap-southeast-2
```

### Q2. 이미지 업로드 시 "The string did not match the expected pattern" 에러

**원인**: S3 버킷 리전 불일치

**해결**:
```bash
# 서버 터미널에서 에러 로그 확인
# "PermanentRedirect" 메시지가 보이면 리전 불일치

# server/.env 파일에서 AWS_REGION 값 확인
# 실제 S3 버킷 리전과 일치해야 함 (예: ap-southeast-2)
```

수정 후 서버 재시작:
```bash
# 기존 서버 종료 (Ctrl+C)
# 또는 포트 강제 종료
lsof -ti:3001 | xargs kill -9

# 서버 재시작
cd server
node index.js
```

### Q3. 포트 충돌 에러 (`EADDRINUSE: address already in use`)

**원인**: 이미 포트가 사용 중

**Mac/Linux 해결**:
```bash
# 3001번 포트 사용 프로세스 종료
lsof -ti:3001 | xargs kill -9

# 서버 재시작
cd server
node index.js
```

**Windows (PowerShell) 해결**:
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force
```

### Q4. `npm run dev` 실행 시 import 에러 발생

**원인**: 의존성 설치 문제 또는 캐시 충돌

**해결**:
```bash
# node_modules 삭제 및 재설치
rm -rf node_modules package-lock.json
npm install

# Vite 캐시 삭제
rm -rf .vite
npm run dev
```

### Q5. AI 분석이 작동하지 않음

**원인**: 
1. 이미지가 localhost URL로 저장된 경우
2. RunPod 서버 미작동
3. 네트워크 타임아웃

**해결**:
1. 새 이미지를 업로드하여 S3 URL 확인
2. 서버 로그에서 AI 분석 요청 확인:
   ```
   [AI] Analyzing image for Post {id}: https://imery.s3...
   ```
3. 타임아웃 시 재시도 (최대 90초 대기)

### Q6. 데이터베이스 연결 오류

**원인**: TiDB 연결 정보 오류

**해결**:
```bash
# server/.env 파일에서 DB 설정 확인
DB_HOST=gateway01.ap-northeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=2xT7BQvhhuaABjr.root
DB_PASSWORD=ojm4dVHzyXqWJK6S
DB_NAME=test
```

---

## 7. 모바일 테스트 (Mobile Testing)

### 방법 1: 브라우저 개발자 도구 (권장)

1. Chrome 브라우저에서 `http://localhost:5173` 접속
2. `F12` (또는 Mac: `Cmd + Option + I`) 눌러 개발자 도구 열기
3. 좌측 상단 **Device Toggle** 아이콘 클릭 (단축키: `Cmd + Shift + M`)
4. 상단에서 **iPhone 12 Pro** 등 원하는 기기 선택
5. 모바일 화면으로 테스트 진행

### 방법 2: 실제 모바일 기기 (동일 Wi-Fi)

1. PC와 모바일 기기가 **동일한 Wi-Fi 네트워크** 연결 확인
2. 터미널 2(프론트엔드)에 표시된 `Network` 주소 확인:
   ```
   ➜  Network: http://192.168.0.10:5173/
   ```
3. 모바일 브라우저에서 해당 주소로 접속

> **⚠️ 백엔드 API 주소**: 모바일에서 접속 시 `src/api/client.js`의 BASE_URL을 PC의 Network IP로 변경해야 할 수 있습니다.

### 방법 3: iOS 시뮬레이터 (Mac 전용)

```bash
# Xcode Simulator 실행
open -a Simulator

# 또는
open /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app
```

시뮬레이터에서 Safari 앱 실행 → `http://localhost:5173` 접속

---

## 8. 프로젝트 구조

```
iMery/
├── src/                    # 프론트엔드 소스
│   ├── api/               # API 클라이언트
│   ├── pages/             # 페이지 컴포넌트
│   ├── features/          # 기능 컴포넌트 (모달, 폼 등)
│   ├── widgets/           # 레이아웃 위젯 (헤더, 네비게이션)
│   ├── shared/            # 공유 컴포넌트
│   └── utils/             # 유틸리티 함수
├── server/                # 백엔드 서버
│   ├── index.js          # Express 서버 메인
│   ├── db.js             # 데이터베이스 초기화
│   └── .env              # 환경 변수 (생성 필요)
├── assets/               # 문서 및 이슈 관리
└── README.md             # 프로젝트 개요
```

---

## 9. 기술 스택

| 분류 | 기술 | 설명 |
|------|------|------|
| **Frontend** | React 19 + Vite | 최신 React와 빠른 HMR |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Animation** | Framer Motion | 부드러운 UI 애니메이션 |
| **Icons** | Lucide React | 벡터 아이콘 라이브러리 |
| **Backend** | Node.js + Express | REST API 서버 |
| **Database** | TiDB Cloud (MySQL) | 클라우드 데이터베이스 |
| **Storage** | AWS S3 | 이미지 저장소 |
| **Auth** | JWT + bcrypt | 보안 인증 시스템 |
| **AI** | RunPod + Gemini | 이미지 분석 및 음악 생성 |

---

## 10. 추가 리소스

- **API 문서**: `README_API.md`
- **음악 생성 가이드**: `README_MUSIC_ASY.md`
- **이슈 트래킹**: `assets/issue/`

---

## 📞 문의 및 지원

문제가 지속되거나 추가 도움이 필요한 경우:
- GitHub Issues에 문의
- 개발자: oldcast1e

**Happy Coding! 🎨✨**
