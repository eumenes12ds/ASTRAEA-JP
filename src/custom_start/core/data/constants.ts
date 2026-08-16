import type { Rarity } from '../types';

// レア度マッピング
export const RARITY_MAP: Record<string, string> = {
  only: 'ユニーク',
  common: 'ノーマル',
  uncommon: 'アンコモン',
  rare: 'レア',
  epic: 'エピック',
  legendary: 'レジェンド',
  mythic: 'ミシック',
};

// 背景タイプマッピング
export const BACKGROUND_TYPE_MAP: Record<string, string> = {
  general: '汎用背景',
  race: '種族限定',
  location: '地域限定',
};

// レア度の優先順位（ソート用）
export const RARITY_PRIORITY: Record<Rarity, number> = {
  only: -1,
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
};
