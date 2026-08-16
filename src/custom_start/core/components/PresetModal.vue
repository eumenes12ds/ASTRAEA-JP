<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useCharacterStore } from '../store/character';
import { useCustomContentStore } from '../store/customContent';
import {
  applyPresetToStore,
  countConflicts,
  createPresetFromStore,
  deletePreset,
  exportAllPresets,
  exportPreset,
  formatPresetTime,
  importPresets,
  isPresetNameExists,
  listPresets,
  parsePresetFile,
  readFileFromInput,
  savePreset,
  type CharacterPreset,
} from '../utils/preset-manager';
import { scrollToIframe } from '../utils/scroll';

const props = defineProps<{
  visible: boolean;
  mode?: 'manage' | 'load'; // manage: 完全な管理モード、load: 読み込みのみのモード（初期化時の確認用）
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'loaded', preset: CharacterPreset): void;
  (e: 'saved', preset: CharacterPreset): void;
}>();

const characterStore = useCharacterStore();
const customContentStore = useCustomContentStore();

// プリセットリスト
const presetList = ref<CharacterPreset[]>([]);

// 新規プリセット名
const newPresetName = ref('');

// 現在選択中のプリセット（削除確認用）
const presetToDelete = ref<string | null>(null);

// プリセットリストを更新
const refreshPresetList = () => {
  presetList.value = listPresets();
};

// モーダルの表示状態を監視
watch(
  () => props.visible,
  visible => {
    if (visible) {
      refreshPresetList();
      newPresetName.value = '';
      presetToDelete.value = null;
      scrollToIframe();
    }
  },
);

// コンポーネントマウント時にリストを更新
onMounted(() => {
  if (props.visible) {
    refreshPresetList();
    scrollToIframe();
  }
});

// 現在の設定をプリセットとして保存
const handleSavePreset = () => {
  const name = newPresetName.value.trim();
  if (!name) {
    toastr.warning('プリセット名を入力してください');
    return;
  }

  const preset = createPresetFromStore(name, characterStore);
  const exists = isPresetNameExists(name);

  if (exists) {
    // 上書き確認を表示
    presetToDelete.value = null;
    if (presetToOverwrite.value === name) {
      // 2回目のクリックで上書きを確定
      savePreset(preset, true);
      newPresetName.value = '';
      presetToOverwrite.value = null;
      refreshPresetList();
      emit('saved', preset);
    } else {
      presetToOverwrite.value = name;
      toastr.info(`プリセット「${name}」は既に存在します。もう一度保存をクリックすると上書きします`);
    }
  } else {
    savePreset(preset, false);
    newPresetName.value = '';
    refreshPresetList();
    emit('saved', preset);
  }
};

// 上書き待ちのプリセット名
const presetToOverwrite = ref<string | null>(null);

// プリセットを読み込み
const handleLoadPreset = (preset: CharacterPreset) => {
  applyPresetToStore(preset, characterStore);
  const isCustomBackground = preset.background?.name === '【カスタム開始】';
  const description = isCustomBackground ? (preset.background?.description ?? '') : '';
  customContentStore.updateCustomBackgroundDescription(description);
  emit('loaded', preset);
  emit('close');
};

// プリセット削除のリクエスト（1回目のクリック）
const requestDeletePreset = (name: string) => {
  if (presetToDelete.value === name) {
    // 2回目のクリックで削除を確定
    deletePreset(name);
    presetToDelete.value = null;
    refreshPresetList();
  } else {
    presetToDelete.value = name;
    presetToOverwrite.value = null;
  }
};

// 削除のキャンセル
const cancelDelete = () => {
  presetToDelete.value = null;
};

// モーダルを閉じる
const handleClose = () => {
  emit('close');
};

// モーダルのタイトル
const modalTitle = computed(() => {
  return props.mode === 'load' ? 'プリセットを読み込み' : 'プリセット管理';
});

// 保存領域を表示するか
const showSaveSection = computed(() => {
  return props.mode !== 'load';
});

// インポート/エクスポート

// 単一プリセットをエクスポート
const handleExportPreset = (preset: CharacterPreset) => {
  exportPreset(preset);
};

// すべてのプリセットをエクスポート
const handleExportAll = () => {
  exportAllPresets();
};

// インポート確認待ちのプリセットと衝突数
const pendingImportPresets = ref<CharacterPreset[]>([]);
const pendingConflictCount = ref(0);

// インポート処理：ファイル読み込み、解析、衝突検出
const handleImport = async () => {
  try {
    const content = await readFileFromInput();
    let data: unknown;

    try {
      data = JSON.parse(content);
    } catch {
      toastr.error('インポート失敗：ファイルが有効な JSON 形式ではありません');
      return;
    }

    const presets = parsePresetFile(data);
    if (!presets) return;

    const conflictNum = countConflicts(presets);

    if (conflictNum === 0) {
      // 衝突なし、そのままインポート
      const { imported } = importPresets(presets, false);
      toastr.success(`${imported} 個のプリセットをインポートしました`);
      refreshPresetList();
    } else {
      // 衝突あり、ユーザー確認を待つ
      pendingImportPresets.value = presets;
      pendingConflictCount.value = conflictNum;
    }
  } catch (error: unknown) {
    // ユーザーがファイル選択をキャンセルした場合は通知不要
    if (error instanceof Error && error.message === 'ユーザーがキャンセルしました') return;
    console.error('プリセットのインポートに失敗:', error);
    toastr.error('プリセットのインポートに失敗しました');
  }
};

// インポート確定（衝突を上書き）
const confirmImportOverwrite = () => {
  const { imported } = importPresets(pendingImportPresets.value, true);
  toastr.success(`${imported} 個のプリセットをインポートしました（同名プリセットを上書き）`);
  pendingImportPresets.value = [];
  pendingConflictCount.value = 0;
  refreshPresetList();
};

// インポート確定（衝突をスキップ）
const confirmImportSkip = () => {
  const { imported, skipped } = importPresets(pendingImportPresets.value, false);
  const messages = [`${imported} 個のプリセットをインポートしました`];
  if (skipped > 0) messages.push(`${skipped} 個の同名プリセットをスキップしました`);
  toastr.success(messages.join('、'));
  pendingImportPresets.value = [];
  pendingConflictCount.value = 0;
  refreshPresetList();
};

// インポートのキャンセル
const cancelImport = () => {
  pendingImportPresets.value = [];
  pendingConflictCount.value = 0;
};
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="handleClose">
      <div class="modal-container">
        <!-- タイトルバー -->
        <div class="modal-header">
          <h2 class="modal-title">{{ modalTitle }}</h2>
          <button class="close-button" title="閉じる" @click="handleClose">✕</button>
        </div>
        <!-- 内容領域 -->
        <div class="modal-content">
          <!-- 新規プリセット保存領域 -->
          <div v-if="showSaveSection" class="save-section">
            <h3 class="section-title"><i class="fa-solid fa-floppy-disk"></i> 現在の設定を保存</h3>
            <div class="save-row">
              <input
                v-model="newPresetName"
                type="text"
                class="preset-input"
                placeholder="プリセット名を入力..."
                @keyup.enter="handleSavePreset"
              />
              <button
                class="action-button save-button"
                :class="{ confirm: presetToOverwrite === newPresetName.trim() }"
                @click="handleSavePreset"
              >
                <i
                  class="fa-solid"
                  :class="presetToOverwrite === newPresetName.trim() ? 'fa-check' : 'fa-save'"
                ></i>
                {{ presetToOverwrite === newPresetName.trim() ? '上書きを確認' : 'プリセットを保存' }}
              </button>
            </div>
          </div>

          <!-- プリセットインポート領域 -->
          <div v-if="showSaveSection" class="import-section">
            <h3 class="section-title"><i class="fa-solid fa-file-import"></i> プリセットをインポート</h3>
            <div class="import-row">
              <button class="action-button import-button" @click="handleImport">
                <i class="fa-solid fa-upload"></i> プリセットファイルをインポート
              </button>
              <span class="import-hint">.json 形式のプリセットファイルに対応</span>
            </div>
          </div>

          <!-- プリセットリスト -->
          <div class="list-section">
            <div class="list-header">
              <h3 class="section-title"><i class="fa-solid fa-list"></i> 保存済みのプリセット</h3>
              <button
                v-if="presetList.length > 0 && showSaveSection"
                class="action-button export-all-button"
                @click="handleExportAll"
              >
                <i class="fa-solid fa-file-export"></i> すべてエクスポート
              </button>
            </div>
            <div v-if="presetList.length === 0" class="empty-state">
              <i class="fa-solid fa-inbox empty-icon"></i>
              <p>保存されたプリセットはありません</p>
              <p v-if="showSaveSection" class="hint">上の入力欄に名前を入れて現在の設定を保存できます</p>
            </div>
            <div v-else class="preset-list">
              <div
                v-for="preset in presetList"
                :key="preset.name"
                class="preset-item"
                :class="{ 'delete-pending': presetToDelete === preset.name }"
              >
                <div class="preset-main">
                  <div class="preset-info">
                    <span class="preset-name">{{ preset.name }}</span>
                    <span class="preset-time">{{ formatPresetTime(preset.updatedAt) }}</span>
                  </div>
                  <div class="preset-meta">
                    <span class="meta-item"
                      ><i class="fa-solid fa-user"></i>
                      {{ preset.character.name || '未設定' }}</span
                    >
                    <span class="meta-item"
                      ><i class="fa-solid fa-star"></i> Lv.{{ preset.character.level }}</span
                    >
                    <span class="meta-item"
                      ><i class="fa-solid fa-shield"></i> {{ preset.equipments.length }}</span
                    >
                    <span class="meta-item"
                      ><i class="fa-solid fa-building-columns"></i>
                      {{ preset.assets?.length ?? 0 }}</span
                    >
                    <span class="meta-item"
                      ><i class="fa-solid fa-wand-magic-sparkles"></i>
                      {{ preset.skills.length }}</span
                    >
                    <span class="meta-item"
                      ><i class="fa-solid fa-heart"></i> {{ preset.partners.length }}</span
                    >
                  </div>
                </div>
                <div class="preset-actions">
                  <template v-if="presetToDelete === preset.name">
                    <button
                      class="action-button confirm-delete"
                      @click="requestDeletePreset(preset.name)"
                    >
                      <i class="fa-solid fa-check"></i> 削除を確認
                    </button>
                    <button class="action-button cancel-button" @click="cancelDelete">
                      <i class="fa-solid fa-xmark"></i> キャンセル
                    </button>
                  </template>
                  <template v-else>
                    <button class="action-button load-button" @click="handleLoadPreset(preset)">
                      <i class="fa-solid fa-download"></i> 読み込み
                    </button>
                    <button
                      v-if="showSaveSection"
                      class="action-button export-button"
                      @click="handleExportPreset(preset)"
                    >
                      <i class="fa-solid fa-file-export"></i> エクスポート
                    </button>
                    <button
                      v-if="showSaveSection"
                      class="action-button delete-button"
                      @click="requestDeletePreset(preset.name)"
                    >
                      <i class="fa-solid fa-trash"></i> 削除
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 下部ボタン -->
        <div class="modal-footer">
          <button class="footer-button" @click="handleClose">閉じる</button>
        </div>
      </div>
    </div>

    <!-- インポート衝突確認モーダル -->
    <div
      v-if="pendingImportPresets.length > 0"
      class="modal-overlay conflict-overlay"
      @click.self="cancelImport"
    >
      <div class="modal-container conflict-container">
        <div class="modal-header">
          <h2 class="modal-title"><i class="fa-solid fa-triangle-exclamation"></i> インポート衝突</h2>
          <button class="close-button" title="閉じる" @click="cancelImport">✕</button>
        </div>
        <div class="modal-content">
          <p class="conflict-description">
            合計 {{ pendingImportPresets.length }} 個のプリセットのうち、
            {{ pendingConflictCount }} 個が既存プリセットと同名です。処理方法を選択してください：
          </p>
        </div>
        <div class="modal-footer conflict-footer">
          <button class="footer-button cancel-footer" @click="cancelImport">キャンセル</button>
          <button class="footer-button skip-footer" @click="confirmImportSkip">
            <i class="fa-solid fa-forward"></i> 衝突をスキップ
          </button>
          <button class="footer-button confirm-footer" @click="confirmImportOverwrite">
            <i class="fa-solid fa-arrows-rotate"></i> 衝突を上書き
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.modal-container {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%);

  .modal-title {
    margin: 0;
    font-size: 1.3rem;
    color: var(--title-color);
    font-weight: 700;
    font-family: var(--font-title);
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--text-light);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    transition: var(--transition-fast);

    &:hover {
      background: var(--border-color-light);
      color: var(--error-color);
    }
  }
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.section-title {
  font-size: 1rem;
  color: var(--title-color);
  margin: 0 0 var(--spacing-md) 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  i {
    color: var(--accent-color);
  }
}

.save-section {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px dashed var(--border-color);
}

.save-row {
  display: flex;
  gap: var(--spacing-sm);

  .preset-input {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 0.95rem;
    background: var(--input-bg);
    color: var(--text-color);
    transition: var(--transition-fast);

    &:focus {
      outline: none;
      border-color: var(--accent-color);
      box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
    }

    &::placeholder {
      color: var(--text-light);
    }
  }
}

// インポート領域スタイル
.import-section {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px dashed var(--border-color);
}

.import-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);

  .import-hint {
    font-size: 0.85rem;
    color: var(--text-light);
    font-style: italic;
  }
}

// リストヘッダー（タイトル + すべてエクスポートボタン）
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);

  .section-title {
    margin-bottom: 0;
  }
}

.action-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  white-space: nowrap;

  i {
    font-size: 0.85rem;
  }

  &.save-button {
    background: linear-gradient(135deg, var(--accent-color) 0%, #b8941f 100%);
    color: white;
    border-color: var(--accent-color);

    &:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    &.confirm {
      background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
      border-color: #ff9800;
      animation: pulse 1s infinite;
    }
  }

  &.load-button {
    background: linear-gradient(135deg, var(--success-color) 0%, #1b5e20 100%);
    color: white;
    border-color: var(--success-color);

    &:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
  }

  &.export-button {
    background: linear-gradient(135deg, #8b7355 0%, #6f5840 100%);
    color: white;
    border-color: #8b7355;

    &:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
  }

  &.export-all-button {
    background: linear-gradient(135deg, #8b7355 0%, #6f5840 100%);
    color: white;
    border-color: #8b7355;
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: 0.85rem;

    &:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
  }

  &.import-button {
    background: linear-gradient(135deg, #c28f34 0%, #9a651f 100%);
    color: white;
    border-color: #c28f34;

    &:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
  }

  &.delete-button {
    background: var(--card-bg);
    color: var(--error-color);
    border-color: var(--error-color);

    &:hover {
      background: var(--error-color);
      color: white;
    }
  }

  &.confirm-delete {
    background: var(--error-color);
    color: white;
    border-color: var(--error-color);
    animation: pulse 1s infinite;
  }

  &.cancel-button {
    background: var(--card-bg);
    color: var(--text-color);
    border-color: var(--border-color);

    &:hover {
      background: var(--button-bg);
    }
  }

  &.batch-button {
    background: var(--card-bg);
    color: var(--text-color);
    border-color: var(--border-color);
    font-size: 0.85rem;
    padding: var(--spacing-xs) var(--spacing-md);

    &:hover {
      background: var(--button-bg);
      border-color: var(--accent-color);
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-light);

  .empty-icon {
    font-size: 2.5rem;
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
  }

  p {
    margin: 0 0 var(--spacing-xs) 0;
  }

  .hint {
    font-size: 0.85rem;
    font-style: italic;
  }
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.preset-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);

  &:hover {
    border-color: var(--accent-color);
    box-shadow: var(--shadow-sm);
  }

  &.delete-pending {
    border-color: var(--error-color);
    background: rgba(211, 47, 47, 0.05);
  }
}

.preset-main {
  flex: 1;
  min-width: 0;
}

.preset-info {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);

  .preset-name {
    font-weight: 600;
    color: var(--title-color);
    font-size: 1rem;
  }

  .preset-time {
    font-size: 0.8rem;
    color: var(--text-light);
    font-family: var(--font-mono);
  }
}

.preset-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);

  .meta-item {
    font-size: 0.85rem;
    color: var(--text-light);

    i {
      margin-right: 2px;
      color: var(--accent-color);
      opacity: 0.7;
    }
  }
}

.preset-actions {
  display: flex;
  gap: var(--spacing-xs);
  margin-left: var(--spacing-md);
}

.modal-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;

  .footer-button {
    padding: var(--spacing-sm) var(--spacing-xl);
    background: var(--button-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-fast);
    color: var(--title-color);

    &:hover {
      background: var(--button-hover);
    }
  }
}

// ===================== 衝突モーダルスタイル =====================

.conflict-overlay {
  z-index: 10000;
}

.conflict-container {
  max-width: 550px;
}

.conflict-description {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 0.95rem;
  color: var(--text-color);
}

.batch-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px dashed var(--border-color);
}

.conflict-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.conflict-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.conflict-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;

  .conflict-name {
    font-weight: 600;
    color: var(--title-color);
    font-size: 0.95rem;
  }

  .conflict-detail {
    font-size: 0.8rem;
    color: var(--text-light);

    i {
      margin-right: 2px;
    }
  }
}

.conflict-options {
  display: flex;
  gap: var(--spacing-sm);
  margin-left: var(--spacing-md);
}

.conflict-option {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 0.85rem;

  input[type='radio'] {
    margin: 0;
    cursor: pointer;
  }

  .option-label {
    font-weight: 500;

    &.overwrite-label {
      color: #ff9800;
    }

    &.rename-label {
      color: var(--border-color-strong);
    }

    &.skip-label {
      color: var(--text-light);
    }
  }
}

.no-conflict-hint {
  margin: var(--spacing-md) 0 0 0;
  font-size: 0.9rem;
  color: var(--success-color);

  i {
    margin-right: var(--spacing-xs);
  }
}

.conflict-footer {
  gap: var(--spacing-sm);

  .cancel-footer {
    background: var(--card-bg);
    color: var(--text-color);
    border-color: var(--border-color);

    &:hover {
      background: var(--button-bg);
    }
  }

  .confirm-footer {
    background: linear-gradient(135deg, var(--success-color) 0%, #1b5e20 100%);
    color: white;
    border-color: var(--success-color);

    &:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
  }
}

// レスポンシブデザイン
@media (max-width: 600px) {
  .modal-container {
    width: 95%;
    max-height: 90vh;
  }

  .save-row {
    flex-direction: column;
  }

  .import-row {
    flex-direction: column;
    align-items: stretch;

    .import-hint {
      text-align: center;
    }
  }

  .list-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .preset-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm, 8px);
  }

  .preset-actions {
    margin-left: 0;
    justify-content: flex-end;
  }
}
</style>
