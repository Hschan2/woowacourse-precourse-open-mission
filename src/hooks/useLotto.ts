import { ref } from "vue";
import { LOTTO, ERROR_MESSAGES, PRIZE_RANKS } from "../constants/lotto";

export function useLotto() {
  const purchaseAmount = ref<number | null>(null);
  const lottos = ref<number[][]>([]);
  const winningNumbers = ref<(number | null)[]>(Array(6).fill(null));
  const bonusNumber = ref<number | null>(null);
  const results = ref<{ ranks: Record<string, number>; roi: string } | null>(
    null
  );
  const errorMessage = ref<string | null>(null);

  const generateLottoNumbers = (): number[] => {
    const numbers = new Set<number>();
    while (numbers.size < LOTTO.NUMBERS_COUNT) {
      const randomNumber =
        Math.floor(Math.random() * LOTTO.MAX_NUMBER) + LOTTO.MIN_NUMBER;
      numbers.add(randomNumber);
    }
    return Array.from(numbers).sort((a, b) => a - b);
  };

  const purchaseLottos = () => {
    if (
      purchaseAmount.value === null ||
      purchaseAmount.value <= 0 ||
      purchaseAmount.value % LOTTO.PRICE !== 0
    ) {
      errorMessage.value = ERROR_MESSAGES.INVALID_PURCHASE_AMOUNT;
      return false;
    }

    const numberOfLottos = purchaseAmount.value / LOTTO.PRICE;
    const newLottos: number[][] = [];
    for (let i = 0; i < numberOfLottos; i++) {
      newLottos.push(generateLottoNumbers());
    }
    lottos.value = newLottos;
    return true;
  };

  const getRank = (matchCount: number, hasBonus: boolean): string | null => {
    if (matchCount === 6) return "1등 (6개 일치)";
    if (matchCount === 5 && hasBonus) return "2등 (5개 일치, 보너스 볼 일치)";
    if (matchCount === 5) return "3등 (5개 일치)";
    if (matchCount === 4) return "4등 (4개 일치)";
    if (matchCount === 3) return "5등 (3개 일치)";
    return null;
  };

  const calculateResults = () => {
    const finalWinningNumbers = winningNumbers.value.filter(
      (n): n is number => n !== null
    );
    const finalBonusNumber = bonusNumber.value;

    if (finalBonusNumber === null) return;

    const rankCounts: Record<string, number> = Object.keys(PRIZE_RANKS).reduce(
      (acc, rank) => {
        acc[rank] = 0;
        return acc;
      },
      {} as Record<string, number>
    );

    lottos.value.forEach((lotto) => {
      const matchCount = lotto.filter((num) =>
        finalWinningNumbers.includes(num)
      ).length;
      const hasBonus = lotto.includes(finalBonusNumber);
      const rank = getRank(matchCount, hasBonus);
              if (rank) {
                rankCounts[rank] = (rankCounts[rank] || 0) + 1;
              }    });

    let totalPrize = 0;
        for (const rank in rankCounts) {
            totalPrize += PRIZE_RANKS[rank as keyof typeof PRIZE_RANKS].prize * rankCounts[rank]!; // undefined가 될 수 없음으로 어센셜 추가
        }

    const totalSpent = purchaseAmount.value ?? 0;
    const roi =
      totalSpent > 0 ? ((totalPrize / totalSpent) * 100).toFixed(1) : "0.0";

    results.value = {
      ranks: rankCounts,
      roi: roi,
    };
  };

  const validateWinningNumbers = (): boolean => {
    const winningNumbersSet = new Set(
      winningNumbers.value.filter((n) => n !== null)
    );
    if (
      winningNumbersSet.size !== LOTTO.NUMBERS_COUNT ||
      winningNumbers.value.some(
        (n) => n === null || n < LOTTO.MIN_NUMBER || n > LOTTO.MAX_NUMBER
      )
    ) {
      errorMessage.value = ERROR_MESSAGES.INVALID_WINNING_NUMBERS;
      return false;
    }
    return true;
  };

  const validateBonusNumber = (): boolean => {
    const winningNumbersSet = new Set(
      winningNumbers.value.filter((n) => n !== null)
    );
    if (
      bonusNumber.value === null ||
      bonusNumber.value < LOTTO.MIN_NUMBER ||
      bonusNumber.value > LOTTO.MAX_NUMBER ||
      winningNumbersSet.has(bonusNumber.value)
    ) {
      errorMessage.value = ERROR_MESSAGES.INVALID_BONUS_NUMBER;
      return false;
    }
    return true;
  };

  const checkResults = () => {
    if (!validateWinningNumbers() || !validateBonusNumber()) {
      return;
    }
    calculateResults();
  };

  const generateWinningNumbersAndCheck = () => {
    winningNumbers.value = generateLottoNumbers();

    let newBonusNumber: number | null = null;
    const winningSet = new Set(winningNumbers.value);
    while (newBonusNumber === null || winningSet.has(newBonusNumber)) {
      newBonusNumber =
        Math.floor(Math.random() * LOTTO.MAX_NUMBER) + LOTTO.MIN_NUMBER;
    }
    bonusNumber.value = newBonusNumber;

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
