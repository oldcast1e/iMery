# iMery Developer Context & Setup Guide

> **Current Version**: v2.6 (MVP Complete)
> **Last Updated**: 2026.02.02
> **Document Type**: Developer Handoff & Architecture Context

### Qiuck Start

**Terminal 1 (Backend)**

```bash
cd server
npm run dev
# Port 3001 (Auto-kill 3001 if busy)
```

**Terminal 2 (Mobile)**

```bash
cd mobile
npx expo start -c
# Scan QR with Expo Go
```

---

## 1. Project Identity (프로젝트 정체성)

**iMery** is a **Mobile Art Archive & Social Community App** built with React Native.
It allows users to archive art exhibitions, analyze artwork styles using AI, and share tastes with friends via a feed.

- **Core Philosophy**: "작품을 듣는 시간" (Time to listen to the artwork) - emphasizing audio docents and immersive viewing.
- **Platform**: Mobile (iOS/Android) via Expo.
- **Backend**: Node.js/Express + TiDB (MySQL) + AWS S3.

---

## 2. Development Status (개발 현황)

### Current Architecture (v2.x)

- **Frontend**: React Native (Expo SDK 51), TypeScript, NativeWind, Zustand.
- **Routing**: Expo Router (File-based: `app/`).
- **Audio**: `expo-av` with "Safe Loading" pattern (prevents playback after page exit).
- **AI Analysis**:
  - **Server**: RunPod integration.
  - **Flow**: Client uploads image -> Server analyzes (Vision/LLM) -> Returns `ai_summary`, `tags`, `genre`, `style`.
  - **Client**: Renders Analysis Chart (React Native Chart Kit) & Style Pills.

---

## 3. Version History (버전 기록)

### 📱 Mobile Era (React Native)

#### **v.2.5 (Current Stable) - 2026.02.01**

- **I-Activity Page Redesign**:
  - **Likes Tab**: "Instagram-style" 3-column full-width image grid with 1px gaps.
  - **Filters**: "Newest", "All Dates", "All Authors" header with Sorting functionality.
  - **Unified Header**: Merged "I - Activity" title into the main navigation bar for zero-gap layout.
  - **Full Screen**: Optimized layout to use full screen height (removed bottom whitespace).
- **Bug Fixes**:
  - **Add Work**: Removed redundant "STYLE" input.
  - **Work Detail**: Fixed Location display to prioritize "Exhibition Name" > "City/Province".

#### **v.2.6 (MVP Complete) - 2026.02.02**

- **I-Record (Taste Analysis) Overhaul**:
  - **Activity Heatmap**: Visualizes upload frequency over the last 5 months (GitHub Contribution style).
  - **Taste Statistics**: Top Genres, Art Styles, and Favorite Artists ranking.
  - **Compact UI**: Optimized dashboard layout with side-by-side charts and signature blue styling.
  - **Backend**: Enhanced `/stats/analysis` endpoint to aggregate activity/artist data.

#### **v.2.5 - 2026.02.01**

#### **v.2.4 - 2026.02.01**

- **Ticket UI Redesign**:
  - Implemented **"Original Ticket"** vertical card style with **Soft Square Scalloped Edges**.
  - Added **Swipe Gestures** (Left/Right for nav, Down for details).
- **Data Integrity**: Fixed legacy data migration to correctly separate tickets by `work_date`.
- **Visuals**: Dynamic contrast text on tickets.

#### **v2.2 - 2026.01.29 ~ 30**

- **Home Widgets**: Replaced static "Saved List" with a sleek **Banner Carousel Widget**.
- **Pagination**: Added "Load More" functionality to the Home work list for better performance.
- **Audio Polish**: Implemented `isFocusedRef` to solve "Music playing after page exit" race conditions.
- **UI Refinement**: Removed shadows from Bottom Tab Bar, polished header gradients.
- **Route Cleanup**: Removed duplicate Expo Router files (`+html 2.tsx` etc.) to fix boot crashes.

#### **v2.1 - 2026.01.29**

- **Social Feature Split**:
  - **Feed**: Dedicated tab for Social updates.
  - **Community**: Public posts from all users.
  - **Following**: Posts only from friends (Friend/Client-side filtering).
- **Archive Tab**:
  - Moved "Work Folders" to Archive.
  - **Calendar View**: Date-based archiving implemented with `react-native-calendars`.
- **Privacy Controls**: Added visibility settings (Public/Friends Only/Private).
- **Friend Search**: Modal-based user search and request system.

#### **v2.0 - 2026.01.26**

- **Migration Milestone**: Complete transition from React Web (v1.5) to React Native (Expo).
- **Feature Parity**: 100% of Web features ported to Mobile.

---

### 🌐 Web Era (Legacy React)

> **Note**: These versions were built with React + Vite. The logic has been migrated, but this history serves as the reference for business logic evolution.

#### **v1.5 - 2026.01.22**

- **Audio Features**:
  - Added "Audio Docent" concept (Music URL linked to posts).
  - Auto-play with 1-second loop interval logic (Web Audio API).
- **UX Improvements**:
  - "Delete" button changed to generic Red color.
  - Fixed "Go-to-Top" button UX.
  - Layout spacing adjustments for "Premium" feel.

#### **v1.4 - 2026.01.21**

- **Tag System v2**:
  - Hierarchical Tags: [Category] -> [Mid] -> [Low].
  - Ex: [Artwork] -> [Overwhelming] -> [Sublime].
  - UI: Tag selection chips with visual hierarchy.
- **Calendar (Web)**: Initial implementation of date-based filtering.

#### **v1.3 - 2026.01.19**

- **Database**: Migrated to TiDB Cloud (MySQL).
- **S3**: Integrated AWS S3 for persistent image storage (replaced local file storage).

#### **v1.1 ~ v1.2**

- **Social**: Initial Friend Request logic (Accept/Decline).
- **Feed**: Basic "Community" list.

---

## 4. Feature Mapping (Web → Mobile)

For developers referencing old Web code, here is where the logic now lives:

| Feature      | Legacy Web (v1.5)                | Mobile (v2.2)                    | Note                        |
| ------------ | -------------------------------- | -------------------------------- | --------------------------- |
| **Entry**    | `src/main.jsx`                   | `app/_layout.tsx`                | Expo Router Root            |
| **Home**     | `src/pages/Home.jsx`             | `app/(tabs)/index.tsx`           | Now includes Widgets        |
| **Detail**   | `src/pages/WorkDetail.jsx`       | `app/work/[id].tsx`              | **Safe Audio** logic here   |
| **Upload**   | `src/components/UploadModal.jsx` | `app/work/upload.tsx`            | Uses `Expo ImagePicker`     |
| **Calendar** | Custom Grid Divs                 | `app/work/day.tsx`               | Uses Library                |
| **Nav**      | `BottomNav.jsx`                  | `components/ui/CustomTabBar.tsx` | **Shadows Removed** in v2.2 |

---

## 5. Setup & Execution (설치 및 실행)

To run the current Mobile version (v2.2):

### Prerequisites

- Node.js v18+
- Standard `.env` in `server/` (DB_HOST, S3_KEY, etc.)

### Auto-Start (Recommended)

```bash
./rebuild_and_start.sh
```

---

## 6. Critical Developer Notes (트러블슈팅 & 규칙)

1.  **Audio Race Condition**:
    - **Problem**: In React Native, `useEffect` cleanup might run _after_ a new async sound load finishes if navigation is fast, causing music to play on the next screen.
    - **Solution**: Use `isFocusedRef` pattern in `app/work/[id].tsx`. Always check `isFocusedRef.current` before `sound.playAsync()`.

2.  **Expo Router Files**:
    - **Rule**: NEVER name files with `+` prefix (e.g., `+html.tsx`) unless they are Expo system files.
    - **Fix**: If `Duplicate Route` error occurs, check for `* 2.tsx` (copy) files and delete them.

3.  **Styles**:
    - Use **NativeWind** (`className="flex-1 bg-white"`).
    - Avoid `shadow-*` on TabBar if it causes platform inconsistencies (v2.2 removed them).

4.  **AI Analysis**:
    - The backend endpoint `PUT /posts/:id` preserves `ai_summary` to avoid re-analysis cost.
    - Frontend: Check `is_analyzed` flag before enabling "View Analysis" button animation.
