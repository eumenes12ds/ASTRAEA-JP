/**
 * 転生ポイント管理 Composable
 */
import { storeToRefs } from 'pinia';

import { useCharacterStore } from '../store';

interface UsePointsReturn {
  /** 利用可能ポイント */
  availablePoints: ComputedRef<number>;
  /** ポイントを Roll できるか */
  canRollPoints: ComputedRef<boolean>;
  /** 新しい転生ポイントを Roll */
  rollPoints: () => number;
}

/**
 * 転生ポイント管理を使用
 */
export function usePoints(): UsePointsReturn {
  const characterStore = useCharacterStore();
  const { character } = storeToRefs(characterStore);

  // 利用可能ポイントを計算
  const availablePoints = computed(() => {
    const consumed = characterStore.consumedPoints;
    return character.value.reincarnationPoints - consumed;
  });

  // Roll できるかどうかを判定（コストポイントがない場合のみ許可）
  const canRollPoints = computed(() => {
    return characterStore.consumedPoints === 0;
  });

  // 転生ポイントを Roll
  const rollPoints = () => {
    return characterStore.rollInitialPoints();
  };

  return {
    availablePoints,
    canRollPoints,
    rollPoints,
  };
}
