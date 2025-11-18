<template>
  <div class="fixed inset-0 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm flex justify-center items-center z-20">
    <div class="bg-gray-100 p-8 rounded-2xl shadow-xl w-full max-w-sm mx-4">
      <button @click="$emit('close')" class="absolute top-4 right-4 text-white text-lg font-bold cursor-pointer hover:text-gray">
        &times;
      </button>

      <div v-if="gameState === 'start'" class="text-center">
        <h2 class="text-3xl font-bold mb-6">로또 게임</h2>
        <button @click="gameState = 'purchasing'" class="bg-blue-600 text-white px-10 py-3 rounded-full text-lg cursor-pointer hover:bg-blue-700">
          시작
        </button>
      </div>

      <div v-if="gameState === 'purchasing'" class="text-center">
        <h2 class="text-2xl font-bold mb-6">몇 장 구매할까요?</h2>
        <input
          type="number"
          v-model.number="purchaseAmount"
          class="w-full p-3 text-center border-2 border-gray-300 rounded-lg mb-4"
          placeholder="1000원 단위로 입력"
        />
        <button @click="purchaseLottos" class="bg-blue-600 text-white px-10 py-3 rounded-full text-lg cursor-pointer hover:bg-blue-700">
          구입
        </button>
      </div>

      <div v-if="gameState === 'purchased'">
        <p class="text-center mb-4">{{ lottos.length }}개를 구매했습니다.</p>

        <div class="text-center mb-4">
          <button @click="showPurchasedLottos = !showPurchasedLottos" class="text-sm text-blue-600 cursor-pointer hover:underline">
            {{ showPurchasedLottos ? '번호 숨기기' : '구매한 번호 확인' }}
          </button>
        </div>

        <ul v-if="showPurchasedLottos" class="border rounded-md p-2 bg-white max-h-32 overflow-y-auto mb-4">
          <li v-for="(lotto, index) in lottos" :key="index" class="text-gray-800 font-mono text-center">
            {{ lotto.join(', ') }}
          </li>
        </ul>

        <h3 class="text-center font-bold mb-2">당첨 번호를 입력하세요.</h3>
        <div class="grid grid-cols-6 gap-2 mb-4">
          <input
            v-for="i in 6"
            :key="'win-' + i"
            type="number"
            v-model.number="winningNumbers[i - 1]"
            class="w-full p-2 text-center border rounded-md"
            min="1"
            max="45"
          />
        </div>
        <h3 class="text-center font-bold mb-2">보너스 번호를 입력하세요.</h3>
        <input
          type="number"
          v-model.number="bonusNumber"
          class="w-full p-2 text-center border rounded-md mb-6"
          min="1"
          max="45"
        />
        <div class="text-center">
          <button @click="checkResults" class="bg-green-600 text-white px-10 py-3 rounded-full text-lg cursor-pointer hover:bg-green-700">
            결과 확인
          </button>
        </div>
      </div>

      <div v-if="gameState === 'results' && results" class="text-center">
        <h2 class="text-2xl font-bold mb-4">게임 결과 (당첨 통계)</h2>

        <div class="mb-4">
          <h3 class="font-bold text-gray-800">구매한 번호</h3>
          <ul class="border rounded-md p-2 bg-white max-h-24 overflow-y-auto text-sm">
            <li v-for="(lotto, index) in lottos" :key="index" class="font-mono">
              {{ lotto.join(', ') }}
            </li>
          </ul>
        </div>

        <div class="mb-4">
          <h3 class="font-bold text-gray-800">당첨 번호</h3>
          <p class="font-mono text-sm">{{ winningNumbers.join(', ') }} + {{ bonusNumber }}</p>
        </div>

        <div class="text-left mx-auto max-w-xs border-t pt-2">
          <p v-for="(count, rank) in results.ranks" :key="rank" class="text-gray-700 mb-1">
            {{ rank }}: {{ count }}개
          </p>
        </div>
        <p class="font-bold text-lg mt-4">
          총 수익률은 {{ results.roi }}%입니다.
        </p>
        <button @click="restartGame" class="mt-6 bg-gray-500 text-white px-8 py-2 rounded-full hover:bg-gray-600">
          다시 시작
        </button>
      </div>
    </div>
    <ErrorModal v-if="errorMessage" :message="errorMessage" @close="errorMessage = null" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { LOTTO, ERROR_MESSAGES } from '/src/constants/lotto';
import ErrorModal from './ErrorModal.vue';

type GameState = 'start' | 'purchasing' | 'purchased' | 'results';

const emit = defineEmits(['close']);

const gameState = ref<GameState>('start');
const purchaseAmount = ref<number | null>(null);
const lottos = ref<number[][]>([]);
const winningNumbers = ref<(number | null)[]>(Array(6).fill(null));
const bonusNumber = ref<number | null>(null);
const results = ref<{ ranks: Record<string, number>; roi: string } | null>(null);
const errorMessage = ref<string | null>(null);
const showPurchasedLottos = ref(false);

const generateLottoNumbers = (): number[] => {
  const numbers = new Set<number>();
  while (numbers.size < LOTTO.NUMBERS_COUNT) {
    const randomNumber = Math.floor(Math.random() * LOTTO.MAX_NUMBER) + LOTTO.MIN_NUMBER;
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
    return;
  }

  const numberOfLottos = purchaseAmount.value / LOTTO.PRICE;
  const newLottos: number[][] = [];
  for (let i = 0; i < numberOfLottos; i++) {
    newLottos.push(generateLottoNumbers());
  }
  lottos.value = newLottos;
  gameState.value = 'purchased';
};

const checkResults = () => {
  const winningNumbersSet = new Set(winningNumbers.value.filter(n => n !== null));
  if (winningNumbersSet.size !== LOTTO.NUMBERS_COUNT || winningNumbers.value.some(n => n === null || n < LOTTO.MIN_NUMBER || n > LOTTO.MAX_NUMBER)) {
    errorMessage.value = ERROR_MESSAGES.INVALID_WINNING_NUMBERS;
    return;
  }

  if (bonusNumber.value === null || bonusNumber.value < LOTTO.MIN_NUMBER || bonusNumber.value > LOTTO.MAX_NUMBER || winningNumbersSet.has(bonusNumber.value)) {
    errorMessage.value = ERROR_MESSAGES.INVALID_BONUS_NUMBER;
    return;
  }

  const finalWinningNumbers = Array.from(winningNumbersSet) as number[];
  const finalBonusNumber = bonusNumber.value as number;

  const prizeRanks = {
    '1등 (6개 일치)': { prize: 2_000_000_000, count: 0 },
    '2등 (5개 일치, 보너스 볼 일치)': { prize: 30_000_000, count: 0 },
    '3등 (5개 일치)': { prize: 1_500_000, count: 0 },
    '4등 (4개 일치)': { prize: 50_000, count: 0 },
    '5등 (3개 일치)': { prize: 5_000, count: 0 },
  };

  lottos.value.forEach(lotto => {
    const matchCount = lotto.filter(num => finalWinningNumbers.includes(num)).length;
    const hasBonus = lotto.includes(finalBonusNumber);

    if (matchCount === 6) {
      prizeRanks['1등 (6개 일치)'].count++;
    } else if (matchCount === 5 && hasBonus) {
      prizeRanks['2등 (5개 일치, 보너스 볼 일치)'].count++;
    } else if (matchCount === 5) {
      prizeRanks['3등 (5개 일치)'].count++;
    } else if (matchCount === 4) {
      prizeRanks['4등 (4개 일치)'].count++;
    } else if (matchCount === 3) {
      prizeRanks['5등 (3개 일치)'].count++;
    }
  });

  let totalPrize = 0;
  const rankCounts: Record<string, number> = {};
  for (const rank in prizeRanks) {
    const { prize, count } = prizeRanks[rank as keyof typeof prizeRanks];
    if (count > 0) {
      totalPrize += prize * count;
    }
    rankCounts[rank] = count;
  }

  const totalSpent = purchaseAmount.value ?? 0;
  const roi = totalSpent > 0 ? ((totalPrize / totalSpent) * 100).toFixed(1) : '0.0';

  results.value = {
    ranks: rankCounts,
    roi: roi,
  };
  gameState.value = 'results';
};

const restartGame = () => {
  gameState.value = 'start';
  purchaseAmount.value = null;
  lottos.value = [];
  winningNumbers.value = Array(6).fill(null);
  bonusNumber.value = null;
  results.value = null;
  errorMessage.value = null;
};
</script>
