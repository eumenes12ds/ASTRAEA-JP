<script setup lang="ts">
/**
 * スキルエディターコンポーネント
 */
import { computed, ref, watch } from 'vue';
import {
  FormArrayInput,
  FormInput,
  FormKeyValueInput,
  FormLabel,
  FormSelect,
  FormTextarea,
} from '../../../components/Form';
import {
  getRarityColor,
  getRarityLabel,
  RARITY_OPTIONS,
  SKILL_TYPE_OPTIONS,
} from '../../../utils/form-options';

// スキル項目インターフェース
export interface SkillItem {
  name: string;
  type: string;
  tag: string[];
  rarity: string;
  consume: string;
  effect: Record<string, string>;
  description: string;
}

interface Props {
  modelValue: SkillItem[];
  maxItems?: number;
  disabled?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: SkillItem[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  maxItems: 20,
  disabled: false,
});

const emit = defineEmits<Emits>();

// FormSelect 用に選択肢形式を変換
const rarityOptions = RARITY_OPTIONS.map(opt => ({ label: opt.label, value: opt.value }));
const typeOptions = SKILL_TYPE_OPTIONS.map(opt => ({ label: opt.label, value: opt.value }));

// 現在編集中のスキルインデックス
const editingIndex = ref<number | null>(null);

// 新規スキルフォーム
const newSkill = ref<SkillItem>({
  name: '',
  type: SKILL_TYPE_OPTIONS[0].value,
  tag: [],
  rarity: 'common',
  consume: '',
  effect: {},
  description: '',
});

// 編集中のスキル（一時保存）
const editingSkill = ref<SkillItem | null>(null);

// 追加フォームを表示するか
const showAddForm = ref(false);

// 計算プロパティ：さらに追加できるか
const canAddMore = computed(() => {
  return !props.disabled && props.modelValue.length < props.maxItems;
});

// 新規スキルフォームをリセット
const resetNewSkill = () => {
  newSkill.value = {
    name: '',
    type: SKILL_TYPE_OPTIONS[0].value,
    tag: [],
    rarity: 'common',
    consume: '',
    effect: {},
    description: '',
  };
};

// スキルを追加
const addSkill = () => {
  if (!canAddMore.value || !newSkill.value.name.trim()) return;

  const newItem: SkillItem = {
    ...newSkill.value,
    name: newSkill.value.name.trim(),
    tag: newSkill.value.tag.filter(tag => tag.trim() !== ''),
    consume: newSkill.value.consume?.trim() || '',
    effect: { ...newSkill.value.effect },
    description: newSkill.value.description?.trim() || '',
  };

  emit('update:modelValue', [...props.modelValue, newItem]);
  resetNewSkill();
  showAddForm.value = false;
};

// スキルを削除
const removeSkill = (index: number) => {
  if (props.disabled) return;

  const newArray = [...props.modelValue];
  newArray.splice(index, 1);
  emit('update:modelValue', newArray);
};

// 編集を開始
const startEdit = (index: number) => {
  if (props.disabled) return;

  editingIndex.value = index;
  editingSkill.value = { ...props.modelValue[index] };
};

// 編集を保存
const saveEdit = () => {
  if (editingIndex.value === null || !editingSkill.value) return;

  const newArray = [...props.modelValue];
  newArray[editingIndex.value] = {
    ...editingSkill.value,
    name: editingSkill.value.name.trim(),
    tag: editingSkill.value.tag.filter(tag => tag.trim() !== ''),
    consume: editingSkill.value.consume?.trim() || '',
    effect: { ...editingSkill.value.effect },
    description: editingSkill.value.description?.trim() || '',
  };

  emit('update:modelValue', newArray);
  cancelEdit();
};

// 編集をキャンセル
const cancelEdit = () => {
  editingIndex.value = null;
  editingSkill.value = null;
};

// 追加フォームの表示を切り替え
const toggleAddForm = () => {
  showAddForm.value = !showAddForm.value;
  if (!showAddForm.value) {
    resetNewSkill();
  }
};

// 無効状態の変化を監視
watch(
  () => props.disabled,
  disabled => {
    if (disabled) {
      cancelEdit();
      showAddForm.value = false;
    }
  },
);
</script>

<template>
  <div class="skill-editor" :class="{ 'is-disabled': disabled }">
    <!-- スキルリスト -->
    <div v-if="modelValue.length > 0" class="skill-list">
      <TransitionGroup name="skill-list">
        <div
          v-for="(item, index) in modelValue"
          :key="`skill-${index}-${item.name}`"
          class="skill-item"
          :class="{ editing: editingIndex === index }"
        >
          <!-- 編集モード -->
          <template v-if="editingIndex === index && editingSkill">
            <div class="edit-form">
              <div class="form-row">
                <FormLabel label="スキル名" />
                <FormInput v-model="editingSkill.name" placeholder="スキル名を入力してください" />
              </div>
              <div class="form-row-group">
                <div class="form-row half">
                  <FormLabel label="タイプ" />
                  <FormSelect v-model="editingSkill.type" :options="typeOptions" />
                </div>
                <div class="form-row half">
                  <FormLabel label="品質" />
                  <FormSelect v-model="editingSkill.rarity" :options="rarityOptions" />
                </div>
              </div>
              <div class="form-row">
                <FormLabel label="タグ" />
                <FormArrayInput
                  v-model="editingSkill.tag"
                  placeholder="タグを入力して Enter で追加または保存"
                  add-button-text="タグを追加"
                  empty-text="タグはまだありません"
                />
              </div>
              <div class="form-row">
                <FormLabel label="コスト" />
                <FormInput
                  v-model="editingSkill.consume"
                  placeholder="例：[攻撃:50MP] または [動作:30SP]"
                />
              </div>
              <div class="form-row">
                <FormLabel label="効果" />
                <FormKeyValueInput
                  v-model="editingSkill.effect"
                  placeholder-key="効果名"
                  placeholder-value="効果内容"
                  add-button-text="効果を追加"
                  empty-text="効果エントリはまだありません"
                />
              </div>
              <div class="form-row">
                <FormLabel label="説明" />
                <FormTextarea
                  v-model="editingSkill.description"
                  :rows="2"
                  placeholder="スキルの説明を入力してください（任意）"
                />
              </div>
              <div class="edit-actions">
                <button type="button" class="btn-cancel" @click="cancelEdit">キャンセル</button>
                <button
                  type="button"
                  class="btn-save"
                  :disabled="!editingSkill.name.trim()"
                  @click="saveEdit"
                >
                  保存
                </button>
              </div>
            </div>
          </template>

          <!-- 表示モード -->
          <template v-else>
            <div class="item-header">
              <span class="item-type">{{ item.type || 'アクティブ' }}</span>
              <span class="item-name">{{ item.name }}</span>
              <span
                class="item-rarity"
                :style="{
                  '--rarity-color': getRarityColor(item.rarity),
                }"
              >
                {{ getRarityLabel(item.rarity) }}
              </span>
            </div>

            <div v-if="item.tag && item.tag.length > 0" class="item-tag">
              <span v-for="tag in item.tag" :key="tag" class="tag-text">{{ tag }}</span>
            </div>

            <div v-if="item.consume" class="item-consume">
              <span class="consume-label">コスト：</span>
              <span class="consume-text">{{ item.consume }}</span>
            </div>

            <div v-if="Object.keys(item.effect || {}).length > 0" class="item-effect">
              <span class="effect-label">効果：</span>
              <div class="effect-list">
                <div v-for="(value, key) in item.effect" :key="key" class="effect-row">
                  <span class="effect-key">{{ key }}：</span>
                  <span class="effect-value">{{ value }}</span>
                </div>
              </div>
            </div>

            <div v-if="item.description" class="item-description">
              {{ item.description }}
            </div>

            <div class="item-actions">
              <button
                type="button"
                class="action-btn edit"
                title="編集"
                :disabled="disabled"
                @click="startEdit(index)"
              >
                <i class="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                編集
              </button>
              <button
                type="button"
                class="action-btn delete"
                title="削除"
                :disabled="disabled"
                @click="removeSkill(index)"
              >
                <i class="fa-solid fa-trash" aria-hidden="true"></i>
                削除
              </button>
            </div>
          </template>
        </div>
      </TransitionGroup>
    </div>

    <!-- 空状態 -->
    <div v-else class="empty-state">
      <span class="empty-icon"><i class="fa-solid fa-wand-magic" aria-hidden="true"></i></span>
      <span class="empty-text">スキルはまだありません。下のボタンから追加してください</span>
    </div>

    <!-- スキル追加フォーム -->
    <div v-if="showAddForm && canAddMore" class="add-form">
      <div class="add-form-header">
        <span class="form-title">新しいスキルを追加</span>
        <button type="button" class="close-btn" @click="toggleAddForm">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
      <div class="form-row">
        <FormLabel label="スキル名" required />
        <FormInput v-model="newSkill.name" placeholder="スキル名を入力してください" />
      </div>
      <div class="form-row-group">
        <div class="form-row half">
          <FormLabel label="タイプ" />
          <FormSelect v-model="newSkill.type" :options="typeOptions" />
        </div>
        <div class="form-row half">
          <FormLabel label="品質" />
          <FormSelect v-model="newSkill.rarity" :options="rarityOptions" />
        </div>
      </div>
      <div class="form-row">
        <FormLabel label="タグ" />
        <FormArrayInput
          v-model="newSkill.tag"
          placeholder="タグを入力して Enter で追加または保存"
          add-button-text="タグを追加"
          empty-text="タグはまだありません"
        />
      </div>
      <div class="form-row">
        <FormLabel label="コスト" />
        <FormInput v-model="newSkill.consume" placeholder="例：[攻撃:50MP] または [動作:30SP]" />
      </div>
      <div class="form-row">
        <FormLabel label="効果" />
        <FormKeyValueInput
          v-model="newSkill.effect"
          placeholder-key="効果名"
          placeholder-value="効果内容"
          add-button-text="効果を追加"
          empty-text="効果エントリはまだありません"
        />
      </div>
      <div class="form-row">
        <FormLabel label="説明" />
        <FormTextarea
          v-model="newSkill.description"
          :rows="2"
          placeholder="スキルの説明を入力してください（任意）"
        />
      </div>
      <div class="add-form-actions">
        <button type="button" class="btn-cancel" @click="toggleAddForm">キャンセル</button>
        <button type="button" class="btn-add" :disabled="!newSkill.name.trim()" @click="addSkill">
          スキルを追加
        </button>
      </div>
    </div>

    <!-- 追加ボタン -->
    <div v-if="canAddMore && !showAddForm" class="add-section">
      <button type="button" class="add-btn" :disabled="disabled" @click="toggleAddForm">
        <span class="add-icon">+</span>
        <span class="add-text">スキルを追加</span>
      </button>
    </div>

    <!-- 数量表示 -->
    <div class="count-info">
      <span class="count-current">{{ modelValue.length }}</span>
      <span class="count-separator">/</span>
      <span class="count-max">{{ maxItems }}</span>
      <span class="count-label">個のスキル</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.skill-editor {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--input-bg);
  overflow: hidden;

  &.is-disabled {
    opacity: 0.6;
    pointer-events: none;
  }
}

.skill-list {
  max-height: 400px;
  overflow-y: auto;
  padding: var(--spacing-sm);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--border-color-light);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;

    &:hover {
      background: var(--border-color-strong);
    }
  }
}

.skill-item {
  background: var(--card-bg);
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  transition: all var(--transition-fast);

  &:last-child {
    margin-bottom: 0;
  }

  &:hover:not(.editing) {
    border-color: var(--accent-color);
    box-shadow: var(--shadow-sm);
  }

  &.editing {
    border-color: var(--accent-color);
    background: rgba(212, 175, 55, 0.05);
  }
}

.item-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.item-type {
  padding: 2px 8px;
  background: var(--border-color-light);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--text-light);
}

.item-name {
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  color: var(--title-color);
}

.item-rarity {
  padding: 2px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--rarity-color);
  color: #fff;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}

.item-tag {
  margin-bottom: var(--spacing-xs);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  .tag-text {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    background: rgba(212, 175, 55, 0.15);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    color: var(--accent-color);
  }
}

.item-consume {
  font-size: 0.85rem;
  color: var(--text-color);
  margin-bottom: var(--spacing-xs);

  .consume-label {
    color: #e91e63;
    font-weight: 600;
  }

  .consume-text {
    color: #c2185b;
  }
}

.item-effect {
  font-size: 0.9rem;
  color: var(--text-color);
  margin-bottom: var(--spacing-xs);
  line-height: 1.5;

  .effect-label {
    color: var(--accent-color);
    font-weight: 600;
  }
}

.effect-list {
  margin-top: var(--spacing-xs);
  display: grid;
  gap: 4px;
}

.effect-row {
  display: grid;
  grid-template-columns: minmax(64px, max-content) 1fr;
  gap: var(--spacing-xs);
  font-size: 0.85rem;
  color: var(--text-color);
}

.effect-key {
  color: var(--text-light);
  font-weight: 600;
}

.effect-value {
  color: var(--text-color);
}

.item-description {
  font-size: 0.85rem;
  color: var(--text-light);
  font-style: italic;
  padding-top: var(--spacing-xs);
  border-top: 1px dashed var(--border-color-light);
}

.item-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-color-light);

  i {
    margin-right: var(--spacing-xs);
  }
}

.action-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--card-bg);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover:not(:disabled) {
    border-color: var(--accent-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.delete:hover:not(:disabled) {
    border-color: var(--error-color);
    color: var(--error-color);
    background: rgba(211, 47, 47, 0.05);
  }
}

.edit-form,
.add-form {
  padding: var(--spacing-md);
}

.add-form {
  border-top: 1px solid var(--border-color-light);
  background: rgba(212, 175, 55, 0.03);
}

.add-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);

  .form-title {
    font-weight: 600;
    color: var(--title-color);
  }

  .close-btn {
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--text-light);
    transition: color var(--transition-fast);

    &:hover {
      color: var(--error-color);
    }
  }
}

.form-row {
  margin-bottom: var(--spacing-sm);

  &.half {
    flex: 1;
  }
}

.form-row-group {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.edit-actions,
.add-form-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  justify-content: flex-end;
}

.btn-cancel,
.btn-save,
.btn-add {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-cancel {
  background: var(--border-color-light);
  color: var(--text-color);

  &:hover {
    background: var(--border-color);
  }
}

.btn-save,
.btn-add {
  background: var(--accent-color);
  color: var(--primary-bg);

  &:hover:not(:disabled) {
    background: #c9a842;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--text-light);
  gap: var(--spacing-sm);

  .empty-icon {
    font-size: 2rem;
    opacity: 0.6;
  }

  .empty-text {
    font-size: 0.9rem;
  }
}

.add-section {
  padding: var(--spacing-sm);
  border-top: 1px solid var(--border-color-light);
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-md);
  background: rgba(212, 175, 55, 0.1);
  border: 2px dashed var(--accent-color);
  border-radius: var(--radius-md);
  color: var(--accent-color);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover:not(:disabled) {
    background: rgba(212, 175, 55, 0.2);
    border-style: solid;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .add-icon {
    font-size: 1.2rem;
    font-weight: 700;
  }
}

.count-info {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--border-color-light);
  font-size: 0.75rem;
  color: var(--text-light);
  gap: 2px;

  .count-current {
    font-weight: 700;
    color: var(--accent-color);
  }

  .count-max {
    font-weight: 600;
  }
}

// リストアニメーション
.skill-list-enter-active,
.skill-list-leave-active {
  transition: all 0.3s ease;
}

.skill-list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.skill-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.skill-list-move {
  transition: transform 0.3s ease;
}

// レスポンシブデザイン
@media (max-width: 768px) {
  .form-row-group {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .item-header {
    flex-wrap: wrap;
  }

  .item-actions {
    flex-wrap: wrap;
  }
}
</style>
