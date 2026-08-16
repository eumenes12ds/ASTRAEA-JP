<template>
  <div class="core-page">
    <h2 class="main-title">コア選択</h2>
    <p class="core-subtitle">
      星海を越えて降臨した異界の魂は、孤独な身に宿るユニークで永遠の共鳴であり、生死を共にする命定の霊である
    </p>

    <div class="control-panel-container">
      <div class="tab-content">
        <div class="control-group">
          <div v-if="isLoading" class="loading-text">コアリストを読み込み中...</div>
          <div v-else-if="coreOptions.length === 0" class="empty-text">
            利用可能なコアが見つかりません
          </div>
          <div v-else class="list-detail-layout">
            <div class="item-list">
              <button
                v-for="core in coreOptions"
                :key="core.value"
                class="list-item"
                :class="{
                  'toggled-on': localCoreSelections.get(core.value),
                  selected: selectedCoreKey === core.value,
                }"
                @click="handleCoreClick(core.value)"
              >
                {{ core.label }}
              </button>
            </div>
            <div class="item-detail">
              <template v-if="selectedCoreKey && selectedCoreInfo">
                <h3 class="detail-name">{{ selectedCoreInfo.label }}</h3>
                <div v-if="selectedCoreInfo.note" class="detail-row detail-row-note">
                  <span
                    class="detail-value core-note-content"
                    v-html="renderMarkdown(selectedCoreInfo.note)"
                  ></span>
                </div>
                <div class="detail-actions">
                  <button
                    class="toggle-btn"
                    :class="{ 'toggled-on': localCoreSelections.get(selectedCoreKey) }"
                    @click="handleSelectCore(selectedCoreKey)"
                  >
                    {{ localCoreSelections.get(selectedCoreKey) ? '選択済み' : '未選択' }}
                  </button>
                </div>
              </template>
              <div v-else class="detail-placeholder">コアを選択すると詳細が表示されます</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="step-footer">
      <button
        class="nav-button"
        :disabled="enabledCoreCount !== 1 || isLoading || isSaving"
        @click="handleNext"
      >
        <span>{{ isSaving ? '旅立ち中...' : '旅を始める' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  initialCoreState,
  loadCoreOptions as loadCoreOptionsService,
  saveChanges as saveChangesService,
  selectCore,
  type CoreOption,
} from '../services/CorePage';
import { renderMarkdown } from '../services/markdownRender';
import { saveOutputSelection } from '../services/outputMethod';
import { switchSwipe } from '../services/StartPage';

const isLoading = ref(false);
const isSaving = ref(false);
const coreOptions = ref<CoreOption[]>([...initialCoreState.coreOptions]);
const localCoreSelections = ref(new Map(initialCoreState.localCoreSelections));
const bookName = ref<string | null>(null);

// 選択して詳細を表示するコア
const selectedCoreKey = ref<string | null>(null);

// 現在有効なコア数を計算
const enabledCoreCount = computed(() => {
  let count = 0;
  for (const enabled of localCoreSelections.value.values()) {
    if (enabled) count++;
  }
  return count;
});

// 選択中のコアの詳細情報を取得
const selectedCoreInfo = computed(() => {
  if (!selectedCoreKey.value) return null;
  return coreOptions.value.find(core => core.value === selectedCoreKey.value) || null;
});

async function loadCoreOptions() {
  isLoading.value = true;
  try {
    const result = await loadCoreOptionsService();
    coreOptions.value = result.coreOptions;
    localCoreSelections.value = result.localCoreSelections;
    bookName.value = result.bookName;
  } catch (error) {
    console.error('コアリストの読み込みに失敗しました:', error);
    coreOptions.value = [];
    localCoreSelections.value = new Map();
    bookName.value = null;
  } finally {
    isLoading.value = false;
  }
}

function handleSelectCore(coreValue: string) {
  localCoreSelections.value = selectCore(localCoreSelections.value, coreValue);
}

// 左側のコアをクリック = 自動選択（単一選択式）+ 詳細表示
function handleCoreClick(coreValue: string) {
  selectedCoreKey.value = coreValue;
  handleSelectCore(coreValue);
}

/**
 * 「旅を始める」をクリック：コアの選択を保存し、API 出力方式を自動判定して、カスタム序章に切り替える
 */
async function handleNext() {
  isSaving.value = true;
  try {
    if (bookName.value) {
      coreOptions.value = await saveChangesService(
        coreOptions.value,
        localCoreSelections.value,
        bookName.value,
      );
    }
    await runStartSequence();
  } catch (error) {
    console.error('コア選択の保存に失敗しました:', error);
  } finally {
    isSaving.value = false;
  }
}

async function runStartSequence() {
  // 1. API を判定（追加API または メインAPI）
  let api = 'メインAPI';
  try {
    const ext = (window.top as any)?.SillyTavern?.getContext?.().extensionSettings;
    const extra = ext?.mvu_settings?.['追加モデル解析設定'];
    if (extra) {
      if (extra['モデル出典'] && extra['モデル出典'] !== 'カスタム') {
        api = '追加API';
      } else if (extra['apiアドレス'] && extra['キー'] && extra['モデル名']) {
        api = '追加API';
      }
    }
  } catch {
    /* ignore */
  }

  // 2. 変数出力方式を書き込み
  await saveOutputSelection(api);

  // 3. カスタム序章に切り替え（swipe 1）
  await switchSwipe(1);
}

// コンポーネントマウント時にコアリストを読み込む
onMounted(() => {
  loadCoreOptions();
});
</script>

<style scoped>
.main-title {
  font-family: var(--title-font);
  font-weight: 700;
  color: var(--title-color);
  text-align: center;
  margin: 0 0 10px 0;
  font-size: 2.2em;
}

.core-subtitle {
  text-align: center;
  font-family: var(--body-font);
  color: var(--link-color);
  font-size: 0.95em;
  letter-spacing: 1px;
  margin: 0 0 20px 0;
}

.control-panel-container {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: rgba(50, 40, 26, 0.92);
  padding: 0;
  margin: 25px 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tab-content {
  padding: 15px 20px;
}

.control-group {
  min-height: 200px;
}

/* ===== リスト-詳細レイアウト ===== */
.list-detail-layout {
  display: flex;
  gap: 20px;
  height: 450px;
}

.item-list {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  max-height: 450px;
  overflow-y: auto;
  padding-right: 10px;
  border-right: 1px solid var(--border-color);
  scrollbar-width: none;
}

.item-list::-webkit-scrollbar {
  width: 6px;
}

.item-list::-webkit-scrollbar-track {
  background: transparent;
}

.item-list::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.item-list:hover {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
}

.item-list:hover::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
}

.item-list:hover::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.list-item {
  font-family: var(--body-font);
  font-size: 0.95em;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: var(--item-bg-color);
  color: var(--text-color);
  text-align: left;
  width: 100%;
}

.list-item:hover {
  background-color: var(--item-bg-hover-color);
  border-color: var(--border-strong-color);
}

.list-item.selected {
  background-color: var(--item-bg-selected-color);
  border-color: var(--title-color);
  color: var(--title-color);
  font-weight: 500;
}

.list-item.toggled-on {
  border-left: 3px solid #a8842f;
}

.list-item.toggled-on.selected {
  border-left: 3px solid #a8842f;
}

/* 詳細パネル */
.item-detail {
  flex: 1;
  padding: 10px 20px;
  height: 100%;
  max-height: 450px;
  overflow-y: auto;
  background-color: rgba(50, 40, 26, 0.85);
  border-radius: 0 6px 6px 0;
  min-width: 0;
}

.detail-name {
  font-family: var(--title-font);
  font-size: 1.4em;
  font-weight: 600;
  color: var(--title-color);
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--border-color);
}

.detail-row {
  display: flex;
  margin-bottom: 10px;
  font-size: 0.95em;
}

.detail-row-note {
  flex-direction: column;
}

.detail-value {
  flex: 1;
  color: var(--text-color);
}

/* Markdown 描画後の備考内容 */
.core-note-content {
  line-height: 1.6;
  word-break: break-word;
  overflow-x: auto;
  max-width: 100%;
}

.core-note-content :deep(h1),
.core-note-content :deep(h2),
.core-note-content :deep(h3) {
  margin: 8px 0 4px 0;
  color: var(--title-color);
}

.core-note-content :deep(h1) {
  font-size: 1.2em;
}

.core-note-content :deep(h2) {
  font-size: 1.1em;
}

.core-note-content :deep(h3) {
  font-size: 1em;
}

.core-note-content :deep(ul) {
  margin: 4px 0;
  padding-left: 20px;
}

.core-note-content :deep(li) {
  margin-bottom: 2px;
}

.core-note-content :deep(code) {
  background-color: rgba(216, 182, 120, 0.14);
  color: #f0dfb8;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.9em;
}

.core-note-content :deep(strong) {
  font-weight: 600;
}

.core-note-content :deep(a) {
  color: var(--title-color);
  text-decoration: underline;
}

.core-note-content :deep(hr) {
  border: none;
  border-top: 1px dashed var(--border-color);
  margin: 12px 0;
}

.core-note-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
  font-size: 0.9em;
  max-width: 100%;
}

.core-note-content :deep(th),
.core-note-content :deep(td) {
  border: 1px solid var(--border-color);
  padding: 6px 10px;
  text-align: left;
}

.core-note-content :deep(th) {
  background-color: rgba(0, 0, 0, 0.04);
  font-weight: 600;
}

.core-note-content :deep(tr:nth-child(even)) {
  background-color: rgba(0, 0, 0, 0.02);
}

.detail-actions {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed var(--border-color);
}

.toggle-btn {
  font-family: var(--body-font);
  font-size: 0.95em;
  padding: 8px 20px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: rgba(58, 46, 30, 0.85);
  color: #e9dcc4;
}

.toggle-btn:hover {
  opacity: 0.9;
}

.toggle-btn.toggled-on {
  background-color: #5f4c30;
  color: #f2e8d2;
  border-color: #d8b678;
}

.detail-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 150px;
  color: var(--text-color);
  opacity: 0.6;
  font-size: 0.95em;
}

.loading-text,
.empty-text {
  font-size: 0.95em;
  color: #c9b98f;
  text-align: center;
  padding: 20px;
  opacity: 0.8;
}

.step-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: auto;
  padding-top: 20px;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--body-font);
  font-weight: 500;
  font-size: 1em;
  color: var(--title-color);
  background-color: var(--item-bg-color);
  border: 1px solid var(--border-color);
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.nav-button:hover:not(:disabled) {
  background-color: var(--item-bg-hover-color);
  border-color: var(--border-strong-color);
  transform: translateY(-2px);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media screen and (max-width: 600px) {
  .main-title {
    font-size: 1.8em;
  }

  .list-detail-layout {
    flex-direction: column;
    height: auto;
  }

  .item-list {
    flex: none;
    height: auto;
    max-height: 150px;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    padding-right: 0;
    padding-bottom: 10px;
  }

  .item-detail {
    height: auto;
    max-height: none;
    padding: 10px 0;
  }
}
</style>
