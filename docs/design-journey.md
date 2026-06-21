# Mini Yoonah — Design Journey

MVP부터 현재까지의 디자인 결정과 그 근거를 기록한 문서.  
인터뷰 시 디자인 사고 과정과 기술적 문제 해결 경험을 설명하기 위해 작성.

---

## 버전 로드맵

| 버전 | 기간 | 핵심 주제 |
|---|---|---|
| v1.0 MVP | 2026-05-24 ~ 06-01 | 기능 검증 — 이모지 기반 프로토타입 |
| v2.0 | 2026-06-15 ~ | 디자인 정의 — 책 세계관 + 캐릭터/UI 에셋 구축 |
| v3.0 | 예정 | 캐릭터 독립 — 책에서 나와 데스크탑에서 자유롭게 상호작용 |

---

---

## v1.0 — MVP Design (2026-05-24)

### 앱 개요

Electron 기반 데스크탑 동반자 앱. 항상 화면 위에 떠 있는 작은 캐릭터 윈도우.  
창 크기: 320 × 480px (고정)

---

### 캐릭터 스타일

- Blythe 돌 / chibi 일러스트 감성
- 큰 검은 눈(하이라이트 있음), 긴 속눈썹, 홍조, 주근깨
- 연필/크레용 텍스처 느낌의 손그림 스타일
- 현재 이모지로 표현 중 (ex: 😚🥰😪👩‍💻)
- 향후 일러스트 에셋으로 교체 예정

---

### 컬러 팔레트

| 역할 | 색상 | 헥스 |
|------|------|------|
| Primary | Pastel Pink | `#FFB7C5` |
| Secondary | Pastel Blue | `#B8D4F0` |
| Accent | Pastel Yellow | `#FFF0C8` |
| Background | Cream Pink | `#FFF5F7` |
| Text | Muted Purple-Brown | `#6B5B73` |
| Border / Line | Dusty Rose | `#E8A0B0` |

---

### UI 무드 키워드

kawaii / stationery / Sanrio / soft / cozy / 귀여운 데스크탑 위젯

---

### 디자인 원칙

1. 모든 테두리는 scalloped(물결) 또는 rounded — 날카로운 직각 없음
2. 배경에 subtle한 격자(grid) 또는 깅엄(gingham) 패턴
3. 장식 요소: 리본, 별, 하트, 반짝이 — 과하지 않게 포인트로
4. 버튼은 파스텔 계열 fill + 얇은 dusty rose 테두리
5. 폰트: Nunito / Quicksand / rounded sans-serif 계열

---

### 화면 구성

```
┌─────────────────────────────────┐
│  [Daily / Focus 토글]    [⚙️]   │  ← 상단 바 (40px)
├─────────────────────────────────┤
│                                 │
│       [말풍선]                  │  ← 캐릭터 스테이지 (~280px)
│         캐릭터                  │
│     hint text                   │
│                                 │
├─────────────────────────────────┤
│  [🎁 Gift Room]  [Focus Timer]  │  ← 하단 바 (60px)
└─────────────────────────────────┘
```

### Daily Mode (기본 상태)

- 상단: Daily(활성) / Focus 탭 토글 + 설정 ⚙️
- 중단: 캐릭터(😚), `"Click me! 🥺"` 힌트 텍스트
- 하단: 🎁 Gift Room 버튼

### Focus Mode

- 상단: Daily / Focus(활성) 탭
- 중단: 캐릭터(👩‍💻), `"Let's focus together 📚"` 힌트
- 하단: 🎁 Gift Room + Focus Timer 버튼

### 말풍선 (Speech Bubble)

- 캐릭터 클릭 시 등장, 3초 후 자동으로 사라짐
- 구름 모양 또는 둥근 말풍선
- 크림/화이트 배경, dusty rose 테두리

---

### 컴포넌트 디자인 목록

- [ ] 메인 앱 레이아웃 (전체 320×480, Daily Mode)
- [ ] 메인 앱 레이아웃 (Focus Mode)
- [ ] Daily / Focus 탭 토글
- [ ] 말풍선 컴포넌트
- [ ] Gift Room 버튼
- [ ] Focus Timer UI (숫자 + 시작/정지 버튼)
- [ ] Settings 팝업
- [ ] Gift Room 화면 (선물 컬렉션 뷰)

---

### Claude Design 프롬프트 템플릿

claude.ai에서 레퍼런스 이미지와 함께 사용할 프롬프트.

```
I'm designing a desktop companion app called "Mini Yoonah" — a small Electron window 
that sits on the user's screen. I've attached reference images:

[Character refs]: Blythe-doll aesthetic — big dark eyes, long lashes, rosy cheeks 
with freckles, straight black hair, chibi body proportions, pencil/crayon texture 
illustration style.

[UI refs]: Kawaii stationery / Sanrio-style UI — pastel pink, blue, yellow color 
palette, scalloped/wavy borders, gingham/grid textures, bows and ribbon decorations, 
rounded cute frames, sparkle accents.

Please design [COMPONENT NAME] as an HTML artifact I can render.
App window size: 320×480px.

Design requirements:
- Color palette: #FFB7C5 (pink), #B8D4F0 (blue), #FFF0C8 (yellow), #FFF5F7 (bg), #6B5B73 (text), #E8A0B0 (border)
- Background: subtle grid or gingham texture on cream-pink base
- All borders: scalloped or wavy, never sharp rectangles
- Buttons: pastel fill + dusty rose border, small decorative element (bow, star, etc.)
- Typography: Nunito or Quicksand (import from Google Fonts)
- Decorative accents: tiny stars ✦, hearts ♡, sparkles — subtle, not overwhelming
- Font imports via Google Fonts CDN
```

---

### 레퍼런스 이미지 목록

| 파일명 | 용도 |
|--------|------|
| `_ (3).jpeg` | 캐릭터 스타일 레퍼런스 (네잎클로버 든 Blythe 캐릭터) |
| `alina.jpeg` | 캐릭터 스타일 레퍼런스 (크루아상 먹는 Blythe 캐릭터) |
| `icon (yop).jpeg` | 캐릭터 전신 레퍼런스 (chibi 전신, 핑크 스트라이프 옷) |
| `_ (10).jpeg` | UI 레퍼런스 — 파스텔 옐로우, 별, 물결 테두리, 카드 레이아웃 |
| `_ (11).jpeg` | UI 레퍼런스 — 핑크 배경 kawaii 데스크탑 위젯 UI |
| `_ (12).jpeg` | UI 레퍼런스 — 핑크/블루 깅엄, 리본, 물결 테두리 스테이셔너리 |
| `_ (13).jpeg` | UI 레퍼런스 — kawaii 채팅앱 UI (핑크 픽셀 스타일 윈도우) |
| `Hojas para imprimir.jpeg` | UI 레퍼런스 — 핑크 격자 노트, 리본, 파스텔 분홍 전반 |

---

---

## v2.0 — 책 세계관 리워크 (2026-06-15 ~)

### 1. MVP 디자인의 한계 — 왜 바꿔야 했는가

이 앱의 핵심 가치는 PRD에서 **Emotional Presence**로 정의된다.

> "사용자가 혼자 작업하는 시간에도 상대방의 존재감을 느낄 수 있도록 돕는다."

MVP를 완성한 후 이 기준으로 디자인을 다시 봤을 때, 두 가지 문제가 명확했다.

**문제 1 — 캐릭터가 보이지 않았다**  
표정 시스템, 인터랙션 로직, 말풍선까지 기능적으로는 완성됐지만, 캐릭터 자체가 이모지 하나로 대체되어 있었다. "상대방의 존재감"을 전달하는 앱에서 정작 상대방이 보이지 않았다.

**문제 2 — UI가 앱의 감정적 목적을 전달하지 못했다**  
흰 배경의 div에 파스텔 팔레트를 입힌 UI는 일반적인 생산성 위젯과 구분되지 않았다. 캐릭터가 "사는 공간"이라는 감각이 없었고, 사용자가 앱을 열었을 때 "누군가의 세계에 접속한다"는 감각도 없었다. 기능은 동작했지만 감성이 전달되지 않았다.

---

### 2. 새로운 컨셉 — 책, 그리고 존재감의 단계적 확장

MVP의 문제를 해결하는 방향을 찾는 과정에서, 단순히 "예쁜 배경"을 추가하는 것으로는 부족하다는 판단을 했다. 디자인이 앱의 서사와 맞닿아 있어야 했다.

이 앱의 최종 목표는 캐릭터가 책에서 나와 사용자의 데스크탑 위에서 독립적으로 살아 움직이는 것(v3.0)이다. 그 여정을 역방향으로 생각했을 때, 단계가 보였다.

```
v1.0  캐릭터가 인터페이스 안에 있다      presence in an interface
v2.0  캐릭터가 자신만의 세계에 있다      presence in their own world
v3.0  캐릭터가 사용자의 세계로 나온다    presence in your world
```

이 서사에서 **책**은 두 가지 역할을 동시에 수행한다.

**역할 1 — 캐릭터의 세계를 만든다**  
책은 캐릭터가 살고 있는 공간을 시각적으로 정의한다. 사용자가 앱을 열 때 책을 펼치는 행위 자체가 "캐릭터의 세계를 방문한다"는 의미가 된다. 공간이 생기면 캐릭터의 존재감도 생긴다.

**역할 2 — v3.0의 논리적 전제가 된다**  
캐릭터가 "책 밖으로 나온다"는 개념은 먼저 책이라는 세계가 확립되어 있어야 성립한다. v2.0에서 책을 캐릭터의 원점으로 만들어 두면, v3.0에서 그 세계를 떠나 사용자의 데스크탑으로 나오는 순간이 극적으로 느껴진다. **책은 목적지가 아니라 출발점이다.**

또한 책/스테이셔너리 무드는 이 앱의 주요 사용 맥락인 "공부하면서 함께 있는 감각"과 자연스럽게 연결된다.

---

### 3. 주요 디자인 결정

#### 3-1. 투명 프레임리스 윈도우

| 항목 | v1.0 | v2.0 |
|---|---|---|
| 윈도우 스타일 | 기본 OS 창 테두리 | `transparent: true, frame: false` |
| 배경 | 흰 div | 투명 — 책 PNG만 화면에 떠 있음 |

책이 화면 위에 물리적으로 놓인 것처럼 보이게 하려면 OS 기본 창 테두리를 없애야 했다. 투명 배경으로 책 외의 영역을 완전히 걷어냈다.

**트레이드오프**: 투명 창에서는 OS 기본 드래그가 사라진다. `-webkit-app-region: drag`로 직접 구현해야 했고, 이 설정이 mousedown 이벤트를 가로채 캐릭터의 모든 클릭 인터랙션이 작동하지 않는 문제가 생겼다. 클릭 요소 전체에 `-webkit-app-region: no-drag`를 추가해서 해결했다. **디자인 결정 하나가 인터랙션 전체를 다시 설계하게 만든 사례.**

---

#### 3-2. 창 크기와 비율 변경

| 항목 | v1.0 | v2.0 |
|---|---|---|
| 창 크기 | 320 × 480px | 900 × 639px |
| 비율 | 세로형 | 가로형 (책 펼친 모양) |

책을 펼친 형태는 가로형이다. 이 단순한 결정이 내부 레이아웃 전체의 재설계를 요구했다.

---

#### 3-3. 책 인트로 애니메이션

앱을 열면 책 표지 → 3D 플립 → 책 내지로 전환되는 애니메이션.  
구현 방식: CSS 3D flip (`transform-style: preserve-3d`, `backface-visibility: hidden`, `rotateY(-180deg)`)

**기술적 문제**: 인트로(세로형 책 표지, 500×750)와 메인 화면(가로형 책 내지, 900×639)의 창 크기가 달랐다. 하나의 Electron 창 안에서 처리할 수 없었다.  
**해결**: 애니메이션 완료 시점에 IPC로 창 크기를 동적으로 변경 (`ipcMain.on('resize-window')`). 인트로를 별도 컴포넌트(`BookIntro`)로 분리해 메인 UI와 생명주기를 독립적으로 관리했다.

---

#### 3-4. 컬러 시스템 변경

| 항목 | v1.0 | v2.0 |
|---|---|---|
| 배경 | Cream Pink `#FFF5F7` | 책 PNG (Fog Mist 베이지 계열) |
| 텍스트 | Muted Purple-Brown `#6B5B73` | Espresso Brown `#1C100A` |
| 말풍선 | 흰 배경 + dusty rose 테두리 | Fog Mist `#E8E0D5` + Espresso Brown |
| 무드 | kawaii / Sanrio / pastel | cozy / stationery / 아날로그 |

책 에셋의 색조가 베이지/브라운 계열이라, v1.0의 파스텔 핑크 팔레트와 충돌했다. 책과 어울리는 따뜻한 중립 계열로 전환했다.

---

#### 3-5. 캐릭터 에셋 교체

MVP에서 이모지로 대체했던 캐릭터를 실제 일러스트(`yoonah.png`, 1110×1417px)로 교체했다. 이에 따른 연쇄 변경:

- 하트 이펙트: 💖 이모지 → 구겨진 종이 heart PNG
- 설정 버튼: ⚙️ 이모지 → heart PNG

일관된 일러스트 스타일로 UI 전반의 이모지 요소를 교체하는 방향으로 진행 중.

---

#### 3-6. 인터랙티브 에셋 배치 (Figma 좌표 기반)

책 배경 위에 해바라기(sunflower), 꽃다발(bouquet), 메모(memo) 등 PNG 에셋을 배치했다.  
Figma에서 `book-light.png`(900×639)를 배경으로 깔고, 각 에셋의 X/Y/rotate 값을 패널에서 읽어 CSS `position: absolute`로 그대로 적용했다.

```
sunflower (focus 모드) — x:253, y:77, rotate:175.87deg
sunflower (daily 모드) — x:190, y:457
bouquet (온보딩)       — x:711, y:410, rotate:-18.43deg
memo (gift room)       — x:565, y:44
```

**잠재적 문제**: 절대 좌표 기반 배치는 다크모드 또는 해상도가 달라질 경우 좌표가 틀어질 수 있다. 현재 단일 해상도(900×639)에 최적화된 방식이며, 향후 반응형 처리 시 재작업이 필요할 수 있다.

---

### 4. v2.0 진행 중인 작업

#### 4-1. 캐릭터 애니메이션 시스템

캐릭터를 레이어로 분리해 각 레이어를 독립적으로 제어하는 구조로 전환 예정.

| 레이어 | 파일 수 | 역할 |
|---|---|---|
| body | 1 | 몸통 (float 애니메이션 적용) |
| face | 10 | 표정별 얼굴 (expression에 따라 교체) |
| eyes | 2 | 눈 뜬/감은 상태 (주기적 깜빡임) |
| arm | 2 | 기본/손흔들기 (CSS keyframe) |

총 15개 에셋. 동일 캔버스(1110×1417px)로 제작 후 CSS `position: absolute`로 적층.

이 구조의 장점: float 애니메이션 + 눈깜빡임 + 손흔들기가 서로 독립적으로 동시에 실행 가능.

#### 4-2. 나머지 진행 예정 항목

- 상단 sunflower → Focus 타이머 start/pause 연동
- Settings / Gift Room 책 UI 스타일 적용
- 다크모드 에셋 대응

---

### 5. v3.0 — 캐릭터 독립 (예정)

v2.0에서 캐릭터에게 "원래 사는 세계(책)"를 부여하면, v3.0에서 그 세계를 떠나는 행위가 의미를 가진다.

v3.0의 목표: 캐릭터가 책 밖으로 나와 사용자의 데스크탑 위에서 독립적으로 움직이고 상호작용한다.

- Electron의 투명 창을 데스크탑 전체 영역으로 확장
- 캐릭터가 화면 어디서든 자유롭게 이동
- 현재 v2.0에서 구축한 레이어 애니메이션 시스템과 표정 시스템을 그대로 재사용
- 새로운 body 에셋 없이 기존 15개 에셋으로 커버 가능 (포즈 동일)

v2.0의 책 세계관이 확립되어 있어야 "책 밖으로 나온다"는 개념이 성립한다. v3.0은 v2.0의 논리적 귀결이다.

---

### 6. 배운 점 — 인터뷰용 회고

**디자인 결정이 기술 구현을 바꾼 사례들**

| 디자인 결정 | 발생한 기술적 문제 | 해결 방법 |
|---|---|---|
| 투명 프레임리스 창 | `-webkit-app-region: drag`가 클릭 이벤트를 가로챔 | 클릭 요소 전체에 `no-drag` 처리 |
| 인트로(세로)와 메인(가로) 창 크기 다름 | 하나의 창에서 처리 불가 | IPC로 창 크기 동적 변경 |
| 말풍선이 캐릭터를 따라다녀야 함 | 캐릭터 위치 정보가 말풍선에 전달되지 않음 | `offsetX/Y` prop 추가 |

**MVP와 v2.0의 핵심 차이**

MVP는 *기능이 동작하는가*를 검증했다.  
v2.0은 *감성이 전달되는가*를 검증하고 있다.

같은 인터랙션(클릭, 드래그, 롱프레스)이지만, 캐릭터가 책 속 공간에 있을 때와 흰 div 안에 있을 때 사용자가 느끼는 감각이 다르다. 기능 완성도보다 **세계관의 일관성**이 이 프로젝트에서 더 중요한 디자인 지표다.
