# [Refactor] Feature-Sliced Design 구조 도입 및 레거시 제거

## 1. 이슈 개요 (Overview)
- **작성일**: 2026-01-26
- **작성자**: Antigravity
- **중요도**: High
- **상태**: Closed
- **저장 형식**: issue_0126_2105_FSD_Refactor.md
- **이슈 저장 경로**: /Users/apple/Desktop/React/iMery/assets/issue

## 2. 환경 정보 (Environment)
| 항목 | 내용 |
| --- | --- |
| Framework | React Native (Expo SDK 50+) |
| Language | TypeScript |
| Architecture | Feature-Sliced Design (FSD) |
| OS | macOS |

## 3. 작업 내용 (Steps Taken)
1. **레거시 제거**: 마이그레이션이 완료된 `frontend_web` (React Web) 디렉토리 삭제.
2. **구조 개편**: `mobile/src` 디렉토리를 생성하고 FSD 계층 구조(`app`, `pages`, `widgets`, `features`, `entities`, `shared`) 적용.
3. **로직 이동**: `app/` 디렉토리의 비즈니스 로직을 `src/pages/`와 `src/shared/`로 이동.
4. **설정 업데이트**: `tsconfig.json` 및 `babel.config.js`에 `@/` alias 추가하여 절대 경로 import 지원.
5. **Tailwind 설정**: `tailwind.config.js`에 `src/**/*.{js,jsx,ts,tsx}` 경로 추가하여 스타일 적용.

## 4. 상세 내용 (Details)
### 기대 동작 (Expected Behavior)
- 프로젝트 구조가 FSD 아키텍처를 따라야 함.
- 기존의 모든 기능(로그인, 조회, 업로드 등)이 구조 변경 후에도 정상 작동해야 함.
- 레거시 코드가 제거되어 프로젝트 용량이 줄어들어야 함.

### 실제 동작 (Actual Behavior)
- `src/` 중심의 개발 환경이 구축됨.
- `app/` 폴더는 Expo Router의 껍데기 역할만 수행하며, 실제 로직은 `src/pages`에서 관리됨.
- 빌드 오류 없이 앱이 정상 실행됨 확인.

## 5. 원인 및 해결 (Resolution)
> 대규모 리팩토링 및 마이그레이션 마무리 작업
- **원인**: 프로젝트 규모 증가에 대비한 확장성 확보 및 유지보수 효율성 증대. FSD 적용 후 일부 의존성(`lucide-react-native`, `expo-sharing`) 누락 및 NativeWind 타입 정의 부재.
- **해결 방안**: 
  1. Feature-Sliced Design 도입. 계층별(Layer) 역할 분리.
  2. 누락된 패키지 설치 (`lucide-react-native`, `react-native-svg`, `expo-sharing`).
  3. `app.d.ts` 생성 및 NativeWind 타입 정의 추가.
  4. `app/_layout.tsx`에 `cssInterop` 추가하여 3rd party 컴포넌트(`SafeAreaView`) 스타일 지원.
- **관련 PR/Commit**: `refactor: Adopt Feature-Sliced Design (FSD), Remove legacy frontend_web, update docs` & `fix: Resolve missing dependencies and types in FSD pages`
