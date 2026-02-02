# NFC Data Protocol Specification (v1.0)

본 문서는 **iMery 사용자 앱(User App)**과 **관리자 앱(Admin App)** 간의 데이터 호환성을 보장하기 위해 NFC 태그 데이터 형식을 정의합니다.
두 앱의 개발자는 본 규격을 엄격히 준수하여 데이터 파싱 오류를 방지해야 합니다.

---

## 1. 기술 표준 (Technical Standard)

| 항목            | 규격                            | 비고                                          |
| --------------- | ------------------------------- | --------------------------------------------- |
| **NFC 기술**    | NDEF (NFC Data Exchange Format) | 모든 표준 NFC 태그 지원                       |
| **레코드 타입** | Text Record (`TNF=1`, `Type=T`) | 일반 텍스트 모드 사용                         |
| **인코딩**      | UTF-8                           | 한글 지원 필수                                |
| **데이터 포맷** | **JSON String**                 | 텍스트 페이로드는 유효한 JSON 문자열이어야 함 |

---

## 2. 데이터 스키마 (JSON Schema)

태그에 저장되는 JSON 객체는 다음 필드들을 포함해야 합니다.
**Key는 camelCase를 원칙으로 합니다.**

| Key              | Type     |  필수   | 설명            | 제약사항 및 예시                                                              |
| ---------------- | -------- | :-----: | --------------- | ----------------------------------------------------------------------------- |
| `title`          | `string` | **YES** | 작품 제목       | 최대 100자 권장                                                               |
| `artist`         | `string` | **YES** | 작가 이름       | "작가 미상"인 경우 "Unknown" 또는 빈 문자열 허용                              |
| `description`    | `string` |   NO    | 작품 설명       | AI 분석 대신 표시될 텍스트. 줄바꿈(`\n`) 지원                                 |
| `exhibitionName` | `string` |   NO    | 전시회 이름     | 해당 작품이 전시된 전시회명                                                   |
| `imageUrl`       | `string` | **YES** | 작품 이미지 URL | **HTTPS 필수**. S3 등의 호스팅된 이미지 경로                                  |
| `price`          | `string` |   NO    | 작품 가격       | 숫자만 포함된 문자열 권장 (예: "10000")                                       |
| `genre`          | `string` | **YES** | 작품 장르       | `iMery` 장르 분류 사용 (`그림`, `조각`, `사진`, `판화`, `미디어아트`, `기타`) |
| `style`          | `string` |   NO    | 작품 스타일     | 예: `인상주의`, `추상화`, `모던`                                              |

### 2.1 예외 처리 규칙 (User App 동작 기준)

1. **필수 필드 누락**: `title`이나 `imageUrl` 누락 시, 사용자 앱에서 "유효하지 않은 태그" 에러가 발생할 수 있음.
2. **타입 불일치**: `price`에 "10,000원"과 같이 문자열이 포함될 경우 파싱 과정에서 숫자만 추출하거나 그대로 보여질 수 있음. (숫자 형태 문자열 "10000" 권장)
3. **JSON 파싱 실패**: Malformed JSON인 경우 태그 인식이 실패함.

---

## 3. 데이터 예시 (Example Payload)

관리자 앱은 NFC 태그 쓰기(Write) 시 아래와 같은 JSON 문자열을 생성하여 태그에 기록해야 합니다.

### [Case 1] 모든 정보가 있는 경우 (권장)

```json
{
  "title": "별이 빛나는 밤",
  "artist": "빈센트 반 고흐",
  "description": "네덜란드의 후기 인상주의 화가 빈센트 반 고흐의 대표작 중 하나로, 1889년 생레미드프로방스의 정신병원에서 요양할 때 그렸다.",
  "exhibitionName": "고흐의 정원: 특별전",
  "imageUrl": "https://imery.s3.ap-northeast-2.amazonaws.com/exhibitions/2026/starry_night.jpg",
  "price": "150000000",
  "genre": "그림",
  "style": "후기 인상주의"
}
```

### [Case 2] 필수 정보만 있는 경우

```json
{
  "title": "무제 (Untitled)",
  "artist": "Unknown",
  "imageUrl": "https://imery.s3.ap-northeast-2.amazonaws.com/uploads/temp/scan_001.jpg",
  "genre": "기타"
}
```

---

## 4. 운영 프로세스 가이드

### 관리자 앱 (Admin App)

1. **입력 폼**: 관리자는 작품 정보를 입력한다.
2. **이미지 업로드**: 이미지를 먼저 S3 서버에 업로드하고, 반환된 URL을 확보한다.
3. **JSON 생성**: 입력된 정보와 이미지 URL을 위 스키마에 맞춰 JSON 객체로 변환한다.
4. **태그 쓰기**: `JSON.stringify()` 된 문자열을 NFC 태그에 NDEF Text 레코드로 쓴다.

### 사용자 앱 (iMery User App)

1. **태그 감지**: Android/iOS 네이티브 기능을 통해 태그를 스캔한다.
2. **파싱**: NDEF Text 레코드를 읽어 JSON으로 파싱한다 (`JSON.parse`).
3. **유효성 검사**: `title`, `imageUrl` 등 핵심 데이터 존재 여부를 확인한다.
4. **서버 전송**: 파싱된 데이터를 `POST /posts` API 규격(Multipart/form-data)에 맞춰 변환 후 전송한다.
   - `exhibitionName` -> API `exhibition_name`
   - `imageUrl` -> API `image_url`
   - `source`: `'nfc'` (고정값)

---

## 5. 변경 이력

- **v1.0** (2026.02.02): 최초 생성. iMery v2.7 기준.
