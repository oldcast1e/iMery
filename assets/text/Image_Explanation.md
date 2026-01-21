# AI 미술 분석 API 연동 규격서

## 

## 1. 프로세스
1. 현재 개발 중인 앱에서 사용자가 작품 사진을 업로드
2. 해당 이미지가 AWS S3에 업로드 (2. API 기본 정보 참조)
3. AWS S3에 저장된 '이미지 URL'을 서버로 전송, 서버에서 분석 결과를 다시 앱으로 수신

## 
- **Base URL:** https://2tv7p4mphpm7ow-8000.proxy.runpod.net
- **Endpoint:** /analyze
- **Method:** POST
- **Content-Type:** application/json

## 3. 요청 데이터 (Request JSON)
- 서버로 직접 파일을 전송하지 않고, S3 업로드 후 생성된 Public URL을 아래와 같이 전송합니다.
{
  "image_url": "https://your-s3-bucket.s3.amazonaws.com/path/to/image.jpg"
}

## 4. 응답 데이터 (Response JSON)
- 분석 성공 시 아래와 같은 형식으로 결과가 반환됩니다.
{
  "genre": "Landscape",
  "styles": ["Impressionism", "Post-Impressionism"],
  "image_url": "https://your-s3-bucket.s3.amazonaws.com/path/to/image.jpg"
}

## 5. 개발자 참고 사항 (중요)
1. **스타일(styles) 처리**: 
- 스타일은 확률이 높은 순서대로 2개가 리스트(Array)로 전달된다. 
- 이때 스타일이란 작품의 화풍을 의미한다.
- 스타일은 한글로 앱에 구현한다.
- 앱 UI 상에 두 가지 화풍 정보가 모두 노출되도록 구현되어야 한다.
2. **네트워크 타임아웃**: 
- GPU 서버에서 AI 모델 추론이 진행되므로, 타임아웃 설정을 20초 이상으로 넉넉하게 잡아야한다.
3. **CORS 처리**: 서버단에서 모든 도메인에 대해 CORS 허용 처리가 되어 있어 프록시 없이 바로 통신 가능하다.
4. 
