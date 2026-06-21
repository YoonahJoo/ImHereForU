# History — 개발 히스토리

프로젝트의 주요 결정, 구현, 문제 해결 과정을 날짜 순으로 기록.

---

## 2026-06-15 — 책 UI 디자인 리워크

### 배경
MVP 완성 후 기존의 단순한 div 기반 UI(400×500px)를 책 에셋 기반으로 전면 교체.
사용자가 앱을 열면 책 표지가 펼쳐지는 경험을 주는 것이 목표.

### 구현한 것들

**투명 창 + 책 배경**
- `transparent: true, frame: false` Electron 윈도우 → 배경 없이 책 이미지만 떠 있는 느낌
- `book-light.png` / `book-dark.png`를 메인 배경으로 적용 (900×639px)
- `-webkit-app-region: drag` 로 창 전체를 드래그 가능하게, 클릭 요소에만 `no-drag` 처리

**책 열리는 인트로 애니메이션**
- `BookIntro` 컴포넌트 신규 생성
- CSS 3D flip: `transform-style: preserve-3d`, `backface-visibility: hidden`, `rotateY(-180deg)`
- 인트로 창(500×750 세로) → 메인 창(900×639 가로) IPC 리사이즈로 해결
  - `ipcMain.on('resize-window')` + `window.ipcRenderer.send('resize-window', { width, height })`

**인터랙티브 에셋 오버레이**
- sunflower / bouquet / memo / settings / frog-exit 등 PNG 에셋을 절대 위치로 배치
- Figma에서 book-light.png(900×639) 위에 에셋 올린 후 X/Y/W/H 읽어 CSS에 직접 적용
- 각 에셋 rotate 값도 Figma 패널 기준으로 CSS `transform: rotate(Ndeg)` 적용

**캐릭터 + 인터랙션 개선**
- 캐릭터 이미지 `yoonah-v2.0.png` 교체
- 더블클릭 하트 이펙트: 이모지(💖) → 구겨진 종이 heart PNG
- 하트가 캐릭터 위치를 따라다니도록 `offsetX`, `offsetY` prop 추가
- 말풍선 스타일: Fog Mist(#E8E0D5) 배경 + 에스프레소 브라운(#1C100A) 텍스트
- 말풍선 너비 `max-width` → `width` 고정 (드래그 시 말풍선 세로로 찌그러지는 버그 수정)
- 설정 버튼 ⚙️ → heart.png PNG 교체

**온보딩 오버레이**
- bouquet 클릭 → 배경 블러(backdrop-filter: blur) + explain-light.png 오버레이
- frog-exit-button.png 클릭 시 닫힘 (x:672, y:462, rotate:-16.74deg)

**앱 시작 인삿말**
- YoonahRoom 마운트 시 말풍선 3개 순차 출력 (300ms / 2300ms / 4300ms)
- `greetingActive` ref로 인삿말 중 시간대 자동 인사가 끼어드는 버그 방지

### 해결한 기술적 문제들

| 문제 | 원인 | 해결 |
|---|---|---|
| 클릭 인터랙션 안 됨 | `-webkit-app-region: drag`가 mousedown 가로챔 | 클릭 요소에 `no-drag` 추가 |
| 하트가 항상 같은 자리에서 뜸 | HeartEffect에 캐릭터 위치 전달 안 됨 | `offsetX/Y` prop 추가 |
| 하트가 잘림 | `.heart-effect`에 `overflow: hidden` | `overflow: visible`로 변경 |
| 말풍선이 드래그 시 좁아짐 | `max-width`는 컨테이너 가장자리 기준 | `width` 고정값으로 변경 |
| 인트로가 창보다 큼 | 인트로(세로)와 메인(가로) 창 크기 충돌 | IPC 리사이즈로 창 크기 분리 |
| 시간대 인사가 인삿말과 겹침 | timeMessage가 1초 후 실행 | `greetingActive` ref 가드 추가 |

---

## 2026-06-01 — MVP 완성 (라이트/다크 테마 포함)

- 라이트 / 다크 테마 전환 구현
- localStorage로 설정 영속성 확보
- Widget MVP 전체 기능 완성
- git 커밋: `e732650 feat: add light/dark theme support and complete widget MVP`

---

## 2026-05-26 — 버그 수정 + 문서화

- sulky daily 모드에서 랜덤 메시지 적용
- PRD.md 작성 (프로젝트 기획서)
- Reference 이미지 추가

---

## 2026-05-24 — MVP 초기 구현 완성

- Electron + React + Vite + TypeScript 초기 세팅
- 캐릭터 표정 시스템 (10종), 마우스 인터랙션 (클릭/더블클릭/드래그/롱프레스)
- Daily / Focus 모드 전환
- Focus 타이머 (25분 포모도로)
- 방치 감지 Idle Behavior (15분)
  - Focus 타이머 실행 중 idle 타이머 소멸 버그 수정 (pauseIdle/resetIdle 분리)
- Focus 타이머 실행 중 Daily 모드 전환 차단 + "where u going" 메시지
- 선물 시스템 + Gift Room UI
- Settings 패널
- 시간대 자동 인사
