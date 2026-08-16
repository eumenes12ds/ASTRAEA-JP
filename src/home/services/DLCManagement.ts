import { getFilteredEntries, getWorldBookName, updateWorldBook } from './worldbookload&update';

// ========================
// 統一された DLC タイプ定義
// ========================

/** DLC カテゴリ */
export type DLCCategory = 'キャラ' | 'イベント' | '拡張';

/** DLC エントリ（単一の世界書エントリ） */
export interface DLCEntry {
  name: string;
  enabled: boolean;
}

/** DLC 選択肢（グループ化された DLC 項目） */
export interface DLCOption {
  dlcKey: string; // グループキー。例: "[DLC][キャラ][ヴィヴィラ]"
  category: DLCCategory; // カテゴリ
  label: string; // 表示名。例: "薇薇拉"
  author: string; // 作者
  info: string; // 追加情報
  exclusionTargets: string[]; // 排他ターゲット [!xxx]
  replacementTargets: string[]; // 置換ターゲット [>xxx]
  prerequisiteTargets: string[]; // 前提条件ターゲット [<xxx]
  entries: DLCEntry[]; // この DLC 配下の全エントリ
  enabled: boolean; // 有効かどうか（全エントリが有効な場合に true）
}

/** DLC 切り替えの結果 */
export interface ToggleDLCResult {
  selections: Map<string, boolean>;
  success: boolean;
  error?: string;
  missingPrerequisites?: string[];
}

/** DLC 状態の初期値 */
export const initialDLCState = {
  dlcOptions: [] as DLCOption[],
  localSelections: new Map<string, boolean>(),
};

// ========================
// 正規表現
// ========================

/** すべての DLC エントリにマッチ - [DLC] で始まる */
const DLC_PATTERN = /^\[DLC\]/;

/** カテゴリを抽出 - [DLC][キャラ|イベント|拡張] */
const DLC_CATEGORY_PATTERN = /^\[DLC\]\[(キャラ|イベント|拡張)\]/;

/** グループキーを抽出 - [DLC][カテゴリ][名称]（関係マーカーを含まない） */
const DLC_KEY_PATTERN = /^(\[DLC\]\[(?:キャラ|イベント|拡張)\]\[[^\]]+\])/;

/** 表示名を抽出 - [DLC][カテゴリ][名称] の名称部分 */
const DLC_LABEL_PATTERN = /^\[DLC\]\[(?:キャラ|イベント|拡張)\]\[([^\]]+)\]/;

/** 排他ターゲット [!xxx] */
const EXCLUSION_PATTERN = /\[!([^\]]+)\]/g;

/** 置換ターゲット [>xxx] */
const REPLACEMENT_PATTERN = /\[>([^\]]+)\]/g;

/** 前提条件ターゲット [<xxx] */
const PREREQUISITE_PATTERN = /\[<([^\]]+)\]/g;

/** 作者情報 - 最後の括弧 */
const AUTHOR_PATTERN = /\(([^)]+)\)(?=[^()]*$)/;

// ========================
// ソート
// ========================

/**
 * ピンインの頭文字によるソート比較関数
 */
function pinyinCompare(a: string, b: string): number {
  return a.localeCompare(b, 'zh-CN', { sensitivity: 'base' });
}

/**
 * DLC の選択肢をソートする（label のピンイン頭文字順）
 */
export function sortDLCOptions(options: DLCOption[]): DLCOption[] {
  return [...options].sort((a, b) => pinyinCompare(a.label, b.label));
}

// ========================
// 解析関数
// ========================

/**
 * エントリ名からグループキーを抽出する
 * @param entryName 例: "[DLC][キャラ][ヴィヴィラ]ヴィヴィラ-本体(Author)"
 * @returns 例: "[DLC][キャラ][ヴィヴィラ]"。マッチしなければ null を返す
 */
function extractDLCKey(entryName: string): string | null {
  const match = entryName.match(DLC_KEY_PATTERN);
  return match ? match[1] : null;
}

/**
 * エントリ名からカテゴリを抽出する
 * @param entryName 例: "[DLC][キャラ][ヴィヴィラ]..."
 * @returns 例: "キャラ"。マッチしなければ null を返す
 */
function extractDLCCategory(entryName: string): DLCCategory | null {
  const match = entryName.match(DLC_CATEGORY_PATTERN);
  return match ? (match[1] as DLCCategory) : null;
}

/**
 * グループキーから表示名を抽出する
 * @param dlcKey 例: "[DLC][キャラ][ヴィヴィラ]"
 * @returns 例: "ヴィヴィラ"
 */
function extractDLCLabel(dlcKey: string): string {
  const match = dlcKey.match(DLC_LABEL_PATTERN);
  return match ? match[1] : dlcKey;
}

/**
 * エントリ名から指定パターンの全ターゲットを抽出する（汎用抽出器）
 */
function extractTargetsFromEntry(entryName: string, pattern: RegExp): string[] {
  const targets: string[] = [];
  const regex = new RegExp(pattern.source, 'g');
  let match;
  while ((match = regex.exec(entryName)) !== null) {
    targets.push(match[1]);
  }
  return targets;
}

/**
 * エントリ配列から全ターゲットを抽出して重複を除く（汎用マージ器）
 */
function extractTargetsFromEntries(entries: DLCEntry[], pattern: RegExp): string[] {
  const allTargets = new Set<string>();
  for (const entry of entries) {
    for (const target of extractTargetsFromEntry(entry.name, pattern)) {
      allTargets.add(target);
    }
  }
  return Array.from(allTargets);
}

/**
 * エントリ配列から作者と追加情報を抽出する
 */
function extractAuthorInfo(entries: DLCEntry[]): { author: string; info: string } {
  for (const entry of entries) {
    const match = entry.name.match(AUTHOR_PATTERN);
    if (match) {
      const authorInfo = match[1].trim();
      const dashIndex = authorInfo.indexOf('-');
      if (dashIndex > 0) {
        return {
          author: authorInfo.substring(0, dashIndex).trim(),
          info: authorInfo.substring(dashIndex + 1).trim(),
        };
      }
      return { author: authorInfo, info: '' };
    }
  }
  return { author: '', info: '' };
}

// ========================
// 読み込み
// ========================

/**
 * すべての DLC 選択肢を読み込む
 */
export async function loadDLCOptions(): Promise<{
  dlcOptions: DLCOption[];
  localSelections: Map<string, boolean>;
  bookName: string | null;
}> {
  const bookName = getWorldBookName();
  const entries = await getFilteredEntries(DLC_PATTERN, bookName);

  // dlcKey ごとにエントリをグループ化
  const groups = new Map<string, DLCEntry[]>();
  const categoryMap = new Map<string, DLCCategory>();

  for (const entry of entries as { name: string; enabled: boolean }[]) {
    const dlcKey = extractDLCKey(entry.name);
    if (!dlcKey) continue;

    const category = extractDLCCategory(entry.name);
    if (!category) continue;

    if (!groups.has(dlcKey)) {
      groups.set(dlcKey, []);
      categoryMap.set(dlcKey, category);
    }
    groups.get(dlcKey)!.push({
      name: entry.name,
      enabled: entry.enabled,
    });
  }

  // DLC 選択肢リストを構築
  const dlcOptions: DLCOption[] = [];
  for (const [dlcKey, groupEntries] of groups) {
    const allEnabled = groupEntries.every(e => e.enabled);
    const { author, info } = extractAuthorInfo(groupEntries);
    dlcOptions.push({
      dlcKey,
      category: categoryMap.get(dlcKey)!,
      label: extractDLCLabel(dlcKey),
      author,
      info,
      exclusionTargets: extractTargetsFromEntries(groupEntries, EXCLUSION_PATTERN),
      replacementTargets: extractTargetsFromEntries(groupEntries, REPLACEMENT_PATTERN),
      prerequisiteTargets: extractTargetsFromEntries(groupEntries, PREREQUISITE_PATTERN),
      entries: groupEntries,
      enabled: allEnabled,
    });
  }

  const sortedOptions = sortDLCOptions(dlcOptions);

  const localSelections = new Map(sortedOptions.map(dlc => [dlc.dlcKey, dlc.enabled]));

  return { dlcOptions: sortedOptions, localSelections, bookName };
}

// ========================
// 切り替え
// ========================

/**
 * 前提条件を満たしているか確認する（カテゴリ横断）
 */
function checkPrerequisites(
  dlcOptions: DLCOption[],
  localSelections: Map<string, boolean>,
  prerequisiteTargets: string[],
): { satisfied: boolean; missingPrerequisites: string[] } {
  const missingPrerequisites: string[] = [];

  for (const target of prerequisiteTargets) {
    // すべての DLC から [target] を含む項目を探す
    const prerequisiteDLC = dlcOptions.find(dlc => dlc.dlcKey.includes(`[${target}]`));
    if (prerequisiteDLC) {
      const isEnabled = localSelections.get(prerequisiteDLC.dlcKey) ?? false;
      if (!isEnabled) {
        missingPrerequisites.push(target);
      }
    } else {
      missingPrerequisites.push(target);
    }
  }

  return {
    satisfied: missingPrerequisites.length === 0,
    missingPrerequisites,
  };
}

/**
 * DLC の有効状態を切り替える（カテゴリ横断の関係処理）
 *
 * 3 種類の関係を処理する：
 * 1. 排他 [!xxx]：有効化時に [xxx] を含む DLC を無効化（カテゴリ横断）
 * 2. 置換 [>xxx]：有効化時に [xxx] を含むエントリを無効化（保存時に処理）
 * 3. 前提条件 [<xxx]：有効化時に [xxx] DLC が有効かどうかを確認（カテゴリ横断）
 */
export function toggleDLC(
  localSelections: Map<string, boolean>,
  dlcOptions: DLCOption[],
  dlcKey: string,
): ToggleDLCResult {
  const newSelections = new Map(localSelections);
  const currentEnabled = newSelections.get(dlcKey) ?? false;
  const newEnabled = !currentEnabled;

  const targetDLC = dlcOptions.find(dlc => dlc.dlcKey === dlcKey);

  // 有効化時に前提条件を確認
  if (newEnabled && targetDLC) {
    if (targetDLC.prerequisiteTargets.length > 0) {
      const { satisfied, missingPrerequisites } = checkPrerequisites(
        dlcOptions,
        newSelections,
        targetDLC.prerequisiteTargets,
      );

      if (!satisfied) {
        return {
          selections: localSelections,
          success: false,
          error: `前提条件が不足しています: ${missingPrerequisites.join(', ')}`,
          missingPrerequisites,
        };
      }
    }
  }

  newSelections.set(dlcKey, newEnabled);

  // 有効化時に排他ロジックを処理（カテゴリ横断）
  if (newEnabled && targetDLC) {
    for (const exclusionTarget of targetDLC.exclusionTargets) {
      for (const dlc of dlcOptions) {
        if (
          dlc.dlcKey !== dlcKey &&
          (dlc.label === exclusionTarget || dlc.dlcKey.includes(`[${exclusionTarget}]`))
        ) {
          newSelections.set(dlc.dlcKey, false);
        }
      }
    }
  }

  // 無効化時にこの DLC に依存する他の DLC を連鎖的に無効化（カテゴリ横断）
  if (!newEnabled && targetDLC) {
    for (const dlc of dlcOptions) {
      if (dlc.dlcKey !== dlcKey) {
        const isEnabled = newSelections.get(dlc.dlcKey) ?? false;
        if (isEnabled && dlc.prerequisiteTargets.includes(targetDLC.label)) {
          newSelections.set(dlc.dlcKey, false);
        }
      }
    }
  }

  return {
    selections: newSelections,
    success: true,
  };
}

// ========================
// 変更検出
// ========================

/**
 * ローカル選択が元の状態と変化しているか確認する
 */
export function hasDLCChanges(
  dlcOptions: DLCOption[],
  localSelections: Map<string, boolean>,
): boolean {
  for (const dlc of dlcOptions) {
    const localEnabled = localSelections.get(dlc.dlcKey) ?? false;
    if (localEnabled !== dlc.enabled) {
      return true;
    }
  }
  return false;
}

// ========================
// 保存
// ========================

/**
 * 有効化されたすべての DLC の排他ターゲットを収集する（無効化が必要なターゲット）
 */
function collectExclusionTargetsToDisable(
  dlcOptions: DLCOption[],
  localSelections: Map<string, boolean>,
): string[] {
  const targets: string[] = [];
  for (const dlc of dlcOptions) {
    const isEnabled = localSelections.get(dlc.dlcKey) ?? false;
    if (isEnabled && dlc.exclusionTargets.length > 0) {
      targets.push(...dlc.exclusionTargets);
    }
  }
  return [...new Set(targets)];
}

/**
 * 有効化されたすべての DLC の置換ターゲットを収集する（無効化が必要なエントリ）
 */
function collectReplacementTargetsToDisable(
  dlcOptions: DLCOption[],
  localSelections: Map<string, boolean>,
): string[] {
  const targets: string[] = [];
  for (const dlc of dlcOptions) {
    const isEnabled = localSelections.get(dlc.dlcKey) ?? false;
    if (isEnabled && dlc.replacementTargets.length > 0) {
      targets.push(...dlc.replacementTargets);
    }
  }
  return [...new Set(targets)];
}

/**
 * 無効化されたすべての DLC の置換ターゲットを収集する（再有効化が必要なエントリ）
 */
function collectReplacementTargetsToEnable(
  dlcOptions: DLCOption[],
  localSelections: Map<string, boolean>,
  originalStates: Map<string, boolean>,
): string[] {
  const targets: string[] = [];
  for (const dlc of dlcOptions) {
    const isEnabled = localSelections.get(dlc.dlcKey) ?? false;
    const wasEnabled = originalStates.get(dlc.dlcKey) ?? false;
    // 有効から無効に変わった場合のみ置換ターゲットを回復
    if (!isEnabled && wasEnabled && dlc.replacementTargets.length > 0) {
      targets.push(...dlc.replacementTargets);
    }
  }
  return [...new Set(targets)];
}

/**
 * 補助関数：正規表現の特殊文字をエスケープする
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * DLC の選択を世界書に保存する
 * @param dlcOptions DLC 選択肢リスト
 * @param localSelections ローカル選択状態
 * @param bookName 世界書名
 * @returns 更新後の DLC 選択肢リスト
 */
export async function saveDLCChanges(
  dlcOptions: DLCOption[],
  localSelections: Map<string, boolean>,
  bookName: string,
): Promise<DLCOption[]> {
  if (!hasDLCChanges(dlcOptions, localSelections)) {
    return dlcOptions;
  }

  // 元の状態のマップを構築
  const originalStates = new Map(dlcOptions.map(dlc => [dlc.dlcKey, dlc.enabled]));

  // 更新リストを構築：各 DLC の全エントリを同じ有効状態に設定
  const updatedEntries: Array<{ name: string; enabled: boolean }> = [];

  for (const dlc of dlcOptions) {
    const newEnabled = localSelections.get(dlc.dlcKey) ?? false;
    for (const entry of dlc.entries) {
      updatedEntries.push({
        name: entry.name,
        enabled: newEnabled,
      });
    }
  }

  // 排他ターゲットを収集（無効化が必要）
  const exclusionTargetsToDisable = collectExclusionTargetsToDisable(dlcOptions, localSelections);

  // 置換ターゲットを収集（無効化が必要）
  const replacementTargetsToDisable = collectReplacementTargetsToDisable(
    dlcOptions,
    localSelections,
  );

  // 置換ターゲットを収集（再有効化が必要）
  const replacementTargetsToEnable = collectReplacementTargetsToEnable(
    dlcOptions,
    localSelections,
    originalStates,
  );

  // 再有効化が必要な置換ターゲットから無効化が必要なターゲットを除外（無効化の優先度が高い）
  const filteredReplacementTargetsToEnable = replacementTargetsToEnable.filter(
    target =>
      !replacementTargetsToDisable.includes(target) && !exclusionTargetsToDisable.includes(target),
  );

  // 排他ロジックを処理： [排他ターゲット] を含むエントリを無効化
  if (exclusionTargetsToDisable.length > 0) {
    for (const target of exclusionTargetsToDisable) {
      const pattern = new RegExp(`\\[${escapeRegExp(target)}\\]`);
      const matchingEntries = await getFilteredEntries(pattern, bookName);

      for (const entry of matchingEntries as { name: string; enabled: boolean }[]) {
        const existingIndex = updatedEntries.findIndex(e => e.name === entry.name);
        if (existingIndex === -1) {
          updatedEntries.push({ name: entry.name, enabled: false });
        } else {
          updatedEntries[existingIndex].enabled = false;
        }
      }
    }
  }

  // 置換ロジックを処理（無効化）：[置換ターゲット] を含むエントリを無効化
  if (replacementTargetsToDisable.length > 0) {
    for (const target of replacementTargetsToDisable) {
      const pattern = new RegExp(`\\[${escapeRegExp(target)}\\]`);
      const matchingEntries = await getFilteredEntries(pattern, bookName);

      for (const entry of matchingEntries as { name: string; enabled: boolean }[]) {
        const existingIndex = updatedEntries.findIndex(e => e.name === entry.name);
        if (existingIndex === -1) {
          updatedEntries.push({ name: entry.name, enabled: false });
        } else {
          updatedEntries[existingIndex].enabled = false;
        }
      }
    }
  }

  // 置換ロジックを処理（再有効化）
  if (filteredReplacementTargetsToEnable.length > 0) {
    for (const target of filteredReplacementTargetsToEnable) {
      const pattern = new RegExp(`\\[${escapeRegExp(target)}\\]`);
      const matchingEntries = await getFilteredEntries(pattern, bookName);

      for (const entry of matchingEntries as { name: string; enabled: boolean }[]) {
        const existingIndex = updatedEntries.findIndex(e => e.name === entry.name);
        if (existingIndex === -1) {
          updatedEntries.push({ name: entry.name, enabled: true });
        } else if (updatedEntries[existingIndex].enabled !== false) {
          updatedEntries[existingIndex].enabled = true;
        }
      }
    }
  }

  await updateWorldBook(updatedEntries, bookName);

  // 更新後の DLC 選択肢リストを返す
  return dlcOptions.map(dlc => {
    const newEnabled = localSelections.get(dlc.dlcKey) ?? false;
    return {
      ...dlc,
      enabled: newEnabled,
      entries: dlc.entries.map(entry => ({
        ...entry,
        enabled: newEnabled,
      })),
    };
  });
}
