export const ERROR_MESSAGES = {
  NO_LOCATION_INFO: "위치 정보가 없습니다. 시작 페이지로 돌아갑니다.",
  DATA_FETCH_FAILED: "데이터를 가져오는 데 실패했습니다. 잠시 후 다시 시도해주세요.",
  AI_REQUEST_FAILED: (error: any) => `AI 서버 요청에 실패했습니다: ${error.message}`,
  GET_DATA_FAILED: "데이터를 가져오는 데 실패했습니다:",
};

export const UI_MESSAGES = {
  SELECT_MOOD_PROMPT: "기분을 1개 이상 선택해주세요.",
  REQUEST_LOCATION_PERMISSION: "오늘의 맛기온에서 사용자의 위치 권한을 요청합니다.",
  LOCATION_PERMISSION_DENIED: "위치 권한이 거부되었습니다. 서비스 이용을 위해 위치 권한을 허용해주세요.",
  CANCEL: "취소",
  ALLOW: "허용",
  START: "시작",
  MINI_GAME: "미니게임",
  APP_TITLE: "오늘의맛기온",
  LOGO_ALT: "오늘의 맛기온",
  AI_RECOMMENDING: "AI가 음식을 추천하고 있어요...",
  AI_RECOMMENDATION_TITLE: "AI의 추천 메뉴는...",
  AVERAGE_PRICE: "평균 가격:",
  AVERAGE_CALORIES: "평균 칼로리:",
  RECOMMENDED_RESTAURANTS: "📍 추천 맛집 목록",
  DISCLAIMER: "※ 무료 AI 모델을 사용하여 추천된 정보(맛집 목록, 주소 등)는 실제와 다를 수 있습니다.",
  RECOMMEND_AGAIN_SAME_MOOD: "같은 기분으로 다시 추천",
  RECOMMEND_AGAIN_NEW_MOOD: "새로운 기분으로 다시 추천",
  MOOD_QUESTION: "지금 당신의 기분이 어떤가요?",
  LOADING_WEATHER: "날씨와 미세먼지 정보를 불러오는 중...",
  NEXT: "다음",
  LOADING_ALT: "로딩 중",
  UNIT_WON: "원",
  UNIT_KCAL: "kcal",
};

export const AIR_QUALITY_GRADES = {
  GOOD: "좋음",
  NORMAL: "보통",
  BAD: "나쁨",
  VERY_BAD: "매우 나쁨",
  UNKNOWN: "알 수 없음",
};
