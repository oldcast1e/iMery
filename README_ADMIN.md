## iMery Exhibition (Admin App)

전시회 운영자를 위한 **관리자용 모바일 앱(Expo/React Native)** 과 이를 지원하는 **백엔드 API(FastAPI)** 가 한 폴더에 함께 들어있는 프로젝트입니다.

- **앱 이름**: `iMery Exhibition`
- **딥링크/NFC 포맷**: `imery://collect/{artworkId}`
- **백엔드 기본 배포 주소**: Render(`render.yaml` 기반)

---

## 일반 사용자용 한눈에 보기 (운영자/심사위원/비개발자)

이 앱은 “전시회 운영자가 작품/전시 정보를 등록하고, NFC 태그를 만들어 관람객 앱과 연결하며, 전시 성과와 구매 요청을 한 번에 관리”할 수 있게 만든 **전시 운영 도구**입니다.

### 이 앱을 누가 쓰나요?

- **전시 운영자/스태프**: 전시회 등록, 작품 정보 업로드, NFC 태그 발급
- **전시 기획/총괄**: 전시 성과(최근 7일 추이, Top3 인기 작품) 확인
- **판매 담당자**: 구매 요청(승인/거절) 확인 및 처리

### 화면(탭)별로 무엇을 할 수 있나요?

- **내 전시회(홈)**
  - 전시회 목록을 보고, 전시회를 선택하면 **해당 전시의 작품 목록**을 확인합니다.
  - 작품을 **추가/수정**할 수 있습니다. (작품 이미지는 서버에 업로드되어 저장됩니다.)
  - 전시회 자체 정보(제목/날짜/장소)도 **수정**할 수 있습니다.
- **통계(리포트)**
  - 전시회별 참여도/최근 7일 이용 추이/Top3 인기 작품을 확인합니다.
  - 실데이터가 없을 때는 시연을 위한 샘플(목업) 데이터가 보일 수 있습니다.
- **+ (새 전시회 등록)**
  - 하단 중앙의 `+` 버튼으로 **새 전시회 등록**을 빠르게 할 수 있습니다.
- **판매(구매 요청)**
  - 전시회별 구매 요청 목록을 확인합니다.
  - 승인/거절 버튼으로 상태를 바꿀 수 있습니다. (현재는 화면 반영 중심이며, 서버 반영은 “개선 포인트” 참고)
- **NFC 라이터**
  - 작품 식별 ID를 입력하고, NFC 태그에 **`imery://collect/{artworkId}`** 형식으로 기록합니다.
  - 이렇게 만든 태그를 관람객 앱이 스캔하면 해당 작품으로 연결되는 구조를 전제로 합니다.
- **My Page(설정)**
  - 다크 모드, 알림(토글), 언어(KO/EN) 등을 설정합니다.

### “NFC 태그”가 왜 필요한가요?

작품 옆에 NFC 태그를 붙여두면 관람객이 휴대폰으로 스캔했을 때,
- 작품 상세 페이지로 바로 이동하거나
- 작품을 “태깅/수집”한 기록을 남기거나
- 구매 의사를 남기는 흐름으로 연결할 수 있습니다.

즉, **오프라인 전시 경험을 모바일 경험과 연결**해주는 다리 역할입니다.

### 데이터는 어디에 저장되나요?

- **작품/전시/구매요청/통계**: 데이터베이스(DB)에 저장
- **작품 이미지**: AWS S3에 업로드되어 URL로 저장

### 어떻게 작동하나요? (작동 방식 요약)

이 앱은 “관리자 앱(휴대폰) ↔ 백엔드 서버 ↔ DB/S3” 구조로 동작합니다.

- **목록을 볼 때(조회)**: 앱이 서버(API)에 요청 → 서버가 DB에서 데이터 조회 → 앱 화면에 표시
- **작품/전시를 등록/수정할 때**
  - 텍스트 정보(제목/작가/설명/가격 등)는 서버를 통해 **DB에 저장**
  - 작품 이미지는 서버가 **S3에 업로드**한 뒤, 이미지 URL을 DB에 저장(그래서 어디서든 이미지를 불러올 수 있음)
- **NFC 태그를 만들 때**
  - 휴대폰이 NFC 태그에 `imery://collect/{artworkId}`를 기록
  - 관람객 앱(별도)이 이 주소를 읽어 작품 화면으로 연결하는 흐름을 전제로 함
- **통계를 볼 때**
  - 서버의 통계 API에서 최근 7일/Top3 등을 받아 그래프로 표시
  - 실데이터가 없으면 데모용 목업 데이터가 표시될 수 있음

### 운영자가 “무엇을 어떻게 수정”할 수 있나요? (화면 기준)

- **전시회 정보 수정**
  - `내 전시회(홈)`에서 전시회 선택 → 우측 상단(연필/수정) → 제목/날짜/장소/설명 수정
- **작품 정보 수정**
  - `내 전시회(홈)`에서 전시회 선택 → 작품 카드의 수정 버튼(연필) → 제목/작가/설명/장르/이미지 수정
  - 이미지를 바꾸면, 서버가 새 이미지를 S3에 올리고 URL을 갱신합니다.
- **작품 추가(등록)**
  - 전시회 상세 화면에서 `작품 추가` → 이미지/정보 입력 → 저장
- **NFC 태그 재발급(다시 쓰기)**
  - `NFC 라이터`에서 동일한 작품 ID로 다시 기록하면 새 태그를 만들 수 있습니다.
  - (주의) NFC 태그는 한 번 기록 후 잠금되는 종류도 있어, 태그 종류에 따라 재기록이 불가할 수 있습니다.

### 데이터가 “어떤 형태로 저장”되나요? (이해용)

- **DB에는 “정보”가 저장됩니다**
  - 전시회: 제목/날짜/장소/설명 등
  - 작품: 전시회 ID, 제목/작가/설명/가격, 이미지 URL, NFC용 식별자 등
  - 구매요청: 어떤 작품을 누가 얼마에 사고 싶은지, 상태(pending/approved/rejected) 등
- **S3에는 “이미지 파일”이 저장됩니다**
  - 앱/웹 어디에서든 이미지 URL로 작품 이미지를 불러올 수 있습니다.

---

## 주요 기능

- **전시회 관리**
  - 전시회 목록 조회
  - 전시회 등록/수정
- **작품 관리**
  - 전시회별 작품 목록 조회
  - 작품 등록/수정(이미지 포함 업로드)
- **NFC 라이터(관리자)**
  - NFC 태그에 `imery://collect/{artworkId}` 기록
- **판매/구매 요청 관리**
  - 전시회별 구매 요청 목록 조회(백엔드 DB 우선, 없으면 목업 fallback)
  - UI에서 승인/거절 상태 변경(현재 화면 로컬 상태 반영 중심)
- **통계 리포트**
  - 전시회별 참여도/최근 7일 추이/Top3
  - 실데이터가 없을 때 목업 데이터 fallback
- **프로필/설정**
  - 다크 모드(스토어: zustand)
  - 언어 토글(KO/EN)

---

## 기술 스택

### 프론트엔드(모바일 앱)

- **Expo SDK**: `~54`
- **React Native**: `0.81`
- **TypeScript**
- **Routing**: `expo-router` (파일 기반 라우팅)
- **State**: `zustand` (언어/테마)
- **Networking**: `axios`
- **NFC**: `react-native-nfc-manager`
- **Charts**: `react-native-chart-kit`

### 백엔드(API)

- **RESTful API + Uvicorn**
- **DB**: MySQL 호환 - TiDB Cloud 등
- **파일 업로드**: AWS S3 (`boto3`)
- **AI**: Google Gemini (`google-generativeai`)
- **배포**: Render (`render.yaml`)

---

## 프로젝트 구조

### 프론트(Expo)

- `app/`: expo-router 라우트(화면)
  - `app/_layout.tsx`: 앱 루트(Stack) + 스플래시 제어
  - `app/(tabs)/_layout.tsx`: 탭 네비게이션(하단 탭바 + 중앙 + 버튼)
  - `app/(tabs)/index.tsx`: 전시회 목록/상세 + 작품 목록 + 작품 추가/수정 모달
  - `app/(tabs)/stats.tsx`: 통계 리포트(실데이터 우선, 실패 시 목업)
  - `app/(tabs)/sales.tsx`: 구매 요청 목록(실데이터 우선, 없으면 목업)
  - `app/(tabs)/write.tsx`: NFC 태그 기록 화면
  - `app/(tabs)/profile.tsx`: 프로필/설정(테마/알림/언어)
- `components/`: 공용 UI/모달
  - `ImeryTopBar.tsx`: 상단 바(로고/언어 토글)
  - `ExhibitionRegisterModal.tsx`: 전시회 등록 모달
  - `AddArtworkModal.tsx`: 작품 등록 모달
  - `EditArtworkModal.tsx`: 작품 수정 모달
- `services/`
  - `api.ts`: Axios 인스턴스 + baseURL 선택 로직
  - `nfcService.ts`: NFC NDEF URI 기록 로직
  - `mock/*`: 통계/판매/프로필 목업 데이터
- `store/`
  - `i18n.ts`: KO/EN 사전 + 언어 상태(zustand)
  - `theme.ts`: 테마 모드 상태(zustand)
- `assets/`: 앱 아이콘/스플래시/폰트 등 정적 리소스

### 백엔드(FastAPI)

- `main.py`: FastAPI 앱 엔트리포인트
  - DB 연결/테이블 준비(admin auth + demo)
  - S3 업로드
  - 게시글(posts) 업로드 및 AI 분석(요약/음악 프롬프트)
  - 관리자 전용 엔드포인트(전시/작품/판매/통계)
- `requirements.txt`: 백엔드 의존성
- `render.yaml`: Render 배포 설정(빌드/시작 커맨드)

---

## 실행 방법(로컬 개발)

### 1) 프론트(Expo) 실행

```bash
npm install
npm run start
```

- Android 에뮬레이터: `npm run android`
- iOS 시뮬레이터: `npm run ios`
- Web: `npm run web`

### 2) 백엔드(FastAPI) 실행

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

기본 포트는 `.env`의 `PORT`(없으면 8000)입니다.

---

## 환경 변수(.env) 안내 (중요)

이 프로젝트는 **민감 정보(DB 비밀번호, AWS 키 등)** 를 환경 변수로 받습니다.  
`.env` 파일/배포 환경 변수에 값을 넣어 사용하세요. (절대 공개 저장소에 업로드 금지)

### 백엔드에서 사용하는 주요 키

```bash
# DB
DB_HOST=...
DB_PORT=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
DB_SSL=true

# 서버
PORT=8000

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
AWS_REGION=...

# Gemini
GEMINI_API_KEY=...

# (선택) Admin 인증 파라미터
ADMIN_PBKDF2_ITERATIONS=200000
ADMIN_SESSION_TTL_HOURS=168
```

### 프론트에서 사용하는(선택) 환경 변수

`services/api.ts`에서 baseURL을 다음 우선순위로 결정합니다.

- `EXPO_PUBLIC_API_URL` (가장 우선)
- `app.json`의 `expo.extra.apiUrl`
- 개발 환경에서 `EXPO_PUBLIC_USE_LOCAL_API=true` 일 때 로컬 주소 추정(에뮬레이터/실기기 케이스 분기)
- 기본값: Render 배포 URL

```bash
EXPO_PUBLIC_API_URL=https://your-api.example.com
EXPO_PUBLIC_USE_LOCAL_API=true
EXPO_PUBLIC_API_PORT=8000
```

---

## 주요 데이터 흐름

### 전시회/작품 관리 흐름

- 전시회 목록: `GET /admin/exhibitions/`
- 전시회 생성: `POST /admin/exhibitions/`
- 전시회별 작품: `GET /admin/exhibitions/{ex_id}/artworks`
- 작품 생성(이미지 포함): `POST /admin/artworks/` (`multipart/form-data`)
- 작품 수정(이미지 선택): `PUT /admin/artworks/{artwork_id}` (`multipart/form-data`)

### NFC 태그 기록 흐름(관리자 앱)

- `services/nfcService.ts`가 NFC 태그에 아래 URI를 기록합니다.
  - `imery://collect/{artworkId}`
- 사용자 앱(별도)이 이 딥링크를 인식해 작품 상세로 이동하는 구조를 전제로 합니다.

### 통계/판매 요청

- 통계:
  - `GET /admin/exhibitions/` (전시회별 total_tags 포함 가능)
  - `GET /admin/exhibitions/{ex_id}/stats` (최근 7일)
  - `GET /admin/exhibitions/{ex_id}/top3`
- 판매/구매 요청:
  - `GET /admin/sales/requests`
  - 상태 변경: `POST /admin/sales/requests/{req_id}/status`

---

## 배포(Render)

`render.yaml` 기준으로 Render에서 다음처럼 실행됩니다.

- build: `pip install -r requirements.txt`
- start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

배포 환경에는 로컬 `.env` 대신 Render의 Environment Variables에 동일한 키들을 설정해야 합니다.

---

## 유지보수 메모(개선 포인트)

- **API baseURL 통일**: 대부분은 `services/api.ts`를 쓰지만, 일부 모달(`EditArtworkModal` 등)은 `SERVER_URL`을 하드코딩합니다.  
  가능하면 `api.ts`로 통일하면 배포/로컬 전환이 쉬워집니다.
- **판매 요청 승인/거절**: 현재 `sales.tsx`는 UI 상태만 변경합니다.  
  실서버 반영을 원하면 `POST /admin/sales/requests/{id}/status` 호출을 연결하세요.

---

## 자주 하는 수정(개발자/운영팀용)

### 1) 앱 이름/아이콘 바꾸기

- 앱 이름: `app.json`의 `expo.name`
- 아이콘:
  - `app.json`의 `expo.icon`
  - Android 적응형 아이콘: `app.json`의 `android.adaptiveIcon.foregroundImage`

아이콘 변경은 캐시가 강해서 **재빌드/재설치**가 필요할 수 있습니다.

### 2) 서버 주소(API) 바꾸기

서버 주소는 `services/api.ts`에서 결정됩니다.

- 가장 쉬운 방법(권장): 환경 변수 `EXPO_PUBLIC_API_URL` 설정
- 또는 `app.json`의 `expo.extra.apiUrl` 변경

### 3) 기능 동작(등록/수정/조회) 로직을 바꾸기

대부분의 화면은 아래 파일들에서 동작을 확인/수정할 수 있습니다.

- 전시/작품 목록/상세: `app/(tabs)/index.tsx`
- 전시 등록 모달: `components/ExhibitionRegisterModal.tsx`
- 작품 등록/수정 모달: `components/AddArtworkModal.tsx`, `components/EditArtworkModal.tsx`
- NFC 기록: `services/nfcService.ts`, `app/(tabs)/write.tsx`
- 통계 화면: `app/(tabs)/stats.tsx`
- 판매 요청 화면: `app/(tabs)/sales.tsx`

백엔드 API 동작 변경은 `main.py`의 각 엔드포인트를 수정합니다.

