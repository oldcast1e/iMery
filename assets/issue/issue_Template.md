# [분류] 이슈 제목

## 1. 이슈 개요 (Overview)
- **작성일**: YYYY-MM-DD
- **작성자**: 이름
- **중요도**: High / Medium / Low
- **상태**: Open

## 2. 환경 정보 (Environment)
| 항목 | 내용 |
| --- | --- |
| Device | (예: iPhone 14 Pro) |
| OS Version | (예: iOS 17.0) |
| App Version | (예: v1.2.0) |
| Browser/Engine | (필요 시 작성) |

## 3. 재현 경로 (Steps to Reproduce)
1. (예: 앱 실행 후 메인 화면 진입)
2. (예: 우측 상단 설정 버튼 클릭)
3. (예: 로그아웃 버튼 터치 시 앱 강제 종료)

## 4. 상세 내용 (Details)
### 기대 동작 (Expected Behavior)
- (예: 정상적으로 로그아웃 팝업이 노출되어야 함)

### 실제 동작 (Actual Behavior)
- (예: 팝업 없이 앱이 즉시 종료됨 (Crash 발생))

### 에러 로그 / 스크린샷 (Evidence)
- `NullPointerException at AuthManager.kt:42`
- (스크린샷 첨부 영역)

## 5. 원인 및 해결 (Resolution)
> 이슈 해결 후 작성
- **원인**: (예: Auth 토큰이 null일 때 예외 처리 누락)
- **해결 방안**: (예: 옵셔널 바인딩 추가 및 예외 처리 로직 적용)
- **관련 PR/Commit**: [Link]

## 6. 작성 양식
### issue 저장 경로
- /Users/apple/Desktop/React/iMery/assets/issue
### issue 파일명
- issue_MMDD_hhmm_이슈명.md (hhmm은 시분, 24시간 기준)