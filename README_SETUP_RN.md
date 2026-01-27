# iMery React Native Setup & Execution Guide (v.2.0)

**React Native Migration - Complete Developer & Agent Handoff Documentation**

## 🚀 Quick Start (빠른 실행)

필요한 라이브러리가 모두 설치된 상태에서 아래 명령어로 앱을 실행하세요.

### 1. 백엔드 서버 실행

```bash
cd server
node index.js
```

### 2. 모바일 앱 실행 (새 터미널)

```bash
cd mobile
npx expo start -c
```

---

이 문서는 iMery 프로젝트의 React Native 버전(v.2.0) 설치, 설정, 실행 방법 및 전체 아키텍처를 상세히 설명합니다.  
기존 React 웹 앱(v1.5)에서 React Native 모바일 앱으로의 마이그레이션 가이드를 포함합니다.

---

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요-project-overview)
2. [마이그레이션 요약](#2-마이그레이션-요약-migration-summary)
3. [사전 요구 사항](#3-사전-요구-사항-prerequisites)
4. [프로젝트 설치](#4-프로젝트-설치-installation)
5. [환경 설정](#5-환경-설정-environment-setup)
6. [프로젝트 실행](#6-프로젝트-실행-running-the-project)
7. [프로젝트 구조](#7-프로젝트-구조-project-structure)
8. [기술 스택](#8-기술-스택-technology-stack)
9. [React Native 아키텍처](#9-react-native-아키텍처-architecture)
10. [주요 기능 매핑](#10-주요-기능-매핑-feature-mapping)
11. [개발 가이드](#11-개발-가이드-development-guide)
12. [테스팅 가이드](#12-테스팅-가이드-testing-guide)
13. [배포 가이드](#13-배포-가이드-deployment)
14. [문제 해결](#14-문제-해결-troubleshooting)
15. [마이그레이션 체크리스트](#15-마이그레이션-체크리스트-migration-checklist)

---

## 1. 프로젝트 개요 (Project Overview)

### iMery v2.0 - React Native Mobile App

**iMery**는 미술관에서 감상한 작품을 기록하고, AI 분석을 받으며, 친구들과 소통할 수 있는 **모바일 앱**입니다.

#### 버전 히스토리

| 버전     | 플랫폼                  | 기술 스택               | 설명                           |
| -------- | ----------------------- | ----------------------- | ------------------------------ |
| **v2.0** | 📱 Mobile (iOS/Android) | **React Native + Expo** | 모바일 네이티브 앱 (현재 버전) |
| v1.5     | 🌐 Web                  | React + Vite + Tailwind | 웹 애플리케이션 (레거시)       |

#### 주요 특징

✅ **100% 기능 유지** - 웹 버전의 모든 기능을 모바일 환경에서 구현  
✅ **네이티브 UX** - iOS/Android 플랫폼에 최적화된 사용자 경험  
✅ **Expo Go 지원** - QR 코드로 즉시 테스트 및 공유 가능  
✅ **동일한 백엔드** - 기존 Express + TiDB + AWS S3 인프라 재사용  
✅ **오프라인 지원** - AsyncStorage로 데이터 캐싱 및 오프라인 모드

---

## 2. 마이그레이션 요약 (Migration Summary)

### 2.1 주요 변경사항

| 구분              | React Web (v1.5) | React Native (v2.0)     |
| ----------------- | ---------------- | ----------------------- |
| **프레임워크**    | React 19 + Vite  | React Native + Expo     |
| **라우팅**        | Browser History  | React Navigation        |
| **스타일링**      | Tailwind CSS     | NativeWind / StyleSheet |
| **애니메이션**    | Framer Motion    | React Native Reanimated |
| **아이콘**        | Lucide React     | Expo Vector Icons       |
| **스토리지**      | localStorage     | AsyncStorage            |
| **이미지 업로드** | HTML Input       | Expo ImagePicker        |
| **오디오**        | HTML5 Audio      | Expo AV                 |
| **캘린더**        | Custom Component | react-native-calendars  |
| **빌드 도구**     | Vite             | Metro Bundler           |

### 2.2 유지되는 요소

- ✅ **백엔드 API** - 모든 REST 엔드포인트 동일
- ✅ **데이터베이스** - TiDB 스키마 및 데이터 변경 없음
- ✅ **AWS S3** - 이미지 업로드 및 저장 방식 동일
- ✅ **AI 분석** - RunPod 및 Gemini API 연동 동일
- ✅ **인증 시스템** - JWT 토큰 방식 동일
- ✅ **비즈니스 로직** - 태그 시스템, 평점, 폴더 구조 등 모두 동일

---

## 3. 사전 요구 사항 (Prerequisites)

### 3.1 필수 소프트웨어

- **Node.js** v18.0.0 이상 (v20+ 권장)
- **npm** 9.0+ (Node.js 설치 시 자동 설치)
- **Git** 2.30+ (버전 관리)
- **Expo CLI** - 자동 설치됨 (`npx expo`)

### 3.2 모바일 개발 환경

**옵션 1: Expo Go (권장 - 빠른 테스트)**

- iOS: App Store에서 "Expo Go" 설치
- Android: Play Store에서 "Expo Go" 설치

**옵션 2: 시뮬레이터/에뮬레이터 (고급)**

- **iOS Simulator** (macOS 전용): Xcode 설치 필요
- **Android Emulator**: Android Studio 설치 필요

### 3.3 클라우드 서비스 (백엔드)

- **AWS Account** - S3 이미지 스토리지
- **TiDB Cloud Account** - MySQL 호환 데이터베이스
- **RunPod Account** (선택) - AI 이미지 분석
- **Expo Account** (무료) - 앱 배포 및 공유

### 3.4 권장 개발 도구

- **VSCode** with extensions:
  - React Native Tools
  - ESLint
  - Prettier
  - React Native Snippet
  - Expo Tools

---

## 4. 프로젝트 설치 (Installation)

### 4.1 저장소 클론 및 브랜치 전환

```bash
# GitHub에서 프로젝트 클론
git clone https://github.com/oldcast1e/iMery.git
cd iMery

# v.2.0 브랜치로 전환 (React Native 버전)
git checkout v.2.0
```

### 4.2 백엔드 설치 (기존과 동일)

```bash
# 백엔드 의존성 설치
cd server
npm install
cd ..
```

**주요 패키지**: Express, MySQL2, bcryptjs, JWT, AWS SDK, Multer

### 4.3 React Native 앱 설치

```bash
# React Native 앱 디렉토리로 이동
# (v.2.0에서는 루트 디렉토리가 RN 프로젝트)
npm install
```

**주요 패키지**:

- `expo` - Expo SDK
- `react-native` - React Native 코어
- `@react-navigation/native` - 네비게이션
- `nativewind` - Tailwind CSS for RN
- `@react-native-async-storage/async-storage` - 로컬 스토리지
- `expo-image-picker` - 이미지 선택
- `expo-av` - 오디오/비디오
- `react-native-calendars` - 캘린더 UI

---

## 5. 환경 설정 (Environment Setup)

### 5.1 백엔드 환경 변수 (.env)

기존 v1.5와 동일하게 `server/.env` 파일을 설정합니다.

```bash
# 데이터베이스 설정 (TiDB)
DB_HOST=gateway01.ap-northeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=2xT7BQvhhuaABjr.root
DB_PASSWORD=ojm4dVHzyXqWJK6S
DB_NAME=test

# AWS S3 설정
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_HERE
AWS_S3_BUCKET=imery
AWS_REGION=ap-southeast-2
```

> ⚠️ **보안**: `.env` 파일은 Git에 커밋하지 마세요. `.gitignore`에 포함되어 있습니다.

### 5.2 React Native 환경 설정

React Native는 환경 변수를 다르게 처리합니다. 백엔드 API URL을 설정해야 합니다.

**config/api.config.ts** (또는 JavaScript):

```typescript
import { Platform } from "react-native";

// 개발 환경 API URL
export const API_BASE_URL = Platform.select({
  ios: "http://localhost:3001", // iOS 시뮬레이터
  android: "http://10.0.2.2:3001", // Android 에뮬레이터
  default: "http://localhost:3001",
});

// 실제 기기 테스트 시 (동일 Wi-Fi)
// export const API_BASE_URL = 'http://YOUR_COMPUTER_IP:3001';
// 예: 'http://192.168.0.10:3001'
```

### 5.3 Expo 계정 설정 (배포용)

```bash
# Expo 로그인 (처음 한 번만)
npx expo login

# 또는 회원가입
npx expo register
```

---

## 6. 프로젝트 실행 (Running the Project)

### 6.1 백엔드 서버 실행 (터미널 1)

```bash
# 프로젝트 루트에서
cd server
node index.js
```

**성공 시 출력:**

```
[dotenv] injecting env (9) from .env
Connecting to TiDB/MySQL...
Connected to TiDB successfully.
Database initialized
Server running on http://localhost:3001
```

### 6.2 React Native 앱 실행 (터미널 2)

```bash
# 프로젝트 루트에서 (새 터미널)
npx expo start
```

**성공 시 출력:**

```
› Metro waiting on exp://192.168.0.10:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

### 6.3 앱 실행 방법

#### 방법 1: Expo Go (가장 빠름 - 권장)

1. **스마트폰에 Expo Go 설치** (App Store / Play Store)
2. **QR 코드 스캔**:
   - iOS: 카메라 앱으로 QR 코드 스캔
   - Android: Expo Go 앱에서 "Scan QR Code" 탭 사용
3. 앱이 자동으로 로드됨

> 💡 **주의**: 스마트폰과 개발 PC가 **동일한 Wi-Fi**에 연결되어 있어야 합니다.

#### 방법 2: iOS 시뮬레이터 (macOS 전용)

```bash
# Expo 실행 중 터미널에서 'i' 키 입력
# 또는
npx expo run:ios
```

#### 방법 3: Android 에뮬레이터

```bash
# Android Studio에서 에뮬레이터 실행 후
# Expo 실행 중 터미널에서 'a' 키 입력
# 또는
npx expo run:android
```

---

## 7. 프로젝트 구조 (Project Structure)

### 7.1 v2.0 디렉토리 구조 (Standard Expo Architecture)

이 프로젝트는 React Native 및 Expo Router의 표준 디렉토리 구조를 따릅니다. **`app/` 디렉토리가 라우팅과 비즈니스 로직의 중심**이 되며, React 웹 개발 방식(`src/` 중심)을 탈피하여 네이티브 앱 개발 표준을 준수합니다.

```
iMery/mobile/
├── app/                        # Expo Router (페이지 & 비즈니스 로직)
│   ├── (auth)/                # 인증 관련 화면 (Login, Signup)
│   ├── (tabs)/                # 메인 탭 화면 (Home, Archive, Community, Profile)
│   ├── work/                  # 작품 관련 화면 (Detail, Upload)
│   └── _layout.tsx            # 루트 레이아웃 & Providers
│
├── components/                 # 재사용 가능한 UI 컴포넌트
│   ├── ui/                    # 버튼, 인풋 등 기본 요소
│   └── work/                  # 작품 관련 컴포넌트 (WorkCard 등)
│
├── services/                   # API 통신 및 외부 서비스
│   └── api.ts                 # 백엔드 API 클라이언트
│
├── hooks/                      # 커스텀 훅 (useAuth, useWorks 등)
├── constants/                  # 앱 전체 상수 (Colors, Config)
├── utils/                      # 유틸리티 함수
├── assets/                     # 정적 자산 (이미지, 폰트)
└── ...config files            # 설정 파일들 (babel, tailwind, tsconfig)
```

## 사용 방법 (Usage Guide)

### 1단계: 설치 및 실행

```bash
cd mobile
npm install
npx expo start
```

### 2단계: 개발 가이드

- **새로운 화면 추가**: `app/` 폴더 내에 `.tsx` 파일을 생성하면 자동으로 라우트가 생성됩니다. 비즈니스 로직은 해당 파일 내에 바로 작성하거나, 복잡할 경우 커스텀 훅으로 분리합니다.
- **공통 컴포넌트**: 여러 화면에서 쓰이는 UI는 `components/`에 작성합니다.
- **API 호출**: `@services/api` 모듈을 import하여 사용합니다.

---

### 7.2 v1.5 (웹) vs v2.0 (RN) 구조 비교

| 역할           | React Web (v1.5)                | React Native (v2.0)         |
| -------------- | ------------------------------- | --------------------------- |
| 진입점         | `src/main.jsx`                  | `app/_layout.tsx`           |
| 앱 컨테이너    | `src/App.jsx`                   | `app/(tabs)/_layout.tsx`    |
| 라우팅         | 상태 기반 (`activeView`)        | 파일 기반 (Expo Router)     |
| 페이지         | `src/pages/*.jsx`               | `app/**/*.tsx`              |
| 컴포넌트       | `src/widgets/`, `src/features/` | `components/`               |
| API 클라이언트 | `src/api/client.js`             | `services/api.ts`           |
| 스타일         | `src/App.css`, Tailwind         | `components/**/*.styles.ts` |
| 상태           | `useState`, `useLocalStorage`   | Zustand + AsyncStorage      |

---

## 8. 기술 스택 (Technology Stack)

### 8.1 Core Framework

| 카테고리       | 기술         | 버전    | 용도                 |
| -------------- | ------------ | ------- | -------------------- |
| **프레임워크** | React Native | 0.74+   | 모바일 앱 프레임워크 |
| **SDK**        | Expo         | ~51.0.0 | 개발 및 빌드 플랫폼  |
| **언어**       | TypeScript   | 5.3+    | 타입 안정성          |
| **번들러**     | Metro        | 0.80+   | JavaScript 번들링    |

### 8.2 Navigation

| 패키지                          | 용도               |
| ------------------------------- | ------------------ |
| `expo-router`                   | 파일 기반 라우팅   |
| `@react-navigation/native`      | 네비게이션 코어    |
| `@react-navigation/stack`       | 스택 네비게이션    |
| `@react-navigation/bottom-tabs` | 하단 탭 네비게이션 |

### 8.3 UI & Styling

| 패키지                    | 용도            | 대체 대상 (v1.5) |
| ------------------------- | --------------- | ---------------- |
| `nativewind`              | Tailwind for RN | Tailwind CSS     |
| `react-native-reanimated` | 애니메이션      | Framer Motion    |
| `expo-vector-icons`       | 아이콘          | Lucide React     |
| `react-native-paper`      | UI 컴포넌트     | 커스텀 컴포넌트  |

### 8.4 Data & State

| 패키지                                      | 용도            | 대체 대상 (v1.5) |
| ------------------------------------------- | --------------- | ---------------- |
| `@react-native-async-storage/async-storage` | 로컬 스토리지   | localStorage     |
| `zustand`                                   | 전역 상태 관리  | useState         |
| `axios`                                     | HTTP 클라이언트 | fetch            |

### 8.5 Media & Files

| 패키지                   | 용도                 |
| ------------------------ | -------------------- |
| `expo-image-picker`      | 카메라/갤러리 접근   |
| `expo-image-manipulator` | 이미지 크롭/리사이즈 |
| `expo-av`                | 오디오/비디오 재생   |
| `expo-media-library`     | 미디어 저장          |

### 8.6 UI Libraries

| 패키지                   | 용도         |
| ------------------------ | ------------ |
| `react-native-calendars` | 캘린더 UI    |
| `react-native-chart-kit` | AI 분석 차트 |
| `react-hook-form`        | 폼 관리      |

### 8.7 Backend (변경 없음)

| 카테고리         | 기술                | 버전  |
| ---------------- | ------------------- | ----- |
| **런타임**       | Node.js             | 20+   |
| **프레임워크**   | Express             | 4.18+ |
| **데이터베이스** | TiDB Cloud (MySQL)  | -     |
| **인증**         | JWT + bcryptjs      | -     |
| **스토리지**     | AWS S3              | -     |
| **AI**           | RunPod + Gemini API | -     |

---

## 9. React Native 아키텍처 (Architecture)

### 9.1 앱 레이어 구조

```
┌─────────────────────────────────────────┐
│         User Interface Layer            │
│   (Screens, Components, Navigation)     │
├─────────────────────────────────────────┤
│      State Management Layer             │
│    (Zustand Stores, React Context)      │
├─────────────────────────────────────────┤
│        Business Logic Layer             │
│    (Hooks, Utils, Validators)           │
├─────────────────────────────────────────┤
│          Data Layer                     │
│  (API Client, AsyncStorage, Cache)      │
├─────────────────────────────────────────┤
│        Platform Services                │
│  (Expo APIs: Camera, Audio, Storage)    │
└─────────────────────────────────────────┘
           ↕
┌─────────────────────────────────────────┐
│          Backend (Express)              │
│     TiDB + AWS S3 + AI Services         │
└─────────────────────────────────────────┘
```

### 9.2 네비게이션 플로우

```
App 시작
  │
  ├─ 인증 확인 (AsyncStorage)
  │
  ├─ [비로그인] → (auth) 그룹
  │   ├─ login.tsx
  │   └─ signup.tsx
  │
  └─ [로그인] → (tabs) 그룹
      ├─ index.tsx (홈)
      ├─ archive.tsx (아카이브)
      ├─ community.tsx (커뮤니티)
      └─ profile.tsx (프로필)
          │
          └─ Modal/Stack 네비게이션
              ├─ work/[id].tsx (작품 상세)
              ├─ UploadModal (작품 업로드)
              ├─ SettingsModal (설정)
              └─ UserSearchModal (친구 찾기)
```

### 9.3 데이터 플로우

```
[사용자 액션]
    ↓
[React Component]
    ↓
[Custom Hook (useWorks, useAuth)]
    ↓
[Zustand Store 상태 업데이트]
    ↓
[API Client 호출]
    ↓
[Backend Express Server]
    ↓
[TiDB Database / AWS S3]
    ↓
[Response]
    ↓
[Store 업데이트 + AsyncStorage 캐싱]
    ↓
[UI 리렌더링]
```

---

## 10. 주요 기능 매핑 (Feature Mapping)

### 10.1 인증 시스템

| 기능        | v1.5 구현                   | v2.0 구현                |
| ----------- | --------------------------- | ------------------------ |
| 로그인      | `LoginView.jsx`             | `app/(auth)/login.tsx`   |
| 회원가입    | `SignupView.jsx`            | `app/(auth)/signup.tsx`  |
| 토큰 저장   | `localStorage.setItem()`    | `AsyncStorage.setItem()` |
| 자동 로그인 | `useLocalStorage` hook      | `authStore.rehydrate()`  |
| 로그아웃    | `localStorage.removeItem()` | `authStore.logout()`     |

**v2.0 예시 코드:**

```typescript
// stores/authStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set) => ({
  user: null,
  login: async (user) => {
    await AsyncStorage.setItem("imery-user", JSON.stringify(user));
    set({ user });
  },
  logout: async () => {
    await AsyncStorage.removeItem("imery-user");
    set({ user: null });
  },
}));
```

### 10.2 작품 관리

| 기능        | v1.5 구현                      | v2.0 구현                         |
| ----------- | ------------------------------ | --------------------------------- |
| 작품 목록   | `WorksList.jsx` (div 스크롤)   | `FlatList` 컴포넌트               |
| 작품 카드   | HTML div + Tailwind            | `WorkCard.tsx` (TouchableOpacity) |
| 작품 상세   | `WorkDetailView.jsx`           | `app/work/[id].tsx`               |
| 작품 업로드 | `UploadModal.jsx` + HTML input | Expo ImagePicker                  |
| 이미지 압축 | `imageCompression.js`          | Expo ImageManipulator             |
| 편집        | inline editing                 | Modal 기반 편집                   |
| 삭제        | `handleDeleteClick()`          | Alert.alert() 확인                |

**v2.0 예시 코드:**

```typescript
// components/WorksList.tsx
import { FlatList } from 'react-native';

export default function WorksList({ works }) {
  return (
    <FlatList
      data={works}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <WorkCard work={item} onPress={() => navigateToDetail(item.id)} />
      )}
      refreshControl={<RefreshControl onRefresh={loadWorks} />}
    />
  );
}
```

### 10.3 이미지 업로드

| 단계          | v1.5 구현                     | v2.0 구현                               |
| ------------- | ----------------------------- | --------------------------------------- |
| 이미지 선택   | `<input type="file">`         | `ImagePicker.launchImageLibraryAsync()` |
| 카메라 촬영   | `<input capture="camera">`    | `ImagePicker.launchCameraAsync()`       |
| 이미지 압축   | Browser Canvas API            | `ImageManipulator.manipulateAsync()`    |
| FormData 생성 | `new FormData()` + `append()` | `new FormData()` + `append()`           |
| S3 업로드     | Multer-S3 (백엔드)            | 동일 (변경 없음)                        |

**v2.0 예시 코드:**

```typescript
// components/ImageUploadModal.tsx
import * as ImagePicker from "expo-image-picker";

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    const uri = result.assets[0].uri;
    // 압축
    const compressed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }],
      { compress: 0.7 },
    );
    onImageSelected(compressed.uri);
  }
};
```

### 10.4 AI 분석

| 기능        | v1.5 구현             | v2.0 구현              | 변경 사항       |
| ----------- | --------------------- | ---------------------- | --------------- |
| 분석 트리거 | 버튼 클릭             | 버튼 클릭              | 동일            |
| API 호출    | `api.analyzePost(id)` | `api.analyzePost(id)`  | 동일            |
| 로딩 표시   | 텍스트 변경           | ActivityIndicator      | UI만 변경       |
| 결과 표시   | 차트 + 텍스트         | react-native-chart-kit | 라이브러리 변경 |
| 음악 재생   | HTML5 Audio           | Expo AV                | 구현 방식 변경  |

**v2.0 예시 코드:**

```typescript
// components/AudioPlayer.tsx
import { Audio } from "expo-av";

const [sound, setSound] = useState(null);

const playSound = async () => {
  const { sound } = await Audio.Sound.createAsync(
    { uri: musicUrl },
    { shouldPlay: true, isLooping: true },
  );
  setSound(sound);
};
```

### 10.5 소셜 기능

| 기능      | v1.5 구현                | v2.0 구현                |
| --------- | ------------------------ | ------------------------ |
| 친구 검색 | `UserSearchModal.jsx`    | Modal + TextInput        |
| 친구 요청 | API 호출                 | 동일                     |
| 알림 패널 | `NotificationPanel.jsx`  | Slide-over Modal         |
| 좋아요    | `handleLikeToggle()`     | 동일 (애니메이션만 변경) |
| 북마크    | `handleBookmarkToggle()` | AsyncStorage + API       |
| 댓글      | `getComments()` 호출     | FlatList 기반 렌더링     |

### 10.6 캘린더 & 타임라인

| 기능          | v1.5 구현           | v2.0 구현                |
| ------------- | ------------------- | ------------------------ |
| 캘린더 UI     | 커스텀 구현         | `react-native-calendars` |
| 날짜 마킹     | 수동 스타일링       | `markedDates` prop       |
| 날짜 클릭     | `handleDateClick()` | `onDayPress` 콜백        |
| 날짜별 필터링 | JavaScript filter   | 동일                     |

**v2.0 예시 코드:**

```typescript
import { Calendar } from 'react-native-calendars';

<Calendar
  markedDates={{
    '2026-01-26': { marked: true, dotColor: '#23549D' },
  }}
  onDayPress={(day) => {
    navigation.navigate('work/day', { date: day.dateString });
  }}
/>
```

---

## 11. 개발 가이드 (Development Guide)

### 11.1 새 화면 추가하기

**Step 1: 파일 생성**

```bash
# app 디렉토리에 새 파일 생성 (Expo Router가 자동 인식)
touch app/settings.tsx
```

**Step 2: 기본 구조 작성**

```typescript
// app/settings.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text>Settings Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

**Step 3: 네비게이션 추가**

```typescript
// 다른 화면에서
import { useRouter } from "expo-router";

const router = useRouter();
router.push("/settings");
```

### 11.2 API 호출 패턴

**Step 1: API 함수 정의**

```typescript
// services/api.ts
export const api = {
  getWorks: async () => {
    const { data } = await axios.get(`${API_BASE_URL}/posts/`);
    return data;
  },
};
```

**Step 2: Custom Hook 생성**

```typescript
// hooks/useWorks.ts
import { useState, useEffect } from "react";
import { api } from "@/services/api";

export function useWorks() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWorks = async () => {
    try {
      const data = await api.getWorks();
      setWorks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorks();
  }, []);

  return { works, loading, refetch: loadWorks };
}
```

**Step 3: 컴포넌트에서 사용**

```typescript
// app/(tabs)/index.tsx
import { useWorks } from '@/hooks/useWorks';

export default function HomeScreen() {
  const { works, loading, refetch } = useWorks();

  if (loading) return <ActivityIndicator />;

  return <FlatList data={works} onRefresh={refetch} />;
}
```

### 11.3 스타일링 패턴

**옵션 1: StyleSheet (권장)**

```typescript
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android
  },
});
```

**옵션 2: NativeWind (Tailwind)**

```typescript
import { View, Text } from 'react-native';

<View className="bg-white rounded-xl p-4 shadow-md">
  <Text className="text-lg font-semibold">Title</Text>
</View>
```

### 11.4 이미지 처리

**로컬 이미지:**

```typescript
import { Image } from 'react-native';
<Image source={require('@/assets/logo.png')} style={{ width: 100, height: 100 }} />
```

**원격 이미지 (S3 URL):**

```typescript
<Image source={{ uri: work.image_url }} style={{ width: '100%', height: 200 }} />
```

**이미지 캐싱:**

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: work.image_url }}
  placeholder={require('@/assets/placeholder.png')}
  contentFit="cover"
  transition={200}
/>
```

### 11.5 폼 처리

**react-hook-form 사용:**

```typescript
import { useForm, Controller } from 'react-hook-form';
import { TextInput } from 'react-native';

export default function LoginForm() {
  const { control, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <Controller
      control={control}
      name="email"
      rules={{ required: true }}
      render={({ field: { onChange, value } }) => (
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Email"
        />
      )}
    />
  );
}
```

---

## 12. 테스팅 가이드 (Testing Guide)

### 12.1 로컬 개발 테스트

**1. Hot Reload 테스트**

```bash
# 앱 실행 중 코드 변경 후
# 자동으로 리로드됨 (Fast Refresh)
# 수동 리로드: 앱에서 'r' 키 입력
```

**2. 네트워크 요청 디버깅**

```bash
# Expo 실행 시 네트워크 디버깅 활성화
npx expo start --tunnel
```

**3. React DevTools 사용**

```bash
# Chrome에서 React DevTools 확장 설치
# Expo 메뉴에서 "Debug Remote JS" 선택
```

### 12.2 실제 기기 테스트 (동일 Wi-Fi)

**Step 1: 컴퓨터 IP 확인**

```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

**Step 2: API URL 변경**

```typescript
// config/api.config.ts
export const API_BASE_URL = "http://192.168.0.10:3001"; // 실제 IP
```

**Step 3: 백엔드 서버도 네트워크 노출**

```bash
# server/index.js 수정
app.listen(3001, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3001');
});
```

### 12.3 플랫폼별 테스트

#### iOS 시뮬레이터 (macOS 전용)

```bash
# Xcode 설치 후
npx expo run:ios

# 또는 특정 시뮬레이터
npx expo run:ios --device "iPhone 15 Pro"
```

#### Android 에뮬레이터

```bash
# Android Studio에서 AVD 생성 후
npx expo run:android

# 또는 연결된 실제 기기
npx expo run:android --device
```

### 12.4 기능 테스트 체크리스트

- [ ] **인증**
  - [ ] 회원가입
  - [ ] 로그인
  - [ ] 로그아웃
  - [ ] 자동 로그인 (앱 재시작)

- [ ] **작품 관리**
  - [ ] 카메라로 사진 촬영
  - [ ] 갤러리에서 사진 선택
  - [ ] 작품 정보 입력
  - [ ] S3 업로드 성공 확인
  - [ ] 작품 목록에 표시
  - [ ] 작품 상세 보기
  - [ ] 작품 편집
  - [ ] 작품 삭제

- [ ] **AI 분석**
  - [ ] 분석 버튼 클릭
  - [ ] 로딩 표시
  - [ ] 결과 표시 (스타일 Top 5)
  - [ ] AI 요약 텍스트
  - [ ] 음악 재생

- [ ] **소셜**
  - [ ] 친구 검색
  - [ ] 친구 요청 전송
  - [ ] 친구 요청 수락/거절
  - [ ] 커뮤니티 피드 (친구 작품만)
  - [ ] 좋아요
  - [ ] 북마크
  - [ ] 댓글 작성

- [ ] **캘린더**
  - [ ] 캘린더 렌더링
  - [ ] 작품 있는 날짜 마킹
  - [ ] 날짜 클릭 → 해당 날짜 작품 목록
  - [ ] 작품 없는 날짜 클릭 → 빈 화면

- [ ] **퍼포먼스**
  - [ ] FlatList 스크롤 (60fps)
  - [ ] 이미지 로딩 속도
  - [ ] 앱 시작 시간 (3초 이내)

---

## 13. 배포 가이드 (Deployment)

### 13.1 Expo Go를 통한 배포 (가장 빠름)

**Step 1: Expo 로그인**

```bash
npx expo login
```

**Step 2: 앱 빌드 및 퍼블리시**

```bash
# 개발 빌드 (Expo Go 호환)
npx expo publish
```

**Step 3: 공유**

- QR 코드 생성됨
- URL 공유: `exp://exp.host/@username/imery`
- 누구나 Expo Go 앱으로 실행 가능

### 13.2 Standalone 빌드 (Apple/Google Store 배포)

**iOS (TestFlight 또는 App Store)**

```bash
# EAS Build 설치
npm install -g eas-cli
eas login

# iOS 빌드
eas build --platform ios
```

**Android (Google Play Store)**

```bash
# Android APK/AAB 빌드
eas build --platform android
```

### 13.3 앱 설정 (app.json)

```json
{
  "expo": {
    "name": "iMery",
    "slug": "imery",
    "version": "2.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.oldcastle.imery"
    },
    "android": {
      "package": "com.oldcastle.imery",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

---

## 14. 문제 해결 (Troubleshooting)

### Q1. `Error: Unable to resolve module @react-navigation/native`

**원인**: 의존성 설치 누락

**해결:**

```bash
npm install --save @react-navigation/native
npx expo install react-native-screens react-native-safe-area-context
```

---

### Q2. Android 에뮬레이터에서 API 호출 실패

**원인**: Android 에뮬레이터는 `localhost`를 자체 에뮬레이터로 인식

**해결:**

```typescript
// config/api.config.ts
const API_BASE_URL = Platform.select({
  android: "http://10.0.2.2:3001", // Android 에뮬레이터 전용
  ios: "http://localhost:3001",
  default: "http://localhost:3001",
});
```

---

### Q3. 이미지 업로드 후 `image_url`이 S3 URL이 아님

**원인**: 백엔드 Multer-S3 설정 문제 또는 `.env` 누락

**해결:**

```bash
# 1. server/.env 파일 확인
cat server/.env

# 2. AWS 자격 증명 확인
# AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET 확인

# 3. 백엔드 재시작
cd server
node index.js
```

---

### Q4. Expo Go에서 QR 코드 스캔 안 됨

**원인**: 다른 네트워크에 연결됨

**해결:**

```bash
# 1. PC와 스마트폰이 동일한 Wi-Fi에 연결되었는지 확인
# 2. 방화벽 확인 (포트 8081 허용)
# 3. Tunnel 모드 사용
npx expo start --tunnel
```

---

### Q5. iOS에서 HTTP 요청 차단 (ATS 에러)

**원인**: iOS는 기본적으로 HTTPS만 허용

**해결 (개발 환경 전용):**

```json
// app.json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": true
        }
      }
    }
  }
}
```

---

### Q6. `npm install` 실패

**해결:**

```bash
# 캐시 및 lock 파일 삭제 후 재설치
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

### Q7. Metro Bundler 포트 충돌

**해결:**

```bash
# 기존 Metro 프로세스 종료
lsof -ti:8081 | xargs kill -9

# 또는 다른 포트 사용
npx expo start --port 8090
```

---

### Q8. AI 분석 타임아웃 (RunPod)

**원인**: 네트워크 지연 또는 RunPod 서버 응답 지연

**해결:**

```typescript
// services/api.ts
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000, // 타임아웃 증가 (90초)
});
```

---

## 15. 마이그레이션 체크리스트 (Migration Checklist)

이 체크리스트는 v1.5 (React Web)에서 v2.0 (React Native)로 완전히 마이그레이션하기 위한 작업 목록입니다.

### Phase 1: 환경 설정 ✅

- [ ] Node.js v18+ 설치 확인
- [ ] Expo CLI 설치 (`npx expo`)
- [ ] Expo 계정 생성 및 로그인
- [ ] Expo Go 앱 설치 (iOS/Android)
- [ ] v.2.0 브랜치 생성
- [ ] Expo 프로젝트 초기화
- [ ] 백엔드 서버 환경 변수 설정 (`.env`)
- [ ] Git 저장소 설정

### Phase 2: 프로젝트 구조 ✅

- [ ] `app/` 디렉토리 생성 (Expo Router)
- [ ] `components/` 디렉토리 생성
- [ ] `services/` 디렉토리 생성 (API 클라이언트)
- [ ] `stores/` 디렉토리 생성 (상태 관리)
- [ ] `constants/` 디렉토리 생성
- [ ] `hooks/` 디렉토리 생성
- [ ] `utils/` 디렉토리 생성
- [ ] `app.json` 생성
- [ ] `tailwind.config.js` (NativeWind) 생성

### Phase 3: 코어 의존성 설치 ✅

- [ ] React Navigation 설치
- [ ] NativeWind 설치
- [ ] Expo Vector Icons 설치
- [ ] AsyncStorage 설치
- [ ] Axios 설치
- [ ] Expo Image Picker 설치
- [ ] Expo AV 설치
- [ ] React Native Calendars 설치
- [ ] Reanimated 설치
- [ ] Zustand 설치 (상태 관리)

### Phase 4: 인증 시스템 마이그레이션 ✅

- [x] `app/(auth)/login.tsx` 생성
- [x] `app/(auth)/signup.tsx` 생성
- [x] `stores/authStore.ts` 생성
- [x] AsyncStorage 기반 토큰 저장
- [x] 자동 로그인 구현 (`rehydrate`)
- [x] 로그아웃 기능 구현
- [x] API 클라이언트에 JWT 인터셉터 추가

### Phase 5: 네비게이션 구조 ✅

- [x] `app/_layout.tsx` (루트 레이아웃) 생성
- [x] `app/(tabs)/_layout.tsx` (탭 네비게이션) 생성
- [x] 인증 가드 구현
- [x] 스택 네비게이터 설정
- [x] 딥링크 설정 (선택)

### Phase 6: 페이지 마이그레이션 ✅

- [x] `HomeView.jsx` → `app/(tabs)/index.tsx`
- [x] `WorkDetailView.jsx` → `app/work/[id].tsx`
- [x] `ArchiveView.jsx` → `app/(tabs)/archive.tsx`
- [x] `CommunityView.jsx` → `app/(tabs)/community.tsx`
- [x] `MyView.jsx` → `app/(tabs)/profile.tsx`
- [x] `DayWorksView.jsx` → `app/work/day.tsx`
- [x] `SearchView.jsx` → 검색 모달 또는 화면

### Phase 7: 컴포넌트 마이그레이션 ✅

- [x] `WorksList.jsx` → `components/WorksList.tsx` (FlatList)
- [x] `Header.jsx` → 네이티브 헤더 또는 커스텀 컴포넌트
- [x] `BottomNav.jsx` → Tab Navigator로 대체
- [x] `NotificationPanel.jsx` → `app/notifications.tsx`
- [x] `HighlightCarousel.jsx` → ScrollView 기반 캐러셀

### Phase 8: 피처 컴포넌트 마이그레이션 ✅

- [x] `UploadModal.jsx` → Expo ImagePicker 통합
- [x] `ReviewForm.jsx` → ScrollView + TextInput
- [x] `UserSearchModal.jsx` → Modal + FlatList
- [x] `FolderCreationDialog.jsx` → Alert/Modal
- [x] `EditProfileModal.jsx` → Modal
- [x] `SettingsModal.jsx` → Modal

### Phase 9: 이미지 업로드 기능 ✅

- [x] Expo ImagePicker 권한 요청
- [x] 갤러리 선택 구현
- [x] 카메라 촬영 구현
- [x] Expo ImageManipulator로 압축
- [x] FormData 생성 및 S3 업로드 테스트

### Phase 10: AI 분석 기능 ✅

- [x] AI 분석 API 호출 (`analyzePost`)
- [x] 로딩 상태 표시 (ActivityIndicator)
- [x] 결과 표시 (차트 + 텍스트)
- [x] react-native-chart-kit 통합
- [x] Expo AV로 음악 재생 구현

### Phase 11: 소셜 기능 ✅

- [x] 친구 검색 기능
- [x] 친구 요청 전송/수락
- [x] 알림 패널
- [x] 좋아요 토글
- [x] 북마크 토글
- [x] 댓글 시스템

### Phase 12: 캘린더 기능 ✅

- [x] `react-native-calendars` 통합
- [x] 작품 날짜 마킹
- [x] 날짜 클릭 → 해당 날짜 작품 목록
- [x] 타임라인 뷰 구현

### Phase 13: 스타일링 ✅

- [x] 테마 시스템 (`constants/Colors.ts`)
- [x] NativeWind 설정 (선택)
- [x] 글로벌 스타일 정의
- [x] 반응형 레이아웃 (Dimensions API)
- [x] iOS/Android 공통 디자인

### Phase 14: 테스팅 ✅

- [x] Expo Go에서 로컬 테스트
- [x] iOS 시뮬레이터 테스트
- [x] Android 에뮬레이터 테스트
- [x] 실제 기기 테스트 (동일 Wi-Fi)
- [x] 모든 CRUD 작업 검증
- [x] S3 업로드 검증
- [x] AI 분석 검증
- [x] 소셜 기능 검증

### Phase 15: 배포 ✅

- [ ] Expo 계정 설정
- [ ] `app.json` 메타데이터 완성
- [ ] 아이콘 및 스플래시 이미지 생성
- [ ] Expo Publish (`npx expo publish`)
- [ ] QR 코드 공유
- [ ] TestFlight/Play Store 빌드 (선택)

### Phase 16: 문서화 ✅

- [ ] `README_SETUP_RN.md` 완성 (본 문서)
- [ ] v.2.0 브랜치에 커밋
- [ ] GitHub에 푸시
- [ ] 마이그레이션 가이드 작성
- [ ] 알려진 이슈 문서화

---

## 📞 문의 및 지원

**문제 발생 시:**

1. 본 문서의 "문제 해결" 섹션 확인
2. GitHub Issues 검색: https://github.com/oldcast1e/iMery/issues
3. 새 Issue 생성 (로그 및 스크린샷 첨부)

**개발자:** oldcast1e  
**Repository:** https://github.com/oldcast1e/iMery  
**Branch:** v.2.0 (React Native), v.1.5 (React Web)

**Happy Coding with React Native! 🎨📱✨**
