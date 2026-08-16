import { FC } from 'react';
import { EditableField } from '../EditableField';
import { EmptyHint } from '../EmptyHint';
import { SelectEditorOption } from '../editors';
import styles from './StatusEffectDisplay.module.scss';

export type StatusEffectItem = {
  タイプ?: string;
  効果?: string;
  スタック数?: number;
  残り時間?: string;
  出典?: string;
};

export interface StatusEffectDisplayProps {
  effects: Record<string, StatusEffectItem>;
  mode?: 'full' | 'chips';
  compact?: boolean;
  editEnabled?: boolean;
  pathPrefix?: string;
  emptyText?: string;
  /** chips モードで最大表示する数（超過分は +N で表示） */
  maxVisible?: number;
  /** chips モードで残り数を表示するかどうか */
  showRemainingCount?: boolean;
  onDelete?: (name: string) => void;
}

const StatusEffectTypeOptions: SelectEditorOption[] = [
  { label: 'バフ', value: 'バフ' },
  { label: 'デバフ', value: 'デバフ' },
  { label: '特殊', value: '特殊' },
];

const getToneClass = (type: string | undefined) => {
  if (type === 'デバフ') {
    return styles.effectDebuff;
  }

  if (type === '特殊') {
    return styles.effectSpecial;
  }

  return styles.effectBuff;
};

const getChipToneClass = (type: string | undefined) => {
  if (type === 'デバフ') {
    return styles.buffChipDebuff;
  }

  if (type === '特殊') {
    return styles.buffChipSpecial;
  }

  return styles.buffChipBuff;
};

const renderChips = (
  effects: Record<string, StatusEffectItem>,
  compact: boolean,
  emptyText: string,
  maxVisible: number | undefined,
  showRemainingCount: boolean,
) => {
  const entries = Object.entries(effects);

  if (!entries.length) {
    return <span className={styles.buffEmpty}>{emptyText}</span>;
  }

  const visibleEntries = typeof maxVisible === 'number' ? entries.slice(0, maxVisible) : entries;
  const remainingCount = Math.max(entries.length - visibleEntries.length, 0);

  return (
    <div className={`${styles.buffChipGroup} ${compact ? styles.buffChipGroupCompact : ''}`}>
      {visibleEntries.map(([name, effect]) => (
        <span
          key={name}
          className={`${styles.buffChip} ${getChipToneClass(effect.タイプ)}`}
          title={effect.効果 || name}
        >
          <span className={styles.buffChipName}>{name}</span>
          {typeof effect.スタック数 === 'number' && effect.スタック数 > 1 ? (
            <span className={styles.buffChipMeta}>x{effect.スタック数}</span>
          ) : null}
          {effect.残り時間 ? <span className={styles.buffChipMeta}>{effect.残り時間}</span> : null}
        </span>
      ))}
      {showRemainingCount && remainingCount > 0 ? (
        <span className={styles.buffChipMore}>+{remainingCount}</span>
      ) : null}
    </div>
  );
};

export const StatusEffectDisplay: FC<StatusEffectDisplayProps> = ({
  effects,
  mode = 'full',
  compact = false,
  editEnabled = false,
  pathPrefix,
  emptyText = '状態効果なし',
  maxVisible,
  showRemainingCount = true,
  onDelete,
}) => {
  const entries = Object.entries(effects);

  if (mode === 'chips') {
    return renderChips(effects, compact, emptyText, maxVisible, showRemainingCount);
  }

  if (!entries.length) {
    return <EmptyHint className={styles.emptyEffects} text={emptyText} />;
  }

  return (
    <div className={styles.statusEffects}>
      {entries.map(([name, effect]) => {
        const toneClass = getToneClass(effect.タイプ);
        const basePath = pathPrefix ? `${pathPrefix}.${name}` : '';

        return (
          <div
            key={name}
            className={`${styles.effectItem} ${toneClass} ${editEnabled ? styles.effectItemEdit : ''}`}
          >
            {editEnabled && basePath ? (
              <>
                <div className={styles.effectEditHeader}>
                  <div className={styles.effectEditHeaderContent}>
                    <div className={styles.effectHeaderMain}>
                      <span className={styles.effectName}>{name}</span>
                      <EditableField
                        path={`${basePath}.タイプ`}
                        value={effect.タイプ ?? 'バフ'}
                        type="select"
                        selectConfig={{ options: StatusEffectTypeOptions }}
                      />
                    </div>

                    <div className={styles.effectEditMetaGrid}>
                      <div className={styles.effectMetaItem}>
                        <span className={styles.effectMetaLabel}>スタック数</span>
                        <EditableField
                          path={`${basePath}.スタック数`}
                          value={effect.スタック数 ?? 1}
                          type="number"
                          numberConfig={{ min: 1, step: 1 }}
                        />
                      </div>
                      <div className={styles.effectMetaItem}>
                        <span className={styles.effectMetaLabel}>残り時間</span>
                        <EditableField
                          path={`${basePath}.残り時間`}
                          value={effect.残り時間 ?? ''}
                          type="text"
                        />
                      </div>
                    </div>
                  </div>

                  {onDelete ? (
                    <button
                      className={styles.effectDeleteBtn}
                      onClick={() => onDelete(name)}
                      title="状態効果を削除"
                      type="button"
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  ) : null}
                </div>

                <div className={styles.effectEditSection}>
                  <span className={styles.effectEditLabel}>効果</span>
                  <EditableField
                    path={`${basePath}.効果`}
                    value={effect.効果 ?? ''}
                    type="textarea"
                  />
                </div>

                <div className={styles.effectEditSection}>
                  <span className={styles.effectEditLabel}>出典</span>
                  <EditableField path={`${basePath}.出典`} value={effect.出典 ?? ''} type="text" />
                </div>
              </>
            ) : (
              <>
                <div className={styles.effectReadHeader}>
                  <div className={styles.effectHeaderMain}>
                    <span className={styles.effectName}>{name}</span>
                    {effect.タイプ ? <span className={styles.effectType}>{effect.タイプ}</span> : null}
                  </div>
                  <div className={styles.effectMetaInline}>
                    {typeof effect.スタック数 === 'number' && effect.スタック数 > 1 ? (
                      <span className={styles.effectStack}>x{effect.スタック数}</span>
                    ) : null}
                    {effect.残り時間 ? (
                      <span className={styles.effectTime}>{effect.残り時間}</span>
                    ) : null}
                  </div>
                </div>

                {effect.効果 ? <div className={styles.effectDesc}>{effect.効果}</div> : null}
                {effect.出典 ? (
                  <div className={styles.effectSource}>出典：{effect.出典}</div>
                ) : null}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
