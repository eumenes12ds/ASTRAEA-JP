import type { CascaderOption } from '../components/Form/FormCascader.vue';
import type { Rarity } from '../types';

/**
 * 品質/レア度選択肢の設定
 */
export const RARITY_OPTIONS: { value: Rarity; label: string; color: string }[] = [
  { value: 'common', label: 'ノーマル', color: '#9e9e9e' },
  { value: 'uncommon', label: 'アンコモン', color: '#b88a2c' },
  { value: 'rare', label: 'レア', color: '#2196f3' },
  { value: 'epic', label: 'エピック', color: '#9c27b0' },
  { value: 'legendary', label: 'レジェンド', color: '#ff9800' },
  { value: 'mythic', label: 'ミシック', color: '#e91e63' },
  { value: 'only', label: 'ユニーク', color: '#ff0000' },
];

/**
 * 装備タイプ選択肢の設定
 */
export const EQUIPMENT_TYPE_OPTIONS = [
  { label: '武器', value: '武器' },
  { label: '防具', value: '防具' },
  { label: '装飾品', value: '装飾品' },
] as const;

/**
 * スキルタイプ選択肢の設定
 */
export const SKILL_TYPE_OPTIONS = [
  { label: 'アクティブ', value: 'アクティブ' },
  { label: 'パッシブ', value: 'パッシブ' },
] as const;

/**
 * アイテム大分類の選択肢
 */
export const CATEGORY_OPTIONS = [
  { value: 'equipment', label: '装備' },
  { value: 'item', label: '道具' },
  { value: 'asset', label: '資産' },
  { value: 'skill', label: 'スキル' },
] as const;

/**
 * レア度表示タグを取得
 */
export const getRarityLabel = (value: string | undefined): string => {
  return RARITY_OPTIONS.find(opt => opt.value === value)?.label || 'ノーマル';
};

/**
 * レア度の色を取得
 */
export const getRarityColor = (value: string | undefined): string => {
  return RARITY_OPTIONS.find(opt => opt.value === value)?.color || '#9e9e9e';
};

/**
 * フラットな位置文字列配列をツリー状のカスケード構造に変換
 * 入力: ["区域A-国家1-城市X", "区域A-国家1-城市Y", "区域A-国家2-城市Z"]
 * 出力: ツリー状の CascaderOption 構造
 *
 * 特殊処理：あるパスが独立した選択肢でありながら子選択肢も持つ場合（"区域-国家" と "区域-国家-城市" など）、
 * そのパスを子ノードの先頭に配置し、"国家（この地域）" と表示する
 *
 * @param locations - 位置文字列の配列。区切り文字で階層を分ける
 * @param separator - 階層の区切り文字。デフォルトは "-"
 * @returns ツリー状のカスケード選択肢配列
 */
export const convertLocationsToCascaderOptions = (
  locations: string[],
  separator = '-',
): CascaderOption[] => {
  const root: CascaderOption[] = [];

  // ノードの高速検索用マップ
  const nodeMap = new Map<string, CascaderOption>();

  // すべてのパスを収集し、親子関係が同時に存在するものを検出
  const allPaths = new Set(locations);

  // 「葉でありながら子ノードも持つ」パスをマーク
  const pathsNeedingLocalOption = new Set<string>();

  // "この地域"選択肢が必要なパスを検出
  for (const location of locations) {
    const parts = location.split(separator);
    // このパスのすべての親パスをチェック
    let parentPath = '';
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i].trim();
      parentPath = parentPath ? `${parentPath}${separator}${part}` : part;
      // 親パスも独立した選択肢として存在する場合、マークする
      if (allPaths.has(parentPath)) {
        pathsNeedingLocalOption.add(parentPath);
      }
    }
  }

  for (const location of locations) {
    const parts = location.split(separator);
    let currentPath = '';
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      currentPath = currentPath ? `${currentPath}${separator}${part}` : part;

      // 現在のノードが既に存在するか確認
      let node = nodeMap.get(currentPath);

      if (!node) {
        // 新規ノードを作成。value は完全なパスを使用
        node = {
          label: part,
          value: currentPath,
          children: [],
        };
        nodeMap.set(currentPath, node);
        currentLevel.push(node);

        // このパスに"この地域"選択肢が必要な場合
        if (pathsNeedingLocalOption.has(currentPath)) {
          // "この地域"を表す子選択肢を追加。value は元データの完全なパスを使用
          const localOption: CascaderOption = {
            label: `${part}（この地域）`,
            value: currentPath,
          };
          node.children!.unshift(localOption);
        }
      }

      // 次の階層へ移動
      currentLevel = node.children!;
    }
  }

  // 空の children 配列をクリーンアップ（葉ノードには children は不要）
  // ただし"この地域"選択肢を持つノードの children は保持
  const cleanEmptyChildren = (options: CascaderOption[]) => {
    for (const option of options) {
      if (option.children && option.children.length === 0) {
        delete option.children;
      } else if (option.children) {
        cleanEmptyChildren(option.children);
      }
    }
  };

  cleanEmptyChildren(root);

  return root;
};

/**
 * ツリー状の選択肢をソート（label の文字順）
 *
 * @param options - ツリー状のカスケード選択肢配列
 * @returns ソート後のツリー状カスケード選択肢配列
 */
export const sortCascaderOptions = (options: CascaderOption[]): CascaderOption[] => {
  const sorted = [...options].sort((a, b) => a.label.localeCompare(b.label, 'ja'));

  for (const option of sorted) {
    if (option.children && option.children.length > 0) {
      option.children = sortCascaderOptions(option.children);
    }
  }

  return sorted;
};
