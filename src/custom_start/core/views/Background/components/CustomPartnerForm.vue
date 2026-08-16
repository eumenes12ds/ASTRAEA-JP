<script setup lang="ts">
import { klona } from 'klona';
import { computed, ref, watch } from 'vue';
import ConfirmModal from '../../../components/ConfirmModal.vue';
import {
  FormArrayInput,
  FormInput,
  FormLabel,
  FormNumber,
  FormRadio,
  FormTextarea,
} from '../../../components/Form';
import { useCustomContentStore } from '../../../store/customContent';
import type { Partner, Rarity } from '../../../types';
import { calculateDestinedCost } from '../../../utils/cost-calculator';
import AttributeEditor, { type Attributes } from './AttributeEditor.vue';
import EquipmentEditor, { type EquipmentItem } from './EquipmentEditor.vue';
import SkillEditor, { type SkillItem } from './SkillEditor.vue';

interface Emits {
  (e: 'add', item: Partner, replaceName?: string): void;
}

const emit = defineEmits<Emits>();
const customContentStore = useCustomContentStore();
const isExpanded = ref(false);

// 編集状態
const editingPartnerName = computed(() => customContentStore.editingCustomPartnerName);
const isEditing = computed(() => editingPartnerName.value.trim() !== '');

const cancelEdit = () => {
  customContentStore.updateEditingCustomPartnerName('');
  customContentStore.resetCustomPartnerForm();
};

// 階層とレベルのマッピング関係
const LEVEL_GRADE_MAP: Record<number, { name: string; minGrade: number; maxGrade: number }> = {
  1: { name: '第一階層 (ノーマル)', minGrade: 1, maxGrade: 4 },
  2: { name: '第二階層 (中堅)', minGrade: 5, maxGrade: 8 },
  3: { name: '第三階層 (精鋭)', minGrade: 9, maxGrade: 12 },
  4: { name: '第四階層 (エピック)', minGrade: 13, maxGrade: 16 },
  5: { name: '第五階層 (レジェンド)', minGrade: 17, maxGrade: 20 },
  6: { name: '第六階層 (ミシック)', minGrade: 21, maxGrade: 24 },
  7: { name: '第七階層 (神祇)', minGrade: 25, maxGrade: 25 },
};
// 契約選択肢
const contractOptions = [
  { label: 'はい', value: true },
  { label: 'いいえ', value: false },
];

// デフォルト属性値（Store と一致させる）
const defaultAttributes: Attributes = {
  strength: 5,
  dexterity: 5,
  constitution: 5,
  intelligence: 5,
  mind: 5,
};

const resolveLevelByLifeLevel = (lifeLevel: string): number => {
  if (!lifeLevel.trim()) return 1;

  const matched = _.findKey(LEVEL_GRADE_MAP, info => lifeLevel.includes(info.name));
  return matched ? Number(matched) : 1;
};

const normalizeEquipmentItem = (item: Partial<EquipmentItem>): EquipmentItem => {
  return {
    name: item.name || '未知の装備',
    type: item.type || '未知',
    tag: item.tag ? [...item.tag] : [],
    rarity: item.rarity || 'common',
    effect: item.effect ? { ...item.effect } : {},
    description: item.description || '',
  };
};

const normalizeSkillItem = (item: Partial<SkillItem>): SkillItem => {
  return {
    name: item.name || '未知のスキル',
    type: item.type || '未知',
    tag: item.tag ? [...item.tag] : [],
    rarity: item.rarity || 'common',
    consume: item.consume || '',
    effect: item.effect ? { ...item.effect } : {},
    description: item.description || '',
  };
};

// フォームデータ - computed で双方向バインディングし、関数経由でアクセスしてリアクティブ性を確保
const itemName = computed({
  get: () => customContentStore.customPartnerForm.itemName,
  set: (v: string) => customContentStore.updateCustomPartnerForm('itemName', v),
});
const itemLevel = computed({
  get: () => customContentStore.customPartnerForm.itemLevel,
  set: (v: number) => customContentStore.updateCustomPartnerForm('itemLevel', v),
});
const itemLifeLevel = computed({
  get: () => customContentStore.customPartnerForm.itemLifeLevel,
  set: (v: string) => customContentStore.updateCustomPartnerForm('itemLifeLevel', v),
});
const itemGrade = computed({
  get: () => customContentStore.customPartnerForm.itemGrade,
  set: (v: number) => customContentStore.updateCustomPartnerForm('itemGrade', v),
});
const itemRace = computed({
  get: () => customContentStore.customPartnerForm.itemRace,
  set: (v: string) => customContentStore.updateCustomPartnerForm('itemRace', v),
});
const itemIdentity = computed({
  get: () => customContentStore.customPartnerForm.itemIdentity,
  set: (v: string[]) => customContentStore.updateCustomPartnerForm('itemIdentity', v),
});
const itemCareer = computed({
  get: () => customContentStore.customPartnerForm.itemCareer,
  set: (v: string[]) => customContentStore.updateCustomPartnerForm('itemCareer', v),
});
const itemPersonality = computed({
  get: () => customContentStore.customPartnerForm.itemPersonality,
  set: (v: string) => customContentStore.updateCustomPartnerForm('itemPersonality', v),
});
const itemLike = computed({
  get: () => customContentStore.customPartnerForm.itemLike,
  set: (v: string) => customContentStore.updateCustomPartnerForm('itemLike', v),
});
const itemApp = computed({
  get: () => customContentStore.customPartnerForm.itemApp,
  set: (v: string) => customContentStore.updateCustomPartnerForm('itemApp', v),
});
const itemCloth = computed({
  get: () => customContentStore.customPartnerForm.itemCloth,
  set: (v: string) => customContentStore.updateCustomPartnerForm('itemCloth', v),
});
const itemEquip = computed({
  get: () => customContentStore.customPartnerForm.itemEquip,
  set: (v: EquipmentItem[]) => customContentStore.updateCustomPartnerForm('itemEquip', v),
});
const itemAttributes = computed({
  get: () => customContentStore.customPartnerForm.itemAttributes,
  set: (v: Attributes) => customContentStore.updateCustomPartnerForm('itemAttributes', v),
});
const itemStairway = computed({
  get: () => customContentStore.customPartnerForm.itemStairway,
  set: (v: string) => customContentStore.updateCustomPartnerForm('itemStairway', v),
});
const itemIsContract = computed({
  get: () => customContentStore.customPartnerForm.itemIsContract,
  set: (v: boolean) => customContentStore.updateCustomPartnerForm('itemIsContract', v),
});
const itemAffinity = computed({
  get: () => customContentStore.customPartnerForm.itemAffinity,
  set: (v: number) => customContentStore.updateCustomPartnerForm('itemAffinity', v),
});
const itemComment = computed({
  get: () => customContentStore.customPartnerForm.itemComment,
  set: (v: string) => customContentStore.updateCustomPartnerForm('itemComment', v),
});
const itemBackgroundInfo = computed({
  get: () => customContentStore.customPartnerForm.itemBackgroundInfo,
  set: (v: string) => customContentStore.updateCustomPartnerForm('itemBackgroundInfo', v),
});
const itemSkills = computed({
  get: () => customContentStore.customPartnerForm.itemSkills,
  set: (v: SkillItem[]) => customContentStore.updateCustomPartnerForm('itemSkills', v),
});

// 確認モーダルの状態
const showResetConfirm = ref(false);
const showAddConfirm = ref(false);

// 計算プロパティ
const calculatedCost = computed(() => calculateDestinedCost(itemLevel.value));
const currentLevelInfo = computed(() => LEVEL_GRADE_MAP[itemLevel.value]);
const isValid = computed(() => itemName.value.trim() !== '' && itemRace.value.trim() !== '');

// 階層の変化を監視
watch(
  () => itemLevel.value,
  newLevel => {
    const levelInfo = LEVEL_GRADE_MAP[newLevel];
    if (levelInfo) {
      itemLifeLevel.value = levelInfo.name;
      if (itemGrade.value < levelInfo.minGrade || itemGrade.value > levelInfo.maxGrade) {
        itemGrade.value = levelInfo.minGrade;
      }
    }
  },
  { immediate: true },
);

// フォームをリセット
const resetForm = () => {
  customContentStore.resetCustomPartnerForm();
  const levelInfo = LEVEL_GRADE_MAP[itemLevel.value];
  if (levelInfo) itemLifeLevel.value = levelInfo.name;
};

// フォームに値を戻す
const fillFormByPartner = (partner: Partner) => {
  const resolvedLevel = resolveLevelByLifeLevel(partner.lifeLevel || '');
  const grade = partner.level || LEVEL_GRADE_MAP[resolvedLevel].minGrade;

  customContentStore.setCustomPartnerForm({
    itemName: partner.name || '',
    itemLevel: resolvedLevel,
    itemLifeLevel: partner.lifeLevel || LEVEL_GRADE_MAP[resolvedLevel].name,
    itemGrade: grade,
    itemRace: partner.race || '',
    itemIdentity: partner.identity ? [...partner.identity] : [],
    itemCareer: partner.career ? [...partner.career] : [],
    itemPersonality: partner.personality || '',
    itemLike: partner.like || '',
    itemApp: partner.app || '',
    itemCloth: partner.cloth || '',
    itemEquip: partner.equip ? partner.equip.map(e => normalizeEquipmentItem(e)) : [],
    itemAttributes: partner.attributes ? klona(partner.attributes) : klona(defaultAttributes),
    itemStairway: partner.stairway?.elements?.custom?.desc || '',
    itemIsContract: Boolean(partner.isContract),
    itemAffinity: partner.affinity ?? 0,
    itemComment: partner.comment || '',
    itemBackgroundInfo: partner.backgroundInfo || '',
    itemSkills: partner.skills ? partner.skills.map(s => normalizeSkillItem(s)) : [],
  });
  customContentStore.updateEditingCustomPartnerName(partner.name || '');
  isExpanded.value = true;
};

// 親コンポーネントに公開する値戻しメソッド
defineExpose({
  fillFormByPartner,
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

// 登神長階を解析
const parseStairway = (str: string): Partner['stairway'] => {
  if (!str.trim()) return { isOpen: false };
  return {
    isOpen: true,
    elements: {
      custom: { desc: str },
    },
  };
};

// カスタムパートナーを追加/更新（確認後に実行）
const confirmAdd = () => {
  showAddConfirm.value = false;

  const newItem: Partner = {
    name: itemName.value.trim(),
    cost: calculatedCost.value,
    lifeLevel: itemLifeLevel.value.trim() || '未知',
    level: itemGrade.value,
    race: itemRace.value.trim(),
    identity: klona(itemIdentity.value),
    career: klona(itemCareer.value),
    personality: itemPersonality.value.trim() || '未知',
    like: itemLike.value.trim() || '未知',
    app: itemApp.value.trim() || '未知',
    cloth: itemCloth.value.trim() || '未知',
    equip: klona(itemEquip.value).map(e => ({ ...e, rarity: e.rarity as Rarity })),
    attributes: klona(itemAttributes.value),
    stairway: parseStairway(itemStairway.value),
    isContract: itemIsContract.value,
    affinity: itemAffinity.value,
    comment: itemComment.value.trim(),
    backgroundInfo: itemBackgroundInfo.value.trim(),
    skills: klona(itemSkills.value).map(s => ({ ...s, rarity: s.rarity as Rarity })),
    isCustom: true,
  };

  emit('add', newItem, editingPartnerName.value.trim());
  resetForm();
};
</script>

<template>
  <div class="custom-destined-form" :class="{ expanded: isExpanded }">
    <div class="form-header" @click="isExpanded = !isExpanded">
      <div class="header-left">
        <h3 class="form-title">✨ カスタムパートナー</h3>
        <div class="form-desc">あなただけのパートナーを作成</div>
      </div>
      <div class="toggle-icon" :class="{ rotated: isExpanded }">▼</div>
    </div>

    <div v-show="isExpanded" class="form-body">
      <!-- 名前 -->
      <div class="form-row">
        <FormLabel label="名前" required />
        <FormInput v-model="itemName" placeholder="名前を入力してください" :maxlength="50" />
      </div>

      <!-- 階層 -->
      <div class="form-row">
        <FormLabel label="階層" required />
        <div class="level-buttons">
          <button
            v-for="level in 7"
            :key="level"
            class="level-btn"
            :class="{ active: itemLevel === level }"
            @click="itemLevel = level"
          >
            第{{ ['一', '二', '三', '四', '五', '六', '七'][level - 1] }}階層
          </button>
        </div>
        <div class="cost-info">
          <span class="cost-label">コストポイント：</span>
          <span class="cost-value">{{ calculatedCost }}</span>
        </div>
      </div>

      <!-- 生命階層（自動入力） -->
      <div class="form-row">
        <FormLabel label="生命階層（階層に応じて自動入力）" />
        <FormInput v-model="itemLifeLevel" readonly disabled />
      </div>

      <!-- レベル -->
      <div class="form-row">
        <FormLabel
          :label="`レベル（${currentLevelInfo.minGrade}-${currentLevelInfo.maxGrade}級）`"
        />
        <FormNumber
          v-model="itemGrade"
          :min="currentLevelInfo.minGrade"
          :max="currentLevelInfo.maxGrade"
          :placeholder="`${currentLevelInfo.minGrade}-${currentLevelInfo.maxGrade}`"
        />
        <div class="field-hint">
          この階層のレベル範囲：{{ currentLevelInfo.minGrade }}-{{ currentLevelInfo.maxGrade }}級
        </div>
      </div>

      <!-- 種族 -->
      <div class="form-row">
        <FormLabel label="種族" required />
        <FormInput v-model="itemRace" placeholder="例：人間、エルフなど" :maxlength="20" />
      </div>

      <!-- 身分 -->
      <div class="form-row">
        <FormLabel label="身分" />
        <FormArrayInput v-model="itemIdentity" placeholder="身分を入力して Enter で追加" />
      </div>

      <!-- 職業 -->
      <div class="form-row">
        <FormLabel label="職業" />
        <FormArrayInput v-model="itemCareer" placeholder="職業を入力して Enter で追加" />
      </div>

      <!-- 性格 -->
      <div class="form-row">
        <FormLabel label="性格" />
        <FormInput v-model="itemPersonality" placeholder="キャラクターの性格特徴を説明..." />
      </div>

      <!-- 好意 -->
      <div class="form-row">
        <FormLabel label="好意" />
        <FormTextarea v-model="itemLike" placeholder="好きなことや習慣を説明..." :rows="2" />
      </div>

      <!-- 外見 -->
      <div class="form-row">
        <FormLabel label="外見" />
        <FormTextarea v-model="itemApp" placeholder="外見の特徴を説明..." :rows="2" />
      </div>

      <!-- 服装 -->
      <div class="form-row">
        <FormLabel label="服装" />
        <FormTextarea v-model="itemCloth" placeholder="服装・身なりを説明..." :rows="2" />
      </div>

      <!-- 属性 -->
      <div class="form-row">
        <FormLabel label="属性" />
        <AttributeEditor v-model="itemAttributes" :min="1" :max="20" />
      </div>

      <!-- 装備 -->
      <div class="form-row">
        <FormLabel label="装備" />
        <EquipmentEditor v-model="itemEquip" :max-items="10" />
      </div>

      <!-- スキル -->
      <div class="form-row">
        <FormLabel label="スキル" />
        <SkillEditor v-model="itemSkills" :max-items="10" />
      </div>

      <!-- 登神長階 -->
      <div class="form-row">
        <FormLabel label="登神長階（レベル ≥ 13 が必要）" />
        <FormTextarea
          v-model="itemStairway"
          :disabled="itemGrade < 13"
          :placeholder="
            itemGrade >= 13
              ? '登神長階の情報を説明...'
              : 'レベルが13級以上にならないと記入できません'
          "
          :rows="2"
        />
        <div v-if="itemGrade < 13" class="field-hint">
          ⚠️ 現在レベル {{ itemGrade }} 級。13 級に達すると登神長階を解放できます
        </div>
      </div>

      <!-- 命定契約 -->
      <div class="form-row">
        <FormLabel label="命定契約" />
        <FormRadio v-model="itemIsContract" :options="contractOptions" />
      </div>

      <!-- 好感度 -->
      <div class="form-row">
        <FormLabel label="好感度 (-100~100)" />
        <FormNumber v-model="itemAffinity" :min="-100" :max="100" placeholder="49" />
      </div>

      <!-- 本音 -->
      <div class="form-row">
        <FormLabel label="本音" />
        <FormTextarea
          v-model="itemComment"
          placeholder="このキャラクターのあなたへの評価..."
          :rows="2"
        />
      </div>

      <!-- 背景ストーリー -->
      <div class="form-row">
        <FormLabel label="背景ストーリー" />
        <FormTextarea
          v-model="itemBackgroundInfo"
          placeholder="背景ストーリーを説明..."
          :rows="3"
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
          ? `「${editingPartnerName}」を「${itemName}」に更新しますか？`
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
.custom-destined-form {
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
    background: linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(139, 69, 19, 0.05) 100%);
    border-bottom: 2px solid var(--border-color);
    cursor: pointer;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all var(--transition-fast);

    &:hover {
      background: linear-gradient(135deg, rgba(139, 69, 19, 0.15) 0%, rgba(139, 69, 19, 0.08) 100%);
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
    max-height: 70vh;
    overflow-y: auto;
  }

  .form-row {
    margin-bottom: var(--spacing-md);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .level-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--spacing-xs);
  }

  .level-btn {
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 0.85rem;
    color: var(--text-color);
    white-space: nowrap;

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

  .field-hint {
    margin-top: var(--spacing-xs);
    font-size: 0.8rem;
    color: var(--text-light);
    font-style: italic;
  }
}

// レスポンシブデザイン
@media (max-width: 768px) {
  .custom-destined-form {
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
      max-height: 60vh;
    }

    .form-row {
      margin-bottom: var(--spacing-sm);
    }

    .level-buttons {
      grid-template-columns: repeat(2, 1fr);
    }

    .level-btn {
      padding: 6px var(--spacing-sm);
      font-size: 0.8rem;
    }

    .form-actions {
      flex-direction: column;
      gap: var(--spacing-sm);
    }
  }
}
</style>
