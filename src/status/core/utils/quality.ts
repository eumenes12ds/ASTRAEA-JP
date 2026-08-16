/**
 * 品質関連のユーティリティ関数
 * 物品・装備・スキルの品質スタイル処理に使用
 */

/** 品質から CSS クラス名へのマッピング */
export const QualityClassMap: Record<string, string> = {
  ノーマル: 'common',
  ユニーク: 'unique',
  ミシック: 'mythic',
  レジェンド: 'legendary',
  エピック: 'epic',
  レア: 'rare',
  アンコモン: 'uncommon',
};

const QualityRankMap: Record<string, number> = {
  ノーマル: 1,
  アンコモン: 2,
  レア: 3,
  エピック: 4,
  レジェンド: 5,
  ミシック: 6,
  ユニーク: 7,
};

/**
 * 品質の高い順にソートし、品質が同じ場合は名称順にソート
 */
export const sortEntriesByQuality = <T extends { 品質?: string }>(
  items: Record<string, T>,
): [string, T][] => {
  return _.orderBy(
    Object.entries(items),
    [([_name, item]) => getQualityRank(item?.品質), ([name]) => name],
    ['desc', 'asc'],
  );
};

/**
 * 品質のソート重みを取得（値が大きいほど上位）
 */
export const getQualityRank = (quality?: string): number => {
  if (!quality) return 0;
  return QualityRankMap[quality] ?? 0;
};

/** 品質スタイルのマッピング */
export const QualityStyleMap: Record<string, string> = {
  common: 'qualityCommon',
  unique: 'qualityUnique',
  mythic: 'qualityMythic',
  legendary: 'qualityLegendary',
  epic: 'qualityEpic',
  rare: 'qualityRare',
  uncommon: 'qualityUncommon',
};

/**
 * 品質に対応するスタイルクラス名を取得
 * @param quality - 品質名（例："エピック"、"レジェンド"等）
 * @param stylesModule - SCSS module オブジェクト
 * @returns スタイルクラス名の文字列
 */
export const getQualityClass = (
  quality: string | undefined,
  stylesModule: Record<string, string>,
): string => {
  if (!quality) return '';
  const qualityKey = QualityClassMap[quality];
  if (!qualityKey) return '';
  const styleKey = QualityStyleMap[qualityKey];
  return styleKey ? stylesModule[styleKey] : '';
};
