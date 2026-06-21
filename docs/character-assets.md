# 캐릭터 에셋 요청서 (Claude Design 버전)

Claude Design에게 이미지 생성을 요청할 때 사용하는 에셋 명세입니다.

---

## 접근 방식

- **표정별 완성 이미지** 방식 — 레이어 합성 없음
- 각 표정은 몸 + 얼굴이 포함된 완성 이미지 1장
- 무브먼트(float, bounce, shake, tilt 등)는 CSS로 처리 — 에셋 불필요
- 예외: `arm_wave.png` (손 흔들기용 팔 레이어 1개)

---

## 공통 조건 (모든 파일 동일 적용)

- 캔버스 크기: **1110 × 1417px**
- 배경: **완전 투명 PNG**
- 캐릭터 위치: **모든 이미지에서 동일 위치 유지** (몸, 머리, 팔 위치 고정)
- 캐릭터 스타일, 색상, 비율: `yoonah.png` 기준으로 완전 동일하게 유지
- 변경 가능한 것: 입 모양, 눈썹, 볼터치, 눈 뜸/감음

---

## 에셋 목록 (총 12개)

### 완성 표정 이미지 (11개)

| 파일명 | 표정 | 변경 요소 |
|---|---|---|
| `character_idle.png` | 기본 | 평온한 눈, 자연스러운 입 |
| `character_idle_blink.png` | 기본 (눈 감음) | `character_idle.png`와 동일, 눈만 감은 상태 |
| `character_smile.png` | 미소 | 눈웃음, 올라간 입꼬리, 볼터치 |
| `character_sulky_daily.png` | 화남 | 찡그린 눈썹, 뾰족하게 다문 입 |
| `character_sulky_focus.png` | 코웃음 | 삐딱한 입, 한쪽 눈썹 올림 |
| `character_sleepy.png` | 졸림 | 반쯤 감긴 눈, 처진 눈썹, 힘없는 입 |
| `character_focus.png` | 집중 | 진지하게 다문 입, 일자 눈썹 |
| `character_dragging_daily.png` | 의심 | 한쪽 눈썹만 올린 표정, 삐죽한 입 |
| `character_dragging_focus.png` | 무표정 | 일자 입, 평평한 눈썹 |
| `character_curious.png` | 호기심 | 동그란 안경 착용, 갸웃한 눈썹 |
| `character_cheering.png` | 뿌듯함 | 흐뭇한 입꼬리, 여유로운 눈썹 |

---

### 레이어 에셋 (1개)

| 파일명 | 내용 |
|---|---|
| `arm_wave.png` | 손 흔드는 팔만 포함. 나머지 영역 완전 투명. 캐릭터 이미지 위에 absolute로 얹음 |

> `arm_wave.png`는 완성 이미지들과 팔 위치가 정확히 맞아야 합니다.
> 완성 이미지의 팔 위치를 기준으로 생성해주세요.

---

## 에셋이 필요 없는 무브먼트 (CSS로 처리)

아래 움직임은 에셋 없이 CSS만으로 구현합니다. 생성 요청 불필요.

| 무브먼트 | 트리거 |
|---|---|
| float (둥둥 떠다님) | idle 상태 |
| bounce (튕김) | 클릭 |
| shake (진동) | 롱프레스 |
| tilt (기울기) | 드래그 |
| sway (느린 흔들림) | sleepy 상태 |
| 고개 흔들기 | curious 상태 |
