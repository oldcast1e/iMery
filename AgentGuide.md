# iMery Antigravity User Guide

이 문서는 iMery 프로젝트에 최적화된 Antigravity 에이전트 시스템 사용법을 설명합니다.

---

## 🚀 시스템 개요

Antigravity는 프로젝트의 고유한 규칙(Rules), 스킬(Skills), 워크플로우(Workflows)를 기반으로 작동하는 고급 에이전트 운영 체제입니다. iMery의 기술 스택(React 19, Express, TiDB, S3)과 아키텍처 패턴을 깊이 이해하고 있습니다.

### 디렉토리 구조 (`.agent/`)

- **rules/**: 에이전트가 반드시 따라야 할 가드레일 (코딩 스타일, 보안 규칙 등)
- **skills/**: 특정 작업을 수행하기 위한 전문 지식 (Frontend 패턴, Backend 패턴 등)
- **workflows/**: 반복적인 작업을 자동화하는 절차서 (`tdd.md`, `verify.md`)

---

## 🎮 주요 명령어 (Slash Commands)

에이전트에게 다음 명령어를 입력하여 미리 정의된 워크플로우를 실행할 수 있습니다.

### `/tdd` (테스트 주도 개발)

새로운 기능 구현이나 버그 수정 시 사용합니다. **Red-Green-Refactor** 사이클을 강제합니다.

1. **Test (Red)**: 실패하는 테스트 케이스를 먼저 작성합니다.
2. **Implement (Green)**: 테스트를 통과하는 최소한의 코드를 작성합니다.
3. **Refactor**: 코드를 개선하고 중복을 제거합니다.

**사용 예시:**

> "새로운 친구 요청 기능을 추가하고 싶어. `/tdd`로 진행해줘."

### `/verify` (프로젝트 검증)

작업을 마무리가거나 PR을 올리기 전에 전체 프로젝트의 무결성을 검증합니다.

1. **Lint**: 코드 스타일 및 잠재적 오류 검사 (`npm run lint`)
2. **Build**: 빌드 가능 여부 확인 (`npm run build`)
3. **Test**: 단위 및 통합 테스트 실행 (`npm test`)
4. **Security**: 보안 취약점 점검

**사용 예시:**

> "작업 다 끝났어. `/verify` 해줘."

---

## 🛠️ 핵심 규칙 및 패턴

에이전트는 작업 시 다음 규칙을 자동으로 참조합니다.

### 1. Frontend (`frontend-patterns`)

- **Routing**: React Router 대신 `activeView` 상태 기반 라우팅을 사용합니다.
- **Styling**: Tailwind CSS를 사용하며 Glassmorphism 디자인을 지향합니다.
- **Animation**: 모든 전환 효과에 `Framer Motion`을 사용합니다.
- **State**: 영구 저장이 필요한 데이터는 `useLocalStorage` 훅을 사용합니다.

### 2. Backend (`backend-patterns`)

- **API**: Express.js 기반이며 `server/index.js`에 라우트가 정의됩니다.
- **Database**: TiDB(MySQL 호환)를 사용하며 `mysql2`의 Prepared Statement로 쿼리합니다.
- **AI Integration**: `/analyze/:id` 엔드포인트에서 S3 → RunPod → Gemini 흐름을 처리합니다.
- **Uploads**: `multer-s3`를 통해 AWS S3로 직접 업로드합니다.

### 3. Operations (`operations.md`)

- **Package Manager**: **npm**만 사용합니다. (yarn, pnpm 금지)
- **Environment**: `.env` 파일은 절대 커밋하지 않으며, Secrets는 환경 변수로만 관리합니다.

---

## 🤖 에이전트 협업 팁

### 역할 부여

작업의 성격에 따라 에이전트에게 역할을 명시하면 더 좋은 결과를 얻을 수 있습니다.

- **UI 전문가**: "UI 전문가로서 이 컴포넌트의 디자인을 개선해줘."
- **API 개발자**: "API 개발자 관점에서 이 엔드포인트의 보안을 검토해줘."
- **AI 스페셜리스트**: "AI 분석 파이프라인의 에러 처리를 강화해줘."

### 작업 지시 가이드

1. **명확한 목표 설정**: 무엇을 만들고 싶은지 구체적으로 명시하세요.
2. **참조 파일 지정**: `@파일명`을 사용하여 관련 파일을 컨텍스트에 포함시키세요.
3. **단계적 진행**: 복잡한 작업은 `/tdd` 워크플로우를 따라 단계별로 진행하세요.

---

## 🚨 문제 해결

- **테스트 실패 시**: `/tdd` 명령어로 테스트를 수정하거나 구현을 보완하세요.
- **빌드 에러 시**: `/verify`를 실행하여 에러 로그를 확인하고 에이전트에게 수정을 요청하세요.
- **환각(Hallucination)**: 에이전트가 존재하지 않는 라이브러리를 사용하려 한다면, `operations.md`의 규칙(npm 사용)을 상기시켜주세요.
