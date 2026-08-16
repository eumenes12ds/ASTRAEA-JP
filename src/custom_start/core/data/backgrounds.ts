import type { Background } from '../types';
import { loadCustomBackgrounds, mergeData } from '../utils/loader';

interface Backgrounds {
  [key: string]: Background[];
}

/**
 * 初期背景
 */
const Backgrounds: Backgrounds = {
  共通開始: [
    {
      name: '【カスタム開始】',
      description: '自由に想像力を働かせて、自分だけのキャラクターの初期背景を作り上げよう。',
    },
  ],
};

// カスタム初期シナリオデータを読み込んでマージ
let mergedBackgroundsData: Backgrounds | null = null;

/**
 * 初期シナリオデータを初期化（カスタムデータを読み込んでマージ）
 */
async function initializeBackgrounds() {
  const customData = await loadCustomBackgrounds();
  mergedBackgroundsData = mergeData(Backgrounds, customData) as Backgrounds;
}

/**
 * 初期シナリオデータを取得
 */
export function getBackgrounds(): Backgrounds {
  return mergedBackgroundsData || Backgrounds;
}

initializeBackgrounds();
