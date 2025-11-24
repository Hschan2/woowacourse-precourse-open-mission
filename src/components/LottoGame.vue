<template>
  <div class="fixed inset-0 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm flex justify-center items-center z-20">
    <div class="relative bg-gray-100 p-4 mobile:p-6 tablet:p-8 rounded-2xl shadow-xl w-full max-w-sm mx-4">
      <button @click="$emit('close')" class="absolute top-2 right-3 text-gray-500 text-2xl font-bold cursor-pointer hover:text-gray-700">
        &times;
      </button>

      <div v-if="gameState === 'start'" class="text-center">
        <h2 class="text-2xl mobile:text-3xl font-bold mb-4 mobile:mb-6">로또 게임</h2>
        <button @click="gameState = 'purchasing'" class="bg-blue-600 text-white px-8 py-2 mobile:px-10 mobile:py-3 rounded-full text-base mobile:text-lg cursor-pointer hover:bg-blue-700">
          시작
        </button>
      </div>

      <div v-if="gameState === 'purchasing'" class="text-center">
        <h2 class="text-xl mobile:text-2xl font-bold mb-4 mobile:mb-6">몇 장 구매할까요?</h2>
        <input
          type="number"
          v-model.number="purchaseAmount"
          class="w-full p-3 text-center border-2 border-gray-300 rounded-lg mb-4"
          placeholder="1000원 단위로 입력"
        />
        <button @click="purchaseLottos" class="bg-blue-600 text-white px-8 py-2 mobile:px-10 mobile:py-3 rounded-full text-base mobile:text-lg cursor-pointer hover:bg-blue-700">
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
        <div class="grid grid-cols-6 gap-1 mobile:gap-2 mb-4">
          <input
            v-for="i in 6"
            :key="'win-' + i"
            type="number"
            v-model.number="winningNumbers[i - 1]"
            class="w-full p-1 mobile:p-2 text-center border rounded-md"
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
        <div class="text-center flex flex-col mobile:flex-row justify-center gap-2">
          <button @click="showResults" class="w-full mobile:w-auto bg-green-600 text-white px-4 py-2 text-base mobile:px-6 mobile:py-3 mobile:text-lg cursor-pointer hover:bg-green-700">
            결과 확인
          </button>
          <button @click="autoGenerateAndShowResults" class="w-full mobile:w-auto bg-yellow-500 text-white px-4 py-2 text-base mobile:px-6 mobile:py-3 mobile:text-lg cursor-pointer hover:bg-yellow-600">
            번호 자동 생성
          </button>
        </div>
      </div>

      <div v-if="gameState === 'results' && results" class="text-center">
        <h2 class="text-xl mobile:text-2xl font-bold mb-4">게임 결과 (당첨 통계)</h2>

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
        <p class="font-bold text-base mobile:text-lg mt-4">
          총 수익률은 {{ results.roi }}%입니다.
        </p>
        <button @click="restartGame" class="mt-6 bg-gray-500 text-white px-6 py-2 rounded-full text-base hover:bg-gray-600">
          다시 시작
        </button>
      </div>
    </div>
    <ErrorModal v-if="errorMessage" :message="errorMessage" @close="errorMessage = null" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLotto } from '/src/hooks/useLotto';
import ErrorModal from './ErrorModal.vue';

type GameState = 'start' | 'purchasing' | 'purchased' | 'results';

const emit = defineEmits(['close']);
const gameState = ref<GameState>('start');
const showPurchasedLottos = ref(false);

const {
  purchaseAmount,
  lottos,
  winningNumbers,
  bonusNumber,
  results,
  errorMessage,
  purchaseLottos: purchaseLottosLogic,
  checkResults,
  generateWinningNumbersAndCheck,
  restartGame: restartGameLogic,
} = useLotto();

const purchaseLottos = () => {
  if (purchaseLottosLogic()) {
    gameState.value = 'purchased';
  }
};

const showResults = () => {
  checkResults();
  if (results.value) {
    gameState.value = 'results';
  }
}

const autoGenerateAndShowResults = () => {
  generateWinningNumbersAndCheck();
  if (results.value) {
    gameState.value = 'results';
  }
}

const restartGame = () => {
  restartGameLogic();
  gameState.value = 'start';
};
</script>
