# 🎨 Design Transfer Plan: React Web (v1.5) → React Native (v2.0)

This document outlines the detailed strategy to clone the React web application's design into the React Native mobile app. The goal is **pixel-perfect replication** of the v1.5 aesthetic.

---

## 1. Global Design System Tokens

### Colors

| Name            | Hex                     | Description                          |
| :-------------- | :---------------------- | :----------------------------------- |
| **Background**  | `#f9f9f7`               | "Cream-50", main app background      |
| **Primary**     | `#000000`               | Black (Text, Active States, Buttons) |
| **Secondary**   | `#1a1a1a`               | Dark Gray (Headings)                 |
| **Accent**      | `#23549D`               | iMery Blue (Logo, Special Badges)    |
| **Glass/White** | `rgba(255,255,255,0.6)` | Glassmorphism cards with Blur        |
| **Divider**     | `#F3F4F6`               | Gray-100                             |

### Typography

| Usage              | Family            | Weight         | Size                              |
| :----------------- | :---------------- | :------------- | :-------------------------------- |
| **Logo/Headings**  | `PlayfairDisplay` | Bold (700)     | 24px (Header), 32px-36px (Titles) |
| **Body Text**      | `Outfit`          | Regular (400)  | 14px-16px                         |
| **Buttons/Labels** | `Outfit`          | SemiBold (600) | 14px                              |

### Effects

- **Shadows**: `shadow-apple` (soft), `shadow-premium` (spread), `shadow-sharp` (crisp)
- **Glassmorphism**: `BlurView` (expo-blur) with semi-transparent white background.
- **Roundness**: `rounded-2xl` (16px), `rounded-3xl` (24px) for cards.

---

## 2. Component Migration Map

### 2.1 Core Navigation (Shell)

**Target File**: `app/(tabs)/_layout.tsx`

- **[x] CustomHeader**:
  - **Source**: `widgets/Header.jsx`
  - **Implementation**: `components/ui/CustomHeader.tsx`
  - **Style**: Fixed height, white bg, serif logo left, red-dot notification right.
- **[x] CustomTabBar**:
  - **Source**: `widgets/BottomNav.jsx`
  - **Implementation**: `components/ui/CustomTabBar.tsx`
  - **Style**: Floating pill shape (bottom: 30), white bg, shadow-lg.
  - **Key Feature**: Central black floating "Plus" button.

### 2.2 Home Screen (Feed)

**Target File**: `app/(tabs)/index.tsx`

- **[ ] HighlightCarousel**:
  - **Source**: `widgets/HighlightCarousel.jsx`
  - **Implementation**: `components/home/HighlightCarousel.tsx` (New)
  - **Features**: Horizontal ScrollView, `rounded-2xl` cards, overlay text with blue badge.
- **[ ] CategoryTabs**:
  - **Source**: `entities/CategoryTabs.jsx`
  - **Implementation**: `components/home/CategoryTabs.tsx` (New)
  - **Style**: `Grid` layout (6 cols on web → Horizontal Scroll/Grid on mobile). Active=Black, Inactive=Gray-100.
- **[ ] FilterChips**:
  - **Source**: `entities/FilterChips.jsx`
  - **Implementation**: `components/home/FilterChips.tsx` (New)
  - **Style**: Glassmorphism container, Rating star filters, Layout toggle button.

### 2.3 Works List (Unit Cards)

**Target File**: `components/WorksList.tsx`

- **[ ] WorksList (Layouts)**:
  - **Source**: `widgets/WorksList.jsx`
  - **Modes**: List (Compact), Large (Feed), Grid (Medium/Small).
- **[ ] WorkCard (List Style)**:
  - **Implementation**: `components/work/WorkCardList.tsx`
  - **Style**: Horizontal flex, rounded-2xl, border-gray-100, white bg.
- **[ ] WorkCard (Grid Style)**:
  - **Implementation**: `components/work/WorkCardGrid.tsx`
  - **Style**: Aspect square, overlay gradient text.

---

## 3. Implementation Strategy (Step-by-Step)

### Step 1: Component Refactoring

Create the missing components inside `mobile/components/home/` and `mobile/components/work/`.

- `HighlightCarousel.tsx`
- `CategoryTabs.tsx`
- `FilterChips.tsx`
- `WorkCard.tsx` (Smart wrapper for List/Grid)

### Step 2: Home Screen Integration

Rewrite `app/(tabs)/index.tsx` to match `HomeView.jsx` structure exactly:

```tsx
<ScrollView style={{ backgroundColor: "#f9f9f7" }}>
  <HighlightCarousel />
  <CategoryTabs />
  <Divider />
  <ActionBar />
  <FilterChips />
  <SectionTitle title="저장된 작품" />
  <WorksList />
</ScrollView>
```

### Step 3: Global Styling Alignment

- Ensure all screens use `SafeAreaView` correctly with the cream background.
- Adjust `CustomHeader` padding for Android status bar.

### Step 4: Asset Migration

- Copy specific icons or images if missing (though we generally rely on lucide-react-native).

---

**Next Action**: Begin implementation of `HighlightCarousel.tsx`.
