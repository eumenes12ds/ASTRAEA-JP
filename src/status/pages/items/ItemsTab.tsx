import { FC, useEffect, useMemo, useState } from 'react';
import { useDeleteConfirm } from '../../core/hooks';
import { useEditorSettingStore } from '../../core/stores';
import {
  buildSessionKey,
  formatMoney,
  getAssetCollectionSource,
  getAssetFilterOptions,
  getFilteredAssetEntries,
  getQualityClass,
  readSessionState,
  writeSessionState,
} from '../../core/utils';
import type { ItemData } from '../../shared/components';
import {
  DeleteConfirmModal,
  EditableField,
  EmptyHint,
  ItemDetail,
  ItemInspectModal,
} from '../../shared/components';
import { withMvuData, WithMvuDataProps } from '../../shared/hoc';
import styles from './ItemsTab.module.scss';

/** 物品カテゴリ Tab 設定 */
const ItemCategories = [
  {
    id: 'inventory',
    label: 'インベントリ',
    icon: 'fa-solid fa-box',
    filterKey: 'タイプ',
    pathPrefix: '主人公.インベントリ',
    itemCategory: 'item' as const,
  },
  {
    id: 'equipment',
    label: '装備',
    icon: 'fa-solid fa-shield',
    filterKey: 'タイプ',
    pathPrefix: '主人公.装備',
    itemCategory: 'equipment' as const,
  },
  {
    id: 'skills',
    label: 'スキル',
    icon: 'fa-solid fa-wand-magic-sparkles',
    filterKey: 'タイプ',
    pathPrefix: '主人公.スキル',
    itemCategory: 'skill' as const,
  },
  {
    id: 'assets',
    label: '資産',
    icon: 'fa-solid fa-building-columns',
    filterKey: 'タイプ',
    pathPrefix: '主人公.資産',
    itemCategory: 'asset' as const,
  },
] as const;

type CategoryId = (typeof ItemCategories)[number]['id'];

type InspectItemState = {
  categoryId: CategoryId;
  name: string;
} | null;

/** すべてのフィルタ選択肢 */
const ALL_FILTER = '全部';

/**
 * 物品ページの内容コンポーネント
 */
const ItemsTabContent: FC<WithMvuDataProps> = ({ data }) => {
  const editEnabled = useEditorSettingStore(state => state.editEnabled);
  const { deleteTarget, setDeleteTarget, handleDelete, cancelDelete, isConfirmOpen } =
    useDeleteConfirm();

  const categoryStorageKey = buildSessionKey('items', 'active-category');
  const filterStorageKey = buildSessionKey('items', 'active-filter');
  const searchStorageKey = buildSessionKey('items', 'search');

  const [activeCategory, setActiveCategory] = useState<CategoryId>(() =>
    readSessionState<CategoryId>(categoryStorageKey, 'inventory'),
  );
  const [activeFilter, setActiveFilter] = useState<string>(() =>
    readSessionState<string>(filterStorageKey, ALL_FILTER),
  );
  const [searchKeyword, setSearchKeyword] = useState<string>(() =>
    readSessionState<string>(searchStorageKey, ''),
  );
  const [selectedItem, setSelectedItem] = useState<InspectItemState>(null);
  const [inspectItem, setInspectItem] = useState<InspectItemState>(null);
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const player = data.主人公;

  /** 現在のカテゴリ設定を取得 */
  const getCategoryConfig = (category: CategoryId) => {
    return ItemCategories.find(c => c.id === category)!;
  };

  /** 現在のカテゴリのデータソースを取得 */
  const getCategoryData = (category: CategoryId) => {
    const config = getCategoryConfig(category);
    return getAssetCollectionSource(player, config.label);
  };

  /** 現在のカテゴリのフィルタフィールドを取得 */
  const getFilterKey = (category: CategoryId) => {
    const cat = ItemCategories.find(c => c.id === category);
    return cat?.filterKey ?? 'タイプ';
  };

  const activeCategoryConfig = getCategoryConfig(activeCategory);
  const activeCategoryItems = useMemo(
    () => getCategoryData(activeCategory),
    [activeCategory, player.スキル, player.装備, player.インベントリ, player.資産],
  );

  const inspectCategoryConfig = inspectItem ? getCategoryConfig(inspectItem.categoryId) : null;
  const inspectCategoryData = inspectItem ? getCategoryData(inspectItem.categoryId) : null;
  const inspectedItemData =
    inspectItem && inspectCategoryData ? inspectCategoryData[inspectItem.name] : undefined;

  const selectedCategoryConfig = selectedItem ? getCategoryConfig(selectedItem.categoryId) : null;
  const selectedCategoryData = selectedItem ? getCategoryData(selectedItem.categoryId) : null;
  const selectedItemData =
    selectedItem && selectedCategoryData ? selectedCategoryData[selectedItem.name] : undefined;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 720px)');
    const syncLayout = () => setIsCompactLayout(mediaQuery.matches);

    syncLayout();
    mediaQuery.addEventListener('change', syncLayout);
    return () => mediaQuery.removeEventListener('change', syncLayout);
  }, []);

  useEffect(() => {
    if (activeCategoryConfig.id !== activeCategory) {
      setActiveCategory(activeCategoryConfig.id);
      return;
    }
    writeSessionState(categoryStorageKey, activeCategoryConfig.id);
  }, [activeCategory, activeCategoryConfig.id, categoryStorageKey]);

  useEffect(() => {
    writeSessionState(filterStorageKey, activeFilter);
  }, [activeFilter, filterStorageKey]);

  useEffect(() => {
    writeSessionState(searchStorageKey, searchKeyword);
  }, [searchKeyword, searchStorageKey]);

  /** 現在のカテゴリの全フィルタ選択肢を計算 */
  const filterOptions = useMemo(() => {
    return getAssetFilterOptions(activeCategoryItems, getFilterKey(activeCategory), ALL_FILTER);
  }, [activeCategory, activeCategoryItems]);

  useEffect(() => {
    if (filterOptions.length === 0) return;
    if (!filterOptions.includes(activeFilter)) {
      setActiveFilter(ALL_FILTER);
    }
  }, [activeFilter, filterOptions]);

  const normalizedActiveFilter = filterOptions.includes(activeFilter) ? activeFilter : ALL_FILTER;

  const filteredEntries = useMemo(() => {
    const entries = getFilteredAssetEntries(
      activeCategoryItems,
      getFilterKey(activeCategory),
      normalizedActiveFilter,
      ALL_FILTER,
    );

    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return entries;

    return entries.filter(([name, item]) => {
      const haystack = [name, item.タイプ ?? '', ...(item.タグ ?? [])].join(' ').toLowerCase();
      return haystack.includes(keyword);
    });
  }, [activeCategory, activeCategoryItems, normalizedActiveFilter, searchKeyword]);

  const activeFilterCountMap = useMemo(() => {
    return filterOptions.reduce<Record<string, number>>((acc, option) => {
      if (option === ALL_FILTER) {
        acc[option] = Object.keys(activeCategoryItems).length;
        return acc;
      }

      acc[option] = _.size(
        _.pickBy(activeCategoryItems, item => _.get(item, getFilterKey(activeCategory)) === option),
      );
      return acc;
    }, {});
  }, [activeCategory, activeCategoryItems, filterOptions]);

  useEffect(() => {
    if (filteredEntries.length === 0) {
      setSelectedItem(null);
      return;
    }

    const selectedStillVisible =
      selectedItem?.categoryId === activeCategory &&
      filteredEntries.some(([name]) => name === selectedItem.name);

    if (!selectedStillVisible) {
      setSelectedItem({
        categoryId: activeCategory,
        name: filteredEntries[0][0],
      });
    }
  }, [activeCategory, filteredEntries, selectedItem]);

  /** カテゴリ切り替え時にフィルタと検索語をリセット */
  const handleCategoryChange = (category: CategoryId) => {
    setActiveCategory(category);
    setActiveFilter(ALL_FILTER);
    setSearchKeyword('');
    setSelectedItem(null);
    setInspectItem(null);
  };

  const handleSelectItem = (name: string) => {
    const nextItem = {
      categoryId: activeCategory,
      name,
    };

    setSelectedItem(nextItem);
    if (isCompactLayout) {
      setInspectItem(nextItem);
    }
  };

  const handleItemRowKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, name: string) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    handleSelectItem(name);
  };

  const handleDeleteItemClick = (event: React.MouseEvent<HTMLButtonElement>, name: string) => {
    event.stopPropagation();
    handleDeleteItem(name);
  };

  const handleCloseInspect = () => {
    setInspectItem(null);
  };

  const handleDeleteItem = (name: string) => {
    setDeleteTarget({
      type: activeCategoryConfig.label,
      path: `${activeCategoryConfig.pathPrefix}.${name}`,
      name,
    });
  };

  const getTitleSuffix = (config: typeof activeCategoryConfig, item: ItemData) => {
    if (config.itemCategory === 'item') {
      return <span className={styles.itemCount}>×{item.数量}</span>;
    }

    if (config.itemCategory === 'equipment') {
      return item.位置 ? <span className={styles.itemSlot}>[{item.位置}]</span> : null;
    }

    if (config.itemCategory === 'asset') {
      if (!item.決済) return null;

      const settlement = Array.from(item.決済);
      const displaySettlement =
        settlement.length > 4 ? `${settlement.slice(0, 4).join('')}...` : item.決済;
      return (
        <span className={styles.itemCost} title={item.決済}>
          {displaySettlement}
        </span>
      );
    }

    return item.コスト ? <span className={styles.itemCost}>{item.コスト}</span> : null;
  };

  const getItemTypeLabel = (item: ItemData) => item.タイプ || '未分類';

  const getItemTags = (item: ItemData) => item.タグ?.filter(Boolean) ?? [];

  const renderDetail = (
    itemState: InspectItemState,
    config: typeof activeCategoryConfig | null,
    itemData: ItemData | undefined,
  ) => {
    if (!itemState || !config || !itemData) {
      return <EmptyHint className={styles.emptyHint} text="所持品を選択して詳細を表示" />;
    }

    return (
      <ItemDetail
        name={itemState.name}
        data={itemData}
        titleSuffix={getTitleSuffix(config, itemData)}
        editEnabled={editEnabled}
        pathPrefix={`${config.pathPrefix}.${itemState.name}`}
        itemCategory={config.itemCategory}
        displayMode="modal-detail"
      />
    );
  };

  /** 通貨の描画 */
  const renderCurrency = () => {
    const money = player.金銭 ?? 0;
    if (!money && !editEnabled) return null;

    return (
      <div className={`${styles.currency} ${editEnabled ? styles.currencyEdit : ''}`}>
        <span className={`${styles.currencyItem} ${styles.currencyItemGold}`}>
          <i className="fa-solid fa-coins" />
          {editEnabled ? (
            <EditableField
              path="主人公.金銭"
              value={money}
              type="number"
              numberConfig={{ step: 1 }}
            />
          ) : (
            formatMoney(money)
          )}
          <span className={styles.currencyUnit}>G</span>
        </span>
      </div>
    );
  };

  const renderItemList = (emptyText: string) => {
    if (filteredEntries.length === 0) {
      return (
        <EmptyHint
          className={styles.emptyHint}
          text={searchKeyword.trim() ? '一致する物品が見つかりません' : emptyText}
        />
      );
    }

    return (
      <div className={styles.itemList}>
        {filteredEntries.map(([name, item]) => {
          const isSelected =
            selectedItem?.categoryId === activeCategory && selectedItem.name === name;
          const qualityClass = getQualityClass(item.品質, styles);
          const itemTags = getItemTags(item);

          return (
            <div
              key={name}
              role="button"
              tabIndex={0}
              className={`${styles.itemRow} ${isSelected ? styles.isSelected : ''}`}
              onClick={() => handleSelectItem(name)}
              onKeyDown={event => handleItemRowKeyDown(event, name)}
            >
              <span className={`${styles.itemQualityMark} ${qualityClass}`.trim()} />
              <span className={styles.itemRowMain}>
                <span className={styles.itemRowTitle}>
                  <span className={`${styles.itemRowName} ${qualityClass}`.trim()}>{name}</span>
                  <span className={styles.itemRowType}>{getItemTypeLabel(item)}</span>
                </span>
                {itemTags.length > 0 ? (
                  <span className={styles.itemRowTags}>
                    {itemTags.map((tag, idx) => (
                      <span key={`${tag}-${idx}`} className={styles.itemRowTag}>
                        {tag}
                      </span>
                    ))}
                  </span>
                ) : null}
              </span>
              <span className={styles.itemRowActions}>
                <span className={styles.itemRowSuffix}>
                  {getTitleSuffix(activeCategoryConfig, item)}
                </span>
                <button
                  type="button"
                  className={styles.itemDeleteButton}
                  onClick={event => handleDeleteItemClick(event, name)}
                  title="削除"
                >
                  <i className="fa-solid fa-trash-can" />
                </button>
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  /** インベントリ物品の描画 */
  const renderInventory = () => {
    return renderItemList(
      normalizedActiveFilter === ALL_FILTER
        ? 'インベントリは空です'
        : `${normalizedActiveFilter}タイプの物品なし`,
    );
  };

  /** 装備の描画 */
  const renderEquipment = () => {
    return renderItemList(
      normalizedActiveFilter === ALL_FILTER
        ? '装備なし'
        : `${normalizedActiveFilter}位置の装備なし`,
    );
  };

  /** スキルの描画 */
  const renderSkills = () => {
    return renderItemList(
      normalizedActiveFilter === ALL_FILTER
        ? 'スキルなし'
        : `${normalizedActiveFilter}タイプのスキルなし`,
    );
  };

  const renderAssets = () => {
    return renderItemList(
      normalizedActiveFilter === ALL_FILTER
        ? '資産なし'
        : `${normalizedActiveFilter}タイプの資産なし`,
    );
  };

  /** 現在のカテゴリの内容を描画 */
  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'inventory':
        return renderInventory();
      case 'equipment':
        return renderEquipment();
      case 'skills':
        return renderSkills();
      case 'assets':
        return renderAssets();
      default:
        return null;
    }
  };

  return (
    <div className={styles.itemsTab}>
      {/* 通貨表示 */}
      <div className={styles.itemsTabHeader}>
        {/* カテゴリ切り替え */}
        <div className={styles.itemsTabCategories}>
          {ItemCategories.map(cat => {
            const itemCount = Object.keys(getCategoryData(cat.id)).length;

            return (
              <button
                key={cat.id}
                type="button"
                className={`${styles.categoryBtn} ${activeCategory === cat.id ? styles.isActive : ''}`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                <i className={cat.icon} />
                <span>{cat.label}</span>
                <span className={styles.categoryCount}>{itemCount}</span>
              </button>
            );
          })}
        </div>

        {renderCurrency()}
      </div>

      <div className={styles.itemsWorkspace}>
        {/* キーワード検索 */}
        <div className={styles.searchBar}>
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="物品名/タイプ/タグを検索"
            value={searchKeyword}
            onChange={event => setSearchKeyword(event.target.value)}
          />
          {searchKeyword && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => setSearchKeyword('')}
              title="検索をクリア"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>

        {/* サブカテゴリフィルタ */}
        {filterOptions.length > 1 && (
          <div className={styles.filterBar}>
            {filterOptions.map(option => (
              <button
                key={option}
                type="button"
                className={`${styles.filterBtn} ${activeFilter === option ? styles.isActive : ''}`}
                onClick={() => setActiveFilter(option)}
              >
                {option}
                <span className={styles.filterCount}>{activeFilterCountMap[option] ?? 0}</span>
              </button>
            ))}
          </div>
        )}

        {/* 内容領域 */}
        <div className={styles.itemsTabContent}>
          <div className={styles.itemsIndex}>{renderCategoryContent()}</div>
          <aside className={styles.itemsDetailPanel}>
            <div className={styles.itemsDetailHeader}>
              <span>{selectedItem?.name ?? '所持品詳細'}</span>
              <span>{activeCategoryConfig.label}</span>
            </div>
            <div className={styles.itemsDetailBody}>
              {renderDetail(selectedItem, selectedCategoryConfig, selectedItemData)}
            </div>
          </aside>
        </div>
      </div>

      {/* 資産詳細中央パネル */}
      <ItemInspectModal
        open={!!inspectItem}
        title={inspectItem?.name ?? ''}
        subtitle={
          inspectCategoryConfig ? (
            <span className={styles.inspectSubtitle}>{inspectCategoryConfig.label}</span>
          ) : null
        }
        onClose={handleCloseInspect}
      >
        {inspectItem && inspectCategoryConfig && inspectedItemData
          ? renderDetail(inspectItem, inspectCategoryConfig, inspectedItemData)
          : null}
      </ItemInspectModal>

      {/* 削除確認モーダル */}
      <DeleteConfirmModal
        open={isConfirmOpen}
        target={deleteTarget}
        onConfirm={handleDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

/**
 * 物品ページコンポーネント（HOC でラップ）
 */
export const ItemsTab = withMvuData({ baseClassName: styles.itemsTab })(ItemsTabContent);
