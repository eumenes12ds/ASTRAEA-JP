import JSON5 from 'json5';
import type { Asset, Background, BaseInfoData, Equipment, Item, Partner, Skill } from '../types';

/**
 * データの基本パス - CDN デプロイ環境
 * @latest の代わりにバージョン番号を使用してキャッシュの更新を確実にする
 */
const DATA_BASE_PATH = `https://testingcf.jsdelivr.net/gh/eumenes12ds/ASTRAEA-JP@v${__APP_VERSION__}/public/assets/data`;

/**
 * 汎用データ読み込み関数
 * JSON5 で解析し、コメントやより柔軟な形式に対応
 */
async function loadJsonData<T>(filename: string, dataName: string): Promise<T> {
  try {
    const response = await fetch(`${DATA_BASE_PATH}/${filename}`);
    if (!response.ok) {
      console.log(`カスタムデータファイルが見つかりません (${filename})`);
      return {} as T;
    }

    const text = await response.text();
    const data = JSON5.parse(text);
    console.log(`カスタム${dataName}データの読み込みに成功`);
    return data;
  } catch (error) {
    console.log(`カスタム${dataName}データが見つからないか、形式が不正です:`, error);
    return {} as T;
  }
}

/**
 * カスタム装備データを読み込み
 * public/assets/data ディレクトリからユーザー定義の装備データを読み込む
 */
export async function loadCustomEquipments(): Promise<Record<string, Equipment[]>> {
  return loadJsonData<Record<string, Equipment[]>>('equipments.json', '装備');
}

/**
 * カスタム道具データを読み込み
 * public/assets/data ディレクトリからユーザー定義の道具データを読み込む
 */
export async function loadCustomItems(): Promise<Record<string, Item[]>> {
  return loadJsonData<Record<string, Item[]>>('items.json', '道具');
}

/** カスタム資産データを読み込み */
export async function loadCustomAssets(): Promise<Record<string, Asset[]>> {
  return loadJsonData<Record<string, Asset[]>>('assets.json', '資産');
}

/**
 * カスタムスキルデータを読み込み
 * public/assets/data ディレクトリからユーザー定義のスキルデータを読み込む
 */
export async function loadCustomSkills(): Promise<Record<string, Skill[]>> {
  return loadJsonData<Record<string, Skill[]>>('skills.json', 'スキル');
}

/**
 * カスタム初期シナリオデータを読み込み
 * public/assets/data ディレクトリからユーザー定義の初期シナリオデータを読み込む
 */
export async function loadCustomBackgrounds(): Promise<Record<string, Background[]>> {
  return loadJsonData<Record<string, Background[]>>('backgrounds.json', '初期シナリオ');
}

/**
 * カスタムパートナーデータを読み込み
 * public/assets/data ディレクトリからユーザー定義のパートナーデータを読み込む
 */
export async function loadCustomPartners(): Promise<Record<string, Partner[]>> {
  return loadJsonData<Record<string, Partner[]>>('partners.json', 'パートナー');
}

/**
 * 基礎情報データを読み込み（性別、種族、身分、初期場所）
 */
export async function loadBaseInfo(): Promise<BaseInfoData> {
  return loadJsonData<BaseInfoData>('baseInfo.json', '基礎情報');
}

/**
 * 組み込みデータとカスタムデータをマージ
 * @param builtinData 組み込みデータ
 * @param customData カスタムデータ
 * @returns マージ後のデータ
 */
export function mergeData<T>(
  builtinData: Record<string, T[]>,
  customData: Record<string, T[]>,
): Record<string, T[]> {
  return _.mergeWith({}, builtinData, customData, (objValue, srcValue) => {
    if (_.isArray(objValue)) return [...objValue, ...srcValue];
  });
}
