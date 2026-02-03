/**
 * Quiz 동적 옵션 설정
 * - 카테고리별로 말이 되는 옵션만 노출
 * - value 네임스페이스로 충돌 방지 (예: AI_CODING, OTT_BINGE_WATCH)
 */

/** interests 최대 선택 개수 */
export const MAX_INTERESTS = 3;

/** 동적 옵션 최대 노출 개수 */
export const MAX_OPTIONS = 6;

/**
 * 카테고리별 사용 목적 옵션
 * - maxOptions=6 기준으로 COMMON(2) + primary(3) + rest(1) 구성 고려
 */
export const PURPOSE_OPTIONS = {
  // 공통 옵션 (모든 카테고리에 포함)
  COMMON: [
    { value: 'COMMON_PERSONAL', label: '개인 취미/여가' },
    { value: 'COMMON_WORK', label: '업무/생산성' },
  ],

  // 카테고리별 특화 옵션
  OTT: [
    { value: 'OTT_FAMILY_WATCH', label: '가족과 함께 시청' },
    { value: 'OTT_BINGE_WATCH', label: '몰아보기/정주행' },
    { value: 'OTT_KIDS_CONTENT', label: '키즈 콘텐츠' },
  ],
  MUSIC: [
    { value: 'MUSIC_BACKGROUND', label: '배경음악/작업용' },
    { value: 'MUSIC_DISCOVERY', label: '새로운 음악 탐색' },
    { value: 'MUSIC_OFFLINE', label: '오프라인 감상' },
  ],
  AI: [
    { value: 'AI_CREATIVE', label: '창작/콘텐츠 제작' },
    { value: 'AI_CODING', label: '코딩/개발 보조' },
    { value: 'AI_RESEARCH', label: '학습/리서치' },
  ],
  CLOUD: [
    { value: 'CLOUD_BACKUP', label: '데이터 백업' },
    { value: 'CLOUD_COLLAB', label: '팀 협업' },
    { value: 'CLOUD_PHOTO_VIDEO', label: '사진/영상 저장' },
  ],
  DESIGN: [
    { value: 'DESIGN_UI_UX', label: 'UI/UX 디자인' },
    { value: 'DESIGN_GRAPHIC', label: '그래픽/일러스트' },
    { value: 'DESIGN_VIDEO_EDIT', label: '영상 편집' },
  ],
  PRODUCTIVITY: [
    { value: 'PROD_PROJECT_MGMT', label: '프로젝트 관리' },
    { value: 'PROD_NOTE_TAKING', label: '노트/문서 작성' },
    { value: 'PROD_AUTOMATION', label: '업무 자동화' },
  ],
  NEWS_READING: [
    { value: 'NR_NEWS', label: '뉴스/시사' },
    { value: 'NR_BOOK', label: '독서/전자책' },
    { value: 'NR_LEARNING', label: '학습 콘텐츠' },
  ],
  DELIVERY: [
    { value: 'DELIVERY_DAILY', label: '일상 식사' },
    { value: 'DELIVERY_SPECIAL', label: '특별한 날' },
    { value: 'DELIVERY_OFFICE', label: '회사/단체 주문' },
  ],
  LIFE: [
    { value: 'LIFE_HEALTH', label: '건강/피트니스' },
    { value: 'LIFE_SHOPPING', label: '쇼핑/할인' },
    { value: 'LIFE_CONVENIENCE', label: '생활 편의' },
  ],
  ETC: [
    { value: 'ETC_HOBBY', label: '취미/관심사' },
    { value: 'ETC_CUSTOM', label: '직접 입력' },
  ],
};

/**
 * 카테고리별 중요도 옵션
 * - 공통은 범용으로 정의 가능한 항목 우선
 */
export const PRIORITY_OPTIONS = {
  COMMON: [
    { value: 'COMMON_PRICE', label: '가격' },
    { value: 'COMMON_EASE', label: '시작/해지 용이성' },
    { value: 'COMMON_FIT', label: '목적 적합도' },
    { value: 'COMMON_USAGE', label: '활용도(자주 쓰게 됨)' },
  ],

  OTT: [
    { value: 'OTT_CONTENT_VARIETY', label: '콘텐츠 다양성' },
    { value: 'OTT_ORIGINAL', label: '오리지널 콘텐츠' },
    { value: 'OTT_VIDEO_QUALITY', label: '화질 (4K/HDR)' },
    { value: 'OTT_SIMULTANEOUS', label: '동시 시청 수' },
  ],
  MUSIC: [
    { value: 'MUSIC_LIBRARY', label: '음악 보유량' },
    { value: 'MUSIC_AUDIO_QUALITY', label: '음질 (Lossless)' },
    { value: 'MUSIC_RECO', label: '플레이리스트/추천' },
    { value: 'MUSIC_OFFLINE', label: '오프라인 저장' },
  ],
  AI: [
    { value: 'AI_QUALITY', label: '정확도/품질' },
    { value: 'AI_SPEED', label: '응답 속도' },
    { value: 'AI_LIMIT', label: '사용량 제한' },
    { value: 'AI_FEATURE', label: '기능 다양성' },
  ],
  CLOUD: [
    { value: 'CLOUD_STORAGE', label: '저장 용량' },
    { value: 'CLOUD_SYNC', label: '동기화/속도' },
    { value: 'CLOUD_SECURITY', label: '보안/암호화' },
    { value: 'CLOUD_INTEGRATION', label: '타 서비스 연동' },
  ],
  DESIGN: [
    { value: 'DESIGN_POWER', label: '기능/성능' },
    { value: 'DESIGN_ASSET', label: '템플릿/에셋' },
    { value: 'DESIGN_COLLAB', label: '협업 기능' },
    { value: 'DESIGN_EXPORT', label: '내보내기 옵션' },
  ],
  PRODUCTIVITY: [
    { value: 'PROD_INTEGRATION', label: '타 서비스 연동' },
    { value: 'PROD_TEAM', label: '팀 기능' },
    { value: 'PROD_AUTOMATION', label: '자동화 기능' },
    { value: 'PROD_MOBILE', label: '모바일 지원' },
  ],
  NEWS_READING: [
    { value: 'NR_QUALITY', label: '콘텐츠 품질' },
    { value: 'NR_AD_FREE', label: '광고 없음' },
    { value: 'NR_OFFLINE', label: '오프라인 읽기' },
    { value: 'NR_CATEGORY', label: '분야별 다양성' },
  ],
  DELIVERY: [
    { value: 'DELIVERY_SPEED', label: '배달 속도' },
    { value: 'DELIVERY_COVERAGE', label: '입점/커버리지' },
    { value: 'DELIVERY_DISCOUNT', label: '할인/혜택' },
    { value: 'DELIVERY_MIN_ORDER', label: '최소 주문 금액' },
  ],
  LIFE: [
    { value: 'LIFE_BENEFIT', label: '혜택/할인' },
    { value: 'LIFE_COVERAGE', label: '서비스 범위' },
    { value: 'LIFE_QUALITY', label: '서비스 품질' },
    { value: 'LIFE_SUPPORT', label: '고객 지원' },
  ],
  ETC: [
    { value: 'ETC_VALUE', label: '가성비' },
    { value: 'ETC_RELIABILITY', label: '신뢰성/안정성' },
  ],
};

/**
 * 중복 제거 유틸리티
 */
const uniqByValue = (options) => {
  const seen = new Set();
  const result = [];
  for (const o of options) {
    if (!seen.has(o.value)) {
      seen.add(o.value);
      result.push(o);
    }
  }
  return result;
};

/**
 * 선택된 interests에 따라 동적으로 사용 목적 옵션 생성
 * @param {string[]} interests - 선택된 관심 분야 배열
 * @param {string} primaryInterest - 대표 관심 분야 (기본: interests[0])
 * @returns {Array<{value: string, label: string}>}
 */
export const getPurposeOptions = (interests, primaryInterest) => {
  const primary = primaryInterest || interests?.[0];
  const rest = (interests || []).filter(c => c !== primary);

  const merged = [
    ...PURPOSE_OPTIONS.COMMON,
    ...(PURPOSE_OPTIONS[primary] || []),
    ...rest.flatMap(c => PURPOSE_OPTIONS[c] || []),
  ];

  return uniqByValue(merged).slice(0, MAX_OPTIONS);
};

/**
 * 선택된 interests에 따라 동적으로 중요도 옵션 생성
 * @param {string[]} interests - 선택된 관심 분야 배열
 * @param {string} primaryInterest - 대표 관심 분야 (기본: interests[0])
 * @returns {Array<{value: string, label: string}>}
 */
export const getPriorityOptions = (interests, primaryInterest) => {
  const primary = primaryInterest || interests?.[0];
  const rest = (interests || []).filter(c => c !== primary);

  const merged = [
    ...PRIORITY_OPTIONS.COMMON,
    ...(PRIORITY_OPTIONS[primary] || []),
    ...rest.flatMap(c => PRIORITY_OPTIONS[c] || []),
  ];

  return uniqByValue(merged).slice(0, MAX_OPTIONS);
};
