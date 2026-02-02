Deployment Guide
19 minutes ago

Review
iMery v2.7 배포 가이드 (Android & iOS)

1. 사전 준비
   iMery v2.7은 **NFC 기능(react-native-nfc-manager)**을 포함하고 있으므로, Expo Go가 아닌 Native Build가 필수적입니다.

필수 도구 설치
npm install -g eas-cli
eas login 2. iOS 배포 (iPhone 16 Pro)
2.1 요구 사항
Apple Developer Account (유료 계정 권장): eas build를 통해 클라우드 빌드를 하려면 필요합니다.
기기 등록: 개발자 계정에 iPhone 16 Pro의 UDID가 등록되어 있어야 합니다.
2.2 빌드 옵션 선택
옵션 A: 개발용 빌드 (Development Build) - 추천
개발 중에 디버깅이 가능하고 코드를 실시간으로 수정할 수 있는 빌드입니다.

cd mobile
eas build --profile development --platform ios
빌드 완료 후 QR 코드를 카메라로 스캔하여 설치합니다.
설치 후 터미널에서 npx expo start를 실행하여 연결합니다.
옵션 B: 배포용/테스트용 빌드 (Preview/Ad-hoc)
내부 테스트용으로 독립 실행 가능한 앱을 만듭니다.

cd mobile
eas build --profile preview --platform ios
옵션 C: 로컬 빌드 (Mac + Xcode 필요, 무료 계정 가능)
클라우드를 쓰지 않고 내 Mac에서 직접 빌드하여 설치합니다. USB 연결 필수.

cd mobile
npx expo run:ios --device
유료 개발자 계정이 없다면 이 방법이 유일합니다.
NFC 권한 설정을 위해 Xcode가 자동으로 서명을 관리하도록 허용해야 합니다.

3. Android 배포 (참고)
   3.1 APK 파일 생성
   cd mobile
   eas build --profile preview --platform android
   결과물: .apk 파일 (직접 설치 가능)
   3.2 Play Store 배포용 (AAB)
   cd mobile
   eas build --profile production --platform android
   결과물: .aab 파일 4. 주의사항 (v2.7 NFC)
   iOS Entitlements: NFC 기능을 위해 NFC Tag Reading Capability가 필요합니다. eas build 과정에서 자동으로 Apple Developer Portal에 해당 설정을 요청할 수 있습니다.
   Privacy Info: Info.plist에 NFCReaderUsageDescription이 설정되어 있습니다 (완료됨). 5. 트러블슈팅
   "Provisioning Profile" 오류 발생 시:

Apple Developer 계정에 기기(iPhone)가 등록되지 않았을 확률이 높습니다.
eas device:create 명령어로 기기를 등록하세요.
"Entitlements" 오류 발생 시:

Apple Developer Portal > Certificates, Identifiers & Profiles > Identifiers에서 해당 App ID(com.oldcastle.imery)를 찾아 NFC Tag Reading 기능이 활성화되어 있는지 확인하세요.
