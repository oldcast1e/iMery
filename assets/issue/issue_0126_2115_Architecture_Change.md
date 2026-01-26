# [Refactor] Standard Expo Architecture 로의 전환

## 1. 이슈 개요 (Overview)
- **작성일**: 2026-01-26
- **작성자**: Antigravity
- **중요도**: High
- **상태**: Closed
- **저장 형식**: issue_0126_2115_Architecture_Change.md
- **이슈 저장 경로**: /Users/apple/Desktop/React/iMery/assets/issue

## 2. 환경 정보 (Environment)
| 항목 | 내용 |
| --- | --- |
| Framework | React Native (Expo SDK 50+) |
| Architecture | Standard Expo Router (app-centric) |
| File Structure | app/, components/, services/, hooks/ |

## 3. 구조 변경 내용 (Changes)
1. **`src/` 디렉토리 제거**: React 웹 개발 관습인 `src` 중심 구조를 폐기하고, Expo 표준인 Root-level 구조 채택.
2. **`app/` 중심 개발 환경**: 이전 FSD 구조에서 `src/pages`에 있던 모든 페이지 로직을 `app/` 라우트 파일 내부로 이동.
3. **디렉토리 재편**:
   - `src/shared/api` → `services/api.ts`
   - `src/pages/**` → `app/**`
   - `components/`, `hooks/`, `constants/` 등 루트 레벨 디렉토리 활성화.
4. **Alias 업데이트**: `tsconfig.json` 및 `babel.config.js`에서 `@/` 대신 `@services`, `@components` 등 명시적 Alias 사용.

## 4. 상세 내용 (Details)
### 변경 이유 (Rationale)
- "**`app/` 폴더는 Expo Router의 껍데기 역할만 수행하는 것은 비효율적**"이라는 피드백 반영.
- Expo Router의 파일 시스템 기반 라우팅 특성을 살려, `app/` 디렉토리를 직관적인 개발 공간으로 활용.
- React Native 생태계의 보편적인(Universal) 디렉토리 구조 준수.

### 기대 효과 (Expected Outcome)
- 프로젝트 진입 장벽 낮춤 (Expo Router 표준 문서와 일치).
- 불필요한 import depth 감소 (`../../src/pages/...` 제거).
- 파일 탐색 및 유지보수 용이성 증대.

## 5. 원인 및 해결 (Resolution)
- **원인**: 사용자 요청에 따른 아키텍처 방향성 수정 (FSD → Standard Expo).
- **해결 방안**: 전체적인 폴더 구조 리팩토링 및 Import 경로 수정.
- **관련 PR/Commit**: `refactor: Move to Standard Expo Router Architecture (app-centric)`
