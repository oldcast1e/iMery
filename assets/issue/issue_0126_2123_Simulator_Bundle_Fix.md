# [Fix] iOS Simulator 연결 및 번들링 설정 오류 해결

## 1. 이슈 개요 (Overview)
- **작성일**: 2026-01-26 21:23
- **작성자**: Antigravity
- **중요도**: High
- **상태**: Closed
- **저장 형식**: issue_0126_2123_Simulator_Bundle_Fix.md
- **이슈 저장 경로**: /Users/apple/Desktop/React/iMery/assets/issue

## 2. 발생한 문제 (Problems)

### 2.1 iOS 시뮬레이터 부팅 실패
- **증상**: `npx expo start --ios` 실행 시 `Unable to boot device because it cannot be located on disk.` 오류 반복.
- **원인**: Expo 또는 Watchman 캐시에 저장된 이전 시뮬레이터(UUID)가 실제 디바이스 목록과 일치하지 않음 (Xcode 업데이트 등으로 인한 UUID 변경 추정).

### 2.2 Expo Router / Babel 설정 오류
- **증상**: 앱 실행 시 `.plugins is not a valid Plugin property` 오류 발생.
- **원인**: 
  1. `babel.config.js`에서 `react-native-reanimated/plugin`의 순서가 잘못됨 (반드시 마지막이어야 함).
  2. NativeWind v4 사용 시 필요한 `metro.config.js` 설정 파일 부재.

## 3. 해결 과정 (Resolution)

### 3.1 시뮬레이터 연결 복구
1. **Watchman 초기화**: `watchman watch-del-all`
2. **시뮬레이터 초기화**: `xcrun simctl shutdown all` 및 `erase all` (캐시된 데이터 삭제)
3. **수동 부팅**: `xcrun simctl boot <Valid-UUID>`로 특정 기기(iPhone 16 Pro 등)를 먼저 실행.
4. **캐시 클리어 실행**: `npx expo start --ios --clear`로 Expo 런처가 올바른 기기를 인식하도록 유도.

### 3.2 번들링 설정 수정
1. **Babel Config 수정**: 
   - `babel.config.js`의 `plugins` 배열에서 `react-native-reanimated/plugin`을 가장 마지막 순서로 이동.
2. **Metro Config 생성**:
   - `metro.config.js` 파일 생성.
   - `nativewind/metro`의 `withNativeWind`를 사용하여 NativeWind 설정 적용.

## 4. 결과 (Result)
- iOS 시뮬레이터가 정상적으로 Expo 서버에 연결됨.
- NativeWind 및 Reanimated 관련 번들링 오류 해소.

## 5. 참고 (References)
- [Expo Docs - Clear Cache](https://docs.expo.dev/more/expo-cli/#clearing-caches)
- [Reanimated Plugin Setup](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/#babel-plugin)
