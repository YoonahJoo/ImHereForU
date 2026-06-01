# Mini Yoonah — Design Brief

## 앱 개요

Electron 기반 데스크탑 동반자 앱. 항상 화면 위에 떠 있는 작은 캐릭터 윈도우.
창 크기: 320 × 480px (고정)

---

## 캐릭터 스타일

- Blythe 돌 / chibi 일러스트 감성
- 큰 검은 눈(하이라이트 있음), 긴 속눈썹, 홍조, 주근깨
- 연필/크레용 텍스처 느낌의 손그림 스타일
- 현재 이모지로 표현 중 (ex: 😚🥰😪👩‍💻)
- 향후 일러스트 에셋으로 교체 예정

---

## 컬러 팔레트

| 역할 | 색상 | 헥스 |
|------|------|------|
| Primary | Pastel Pink | `#FFB7C5` |
| Secondary | Pastel Blue | `#B8D4F0` |
| Accent | Pastel Yellow | `#FFF0C8` |
| Background | Cream Pink | `#FFF5F7` |
| Text | Muted Purple-Brown | `#6B5B73` |
| Border / Line | Dusty Rose | `#E8A0B0` |

---

## UI 무드 키워드

kawaii / stationery / Sanrio / soft / cozy / 귀여운 데스크탑 위젯

---

## 디자인 원칙

1. 모든 테두리는 scalloped(물결) 또는 rounded — 날카로운 직각 없음
2. 배경에 subtle한 격자(grid) 또는 깅엄(gingham) 패턴
3. 장식 요소: 리본, 별, 하트, 반짝이 — 과하지 않게 포인트로
4. 버튼은 파스텔 계열 fill + 얇은 dusty rose 테두리
5. 폰트: Nunito / Quicksand / rounded sans-serif 계열

---

## 화면 구성

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

## 컴포넌트 디자인 목록

- [ ] 메인 앱 레이아웃 (전체 320×480, Daily Mode)
- [ ] 메인 앱 레이아웃 (Focus Mode)
- [ ] Daily / Focus 탭 토글
- [ ] 말풍선 컴포넌트
- [ ] Gift Room 버튼
- [ ] Focus Timer UI (숫자 + 시작/정지 버튼)
- [ ] Settings 팝업
- [ ] Gift Room 화면 (선물 컬렉션 뷰)

---

## Claude Design 프롬프트 템플릿

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

## 레퍼런스 이미지 목록

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
