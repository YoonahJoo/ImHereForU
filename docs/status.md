# 프로젝트 현황 스냅샷

**최종 업데이트**: 2026-06-03  
**현재 브랜치**: main  
**마지막 커밋**: `e732650 feat: add light/dark theme support and complete widget MVP`

---

## 현재 상태: MVP 완성, 디자인 리워크 준비 중

---

## 완성된 기능 (MVP)

전체 기능 상세는 [MVP.md](./MVP.md) 참고.

| 기능 | 상태 |
|------|------|
| 캐릭터 표정 시스템 (10종) | ✅ 완성 |
| 마우스 인터랙션 (클릭 / 더블클릭 / 드래그 / 롱프레스) | ✅ 완성 |
| 캐릭터 자유 이동 (드래그) | ✅ 완성 |
| 말풍선 시스템 | ✅ 완성 |
| Daily / Focus 모드 전환 | ✅ 완성 |
| Focus 타이머 (25분 포모도로) | ✅ 완성 |
| Focus 타이머 실행 중 모드 전환 차단 | ✅ 완성 |
| 방치 감지 Idle Behavior (15분) | ✅ 완성 |
| 시간대 자동 인사 | ✅ 완성 |
| 선물 시스템 (희귀도 가중치) | ✅ 완성 |
| Gift Room UI | ✅ 완성 |
| Settings (이름, 기본 모드, 커스텀 메시지) | ✅ 완성 |
| 라이트 / 다크 테마 | ✅ 완성 |
| localStorage 영속성 | ✅ 완성 |

---

## 다음 작업: 디자인 리워크

**목표**: 현재 기능 레이아웃(단순 div 구조, 400×500px)을 design-brief.md의 kawaii stationery 디자인으로 교체

**현재 상태**:
- `design-brief.md` 작성 완료 (컬러팔레트, UI 원칙, 컴포넌트 목록)
- 책상+책 레이아웃(880×620px)으로 리디자인 시도 → 방향이 design-brief와 달라 폐기 후 되돌림
- 다음 방향은 design-brief 기준 **320×480px 위젯 스타일**

**남은 디자인 컴포넌트** (design-brief.md 체크리스트 기준):
- [ ] 메인 앱 레이아웃 전체 (Daily Mode)
- [ ] 메인 앱 레이아웃 전체 (Focus Mode)
- [ ] Daily / Focus 탭 토글
- [ ] 말풍선 컴포넌트
- [ ] Gift Room 버튼
- [ ] Focus Timer UI
- [ ] Settings 팝업
- [ ] Gift Room 화면

---

## 핵심 파일 구조

| 파일 | 역할 |
|------|------|
| `electron/main.ts` | 앱 창 설정 (현재 400×500) |
| `src/components/YoonahRoom/YoonahRoom.tsx` | 메인 컴포넌트 — 모든 인터랙션 로직 집중 |
| `src/components/YoonahRoom/YoonahRoom.css` | 메인 스타일 |
| `src/hooks/useIdleBehavior.ts` | 방치 감지 타이머 |
| `src/hooks/useFocusTimer.ts` | 포모도로 타이머 |
| `src/data/messages.ts` | 말풍선 메시지 풀 |
| `src/data/gifts.ts` | 선물 아이템 목록 |
| `src/types/index.ts` | Expression, Mode 등 공통 타입 |

---

## 구현 주의사항 요약

> 상세 내용은 [phase-log.md](./phase-log.md) 참고

- `pauseIdle()` / `resetIdle()` 은 `timerStatus` useEffect에서 중앙 관리됨. Focus 타이머 관련 코드 수정 시 이 useEffect가 올바르게 트리거되는지 확인 필요.
- `cheeringReturnTimer` 와 `exprTimer` 는 역할이 분리되어 있음. cheering 복귀 로직은 반드시 `cheeringReturnTimer` 만 사용해야 함.
- `modeBlockTimer` 는 중첩 setTimeout 구조 (2500ms → 2000ms 순차). 수정 시 두 타이머 모두 클린업 확인 필요.
