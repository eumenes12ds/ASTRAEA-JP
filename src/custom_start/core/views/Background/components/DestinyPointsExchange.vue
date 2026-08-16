<script setup lang="ts">
import ExchangeCard from '../../../components/exchange-card.vue';
import { useCharacterStore } from '../../../store/character';

const characterStore = useCharacterStore();

const pointsToExchange = ref(0);

const maxExchangeable = computed(() => {
  const currentSpent = Math.ceil(characterStore.character.destinyPoints / 2);
  return Math.max(
    0,
    characterStore.character.reincarnationPoints - (characterStore.consumedPoints - currentSpent),
  );
});

const handleExchange = () => {
  if (pointsToExchange.value <= 0 || pointsToExchange.value > maxExchangeable.value) {
    return;
  }

  const nextDestinyPoints = Math.max(0, Math.round(pointsToExchange.value)) * 2;
  characterStore.updateCharacterField('destinyPoints', nextDestinyPoints);
  pointsToExchange.value = 0;
};

const handleExchangeAll = () => {
  if (maxExchangeable.value <= 0) return;
  characterStore.updateCharacterField('destinyPoints', maxExchangeable.value * 2);
  pointsToExchange.value = 0;
};

const handleReset = () => {
  characterStore.resetDestinyExchange();
  pointsToExchange.value = 0;
};
</script>

<template>
  <ExchangeCard
    v-model="pointsToExchange"
    title="運命ポイント"
    rate-text="(1転生ポイント = 2運命ポイント)"
    icon-class="fa-solid fa-stars"
    current-label="現在："
    :current-value="characterStore.character.destinyPoints"
    gain-unit="運命ポイント"
    :gain-per-point="2"
    :max-exchangeable="maxExchangeable"
    theme="violet"
    exchange-all-title="残りの転生ポイントをすべて運命ポイントに交換"
    reset-title="交換した運命ポイントをリセット"
    :reset-disabled="characterStore.character.destinyPoints <= 0"
    @exchange="handleExchange"
    @exchange-all="handleExchangeAll"
    @reset="handleReset"
  />
</template>
