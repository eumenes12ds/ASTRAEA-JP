import { sortEntriesByQuality } from './quality';

export type AssetCollectionDataKey = '装備' | 'スキル' | 'インベントリ' | '資産';
export type AssetCollectionFilterKey = string;

export type AssetCollectionItem = { 品質?: string } & Record<string, any>;
export type AssetCollectionSource = Record<string, AssetCollectionItem>;

/** 資産データソースを一括で読み取り、ページ側での結合タイプの重複処理を回避 */
export const getAssetCollectionSource = (
  owner: Record<string, any>,
  data_key: AssetCollectionDataKey,
): AssetCollectionSource => {
  return (owner[data_key] ?? {}) as AssetCollectionSource;
};

/** 資産のフィルタ選択肢を取得。デフォルトで「すべて」を含む */
export const getAssetFilterOptions = (
  source: AssetCollectionSource,
  filter_key: AssetCollectionFilterKey,
  all_filter_label: string,
): string[] => {
  const values = new Set<string>();

  _.forEach(source, item => {
    const value = _.get(item, filter_key);
    if (typeof value === 'string' && value) {
      values.add(value);
    }
  });

  return [all_filter_label, ...Array.from(values).sort()];
};

/**
 * 先に品質順で並べ、その後動的サブカテゴリでフィルタする
 * [`ItemsTab`](src/status/pages/items/ItemsTab.tsx) と同様の設定駆動フィルタ方針を維持
 */
export const getFilteredAssetEntries = (
  source: AssetCollectionSource,
  filter_key: AssetCollectionFilterKey,
  active_filter: string,
  all_filter_label: string,
): [string, AssetCollectionItem][] => {
  const allEntries = sortEntriesByQuality(source);

  if (active_filter === all_filter_label) {
    return allEntries;
  }

  return allEntries.filter(([, item]) => _.get(item, filter_key) === active_filter);
};
