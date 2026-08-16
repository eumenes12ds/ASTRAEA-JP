import { Skill } from '../types';
import { loadCustomSkills, mergeData } from '../utils/loader';

/**
 * 初期スキル
 */
interface Skills {
  [key: string]: Skill[];
}

export const SkillGroups: Skills = {};

// カスタムスキルデータを読み込んでマージ
let mergedSkillsData: Skills | null = null;

/**
 * スキルデータを初期化（カスタムデータを読み込んでマージ）
 */
async function initializeSkills() {
  const customData = await loadCustomSkills();
  mergedSkillsData = mergeData(SkillGroups, customData);
}

/**
 * マージ後のスキルデータを取得
 */
export function getSkills(): Skills {
  return mergedSkillsData || SkillGroups;
}

// 自動初期化
initializeSkills();
