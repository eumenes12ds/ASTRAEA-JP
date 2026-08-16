<template>
  <div class="selector-scroll">
    <PageTitle />

    <Transition name="fade" mode="out-in">
      <!-- Gate フェーズ：ユーザー契約ページ -->
      <AgreementPage
        v-if="!hasAgreed"
        key="agreement"
        @agreed="handleAgreed"
        @env-check-complete="handleEnvCheckComplete"
      />

      <!-- 通常フェーズ：展示エリア + ステップフロー -->
      <div v-else key="main">
        <ShowcaseSection />

        <div class="step-content">
          <Transition name="fade" mode="out-in">
            <component
              :is="steps[currentStep]"
              @next="nextStep"
              @prev="prevStep"
              @env-check-complete="handleEnvCheckComplete"
            />
          </Transition>
        </div>
      </div>
    </Transition>
  </div>

  <!-- フローティングミュージックプレイヤー。契約同意後に表示 -->
  <VinylPlayer v-if="hasAgreed" />
</template>

<script setup>
import { provide, readonly, ref } from 'vue';
import AgreementPage from './components/AgreementPage.vue';
import CorePage from './components/CorePage.vue';
import PageTitle from './components/PageTitle.vue';
import ShowcaseSection from './components/ShowcaseSection.vue';
import VinylPlayer from './components/VinylPlayer.vue';

const AGREEMENT_KEY = 'Astraea-agreed';

// ユーザー契約ゲート（単一ステップ化済み：契約を直接スキップ）
const hasAgreed = ref(true);

function handleAgreed() {
  hasAgreed.value = true;
  // 同意時のバージョン番号を書き込む
  try {
    localStorage.setItem(AGREEMENT_KEY, __APP_VERSION__);
  } catch {
    /* ignore */
  }
}

const currentStep = ref(0);

const steps = [CorePage];

// 環境チェック結果
const envCheckResult = ref(null);

// 子コンポーネントに提供
provide('envCheckResult', readonly(envCheckResult));

// 現在のバージョンの契約に同意したことがあるか確認
function hasPreviouslyAgreed() {
  try {
    const agreedVersion = localStorage.getItem(AGREEMENT_KEY);
    if (!agreedVersion) return false;
    return agreedVersion === __APP_VERSION__;
  } catch {
    return false;
  }
}

// 過去の同意フラグを AgreementPage に提供
const previouslyAgreed = hasPreviouslyAgreed();
provide('previouslyAgreed', previouslyAgreed);

function nextStep() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

function handleEnvCheckComplete(result) {
  envCheckResult.value = result;
}
</script>

<style scoped>
.selector-scroll {
  background-color: #2b2014;
  max-width: 900px;
  width: 100%;
  margin: auto;
  display: flex;
  flex-direction: column;
}

.step-content {
  margin-top: 20px;
}
</style>
