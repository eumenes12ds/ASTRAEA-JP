import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import {
  ATTRIBUTES,
  calculateAPByLevel,
  generateInitialPoints,
  getIdentityCosts,
  getRaceCosts,
  getTierAttributeBonus,
  INITIAL_REINCARNATION_POINTS,
  MAX_BASE_POINTS_PER_ATTR,
  MAX_BASE_POINTS_TOTAL,
} from '../data/base-info';
import { getSkills } from '../data/skills';
import type {
  Asset,
  Attributes,
  Background,
  CharacterConfig,
  Equipment,
  Item,
  Partner,
  Skill,
} from '../types';

// デフォルト身分を取得（"平民"を含む最初の値をあいまいマッチ）
const getDefaultIdentity = () =>
  _.find(_.keys(getIdentityCosts.value), id => _.includes(id, '平民')) || '';

export const useCharacterStore = defineStore('character', () => {
  // State
  const character = ref<Omit<CharacterConfig, 'attributes'>>({
    name: '',
    gender: '男',
    customGender: '',
    age: 18,
    race: '人間',
    customRace: '',
    identity: getDefaultIdentity(),
    customIdentity: '',
    startLocation: 'アスタリア大陸南東部地域-ソレンティス王国',
    customStartLocation: '',
    level: 1,
    basePoints: {
      筋力: 0,
      敏捷: 0,
      耐久: 0,
      知力: 0,
      精神: 0,
    },
    attributePoints: {
      筋力: 0,
      敏捷: 0,
      耐久: 0,
      知力: 0,
      精神: 0,
    },
    reincarnationPoints: INITIAL_REINCARNATION_POINTS, // 転生ポイント
    destinyPoints: 0, // 運命ポイント
    money: 0,
  });

  // 選択した装備・道具・資産・スキル
  const selectedEquipments = ref<Equipment[]>([]);
  const selectedItems = ref<Item[]>([]);
  const selectedAssets = ref<Asset[]>([]);
  const selectedSkills = ref<Skill[]>([]);

  // 選択したパートナーと背景
  const selectedPartners = ref<Partner[]>([]);
  const selectedBackground = ref<Background | null>(null);

  // Computed

  /**
   * 現在のコストで消費する転生ポイントを計算
   */
  const consumedPoints = computed(() => {
    return _.sum([
      // 種族コスト
      _.get(getRaceCosts.value, character.value.race, 0),
      // 身分コスト
      _.get(getIdentityCosts.value, character.value.identity, 0),
      // 属性加点コスト (1ポイントにつき転生ポイント1)
      usedAP.value,
      // 装備コスト
      _.sumBy(selectedEquipments.value, 'cost'),
      // 道具コスト
      _.sumBy(selectedItems.value, 'cost'),
      // 資産コスト
      _.sumBy(selectedAssets.value, 'cost'),
      // スキルコスト
      _.sumBy(selectedSkills.value, 'cost'),
      // パートナーコスト
      _.sumBy(selectedPartners.value, 'cost'),
      // 金銭変換コスト (1:100)
      Math.ceil(character.value.money / 100),
      // 運命ポイント変換コスト (1:2)
      Math.ceil(character.value.destinyPoints / 2),
    ]);
  });

  // Actions

  const updateCharacterField = (field: keyof CharacterConfig, value: unknown) => {
    character.value[field] = value as never;
  };

  const updateAttribute = (attr: keyof Attributes, points: number) => {
    character.value.attributePoints[attr] = Math.max(0, points);
  };

  // 基礎ポイント操作
  const addBasePoint = (attr: keyof Attributes) => {
    if (remainingBP.value > 0 && character.value.basePoints[attr] < MAX_BASE_POINTS_PER_ATTR) {
      character.value.basePoints[attr]++;
    }
  };

  const removeBasePoint = (attr: keyof Attributes) => {
    if (character.value.basePoints[attr] > 0) {
      character.value.basePoints[attr]--;
    }
  };

  // 追加ポイント操作
  const addAttributePoint = (attr: keyof Attributes) => {
    if (remainingAP.value > 0) {
      character.value.attributePoints[attr]++;
    }
  };

  const removeAttributePoint = (attr: keyof Attributes) => {
    if (character.value.attributePoints[attr] > 0) {
      character.value.attributePoints[attr]--;
    }
  };

  const rollInitialPoints = () => {
    const newPoints = generateInitialPoints(character.value.name);
    character.value.reincarnationPoints = newPoints;
    return newPoints;
  };

  const resetCharacter = () => {
    character.value = {
      name: '',
      gender: '男',
      customGender: '',
      age: 18,
      race: '人間',
      customRace: '',
      identity: getDefaultIdentity(),
      customIdentity: '',
      startLocation: 'アスタリア大陸南東部地域-ソレンティス王国',
      customStartLocation: '',
      level: 1,
      basePoints: {
        筋力: 0,
        敏捷: 0,
        耐久: 0,
        知力: 0,
        精神: 0,
      },
      attributePoints: {
        筋力: 0,
        敏捷: 0,
        耐久: 0,
        知力: 0,
        精神: 0,
      },
      reincarnationPoints: INITIAL_REINCARNATION_POINTS,
      destinyPoints: 0,
      money: 0,
    };
  };

  // 装備・道具・スキル関連の操作
  const addEquipment = (equipment: Equipment) => {
    selectedEquipments.value.push(equipment);
  };

  const removeEquipment = (equipment: Equipment) => {
    _.remove(selectedEquipments.value, e => e.name === equipment.name);
  };

  const replaceEquipmentByName = (equipment: Equipment, targetName: string) => {
    _.remove(selectedEquipments.value, e => e.name === targetName);
    selectedEquipments.value.push(equipment);
  };

  const addItem = (item: Item) => {
    selectedItems.value.push(item);
  };

  const removeItem = (item: Item) => {
    _.remove(selectedItems.value, i => i.name === item.name);
  };

  const replaceItemByName = (item: Item, targetName: string) => {
    _.remove(selectedItems.value, i => i.name === targetName);
    selectedItems.value.push(item);
  };

  const addAsset = (asset: Asset) => {
    selectedAssets.value.push(asset);
  };

  const removeAsset = (asset: Asset) => {
    _.remove(selectedAssets.value, item => item.name === asset.name);
  };

  const replaceAssetByName = (asset: Asset, targetName: string) => {
    _.remove(selectedAssets.value, item => item.name === targetName);
    selectedAssets.value.push(asset);
  };

  const addSkill = (skill: Skill) => {
    selectedSkills.value.push(skill);
  };

  const removeSkill = (skill: Skill) => {
    _.remove(selectedSkills.value, s => s.name === skill.name);
  };

  const replaceSkillByName = (skill: Skill, targetName: string) => {
    _.remove(selectedSkills.value, s => s.name === targetName);
    selectedSkills.value.push(skill);
  };

  const clearSelections = () => {
    selectedEquipments.value = [];
    selectedItems.value = [];
    selectedAssets.value = [];
    selectedSkills.value = [];
  };

  // パートナーをクリア
  const clearPartners = () => {
    selectedPartners.value = [];
  };

  // すべての選択をクリア（装備・道具・スキル・パートナー・背景を含む）
  const clearAllSelections = () => {
    selectedEquipments.value = [];
    selectedItems.value = [];
    selectedAssets.value = [];
    selectedSkills.value = [];
    selectedPartners.value = [];
    selectedBackground.value = null;
  };

  // パートナー関連の操作
  const addPartner = (partner: Partner) => {
    selectedPartners.value.push(partner);
  };

  const removePartner = (partner: Partner) => {
    _.remove(selectedPartners.value, p => p.name === partner.name);
  };

  const replacePartnerByName = (partner: Partner, targetName: string) => {
    _.remove(selectedPartners.value, p => p.name === targetName);
    selectedPartners.value.push(partner);
  };

  // 背景関連の操作
  const setBackground = (background: Background | null) => {
    selectedBackground.value = background;
  };

  // 運命ポイントのリセット
  const resetDestinyExchange = () => {
    character.value.destinyPoints = 0;
  };

  // 基礎ポイント関連の計算
  const usedBP = computed(() => _.sum(_.values(character.value.basePoints)));
  const maxBP = computed(() => MAX_BASE_POINTS_TOTAL);
  const remainingBP = computed(() => maxBP.value - usedBP.value);

  // 追加ポイント関連の計算
  const usedAP = computed(() => _.sum(_.values(character.value.attributePoints)));
  const maxAP = computed(() => calculateAPByLevel(character.value.level));
  const remainingAP = computed(() => maxAP.value - usedAP.value);

  // 最終属性の計算
  const finalAttributes = computed(() => {
    const tierBonus = getTierAttributeBonus(character.value.level);
    return _.fromPairs(
      _.map(ATTRIBUTES, attr => [
        attr,
        character.value.basePoints[attr] + tierBonus + character.value.attributePoints[attr],
      ]),
    ) as unknown as Attributes;
  });

  // レベルの変化を監視し、属性ポイントの配分を自動リセット
  // flush: 'sync' で watcher を同期実行し、プリセット適用時に属性ポイントが非同期でクリアされるのを防ぐ
  watch(
    () => character.value.level,
    () => {
      // レベル変化時は追加ポイントの配分のみリセット（基礎ポイントはレベルに影響されない）
      character.value.attributePoints = {
        筋力: 0,
        敏捷: 0,
        耐久: 0,
        知力: 0,
        精神: 0,
      };
    },
    { flush: 'sync' },
  );

  // 種族の変化を監視し、新しい種族の要件を満たさないスキルを削除
  watch(
    () => [character.value.race, character.value.customRace],
    () => {
      // 現在の種族を取得（カスタム種族を含む）
      const currentRace =
        character.value.race === 'カスタム' ? character.value.customRace : character.value.race;

      // すべての種族リストを取得（"カスタム"を除外）
      const raceSpecificCategories = _.without(_.keys(getRaceCosts.value), 'カスタム');

      // スキルデータを取得
      const skillGroups = getSkills();

      // スキルが属する分類を探す補助関数
      const findSkillCategory = (skillName: string): string => {
        return _.findKey(skillGroups, skills => _.some(skills, s => s.name === skillName)) || '';
      };

      // 現在の種族の要件を満たさないスキルを削除
      _.remove(selectedSkills.value, skill => {
        const skillCategory = findSkillCategory(skill.name);
        return _.includes(raceSpecificCategories, skillCategory) && skillCategory !== currentRace;
      });
    },
    { deep: true },
  );

  // 身分データの読み込み完了を監視し、デフォルト身分を更新
  watch(
    getIdentityCosts,
    newCosts => {
      if (!character.value.identity && !_.isEmpty(newCosts)) {
        character.value.identity = getDefaultIdentity();
      }
    },
    { immediate: true },
  );

  return {
    character,
    consumedPoints,
    selectedEquipments,
    selectedItems,
    selectedAssets,
    selectedSkills,
    selectedPartners,
    selectedBackground,

    usedBP,
    maxBP,
    remainingBP,
    usedAP,
    maxAP,
    remainingAP,
    finalAttributes,

    updateCharacterField,
    updateAttribute,
    addBasePoint,
    removeBasePoint,
    addAttributePoint,
    removeAttributePoint,
    rollInitialPoints,
    resetCharacter,
    addEquipment,
    removeEquipment,
    replaceEquipmentByName,
    addItem,
    removeItem,
    replaceItemByName,
    addAsset,
    removeAsset,
    replaceAssetByName,
    addSkill,
    removeSkill,
    replaceSkillByName,
    clearSelections,
    clearPartners,
    clearAllSelections,
    addPartner,
    removePartner,
    replacePartnerByName,
    setBackground,
    resetDestinyExchange,
  };
});
