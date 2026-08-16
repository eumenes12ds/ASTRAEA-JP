import { computed, ref } from 'vue';
import type { Attributes, BaseInfoData } from '../types';
import { convertLocationsToCascaderOptions } from '../utils/form-options';
import { loadBaseInfo } from '../utils/loader';

// リアクティブなデータ格納
const baseInfoData = ref<BaseInfoData>({});

// 初期化
loadBaseInfo().then(data => {
  baseInfoData.value = data;
});

// computed で結果をキャッシュし、新規参照の重複生成を回避
export const getGenders = computed(() => {
  const external = baseInfoData.value.genders || [];
  return [...external.filter(g => g !== 'カスタム'), 'カスタム'];
});

export const getRaceCosts = computed(() => {
  const external = baseInfoData.value.raceCosts || {};
  return { ...external, カスタム: 80 } as Record<string, number>;
});

export const getIdentityCosts = computed(() => {
  const external = baseInfoData.value.identityCosts || {};
  return { ...external, カスタム: 80 } as Record<string, number>;
});

export const getStartLocations = computed(() => {
  const external = baseInfoData.value.startLocations || [];
  return [...external.filter(l => l !== 'カスタム'), 'カスタム'];
});

// 開始場所のカスケード選択肢（ツリー構造）を取得
export const getStartLocationsCascader = computed(() => {
  const external = baseInfoData.value.startLocations || [];
  // "カスタム"を除外してツリー構造に変換
  const locations = external.filter(l => l !== 'カスタム');
  const cascaderOptions = convertLocationsToCascaderOptions(locations);
  // "カスタム"選択肢をルート階層に追加
  cascaderOptions.push({
    label: 'カスタム',
    value: 'カスタム',
  });
  return cascaderOptions;
});

/**
 * 開発者モードが有効かどうかを確認（名前の合言葉で判定）
 * 合言葉：名前に特定の文字列が含まれる
 */
const checkDevModeByName = (name: string): boolean => {
  // 合言葉
  const devPatterns = ['[dev]', '[test]'];
  const lowerName = name.toLowerCase();
  return devPatterns.some(pattern => lowerName.includes(pattern));
};

/**
 * ランダムな初期転生ポイントを生成
 * 範囲: 1000-10000
 * より良い加重ランダム
 * @param characterName 任意のキャラクター名。開発者モードの判定に使用
 */
export const generateInitialPoints = (characterName?: string): number => {
  // 開発者モード：名前が特定の合言葉を含む場合、高ポイントを返す
  if (characterName && checkDevModeByName(characterName)) {
    return 888888;
  }

  const random = Math.random();
  const weight = 3;
  const weightRandom = Math.pow(random, weight);

  const result = Math.floor(1000 + weightRandom * (10000 - 1000 + 1));

  return Math.min(result, 10000);
};

// 初期転生ポイント（デフォルト値）
export const INITIAL_REINCARNATION_POINTS = 1000;

// 属性リスト
export const ATTRIBUTES: (keyof Attributes)[] = ['筋力', '敏捷', '耐久', '知力', '精神'];

// レベル関連定数
export const MAX_LEVEL = 10;
export const MIN_LEVEL = 1;

// 基礎ポイント定数
/** 基礎ポイント合計上限 */
export const MAX_BASE_POINTS_TOTAL = 25;
/** 基礎ポイント単項上限 */
export const MAX_BASE_POINTS_PER_ATTR = 6;

/**
 * レベルに応じて使用可能な【追加】APポイントを計算
 * 追加ポイント合計 = レベル Lv - 1
 * @param level キャラクターレベル
 * @returns 自由に配分できる追加APポイント
 */
export const calculateAPByLevel = (level: number): number => {
  return Math.max(0, level - 1);
};

/**
 * レベルに対応する階層属性ポイントを取得
 * @param level キャラクターレベル
 * @returns 各属性に付与される階層ボーナス
 */
export const getTierAttributeBonus = (level: number): number => {
  if (level >= 1 && level <= 4) return 0;
  if (level >= 5 && level <= 8) return 1;
  if (level >= 9 && level <= 12) return 2;
  if (level >= 13 && level <= 16) return 3;
  if (level >= 17 && level <= 20) return 4;
  if (level >= 21 && level <= 24) return 5;
  if (level >= 25) return 6;
  return 0;
};

/**
 * レベルに対応する階層名を取得
 * @param level キャラクターレベル
 * @returns 階層名
 */
export const getLevelTierName = (level: number): string => {
  if (level >= 1 && level <= 4) return '第一階層';
  if (level >= 5 && level <= 8) return '第二階層';
  if (level >= 9 && level <= 12) return '第三階層';
  if (level >= 13 && level <= 16) return '第四階層';
  if (level >= 17 && level <= 20) return '第五階層';
  if (level >= 21 && level <= 24) return '第六階層';
  if (level >= 25) return '第七階層';
  return '未知の階層';
};
