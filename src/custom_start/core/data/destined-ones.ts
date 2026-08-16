import { Partner } from '../types';
import { loadCustomPartners, mergeData } from '../utils/loader';

interface Partners {
  [key: string]: Partner[];
}

/**
 * 初期パートナーオブジェクト
 */
const DefaultPartners: Partners = {};

// カスタム初期パートナーデータを読み込んでマージ
let mergedPartners: Partners | null = null;

// パートナーデータを初期化（カスタムデータを読み込んでマージ）
async function initPartnersData(): Promise<void> {
  const customPartners = await loadCustomPartners();
  mergedPartners = mergeData(DefaultPartners, customPartners) as Partners;
}

// すべてのパートナーデータを取得
export function getAllPartners(): Partners {
  return mergedPartners || DefaultPartners;
}

initPartnersData();
