<script setup lang="ts">
import ExchangeCard from '../../../components/exchange-card.vue';
import { useCharacterStore } from '../../../store/character';

const characterStore = useCharacterStore();

const pointsToExchange = ref(0);

const maxExchangeable = computed(() => {
  const currentSpent = Math.ceil(characterStore.character.money / 100);
  return Math.max(
    0,
    characterStore.character.reincarnationPoints - (characterStore.consumedPoints - currentSpent),
  );
});

const handleExchange = () => {
  if (pointsToExchange.value <= 0 || pointsToExchange.value > maxExchangeable.value) {
    return;
  }

  const nextMoney = Math.max(0, Math.round(pointsToExchange.value)) * 100;
  characterStore.updateCharacterField('money', nextMoney);
  pointsToExchange.value = 0;
};

const handleExchangeAll = () => {
  if (maxExchangeable.value <= 0) return;
  characterStore.updateCharacterField('money', maxExchangeable.value * 100);
  pointsToExchange.value = 0;
};

const handleReset = () => {
  characterStore.updateCharacterField('money', 0);
  pointsToExchange.value = 0;
};
</script>

<template>
  <ExchangeCard
    v-model="pointsToExchange"
    title="金銭交換"
    rate-text="(1転生ポイント = 100 G)"
    icon-class="fa-solid fa-coins"
    current-label="現在："
    :current-value="characterStore.character.money"
    current-unit="G"
    gain-unit="G"
    :gain-per-point="100"
    :max-exchangeable="maxExchangeable"
    theme="gold"
    exchange-all-title="残りの転生ポイントをすべて金銭に交換"
    reset-title="交換した金銭をリセット"
    :reset-disabled="characterStore.character.money <= 0"
    @exchange="handleExchange"
    @exchange-all="handleExchangeAll"
    @reset="handleReset"
  />
</template>
