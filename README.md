# Subing Frontend

구독 서비스 관리 플랫폼의 프론트엔드 SPA

## 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | React 18.2.0 |
| Routing | React Router v6 |
| HTTP Client | Axios 1.3.4 |
| Styling | Tailwind CSS 3.2.7 |
| Animation | Framer Motion 12.29.3 |
| Chart | Chart.js 4.5.1 + react-chartjs-2 |
| Deploy | Vercel |

## 프로젝트 구조

```
src/
├── components/
│   ├── common/            # 공통 UI (Button, Input, Card, Badge, Toast 등)
│   ├── charts/            # 차트 (월별 지출, 카테고리별 지출)
│   ├── Header.js          # 네비게이션 헤더
│   ├── ReviewModal.js     # 리뷰 작성 모달
│   ├── StarRating.js      # 별점 컴포넌트
│   └── TierLimitModal.js  # 티어 제한 안내 모달
├── pages/
│   ├── LoginPage.js                    # 로그인
│   ├── SignupPage.js                   # 회원가입
│   ├── GoogleCallbackPage.js           # OAuth 콜백
│   ├── Dashboard.js                    # 메인 대시보드
│   ├── SubscriptionPage.js             # 구독 관리
│   ├── StatisticsPage.js               # 통계/분석
│   ├── ComparisonPage.js               # 서비스 비교
│   ├── BudgetPage.js                   # 예산 관리
│   ├── QuizPage.js                     # AI 추천 퀴즈
│   ├── StreamingRecommendationPage.js  # SSE 스트리밍 추천
│   ├── RecommendationHistoryPage.js    # 추천 기록
│   ├── NotificationPage.js             # 알림 센터
│   ├── NotificationSettingsPage.js     # 알림 설정
│   ├── OptimizationPage.js             # 구독 최적화
│   ├── ServiceReviewsPage.js           # 서비스 리뷰
│   ├── preferences/                    # 성향 테스트 (3 페이지)
│   └── admin/                          # 관리자 (5 페이지)
├── services/              # API 서비스 레이어 (14개)
├── context/
│   └── AuthContext.js     # 인증 상태 관리
├── constants/             # 카테고리, 퀴즈 옵션 상수
└── utils/                 # 서비스 아이콘 유틸
```

## 주요 기능

### 인증
- 이메일/비밀번호 로그인 및 회원가입
- Google OAuth 2.0 소셜 로그인
- JWT 토큰 기반 인증 (localStorage 저장)
- Axios 인터셉터를 통한 자동 토큰 주입 및 401 처리

### 대시보드
- 이번 달 총 지출 / 활성 구독 수 / 예산 사용률
- 다가오는 결제일 (7일 이내)
- 읽지 않은 알림 미리보기
- 월별 지출 트렌드 차트 (최근 6개월)
- 카테고리별 구독 현황

### 구독 관리
- 구독 CRUD (추가/수정/삭제)
- 카테고리별 필터링 및 정렬
- 활성/비활성 토글

### AI 추천
- 7단계 퀴즈 (관심 분야, 예산, 사용 목적, 우선순위)
- SSE 스트리밍 실시간 타이핑 효과
- 추천 결과에서 바로 구독 추가
- 피드백 및 클릭 추적
- 추천 기록 조회

### 통계/분석
- 월별 지출 트렌드 (Line Chart)
- 카테고리별 지출 분석 (Pie/Bar Chart)

### 구독 최적화
- 중복 서비스 감지
- 저렴한 대안 제안
- 절약 가능 금액 표시

### 예산 관리
- 월별 예산 설정/수정/삭제
- 예산 대비 현재 지출 표시

### 알림
- 알림 센터 (결제일, 예산 초과, 미사용 구독 등)
- 알림 타입별 on/off 설정

### 성향 테스트
- 12개 질문 기반 구독 성향 분석
- 8가지 프로필 타입 (구독 덕후형, 알뜰 구독러형 등)
- 5가지 점수 시각화 (콘텐츠, 가성비, 건강, 자기계발, 디지털 도구)

### 서비스 리뷰
- 별점 평가 (1-5점)
- 리뷰 작성/수정/삭제

### 관리자 페이지
- 대시보드 (사용자/구독/매출 통계)
- 사용자 관리 (티어/역할 변경)
- 서비스 및 플랜 CRUD
- 최적화 정책 설정

## 디자인 시스템

토스(Toss) 스타일 기반 UI/UX

- **Primary**: Blue (#3182f6)
- **Font**: Pretendard (한글), Inter (영문)
- **Round**: rounded-xl (카드), rounded-2xl (모달)
- **Shadow**: 토스 스타일 그림자 (`shadow-toss`)
- **Tone**: 친근한 안내 ("~해요", "~할까요?")

## 실행 방법

### 사전 요구사항
- Node.js 18+
- npm

### 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 3000)
npm start
```

### 프로덕션 빌드

```bash
npm run build
```

### 환경 변수

| 변수 | 설명 |
|------|------|
| `REACT_APP_API_URL` | 백엔드 API 주소 |
| `REACT_APP_WS_URL` | WebSocket 서버 주소 |
| `REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth Client ID |

## 배포

- **플랫폼**: Vercel
- **SPA 라우팅**: 모든 경로 → `/index.html` rewrite
- **캐싱**: 정적 자산 1년, 이미지 1일 (stale-while-revalidate)
