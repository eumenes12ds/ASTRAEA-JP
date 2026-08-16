import { klona } from 'klona';
import type { Asset, Background, CharacterConfig, Equipment, Item, Partner, Skill } from '../types';

/**
 * プリセットのデータ構造
 */
export interface CharacterPreset {
  /** プリセット名 */
  name: string;
  /** 作成タイムスタンプ */
  createdAt: number;
  /** 更新タイムスタンプ */
  updatedAt: number;
  /** キャラクター設定 */
  character: Omit<CharacterConfig, 'attributes'>;
  /** 選択した装備リスト */
  equipments: Equipment[];
  /** 選択した道具リスト */
  items: Item[];
  /** 選択した資産リスト */
  assets?: Asset[];
  /** 選択したスキルリスト */
  skills: Skill[];
  /** 選択したパートナーリスト */
  partners: Partner[];
  /** 選択した背景 */
  background: Background | null;
}

/**
 * プリセットの保存構造
 */
interface PresetStorage {
  /** プリセットリスト */
  presets: CharacterPreset[];
  /** 前回使用したプリセット名 */
  lastUsedPreset?: string;
}

/** キャラクターカード変数にプリセットを保存するキー名 */
const PRESET_STORAGE_KEY = 'start_presets';

/**
 * プリセット保存データを取得
 * キャラクターカード変数から読み取る
 */
export function getPresetStorage(): PresetStorage {
  try {
    const variables = getVariables({ type: 'character' });
    const storage = _.get(variables, PRESET_STORAGE_KEY) as PresetStorage | undefined;

    if (storage && _.isArray(storage.presets)) {
      return storage;
    }
  } catch (error) {
    console.warn('プリセット保存データの読み取りに失敗。空の保存データを返します:', error);
  }

  return { presets: [] };
}

/**
 * プリセット保存データを保存
 * キャラクターカード変数に書き込む
 */
export function savePresetStorage(storage: PresetStorage): void {
  try {
    insertOrAssignVariables({ [PRESET_STORAGE_KEY]: storage }, { type: 'character' });
    console.log('✅ プリセット保存データがキャラクターカード変数に保存されました');
  } catch (error) {
    console.error('プリセット保存データの保存に失敗:', error);
    throw error;
  }
}

/**
 * すべてのプリセットリストを取得
 * _.orderBy で更新時間の降順に並べる
 */
export function listPresets(): CharacterPreset[] {
  const storage = getPresetStorage();
  return _.orderBy(storage.presets, ['updatedAt'], ['desc']);
}

/**
 * プリセットが存在するか確認
 * _.isEmpty で確認
 */
export function hasPresets(): boolean {
  const storage = getPresetStorage();
  return !_.isEmpty(storage.presets);
}

/**
 * 指定した名前のプリセットを取得
 * _.find で検索
 */
export function getPreset(name: string): CharacterPreset | undefined {
  const storage = getPresetStorage();
  return _.find(storage.presets, { name });
}

/**
 * プリセット名が既に存在するか確認
 * _.some で確認
 */
export function isPresetNameExists(name: string): boolean {
  const storage = getPresetStorage();
  return _.some(storage.presets, { name });
}

/**
 * 新規プリセットを保存、または既存プリセットを更新
 * _.findIndex でインデックスを検索
 * @param preset プリセットデータ
 * @param overwrite 既存プリセットがあれば上書きするか
 * @returns 保存に成功したかどうか
 */
export function savePreset(preset: CharacterPreset, overwrite = false): boolean {
  const storage = getPresetStorage();
  const existingIndex = _.findIndex(storage.presets, { name: preset.name });

  if (existingIndex !== -1) {
    if (!overwrite) {
      toastr.warning(`プリセット「${preset.name}」は既に存在します`);
      return false;
    }
    // 既存プリセットを更新
    storage.presets[existingIndex] = {
      ...preset,
      updatedAt: Date.now(),
    };
    toastr.success(`プリセット「${preset.name}」を更新しました`);
  } else {
    // 新規プリセットを追加
    storage.presets.push({
      ...preset,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    toastr.success(`プリセット「${preset.name}」を保存しました`);
  }

  storage.lastUsedPreset = preset.name;
  savePresetStorage(storage);
  return true;
}

/**
 * プリセットを削除
 * _.remove で要素を削除
 * @param name プリセット名
 * @returns 削除に成功したかどうか
 */
export function deletePreset(name: string): boolean {
  const storage = getPresetStorage();
  const removed = _.remove(storage.presets, { name });

  if (!_.isEmpty(removed)) {
    // 削除したのが前回使用したプリセットなら記録を消す
    if (storage.lastUsedPreset === name) {
      storage.lastUsedPreset = undefined;
    }
    savePresetStorage(storage);
    toastr.info(`プリセット「${name}」を削除しました`);
    return true;
  }

  toastr.error(`プリセット「${name}」は存在しません`);
  return false;
}

/**
 * 前回使用したプリセット名を取得
 */
export function getLastUsedPresetName(): string | undefined {
  const storage = getPresetStorage();
  return storage.lastUsedPreset;
}

/**
 * 前回使用したプリセット名を設定
 */
export function setLastUsedPresetName(name: string): void {
  const storage = getPresetStorage();
  storage.lastUsedPreset = name;
  savePresetStorage(storage);
}

/**
 * store からプリセットデータを作成
 * @param name プリセット名
 * @param characterStore キャラクター store インスタンス
 */
export function createPresetFromStore(
  name: string,
  characterStore: {
    character: Omit<CharacterConfig, 'attributes'>;
    selectedEquipments: Equipment[];
    selectedItems: Item[];
    selectedAssets: Asset[];
    selectedSkills: Skill[];
    selectedPartners: Partner[];
    selectedBackground: Background | null;
  },
): CharacterPreset {
  const now = Date.now();

  return {
    name,
    createdAt: now,
    updatedAt: now,
    character: klona(characterStore.character),
    equipments: klona(characterStore.selectedEquipments),
    items: klona(characterStore.selectedItems),
    assets: klona(characterStore.selectedAssets),
    skills: klona(characterStore.selectedSkills),
    partners: klona(characterStore.selectedPartners),
    background: klona(characterStore.selectedBackground),
  };
}

/** プリセット適用用のキャラクター設定フィールドリスト */
const CharacterFields = [
  'name',
  'gender',
  'customGender',
  'age',
  'race',
  'customRace',
  'identity',
  'customIdentity',
  'startLocation',
  'customStartLocation',
  'level',
  'basePoints',
  'attributePoints',
  'reincarnationPoints',
  'destinyPoints',
  'money',
] as const;

/** 空の属性ポイントテンプレート */
const EmptyAttrPoints = { 筋力: 0, 敏捷: 0, 耐久: 0, 知力: 0, 精神: 0 };

/** 旧版の追加ポイント計算が新版より多く計上する基礎値 */
const OldBaseAPOffset = 5;
/** 属性キーリスト */
const AttrKeys = ['筋力', '敏捷', '耐久', '知力', '精神'] as const;

/**
 * 旧版プリセットデータとの互換処理
 *
 * 移行方針：旧 attributePoints から合計5点を差し引く（各項目1点ずつ、足りない場合は0まで）、
 * basePoints は全ゼロで初期化し、プレイヤーが再配分する
 */
function migratePresetCharacter(char: Record<string, unknown>): Record<string, unknown> {
  if (!('basePoints' in char)) {
    // 旧 attributePoints から多く計上された5点を差し引く
    const oldAttr = char.attributePoints as Record<string, number> | undefined;
    if (oldAttr) {
      let remaining = OldBaseAPOffset;
      const newAttr = { ...oldAttr };

      // 各属性から1点ずつ差し引く（循環して差し引き、公平を保つ）
      for (const key of AttrKeys) {
        if (remaining <= 0) break;
        const deduct = Math.min(newAttr[key] || 0, 1);
        newAttr[key] = (newAttr[key] || 0) - deduct;
        remaining -= deduct;
      }

      // まだ残りがある場合（一部の属性が0）、余裕のある属性から引き続き差し引く
      for (const key of AttrKeys) {
        if (remaining <= 0) break;
        const deduct = Math.min(newAttr[key] || 0, remaining);
        newAttr[key] = (newAttr[key] || 0) - deduct;
        remaining -= deduct;
      }

      return { ...char, attributePoints: newAttr, basePoints: { ...EmptyAttrPoints } };
    }

    return { ...char, basePoints: { ...EmptyAttrPoints } };
  }
  return char;
}

/**
 * プリセットデータを store に適用
 * _.forEach でループを簡略化
 * @param preset プリセットデータ
 * @param characterStore キャラクター store インスタンス（各種 setter メソッドを含む）
 */
export function applyPresetToStore(
  preset: CharacterPreset,
  characterStore: {
    character: Omit<CharacterConfig, 'attributes'>;
    resetCharacter: () => void;
    updateCharacterField: (field: keyof CharacterConfig, value: unknown) => void;
    clearAllSelections: () => void;
    addEquipment: (equipment: Equipment) => void;
    addItem: (item: Item) => void;
    addAsset: (asset: Asset) => void;
    addSkill: (skill: Skill) => void;
    addPartner: (partner: Partner) => void;
    setBackground: (background: Background | null) => void;
  },
): void {
  // 1. キャラクターデータとすべての選択（パートナー・背景を含む）をリセット
  characterStore.resetCharacter();
  characterStore.clearAllSelections();

  // 2. 旧プリセット互換：basePoints のデフォルト値を補完
  const migratedCharacter = migratePresetCharacter(
    preset.character as unknown as Record<string, unknown>,
  );

  // 3. キャラクター基本情報を適用
  _.forEach(CharacterFields, field => {
    if (_.has(migratedCharacter, field)) {
      characterStore.updateCharacterField(
        field as keyof CharacterConfig,
        _.get(migratedCharacter, field),
      );
    }
  });

  // 3. 装備・道具・資産・スキル・パートナーを適用
  _.forEach(preset.equipments, eq => characterStore.addEquipment(eq));
  _.forEach(preset.items, item => characterStore.addItem(item));
  _.forEach(preset.assets ?? [], asset => characterStore.addAsset(asset));
  _.forEach(preset.skills, skill => characterStore.addSkill(skill));
  _.forEach(preset.partners, partner => characterStore.addPartner(partner));

  // 4. 背景を適用
  characterStore.setBackground(preset.background);

  toastr.success(`プリセット「${preset.name}」を読み込みました`);
}

/**
 * プリセットの作成時間を読みやすい文字列に整形
 */
export function formatPresetTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** 除外する動的フィールド */
const DynamicFields = ['createdAt', 'updatedAt'];

/**
 * 現在の store データとプリセットが一致するか比較
 * _.every と _.isEqual で深い比較を行う
 * @param preset プリセットデータ
 * @param characterStore キャラクター store インスタンス
 * @returns 一致するかどうか
 */
export function isStoreMatchingPreset(
  preset: CharacterPreset,
  characterStore: {
    character: Omit<CharacterConfig, 'attributes'>;
    selectedEquipments: Equipment[];
    selectedItems: Item[];
    selectedAssets: Asset[];
    selectedSkills: Skill[];
    selectedPartners: Partner[];
    selectedBackground: Background | null;
  },
): boolean {
  // キャラクター基本情報を比較（タイムスタンプなどの動的フィールドを除外）
  const charToCompare = _.omit(characterStore.character, DynamicFields);
  const presetCharToCompare = _.omit(preset.character, DynamicFields);

  // _.every で複数の比較を簡略化
  return _.every([
    _.isEqual(charToCompare, presetCharToCompare),
    _.isEqual(characterStore.selectedEquipments, preset.equipments),
    _.isEqual(characterStore.selectedItems, preset.items),
    _.isEqual(characterStore.selectedAssets, preset.assets ?? []),
    _.isEqual(characterStore.selectedSkills, preset.skills),
    _.isEqual(characterStore.selectedPartners, preset.partners),
    _.isEqual(characterStore.selectedBackground, preset.background),
  ]);
}

/**
 * 現在の store データがいずれかのプリセットと一致するか確認
 * _.find で一致するプリセットを検索
 * @param characterStore キャラクター store インスタンス
 * @returns 一致したプリセット名。一致しなければ null
 */
export function findMatchingPreset(characterStore: {
  character: Omit<CharacterConfig, 'attributes'>;
  selectedEquipments: Equipment[];
  selectedItems: Item[];
  selectedAssets: Asset[];
  selectedSkills: Skill[];
  selectedPartners: Partner[];
  selectedBackground: Background | null;
}): string | null {
  const presets = listPresets();
  const matchingPreset = _.find(presets, preset => isStoreMatchingPreset(preset, characterStore));
  return matchingPreset?.name ?? null;
}

// インポート/エクスポート

/**
 * ブラウザでファイルのダウンロードを実行
 * @param content ファイル内容
 * @param fileName ファイル名
 */
function downloadFile(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 単一プリセットを JSON ファイルとしてエクスポート
 * CharacterPreset オブジェクトをそのままエクスポート
 * @param preset エクスポートするプリセット
 */
export function exportPreset(preset: CharacterPreset): void {
  const content = JSON.stringify(klona(preset), null, 2);
  const fileName = `destiny_${preset.name}.preset.json`;
  downloadFile(content, fileName);
  toastr.success(`プリセット「${preset.name}」をエクスポートしました`);
}

/**
 * すべてのプリセットを単一の JSON ファイルとしてエクスポート
 * CharacterPreset[] 配列をそのままエクスポート
 */
export function exportAllPresets(): void {
  const presets = listPresets();
  if (_.isEmpty(presets)) {
    toastr.warning('エクスポートできるプリセットがありません');
    return;
  }

  const content = JSON.stringify(klona(presets), null, 2);
  const date = new Date().toISOString().slice(0, 10);
  const fileName = `destiny_all_${date}.presets.json`;
  downloadFile(content, fileName);
  toastr.success(`${presets.length} 個のプリセットをエクスポートしました`);
}

/**
 * 単一のプリセットオブジェクトが必要な構造を持つか検証
 * 確認：ノーマルなオブジェクトか、name 文字列フィールドを含むか、character ノーマルオブジェクトフィールドを含むか
 */
function isValidPreset(value: unknown): value is CharacterPreset {
  if (!_.isPlainObject(value)) return false;
  const obj = value as Record<string, unknown>;
  return _.isString(obj.name) && _.isPlainObject(obj.character);
}

/**
 * インポートファイルのデータを解析
 * 2 種類の形式を自動認識：
 * - CharacterPreset オブジェクト（name + character を含む）→ 配列にラップ
 * - CharacterPreset[] 配列 → そのまま使用
 * @param data 解析済みの JSON データ
 * @returns プリセット配列、または null（解析失敗）
 */
export function parsePresetFile(data: unknown): CharacterPreset[] | null {
  // 形式1：単一プリセットオブジェクト
  if (isValidPreset(data)) {
    return [data];
  }

  // 形式2：プリセット配列
  if (_.isArray(data) && !_.isEmpty(data)) {
    if (_.every(data, isValidPreset)) {
      return data;
    }
    toastr.error('インポート失敗：配列内に形式が正しくないプリセットがあります');
    return null;
  }

  toastr.error(
    'インポート失敗：ファイル形式が正しくありません。プリセットオブジェクトまたはプリセット配列が必要です',
  );
  return null;
}

/**
 * ユーザーが選択したファイルの内容を読み取る
 * @returns ファイル内容の Promise
 */
export function readFileFromInput(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error('ファイルが選択されていません'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('ファイルの読み取りに失敗しました'));
      reader.readAsText(file);
    });

    // ユーザーが選択をキャンセル
    input.addEventListener('cancel', () => {
      reject(new Error('ユーザーがキャンセルしました'));
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });
}

/**
 * インポートプリセットのうち、既存プリセットと同名の数を集計
 */
export function countConflicts(presets: CharacterPreset[]): number {
  return _.filter(presets, preset => isPresetNameExists(preset.name)).length;
}

/**
 * プリセットを一括インポート
 * 保存を直接操作し、savePreset を個別に呼んで toastr が多重発生したり読み書きが重複したりするのを避ける
 * @param presets インポートするプリセットリスト
 * @param overwrite 同名プリセットを上書きするか
 * @returns インポート数とスキップ数
 */
export function importPresets(
  presets: CharacterPreset[],
  overwrite: boolean,
): { imported: number; skipped: number } {
  const storage = getPresetStorage();
  let imported = 0;
  let skipped = 0;

  _.forEach(presets, preset => {
    const existingIndex = _.findIndex(storage.presets, { name: preset.name });

    if (existingIndex !== -1) {
      if (!overwrite) {
        skipped++;
        return;
      }
      // 同名プリセットを上書き
      storage.presets[existingIndex] = {
        ...preset,
        updatedAt: Date.now(),
      };
    } else {
      // 新規プリセットを追加
      storage.presets.push({
        ...preset,
        createdAt: preset.createdAt || Date.now(),
        updatedAt: Date.now(),
      });
    }
    imported++;
  });

  if (imported > 0) {
    savePresetStorage(storage);
  }

  return { imported, skipped };
}
