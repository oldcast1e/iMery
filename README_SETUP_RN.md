# 📱 iMery Mobile Developer Guide (v2.6)

> **"Developer Onboarding & Architecture Manual"**
>
> 이 문서는 **React Native (Expo)** 기반의 iMery 모바일 앱 개발을 위한 상수, 아키텍처, 컨벤션을 담고 있습니다.
> 신규 개발자는 이 문서를 정독 후 개발에 참여해주세요.

---

## 1. 🏗️ 프로젝트 구조 (Project Structure)

iMery는 **기능 중심(Feature-First)** 구조와 **Expo Router**의 파일 기반 라우팅을 혼합하여 사용합니다.

```bash
mobile/
├── app/                        # 🚦 Screens & Routing (File-based)
│   ├── (auth)/                 # Auth Group (Login/Signup) - Tab bar hidden
│   ├── (tabs)/                 # Main Bottom Tabs (Home, Feed, Archive, My)
│   ├── work/                   # Work Sub-pages (Detail, Upload, DayView)
│   ├── profile/                # Profile Sub-pages (Settings, Activity)
│   └── _layout.tsx             # Root Layout (Providers, Stack Config)
│
├── components/                 # 🧩 UI Widgets & Atomic Components
│   ├── ui/                     # Generic UI (Buttons, Inputs, Cards)
│   ├── home/                   # Home-specific widgets (Banner, Carousel)
│   ├── work/                   # Work-related (WorkCard, UploadForm)
│   ├── feed/                   # Feed-related (FeedCard, CommentList)
│   └── profile/                # Profile-related (I-Record, TicketView)
│
├── services/                   # 📡 API Integration
│   ├── api.ts                  # Axios Instance & Endpoint Definitions
│   └── authService.ts          # Token Management & Auth Logic
│
├── constants/                  # 🎨 Design System
│   ├── Colors.ts               # Color Palette (Semantic Naming)
│   └── Layout.ts               # Dimensions & Screen Utils
│
├── hooks/                      # 🪝 Custom Hooks
│   ├── useAudio.ts             # Audio Docent Logic
│   └── useWorkStore.ts         # Zustand Stores
│
└── assets/                     # 🖼️ Static Assets (Fonts, Images)
```

---

## 2. 🏛️ 아키텍처 (Architecture)

### 2.1 State Management (상태 관리)

우리는 **Hybrid State Strategy**를 사용합니다.

1.  **Server State**: `React Query` (도입 예정) 또는 `useEffect + Service` 패턴.
    - 데이터 페칭은 각 Page(`app/`)에서 수행 후 Component에 Props로 전달.
2.  **Global Client State**: `Zustand`
    - `useAuthStore`: 유저 세션, 토큰.
    - `useThemeStore`: 다크모드/라이트모드.
3.  **Local State**: `useState`, `useReducer`
    - 단순 UI 토글, 폼 입력값.

### 2.2 Navigation (Expo Router)

- **Stack**: 기본 네비게이션 모델. `_layout.tsx`에서 정의.
- **Tabs**: `(tabs)` 그룹 내 `_layout.tsx`에서 하단 탭바 설정.
- **Groups**: `(name)` 폴더는 URL 경로에 포함되지 않는 논리적 그룹입니다.

### 2.3 Styling (NativeWind)

- **Tailwind CSS** 문법을 그대로 사용합니다.
- 복잡한 스타일은 `StyleSheet.create`와 혼용하지 말고, 가능한 `className`으로 해결합니다.
- 예: `<View className="bg-white p-4 rounded-xl shadow-sm" />`

---

## 3. 🔑 주요 시스템 (Key Systems)

### 3.1 🔐 인증 (Authentication)

- **Flow**:
  1. `GenericLogin` 컴포넌트에서 `api.login()` 호출.
  2. 서버로부터 `token`, `user` 객체 수신.
  3. `AsyncStorage`에 토큰 저장 (`AUTH_TOKEN`).
  4. `useAuthStore` 상태 업데이트 -> Root Layout이 감지하여 화면 전환.
- **Persistence**: 앱 실행 시 `_layout.tsx`의 `useEffect`가 Storage를 체크하여 자동 로그인 수행.

### 3.2 🎧 오디오 도슨트 (Safe Audio Engine)

사용자가 작품 상세 페이지에 진입하면 BGM이 자동 재생됩니다. **Race Condition** 및 **Memory Leak** 방지를 위한 엄격한 규칙이 있습니다.

- **Rule 1**: `useAudio` 훅 또는 `Sound` 객체는 반드시 **페이지 언마운트 시 unload** 되어야 함.
- **Rule 2**: `isFocused` 체크 필수. 비동기 로딩 중 사용자가 페이지를 이탈하면 재생하지 않아야 함.
- **Pattern**:
  ```typescript
  useEffect(() => {
    let soundOb: Audio.Sound | null = null;
    // ... load sound ...
    return () => {
      soundOb?.unloadAsync();
    }; // Cleanup
  }, []);
  ```

### 3.3 🎨 I-Record & Heatmap

- **Data**: `GET /users/:id/stats/analysis`
- **Visualization**:
  - **Heatmap**: GitHub Contribution Graph 스타일. `react-native-svg`와 사각형 연산을 통해 직접 렌더링됨.
  - **Charts**: `react-native-chart-kit` 사용 (Genres, Styles).
- **Backend Sync**: 백엔드는 `GROUP BY date`로 일별 활동량을 집계하여 반환합니다.

### 3.4 🎫 Ticket UI (Memory Ticket)

- **Concept**: 물리적 티켓의 감성을 재현한 UI.
- **Tech**:
  - **CSS Masking**: Scalloped Edges (물결 무늬) 구현을 위해 SVG Mask 또는 Image Masking 기법 사용.
  - **Swipe Gesture**: `react-native-gesture-handler`를 통해 티켓 넘기기/상세보기 구현.

---

## 4. 🔀 데이터 흐름 (Data Flow)

**View (Screen)** ➡️ **Service (API)** ➡️ **Backend (Express)** ➡️ **DB (TiDB)**

1.  **Screen**: `useEffect`에서 데이터 요청 (`setLoading(true)`).
2.  **Service**: `api.get('/posts')` 호출. Axios Interceptor가 토큰 자동 주입.
3.  **Backend**: JWT 검증 -> DB 쿼리 -> JSON 응답.
4.  **Screen**: 데이터 수신 -> `useState` 업데이트 -> 렌더링.

---

## 5. ⚠️ 트러블슈팅 (Troubleshooting)

### Q. `Props cannot be found` 에러

- **원인**: TypeScript 인터페이스 미정의.
- **해결**: 컴포넌트 상단에 `interface Props { ... }` 정의 후 컴포넌트에 제네릭으로 전달하거나 매개변수 타입 지정.

### Q. 이미지가 안 보여요 (Localhost URL)

- **원인**: 과거 데이터가 `http://localhost:3001`로 저장된 경우 모바일에서 접근 불가.
- **해결**: 백엔드 콘솔에서 해당 데이터 삭제 권장. 프로덕션은 **S3 URL**만 사용해야 함.

### Q. 탭바가 사라졌어요

- **원인**: `work/[id].tsx` 등 하위 페이지는 탭바를 덮는 것이 기본 동작(Full Screen)일 수 있음.
- **확인**: `_layout.tsx`의 `tabs` 설정 확인.

---

## 6. 협업 규칙 (Conventions)

1.  **컴포넌트 명명**: PascalCase (e.g., `WorkCard.tsx`).
2.  **폴더 구조**: 기능 단위로 응집도 있게 (`components/profile/` 내부에 관련 위젯 모음).
3.  **상대 경로 금지**: 가능한 `../../` 지옥을 피하고 절대 경로(Add alias) 사용 고려 (현재는 상대경로 유지).
4.  **주석**: 복잡한 로직(특히 오디오, 제스처)에는 **반드시 이유(Why)**를 적을 것.

---

Created by **Oldcastle**.
