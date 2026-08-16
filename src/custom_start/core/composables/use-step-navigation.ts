/**
 * ステップナビゲーション Composable
 */
import type { ComputedRef, Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  ROUTE_NAMES,
  ROUTE_TO_STEP,
  STEP_CONFIGS,
  STEP_TO_ROUTE,
  TOTAL_STEPS,
} from '../router/route-constants';

/**
 * ステップナビゲーションの戻りタイプ
 */
interface UseStepNavigationReturn {
  /** 現在のステップ (1-based) */
  currentStep: ComputedRef<number>;
  /** ステップ総数 */
  totalSteps: number;
  /** ステップ設定リスト */
  stepConfigs: typeof STEP_CONFIGS;
  /** 前のステップに戻れるか */
  canGoPrevious: ComputedRef<boolean>;
  /** 最後のステップか */
  isLastStep: ComputedRef<boolean>;
  /** トランジションアニメーション名 */
  transitionName: Ref<string>;
  /** 前のステップへ移動 */
  goToPrevious: () => void;
  /** 次のステップへ移動 */
  goToNext: () => void;
  /** 指定ステップへ移動 */
  goToStep: (step: number) => void;
  /** 最初のステップへ移動 */
  goToFirst: () => void;
}

/**
 * ステップナビゲーションを使用
 * ステップナビゲーションに関連するリアクティブな状態とメソッドを提供
 */
export function useStepNavigation(): UseStepNavigationReturn {
  const router = useRouter();
  const route = useRoute();
  const transitionName = ref('slide-left');

  // ルートのメタ情報またはルート名から現在のステップを取得
  const currentStep = computed(() => {
    const step = route.meta?.step as number;
    if (step) return step;

    const routeName = route.name as string;
    return ROUTE_TO_STEP[routeName] || 1;
  });

  // 前のステップに戻れるか
  const canGoPrevious = computed(() => currentStep.value > 1);

  // 最後のステップか
  const isLastStep = computed(() => currentStep.value === TOTAL_STEPS);

  // 指定ステップへ移動
  const goToStep = (step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      const routeName = STEP_TO_ROUTE[step];
      if (routeName) {
        router.push({ name: routeName });
      }
    }
  };

  // 前のステップへ移動
  const goToPrevious = () => {
    const prevStep = currentStep.value - 1;
    if (prevStep >= 1) {
      goToStep(prevStep);
    }
  };

  // 次のステップへ移動
  const goToNext = () => {
    const nextStep = currentStep.value + 1;
    if (nextStep <= TOTAL_STEPS) {
      goToStep(nextStep);
    }
  };

  // 最初のステップへ移動
  const goToFirst = () => {
    router.push({ name: ROUTE_NAMES.BASIC_INFO });
  };

  // ルートの変化を監視し、トランジション方向を設定
  watch(
    () => route.name,
    (newRoute, oldRoute) => {
      const newStep = ROUTE_TO_STEP[newRoute as string] || 1;
      const oldStep = ROUTE_TO_STEP[oldRoute as string] || 1;
      // ステップの変化に応じてアニメーション方向を決定
      transitionName.value = newStep > oldStep ? 'slide-left' : 'slide-right';
    },
  );

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    stepConfigs: STEP_CONFIGS,
    canGoPrevious,
    isLastStep,
    transitionName,
    goToPrevious,
    goToNext,
    goToStep,
    goToFirst,
  };
}
