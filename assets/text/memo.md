# 2026.01.17
### v0.1.1 (26.01.17)
- [x] FSD 폴더 구조로 개편.
- [x] npm start -> 안드로이드 스튜디오 같은 스마트폰 UI에서 실행, Expo Go에서 데모 확인이 가능하도록 변경
- [x] 하단 버튼 UI 변경
    - 위치 : class="group flex flex-col items-center justify-center gap-0.5 min-w-[50px] h-full transition-all duration-300 active:scale-90"
    - 변경 점 : 
        - 한글 텍스트 제거, 아이콘만 표시
        - 하단 기능 바에서 가운데 정렬
- [x] [저장된 작품]- 상위 5개 작품 리스트 표출 기능 UI 변경
    - 위치 : class="overflow-x-auto horizontal-scroll px-4"
    - 변경 점 : 사이즈(W,H) 소폭 축소
- [x] [작품]-전체 작품 UI 수정
    - 디자인 통일성 유지
    - [수정],[삭제] 버튼 위치 변경 : 작품 이미지의 우측 상단의 아이콘으로 변경
    - [폴더로 돌아가기] 버튼 UI 변경 : 앱의 디자인과 통일성 있도록 둥근 모서리 여백 적용, 버튼 디자인.
- [x] AI 분석 기능 추가 (추후 구현)
    - 저장된 작품 클릭 시,[감상평] 상단에 AI 요약 기능 추가. (추후 구현)
    - 저장된 작품 클릭 시, AI 분석 버튼 추가. (추후 구현)
    - AI 버튼 디자인 앱과 잘 어울려야하며, AI 기능이 부각되도록 디자인.
    
