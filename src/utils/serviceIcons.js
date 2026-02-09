// 파비콘이 부정확한 서비스는 직접 아이콘 URL 지정
const DIRECT_ICON_MAP = {
  '클로드': '/icons/claude.svg',
  'Claude': '/icons/claude.svg',
};

// 서비스명 → 도메인 매핑 (Google Favicon API용)
const SERVICE_DOMAIN_MAP = {
  // OTT
  '넷플릭스': 'netflix.com',
  'Netflix': 'netflix.com',
  '유튜브': 'youtube.com',
  '유튜브 프리미엄': 'youtube.com',
  'YouTube': 'youtube.com',
  '디즈니+': 'disneyplus.com',
  '디즈니플러스': 'disneyplus.com',
  '왓챠': 'watcha.com',
  '웨이브': 'wavve.com',
  '쿠팡플레이': 'coupangplay.com',
  '쿠팡 와우': 'coupang.com',
  '티빙': 'tving.com',
  '시즌': 'tving.com',
  'Apple TV+': 'tv.apple.com',
  '아마존 프라임': 'primevideo.com',

  // 음악
  '스포티파이': 'spotify.com',
  'Spotify': 'spotify.com',
  '멜론': 'melon.com',
  '지니뮤직': 'genie.co.kr',
  '벅스': 'bugs.co.kr',
  'Apple Music': 'music.apple.com',
  '유튜브 뮤직': 'music.youtube.com',
  'YouTube Music': 'music.youtube.com',
  'FLO': 'music-flo.com',
  '플로': 'music-flo.com',
  'VIBE': 'vibe.naver.com',

  // AI
  'ChatGPT': 'chat.openai.com',
  '챗GPT': 'chat.openai.com',
  '챗지피티': 'chat.openai.com',
  '클로드': 'claude.ai',
  'Claude': 'claude.ai',
  'Midjourney': 'midjourney.com',
  '미드저니': 'midjourney.com',
  'Copilot': 'github.com',
  '코파일럿': 'github.com',
  'GitHub Copilot': 'github.com',
  '깃허브 코파일럿': 'github.com',
  'Notion AI': 'notion.so',
  '노션 AI': 'notion.so',
  'Perplexity': 'perplexity.ai',
  '퍼플렉시티': 'perplexity.ai',
  'Cursor': 'cursor.com',
  '커서': 'cursor.com',

  // 클라우드/생산성
  'Notion': 'notion.so',
  '노션': 'notion.so',
  'Slack': 'slack.com',
  '슬랙': 'slack.com',
  'Google Workspace': 'workspace.google.com',
  '구글 워크스페이스': 'workspace.google.com',
  'Microsoft 365': 'microsoft.com',
  '마이크로소프트 365': 'microsoft.com',
  'Dropbox': 'dropbox.com',
  '드롭박스': 'dropbox.com',
  'iCloud': 'icloud.com',
  '아이클라우드': 'icloud.com',
  'Google One': 'one.google.com',
  '구글 원': 'one.google.com',
  'GitHub': 'github.com',
  '깃허브': 'github.com',
  'Figma': 'figma.com',
  '피그마': 'figma.com',
  'Canva': 'canva.com',
  '캔바': 'canva.com',
  'Adobe': 'adobe.com',
  '어도비': 'adobe.com',

  // 생활/배달
  '네이버플러스 멤버십': 'naver.com',
  '네이버플러스': 'naver.com',
  '카카오톡': 'kakaocorp.com',
  '배달의민족': 'baemin.com',
  '배민': 'baemin.com',
  '요기요': 'yogiyo.co.kr',
  '쿠팡': 'coupang.com',
  '쿠팡 로켓와우': 'coupang.com',
  '마켓컬리': 'kurly.com',
  '컬리': 'kurly.com',

  // 운동/헬스
  '나이키 런 클럽': 'nike.com',
  'Nike Run Club': 'nike.com',
  '킵': 'keep.com',
  'Keep': 'keep.com',

  // 뉴스/독서
  '밀리의서재': 'millie.co.kr',
  '리디': 'ridibooks.com',
  '리디북스': 'ridibooks.com',
  '예스24': 'yes24.com',

  // 교육
  '클래스101': 'class101.net',
  'Class101': 'class101.net',
  '듀오링고': 'duolingo.com',
  'Duolingo': 'duolingo.com',
  'Udemy': 'udemy.com',
  '유데미': 'udemy.com',
  'Coursera': 'coursera.org',
  '코세라': 'coursera.org',
};

/**
 * 서비스명으로 파비콘 URL을 반환
 * @param {string} serviceName - 서비스명
 * @param {string} iconUrl - DB에 저장된 아이콘 URL (우선 사용)
 * @returns {string|null} 아이콘 URL
 */
export const getServiceIconUrl = (serviceName, iconUrl) => {
  if (!serviceName) return iconUrl || null;

  // 직접 지정된 아이콘 URL 확인 (최우선 - 파비콘이 부정확한 서비스용)
  const directUrl = DIRECT_ICON_MAP[serviceName];
  if (directUrl) return directUrl;

  // 부분 매칭 시도 (직접 URL)
  const lowerName = serviceName.toLowerCase();
  for (const [key, val] of Object.entries(DIRECT_ICON_MAP)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return val;
    }
  }

  // DB에 저장된 아이콘 URL이 있으면 사용
  if (iconUrl) return iconUrl;

  // 서비스명으로 도메인 매핑 검색
  const domain = SERVICE_DOMAIN_MAP[serviceName];
  if (domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  }

  // 부분 매칭 시도 (도메인)
  for (const [key, val] of Object.entries(SERVICE_DOMAIN_MAP)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return `https://www.google.com/s2/favicons?domain=${val}&sz=64`;
    }
  }

  return null;
};

/**
 * 서비스명의 첫 글자로 기본 아이콘 색상을 반환
 */
export const getServiceColor = (serviceName) => {
  const colors = [
    '#4285F4', '#EA4335', '#FBBC05', '#34A853',
    '#FF6D01', '#46BDC6', '#7B61FF', '#F06292',
    '#4DB6AC', '#FF8A65', '#A1887F', '#90A4AE',
  ];
  if (!serviceName) return colors[0];
  const index = serviceName.charCodeAt(0) % colors.length;
  return colors[index];
};
