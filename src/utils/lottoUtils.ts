export const generateLottoSet = (min: number, max: number, count: number) => {
  const set = new Set<number>();
  while (set.size < count) {
    const n = Math.floor(Math.random() * (max - min + 1)) + min;
    set.add(n);
  }
  return Array.from(set).sort((a, b) => a - b);
};

export const getRank = (matchCount: number, hasBonus: boolean) => {
  if (matchCount === 6) return "1등 (6개 일치)";
  if (matchCount === 5 && hasBonus) return "2등 (5개 일치, 보너스 볼 일치)";
  if (matchCount === 5) return "3등 (5개 일치)";
  if (matchCount === 4) return "4등 (4개 일치)";
  if (matchCount === 3) return "5등 (3개 일치)";
  return null;
};

export const calculateRankCounts = (
  lottos: number[][],
  winningNumbers: number[],
  bonusNumber: number
) => {
  const counts: Record<string, number> = {};
  lottos.forEach((lotto) => {
    const matchCount = lotto.filter((n) => winningNumbers.includes(n)).length;
    const hasBonus = lotto.includes(bonusNumber);
    const rank = getRank(matchCount, hasBonus);
    if (rank) {
      counts[rank] = (counts[rank] || 0) + 1;
    }
  });
  return counts;
};

export const sumPrizes = (
  rankCounts: Record<string, number>,
  prizeMap: Record<string, { prize: number }>
) => {
  let total = 0;
  Object.keys(rankCounts).forEach((r) => {
    const meta = prizeMap[r];
    if (meta) {
      total += meta.prize * rankCounts[r]!;
    }
  });
  return total;
};
