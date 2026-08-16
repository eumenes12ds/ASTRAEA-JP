import type { Equipment } from '../types';
import { loadCustomEquipments, mergeData } from '../utils/loader';

interface EquipmentData {
  [key: string]: Equipment[];
}

/**
 * 初期装備データ
 */
const Equipments: EquipmentData = {};

// カスタム装備データを読み込んでマージ
let mergedEquipmentsData: EquipmentData | null = null;

/**
 * 装備データを初期化（カスタムデータを読み込んでマージ）
 */
async function initializeEquipments() {
  const customData = await loadCustomEquipments();
  const merged = mergeData(Equipments, customData) as EquipmentData;

  mergedEquipmentsData = merged;
}

/**
 * マージ後の装備データを取得
 */
export function getEquipments(): EquipmentData {
  return mergedEquipmentsData || Equipments;
}

// 自動初期化
initializeEquipments();
