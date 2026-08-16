<script setup lang="ts">
import { computed, ref } from 'vue';
import ConfirmModal from '../../../components/ConfirmModal.vue';
import {
  FormArrayInput,
  FormInput,
  FormKeyValueInput,
  FormLabel,
  FormNumber,
  FormTextarea,
} from '../../../components/Form';
import { useCustomContentStore } from '../../../store/customContent';
import type { Asset, Equipment, Item, Rarity, Skill } from '../../../types';
import { calculateCostByPosition, getCostRange } from '../../../utils/cost-calculator';
import { CATEGORY_OPTIONS, RARITY_OPTIONS } from '../../../utils/form-options';

interface Emits {
  (
    e: 'add',
    item: Asset | Equipment | Item | Skill,
    type: 'equipment' | 'item' | 'asset' | 'skill',
    replaceName?: string,
  ): void;
}

const emit = defineEmits<Emits>();

// カスタム内容 store を使用
const customContentStore = useCustomContentStore();

// 折りたたみ状態
const isExpanded = ref(false);

// 確認モーダルの状態
const showResetConfirm = ref(false);
const showAddConfirm = ref(false);

// 編集状態
const editingItemName = computed(() => customContentStore.editingCustomItemName);
const isEditing = computed(() => editingItemName.value.trim() !== '');

const cancelEdit = () => {
  customContentStore.updateEditingCustomItemName('');
  customContentStore.resetCustomItemForm();
};

// フォームデータ
const categoryType = computed({
  get: () => customContentStore.customItemForm.categoryType,
  set: (value: 'equipment' | 'item' | 'asset' | 'skill') =>
    customContentStore.updateCustomItemForm('categoryType', value),
});

const customItemType = computed({
  get: () => customContentStore.customItemForm.customItemType,
  set: (value: string) => customContentStore.updateCustomItemForm('customItemType', value),
});

const itemName = computed({
  get: () => customContentStore.customItemForm.itemName,
  set: (value: string) => customContentStore.updateCustomItemForm('itemName', value),
});

const itemRarity = computed({
  get: () => customContentStore.customItemForm.itemRarity,
  set: (value: Rarity) => customContentStore.updateCustomItemForm('itemRarity', value),
});

const itemTag = computed({
  get: () => customContentStore.customItemForm.itemTag,
  set: (value: string[]) => customContentStore.updateCustomItemForm('itemTag', value),
});

const itemEffect = computed({
  get: () => customContentStore.customItemForm.itemEffect,
  set: (value: Record<string, string>) =>
    customContentStore.updateCustomItemForm('itemEffect', value),
});

const itemDescription = computed({
  get: () => customContentStore.customItemForm.itemDescription,
  set: (value: string) => customContentStore.updateCustomItemForm('itemDescription', value),
});

const itemConsume = computed({
  get: () => customContentStore.customItemForm.itemConsume,
  set: (value: string) => customContentStore.updateCustomItemForm('itemConsume', value),
});

const itemSettlement = computed({
  get: () => customContentStore.customItemForm.itemSettlement,
  set: (value: string) => customContentStore.updateCustomItemForm('itemSettlement', value),
});

const itemQuantity = computed({
  get: () => customContentStore.customItemForm.itemQuantity,
  set: (value: number) => customContentStore.updateCustomItemForm('itemQuantity', value),
});

// form-options の設定を使用
const rarityOptions = RARITY_OPTIONS;
const categoryOptions = CATEGORY_OPTIONS;

// 品質に基づいてコストを計算（0.5-1 の間のランダム位置を使用）
const calculatedCost = computed(() => {
  const randomPosition = 0.5 + Math.random() * 0.5;
  return calculateCostByPosition(itemRarity.value, randomPosition);
});

// コスト範囲の表示
const costRangeText = computed(() => {
  return getCostRange(itemRarity.value);
});

// フォーム検証
const isValid = computed(() => {
  return (
    itemName.value.trim() !== '' &&
    customItemType.value.trim() !== '' &&
    Object.keys(itemEffect.value || {}).length > 0
  );
});

// フォームをリセット
const resetForm = () => {
  customContentStore.resetCustomItemForm();
};

// フォームに値を戻す
const fillFormByItem = (
  item: Asset | Equipment | Item | Skill,
  type: 'equipment' | 'item' | 'asset' | 'skill',
) => {
  customContentStore.setCustomItemForm({
    categoryType: type,
    customItemType: item.type || '',
    itemName: item.name || '',
    itemRarity: item.rarity as Rarity,
    itemTag: item.tag ? [...item.tag] : [],
    itemEffect: item.effect ? { ...item.effect } : {},
    itemDescription: item.description || '',
    itemConsume: type === 'skill' ? (item as Skill).consume || '' : '',
    itemSettlement: type === 'asset' ? (item as Asset).settlement || '' : '',
    itemQuantity: type === 'item' ? (item as Item).quantity || 1 : 1,
  });
  customContentStore.updateEditingCustomItemName(item.name || '');
  isExpanded.value = true;
};

// 親コンポーネントに公開する値戻しメソッド
defineExpose({
  fillFormByItem,
});

// クリア確認のリクエスト
const requestReset = () => {
  showResetConfirm.value = true;
};

// クリアを確定
const confirmReset = () => {
  showResetConfirm.value = false;
  resetForm();
};

// クリアをキャンセル
const cancelReset = () => {
  showResetConfirm.value = false;
};

// 追加確認のリクエスト
const requestAdd = () => {
  if (!isValid.value) return;
  showAddConfirm.value = true;
};

// 追加をキャンセル
const cancelAdd = () => {
  showAddConfirm.value = false;
};

// カスタムアイテムを追加/更新（確認後に実行）
const confirmAdd = () => {
  showAddConfirm.value = false;

  const baseItem = {
    name: itemName.value.trim(),
    cost: calculatedCost.value,
    type: customItemType.value.trim(),
    tag: itemTag.value,
    rarity: itemRarity.value,
    effect: itemEffect.value,
    description: itemDescription.value.trim() || 'カスタムアイテム',
    isCustom: true, // カスタムデータであることを示す
  };

  let newItem: Asset | Equipment | Item | Skill;

  if (categoryType.value === 'skill') {
    newItem = {
      ...baseItem,
      consume: itemConsume.value.trim() || '',
      isCustom: true, // カスタムデータであることを示す
    } as Skill;
  } else if (categoryType.value === 'item') {
    newItem = {
      ...baseItem,
      quantity: itemQuantity.value,
      isCustom: true,
    } as Item;
  } else if (categoryType.value === 'asset') {
    newItem = {
      ...baseItem,
      settlement: itemSettlement.value.trim() || '',
    } as Asset;
  } else {
    newItem = baseItem as Equipment;
  }

  emit('add', newItem, categoryType.value, editingItemName.value.trim());
  resetForm();
};
</script>

<template>
  <div class="custom-item-form" :class="{ expanded: isExpanded }">
    <div class="form-header" @click="isExpanded = !isExpanded">
      <div class="header-left">
        <h3 class="form-title">✨ カスタム</h3>
        <div class="form-desc">あなただけのアイテム、資産、装備、スキルを作成</div>
      </div>
      <div class="toggle-icon" :class="{ rotated: isExpanded }">▼</div>
    </div>

    <div v-show="isExpanded" class="form-body">
      <!-- 大分類の選択 -->
      <div class="form-row">
        <label class="form-label">追加する分類</label>
        <div class="category-buttons">
          <button
            v-for="option in categoryOptions"
            :key="option.value"
            class="category-btn"
            :class="{ active: categoryType === option.value, disabled: isEditing }"
            :disabled="isEditing"
            @click="categoryType = option.value as 'equipment' | 'item' | 'asset' | 'skill'"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- 名称 -->
      <div class="form-row">
        <FormLabel label="名称" required />
        <FormInput v-model="itemName" placeholder="アイテム名を入力してください" :maxlength="50" />
      </div>

      <!-- タイプ -->
      <div class="form-row">
        <FormLabel label="タイプ" required />
        <FormInput
          v-model="customItemType"
          placeholder="例：武器、防具、コスト品、アクティブ、パッシブなど"
          :maxlength="20"
        />
      </div>

      <!-- 品質 -->
      <div class="form-row">
        <FormLabel label="品質" required />
        <div class="rarity-buttons">
          <button
            v-for="option in rarityOptions"
            :key="option.value"
            class="rarity-btn"
            :class="{ active: itemRarity === option.value }"
            :style="{ '--rarity-color': option.color }"
            @click="itemRarity = option.value"
          >
            {{ option.label }}
          </button>
        </div>
        <div class="cost-info">
          <span class="cost-label">コストポイント：</span>
          <span class="cost-value">{{ calculatedCost }}</span>
          <span class="cost-range">（範囲：{{ costRangeText }}）</span>
        </div>
      </div>

      <!-- タグ -->
      <div class="form-row">
        <FormLabel label="タグ" />
        <FormArrayInput
          v-model="itemTag"
          placeholder="タグを入力して Enter で追加または保存"
          add-button-text="タグを追加"
          empty-text="タグはまだありません。下のボタンから追加してください"
        />
      </div>

      <!-- 数量（道具分類のみ） -->
      <div v-if="categoryType === 'item'" class="form-row">
        <FormLabel label="数量" />
        <FormNumber
          v-model="itemQuantity"
          :min="1"
          :max="99"
          placeholder="アイテム数量を入力してください"
        />
      </div>

      <!-- コスト（スキル分類のみ） -->
      <div v-if="categoryType === 'skill'" class="form-row">
        <FormLabel label="コスト" />
        <FormInput v-model="itemConsume" placeholder="例：[動作: 50 SP]" />
      </div>

      <!-- 決済（資産分類のみ） -->
      <div v-if="categoryType === 'asset'" class="form-row">
        <FormLabel label="決済" />
        <FormInput v-model="itemSettlement" placeholder="例：毎月 100 ゴールド受け取る" />
      </div>

      <!-- 効果 -->
      <div class="form-row">
        <FormLabel label="効果" required />
        <FormKeyValueInput
          v-model="itemEffect"
          placeholder-key="効果名"
          placeholder-value="効果内容"
          add-button-text="効果を追加"
          empty-text="効果エントリはまだありません。下のボタンから追加してください"
        />
      </div>

      <!-- 説明 -->
      <div class="form-row">
        <FormLabel label="説明" />
        <FormTextarea
          v-model="itemDescription"
          placeholder="アイテムの背景ストーリーを説明してください..."
          :rows="2"
        />
      </div>

      <!-- 操作ボタン -->
      <div class="form-actions">
        <button class="btn-reset" @click="requestReset">クリア</button>
        <button v-if="isEditing" class="btn-cancel" @click="cancelEdit">編集をキャンセル</button>
        <button class="btn-submit" :disabled="!isValid" @click="requestAdd">
          {{ isEditing ? '変更を確定' : '選択項目に追加' }}
        </button>
      </div>
    </div>

    <!-- クリア確認モーダル -->
    <ConfirmModal
      :visible="showResetConfirm"
      title="クリアを確認"
      message="入力したすべての内容をクリアしますか？この操作は取り消せません。"
      confirm-text="クリアを確定"
      cancel-text="キャンセル"
      type="danger"
      @confirm="confirmReset"
      @cancel="cancelReset"
    />

    <!-- 追加/変更確認モーダル -->
    <ConfirmModal
      :visible="showAddConfirm"
      :title="isEditing ? '変更を確認' : '追加を確認'"
      :message="
        isEditing
          ? `「${editingItemName}」を「${itemName}」に更新しますか？`
          : `「${itemName}」を選択項目に追加しますか？`
      "
      :confirm-text="isEditing ? '変更を確定' : '追加を確定'"
      cancel-text="キャンセル"
      type="info"
      @confirm="confirmAdd"
      @cancel="cancelAdd"
    />
  </div>
</template>

<style lang="scss" scoped>
.custom-item-form {
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);

  &:not(.expanded) {
    .form-header {
      border-bottom: none;
    }
  }

  .form-header {
    padding: var(--spacing-md) var(--spacing-lg);
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%);
    border-bottom: 2px solid var(--border-color);
    cursor: pointer;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all var(--transition-fast);

    &:hover {
      background: linear-gradient(
        135deg,
        rgba(212, 175, 55, 0.15) 0%,
        rgba(212, 175, 55, 0.08) 100%
      );
    }

    .header-left {
      flex: 1;
    }

    .form-title {
      font-size: 1.1rem;
      margin: 0 0 var(--spacing-xs) 0;
      color: var(--title-color);
      font-weight: 700;
    }

    .form-desc {
      font-size: 0.85rem;
      color: var(--text-light);
    }

    .toggle-icon {
      font-size: 0.9rem;
      color: var(--text-light);
      transition: transform var(--transition-fast);
      margin-left: var(--spacing-md);

      &.rotated {
        transform: rotate(180deg);
      }
    }
  }

  .form-body {
    padding: var(--spacing-lg);
  }

  .form-row {
    margin-bottom: var(--spacing-md);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .category-buttons,
  .rarity-buttons {
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
  }

  .category-btn {
    padding: var(--spacing-sm) var(--spacing-lg);
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 0.9rem;
    color: var(--text-color);

    &:hover {
      border-color: var(--accent-color);
      background: rgba(212, 175, 55, 0.1);
    }

    &.active {
      background: var(--accent-color);
      border-color: var(--accent-color);
      color: var(--primary-bg);
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);
    }

    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;
      border-style: dashed;
      background: var(--input-bg);
    }
  }

  .rarity-btn {
    padding: 4px var(--spacing-sm);
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 0.85rem;
    color: var(--text-color);

    &:hover {
      border-color: var(--rarity-color);
      color: var(--rarity-color);
    }

    &.active {
      background: var(--rarity-color);
      border-color: var(--rarity-color);
      color: white;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }

  .cost-info {
    margin-top: var(--spacing-xs);
    font-size: 0.85rem;
    color: var(--text-light);

    .cost-value {
      font-size: 1rem;
      font-weight: 700;
      color: var(--accent-color);
      font-family: var(--font-mono);
      margin: 0 var(--spacing-xs);
    }

    .cost-range {
      font-size: 0.8rem;
      color: var(--text-light);
    }
  }

  .form-actions {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-color);
  }

  .btn-reset,
  .btn-submit,
  .btn-cancel {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-lg);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all var(--transition-fast);
  }

  .btn-reset {
    background: var(--input-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);

    &:hover {
      background: var(--card-bg);
      border-color: var(--border-color-strong);
    }
  }

  .btn-cancel {
    background: var(--border-color);
    color: var(--text-color);

    &:hover {
      background: var(--border-color-strong);
    }
  }

  .btn-submit {
    background: var(--accent-color);
    color: var(--primary-bg);

    &:hover:not(:disabled) {
      background: #c9a842;
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// レスポンシブデザイン
@media (max-width: 768px) {
  .custom-item-form {
    .form-header {
      padding: var(--spacing-sm) var(--spacing-md);

      .header-left {
        .form-title {
          font-size: 1rem;
        }

        .form-desc {
          font-size: 0.8rem;
        }
      }

      .toggle-icon {
        font-size: 0.85rem;
      }
    }

    .form-body {
      padding: var(--spacing-md);
    }

    .form-row {
      margin-bottom: var(--spacing-sm);
    }

    .category-buttons,
    .rarity-buttons {
      gap: 4px;
    }

    .category-btn {
      padding: 6px var(--spacing-sm);
      font-size: 0.85rem;
    }

    .rarity-btn {
      padding: 3px var(--spacing-xs);
      font-size: 0.8rem;
    }

    .form-actions {
      flex-direction: column;
      gap: var(--spacing-sm);
    }
  }
}
</style>
