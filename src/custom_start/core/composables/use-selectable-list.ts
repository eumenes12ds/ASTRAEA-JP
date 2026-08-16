/**
 * 選択可能リストの汎用ロジック composable
 * DRY 原則に従い、ItemList と DestinedOneList の共通ロジックを抽出
 */

/**
 * 選択可能な項目のインターフェース
 * name と cost プロパティを持つ任意のオブジェクトがこの composable を使用可能
 */
export interface SelectableItem {
  name: string;
  cost: number;
}

/**
 * 選択可能リストの汎用ロジックを作成
 * @param selectedItems 選択済み項目の getter 関数
 * @param availablePoints 利用可能ポイントの getter 関数
 */
export function useSelectableList<T extends SelectableItem>(
  selectedItems: () => T[],
  availablePoints: () => number,
) {
  /**
   * 項目が選択済みかどうかを確認
   * lodash の _.some でマッチング
   */
  const isSelected = (item: T): boolean => {
    return _.some(selectedItems(), { name: item.name });
  };

  /**
   * 項目を選択できるかどうかを確認（ポイントが足りるか）
   */
  const canSelect = (item: T): boolean => {
    return availablePoints() >= item.cost;
  };

  /**
   * 項目が無効かどうかを確認
   * 選択済みの項目は無効にならず、未選択でポイント不足の項目が無効になる
   */
  const isDisabled = (item: T): boolean => {
    if (isSelected(item)) return false;
    return !canSelect(item);
  };

  return {
    isSelected,
    canSelect,
    isDisabled,
  };
}
