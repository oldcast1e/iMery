# NFC Data Protocol & Frontend Integration Guide

**Project**: iMery (Art Exhibition App)  
**Version**: 2.7  
**Date**: 2026-02-02

---

## 1. NFC 데이터 형식 (NFC Data Format)

NFC 태그에는 작품의 모든 정보(이미지, 텍스트 등)를 저장하지 않습니다.  
대신, 앱을 실행하고 데이터를 조회할 수 있는 **Deep Link(딥링크)** 만 저장합니다.

### 📡 NDEF Record 구조

관리자는 `NFC Tools` 앱을 사용하여 아래 형식을 태그에 기록합니다.

| Type    | Format            | Value Example                     | 설명                                                |
| :------ | :---------------- | :-------------------------------- | :-------------------------------------------------- |
| **URI** | Custom URL Scheme | `imery://artwork/view/{nfc_uuid}` | `{nfc_uuid}`는 DB의 `nfc_uuid` 컬럼값과 일치해야 함 |

#### ✅ 실제 데이터 예시

- **Case 1 (홍길동전)**: `imery://artwork/view/nfc_hong_01`
- **Case 2 (별이 빛나는 밤)**: `imery://artwork/view/nfc_starry_night`

---

## 2. 프론트엔드 처리 흐름 (Frontend Process Flow)

사용자가 태그를 스캔했을 때 앱 내부에서 일어나는 처리 과정입니다.

```mermaid
graph TD
    A[NFC 태그 스캔] -->|Deep Link 실행| B(OS 레벨: imery:// 감지)
    B -->|앱 실행/포커스| C[App.tsx: Linking Event Listener]
    C -->|URL 파싱| D{URL 검증}
    D -->|imery://artwork/view/...| E[UUID 추출]
    E --> F{로그인 체크}
    F -->|비로그인| G[로그인 화면 이동 (UUID 전달)]
    F -->|로그인 됨| H[상세 페이지 이동 (Source: NFC)]
    H -->|API 호출| I[GET /users/artworks/nfc/{uuid}]
    I -->|데이터 수신| J[화면 렌더링 (AI 버튼 숨김 / 설명 표시)]
```

---

## 3. 프론트엔드 구현 가이드 (Implementation)

### 3.1. 필수 설정 (app.json)

앱이 `imery://` 스킴을 통해 열릴 수 있도록 설정합니다.

```json
{
  "expo": {
    "scheme": "imery",
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "intentFilters": [
              {
                "action": "VIEW",
                "data": { "scheme": "imery" },
                "category": ["BROWSABLE", "DEFAULT"]
              }
            ]
          }
        }
      ]
    ]
  }
}
```

### 3.2. 딥링크 핸들러 (App.tsx or Navigation Root)

앱이 켜져 있거나 꺼져 있을 때 모두 URL을 감지해야 합니다.

```typescript
import * as Linking from "expo-linking";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

// ...

useEffect(() => {
  const handleDeepLink = async ({ url }: { url: string }) => {
    // 1. URL 포맷 확인
    if (url && url.includes("artwork/view/")) {
      const nfcUuid = url.split("artwork/view/")[1];

      if (!nfcUuid) return;

      // 2. 로그인 상태 확인 (예시)
      const isLoggedIn = await checkLogin();

      if (isLoggedIn) {
        // 3. 상세 화면으로 이동 (파라미터: nfcUuid, source='NFC')
        navigation.navigate("ArtworkDetail", { nfcUuid, source: "NFC" });
      } else {
        // 4. 로그인 필요 시 리다이렉트용 UUID 전달
        navigation.navigate("Login", { redirectUuid: nfcUuid });
      }
    }
  };

  // Cold Start (앱이 꺼진 상태에서 태그)
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink({ url });
  });

  // Foreground (앱이 켜진 상태에서 태그)
  const subscription = Linking.addEventListener("url", handleDeepLink);

  return () => subscription.remove();
}, []);
```

### 3.3. 상세 화면 UI 분기 (ArtworkDetailScreen.tsx)

NFC로 진입(source === 'NFC')했을 때의 UI 요구사항을 반영합니다.

```typescript
export default function ArtworkDetailScreen({ route }) {
  const { nfcUuid, source } = route.params;
  const [artwork, setArtwork] = useState(null);

  // NFC 유입 여부 확인
  const isNfcSource = source === 'NFC' || !!nfcUuid;

  // 데이터 로드
  useEffect(() => {
    const fetchUrl = isNfcSource
      ? `${SERVER_URL}/users/artworks/nfc/${nfcUuid}` // 백엔드 NFC 전용 API
      : `${SERVER_URL}/users/artworks/${route.params.id}`; // 기존 ID 조회 API

    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => {
         setArtwork(data);
         // (옵션) 태깅 시 자동 컬렉션 추가 로직
         if(isNfcSource) addToCollection(data.id);
      });
  }, [nfcUuid]);

  if (!artwork) return <Loading />;

  return (
    <ScrollView>
      {/* 이미지 및 기본 정보 */}
      <Image source={{ uri: artwork.image_url }} />
      <Text>{artwork.title}</Text>

      {/* ⭐ [핵심] 조건부 렌더링 */}
      {isNfcSource ? (
        // Case A: NFC 태그 진입 시
        <View style={styles.nfcContainer}>
          <Text style={styles.label}>작품 설명 (Docent)</Text>
          <Text style={styles.description}>
            {artwork.art_description} {/* DB의 description 컬럼 */}
          </Text>
        </View>
      ) : (
        // Case B: 일반 목록 진입 시
        <TouchableOpacity style={styles.aiButton}>
          <Text>🤖 AI 분석 결과 보기</Text>
        </TouchableOpacity>
      )}

      {/* 수정 버튼: NFC 진입 시 숨김 */}
      {!isNfcSource && (
        <Button title="정보 수정" onPress={...} />
      )}
    </ScrollView>
  );
}
```

---

## 4. 백엔드 데이터 매핑 (Backend Requirement)

프론트엔드에서 요청하는 `/users/artworks/nfc/{uuid}` API는 다음 정보를 JOIN하여 반환해야 합니다.

- **Artwork Info**: `title`, `artist_name`, `image_url`, `price`, `description` (설명)
- **Exhibition Info**: `exhibition_title`, `date`, `location`

---

## 5. 테스트 체크리스트 (QA)

1.  NFC Tools 앱으로 `imery://artwork/view/test_1` 데이터를 굽는다.
2.  사용자 앱이 완전히 종료된 상태에서 태그를 스캔한다 -> 앱이 켜지며 상세 화면 진입 성공?
3.  상세 화면에서 AI 분석 버튼이 사라지고, DB의 작품 설명 텍스트가 보이는가?
4.  로그아웃 상태에서 태그 스캔 시 로그인 화면으로 이동하는가?
