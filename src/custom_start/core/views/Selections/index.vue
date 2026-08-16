<script setup lang="ts">
import CategorySelectionLayout from '../../components/CategorySelectionLayout.vue';
import { getAssets } from '../../data/assets';
import { getRaceCosts } from '../../data/base-info';
import { getEquipments } from '../../data/equipments';
import { getInitialItems } from '../../data/Items';
import { getSkills } from '../../data/skills';
import { useCharacterStore } from '../../store/character';
import { useCustomContentStore } from '../../store/customContent';
import type { Asset, Equipment, Item, Rarity, Skill } from '../../types';

import CategoryTabs, { type CategoryType } from './components/CategoryTabs.vue';
import CustomItemForm from './components/CustomItemForm.vue';
import ItemList from './components/ItemList.vue';
import MoneyExchangeCard from './components/MoneyExchangeCard.vue';
import RarityFilter from './components/RarityFilter.vue';
import SelectedPanel from './components/SelectedPanel.vue';

const characterStore = useCharacterStore();
const customContentStore = useCustomContentStore();
const customItemFormRef = ref<InstanceType<typeof CustomItemForm> | null>(null);

// 現在選択中の大分類
const currentCategory = ref<CategoryType>('equipment');

// 現在選択中の子分類
const currentSubCategory = ref<string>('');

// 現在選択中の品質フィルタ
const currentRarity = ref<Rarity | 'all'>('all');

// 表示用の分類名を取得
const getCategoryDisplayName = (name: string): string => {
  return name;
};

const equipments = computed(() => getEquipments());
const initialItems = computed(() => getInitialItems());
const assets = computed(() => getAssets());
const skillGroups = computed(() => getSkills());

const currentRace = computed(() => {
  return characterStore.character.race === 'カスタム'
    ? characterStore.character.customRace
    : characterStore.character.race;
});

const raceSpecificSkillCategories = computed(() => {
  return Object.keys(getRaceCosts.value).filter(race => race !== 'カスタム');
});

const getDisabledSkillCategories = () => {
  if (currentCategory.value !== 'skill') return [];

  return raceSpecificSkillCategories.value.filter(category => category !== currentRace.value);
};

// 現在の分類の子分類リストを取得
const subCategories = computed(() => {
  switch (currentCategory.value) {
    case 'equipment':
      return Object.keys(equipments.value);
    case 'item':
      return Object.keys(initialItems.value);
    case 'asset':
      return Object.keys(assets.value);
    case 'skill':
      return orderedSkillCategories.value;
    default:
      return [];
  }
});

// スキル分類が利用可能か確認（種族制限に基づく）
const isSkillCategoryAvailable = (category: string): boolean => {
  if (currentCategory.value !== 'skill') return true;

  if (raceSpecificSkillCategories.value.includes(category)) {
    return currentRace.value === category;
  }

  return true;
};

const orderedSkillCategories = computed(() => {
  if (currentCategory.value !== 'skill') return [];

  const categories = Object.keys(skillGroups.value);
  const [available, unavailable] = _.partition(categories, isSkillCategoryAvailable);
  return [...available, ...unavailable];
});

// 分類が変わった時に子分類と品質フィルタをリセット
watch(currentCategory, () => {
  currentSubCategory.value = subCategories.value[0] || '';
  currentRarity.value = 'all';
});

// 子分類を初期化
onMounted(() => {
  currentSubCategory.value = subCategories.value[0] || '';
});

// 種族の変化を監視し、現在のスキル分類が利用可能であることを確認
watch(
  () => [characterStore.character.race, characterStore.character.customRace],
  () => {
    if (currentCategory.value !== 'skill') return;

    if (!isSkillCategoryAvailable(currentSubCategory.value)) {
      const nextCategory = _.find(subCategories.value, isSkillCategoryAvailable) || '';
      currentSubCategory.value = nextCategory;
    }
  },
  { deep: true },
);

// 現在表示するアイテムリストを取得（品質フィルタを適用）
const currentItems = computed<(Asset | Equipment | Item | Skill)[]>(() => {
  let sourceItems: (Asset | Equipment | Item | Skill)[] = [];

  switch (currentCategory.value) {
    case 'equipment':
      sourceItems = (equipments.value[currentSubCategory.value] || []) as Equipment[];
      break;
    case 'item':
      sourceItems = (initialItems.value[currentSubCategory.value] || []) as Item[];
      break;
    case 'asset':
      sourceItems = (assets.value[currentSubCategory.value] || []) as Asset[];
      break;
    case 'skill':
      sourceItems = skillGroups.value[currentSubCategory.value] || [];
      break;
  }

  // 品質フィルタを適用
  if (currentRarity.value !== 'all') {
    return sourceItems.filter(item => item.rarity === currentRarity.value);
  }

  return sourceItems;
});

// 現在選択中のアイテムリストを取得
const currentSelectedItems = computed<(Asset | Equipment | Item | Skill)[]>(() => {
  switch (currentCategory.value) {
    case 'equipment':
      return characterStore.selectedEquipments;
    case 'item':
      return characterStore.selectedItems;
    case 'asset':
      return characterStore.selectedAssets;
    case 'skill':
      return characterStore.selectedSkills;
    default:
      return [];
  }
});

// アイテムを選択
const handleSelectItem = (item: Asset | Equipment | Item | Skill) => {
  switch (currentCategory.value) {
    case 'equipment':
      characterStore.addEquipment(item as Equipment);
      break;
    case 'item':
      characterStore.addItem(item as Item);
      break;
    case 'asset':
      characterStore.addAsset(item as Asset);
      break;
    case 'skill':
      characterStore.addSkill(item as Skill);
      break;
  }
};

// アイテムの選択を解除
const handleDeselectItem = (item: Asset | Equipment | Item | Skill) => {
  switch (currentCategory.value) {
    case 'equipment':
      characterStore.removeEquipment(item as Equipment);
      break;
    case 'item':
      characterStore.removeItem(item as Item);
      break;
    case 'asset':
      characterStore.removeAsset(item as Asset);
      break;
    case 'skill':
      characterStore.removeSkill(item as Skill);
      break;
  }
};

// 選択済みパネルからアイテムを削除
const handleRemoveFromPanel = (
  item: Asset | Equipment | Item | Skill,
  type: 'equipment' | 'item' | 'asset' | 'skill',
) => {
  switch (type) {
    case 'equipment':
      characterStore.removeEquipment(item as Equipment);
      break;
    case 'item':
      characterStore.removeItem(item as Item);
      break;
    case 'asset':
      characterStore.removeAsset(item as Asset);
      break;
    case 'skill':
      characterStore.removeSkill(item as Skill);
      break;
  }
};

// すべての選択をクリア
const handleClearAll = () => {
  characterStore.clearSelections();
};

// カスタムアイテムを追加/更新
const handleAddCustomItem = (
  item: Asset | Equipment | Item | Skill,
  type: 'equipment' | 'item' | 'asset' | 'skill',
  replaceName?: string,
) => {
  const targetName = replaceName?.trim();

  switch (type) {
    case 'equipment':
      if (targetName) {
        characterStore.replaceEquipmentByName(item as Equipment, targetName);
      } else {
        characterStore.addEquipment(item as Equipment);
      }
      break;
    case 'item':
      if (targetName) {
        characterStore.replaceItemByName(item as Item, targetName);
      } else {
        characterStore.addItem(item as Item);
      }
      break;
    case 'asset':
      if (targetName) {
        characterStore.replaceAssetByName(item as Asset, targetName);
      } else {
        characterStore.addAsset(item as Asset);
      }
      break;
    case 'skill':
      if (targetName) {
        characterStore.replaceSkillByName(item as Skill, targetName);
      } else {
        characterStore.addSkill(item as Skill);
      }
      break;
  }

  customContentStore.updateEditingCustomItemName('');
};

// カスタムアイテムフォームに値を戻す
const handleEditCustomItem = (
  item: Asset | Equipment | Item | Skill,
  type: 'equipment' | 'item' | 'asset' | 'skill',
) => {
  customItemFormRef.value?.fillFormByItem(item, type);
  toastr.info(
    `カスタム${
      type === 'equipment' ? '装備' : type === 'item' ? '道具' : type === 'asset' ? '資産' : 'スキル'
    }「${item.name}」の値をフォームに戻しました`,
  );
};
</script>

<template>
  <div class="selections">
    <div class="selections-container">
      <!-- 上半分：選択領域 -->
      <div class="selection-area">
        <!-- 大分類タグ -->
        <CategoryTabs v-model="currentCategory" />

        <!-- 選択主体領域 - 汎用レイアウトコンポーネントを使用 -->
        <CategorySelectionLayout
          v-model="currentSubCategory"
          :categories="subCategories"
          :disabled-categories="getDisabledSkillCategories()"
          :category-name-formatter="getCategoryDisplayName"
          mobile-mode="select"
        >
          <!-- 品質フィルタ -->
          <template #filter>
            <RarityFilter v-model="currentRarity" />
          </template>

          <!-- アイテムリスト -->
          <template #content>
            <ItemList
              :items="currentItems"
              :selected-items="currentSelectedItems"
              @select="handleSelectItem"
              @deselect="handleDeselectItem"
            />
          </template>
        </CategorySelectionLayout>
      </div>

      <!-- カスタムアイテム領域 -->
      <div class="custom-area">
        <MoneyExchangeCard />
        <CustomItemForm ref="customItemFormRef" @add="handleAddCustomItem" />
      </div>

      <!-- 下半分：選択済みパネル -->
      <div class="summary-area">
        <SelectedPanel
          :equipments="characterStore.selectedEquipments"
          :items="characterStore.selectedItems"
          :assets="characterStore.selectedAssets"
          :skills="characterStore.selectedSkills"
          @remove="handleRemoveFromPanel"
          @edit-custom="handleEditCustomItem"
          @clear="handleClearAll"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.selections-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  max-width: 1600px;
  margin: 0 auto;
}

// 上半分：選択領域
.selection-area {
  display: flex;
  flex-direction: column;
}

.custom-area {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

// レスポンシブデザイン
@media (max-width: 768px) {
  .selections-container {
    gap: var(--spacing-md);
  }
}
</style>
