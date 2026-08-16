import type { Item } from '../types';
import { loadCustomItems, mergeData } from '../utils/loader';

interface ItemData {
  [key: string]: Item[];
}

/**
 * 初期アイテム
 */

export const InitialItems: ItemData = {};

// カスタム道具データを読み込んでマージ
let mergedItemsData: ItemData | null = null;

/**
 * 道具データを初期化（カスタムデータを読み込んでマージ）
 */
async function initializeItems() {
  const customData = await loadCustomItems();
  mergedItemsData = mergeData(InitialItems, customData) as ItemData;
}

/**
 * マージ後の道具データを取得
 */
export function getInitialItems(): ItemData {
  return mergedItemsData || InitialItems;
}

// 自動初期化
initializeItems();
