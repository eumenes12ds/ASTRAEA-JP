<script setup lang="ts">
import { onMounted } from 'vue';

import PresetModal from '../components/PresetModal.vue';
import { useJourney, usePoints, usePresetModal, useStepNavigation } from '../composables';
import { STEP_CONFIGS } from '../router/route-constants';
import { useCharacterStore } from '../store';
import { findMatchingPreset } from '../utils/preset-manager';
import { scrollToIframe } from '../utils/scroll';

import ContentArea from './component/ContentArea.vue';
import HeaderControls from './component/HeaderControls.vue';
import NavigationButtons from './component/NavigationButtons.vue';
import SavePresetConfirm from './component/SavePresetConfirm.vue';
import Steps from './component/Steps.vue';

// composables を使用
const characterStore = useCharacterStore();
const {
  currentStep,
  canGoPrevious,
  isLastStep,
  transitionName,
  goToPrevious,
  goToFirst,
  goToStep,
} = useStepNavigation();
const { showModal, modalMode, openManageModal, closeModal, checkAndShowLoadModal } =
  usePresetModal();

const shouldStartJourneyAfterSave = ref(false);
const { executeJourney } = useJourney();
const { availablePoints } = usePoints();

// 保存確認モーダル
const showSaveConfirm = ref(false);

// ステップタイトル（Steps コンポーネント用）
const stepTitles = STEP_CONFIGS.map(c => ({ title: c.shortTitle }));

// コンポーネントマウント時にプリセットがあるか確認
onMounted(() => {
  setTimeout(() => {
    checkAndShowLoadModal();
  }, 300);
});

// プリセット読み込み完了コールバック
const handlePresetLoaded = () => {
  goToFirst();
};

// プリセット保存後に旅を続行（「旅に出る」フローのみ発火）
const handlePresetSavedThenJourney = () => {
  if (!shouldStartJourneyAfterSave.value) {
    return;
  }

  shouldStartJourneyAfterSave.value = false;
  closeModal();
  executeJourney();
};

// 次のステップ/旅に出る
const handleNext = async () => {
  if (isLastStep.value) {
    const matchingPresetName = findMatchingPreset(characterStore);
    if (matchingPresetName) {
      toastr.info(`現在の設定はプリセット「${matchingPresetName}」と同じです。そのまま旅を開始します`);
      executeJourney();
    } else {
      showSaveConfirm.value = true;
      scrollToIframe();
    }
    return;
  }

  goToStep(currentStep.value + 1);
};

// 保存確認モーダルのコールバック
const handleSavePreset = () => {
  showSaveConfirm.value = false;
  shouldStartJourneyAfterSave.value = true;
  openManageModal();
};

const handleSkipSave = () => {
  showSaveConfirm.value = false;
  executeJourney();
};

const handleCancelJourney = () => {
  showSaveConfirm.value = false;
};

const handleOpenPresetManage = () => {
  shouldStartJourneyAfterSave.value = false;
  openManageModal();
};

// 計算プロパティ
const isNextButtonDisabled = computed(() => {
  if (isLastStep.value) {
    return availablePoints.value < 0;
  }
  return false;
});

const nextButtonText = computed(() => {
  return isLastStep.value ? '旅に出る' : '次のステップ';
});
</script>

<template>
  <div class="layout">
    <h1 class="main-title">ASTRAEA</h1>

    <HeaderControls @open-preset="handleOpenPresetManage" />

    <Steps :steps="stepTitles" :step="currentStep" />

    <ContentArea :transition-name="transitionName" />

    <NavigationButtons
      :can-go-previous="canGoPrevious"
      :is-next-disabled="isNextButtonDisabled"
      :next-button-text="nextButtonText"
      next-disabled-title="利用可能な転生ポイントをマイナスにはできません"
      @previous="goToPrevious"
      @next="handleNext"
    />

    <PresetModal
      :visible="showModal"
      :mode="modalMode"
      @close="closeModal"
      @loaded="handlePresetLoaded"
      @saved="handlePresetSavedThenJourney"
    />

    <SavePresetConfirm
      :visible="showSaveConfirm"
      @save="handleSavePreset"
      @skip="handleSkipSave"
      @cancel="handleCancelJourney"
    />
  </div>
</template>

<style lang="scss" scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 500px;
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 1720px;
  margin: 0 auto;
}

.main-title {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  color: var(--title-color);
  overflow-wrap: anywhere;
}

@media (max-width: 768px) {
  .layout {
    padding: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .layout {
    padding: var(--spacing-sm);
  }

  .main-title {
    margin-bottom: var(--spacing-md);
  }
}
</style>
