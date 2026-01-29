# [기능 개선] AI 분석 결과 UI 태그 파싱 오류 및 차트 미노출

## 1. 이슈 개요 (Overview)

- **작성일**: 2026-01-29
- **작성자**: iMery AI Assistant
- **중요도**: High
- **상태**: Resolved
- **저장 형식**: issue_0129_1745_AI_Analysis_UI_Fix.md
- **이슈 저장 경로**: /Users/apple/Desktop/React/iMery/assets/issue

## 2. 환경 정보 (Environment)

| 항목       | 내용                     |
| ---------- | ------------------------ |
| Node.js    | v22.13.1                 |
| App Type   | React Native (Expo)      |
| OS Version | macOS                    |
| Backend    | Node.js (Express) + TiDB |

## 3. 재현 경로 (Steps to Reproduce)

1. 작품 상세 페이지 진입 (`work/[id]`)
2. "AI 작품 분석 받아보기" 버튼 클릭 또는 이미 분석된 작품 확인
3. 분석 결과 태그(`tags`)가 `[{"id":"...", "label":"..."}]` 형태의 Raw JSON 문자열로 노출됨
4. "그림" 장르가 아님에도 불구하고 의미 없는 확률/스타일 차트가 노출되거나, 반대로 필요한 경우에도 차트가 보이지 않음

## 4. 상세 내용 (Details)

### 기대 동작 (Expected Behavior)

- **태그**: JSON 형식의 태그 데이터가 파싱되어 사람이 읽을 수 있는 텍스트(`label` 값)만 깔끔하게 표시되어야 함
- **차트**: 장르가 "그림"인 경우에만 스타일/장르 확률 차트가 표시되어야 하며, 그 외 장르는 텍스트 요약만 표시되어야 함
- **알림**: "AI 작품 분석이 완료되었습니다" 토스트 알림은 분석 결과가 화면에 나타난 직후에 떠야 함

### 실제 동작 (Actual Behavior)

- **태그**: 데이터베이스에 저장된 JSON 문자열이 그대로 UI에 노출됨
- **차트**: `art_analysis` 테이블 제거 후 차트 데이터 생성 로직이 누락되어 차트가 표시되지 않거나 비정상적으로 표시됨
- **알림**: 분석 요청 즉시 토스트가 떠서 결과가 나오기 전에 완료 메시지가 보임

### 에러 로그 / 스크린샷 (Evidence)

- (스크린샷) 태그 영역에 `[{"id":"작품-...", "label":"황홀경" ...}]` 텍스트 노출
- `ReferenceError: Property 'showToast' doesn't exist` (수정 과정에서 발생했던 에러)

## 5. 원인 및 해결 (Resolution)

### 원인

1. **태그 파싱 미흡**: 모바일 앱에서 `tags` 필드가 문자열(JSON String)로 올 때 이를 파싱하는 로직이 단순 `split`만 처리하고 있었음
2. **데이터 구조 변경**: `art_analysis` 테이블 제거 및 `ai_summary` 단일 필드 사용 정책으로 변경되면서, 기존 차트 렌더링에 필요한 `style1`, `score1` 등의 데이터가 더 이상 제공되지 않음
3. **토스트 순서**: 비동기 로직(`await`) 처리 순서상 토스트 함수 호출이 애니메이션 대기(`setTimeout`)보다 앞에 위치함

### 해결 방안

1. **태그 파싱 로직 강화**:
   - `JSON.parse` 시도 후 객체 배열인 경우 `label` 값을 추출
   - JSON 파싱 실패 시 기존 `split(',')` 로직으로 폴백(fallback) 처리
2. **차트 데이터 동적 생성**:
   - 서버(`POST /analyze`) 응답에 `Posts` 테이블의 `genre`, `style` 필드를 기반으로 한 `result` 객체 추가
   - 클라이언트(`handleAnalyze`)에서 이를 받아 UI 출력용 데이터(`flattenedData`)로 변환
   - `renderAnalysisContent`에서 `genre === '그림'`일 때만 차트를 렌더링하도록 조건 추가
3. **코드 순서 변경**: `showToast` 호출을 `setIsResultVisible(true)` 이후로 이동

### 관련 파일

- `mobile/app/work/[id].tsx`: 태그 파싱, 차트 렌더링 조건, 토스트 순서 수정
- `server/index.js`: `/analyze` 엔드포인트 응답 구조 개선

## 6. 작성 양식

### issue 저장 경로

- /Users/apple/Desktop/React/iMery/assets/issue

### issue 파일명

- issue_0129_1745_AI_Analysis_UI_Fix.md
