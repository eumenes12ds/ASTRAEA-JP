import { getQualityClass } from '@/status/core/utils';
import _ from 'lodash';
import { FC, ReactNode } from 'react';
import { EditableField } from '../EditableField';
import styles from './ItemDetail.module.scss';

/** 品質選択肢 */
const QUALITY_OPTIONS = [
  { value: '', label: 'なし' },
  { value: 'ノーマル', label: 'ノーマル' },
  { value: 'アンコモン', label: 'アンコモン' },
  { value: 'レア', label: 'レア' },
  { value: 'エピック', label: 'エピック' },
  { value: 'レジェンド', label: 'レジェンド' },
  { value: 'ミシック', label: 'ミシック' },
  { value: 'ユニーク', label: 'ユニーク' },
];

/** 物品詳細の汎用データ構造 */
export interface ItemData {
  品質?: string;
  タイプ?: string;
  タグ?: string[];
  効果?: Record<string, string>;
  説明?: string;
  位置?: string;
  コスト?: string;
  数量?: number;
  決済?: string;
}

/** 物品カテゴリ */
export type ItemCategory = 'asset' | 'equipment' | 'skill' | 'item';

/** 物品の表示モード */
export type ItemDetailDisplayMode = 'compact' | 'panel-card' | 'modal-detail';

interface ItemDetailProps {
  /** 物品名 */
  name: string;
  /** 物品データ */
  data: ItemData;
  /** 追加のタイトル要素（数量、位置など） */
  titleSuffix?: ReactNode;
  /** 編集モードを有効にするかどうか */
  editEnabled?: boolean;
  /** データパスプレフィックス（編集時に完全パスを構築するため） */
  pathPrefix?: string;
  /** 削除コールバック（削除ボタンクリック時に発火。確認モーダルは親コンポーネントが処理） */
  onDelete?: () => void;
  /** 物品カテゴリ。表示するフィールドの切り分けに使用 */
  itemCategory?: ItemCategory;
  /** 表示モード */
  displayMode?: ItemDetailDisplayMode;
  /** クリックで詳細を表示 */
  onInspect?: () => void;
}

/**
 * 物品詳細コンポーネント
 * 装備・スキル・インベントリ物品の要約と完全情報の描画に使用。
 * ItemsTab と DestinyTab で再利用。
 */
export const ItemDetail: FC<ItemDetailProps> = ({
  name,
  data,
  titleSuffix,
  editEnabled = false,
  pathPrefix,
  onDelete,
  itemCategory = 'item',
  displayMode = 'panel-card',
  onInspect,
}) => {
  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete?.();
  };

  const qualityClass = getQualityClass(data.品質, styles);
  const metaItems = [data.タイプ ? { key: 'type', label: 'タイプ', value: data.タイプ } : null].filter(
    Boolean,
  ) as Array<{ key: string; label: string; value: string }>;

  const effectEntries = _.entries(data.効果 ?? {});
  const effectNames = effectEntries.map(([key]) => key);
  const summaryEffectNames = effectNames.slice(0, 3);
  const remainingEffectCount = Math.max(effectNames.length - summaryEffectNames.length, 0);

  const renderDeleteButton = () => {
    if (!onDelete) return null;

    return (
      <button
        type="button"
        className={styles.deleteButton}
        onClick={handleDeleteClick}
        title="削除"
      >
        <i className="fa-solid fa-trash-can" />
      </button>
    );
  };

  const renderEditableOrText = (
    fieldPath: string,
    value: string | number,
    type: 'text' | 'number' | 'select' | 'textarea',
    selectOptions?: { value: string; label: string }[],
  ) => {
    if (!editEnabled || !pathPrefix) {
      return <span>{value}</span>;
    }

    if (type === 'number') {
      return (
        <EditableField
          path={`${pathPrefix}.${fieldPath}`}
          value={value}
          type="number"
          numberConfig={{ min: 1, step: 1 }}
        />
      );
    }

    if (type === 'select') {
      return (
        <EditableField
          path={`${pathPrefix}.${fieldPath}`}
          value={value}
          type="select"
          selectConfig={{ options: selectOptions ?? [] }}
        />
      );
    }

    if (type === 'textarea') {
      return <EditableField path={`${pathPrefix}.${fieldPath}`} value={value} type="textarea" />;
    }

    return <EditableField path={`${pathPrefix}.${fieldPath}`} value={value} type="text" />;
  };

  const renderTitle = () => (
    <div className={styles.itemTitle}>
      <div className={styles.itemTitleMain}>
        <span className={`${styles.itemName} ${qualityClass}`.trim()}>{name}</span>
        {titleSuffix ? <span className={styles.itemTitleSuffix}>{titleSuffix}</span> : null}
      </div>
      <div className={styles.itemTitleActions}>{renderDeleteButton()}</div>
    </div>
  );

  const renderMeta = () => {
    if (metaItems.length === 0) return null;

    return (
      <div className={styles.itemMeta}>
        {metaItems.map(meta => (
          <span key={meta.key} className={styles.itemMetaBadge}>
            <span className={styles.itemMetaLabel}>{meta.label}</span>
            <span className={styles.itemMetaValue}>{meta.value}</span>
          </span>
        ))}
      </div>
    );
  };

  const renderTags = (allowEdit = editEnabled && !!pathPrefix) => {
    if (_.isEmpty(data.タグ)) return null;

    return (
      <div className={styles.itemTags}>
        {allowEdit ? (
          <EditableField path={`${pathPrefix}.タグ`} value={data.タグ ?? []} type="tags" />
        ) : (
          data.タグ?.map((tag, idx) => (
            <span key={idx} className={styles.tag}>
              {tag}
            </span>
          ))
        )}
      </div>
    );
  };

  const renderSummary = () => (
    <>
      {renderMeta()}
      {renderTags(false)}
      {data.説明 ? <div className={styles.itemSummaryDesc}>{data.説明}</div> : null}
      {summaryEffectNames.length > 0 ? (
        <div className={styles.itemSummaryEffects}>
          {summaryEffectNames.map(effectName => (
            <span key={effectName} className={styles.itemSummaryEffectChip}>
              {effectName}
            </span>
          ))}
          {remainingEffectCount > 0 ? (
            <span className={styles.itemSummaryEffectMore}>+{remainingEffectCount}</span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  const renderDetailContent = () => (
    <div className={styles.itemDetails}>
      {(data.品質 || editEnabled) && (
        <div className={styles.itemFieldRow}>
          <span className={styles.fieldLabel}>品質</span>
          {renderEditableOrText('品質', data.品質 ?? '', 'select', QUALITY_OPTIONS)}
        </div>
      )}

      {(data.タイプ || editEnabled) && (
        <div className={styles.itemFieldRow}>
          <span className={styles.fieldLabel}>タイプ</span>
          {renderEditableOrText('タイプ', data.タイプ ?? '', 'text')}
        </div>
      )}

      {(displayMode === 'modal-detail' || editEnabled) &&
      (itemCategory === 'equipment' || itemCategory === 'item') &&
      (data.位置 || itemCategory === 'equipment') ? (
        <div className={styles.itemFieldRow}>
          <span className={styles.fieldLabel}>位置</span>
          {renderEditableOrText('位置', data.位置 ?? '', 'text')}
        </div>
      ) : null}

      {(displayMode === 'modal-detail' || editEnabled) &&
      (itemCategory === 'skill' || itemCategory === 'item') &&
      (data.コスト || itemCategory === 'skill') ? (
        <div className={styles.itemFieldRow}>
          <span className={styles.fieldLabel}>コスト</span>
          {renderEditableOrText('コスト', data.コスト ?? '', 'text')}
        </div>
      ) : null}

      {(data.決済 || itemCategory === 'asset') && (
        <div className={styles.itemFieldRow}>
          <span className={styles.fieldLabel}>決済</span>
          {renderEditableOrText('決済', data.決済 ?? '', 'text')}
        </div>
      )}

      {itemCategory === 'item' && (displayMode === 'modal-detail' || editEnabled) ? (
        <div className={styles.itemFieldRow}>
          <span className={styles.fieldLabel}>数量</span>
          {renderEditableOrText('数量', data.数量 ?? 1, 'number')}
        </div>
      ) : null}

      {renderTags()}

      {(data.説明 || editEnabled) && (
        <div className={styles.itemBlock}>
          <div className={styles.itemBlockTitle}>説明</div>
          <div className={styles.itemDesc}>
            {editEnabled && pathPrefix ? (
              <EditableField path={`${pathPrefix}.説明`} value={data.説明 ?? ''} type="textarea" />
            ) : (
              data.説明
            )}
          </div>
        </div>
      )}

      {(!_.isEmpty(data.効果) || editEnabled) && (
        <div className={styles.itemBlock}>
          <div className={styles.itemBlockTitle}>効果</div>
          <div className={styles.itemEffects}>
            {editEnabled && pathPrefix ? (
              <EditableField path={`${pathPrefix}.効果`} value={data.効果 ?? {}} type="keyvalue" />
            ) : displayMode === 'modal-detail' || displayMode === 'compact' ? (
              effectEntries.map(([key, value]) => (
                <div key={key} className={styles.effectRow}>
                  <span className={styles.effectKey}>{key}</span>
                  <span className={styles.effectValue}>{value}</span>
                </div>
              ))
            ) : (
              effectNames.map(effectName => (
                <span key={effectName} className={styles.effectChip}>
                  {effectName}
                </span>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (displayMode === 'compact') {
    return (
      <div className={`${styles.itemCompactCard} ${styles[qualityClass] ?? ''}`.trim()}>
        {renderTitle()}
        <div className={styles.itemCompactBody}>{renderDetailContent()}</div>
      </div>
    );
  }

  if (displayMode === 'modal-detail') {
    return <div className={styles.itemModalDetail}>{renderDetailContent()}</div>;
  }

  return (
    <button
      type="button"
      className={`${styles.itemPanelCard} ${styles[qualityClass] ?? ''}`.trim()}
      onClick={onInspect}
    >
      {renderTitle()}
      <div className={styles.itemPanelBody}>{renderSummary()}</div>
    </button>
  );
};
