# Mini Yoonah

데스크탑 위에 항상 함께 있는 캐릭터 동반자 앱.  
공부하거나 작업하는 시간 동안 상대방의 존재감을 느낄 수 있도록 만들었다.

---

## 소개

Mini Yoonah는 macOS 데스크탑 위에 떠 있는 작은 캐릭터 위젯이다. 책 모양의 창 안에서 캐릭터가 살고 있으며, 클릭하거나 드래그하면 반응한다. Focus 타이머와 함께 쓰면 집중 시간 동안 곁에 있는 감각을 준다.

**핵심 인터랙션**

- 클릭 — 말풍선으로 반응
- 더블클릭 — 하트 이펙트
- 롱프레스 — 삐짐 표정
- 드래그 — 잡혀서 흔들리는 pendulum 애니메이션
- Focus 타이머 실행 중 — 표정과 말풍선이 집중 모드로 전환

**표정 시스템**

총 12종의 표정 이미지가 CSS crossfade로 부드럽게 전환된다. 시간대별 시작 인삿말, 15분 방치 감지, 새벽/야간 특수 연출도 포함.

---

## 기술 스택

| 역할 | 기술 |
|---|---|
| 데스크탑 런타임 | Electron 30 |
| UI | React 18 + TypeScript |
| 번들러 | Vite 5 |
| 스타일 | CSS (컴포넌트별 .css, 라이브러리 없음) |
| 상태 관리 | useState / useRef (외부 라이브러리 없음) |
| 영속성 | localStorage |

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 모드 실행 (Vite dev server + Electron 동시 실행)
npm run dev

# 프로덕션 빌드 및 패키징
npm run build
```

> macOS 전용. Node.js 18 이상 필요.

---

## 현재 상태

**v2.0 구현 완료** (2026-06-22)

- 책 세계관 UI (투명 프레임리스 창, 책 펼치기 인트로 애니메이션)
- 캐릭터 표정 시스템 12종 + crossfade 전환
- Focus 타이머 (25분 포모도로, 드래그 이동 가능)
- GiftRoom / Settings 패널 (blur backdrop + floating)
- 온보딩 캐러셀 3페이지
- 라이트 / 다크 테마
- 시간대별 시작 인삿말 (morning / afternoon / evening / night / dawn)

**v3.0 작업 예정** — 캐릭터가 책 밖으로 나와 데스크탑 전체에서 활동하는 "데스크탑 메이트" 확장.  
확장 계획 전체는 [`docs/v3.0-plan.md`](docs/v3.0-plan.md)에 정리되어 있다.

---

## 문서

| 파일 | 내용 |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | 프로젝트 기획서 |
| [`docs/design-journey.md`](docs/design-journey.md) | 버전별 디자인 결정 과정 |
| [`docs/tech-stack.md`](docs/tech-stack.md) | 기술 스택 상세 |
| [`docs/v3.0-plan.md`](docs/v3.0-plan.md) | v3.0 확장 계획 및 기술 설계 |
| [`docs/history.md`](docs/history.md) | 개발 히스토리 |
| [`docs/work.md`](docs/work.md) | 작업 현황 |
