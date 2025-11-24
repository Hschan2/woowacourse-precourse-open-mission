import { ref } from "vue";
import { LOTTO, ERROR_MESSAGES, PRIZE_RANKS } from "../constants/lotto";
import {
  calculateRankCounts,
  generateLottoSet,
  sumPrizes,
} from "../utils/lottoUtils";

export function useLotto() {
  const purchaseAmount = ref<number | null>(null);
  const lottos = ref<number[][]>([]);
  const winningNumbers = ref<(number | null)[]>(Array(6).fill(null));
  const bonusNumber = ref<number | null>(null);
  const results = ref<{ ranks: Record<string, number>; roi: string } | null>(
    null
  );
  const errorMessage = ref<string | null>(null);

  const validatePurchaseAmount = (): boolean => {
    if (purchaseAmount.value === null) {
      errorMessage.value = ERROR_MESSAGES.INVALID_PURCHASE_AMOUNT;
      return false;
    }
    if (purchaseAmount.value <= 0) {
      errorMessage.value = ERROR_MESSAGES.INVALID_PURCHASE_AMOUNT;
      return false;
    }
    if (purchaseAmount.value % LOTTO.PRICE !== 0) {
      errorMessage.value = ERROR_MESSAGES.INVALID_PURCHASE_AMOUNT;
      return false;
    }
    return true;
  };

  const purchaseLottos = (): boolean => {
    const ok = validatePurchaseAmount();
    if (ok === false) return false;

    const num = purchaseAmount.value! / LOTTO.PRICE;
    const created: number[][] = [];
    for (let i = 0; i < num; i++) {
      created.push(
        generateLottoSet(
          LOTTO.MIN_NUMBER,
          LOTTO.MAX_NUMBER,
          LOTTO.NUMBERS_COUNT
        )
      );
    }
    lottos.value = created;
    return true;
  };

  const validateWinningNumbers = (): boolean => {
    const nums = winningNumbers.value.filter((n): n is number => n !== null);
    const set = new Set(nums);
    if (set.size !== LOTTO.NUMBERS_COUNT) {
      errorMessage.value = ERROR_MESSAGES.INVALID_WINNING_NUMBERS;
      return false;
    }
    if (nums.some((n) => n < LOTTO.MIN_NUMBER || n > LOTTO.MAX_NUMBER)) {
      errorMessage.value = ERROR_MESSAGES.INVALID_WINNING_NUMBERS;
      return false;
    }
    return true;
  };

  const validateBonusNumber = (): boolean => {
    const b = bonusNumber.value;
    if (b === null) {
      errorMessage.value = ERROR_MESSAGES.INVALID_BONUS_NUMBER;
      return false;
    }
    if (b < LOTTO.MIN_NUMBER || b > LOTTO.MAX_NUMBER) {
      errorMessage.value = ERROR_MESSAGES.INVALID_BONUS_NUMBER;
      return false;
    }
    const winSet = new Set(
      winningNumbers.value.filter((n): n is number => n !== null)
    );
    if (winSet.has(b)) {
      errorMessage.value = ERROR_MESSAGES.INVALID_BONUS_NUMBER;
      return false;
    }
    return true;
  };

  const calculateResults = () => {
    const finalWinning = winningNumbers.value.filter(
      (n): n is number => n !== null
    );
    const finalBonus = bonusNumber.value;
    if (finalBonus === null) return;

    const ranks = calculateRankCounts(lottos.value, finalWinning, finalBonus);
    const totalPrize = sumPrizes(ranks, PRIZE_RANKS);
    const totalSpent = purchaseAmount.value ?? 0;
    const roi =
      totalSpent > 0 ? ((totalPrize / totalSpent) * 100).toFixed(1) : "0.0";
    results.value = { ranks, roi };
  };

  const checkResults = () => {
    const ok1 = validateWinningNumbers();
    if (ok1 === false) return;
    const ok2 = validateBonusNumber();
    if (ok2 === false) return;
    calculateResults();
  };

  const generateWinningNumbersAndCheck = () => {
    winningNumbers.value = generateLottoSet(
      LOTTO.MIN_NUMBER,
      LOTTO.MAX_NUMBER,
      LOTTO.NUMBERS_COUNT
    ).map((n) => n);

    let newBonus: number | null = null;
    const winSet = new Set(winningNumbers.value as number[]);
    while (newBonus === null || winSet.has(newBonus)) {
      newBonus =
        Math.floor(Math.random() * LOTTO.MAX_NUMBER) + LOTTO.MIN_NUMBER;
    }
    bonusNumber.value = newBonus;
    checkResults();
  };

  const restartGame = () => {
    purchaseAmount.value = null;
    lottos.value = [];
    winningNumbers.value = Array(6).fill(null);
    bonusNumber.value = null;
    results.value = null;
    errorMessage.value = null;
  };

  return {
    purchaseAmount,
    lottos,
    winningNumbers,
    bonusNumber,
    results,
    errorMessage,
    purchaseLottos,
    checkResults,
    generateWinningNumbersAndCheck,
    restartGame,
  };
}
