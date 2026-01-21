# AI 미술 분석 API 연동 규격서

## 1. 개요
- 사용자가 사진을 찍어 AWS S3에 업로드한 후, 생성된 '이미지 URL'을 서버로 전송하여 분석 결과를 받아오는 프로세스입니다.

## 2. API 기본 정보
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
1. **스타일(styles) 처리**: 스타일은 확률이 높은 순서대로 2개가 리스트(Array)로 전달됩니다. 앱 UI 상에 두 가지 화풍 정보가 모두 노출되도록 구현 부탁드립니다.
2. **네트워크 타임아웃**: GPU 서버에서 AI 모델 추론이 진행되므로, 타임아웃 설정을 20초 이상으로 넉넉하게 잡아주시기 바랍니다.
3. **CORS 처리**: 서버단에서 모든 도메인에 대해 CORS 허용 처리가 되어 있어 프록시 없이 바로 통신 가능합니다.
4. **이미지 로딩**: 응답으로 받은 image_url을 그대로 <Image> 컴포넌트에 사용하시면 됩니다.