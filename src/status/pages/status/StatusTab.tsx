import type { CSSProperties, FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useDeleteConfirm } from '../../core/hooks';
import { useEditorSettingStore, useMvuDataStore } from '../../core/stores';
import {
  exportAvatarFile,
  getAvatarActionState,
  getAvatarRecord,
  getAvatarScopeKey,
  getIconifyMask,
  isAvatarRemovedRecord,
  readAvatarFileAsDataUrl,
  removeAvatarRecord,
  saveAvatarRecord,
} from '../../core/utils';
import {
  Ascension,
  AvatarActionModal,
  AvatarPanel,
  Card,
  ConfirmModal,
  DeleteConfirmModal,
  DetailSheet,
  EditableField,
  ResourceBar,
  StatusEffectDisplay,
} from '../../shared/components';
import { withMvuData, WithMvuDataProps } from '../../shared/hoc';
import styles from './StatusTab.module.scss';

/** フィールドタイプ */
type FieldType = 'text' | 'number' | 'tags' | 'select';

/** 基礎情報フィールド設定 */
interface BasicInfoFieldConfig {
  key: string;
  label: string;
  type: FieldType;
  editable: boolean;
  defaultValue: string | number | string[];
  prefix?: string;
}

// 基礎情報フィールド
const BasicInfoFields: BasicInfoFieldConfig[] = [
  { key: '種族', label: '種族', type: 'text', editable: true, defaultValue: '不明' },
  { key: '職業', label: '職業', type: 'tags', editable: true, defaultValue: [] },
  { key: '身分', label: '身分', type: 'tags', editable: true, defaultValue: [] },
  { key: '生命階層', label: '生命階層', type: 'text', editable: false, defaultValue: '第一階層' },
  { key: 'レベル', label: 'レベル', type: 'number', editable: false, defaultValue: 1, prefix: 'Lv.' },
  { key: '冒険者ランク', label: '冒険者ランク', type: 'text', editable: true, defaultValue: '未評価' },
];

// キャラクタープロフィールフィールド（重複フィールドを除外）
const ProfileInfoFields = BasicInfoFields.filter(
  field => !['生命階層', 'レベル', '冒険者ランク'].includes(field.key),
);

// リソースバー設定
const ResourceFields = [
  {
    label: 'HP',
    currentKey: '生命値',
    maxKey: '生命値上限',
    type: 'hp' as const,
    icon: 'game-icons:heart-plus',
  },
  {
    label: 'MP',
    currentKey: 'マナ値',
    maxKey: 'マナ値上限',
    type: 'mp' as const,
    icon: 'game-icons:water-drop',
  },
  {
    label: 'SP',
    currentKey: '体力値',
    maxKey: '体力値上限',
    type: 'sp' as const,
    icon: 'game-icons:focused-lightning',
  },
] as const;

const AttributeIconMap: Record<string, string> = {
  筋力: 'game-icons:fist',
  敏捷: 'game-icons:wingfoot',
  耐久: 'game-icons:checked-shield',
  知力: 'game-icons:open-book',
  精神: 'game-icons:semi-closed-eye',
};

const getIconStyle = (icon: string) => ({ '--status-icon': getIconifyMask(icon) }) as CSSProperties;

// 登神タグの表示上限
const AscensionPreviewLimit = 5;

// 登神レベル
type AscensionPreviewItem = {
  type: 'kingdom' | 'rank' | 'law' | 'power' | 'element';
  label: string;
};

const AscensionPreviewTypeLabel: Record<AscensionPreviewItem['type'], string> = {
  kingdom: '神国',
  rank: '神位',
  law: '法則',
  power: '権能',
  element: '要素',
};

/**
 * 状態ページの内容コンポーネント
 */
const StatusTabContent: FC<WithMvuDataProps> = ({ data }) => {
  const editEnabled = useEditorSettingStore(state => state.editEnabled);
  const { allocateAttributePoint } = useMvuDataStore();
  const { deleteTarget, setDeleteTarget, handleDelete, cancelDelete, isConfirmOpen } =
    useDeleteConfirm();
  const [activeDetail, setActiveDetail] = useState<'status-effects' | 'ascension' | null>(null);
  const [pendingAttributeName, setPendingAttributeName] = useState<string | null>(null);
  const [isAllocatingAttribute, setIsAllocatingAttribute] = useState(false);
  const [playerAvatarUrl, setPlayerAvatarUrl] = useState<string>('');
  const [playerDefaultAvatarUrl, setPlayerDefaultAvatarUrl] = useState<string>('');
  const [isPlayerAvatarRemoved, setIsPlayerAvatarRemoved] = useState(false);
  const [isPlayerAvatarModalOpen, setIsPlayerAvatarModalOpen] = useState(false);
  const player = data.主人公;
  const avatarScopeKey = useMemo(() => getAvatarScopeKey(), []);

  useEffect(() => {
    let ignore = false;

    const loadPlayerAvatar = async () => {
      try {
        const [savedRecord, resolvedAvatarPath] = await Promise.all([
          getAvatarRecord(avatarScopeKey, 'player', '主人公'),
          SillyTavern.substituteParams('{{userAvatarPath}}') as unknown as Promise<string>,
        ]);
        const normalizedAvatarPath = _.trim(resolvedAvatarPath || '');
        const normalizedDefaultAvatarPath =
          normalizedAvatarPath && normalizedAvatarPath !== '{{userAvatarPath}}'
            ? normalizedAvatarPath
            : '';

        if (!ignore) {
          setPlayerAvatarUrl(isAvatarRemovedRecord(savedRecord) ? '' : (savedRecord?.value ?? ''));
          setIsPlayerAvatarRemoved(isAvatarRemovedRecord(savedRecord));
          setPlayerDefaultAvatarUrl(normalizedDefaultAvatarPath);
        }
      } catch (error) {
        console.warn('[StatusTab] 主人公アバターの読み込みに失敗:', error);
        if (!ignore) {
          setPlayerAvatarUrl('');
          setPlayerDefaultAvatarUrl('');
          setIsPlayerAvatarRemoved(false);
        }
      }
    };

    void loadPlayerAvatar();

    return () => {
      ignore = true;
    };
  }, [avatarScopeKey]);

  const handlePlayerAvatarUpload = async (file: File) => {
    try {
      const nextAvatarUrl = await readAvatarFileAsDataUrl(file);
      if (!nextAvatarUrl) {
        return;
      }

      await saveAvatarRecord({
        scope_key: avatarScopeKey,
        owner_type: 'player',
        owner_name: '主人公',
        source_type: 'upload',
        value: nextAvatarUrl,
      });
      setPlayerAvatarUrl(nextAvatarUrl);
      setIsPlayerAvatarRemoved(false);
    } catch (error) {
      console.warn('[StatusTab] 主人公アバターのアップロードに失敗:', error);
    }
  };

  const handlePlayerAvatarUrlInput = async (url_input: string) => {
    const nextAvatarUrl = _.trim(url_input || '');

    if (!nextAvatarUrl) {
      return;
    }

    try {
      await saveAvatarRecord({
        scope_key: avatarScopeKey,
        owner_type: 'player',
        owner_name: '主人公',
        source_type: 'url',
        value: nextAvatarUrl,
      });
      setPlayerAvatarUrl(nextAvatarUrl);
      setIsPlayerAvatarRemoved(false);
    } catch (error) {
      console.warn('[StatusTab] 主人公アバターのリンク保存に失敗:', error);
    }
  };

  const handlePlayerAvatarExport = async () => {
    if (!playerAvatarDisplayUrl) {
      return;
    }

    try {
      await exportAvatarFile('player-avatar.png', playerAvatarDisplayUrl);
    } catch (error) {
      console.warn('[StatusTab] 主人公アバターのエクスポートに失敗:', error);
    }
  };

  const handlePlayerAvatarReset = async () => {
    try {
      await removeAvatarRecord(avatarScopeKey, 'player', '主人公');
      setPlayerAvatarUrl('');
      setIsPlayerAvatarRemoved(false);
    } catch (error) {
      console.warn('[StatusTab] デフォルトの主人公アバターへの復元に失敗:', error);
    }
  };

  const handlePlayerAvatarRemove = async () => {
    await handlePlayerAvatarReset();
  };

  const handlePlayerAvatarImageError = () => {
    if (playerAvatarUrl) {
      setPlayerAvatarUrl('');
      return;
    }

    setPlayerDefaultAvatarUrl('');
  };

  /**
   * 基礎情報の表示値をフォーマット
   */
  const formatDisplayValue = (field: BasicInfoFieldConfig) => {
    const value = _.get(player, field.key);

    if (field.type === 'tags') {
      // 配列タイプ: 空配列は「なし」を表示
      if (_.isArray(value) && value.length > 0) {
        return value.join(' / ');
      }
      return 'なし';
    }

    const displayValue = value ?? field.defaultValue ?? '';
    // 空文字列は「なし」を表示
    if (displayValue === '') {
      return 'なし';
    }
    return field.prefix ? `${field.prefix}${displayValue}` : displayValue;
  };

  /**
   * 基礎情報フィールドの描画
   */
  const renderBasicInfoField = (field: BasicInfoFieldConfig) => {
    const value = _.get(player, field.key);
    const path = `主人公.${field.key}`;

    // 非編集モードでは常に読み取り専用の値を表示
    if (!editEnabled || !field.editable) {
      return (
        <div key={field.key} className={styles.basicInfoRow}>
          <span className={styles.basicInfoLabel}>{field.label}</span>
          <span className={styles.basicInfoValue}>{formatDisplayValue(field)}</span>
        </div>
      );
    }

    // 編集モードではエディタを表示
    return (
      <div key={field.key} className={styles.basicInfoRow}>
        <span className={styles.basicInfoLabel}>{field.label}</span>
        <EditableField path={path} value={value ?? field.defaultValue} type={field.type} />
      </div>
    );
  };

  /**
   * リソース値の描画（編集モードでは現在値と上限を調整可能）
   */
  const renderResourceField = (field: (typeof ResourceFields)[number]) => {
    const current = _.get(player, field.currentKey, 0);
    const max = _.get(player, field.maxKey, 0);

    if (!editEnabled) {
      return (
        <ResourceBar
          key={field.type}
          label={field.label}
          current={current}
          max={max}
          type={field.type}
          icon={field.icon}
        />
      );
    }

    return (
      <div key={field.type} className={styles.resourceEditRow}>
        <span className={styles.resourceLabel}>{field.label}</span>
        <div className={styles.resourceEditors}>
          <EditableField
            path={`主人公.${field.currentKey}`}
            value={current}
            type="number"
            numberConfig={{ min: 0, max: max, step: 1 }}
          />
          <span className={styles.resourceSeparator}>/</span>
          <EditableField
            path={`主人公.${field.maxKey}`}
            value={max}
            type="number"
            numberConfig={{ min: 0, step: 1 }}
          />
        </div>
      </div>
    );
  };

  const renderExperienceField = () => {
    const max = _.isNumber(player.レベルアップ必要経験) ? player.レベルアップ必要経験 : 999;

    if (!editEnabled) {
      return (
        <ResourceBar
          label="EXP"
          current={player.累計経験値 ?? 0}
          max={max}
          type="exp"
          icon="game-icons:round-star"
        />
      );
    }

    return (
      <div className={styles.resourceEditRow}>
        <span className={styles.resourceLabel}>EXP</span>
        <div className={styles.resourceEditors}>
          <EditableField
            path="主人公.累計経験値"
            value={player.累計経験値 ?? 0}
            type="number"
            numberConfig={{
              min: 0,
              max: _.isNumber(player.レベルアップ必要経験) ? player.レベルアップ必要経験 - 1 : undefined,
              step: 1,
            }}
          />
          <span className={styles.resourceSeparator}>/</span>
          <span className={styles.expMax}>
            {_.isNumber(player.レベルアップ必要経験) ? player.レベルアップ必要経験 : 'MAX'}
          </span>
        </div>
      </div>
    );
  };

  /** 確認後、自由属性ポイントを 1 消費して属性を強化。送信中は並行書き込みを回避 */
  const handleAttributeAllocationConfirm = async () => {
    if (!pendingAttributeName || isAllocatingAttribute) return;

    setIsAllocatingAttribute(true);
    const success = await allocateAttributePoint(pendingAttributeName);
    setIsAllocatingAttribute(false);
    setPendingAttributeName(null);

    if (success) {
      toastr.success(`${pendingAttributeName} +1`);
    } else {
      toastr.error('加点に失敗しました。残りの属性ポイントまたは属性上限を確認してください');
    }
  };

  const statusEffects = player.状態効果 ?? {};
  const effectEntries = Object.entries(statusEffects);
  const effectStats = {
    total: effectEntries.length,
  };

  const ascension = player.登神長階;
  const ascensionParts = [
    Object.keys(ascension?.要素 ?? {}).length
      ? `要素 ${Object.keys(ascension?.要素 ?? {}).length}`
      : '',
    Object.keys(ascension?.権能 ?? {}).length
      ? `権能 ${Object.keys(ascension?.権能 ?? {}).length}`
      : '',
    Object.keys(ascension?.法則 ?? {}).length
      ? `法則 ${Object.keys(ascension?.法則 ?? {}).length}`
      : '',
    ascension?.神位 ? `神位 ${ascension.神位}` : '',
    ascension?.神国?.名称 ? `神国 ${ascension.神国.名称}` : '',
  ];

  const ascensionSummary = ascension?.有効化
    ? _.compact(ascensionParts).join(' · ') || '有効'
    : '未開放';

  // 登神プレビューは高位から低位の順に具体名を表示
  const ascensionPreviewItems: AscensionPreviewItem[] = ascension?.有効化
    ? [
        ascension?.神国?.名称 ? { type: 'kingdom' as const, label: ascension.神国.名称 } : null,
        ascension?.神位 ? { type: 'rank' as const, label: ascension.神位 } : null,
        ...Object.keys(ascension?.法則 ?? {}).map(label => ({ type: 'law' as const, label })),
        ...Object.keys(ascension?.権能 ?? {}).map(label => ({ type: 'power' as const, label })),
        ...Object.keys(ascension?.要素 ?? {}).map(label => ({ type: 'element' as const, label })),
      ].filter((item): item is AscensionPreviewItem => Boolean(item?.label))
    : [];
  const visibleAscensionPreviewItems = ascensionPreviewItems.slice(0, AscensionPreviewLimit);
  const hiddenAscensionPreviewCount = Math.max(
    ascensionPreviewItems.length - visibleAscensionPreviewItems.length,
    0,
  );
  const playerAvatarDisplayUrl = isPlayerAvatarRemoved
    ? ''
    : playerAvatarUrl || playerDefaultAvatarUrl;

  const playerAvatarActionState = getAvatarActionState({
    current_url: playerAvatarDisplayUrl,
    custom_url: playerAvatarUrl,
    default_url: playerDefaultAvatarUrl,
    removed: isPlayerAvatarRemoved,
  });

  return (
    <div className={styles.statusTab}>
      <Card
        className={`${styles.statusTabCard} ${styles.overviewCard}`}
        bodyClassName={styles.overviewCardBody}
      >
        <div className={styles.dashboardGrid}>
          <div className={styles.leftColumn}>
            <section className={styles.corePanel}>
              <div className={styles.heroRow}>
                <AvatarPanel
                  src={playerAvatarDisplayUrl}
                  alt="主人公アバター"
                  size="lg"
                  className={styles.heroAvatar}
                  onClick={() => setIsPlayerAvatarModalOpen(true)}
                  onImageError={handlePlayerAvatarImageError}
                />
                <div className={styles.heroIdentity}>
                  <div className={styles.heroTitleRow}>
                    <span className={styles.heroLevel}>Lv.{player.レベル ?? 1}</span>
                    <span className={styles.heroTier}>{player.生命階層 || '生命階層未記録'}</span>
                  </div>
                  <div className={styles.heroSubtitle}>
                    {editEnabled ? (
                      <>
                        <span className={styles.heroSubtitleLabel}>冒険者ランク：</span>
                        <EditableField
                          path="主人公.冒険者ランク"
                          value={player.冒険者ランク || '未評価'}
                          type="text"
                        />
                      </>
                    ) : (
                      <span>冒険者ランク：{player.冒険者ランク || '未評価'}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                className={styles.ascensionPreview}
                onClick={() => setActiveDetail('ascension')}
                type="button"
              >
                <div className={styles.ascensionPreviewHeader}>
                  <span className={styles.ascensionPreviewTitle}>
                    <span
                      className={styles.sectionIcon}
                      style={getIconStyle('game-icons:spiked-halo')}
                    />
                    登神長階
                  </span>
                  <i className={`fa-solid fa-chevron-right ${styles.detailEntryChevron}`} />
                </div>
                {visibleAscensionPreviewItems.length > 0 ? (
                  <div className={styles.ascensionPreviewTags}>
                    {visibleAscensionPreviewItems.map((item, index) => (
                      <span
                        key={`${item.type}-${item.label}-${index}`}
                        className={`${styles.ascensionPreviewTag} ${styles[`ascensionTag${_.upperFirst(item.type)}`] ?? ''}`.trim()}
                      >
                        <span>{AscensionPreviewTypeLabel[item.type]}</span>
                        <strong>{item.label}</strong>
                      </span>
                    ))}
                    {hiddenAscensionPreviewCount > 0 && (
                      <span className={styles.ascensionPreviewTag}>
                        +{hiddenAscensionPreviewCount}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className={styles.ascensionPreviewEmpty}>未開放</span>
                )}
              </button>
            </section>

            <section className={styles.resourcePanel}>
              <div className={styles.resources}>
                {ResourceFields.map(field => renderResourceField(field))}
                {renderExperienceField()}
              </div>
            </section>
          </div>

          <div className={styles.rightColumn}>
            <section className={styles.infoPanel}>
              <span className={styles.sectionTitle}>
                <span className={styles.sectionIcon} style={getIconStyle('game-icons:id-card')} />
                キャラクタープロフィール
              </span>
              <div className={styles.basicInfo}>
                {ProfileInfoFields.map(field => renderBasicInfoField(field))}
              </div>
            </section>

            <section className={styles.attributePanel}>
              <div className={styles.attributePanelHeader}>
                <span className={styles.sectionTitle}>
                  <span className={styles.sectionIcon} style={getIconStyle('game-icons:skills')} />
                  コア属性
                </span>
                <div className={styles.attributePointPill}>
                  <span>自由属性ポイント</span>
                  {editEnabled ? (
                    <EditableField
                      path="主人公.属性ポイント"
                      value={player.属性ポイント ?? 0}
                      type="number"
                      numberConfig={{ min: 0, step: 1 }}
                    />
                  ) : (
                    <strong>{player.属性ポイント ?? 0}</strong>
                  )}
                </div>
              </div>
              <div className={styles.attributeGrid}>
                {_.map(player.属性, (value, key) => (
                  <div key={key} className={styles.attributeItem}>
                    <span className={styles.attributeLabelGroup}>
                      {AttributeIconMap[key] && (
                        <span
                          className={styles.attributeIcon}
                          style={getIconStyle(AttributeIconMap[key])}
                        />
                      )}
                      <span className={styles.attributeLabel}>{key}</span>
                    </span>
                    {editEnabled ? (
                      <EditableField
                        path={`主人公.属性.${key}`}
                        value={value ?? 0}
                        type="number"
                        numberConfig={{ min: 0, max: 20, step: 1 }}
                      />
                    ) : (
                      <span className={styles.attributeValueGroup}>
                        <span className={styles.attributeValue}>{value ?? 0}</span>
                        {(player.属性ポイント ?? 0) >= 1 && (value ?? 0) <= 19 && (
                          <button
                            type="button"
                            className={styles.attributePlusBtn}
                            onClick={() => setPendingAttributeName(key)}
                            disabled={isAllocatingAttribute}
                            title="自由属性ポイントを 1 消費"
                          >
                            <i className="fa-solid fa-plus" />
                          </button>
                        )}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className={styles.detailEntryGrid}>
          <button
            className={styles.detailEntryCard}
            onClick={() => setActiveDetail('status-effects')}
            type="button"
          >
            <div className={styles.detailEntryHeader}>
              <div>
                <div className={styles.detailEntryTitle}>
                  <span
                    className={styles.sectionIcon}
                    style={getIconStyle('game-icons:vitruvian-man')}
                  />
                  状態効果
                </div>
                <div className={styles.detailEntrySummary}>
                  <StatusEffectDisplay
                    effects={statusEffects}
                    mode="chips"
                    compact
                    maxVisible={4}
                    showRemainingCount
                    emptyText="効果なし"
                  />
                </div>
              </div>
              <div className={styles.detailEntryMeta}>
                <span className={styles.detailEntryCount}>{effectStats.total}</span>
                <i className={`fa-solid fa-chevron-right ${styles.detailEntryChevron}`} />
              </div>
            </div>
          </button>
        </div>
      </Card>

      <DetailSheet
        open={activeDetail === 'status-effects'}
        title="状態効果"
        subtitle={effectStats.total ? Object.keys(statusEffects).join('、') : '効果なし'}
        onClose={() => setActiveDetail(null)}
      >
        <StatusEffectDisplay
          effects={statusEffects}
          editEnabled={editEnabled}
          pathPrefix="主人公.状態効果"
          onDelete={(name: string) =>
            setDeleteTarget({
              type: '状態効果',
              path: `主人公.状態効果.${name}`,
              name,
            })
          }
        />
      </DetailSheet>

      <DetailSheet
        open={activeDetail === 'ascension'}
        title="登神長階"
        subtitle={ascensionSummary}
        onClose={() => setActiveDetail(null)}
      >
        <Ascension data={player.登神長階} editEnabled={editEnabled} pathPrefix="主人公.登神長階" />
      </DetailSheet>

      <AvatarActionModal
        open={isPlayerAvatarModalOpen}
        title="主人公アバター"
        subtitle={
          playerAvatarDisplayUrl
            ? 'ローカル画像のインポート、画像リンクの保存、現在のアバターのエクスポート、酒館のデフォルトアバターへの復元に対応しています。'
            : '現在アバターが未設定です。画像のインポート、画像リンクの入力、酒館のデフォルトアバターへの復元ができます。'
        }
        linkPlaceholder="主人公アバターの画像リンクを入力してください"
        canExport={playerAvatarActionState.canExport}
        canDelete={false}
        canReset={playerAvatarActionState.canReset}
        deleteLabel="アバターを削除"
        resetLabel="デフォルトに戻す"
        onClose={() => setIsPlayerAvatarModalOpen(false)}
        onUpload={handlePlayerAvatarUpload}
        onSubmitLink={handlePlayerAvatarUrlInput}
        onExport={handlePlayerAvatarExport}
        onDelete={handlePlayerAvatarRemove}
        onReset={handlePlayerAvatarReset}
      />

      <DeleteConfirmModal
        open={isConfirmOpen}
        target={deleteTarget}
        onConfirm={handleDelete}
        onCancel={cancelDelete}
      />

      <ConfirmModal
        open={pendingAttributeName !== null}
        title="属性ポイントの割り当てを確認"
        rows={[
          { label: '対象属性', value: pendingAttributeName ?? '' },
          { label: 'コスト', value: '自由属性ポイント 1 点' },
        ]}
        buttons={[
          {
            text: '加点を確認',
            variant: 'primary',
            onClick: () => void handleAttributeAllocationConfirm(),
            disabled: isAllocatingAttribute,
          },
          {
            text: 'キャンセル',
            variant: 'secondary',
            onClick: () => setPendingAttributeName(null),
            disabled: isAllocatingAttribute,
          },
        ]}
        onClose={() => {
          if (!isAllocatingAttribute) setPendingAttributeName(null);
        }}
        closeOnOverlay={!isAllocatingAttribute}
      />
    </div>
  );
};

/**
 * 状態ページコンポーネント（HOC でラップ）
 */
export const StatusTab = withMvuData({ baseClassName: styles.statusTab })(StatusTabContent);
