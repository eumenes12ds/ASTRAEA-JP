import { klona } from 'klona';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Rarity } from '../types';
import type { Attributes } from '../views/Background/components/AttributeEditor.vue';
import type { EquipmentItem } from '../views/Background/components/EquipmentEditor.vue';
import type { SkillItem } from '../views/Background/components/SkillEditor.vue';

/**
 * カスタム内容 Store
 * ユーザーが入力したすべてのカスタム内容を管理し、ページ間での状態永続化を実現
 */
export const useCustomContentStore = defineStore('customContent', () => {
  /**
   * カスタム開始シナリオの説明
   */
  const customBackgroundDescription = ref('');

  /**
   * カスタムアイテム編集フラグ
   */
  const editingCustomItemName = ref('');

  /**
   * カスタムパートナー編集フラグ
   */
  const editingCustomPartnerName = ref('');

  /**
   * カスタム開始シナリオの説明を更新
   */
  const updateCustomBackgroundDescription = (value: string) => {
    customBackgroundDescription.value = value;
  };

  /**
   * カスタムアイテムのフォームデータ
   */
  const customItemForm = ref({
    categoryType: 'equipment' as 'equipment' | 'item' | 'asset' | 'skill',
    customItemType: '',
    itemName: '',
    itemRarity: 'common' as Rarity,
    itemTag: [] as string[],
    itemEffect: {} as Record<string, string>,
    itemDescription: '',
    itemConsume: '',
    itemSettlement: '',
    itemQuantity: 1,
  });

  /**
   * カスタムアイテムフォームを更新
   */
  const updateCustomItemForm = (field: keyof typeof customItemForm.value, value: any) => {
    customItemForm.value[field] = value as never;
  };

  /**
   * カスタムアイテムフォームを一括設定
   */
  const setCustomItemForm = (value: Partial<typeof customItemForm.value>) => {
    customItemForm.value = {
      ...customItemForm.value,
      ...value,
    };
  };

  /**
   * カスタムアイテム編集フラグを更新
   */
  const updateEditingCustomItemName = (value: string) => {
    editingCustomItemName.value = value;
  };

  /**
   * カスタムアイテムフォームをリセット
   */
  const resetCustomItemForm = () => {
    customItemForm.value = {
      categoryType: 'equipment',
      customItemType: '',
      itemName: '',
      itemRarity: 'common' as Rarity,
      itemTag: [],
      itemEffect: {},
      itemDescription: '',
      itemConsume: '',
      itemSettlement: '',
      itemQuantity: 1,
    };
    editingCustomItemName.value = '';
  };

  /**
   * デフォルト属性値
   */
  const defaultAttributes: Attributes = {
    strength: 5,
    dexterity: 5,
    constitution: 5,
    intelligence: 5,
    mind: 5,
  };

  /**
   * カスタムパートナーのフォームデータ
   * 本格的なデータ構造を使用：配列は複数値フィールド、オブジェクトは複雑な構造
   */
  const customPartnerForm = ref({
    itemName: '',
    itemLevel: 1,
    itemLifeLevel: '',
    itemGrade: 1,
    itemRace: '',
    // 配列タイプで複数値フィールドを格納
    itemIdentity: [] as string[],
    itemCareer: [] as string[],
    itemPersonality: '',
    itemLike: '',
    itemApp: '',
    itemCloth: '',
    // 専用エディターコンポーネントのデータ構造を使用
    itemEquip: [] as EquipmentItem[],
    itemAttributes: { ...defaultAttributes } as Attributes,
    itemStairway: '',
    itemIsContract: true,
    itemAffinity: 0,
    itemComment: '',
    itemBackgroundInfo: '',
    itemSkills: [] as SkillItem[],
  });

  /**
   * カスタムパートナーフォームを更新
   */
  const updateCustomPartnerForm = (field: keyof typeof customPartnerForm.value, value: any) => {
    customPartnerForm.value[field] = value as never;
  };

  /**
   * カスタムパートナーフォームを一括設定
   */
  const setCustomPartnerForm = (value: Partial<typeof customPartnerForm.value>) => {
    customPartnerForm.value = {
      ...customPartnerForm.value,
      ...value,
    };
  };

  /**
   * カスタムパートナー編集フラグを更新
   */
  const updateEditingCustomPartnerName = (value: string) => {
    editingCustomPartnerName.value = value;
  };

  /**
   * カスタムパートナーフォームをリセット
   * klona でディープコピーの安全性を確保
   */
  const resetCustomPartnerForm = () => {
    customPartnerForm.value = {
      itemName: '',
      itemLevel: 1,
      itemLifeLevel: '',
      itemGrade: 1,
      itemRace: '',
      itemIdentity: [],
      itemCareer: [],
      itemPersonality: '',
      itemLike: '',
      itemApp: '',
      itemCloth: '',
      itemEquip: [],
      itemAttributes: klona(defaultAttributes),
      itemStairway: '',
      itemIsContract: true,
      itemAffinity: 0,
      itemComment: '',
      itemBackgroundInfo: '',
      itemSkills: [],
    };
    editingCustomPartnerName.value = '';
  };

  /**
   * すべてのカスタム内容をリセット
   */
  const resetAll = () => {
    customBackgroundDescription.value = '';
    resetCustomItemForm();
    resetCustomPartnerForm();
    editingCustomItemName.value = '';
    editingCustomPartnerName.value = '';
  };

  return {
    // カスタム開始シナリオの説明
    customBackgroundDescription,
    updateCustomBackgroundDescription,

    // カスタムアイテム編集フラグ
    editingCustomItemName,
    updateEditingCustomItemName,

    // カスタムパートナー編集フラグ
    editingCustomPartnerName,
    updateEditingCustomPartnerName,

    // カスタムアイテムフォーム
    customItemForm,
    updateCustomItemForm,
    setCustomItemForm,
    resetCustomItemForm,

    // カスタムパートナーフォーム
    customPartnerForm,
    updateCustomPartnerForm,
    setCustomPartnerForm,
    resetCustomPartnerForm,

    // グローバルリセット
    resetAll,
  };
});
