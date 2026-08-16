/**
 * Cost 計算ツール
 * 品質レベルに応じて合理的な cost 値を自動計算する
 * プレイヤーが自由に変更してバランスが崩れるのを防ぐ
 */

import type { Rarity } from '../types';

/**
 * 品質に対応する Cost 範囲の設定
 */
export const RARITY_COST_RANGES: Record<Rarity, { min: number; max: number }> = {
  common: { min: 5, max: 30 },
  uncommon: { min: 20, max: 60 },
  rare: { min: 35, max: 100 },
  epic: { min: 80, max: 200 },
  legendary: { min: 150, max: 400 },
  mythic: { min: 300, max: 1000 },
  only: { min: 666, max: 666 }, // ユニーク品質、固定値 666
};

/**
 * 品質とその品質内での位置から Cost を計算
 * @param rarity 品質レベル
 * @param position その品質内での位置 (0-1)。0 は最低値、1 は最高値
 * @returns 計算後の cost 値
 */
export function calculateCostByPosition(rarity: Rarity, position: number = 0.5): number {
  const range = RARITY_COST_RANGES[rarity];
  const cost = range.min + (range.max - range.min) * position;
  return Math.round(cost);
}

/**
 * パートナーの総階層数（固定 7）
 */
export const DESTINED_TOTAL_TIERS = 7;

/**
 * パートナー Cost 範囲
 */
const DESTINED_COST_VALUES = [100, 213, 456, 2678, 4642, 8318, 9999];

/**
 * パートナー階層 Cost の計算
 * @param currentTier 現在の階層（1-7）
 * @returns その階層に対応する cost 値
 */
export function calculateDestinedCost(currentTier: number): number {
  if (currentTier < 1 || currentTier > DESTINED_TOTAL_TIERS) {
    throw new Error(`階層は 1 から ${DESTINED_TOTAL_TIERS} の間でなければなりません`);
  }

  return DESTINED_COST_VALUES[currentTier - 1];
}

/**
 * パートナーの全 7 階層の Cost 配列を生成
 * @returns Cost 配列
 */
export function getDestinedCostArray(): number[] {
  return [...DESTINED_COST_VALUES];
}

/**
 * Cost が品質範囲内かを検証
 * @param cost 検証する cost 値
 * @param rarity 品質レベル
 * @returns 合理的な範囲内かどうか
 */
export function validateCost(cost: number, rarity: Rarity): boolean {
  const range = RARITY_COST_RANGES[rarity];
  return cost >= range.min && cost <= range.max;
}

/**
 * 品質の Cost 範囲説明を取得
 * @param rarity 品質レベル
 * @returns Cost 範囲の文字列
 */
export function getCostRange(rarity: Rarity): string {
  const range = RARITY_COST_RANGES[rarity];
  return `${range.min}-${range.max}`;
}
