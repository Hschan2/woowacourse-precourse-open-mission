export const LOTTO = {
  PRICE: 1000,
  MIN_NUMBER: 1,
  MAX_NUMBER: 45,
  NUMBERS_COUNT: 6,
} as const;

export const ERROR_MESSAGES = {
  INVALID_PURCHASE_AMOUNT: `구입 금액은 ${LOTTO.PRICE}원 단위의 양의 정수여야 합니다.`,
  INVALID_WINNING_NUMBERS: '당첨 번호는 1부터 45 사이의 중복되지 않는 6개의 숫자여야 합니다.',
  INVALID_BONUS_NUMBER: '보너스 번호는 1부터 45 사이의 숫자여야 하며, 당첨 번호와 중복될 수 없습니다.',
} as const;

export const PRIZE_RANKS = {
  '1등 (6개 일치)': { prize: 2_000_000_000, count: 0 },
  '2등 (5개 일치, 보너스 볼 일치)': { prize: 30_000_000, count: 0 },
  '3등 (5개 일치)': { prize: 1_500_000, count: 0 },
  '4등 (4개 일치)': { prize: 50_000, count: 0 },
  '5등 (3개 일치)': { prize: 5_000, count: 0 },
};
