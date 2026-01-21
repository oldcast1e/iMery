[명세서] Art Analysis & Music Generation API (v7.0.0)
작성일: 2026년 1월 21일
문서 상태: 최종 확정 (V7)
환경: RunPod (GPU), AWS S3, TiDB Cloud
1. 개요 (Overview)
본 시스템은 사용자가 제공한 이미지를 기반으로 AI가 미술 장르와 화풍을 분석하고, 그 결과에 어울리는 배경 음악을 생성하는 통합 API입니다. 모든 데이터는 AWS S3와 TiDB Cloud를 통해 영구 보관 및 관리됩니다.
2. 인프라 정보 (Infrastructure)
API 서버: FastAPI (RunPod GPU 환경)
Base URL: https://2tv7p4mphpm7ow-8000.proxy.runpod.net
데이터베이스: TiDB Cloud (SSL 보안 연결 필수)
저장소: AWS S3 (이미지 및 음원 파일 영구 저장)
AI 모델: - Vision: Image Classification Model (Genre 1종, Style 5종 추출)
Audio: MusicGen Medium (1.5B) 모델 (약 10초 분량의 음원 생성)
3. API 상세 명세
[POST] /analyze
이미지 URL을 수신하여 분석 및 음악 생성을 수행합니다.
A. 요청 (Request)
Endpoint: /analyze
Content-Type: application/json
Body:
| 필드명 | 타입 | 설명 | 필수 |
| :--- | :--- | :--- | :--- |
| image_url | String | AWS S3에 업로드된 원본 이미지의 전체 URL | O |
Request Example:
{
  "image_url": "[https://your-s3-bucket.s3.amazonaws.com/uploads/input_image.jpg](https://your-s3-bucket.s3.amazonaws.com/uploads/input_image.jpg)"
}


B. 응답 (Response)
성공 상태: 200 OK
결과 데이터:
| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| genre | String | 분석된 상위 1개 장르 (예: Landscape) |
| styles | Array | 상위 5개 화풍 명칭(name) 및 확률값(score) 객체 배열 |
| image_url | String | 분석에 사용된 원본 S3 이미지 주소 |
| music_url | String | 생성 완료된 음악 파일의 S3 주소 (.wav) |
Response Example:
{
  "genre": "Landscape",
  "styles": [
    { "name": "Impressionism", "score": 0.8521 },
    { "name": "Post-Impressionism", "score": 0.1245 },
    { "name": "Realism", "score": 0.0152 },
    { "name": "Abstract", "score": 0.0051 },
    { "name": "Expressionism", "score": 0.0031 }
  ],
  "image_url": "[https://your-s3-bucket.s3.amazonaws.com/uploads/input_image.jpg](https://your-s3-bucket.s3.amazonaws.com/uploads/input_image.jpg)",
  "music_url": "[https://your-s3-bucket.s3.amazonaws.com/generated/music_result.wav](https://your-s3-bucket.s3.amazonaws.com/generated/music_result.wav)"
}


4. 데이터베이스 설계 (TiDB)
테이블명: art_analysis
컬럼명
타입
설명
id
INT
Primary Key, Auto Increment
genre
VARCHAR
상위 1개 장르 명칭
style1~5
VARCHAR
상위 5개 화풍 명칭
score1~5
FLOAT
상위 5개 화풍의 정확도 (0.0~1.0)
image_url
VARCHAR
이미지 S3 경로
music_url
VARCHAR
생성 음악 S3 경로
created_at
TIMESTAMP
생성 일시 (Default Now)

5. 작업자별 가이드
앱 개발자 (React Native)
타임아웃 설정: MusicGen Medium 모델 연산으로 인해 요청 처리에 약 40~60초가 소요될 수 있습니다. 네트워크 타임아웃을 넉넉히 설정하십시오.
UI 구현: styles 배열에 포함된 5개의 화풍 이름과 확률값을 활용하여 분석 그래프나 리스트를 구현하십시오.
SQL 작업자
SSL 설정: TiDB Serverless 사용 시 서버 보안 정책에 따라 SSL 접속이 필수입니다.
화이트리스트: RunPod 서버의 IP(curl ifconfig.me 결과값)를 TiDB IP Access List에 등록해 주십시오.
