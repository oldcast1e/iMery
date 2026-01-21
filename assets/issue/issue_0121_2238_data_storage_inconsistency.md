# [Architecture] 설계 명세와 실제 구현의 저장소 불충분 일치

## 1. 이슈 개요 (Overview)
- **작성일**: 2026-01-21
- **작성자**: Antigravity
- **중요도**: Medium
- **상태**: Resolved (2026-01-21)

## 2. 환경 정보 (Environment)
| 항목 | 내용 |
| --- | --- |
| Device | Development Server |
| OS Version | macOS |
| App Version | v1.3.0 |
| Browser/Engine | Backend (Node.js/Express) |

## 3. 재현 경로 (Steps to Reproduce)
1. `README_API.md` 및 `README_MUSIC_ASY.md` 확인 시 모든 이미지가 S3에 저장되어야 함을 확인.
2. `server/index.js` 소스 코드 분석 시 `multer.diskStorage`를 사용하여 `uploads/` 로컬 폴더에 저장 중.

## 4. 상세 내용 (Details)
### 기대 동작 (Expected Behavior)
- 모든 이미지 및 음원 파일이 AWS S3에 업로드되고, 고유한 S3 URL이 DB에 저장되어야 함.

### 실제 동작 (Actual Behavior)
- 로컬 파일 시스템에 저장되고 있으며, 이는 배포 환경(Render.com 등)에서 서버 재시작 시 파일이 유실되는 원인이 됨.
- 외부 AI 서버(RunPod)와의 데이터 연동이 불가능함.

### 에러 로그 / 스크린샷 (Evidence)
- `server/index.js:37`: `cb(null, 'uploads/');`
- `server/index.js:129`: `image_url = http://localhost:${PORT}/uploads/${req.file.filename};`

## 5. 원인 및 해결 (Resolution)
- **원인**: 초기 개발 편의성을 위해 로컬 스토리지 방식을 유지했으나, 고도화된 AI 기능 및 배포 안정성 요구사항(README_API.md)을 충족하지 못함.
- **해결 방안**: `multer-s3` 및 `@aws-sdk/client-s3`를 도입하여 모든 업로드 로직(Post, Profile)을 AWS S3로 성공적으로 전환함.
- **관련 PR/Commit**: Local commit to `v.1.3` (S3 Migration & multers3 integration)
## 6. 작성 양식
### issue 저장 경로
- /Users/apple/Desktop/React/iMery/assets/issue
### issue 파일명
- issue_0121_2238_data_storage_inconsistency.md
