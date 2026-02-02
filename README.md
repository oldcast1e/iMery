# iMery (v2.6) - Mobile Art Archive & Social Community

> **"작품을 듣는 시간, iMery"**
>
> 감상한 미술 작품을 기록하고, AI 분석으로 화풍을 발견하며, 친구들과 취향을 공유하는 **모바일 앱**입니다.

![iMery Banner](https://via.placeholder.com/800x200?text=iMery+Mobile+v2.6+Dashboard)

---

## 🚀 Quick Start

### 1. 자동 실행 (권장)

```bash
./rebuild_and_start.sh
```

### 2. 수동 실행

**Terminal 1 (Server)**

```bash
cd server
npm run dev
# Running on http://localhost:3001
```

**Terminal 2 (Mobile)**

```bash
cd mobile
npx expo start -c
# Scan QR code with Expo Go (iOS/Android)
```

---

> Created by **Oldcastle**

## 📚 Documentation Navigator

개발자 및 팀원은 아래 문서를 참고하여 협업을 진행합니다.

| 문서                                               | 설명                                                        | 대상                    |
| :------------------------------------------------- | :---------------------------------------------------------- | :---------------------- |
| **[📱 READ SETUP (Mobile)](./README_SETUP_RN.md)** | **[필수]** 모바일 앱(Expo) 설치, 실행, 아키텍처 상세 가이드 | **App Developers**      |
| [🗄️ READ DB](./README_DB.md)                       | 데이터베이스 스키마(ERD), 테이블 정의, 쿼리 패턴            | **Backend / Fullstack** |
| [🔗 READ API](./README_API.md)                     | API 엔드포인트 명세, 요청/응답 예시, 인증 방식              | **All Developers**      |
| [📝 Update Log](./UpdataLog.md)                    | 버전별 상세 변경 내역 (Changelog)                           | **PM / All**            |
| [🌐 Legacy Web](./README_SETUP.md)                 | (구버전) React Web 시절의 로직 레퍼런스 (참고용)            | **Reference**           |

---

## 📌 Key Features

### 1. 홈 (Home) & 아카이빙

- **위젯 (Widgets)**: 홈 상단 배너 슬라이드를 통해 최근 트렌드 및 전시 정보 확인.
- **AI 작품 분석**: 업로드된 이미지를 Vision AI로 분석하여 **화풍, 구성, 색채** 차트 제공.
- **오디오 도슨트**: 작품 분위기에 맞는 BGM 자동 재생 (Safe Audio System).
- **무한 스크롤**: "더보기" 페이징으로 끊김 없는 탐색 경험.

### 2. I-Record (Taste Analysis) 🆕

- **Activity Heatmap**: 지난 5개월간의 활동 빈도를 **GitHub 스타일 히트맵**으로 시각화.
- **취향 대시보드**: 가장 많이 수집한 장르, 스타일, 작가(Top 10) 통계 제공.

### 3. 소셜 커뮤니티 (Community)

- **피드 탭**: 전체 공개(Community) / 친구 공개(Following) 피드 분리.
- **티켓 (Memory Ticket)**: 전시회 방문 기록을 **오리지널 티켓** 형태의 굿즈 UI로 소장.
- **소셜 액션**: 좋아요, 댓글, 북마크, 친구 요청/수락.

---

## 🛠️ Tech Stack

| Category     | Technology                                                                     |
| :----------- | :----------------------------------------------------------------------------- |
| **Frontend** | React Native, **Expo SDK 51**, **Expo Router**, NativeWind (Tailwind), Zustand |
| **Backend**  | Node.js, Express, **TiDB Cloud** (MySQL), AWS S3, JWT                          |
| **AI**       | RunPod (Vision), Gemini (Audio Prompting)                                      |

---
