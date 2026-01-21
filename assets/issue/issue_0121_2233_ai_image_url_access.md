# [Backend] AI 분석 이미지 접근 불가 (Localhost URL)

## 1. 이슈 개요 (Overview)
- **작성일**: 2026-01-21
- **작성자**: Antigravity
- **중요도**: High (Blocking AI features)
- **상태**: Resolved (2026-01-21)

## 2. 환경 정보 (Environment)
| 항목 | 내용 |
| --- | --- |
| Device | Development Server |
| OS Version | macOS |
| App Version | v1.3.0 |
| Browser/Engine | Node.js (Vite) |

## 3. 재현 경로 (Steps to Reproduce)
1. 작품 등록 시 이미지를 로컬 서버(`uploads/`)에 저장.
2. `image_url`이 `http://localhost:3001/uploads/...`로 생성됨.
3. 'AI 분석 받아보기' 버튼 클릭 시 백엔드 프록시가 RunPod AI 서버로 해당 URL 전송.
4. RunPod 서버(Remote)가 로컬 주소인 `localhost`에 접근하지 못해 분석 실패.

## 4. 상세 내용 (Details)
### 기대 동작 (Expected Behavior)
- AI 서버가 `image_url`에 접근하여 이미지 데이터를 가져오고 분석을 수행해야 함.

### 실제 동작 (Actual Behavior)
- RunPod 서버에서 `Connection Refused` 또는 `DNS Lookup Failure` 발생으로 분석 요청 실패.

### 에러 로그 / 스크린샷 (Evidence)
- `[AI Error]: AI Server responded with 400: {"error": "Invalid image URL or unreachable"}` (예상 로그)

## 5. 원인 및 해결 (Resolution)
- **원인**: 백엔드 서버가 로컬 환경에서 실행 중이며, 생성된 이미지 URL이 공인 IP/도메인이 아닌 `localhost`를 가리키고 있어 외부 AI 서버(RunPod)에서 접근 불가했음.
- **해결 방안**: AWS S3 스토리지를 도입하여 이미지를 퍼블릭 S3 URL로 업로드하도록 인프라 마이그레이션 수행.
- **관련 PR/Commit**: Local commit to `v.1.3` (S3 Migration)
## 6. 작성 양식
### issue 저장 경로
- /Users/apple/Desktop/React/iMery/assets/issue
### issue 파일명
- issue_0121_2233_ai_image_url_access.md
