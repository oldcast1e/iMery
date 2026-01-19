# iMery Setup & Execution Guide (v0.1.1)

이 문서는 iMery 프로젝트(v0.1.1 - FSD 구조 개편 및 UI 업데이트 적용됨)의 실행 방법을 상세히 설명합니다.

## 1. 사전 요구 사항 (Prerequisites)
프로젝트 실행을 위해 다음 소프트웨어가 설치되어 있어야 합니다.
- **Node.js** (v18.0.0 이상 권장)
- **MySQL** (v8.0 이상 권장)
- **Git** (선택 사항)

## 2. 프로젝트 설치 (Installation)

터미널을 열고 프로젝트 루트 디렉토리에서 의존성을 설치합니다.

```bash
# iMery 루트 폴더로 이동
cd /path/to/iMery

# 의존성 패키지 설치
npm install
```

## 3. 데이터베이스 설정 (Database Setup)
MySQL 데이터베이스가 실행 중이어야 합니다.

1. MySQL 접속 및 데이터베이스 생성:
```sql
CREATE DATABASE imery_db;
USE imery_db;
```

2. 테이블 생성:
`assets/text/database_setting.md` 파일에 명시된 SQL 쿼리를 순서대로 실행하여 테이블을 생성하세요. (Users, Posts, Comments, Likes, Friendships 등)

3. 서버 DB 연결 설정:
`server/db.js` 파일에서 DB 연결 정보를 본인의 환경에 맞게 확인/수정하세요.
```javascript
// server/db.js 예시
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'YOUR_PASSWORD', // 본인의 DB 비밀번호
  database: 'imery_db'
});
```

## 4. 프로젝트 실행 (Running the Project)

서버와 클라이언트를 각각 별도의 터미널에서 실행해야 합니다.

### 터미널 1: 백엔드 서버 실행
```bash
# iMery/server 폴더로 이동 (루트에서)
cd server

# 서버 실행 (기본 포트: 3001)
node index.js
```
*성공 시 메시지: `Server running on port 3001`*

### 터미널 2: 프론트엔드 클라이언트 실행
```bash
# iMery 루트 폴더에서
npm run dev
```
*성공 시 메시지:*
```
  VITE v5.x.x  ready in x ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/  <-- 모바일 접속 주소
```

## 5. 모바일/외부 기기에서 접속하기
v0.1.1 업데이트로 모바일 환경 테스트 지원이 추가되었습니다.

1. 실행 중인 PC와 모바일 기기가 **동일한 Wi-Fi 네트워크**에 접속되어 있는지 확인합니다.
2. PC의 방화벽 설정에서 Node.js/Vite의 외부 접속이 허용되어 있어야 합니다.
3. 터미널 2(프론트엔드)에 표시된 `Network` 주소를 모바일 기기의 브라우저(Safari, Chrome 등)에 입력하여 접속합니다.
   - 예: `http://192.168.0.10:5173`

> **Note**: 백엔드 API(이미지 로딩 등)가 정상 작동하려면, 프론트엔드 코드 내의 API 요청 주소도 `localhost`가 아닌 `Network IP`를 바라봐야 할 수 있습니다. 
> 현재 설정은 `localhost:3001`을 바라보고 있으므로, 모바일에서 **이미지나 API 데이터가 보이지 않는 경우**, `src/api/client.js` 또는 관련 설정에서 `http://localhost:3001`을 `http://YOUR_PC_IP:3001`로 변경해야 완벽하게 동작합니다. 
> (PC 브라우저 개발자 도구의 '장치 모드'를 사용하는 것을 권장합니다.)

## 6. 데모 실행: 스마트폰 화면처럼 보기 (Mobile Simulation)
이 프로젝트는 **React Web** 프로젝트이므로, 요청하신 Expo Go(React Native 전용)는 사용할 수 없습니다. 대신 다음 방법으로 스마트폰 UI 환경을 완벽하게 시뮬레이션할 수 있습니다.

### 방법 1: 브라우저 개발자 도구 (가장 간편함)
별도의 설치 없이 브라우저에서 바로 모바일 화면 크기로 테스트할 수 있습니다.

1. 크롬(Chrome) 브라우저에서 `http://localhost:5173` 접속.
2. `F12` (또는 `Cmd + Option + I`)를 눌러 **개발자 도구** 열기.
3. 좌측 상단의 **Device Toggle Icon** (스마트폰 모양 아이콘) 클릭 (단축키: `Cmd + Shift + M`).
4. 상단 메뉴에서 원하는 기기(예: iPhone 12 Pro, Samsung Galaxy S20)를 선택.
5. 화면이 스마트폰 비율로 변경되며 터치 이벤트를 시뮬레이션할 수 있습니다.

### 방법 2: iOS 시뮬레이터 (맥북 M1/M2/M3 추천)
Xcode에 포함된 iOS 시뮬레이터를 사용하여 **실제 아이폰 화면** 속에서 웹사이트를 구동할 수 있습니다. 가장 "앱" 같은 느낌을 줍니다.

1. **Xcode**가 설치되어 있어야 합니다. (App Store에서 무료 설치)
2. 터미널에서 다음 명령어로 시뮬레이터 실행:
   ```bash
   # 일반적인 실행 방법
   open -a Simulator
   
   # 위 명령어가 'Unable to find...' 에러로 실패할 경우:
   open /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app
   ```
   *(또는 Spotlight 검색(Cmd + Space)에서 `Simulator`를 검색하여 실행)*
3. 시뮬레이터가 켜지면, 시뮬레이터 내의 **Safari** 앱 실행.
4. 주소창에 `http://localhost:5173` 입력.
5. 실제 아이폰과 동일한 UI 환경에서 앱을 테스트할 수 있습니다.

*(참고: Expo Go는 React Native 앱을 위한 도구이므로 본 프로젝트에는 해당되지 않지만, 위 두 가지 방법으로 충분히 모바일 데모 시연이 가능합니다.)*

## 6. 문제 해결 (Troubleshooting)

### Q. `npm run dev` 실행 시 에러가 발생해요.
- `Failed to resolve import...`: 파일 경로가 올바른지 확인하세요. 최근 폴더 구조가 변경되었으므로(`src/pages`, `src/widgets` 등), `node_modules`를 삭제(`rm -rf node_modules`)하고 `npm install`을 다시 실행해보세요.

### Q. 이미지가 보이지 않아요.
- 백엔드 서버가 켜져 있는지 확인하세요 (터미널 1).
- DB에 이미지 경로가 올바르게 저장되었는지 확인하세요.

### Q. 데이터베이스 연결 오류 (`ECONNREFUSED`)
- MySQL 서버가 실행 중인지 확인하세요.
- `server/db.js`의 비밀번호가 정확한지 확인하세요.
