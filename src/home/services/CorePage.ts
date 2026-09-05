import JSON5 from 'json5';

import { getFilteredEntries, getWorldBookName, updateWorldBook } from './worldbookload&update';

// 未分類のデフォルトタブ名
export const UNCATEGORIZED_TAB = '未分類';

// 固定の特別おすすめタブ名
export const SPECIAL_RECOMMEND_TAB = '特別おすすめ';

// 特別おすすめコアの設定タイプ
export interface SpecialRecommendConfig {
  note: string;
}

// 特別おすすめの週替わりデータ形式（JSON ファイルのトップレベル構造）
export interface SpecialRecommendWeeklyData {
  startDate: string; // ローテーション開始日。形式 "YYYY-MM-DD"
  weeks: Record<string, Record<string, SpecialRecommendConfig>>; // week1 ~ weekN（週数はデータで決まる）
}

// 特別おすすめの最大表示数
export const MAX_SPECIAL_RECOMMEND_COUNT = 4;

// 特別おすすめコアの完全な情報（可用性状態を含む）
export interface SpecialRecommendCore {
  value: string;
  label: string;
  author: string;
  specialNote: string;
  available: boolean; // コアがコアリスト内に存在するか
}

// コア選択肢タイプ
export interface CoreOption {
  value: string;
  label: string;
  author: string; // 作者情報。括弧内から抽出
  enabled: boolean;
  tabs: string[]; // 配列。1 つのコアが複数のグループに属せる
  note: string; // コア分類から取得した note
  specialNote: string; // 特別おすすめの note
}

// コアエントリのマッチパターン - "命定システム-" で始まるエントリにマッチ
const CORE_PATTERN = /^命定システム-/;

// 作者情報を抽出する正規表現 - 末尾の括弧内容にマッチ
const AUTHOR_PATTERN = /\(([^)]*)\)$/;

/**
 * コア状態の初期値
 */
export const initialCoreState = {
  coreOptions: [] as CoreOption[],
  localCoreSelections: new Map<string, boolean>(),
  tabs: [] as string[],
  activeTab: '',
};

/**
 * コア分類データタイプ
 */
type CoreClassificationData = Record<string, Record<string, { note?: string }>>;

/**
 * キャッシュされたコア分類データ
 */
let cachedRankings: CoreClassificationData | null = null;

/**
 * キャッシュされた特別おすすめコアデータ（現在の週のデータとして抽出済み）
 */
let cachedSpecialRecommendCores: Record<string, SpecialRecommendConfig> | null = null;

/**
 * データのベースパス - CDN デプロイ環境
 * @latest の代わりにバージョン番号を使用してキャッシュが正しく更新されるようにする
 */
const DATA_BASE_PATH = `https://testingcf.jsdelivr.net/gh/eumenes12ds/ASTRAEA-JP@v${__APP_VERSION__}/public/assets/data`;

/**
 * リモートからコア分類データを読み込む
 * JSON5 で解析し、コメントやより柔軟な形式に対応
 */
async function loadCoreClassification(): Promise<CoreClassificationData> {
  if (cachedRankings !== null) {
    return cachedRankings;
  }

  try {
    const response = await fetch(`${DATA_BASE_PATH}/coreClassification.json`);
    if (!response.ok) {
      console.log('コア分類データファイルが見つかりません (coreClassification.json)');
      return {};
    }

    const text = await response.text();
    const data = JSON5.parse(text) as CoreClassificationData;
    console.log('コア分類データを正常に読み込みました');
    cachedRankings = data;
    return data;
  } catch (error) {
    console.log('コア分類データが見つからないか、形式エラー:', error);
    return {};
  }
}

/**
 * コア分類データを取得する（同期版、キャッシュを使用）
 */
function getRankings(): CoreClassificationData | undefined {
  return cachedRankings ?? undefined;
}

/**
 * 開始日と現在時刻から、現在表示すべき週のキーを計算する
 * weeks 内の実際の週数で循環ローテーションし、週数を超えたら week1 に戻る
 * 現在日付が startDate より前の場合は "week1" を返す
 * @param startDate ローテーション開始日文字列。形式 "YYYY-MM-DD"
 * @param totalWeeks weeks 内の実際の週数（例: 4 なら week1~week4）
 * @returns 現在の週のキー。例: "week3"
 */
export function getCurrentWeekKey(startDate: string, totalWeeks: number): string {
  // 最低 1 週にしてゼロ除算を防ぐ
  const safeTotal = Math.max(1, totalWeeks);

  const start = new Date(startDate);
  const now = new Date();

  // 時分秒をクリアし、日付のみで計算
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffMs = now.getTime() - start.getTime();

  // 現在日付が開始日より前なら week1 を返す
  if (diffMs < 0) {
    return 'week1';
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffDays / 7) % safeTotal;

  return `week${weekIndex + 1}`;
}

/**
 * リモートから特別おすすめコアデータを読み込む
 * 新しい週替わり形式（startDate + weeks を含む）に対応
 * JSON5 で解析し、コメントやより柔軟な形式に対応
 */
export async function loadSpecialRecommendCores(): Promise<Record<string, SpecialRecommendConfig>> {
  if (cachedSpecialRecommendCores !== null) {
    return cachedSpecialRecommendCores;
  }

  try {
    const response = await fetch(`${DATA_BASE_PATH}/SPECIAL_RECOMMEND_CORES.json`);
    if (!response.ok) {
      console.log('特別おすすめコアデータファイルが見つかりません (SPECIAL_RECOMMEND_CORES.json)');
      return {};
    }

    const text = await response.text();
    const rawData = JSON5.parse(text);

    let data: Record<string, SpecialRecommendConfig>;

    // 新しい週替わり形式かどうかを判定（startDate と weeks フィールドを含む）
    if (rawData.startDate && rawData.weeks && typeof rawData.weeks === 'object') {
      const weeklyData = rawData as SpecialRecommendWeeklyData;
      // weeks 内の実際の週数を動的に計算
      const totalWeeks = Object.keys(weeklyData.weeks).length;
      const weekKey = getCurrentWeekKey(weeklyData.startDate, totalWeeks);
      data = weeklyData.weeks[weekKey] ?? {};
      console.log(
        `特別おすすめコアデータを正常に読み込みました（週替わりモード、全 ${totalWeeks} 週、現在: ${weekKey}、開始日: ${weeklyData.startDate}）`,
      );
    } else {
      // 旧形式との互換：フラットなコア設定として直接扱う
      data = rawData as Record<string, SpecialRecommendConfig>;
      console.log('特別おすすめコアデータを正常に読み込みました（旧形式）');
    }

    cachedSpecialRecommendCores = data;
    return data;
  } catch (error) {
    console.log('特別おすすめコアデータが見つからないか、形式エラー:', error);
    return {};
  }
}

/**
 * コア分類データからすべてのタブ名を動的に取得する
 */
export async function getTabsFromRankings(): Promise<string[]> {
  const Rankings = await loadCoreClassification();
  if (!Rankings || typeof Rankings !== 'object') {
    return [SPECIAL_RECOMMEND_TAB, UNCATEGORIZED_TAB];
  }

  // コア分類のすべてのキーをタブとして取得
  const dynamicTabs = Object.keys(Rankings).filter(
    key => Rankings[key] && typeof Rankings[key] === 'object',
  );

  // 動的タブがない場合はデフォルトのタブを返す
  if (dynamicTabs.length === 0) {
    return [SPECIAL_RECOMMEND_TAB, UNCATEGORIZED_TAB];
  }

  // "特別おすすめ" を先頭に固定し、"未分類" を最後に置く
  return [SPECIAL_RECOMMEND_TAB, ...dynamicTabs, UNCATEGORIZED_TAB];
}

/**
 * コアラベルから、そのコアが属するすべてのタブ分類と note を探す
 * 1 つのコアは複数のグループに同時に属せる
 * 注意：特別おすすめは独立したロジックで処理され、この関数では追加しない
 * @param label コアラベル（プレフィックスと作者を除く）
 * @param allTabs すべてのタブリスト
 */
export function getCoreRanking(label: string, allTabs: string[]): { tabs: string[]; note: string } {
  const Rankings = getRankings();
  const matchedTabs: string[] = [];
  let note = '';

  if (Rankings && typeof Rankings === 'object') {
    // すべてのタブを走査してコアを探す（"未分類" と "特別おすすめ" を除外）
    for (const tabName of allTabs) {
      if (tabName === UNCATEGORIZED_TAB || tabName === SPECIAL_RECOMMEND_TAB) continue;

      const tabData = Rankings[tabName];
      if (tabData && typeof tabData === 'object') {
        // コア名がこのタブ内にあるか確認
        if (label in tabData) {
          matchedTabs.push(tabName);
          // 最初にマッチした note を使用
          if (!note && tabData[label]?.note) {
            note = tabData[label].note;
          }
        }
      }
    }
  }

  // どのグループにも見つからなければ "未分類" に振り分ける
  if (matchedTabs.length === 0) {
    return { tabs: [UNCATEGORIZED_TAB], note: '' };
  }

  return { tabs: matchedTabs, note };
}

/**
 * 特別おすすめコアリストを生成する（可用性情報を含む）
 * すべての推奨コアを返し、コアリスト内に存在するもの（利用可能）にマークを付ける。最大 MAX_SPECIAL_RECOMMEND_COUNT 個
 * @param specialRecommendCores 特別おすすめコア設定
 * @param existingCoreValues 現在存在するコア値の集合
 */
export function generateSpecialRecommendCores(
  specialRecommendCores: Record<string, SpecialRecommendConfig>,
  existingCoreValues: Set<string>,
): SpecialRecommendCore[] {
  const result: SpecialRecommendCore[] = [];
  let count = 0;

  for (const [coreValue, config] of Object.entries(specialRecommendCores)) {
    if (count >= MAX_SPECIAL_RECOMMEND_COUNT) {
      break;
    }

    // "命定システム-" プレフィックスを除去
    const nameWithoutPrefix = coreValue.replace(/^命定システム-/, '');
    // 作者情報を抽出（括弧内）
    const authorMatch = nameWithoutPrefix.match(/\(([^)]*)\)$/);
    const author = authorMatch ? authorMatch[1] : '';
    // 末尾の括弧内容を除去して表示ラベルにする
    const label = nameWithoutPrefix.replace(/\(([^)]*)\)$/, '');

    result.push({
      value: coreValue,
      label,
      author,
      specialNote: config.note,
      available: existingCoreValues.has(coreValue),
    });
    count++;
  }

  return result;
}

/**
 * 指定されたタブ配下のコアリストを取得する
 * コアは複数のタブに同時に属せる
 */
export function getCoresForTab(coreOptions: CoreOption[], tab: string): CoreOption[] {
  return coreOptions.filter(core => core.tabs.includes(tab));
}

/**
 * 現在選択中のコアを取得する
 */
export function getSelectedCore(localCoreSelections: Map<string, boolean>): string | null {
  for (const [name, enabled] of localCoreSelections) {
    if (enabled) return name;
  }
  return null;
}

/**
 * コアリストを読み込む
 * @param specialRecommendCores 特別おすすめコアリスト（外部から渡される）
 */
export async function loadCoreOptions(
  specialRecommendCores: Record<string, SpecialRecommendConfig> = {},
): Promise<{
  coreOptions: CoreOption[];
  localCoreSelections: Map<string, boolean>;
  tabs: string[];
  activeTab: string;
  bookName: string | null;
  specialRecommendCoreList: SpecialRecommendCore[];
}> {
  // タブを動的に取得（先にコア分類データを読み込む必要がある）
  const tabs = await getTabsFromRankings();
  const bookName = getWorldBookName();
  const entries = await getFilteredEntries(CORE_PATTERN, bookName);

  // 存在するコア値の集合を構築
  const existingCoreValues = new Set(entries.map((entry: { name: string }) => entry.name));

  // 特別おすすめコアリストを生成（可用性情報を含む、最大 4 個）
  const specialRecommendCoreList = generateSpecialRecommendCores(
    specialRecommendCores,
    existingCoreValues,
  );

  // 利用可能な特別おすすめコア値の集合を作成（後続の判定用）
  const availableSpecialCores = new Set(
    specialRecommendCoreList.filter(core => core.available).map(core => core.value),
  );

  const coreOptions = entries.map((entry: { name: string; enabled: boolean }) => {
    // "命定システム-" プレフィックスを除去
    const nameWithoutPrefix = entry.name.replace(CORE_PATTERN, '');
    // 作者情報を抽出（括弧内）
    const authorMatch = nameWithoutPrefix.match(AUTHOR_PATTERN);
    const author = authorMatch ? authorMatch[1] : '';
    // 末尾の括弧内容を除去して表示ラベルにする
    const label = nameWithoutPrefix.replace(AUTHOR_PATTERN, '');
    const ranking = getCoreRanking(label, tabs);

    // 特別おすすめを独立処理：コアが利用可能な特別おすすめリスト内にあるか確認
    const coreTabs = [...ranking.tabs];
    let specialNote = '';
    if (availableSpecialCores.has(entry.name)) {
      coreTabs.unshift(SPECIAL_RECOMMEND_TAB); // 特別おすすめを最前面に配置
      const recommendCore = specialRecommendCoreList.find(c => c.value === entry.name);
      specialNote = recommendCore?.specialNote || '';
    }

    return {
      value: entry.name,
      label,
      author,
      enabled: entry.enabled,
      tabs: coreTabs,
      note: ranking.note,
      specialNote,
    };
  });

  // ローカル選択リストを初期化（世界書の元の状態からコピー）
  const localCoreSelections = new Map(coreOptions.map(core => [core.value, core.enabled]));

  // 最初のタブ（特別おすすめ）を固定表示し、有効化されたコアのタブへの自動切り替えを廃止
  const activeTab = tabs[0] || SPECIAL_RECOMMEND_TAB;

  return {
    coreOptions,
    localCoreSelections,
    tabs,
    activeTab,
    bookName,
    specialRecommendCoreList,
  };
}

/**
 * コアを選択する（ローカル状態のみ更新し、新しい選択マップを返す）
 */
export function selectCore(
  localCoreSelections: Map<string, boolean>,
  coreValue: string,
): Map<string, boolean> {
  const currentSelected = getSelectedCore(localCoreSelections);
  if (currentSelected === coreValue) {
    return localCoreSelections; // 選択済みのため、操作は不要
  }

  // 新しいマップを作成し、他のコアを無効化、選択したコアを有効化
  const newSelections = new Map<string, boolean>();
  for (const [name] of localCoreSelections) {
    newSelections.set(name, name === coreValue);
  }
  return newSelections;
}

/**
 * ローカル選択が元の状態と変化しているか確認する
 */
export function hasChanges(
  coreOptions: CoreOption[],
  localCoreSelections: Map<string, boolean>,
): boolean {
  for (const core of coreOptions) {
    const localEnabled = localCoreSelections.get(core.value) ?? false;
    if (localEnabled !== core.enabled) {
      return true;
    }
  }
  return false;
}

/**
 * コアの選択を世界書に保存する
 * @param coreOptions コア選択肢リスト
 * @param localCoreSelections ローカル選択状態
 * @param bookName 世界書名
 * @returns 更新後のコア選択肢リスト
 */
export async function saveChanges(
  coreOptions: CoreOption[],
  localCoreSelections: Map<string, boolean>,
  bookName: string,
): Promise<CoreOption[]> {
  if (!hasChanges(coreOptions, localCoreSelections)) {
    return coreOptions;
  }

  // 更新リストを構築
  const updatedEntries = Array.from(localCoreSelections).map(([name, enabled]) => ({
    name,
    enabled,
  }));

  await updateWorldBook(updatedEntries, bookName);

  // 更新後のコア選択肢リストを返す
  return coreOptions.map(core => ({
    ...core,
    enabled: localCoreSelections.get(core.value) ?? false,
  }));
}
