# project components

[프로젝트 구성요소]

```json
프로젝트 구성요소
├─ 1. 기획 문서
│  └─ PRD
│
├─ 2. 기술 설계 문서
│  ├─ 시스템 아키텍처 다이어그램
│  ├─ 기술스택
│  ├─ ERD
│  ├─ 시퀀스 다이어그램
│  ├─ API 명세서
│  └─ 기술 플로우차트
│
├─ 3. 프로젝트 관리 문서
│  ├─ 역할분담
│  └─ 일정관리
│
└─ 4. 디자인 산출물
└─ Figma 디자인
```

- 각 개념 설명문
    
    **1. PRD**
    PRD는 우리가 **무엇을, 왜 만들 것인지** 설명하는 제품 요구사항 문서야.
    보통 다음 내용이 들어가.
    
    - 프로젝트 목적
    - 해결하려는 문제
    - 주요 사용자
    - 핵심 기능
    - 사용자 흐름
    - MVP 범위
    - 기능별 요구사항
    - 예외 상황과 정책
    
    즉, 개발 방식보다 **서비스의 목적과 기능**을 먼저 정의하는 문서야.
    
    **2. 시스템 아키텍처 다이어그램**
    시스템 아키텍처 다이어그램은:프론트엔드, 서버, 데이터베이스, 외부 서비스 등 시스템을 구성하는 요소와 이들의 연결 관계를 전체적으로 보여주는 기술 구조도
    야.
    예를 들면:
    
    사용자→ Next.js→ API Route Handler→ Prisma→ PostgreSQL
    
    그리고 옆으로:
    
    Auth.js → 카카오 로그인API → CLOVA OCRClient ↔ Socket.io Server
    
    같은 관계가 표시돼.
    따라서 시스템 아키텍처는 단순한 기술스택 목록이 아니라:
    
    - 어떤 구성요소가 존재하는지
    - 각 구성요소가 어디에 위치하는지
    - 서로 어떻게 연결되는지
    - 데이터와 요청이 어디로 이동하는지
    
    를 보여줘.
    
    정리하면: 기술스택이 “무엇을 사용하는가”라면, 아키텍처 다이어그램은 “그 기술들이 어떻게 연결되어 작동하는가”를 보여준다.
    
    **3. 기술스택**
    기술스택 문서는 프로젝트에 사용하는 기술과 각 기술의 역할을 정리한 문서야. 기술스택은 단순 문장보다 표로 정리하면 다음 내용을 한눈에 비교하기 쉬워.
    
    | 구분 | 기술 | 역할 | 선정 이유 |
    | --- | --- | --- | --- |
    | 프론트엔드 | Next.js | 화면 및 서버 렌더링 | 프론트·서버 통합 개발 가능 |
    | 언어 | TypeScript | 정적 타입 검사 | 오류 예방 및 협업 용이 |
    | 데이터베이스 | PostgreSQL | 영구 데이터 저장 | 관계형 데이터 관리 적합 |
    | ORM | Prisma | 서버와 DB 연결 | 타입 안전한 DB 접근 |
    | 실시간 통신 | Socket.io | 투표 결과 실시간 전달 | 이벤트 기반 양방향 통신 |
    | 인증 | Auth.js | 로그인과 세션 관리 | Next.js와 통합 편리 |
    - 어떤 영역의 기술인지
    - 어떤 기술을 선택했는지
    - 프로젝트에서 무슨 역할을 하는지
    - 왜 선택했는지
    - 버전이 무엇인지
    
    따라서 기술스택(table)은:기술스택을 표 형식으로 정리한다. 는 뜻이야.
    
    **4. ERD**
    ERD는 데이터베이스의:
    
    - 테이블
    - 테이블 내부 컬럼
    - 기본키와 외래키
    - 테이블 간 관계
    
    를 그림으로 표현한 데이터베이스 설계도야.
    예:
    
    ```json
    USER1│NMEETING_MEMBERN│1MEETING
    ```
    
    이를 통해 다음을 알 수 있어.
    
    - 한 사용자가 여러 모임에 참여할 수 있는지
    - 한 모임에 여러 참석자가 있는지
    - 투표가 어떤 회원과 장소 후보에 연결되는지
    - 정산 데이터가 영수증과 어떻게 연결되는지
    
    다만 ERD에서 말하는 테이블은 기술스택 표의 table과 다른 의미야.
    
    - 기술스택의 table: 문서를 보기 좋게 정리하는 표
    - ERD의 table: 데이터베이스 안에 데이터를 저장하는 테이블
    
    **5. 시퀀스 다이어그램**
    특정 기능이 실행될 때 사용자, 프론트엔드, 서버, 데이터베이스, 외부 API가 어떤 순서로 요청과 응답을 주고받는지 시간 순서대로 보여주는 다이어그램
    이야.
    예를 들어 실시간 투표 기능이라면:
    
    `사용자→ 투표 버튼 클릭→ 프론트엔드가 서버에 요청→ 서버가 권한과 투표 상태 검증→ PostgreSQL에 투표 저장→ Socket.io로 결과 전파→ 참여자 화면 갱신`
    
    | 구분 | 보여주는 내용 |
    | --- | --- |
    | 시스템 아키텍처 | 시스템 전체 구성요소와 연결 관계 |
    | 시퀀스 다이어그램 | 특정 기능 하나의 시간 순 처리 과정 |
    
    **6. API 명세서**
    API 명세서는 프론트엔드와 서버가 데이터를 주고받는 규칙을 정리한 문서야.
    일반적으로 다음 내용을 포함해.
    
    - API 주소
    - HTTP 메서드
    - 요청 파라미터
    - 요청 본문
    - 응답 데이터
    - 상태 코드
    - 인증 및 권한
    - 오류 코드
    
    예:
    
    `POST /api/v1/meetings`
    
    요청:
    
    `{"title": "프로젝트 회식","scheduledAt": "2026-06-20T19:00:00"}`
    
    응답:
    
    `{"success": true,"data": {"meetingId": "mtg_123"}}`
    
    API 명세서는 프론트엔드와 백엔드 개발자가 서로 다른 방식으로 구현하지 않도록 하는 **통신 계약서** 역할을 해.
    
    **최종 정리**
    
    ```json
    `PRD= 무엇을 왜 만들 것인가`
    
    `시스템 아키텍처 다이어그램= 전체 시스템이 어떤 요소로 구성되고 어떻게 연결되는가`
    
    `기술스택= 어떤 기술을 사용하며 각 기술의 역할과 선정 이유는 무엇인가`
    
    `ERD= 데이터를 어떤 테이블에 저장하고 테이블들이 어떻게 연결되는가`
    
    `시퀀스 다이어그램= 특정 기능이 내부에서 어떤 순서로 처리되는가`
    
    `API 명세서= 프론트엔드와 서버가 어떤 규칙으로 데이터를 주고받는가`
    
    `플로우차트= 사용자나 업무가 어떤 절차로 진행되는가`
    
    `역할분담= 누가 어떤 작업을 담당하는가`
    
    `일정관리= 각 작업을 언제까지 완료하는가`
    
    `Figma= 화면과 사용자 인터페이스가 어떻게 구성되는가`
    ```
    
- 아키텍처 다이어그램 : [📓 NotebookLM](https://notebooklm.google/?gad_source=1&gad_campaignid=23261249758&gbraid=0AAAAA-fwSsfqEuOHAXkur7AmSeXh13xhg&gclid=Cj0KCQjw0JnRBhDJARIsALobnXZNiRHzngJtHLERweIe950ETe3nXk8DPsydqLrxXPWueL0cmRTrlkUaAuVeEALw_wcB)
    - 스튜디오에 AI 오디오 오버뷰 : 설명잘해줌!
    - **프롬프트**
        
        아래 붙여넣고 집가면서 오디오 들어보면 좋을듯
        
        🚀 아키텍처 다이어그램 생성 요청
        
        다음 기술 명세와 시각적 요구사항을 모두 포함하는 최종 프로덕션 수준의 전체 시스템 아키텍처 다이어그램을 작성해 주세요.
        
        핵심 기술 스택 및 환경
        Language & Package Manager: TypeScript, pnpm 모노레포(Monorepo) 구조
        Client (Web/PWA): React, Next.js v16 (App Router 기반), Zustand, Tanstack Query
        Auth: NextAuth.js (Kakao, Google 소셜 로그인 연동)
        Real-time & Cache: Node.js/Next.js WebSocket, Redis
        Database: PostgreSQL (Prisma ORM & Prisma Client 활용)
        DevOps & Infrastructure: GitHub Actions (CI/CD), Naver Cloud Platform (NCP), Docker Compose
        
        시각적 레이아웃 요구사항 (경계 및 네모 박스 처리)
        다이어그램은 큰 네모 박스(subgraph)들을 사용하여 **인프라 내부(네모 안)**와 **외부 환경(네모 밖)**을 명확하게 물리적·논리적으로 격리하여 표현해 주세요.
        네모 밖 (External Environment):
        Client Layer: 사용자 브라우저 및 PWA 앱 환경. 내부에 Zustand와 Tanstack Query 컴포넌트가 존재.
        CI/CD 파이프라인: GitHub Repository 및 GitHub Actions 주체.
        External Auth Providers: Kakao 및 Google OAuth 인증 서버.
        네모 안 (NCP Cloud Infrastructure - VPC 내부 / Docker Compose 경계):
        Inbound Entry: 외부 요청을 받아 분기하는 역방향 프록시 레이어.
        Application Container: Next.js v16 App Router 서버 (NextAuth.js 핸들러 및 Prisma Client 내장), WebSocket 서버 컨테이너.
        Data Store Container: Redis 컨테이너 및 PostgreSQL 컨테이너.
        
        필수 표현 데이터 흐름 (Data Flow)
        3.1 pnpm 모노레포 구조 컴파일: 공통 패키지(공통 타입, 유틸 등)가 Client와 Server 컨테이너로 빌드/참조되는 관계 명시 3.2 OAuth 인증 흐름: Client ➔ NextAuth.js ➔ 외부 소셜 로그인 API(Kakao/Google) ➔ DB 유저 검증 및 세션 생성 흐름 3.3 DB 커뮤니케이션: Next.js 서버 내부에서 Prisma Client를 통해 PostgreSQL 도커 컨테이너로 SQL 질의가 발생하는 흐름 3.4 실시간 통신 및 캐시: 일반 API/서버 컴포넌트 요청과 웹소켓 요청의 분기, 그리고 웹소켓 세션 및 데이터 캐싱을 위한 Redis 통신 흐름 3.5 배포 자동화: GitHub Actions 가 빌드 후 NCP 서버의 Docker Compose를 통해 컨테이너들을 갱신하는 배포 흐름
        
        출력 포맷 규칙
        각 컴포넌트는 직관적인 이름과 역할을 명시해 주세요. (예: NextJS_Server[Next.js v16 Server / Prisma Client])
        각 연결선(Arrow)에는 프로토콜이나 전달 데이터(예: HTTPS, WSS, Prisma API, SQL, SSH 등)를 명확히 라벨링해 주세요.
        추가 프롬프트
        📊 NCP 인프라 중심의 가로 배치 시스템 아키텍처
        NCP 클라우드 인프라(네모 안)를 중심축에 가로로 길게 배치하고, 그 주변(네모 밖)에 클라이언트, CI/CD, 소셜 인증 기관이 둘러싸며 유기적으로 상호작용하는 구조의 시스템 아키텍처입니다.
        텍스트 기반으로 가독성 높게 도식화하여, 노션(Notion) 등에 그대로 복사해서 활용할 수 있도록 정교하게 구조화했습니다.
        🌐 [네모 밖] 외부 환경: Client & CI/CD & Auth
        
        Client 레이어 (Web / PWA)
        사용자 브라우저 및 하이브리드 앱 환경
        내부 컴포넌트: React / Next.js v16 (App Router VIEW)
        글로벌 상태 관리: Zustand
        서버 데이터 캐싱: Tanstack Query
        ➔ 연결 경로: HTTPS / WSS 프로토콜을 통해 NCP Nginx 진입점으로 요청 전송
        
        CI/CD 파이프라인
        개발 환경: TypeScript / pnpm 모노레포 구조 (packages/shared ➔ apps/web-app 참조)
        소스 관리: GitHub Repository
        자동화 주체: GitHub Actions
        ➔ 연결 경로: 빌드 완료 후 SSH 원격 제어로 NCP Docker Compose 환경 업그레이드
        
        외부 인증 제공자 (External Auth)
        Kakao Login API / Google Login API
        ➔ 연결 경로: NextJS 서버의 NextAuth.js 핸들러와 OAuth 보안 인증 토큰 교환
        
- ERD 추출 프롬프트
    
    이 기획안을 바탕으로 ERD를 작성하고자 한다.
    
    데이터베이스는 PostGreSQl이다.
    
    테이블이 만들어질 때 테이블명이나 컬럼명에 "(큰 따옴표)가 들어가면 안된다.
    
    SQL은 표준 ANSI SQL을 사용해줘.
    
    컬럼명은 스네이크 케이스 컨벤션을 적용해야 한다.
    

개인 프로젝트에서도 전부 작성할 필요는 없어.

- **프로젝트 복잡도와 포트폴리오 목적에 따라 필요한 문서만 작성하면 돼.**
    
    # 개인 프로젝트에서 최소한 작성할 문서
    
    일반적인 프론트엔드 개인 프로젝트라면 다음 정도면 충분해.
    
    ```
    README.md
    PRD.md
    TECH_DESIGN.md
    ```
    
    DB와 API가 있는 풀스택 프로젝트라면 다음을 추가해.
    
    ```
    ERD.md
    API_SPEC.md
    ```
    
    복잡한 기능이 있다면 선택적으로 추가해.
    
    ```
    SEQUENCE_DIAGRAM.md
    USER_FLOW.md
    ROADMAP.md
    ```
    

특히 혼자 만드는 프로젝트에서는 문서 작성 자체가 목적이 되면 안 되고,

> 나중에 내가 다시 봐도 구조를 이해할 수 있는가
> 
> 
> 다른 사람이 GitHub에서 프로젝트를 빠르게 파악할 수 있는가
> 
> 구현 전에 중요한 결정을 정리했는가
> 

이 세 가지를 기준으로 선택하면 돼.

| 문서 | 필요도 | 개인 프로젝트 기준 |
| --- | --- | --- |
| PRD | 높음 | 무엇을 만들지, MVP 범위를 정하기 위해 필요 |
| 시스템 아키텍처 | 중간~높음 | 서버·DB·외부 API가 있다면 작성 권장 |
| 기술스택 | 높음 | README 또는 기술 설계 문서에 포함 |
| ERD | 조건부 필수 | 데이터베이스를 사용하면 작성 권장 |
| 시퀀스 다이어그램 | 선택 | 실시간 통신·인증·결제 등 복잡한 기능만 작성 |
| API 명세서 | 조건부 필수 | 직접 API를 만들면 작성 권장 |
| 플로우차트 | 중간 | 사용자 흐름이 여러 단계라면 유용 |
| 역할분담 | 불필요 | 혼자 진행하므로 생략 |
| 일정관리 | 권장 | 간단한 로드맵이나 체크리스트면 충분 |
| Figma | 조건부 | UI가 중요한 프로젝트라면 작성 |