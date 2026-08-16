import {
  ChangeEvent,
  FC,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDeleteConfirm } from '../../core/hooks';
import { useEditorSettingStore, useMvuDataStore } from '../../core/stores';
import {
  buildSessionKey,
  createPartnerGalleryItem,
  exportAvatarFile,
  getAssetCollectionSource,
  getAssetFilterOptions,
  getAvatarActionState,
  getAvatarRecordsByScopeKey,
  getAvatarScopeKey,
  getChatPartnerGalleryMap,
  getDefaultPartnerAvatarMap,
  getFilteredAssetEntries,
  getPartnerGalleryRecordsByScopeKey,
  getPredefinedPartnerGalleryMap,
  markAvatarAsRemoved,
  PartnerGalleryItem,
  readAvatarFileAsDataUrl,
  readSessionState,
  removeAvatarRecord,
  removePartnerGalleryRecord,
  saveAvatarRecord,
  savePartnerGalleryItems,
  writeSessionState,
} from '../../core/utils';
import {
  Ascension,
  AvatarActionModal,
  AvatarPanel,
  Card,
  DeleteConfirmModal,
  EditableField,
  EmptyHint,
  IconTitle,
  ItemDetail,
  StatusEffectDisplay,
} from '../../shared/components';
import { withMvuData, WithMvuDataProps } from '../../shared/hoc';
import styles from './DestinyTab.module.scss';

/** フィールドタイプ */
type FieldType = 'text' | 'number' | 'textarea' | 'tags' | 'toggle' | 'keyvalue';
type PartnerListCategory = 'all' | 'present' | 'away' | 'contracted';
type PartnerDetailSection =
  | 'overview'
  | 'status'
  | 'equipment'
  | 'skills'
  | 'inventory'
  | 'assets'
  | 'gallery'
  | 'background';

type PartnerRecord = Record<string, any>;
type PartnerAssetItem = Record<string, any>;
type PartnerAssetSectionConfig = {
  key: Extract<PartnerDetailSection, 'equipment' | 'skills' | 'inventory' | 'assets'>;
  label: string;
  dataKey: '装備' | 'スキル' | 'インベントリ' | '資産';
  filterKey: string;
  itemCategory: 'equipment' | 'skill' | 'item' | 'asset';
  emptyText: string;
  getTitleSuffix: (item: PartnerAssetItem) => ReactNode;
};

const ALL_FILTER = '全部';

const PartnerListCategories: Array<{
  key: PartnerListCategory;
  label: string;
  matches: (partner: PartnerRecord) => boolean;
}> = [
  { key: 'all', label: '全部', matches: () => true },
  { key: 'present', label: '在席', matches: partner => Boolean(partner.在席) },
  { key: 'away', label: '不在席', matches: partner => !partner.在席 },
  { key: 'contracted', label: '契約済み', matches: partner => Boolean(partner.命定契約) },
];

const PartnerAssetSections: PartnerAssetSectionConfig[] = [
  {
    key: 'equipment',
    label: '装備',
    dataKey: '装備',
    filterKey: 'タイプ',
    itemCategory: 'equipment',
    emptyText: '装備なし',
    getTitleSuffix: item =>
      item.位置 ? <span className={styles.equipmentSlot}>[{item.位置}]</span> : null,
  },
  {
    key: 'skills',
    label: 'スキル',
    dataKey: 'スキル',
    filterKey: 'タイプ',
    itemCategory: 'skill',
    emptyText: 'スキルなし',
    getTitleSuffix: item =>
      item.コスト ? <span className={styles.skillCost}>{item.コスト}</span> : null,
  },
  {
    key: 'inventory',
    label: 'インベントリ',
    dataKey: 'インベントリ',
    filterKey: 'タイプ',
    itemCategory: 'item',
    emptyText: 'インベントリは空です',
    getTitleSuffix: item =>
      item.数量 ? <span className={styles.skillCost}>x{item.数量}</span> : null,
  },
  {
    key: 'assets',
    label: '資産',
    dataKey: '資産',
    filterKey: 'タイプ',
    itemCategory: 'asset',
    emptyText: '資産なし',
    getTitleSuffix: () => null,
  },
];

/**
 * 命定ページの内容コンポーネント
 */
const DestinyTabContent: FC<WithMvuDataProps> = ({ data }) => {
  const editEnabled = useEditorSettingStore(state => state.editEnabled);
  const { updateField } = useMvuDataStore();
  const { deleteTarget, setDeleteTarget, handleDelete, cancelDelete, isConfirmOpen } =
    useDeleteConfirm();
  const destinyPoints = data.運命ポイント;
  const partners = data.関係一覧;
  const partnerEntries = useMemo(() => Object.entries(partners ?? {}), [partners]);
  const partnerCategoryStorageKey = buildSessionKey('destiny', 'partner-category');
  const partnerNameStorageKey = buildSessionKey('destiny', 'partner-name');
  const partnerMobileDetailOpenStorageKey = buildSessionKey(
    'destiny',
    'partner-mobile-detail-open',
  );
  const partnerDetailStorageKey = buildSessionKey('destiny', 'partner-detail');
  const partnerFilterStorageKey = buildSessionKey('destiny', 'partner-filter');
  const partnerSearchStorageKey = buildSessionKey('destiny', 'partner-search');
  const partnerLabelStorageKey = buildSessionKey('destiny', 'partner-label');
  const avatarScopeKey = useMemo(() => getAvatarScopeKey(), []);

  const [activePartnerListCategory, setActivePartnerListCategory] = useState<PartnerListCategory>(
    () => readSessionState<PartnerListCategory>(partnerCategoryStorageKey, 'present'),
  );
  const [selectedPartnerName, setSelectedPartnerName] = useState<string | null>(() =>
    readSessionState<string | null>(partnerNameStorageKey, null),
  );
  const [isPartnerDetailOpen, setIsPartnerDetailOpen] = useState<boolean>(() =>
    readSessionState<boolean>(partnerMobileDetailOpenStorageKey, false),
  );
  const [activePartnerDetailSection, setActivePartnerDetailSection] =
    useState<PartnerDetailSection>(() =>
      readSessionState<PartnerDetailSection>(partnerDetailStorageKey, 'overview'),
    );
  const [activePartnerAssetFilter, setActivePartnerAssetFilter] = useState<string>(() =>
    readSessionState<string>(partnerFilterStorageKey, ALL_FILTER),
  );
  const [partnerSearchKeyword, setPartnerSearchKeyword] = useState<string>(() =>
    readSessionState<string>(partnerSearchStorageKey, ''),
  );
  const [activePartnerLabel, setActivePartnerLabel] = useState<string | null>(() =>
    readSessionState<string | null>(partnerLabelStorageKey, null),
  );
  const [partnerAvatarMap, setPartnerAvatarMap] = useState<Record<string, string>>({});
  const [partnerDefaultAvatarMap, setPartnerDefaultAvatarMap] = useState<Record<string, string>>(
    {},
  );
  const [partnerAvatarRemovedMap, setPartnerAvatarRemovedMap] = useState<Record<string, boolean>>(
    {},
  );
  const [partnerGalleryMap, setPartnerGalleryMap] = useState<Record<string, PartnerGalleryItem[]>>(
    {},
  );
  const [partnerExternalGalleryMap, setPartnerExternalGalleryMap] = useState<
    Record<string, PartnerGalleryItem[]>
  >({});
  const [partnerPredefinedGalleryMap, setPartnerPredefinedGalleryMap] = useState<
    Record<string, PartnerGalleryItem[]>
  >({});
  const [isPartnerGalleryLoading, setIsPartnerGalleryLoading] = useState(false);
  const [activeAvatarPartnerName, setActiveAvatarPartnerName] = useState<string | null>(null);
  const [editingGalleryItemId, setEditingGalleryItemId] = useState<string | null>(null);
  const [editingGalleryTitle, setEditingGalleryTitle] = useState('');
  const [pendingGalleryDelete, setPendingGalleryDelete] = useState<{
    partnerName: string;
    itemId: string;
  } | null>(null);
  const [activeGalleryPreview, setActiveGalleryPreview] = useState<{
    partnerName: string;
    itemId: string;
  } | null>(null);

  const partnerCategoryEntries = useMemo(() => {
    return PartnerListCategories.map(category => {
      const entries = partnerEntries.filter(([, partner]) => category.matches(partner));
      return {
        ...category,
        count: entries.length,
        entries,
      };
    });
  }, [partnerEntries]);

  /** 全パートナータグ（タグフィルタ用） */
  const allPartnerLabels = useMemo(() => {
    const labelSet = new Set<string>();
    partnerEntries.forEach(([, partner]) => {
      (partner.タグ ?? []).forEach(tag => labelSet.add(tag));
    });
    return Array.from(labelSet);
  }, [partnerEntries]);

  const activePartnerListCategoryConfig =
    partnerCategoryEntries.find(category => category.key === activePartnerListCategory) ??
    partnerCategoryEntries[0];

  /** 現在表示中のパートナー: 固定カテゴリ + タグフィルタ + キーワード検索の重ね合わせ */
  const visiblePartnerEntries = useMemo(() => {
    let entries = activePartnerListCategoryConfig?.entries ?? [];

    if (activePartnerLabel) {
      entries = entries.filter(([, partner]) => (partner.タグ ?? []).includes(activePartnerLabel));
    }

    const keyword = partnerSearchKeyword.trim().toLowerCase();
    if (keyword) {
      entries = entries.filter(([name, partner]) => {
        const identity = Array.isArray(partner.身分)
          ? partner.身分.join(' ')
          : (partner.身分 ?? '');
        const occupation = Array.isArray(partner.職業)
          ? partner.職業.join(' ')
          : (partner.職業 ?? '');
        const haystack = [name, partner.種族 ?? '', identity, occupation, ...(partner.タグ ?? [])]
          .join(' ')
          .toLowerCase();
        return haystack.includes(keyword);
      });
    }

    return entries;
  }, [activePartnerLabel, activePartnerListCategoryConfig, partnerSearchKeyword]);
  const activePartnerName =
    selectedPartnerName && visiblePartnerEntries.some(([name]) => name === selectedPartnerName)
      ? selectedPartnerName
      : (visiblePartnerEntries[0]?.[0] ?? null);
  const activePartner = activePartnerName ? partners?.[activePartnerName] : null;
  const isPartnerDetailVisible = Boolean(isPartnerDetailOpen && activePartnerName && activePartner);
  const activePartnerAssetSection =
    PartnerAssetSections.find(section => section.key === activePartnerDetailSection) ?? null;

  const activePartnerAssetSource = useMemo(() => {
    if (!activePartner || !activePartnerAssetSection) return {};
    return getAssetCollectionSource(activePartner, activePartnerAssetSection.dataKey);
  }, [activePartner, activePartnerAssetSection]);

  const activePartnerAssetEntries = useMemo(() => {
    if (!activePartnerAssetSection) return [];

    return getFilteredAssetEntries(
      activePartnerAssetSource,
      activePartnerAssetSection.filterKey,
      activePartnerAssetFilter,
      ALL_FILTER,
    );
  }, [activePartnerAssetFilter, activePartnerAssetSection, activePartnerAssetSource]);

  const activePartnerAssetFilterOptions = useMemo(() => {
    if (!activePartnerAssetSection) return [ALL_FILTER];

    return getAssetFilterOptions(
      activePartnerAssetSource,
      activePartnerAssetSection.filterKey,
      ALL_FILTER,
    );
  }, [activePartnerAssetSection, activePartnerAssetSource]);
  const activeGalleryPreviewItem = activeGalleryPreview
    ? (partnerGalleryMap[activeGalleryPreview.partnerName] ?? []).find(
        item => item.id === activeGalleryPreview.itemId,
      )
    : null;
  const pendingGalleryDeleteTarget = pendingGalleryDelete
    ? {
        type: 'パートナーアルバム画像',
        path: '',
        name: pendingGalleryDelete.partnerName,
      }
    : null;

  /**
   * 編集可能フィールド行の描画
   * 非編集モード: 元のレイアウトを維持
   * 編集モード: EditableField に置き換え
   */
  const renderEditableRow = (
    label: string,
    path: string,
    value: string | number | boolean | string[] | Record<string, any> | undefined,
    type: FieldType,
    rowClass: string,
    labelClass: string,
    valueClass: string,
    config?: {
      numberConfig?: { min?: number; max?: number; step?: number };
      toggleConfig?: { labelOff?: string; labelOn?: string; size?: 'sm' | 'md' };
    },
  ) => {
    // 非編集モード: 空の値は表示しない
    if (!editEnabled && (value === undefined || value === null || value === '')) return null;

    // 表示値をフォーマット
    const formatDisplayValue = () => {
      if (value === undefined || value === null) return 'なし';
      if (type === 'tags' && Array.isArray(value)) {
        return value.length > 0 ? value.join(' / ') : 'なし';
      }
      if (type === 'toggle') return value ? 'はい' : 'いいえ';
      if (type === 'keyvalue') {
        if (_.isEmpty(value)) return 'なし';
        return _.map(value as Record<string, unknown>, (effectValue, effectKey) => {
          const displayValue =
            effectValue === undefined || effectValue === null || effectValue === ''
              ? 'なし'
              : String(effectValue);
          return `${effectKey}: ${displayValue}`;
        }).join(' / ');
      }
      if (value === '') return 'なし';
      return String(value);
    };

    return (
      <div className={rowClass}>
        <span className={labelClass}>{label}</span>
        {editEnabled ? (
          <EditableField
            path={path}
            value={
              value ??
              (type === 'number'
                ? 0
                : type === 'toggle'
                  ? false
                  : type === 'tags'
                    ? []
                    : type === 'keyvalue'
                      ? {}
                      : '')
            }
            type={type}
            {...config}
          />
        ) : (
          <span className={valueClass}>{formatDisplayValue()}</span>
        )}
      </div>
    );
  };

  /**
   * 読み取り専用フィールド行の描画（レベル/生命階層等の編集不可フィールド）
   */
  const renderReadonlyRow = (
    label: string,
    value: string | number | undefined,
    rowClass: string,
    labelClass: string,
    valueClass: string,
  ) => {
    if (value === undefined || value === null || value === '') return null;
    return (
      <div className={rowClass}>
        <span className={labelClass}>{label}</span>
        <span className={valueClass}>{value}</span>
      </div>
    );
  };

  const renderAffectionBar = (value: number) => {
    const percentage = Math.abs(value);
    const isNegative = value < 0;

    return (
      <div className={styles.affectionBar}>
        <div className={styles.affectionBarTrack}>
          <div
            className={`${styles.affectionBarFill} ${isNegative ? styles.isNegative : ''}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`${styles.affectionBarValue} ${isNegative ? styles.isNegative : ''}`}>
          {value}
        </span>
      </div>
    );
  };

  const renderPartnerAssetSection = (
    partnerName: string,
    sectionConfig: PartnerAssetSectionConfig,
  ) => {
    const source = activePartnerAssetSource;
    const sectionClassName =
      sectionConfig.key === 'equipment' ? styles.partnerEquipment : styles.partnerSkills;
    const listClassName =
      sectionConfig.key === 'equipment' ? styles.equipmentList : styles.skillList;
    const totalCount = Object.keys(source).length;

    if (totalCount === 0 && !editEnabled) {
      return <EmptyHint className={styles.emptyHint} text={sectionConfig.emptyText} />;
    }

    return (
      <div className={sectionClassName}>
        <div className={styles.partnerAssetHeader}>
          <div>
            <div className={styles.sectionLabel}>{sectionConfig.label}</div>
            <div className={styles.partnerAssetSummary}>
              現在 {activePartnerAssetEntries.length} / {totalCount} 件を表示
            </div>
          </div>
        </div>

        {activePartnerAssetFilterOptions.length > 1 && (
          <div className={styles.partnerAssetFilterBar}>
            {activePartnerAssetFilterOptions.map(option => {
              const optionCount =
                option === ALL_FILTER
                  ? totalCount
                  : _.size(
                      _.pickBy(
                        source,
                        (item: PartnerAssetItem) => _.get(item, sectionConfig.filterKey) === option,
                      ),
                    );

              return (
                <button
                  key={option}
                  type="button"
                  className={`${styles.partnerAssetFilterBtn} ${activePartnerAssetFilter === option ? styles.partnerAssetFilterBtnActive : ''}`}
                  onClick={() => setActivePartnerAssetFilter(option)}
                >
                  <span>{option}</span>
                  <span className={styles.partnerAssetFilterCount}>{optionCount}</span>
                </button>
              );
            })}
          </div>
        )}

        {activePartnerAssetEntries.length > 0 ? (
          <div className={listClassName}>
            {activePartnerAssetEntries.map(([name, item]) => (
              <ItemDetail
                key={name}
                name={name}
                data={item}
                titleSuffix={sectionConfig.getTitleSuffix(item)}
                editEnabled={editEnabled}
                pathPrefix={`関係一覧.${partnerName}.${sectionConfig.dataKey}.${name}`}
                onDelete={() =>
                  setDeleteTarget({
                    type: sectionConfig.label,
                    path: `関係一覧.${partnerName}.${sectionConfig.dataKey}.${name}`,
                    name,
                  })
                }
                itemCategory={sectionConfig.itemCategory}
                displayMode="compact"
              />
            ))}
          </div>
        ) : (
          <EmptyHint
            className={styles.emptyHint}
            text={`${activePartnerAssetFilter}分類の${sectionConfig.label}なし`}
          />
        )}
      </div>
    );
  };

  const renderStatusEffectsSection = (
    effects: Record<string, Record<string, any>> | undefined,
    partnerName: string,
  ) => {
    if (_.isEmpty(effects) && !editEnabled) {
      return (
        <div className={styles.partnerSkills}>
          <div className={styles.sectionLabel}>状態効果</div>
          <EmptyHint className={styles.emptyHint} text="バフなし" />
        </div>
      );
    }

    return (
      <div className={styles.partnerSkills}>
        <div className={styles.sectionLabel}>状態効果</div>
        <StatusEffectDisplay
          effects={effects ?? {}}
          editEnabled={editEnabled}
          pathPrefix={`関係一覧.${partnerName}.状態効果`}
          emptyText="なし"
          onDelete={(effectName: string) =>
            setDeleteTarget({
              type: '状態効果',
              path: `関係一覧.${partnerName}.状態効果.${effectName}`,
              name: effectName,
            })
          }
        />
      </div>
    );
  };

  /** パートナーの在席状態を切り替え（クイック操作。編集モードに依存しない） */
  const handleTogglePresence = async (partnerName: string, partner: PartnerRecord) => {
    const next = !partner.在席;
    const success = await updateField(`関係一覧.${partnerName}.在席`, next);
    if (success) {
      toastr.success(
        next
          ? `「${partnerName}」を在席に切り替えました`
          : `「${partnerName}」を離席に切り替えました`,
      );
    } else {
      toastr.error('在席状態の切り替えに失敗しました');
    }
  };

  const renderPartnerPresenceToggle = (partnerName: string, partner: PartnerRecord) => (
    <button
      type="button"
      className={`${styles.partnerPresenceToggle} ${partner.在席 ? styles.partnerPresenceToggleOn : ''}`}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        void handleTogglePresence(partnerName, partner);
      }}
      title={partner.在席 ? '離席に切り替え' : '在席に切り替え'}
    >
      <i className={partner.在席 ? 'fa-solid fa-eye' : 'fa-regular fa-eye-slash'} />
    </button>
  );

  const renderPartnerDeleteButton = (partnerName: string) => {
    return (
      <button
        className={styles.deletePartnerBtn}
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          setDeleteTarget({
            type: 'パートナー',
            path: `関係一覧.${partnerName}`,
            name: partnerName,
          });
        }}
        title="関係を削除"
      >
        <i className="fa-solid fa-trash" />
      </button>
    );
  };

  const renderPartnerHeaderMeta = (
    partnerName: string,
    partner: PartnerRecord,
    showDelete = false,
  ) => (
    <>
      <div className={showDelete ? styles.partnerSummaryHeader : styles.partnerIdentityHeader}>
        <div className={styles.partnerIdentityTitleRow}>
          <IconTitle text={partnerName} className={styles.partnerName} />
          {!hasPartnerAvatar(partnerName) ? renderPartnerAvatarAddInlineButton(partnerName) : null}
        </div>
        {showDelete ? (
          <div className={styles.partnerHeaderActions}>
            {renderPartnerPresenceToggle(partnerName, partner)}
            {renderPartnerDeleteButton(partnerName)}
          </div>
        ) : null}
      </div>
      <div className={styles.partnerMeta}>
        <span className={styles.affectionBadge}>好感度 {partner.好感度 ?? 0}</span>
        <div className={styles.partnerTags}>
          {partner.在席 && <span className={`${styles.tag} ${styles.tagPresent}`}>在席</span>}
          {partner.命定契約 && (
            <span className={`${styles.tag} ${styles.tagContract}`}>命定契約</span>
          )}
        </div>
      </div>
    </>
  );

  const renderPartnerRest = (partner: PartnerRecord) => (
    <>
      {(partner.タグ?.length ?? 0) > 0 && (
        <div className={styles.partnerLabelChips}>
          {(partner.タグ ?? []).map((tag: string) => (
            <span key={tag} className={styles.partnerLabelChip}>
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className={styles.partnerSummaryText}>{getPartnerSummaryText(partner)}</div>
      <div className={styles.partnerSummaryStatus}>{getPartnerStatusSummary(partner)}</div>
    </>
  );

  const renderPartnerIdentity = (
    partnerName: string,
    partner: PartnerRecord,
    showDelete = false,
  ) => (
    <>
      {renderPartnerHeaderMeta(partnerName, partner, showDelete)}
      {renderPartnerRest(partner)}
    </>
  );

  const renderPartnerSummary = (partnerName: string, partner: PartnerRecord) => (
    <div className={styles.partnerTitle}>
      <div className={styles.partnerTitleMain}>
        {renderPartnerAvatar(partnerName)}
        <div className={styles.partnerTitleContent}>
          {renderPartnerIdentity(partnerName, partner)}
        </div>
      </div>
      {renderPartnerDeleteButton(partnerName)}
    </div>
  );

  /** キャラクター情報の要約: 身分は1行、レベル階層は1行（pre-line 改行に依存） */
  const getPartnerRoleText = (partner: PartnerRecord) => {
    const identity = _.compact([
      partner.種族,
      Array.isArray(partner.職業) ? partner.職業.join(' / ') : partner.職業,
    ]).join(' · ');
    const meta = _.compact([partner.レベル ? `Lv.${partner.レベル}` : '', partner.生命階層]).join(
      ' · ',
    );

    return _.compact([identity, meta]).join('\n') || '役割情報なし';
  };

  const getPartnerStatusSummary = (partner: PartnerRecord) => {
    const effects = (partner.状態効果 ?? {}) as Parameters<
      typeof StatusEffectDisplay
    >[0]['effects'];

    return (
      <div className={styles.partnerSummaryStatusRow}>
        <StatusEffectDisplay
          effects={effects}
          mode="chips"
          compact
          maxVisible={3}
          showRemainingCount
          emptyText="バフなし"
        />
      </div>
    );
  };

  const getPartnerAvatarUrl = (partner_name: string) => {
    if (partnerAvatarRemovedMap[partner_name]) {
      return '';
    }

    return partnerAvatarMap[partner_name] || partnerDefaultAvatarMap[partner_name] || '';
  };

  const hasPartnerAvatar = (partner_name: string) => Boolean(getPartnerAvatarUrl(partner_name));

  const handlePartnerAvatarUpload = async (partner_name: string, file: File) => {
    try {
      const nextAvatarUrl = await readAvatarFileAsDataUrl(file);
      if (!nextAvatarUrl) {
        return;
      }

      await saveAvatarRecord({
        scope_key: avatarScopeKey,
        owner_type: 'partner',
        owner_name: partner_name,
        source_type: 'upload',
        value: nextAvatarUrl,
      });

      setPartnerAvatarMap(previous => ({
        ...previous,
        [partner_name]: nextAvatarUrl,
      }));
      setPartnerAvatarRemovedMap(previous => ({
        ...previous,
        [partner_name]: false,
      }));
    } catch (error) {
      console.warn('[DestinyTab] パートナーアバターのアップロードに失敗:', error);
    }
  };

  const handlePartnerAvatarUrlInput = async (partner_name: string, url_input: string) => {
    const nextAvatarUrl = _.trim(url_input || '');
    if (!nextAvatarUrl) {
      return;
    }

    try {
      await saveAvatarRecord({
        scope_key: avatarScopeKey,
        owner_type: 'partner',
        owner_name: partner_name,
        source_type: 'url',
        value: nextAvatarUrl,
      });

      setPartnerAvatarMap(previous => ({
        ...previous,
        [partner_name]: nextAvatarUrl,
      }));
      setPartnerAvatarRemovedMap(previous => ({
        ...previous,
        [partner_name]: false,
      }));
    } catch (error) {
      console.warn('[DestinyTab] パートナーアバターのリンク保存に失敗:', error);
    }
  };

  const handlePartnerAvatarExport = async (partner_name: string) => {
    const currentAvatarUrl = getPartnerAvatarUrl(partner_name);
    if (!currentAvatarUrl) {
      return;
    }

    try {
      await exportAvatarFile(`${partner_name}-avatar.png`, currentAvatarUrl);
    } catch (error) {
      console.warn('[DestinyTab] パートナーアバターのエクスポートに失敗:', error);
    }
  };

  const handlePartnerAvatarRemove = async (partner_name: string) => {
    try {
      await markAvatarAsRemoved(avatarScopeKey, 'partner', partner_name);
      setPartnerAvatarMap(previous => ({
        ...previous,
        [partner_name]: '',
      }));
      setPartnerAvatarRemovedMap(previous => ({
        ...previous,
        [partner_name]: true,
      }));
    } catch (error) {
      console.warn('[DestinyTab] パートナーアバターの削除に失敗:', error);
    }
  };

  const handlePartnerAvatarReset = async (partner_name: string) => {
    try {
      await removeAvatarRecord(avatarScopeKey, 'partner', partner_name);
      setPartnerAvatarMap(previous => ({
        ...previous,
        [partner_name]: '',
      }));
      setPartnerAvatarRemovedMap(previous => ({
        ...previous,
        [partner_name]: false,
      }));
    } catch (error) {
      console.warn('[DestinyTab] デフォルトのパートナーアバターへの復元に失敗:', error);
    }
  };

  const handlePartnerAvatarImageError = (partner_name: string) => {
    if (!partnerAvatarMap[partner_name] && partnerDefaultAvatarMap[partner_name]) {
      setPartnerDefaultAvatarMap(previous => ({
        ...previous,
        [partner_name]: '',
      }));
      return;
    }

    setPartnerAvatarMap(previous => ({
      ...previous,
      [partner_name]: '',
    }));
  };

  const openPartnerAvatarModal = (partner_name: string) => {
    setActiveAvatarPartnerName(partner_name);
  };

  const closePartnerAvatarModal = () => {
    setActiveAvatarPartnerName(null);
  };

  const getFallbackGalleryTitle = (file: File) => {
    const fileName = _.trim(file.name || 'アルバム画像');
    return _.trim(fileName.replace(/\.[^.]+$/, '')) || 'アルバム画像';
  };

  const persistPartnerGalleryItems = async (
    partner_name: string,
    next_items: PartnerGalleryItem[],
  ) => {
    if (next_items.length === 0) {
      await removePartnerGalleryRecord(avatarScopeKey, partner_name);
    } else {
      await savePartnerGalleryItems(avatarScopeKey, partner_name, next_items);
    }

    setPartnerGalleryMap(previous => ({
      ...previous,
      [partner_name]: next_items,
    }));
  };

  const handlePartnerGalleryUpload = async (
    partner_name: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';

    if (!selectedFile) {
      return;
    }

    try {
      const nextGalleryUrl = await readAvatarFileAsDataUrl(selectedFile);
      if (!nextGalleryUrl) {
        return;
      }

      const nextItem = createPartnerGalleryItem({
        title: getFallbackGalleryTitle(selectedFile),
        url: nextGalleryUrl,
      });
      const nextItems = [...(partnerGalleryMap[partner_name] ?? []), nextItem];

      await persistPartnerGalleryItems(partner_name, nextItems);
      setEditingGalleryItemId(nextItem.id);
      setEditingGalleryTitle(nextItem.title);
    } catch (error) {
      console.warn('[DestinyTab] パートナーアルバム画像の追加に失敗:', error);
    }
  };

  const handlePartnerGalleryLoadPredefined = async (partner_name: string) => {
    const predefinedItems = partnerPredefinedGalleryMap[partner_name] ?? [];
    if (predefinedItems.length === 0) {
      return;
    }

    try {
      await persistPartnerGalleryItems(partner_name, predefinedItems.map(createPartnerGalleryItem));
    } catch (error) {
      console.warn('[DestinyTab] プリセットのパートナーアルバム読み込みに失敗:', error);
    }
  };

  const handlePartnerGalleryLoadExternal = async (partner_name: string) => {
    const externalItems = partnerExternalGalleryMap[partner_name] ?? [];
    if (externalItems.length === 0) {
      return;
    }

    try {
      await persistPartnerGalleryItems(partner_name, externalItems.map(createPartnerGalleryItem));
    } catch (error) {
      console.warn('[DestinyTab] 外部パートナーアルバムの読み込みに失敗:', error);
    }
  };

  const handlePartnerGalleryDelete = async (partner_name: string, item_id: string) => {
    const nextItems = (partnerGalleryMap[partner_name] ?? []).filter(item => item.id !== item_id);

    try {
      await persistPartnerGalleryItems(partner_name, nextItems);
      if (
        activeGalleryPreview?.partnerName === partner_name &&
        activeGalleryPreview.itemId === item_id
      ) {
        setActiveGalleryPreview(null);
      }
      if (editingGalleryItemId === item_id) {
        setEditingGalleryItemId(null);
        setEditingGalleryTitle('');
      }
    } catch (error) {
      console.warn('[DestinyTab] パートナーアルバム画像の削除に失敗:', error);
    }
  };

  const requestPartnerGalleryDelete = (partner_name: string, item: PartnerGalleryItem) => {
    setPendingGalleryDelete({
      partnerName: partner_name,
      itemId: item.id,
    });
  };

  const cancelPartnerGalleryDelete = () => {
    setPendingGalleryDelete(null);
  };

  const confirmPartnerGalleryDelete = async () => {
    if (!pendingGalleryDelete) {
      return;
    }

    await handlePartnerGalleryDelete(pendingGalleryDelete.partnerName, pendingGalleryDelete.itemId);
    setPendingGalleryDelete(null);
  };

  const startPartnerGalleryTitleEdit = (item: PartnerGalleryItem) => {
    setEditingGalleryItemId(item.id);
    setEditingGalleryTitle(item.title);
  };

  const cancelPartnerGalleryTitleEdit = () => {
    setEditingGalleryItemId(null);
    setEditingGalleryTitle('');
  };

  const commitPartnerGalleryTitleEdit = async (partner_name: string, item_id: string) => {
    const currentItems = partnerGalleryMap[partner_name] ?? [];
    const currentItem = currentItems.find(item => item.id === item_id);
    if (!currentItem) {
      cancelPartnerGalleryTitleEdit();
      return;
    }

    const nextTitle = _.trim(editingGalleryTitle) || currentItem.title;
    if (nextTitle === currentItem.title) {
      cancelPartnerGalleryTitleEdit();
      return;
    }

    const nextItems = currentItems.map(item =>
      item.id === item_id ? { ...item, title: nextTitle } : item,
    );

    try {
      await persistPartnerGalleryItems(partner_name, nextItems);
      cancelPartnerGalleryTitleEdit();
    } catch (error) {
      console.warn('[DestinyTab] パートナーアルバムのタイトル変更に失敗:', error);
    }
  };

  const renderPartnerAvatarAddInlineButton = (partnerName: string) => (
    <button
      type="button"
      className={styles.partnerAvatarInlineButton}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        openPartnerAvatarModal(partnerName);
      }}
      aria-label={`${partnerName}のアバターを追加`}
      title={`${partnerName}のアバターを追加`}
    >
      <i className="fa-solid fa-plus" />
      <span>アバターを追加</span>
    </button>
  );

  const renderPartnerAvatar = (partnerName: string) => {
    if (!hasPartnerAvatar(partnerName)) return null;

    return (
      <AvatarPanel
        src={getPartnerAvatarUrl(partnerName)}
        alt={`${partnerName}のアバター`}
        size="md"
        className={styles.partnerAvatar}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation();
          openPartnerAvatarModal(partnerName);
        }}
        onImageError={() => handlePartnerAvatarImageError(partnerName)}
      />
    );
  };

  const renderPartnerGallerySection = (partnerName: string) => {
    const galleryItems = partnerGalleryMap[partnerName] ?? [];
    const externalGalleryItems = partnerExternalGalleryMap[partnerName] ?? [];
    const predefinedGalleryItems = partnerPredefinedGalleryMap[partnerName] ?? [];

    const renderGalleryUploadControl = () => (
      <label className={styles.partnerGalleryActionButton}>
        <i className="fa-solid fa-upload" />
        <span>画像を追加</span>
        <input
          className={styles.partnerGalleryFileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={event => {
            void handlePartnerGalleryUpload(partnerName, event);
          }}
        />
      </label>
    );

    if (isPartnerGalleryLoading) {
      return <EmptyHint className={styles.emptyHint} text="アルバム読み込み中..." />;
    }

    if (galleryItems.length === 0) {
      return (
        <div className={styles.partnerGalleryEmptyPanel}>
          <EmptyHint className={styles.emptyHint} text="アルバム画像なし" />
          {externalGalleryItems.length > 0 ? (
            <div className={styles.partnerGalleryPredefinedPrompt}>
              <div className={styles.partnerGalleryPredefinedText}>
                外部アルバム画像が {externalGalleryItems.length} 枚あります。読み込みますか？
              </div>
              <button
                type="button"
                className={styles.partnerGalleryActionButton}
                onClick={() => {
                  void handlePartnerGalleryLoadExternal(partnerName);
                }}
              >
                <i className="fa-solid fa-images" />
                <span>外部画像を読み込む</span>
              </button>
            </div>
          ) : null}
          {predefinedGalleryItems.length > 0 ? (
            <div className={styles.partnerGalleryPredefinedPrompt}>
              <div className={styles.partnerGalleryPredefinedText}>
                プリセットアルバム画像が {predefinedGalleryItems.length}{' '}
                枚あります。読み込みますか？
              </div>
              <button
                type="button"
                className={styles.partnerGalleryActionButton}
                onClick={() => {
                  void handlePartnerGalleryLoadPredefined(partnerName);
                }}
              >
                <i className="fa-solid fa-images" />
                <span>プリセット画像を読み込む</span>
              </button>
            </div>
          ) : null}
          {renderGalleryUploadControl()}
        </div>
      );
    }

    return (
      <div className={styles.partnerGallery}>
        <div className={styles.partnerGalleryHeader}>
          <div>
            <div className={styles.sectionLabel}>アルバム</div>
            <div className={styles.partnerGallerySummary}>合計 {galleryItems.length} 枚</div>
          </div>
          {renderGalleryUploadControl()}
        </div>

        <div className={styles.partnerGalleryGrid}>
          {galleryItems.map((item, index) => (
            <figure
              key={item.id || `${partnerName}-gallery-${index}`}
              className={styles.partnerGalleryItem}
            >
              <button
                type="button"
                className={styles.partnerGalleryDeleteButton}
                onClick={() => {
                  requestPartnerGalleryDelete(partnerName, item);
                }}
                aria-label={`${item.title}を削除`}
                title="画像を削除"
              >
                <i className="fa-solid fa-trash" />
              </button>
              <button
                type="button"
                className={styles.partnerGalleryButton}
                onClick={() => setActiveGalleryPreview({ partnerName, itemId: item.id })}
                aria-label={`${item.title}を表示`}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className={styles.partnerGalleryImage}
                  loading="lazy"
                  onError={event => {
                    const galleryItem = event.currentTarget.closest('figure') as HTMLElement | null;
                    if (galleryItem) {
                      galleryItem.style.display = 'none';
                    }
                  }}
                />
              </button>
              <figcaption className={styles.partnerGalleryCaption}>
                {editingGalleryItemId === item.id ? (
                  <input
                    className={styles.partnerGalleryTitleInput}
                    value={editingGalleryTitle}
                    autoFocus
                    onChange={event => setEditingGalleryTitle(event.target.value)}
                    onBlur={() => {
                      void commitPartnerGalleryTitleEdit(partnerName, item.id);
                    }}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        void commitPartnerGalleryTitleEdit(partnerName, item.id);
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        cancelPartnerGalleryTitleEdit();
                      }
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    className={styles.partnerGalleryTitleButton}
                    onClick={() => startPartnerGalleryTitleEdit(item)}
                    title="タイトルを変更"
                  >
                    {item.title}
                  </button>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    );
  };

  const getPartnerSummaryText = (partner: PartnerRecord) => getPartnerRoleText(partner);

  const handlePartnerSelect = (partnerName: string) => {
    setSelectedPartnerName(partnerName);
    setActivePartnerDetailSection('overview');
    setActivePartnerAssetFilter(ALL_FILTER);
    setIsPartnerDetailOpen(true);
  };

  const handlePartnerDetailBack = () => {
    setIsPartnerDetailOpen(false);
    setActivePartnerDetailSection('overview');
    setActivePartnerAssetFilter(ALL_FILTER);
  };

  const handlePartnerListCategoryChange = (category: PartnerListCategory) => {
    setActivePartnerListCategory(category);
    setSelectedPartnerName(null);
    setActivePartnerDetailSection('overview');
    setActivePartnerAssetFilter(ALL_FILTER);
    setPartnerSearchKeyword('');
    setActivePartnerLabel(null);
    setIsPartnerDetailOpen(false);
  };

  const handlePartnerDetailSectionChange = (section: PartnerDetailSection) => {
    setActivePartnerDetailSection(section);
    setActivePartnerAssetFilter(ALL_FILTER);
  };

  const renderPartnerThoughtsPreview = (partner: PartnerRecord) => {
    const thoughts = _.trim(partner.本音 || '');
    if (!thoughts) return null;

    const thoughtSentences = thoughts
      .split(/[。！？.!?\n]+/)
      .map(sentence => _.trim(sentence))
      .filter(Boolean);

    const shouldShowButton = thoughtSentences.length > 3 || thoughts.length > 100;

    return (
      <div className={styles.partnerThoughtsPreview}>
        <div className={styles.sectionLabel}>本音</div>
        <div className={styles.partnerThoughtsText}>{thoughts}</div>
        {shouldShowButton ? (
          <button
            type="button"
            className={styles.partnerThoughtsButton}
            onClick={() => handlePartnerDetailSectionChange('background')}
          >
            すべて表示
          </button>
        ) : null}
      </div>
    );
  };

  const renderPartnerListItem = (partnerName: string, partner: PartnerRecord) => (
    <div
      className={`${styles.partnerSummaryCard} ${activePartnerName === partnerName ? styles.partnerSummaryCardActive : ''}`}
      onClick={() => handlePartnerSelect(partnerName)}
      role="button"
      tabIndex={0}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handlePartnerSelect(partnerName);
        }
      }}
    >
      {renderPartnerAvatar(partnerName)}
      <div className={styles.partnerSummaryTopBody}>
        {renderPartnerHeaderMeta(partnerName, partner, true)}
      </div>
      <div className={styles.partnerSummaryRest}>{renderPartnerRest(partner)}</div>
    </div>
  );

  const renderPartnerDetails = (partnerName: string, partner: PartnerRecord) => {
    const detailSections: Array<{ key: PartnerDetailSection; label: string }> = [
      { key: 'overview', label: '概要' },
      { key: 'status', label: '状態' },
      { key: 'equipment', label: '装備' },
      { key: 'skills', label: 'スキル' },
      { key: 'inventory', label: 'インベントリ' },
      { key: 'assets', label: '資産' },
      { key: 'background', label: '背景' },
      { key: 'gallery', label: 'アルバム' },
    ];

    return (
      <div className={styles.partnerDetails}>
        <div className={styles.partnerDetailNav}>
          {detailSections.map(section => (
            <button
              key={section.key}
              type="button"
              className={`${styles.partnerDetailTab} ${activePartnerDetailSection === section.key ? styles.partnerDetailTabActive : ''}`}
              onClick={() => handlePartnerDetailSectionChange(section.key)}
            >
              {section.label}
            </button>
          ))}
        </div>

        {activePartnerDetailSection === 'overview' && (
          <>
            <div className={styles.partnerOverviewHero}>
              <div className={styles.partnerOverviewPrimary}>
                <div className={styles.partnerAffection}>
                  <span className={styles.label}>好感度</span>
                  {editEnabled ? (
                    <EditableField
                      path={`関係一覧.${partnerName}.好感度`}
                      value={partner.好感度 ?? 0}
                      type="number"
                      numberConfig={{ min: -100, max: 100, step: 1 }}
                    />
                  ) : (
                    renderAffectionBar(partner.好感度 ?? 0)
                  )}
                </div>

                {renderPartnerThoughtsPreview(partner)}

                {editEnabled && (
                  <div className={styles.partnerStatusToggles}>
                    <div className={styles.toggleRow}>
                      <span className={styles.toggleLabel}>在席状態</span>
                      <EditableField
                        path={`関係一覧.${partnerName}.在席`}
                        value={partner.在席 ?? false}
                        type="toggle"
                        toggleConfig={{ labelOff: '離席', labelOn: '在席', size: 'sm' }}
                      />
                    </div>
                    <div className={styles.toggleRow}>
                      <span className={styles.toggleLabel}>命定契約</span>
                      <EditableField
                        path={`関係一覧.${partnerName}.命定契約`}
                        value={partner.命定契約 ?? false}
                        type="toggle"
                        toggleConfig={{ labelOff: '未締結', labelOn: '締結済み', size: 'sm' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.partnerOverviewStats}>
                <div className={styles.partnerInfoPanel}>
                  <div className={styles.sectionLabel}>基本情報</div>
                  <div className={styles.partnerInfo}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>タグ</span>
                      <EditableField
                        path={`関係一覧.${partnerName}.タグ`}
                        value={partner.タグ ?? []}
                        type="tags"
                        bypassEditGuard
                      />
                    </div>
                    {renderEditableRow(
                      '種族',
                      `関係一覧.${partnerName}.種族`,
                      partner.種族,
                      'text',
                      styles.infoRow,
                      styles.infoLabel,
                      styles.infoValue,
                    )}
                    {renderEditableRow(
                      '身分',
                      `関係一覧.${partnerName}.身分`,
                      partner.身分,
                      'tags',
                      styles.infoRow,
                      styles.infoLabel,
                      styles.infoValue,
                    )}
                    {renderEditableRow(
                      '職業',
                      `関係一覧.${partnerName}.職業`,
                      partner.職業,
                      'tags',
                      styles.infoRow,
                      styles.infoLabel,
                      styles.infoValue,
                    )}
                    {renderReadonlyRow(
                      '生命階層',
                      partner.生命階層,
                      styles.infoRow,
                      styles.infoLabel,
                      styles.infoValue,
                    )}
                    {renderReadonlyRow(
                      'レベル',
                      partner.レベル ? `Lv.${partner.レベル}` : '',
                      styles.infoRow,
                      styles.infoLabel,
                      styles.infoValue,
                    )}
                  </div>
                </div>

                {!_.isEmpty(partner.属性) && (
                  <div className={styles.partnerInfoPanel}>
                    <div className={styles.sectionLabel}>属性</div>
                    <div
                      className={`${styles.attributeGrid} ${editEnabled ? styles.attributeGridEdit : ''}`}
                    >
                      {_.map(partner.属性, (value: number | undefined, key: string) => (
                        <div
                          key={key}
                          className={`${styles.attributeItem} ${editEnabled ? styles.attributeItemEdit : ''}`}
                        >
                          <span className={styles.attributeKey}>{key}</span>
                          {editEnabled ? (
                            <EditableField
                              path={`関係一覧.${partnerName}.属性.${key}`}
                              value={value ?? 0}
                              type="number"
                              numberConfig={{ min: 0, max: 20, step: 1 }}
                            />
                          ) : (
                            <span className={styles.attributeValue}>{value}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(partner.外見 || partner.服装 || editEnabled) && (
              <div className={styles.partnerAppearance}>
                {renderEditableRow(
                  '外見',
                  `関係一覧.${partnerName}.外見`,
                  partner.外見,
                  'textarea',
                  styles.appearanceRow,
                  styles.appearanceLabel,
                  styles.appearanceValue,
                )}
                {renderEditableRow(
                  '服装',
                  `関係一覧.${partnerName}.服装`,
                  partner.服装,
                  'textarea',
                  styles.appearanceRow,
                  styles.appearanceLabel,
                  styles.appearanceValue,
                )}
              </div>
            )}

            {(partner.性格 || partner.好意 || editEnabled) && (
              <div className={styles.partnerTraits}>
                {renderEditableRow(
                  '性格',
                  `関係一覧.${partnerName}.性格`,
                  partner.性格,
                  'textarea',
                  styles.traitRow,
                  styles.traitLabel,
                  styles.traitValue,
                )}
                {renderEditableRow(
                  '好意',
                  `関係一覧.${partnerName}.好意`,
                  partner.好意,
                  'textarea',
                  styles.traitRow,
                  styles.traitLabel,
                  styles.traitValue,
                )}
              </div>
            )}
          </>
        )}

        {activePartnerDetailSection === 'status' && (
          <>
            {renderStatusEffectsSection(partner.状態効果, partnerName)}
            {partner.登神長階?.有効化 && (
              <div className={styles.partnerAscension}>
                <div className={styles.ascensionLabel}>登神長階</div>
                <Ascension
                  data={partner.登神長階}
                  compact
                  editEnabled={editEnabled}
                  pathPrefix={`関係一覧.${partnerName}.登神長階`}
                />
              </div>
            )}
          </>
        )}

        {activePartnerAssetSection &&
          renderPartnerAssetSection(partnerName, activePartnerAssetSection)}

        {activePartnerDetailSection === 'gallery' && renderPartnerGallerySection(partnerName)}

        {activePartnerDetailSection === 'background' && (
          <>
            {(partner.本音 || editEnabled) && (
              <div className={styles.partnerThoughts}>
                {renderEditableRow(
                  '本音',
                  `関係一覧.${partnerName}.本音`,
                  partner.本音,
                  'textarea',
                  styles.thoughtsRow,
                  styles.thoughtsLabel,
                  styles.thoughtsContent,
                )}
              </div>
            )}

            {(partner.背景ストーリー || editEnabled) && (
              <div className={styles.partnerBackground}>
                {renderEditableRow(
                  '背景ストーリー',
                  `関係一覧.${partnerName}.背景ストーリー`,
                  partner.背景ストーリー,
                  'textarea',
                  styles.backgroundRow,
                  styles.backgroundLabel,
                  styles.backgroundContent,
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderActivePartnerDetailContent = () =>
    activePartnerName && activePartner ? (
      <>
        <div className={styles.partnerDetailHeader}>
          {renderPartnerSummary(activePartnerName, activePartner)}
        </div>
        {renderPartnerDetails(activePartnerName, activePartner)}
      </>
    ) : (
      <EmptyHint className={styles.emptyHint} text="表示できる関係なし" />
    );

  /** 関係一覧の描画 */
  const renderPartners = () => {
    if (_.isEmpty(partners)) {
      return <EmptyHint className={styles.emptyHint} text="関係なし" />;
    }

    const detailContent = renderActivePartnerDetailContent();

    return (
      <div className={styles.partnerSectionContent}>
        <div className={styles.partnerCategoryBar}>
          {partnerCategoryEntries.map(category => (
            <button
              key={category.key}
              type="button"
              className={`${styles.partnerCategoryBtn} ${activePartnerListCategory === category.key ? styles.partnerCategoryBtnActive : ''}`}
              onClick={() => handlePartnerListCategoryChange(category.key)}
            >
              <span>{category.label}</span>
              <span className={styles.partnerCategoryCount}>{category.count}</span>
            </button>
          ))}
        </div>

        <div className={styles.partnerToolbar}>
          <div className={styles.partnerSearchBar}>
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="text"
              className={styles.partnerSearchInput}
              placeholder="パートナー名/タグ/種族/身分/職業を検索"
              value={partnerSearchKeyword}
              onChange={e => setPartnerSearchKeyword(e.target.value)}
            />
            {partnerSearchKeyword && (
              <button
                type="button"
                className={styles.partnerSearchClear}
                onClick={() => setPartnerSearchKeyword('')}
                title="検索をクリア"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>
          {allPartnerLabels.length > 0 && (
            <div className={styles.partnerLabelBar}>
              <button
                type="button"
                className={`${styles.partnerLabelBtn} ${activePartnerLabel === null ? styles.partnerLabelBtnActive : ''}`}
                onClick={() => setActivePartnerLabel(null)}
              >
                全部
              </button>
              {allPartnerLabels.map(label => (
                <button
                  key={label}
                  type="button"
                  className={`${styles.partnerLabelBtn} ${activePartnerLabel === label ? styles.partnerLabelBtnActive : ''}`}
                  onClick={() => setActivePartnerLabel(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.partnerMasterDetail}>
          <div
            className={`${styles.partnerSummaryList} ${isPartnerDetailVisible ? styles.partnerSummaryListHiddenMobile : ''}`}
          >
            {visiblePartnerEntries.length > 0 ? (
              visiblePartnerEntries.map(([name, partner]) => (
                <div key={name}>{renderPartnerListItem(name, partner)}</div>
              ))
            ) : (
              <EmptyHint
                className={styles.emptyHint}
                text={`「${activePartnerListCategoryConfig?.label ?? '全部'}」カテゴリの関係なし`}
              />
            )}
          </div>

          <div className={styles.partnerDetailPanel}>{detailContent}</div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    let ignore = false;

    const loadPartnerAvatars = async () => {
      try {
        const partnerNames = partnerEntries.map(([partnerName]) => partnerName);

        if (partnerNames.length === 0) {
          if (!ignore) {
            setPartnerAvatarMap({});
            setPartnerDefaultAvatarMap({});
            setPartnerAvatarRemovedMap({});
          }
          return;
        }

        const partnerNameSet = new Set(partnerNames);
        const records = (await getAvatarRecordsByScopeKey(avatarScopeKey)).filter(
          record => record.owner_type === 'partner' && partnerNameSet.has(record.owner_name),
        );
        console.log('[DestinyTab] パートナーアバターのローカル記録を読み込みました:', records);

        if (ignore) {
          return;
        }

        const recordsByPartnerName = _.keyBy(records, 'owner_name');
        const defaultAvatarPartnerNames: string[] = [];
        const nextAvatarMap: Record<string, string> = {};
        const nextRemovedMap: Record<string, boolean> = {};

        partnerNames.forEach(partnerName => {
          const avatarRecord = recordsByPartnerName[partnerName];
          const isAvatarRemoved = avatarRecord?.source_type === 'removed';
          const customAvatarUrl = isAvatarRemoved ? '' : (avatarRecord?.value ?? '');

          nextAvatarMap[partnerName] = customAvatarUrl;
          nextRemovedMap[partnerName] = isAvatarRemoved;

          if (!isAvatarRemoved && !customAvatarUrl) {
            defaultAvatarPartnerNames.push(partnerName);
          }
        });

        const nextDefaultAvatarMap = await getDefaultPartnerAvatarMap(defaultAvatarPartnerNames);
        if (ignore) {
          return;
        }

        setPartnerAvatarMap(nextAvatarMap);
        setPartnerDefaultAvatarMap(nextDefaultAvatarMap);
        setPartnerAvatarRemovedMap(nextRemovedMap);
      } catch (error) {
        console.warn('[DestinyTab] パートナーアバターの読み込みに失敗:', error);
        if (!ignore) {
          setPartnerAvatarMap({});
          setPartnerDefaultAvatarMap({});
          setPartnerAvatarRemovedMap({});
        }
      }
    };

    void loadPartnerAvatars();

    return () => {
      ignore = true;
    };
  }, [avatarScopeKey, partnerEntries]);

  useEffect(() => {
    let ignore = false;

    const loadPartnerGalleries = async () => {
      try {
        const partnerNames = partnerEntries.map(([partnerName]) => partnerName);
        if (partnerNames.length === 0) {
          if (!ignore) {
            setIsPartnerGalleryLoading(false);
            setPartnerGalleryMap({});
            setPartnerExternalGalleryMap({});
            setPartnerPredefinedGalleryMap({});
          }
          return;
        }

        if (!ignore) {
          setIsPartnerGalleryLoading(true);
        }

        const partnerNameSet = new Set(partnerNames);
        const records = (await getPartnerGalleryRecordsByScopeKey(avatarScopeKey)).filter(
          record => record.owner_type === 'partner' && partnerNameSet.has(record.owner_name),
        );
        const recordsByPartnerName = _.keyBy(records, 'owner_name');
        const chatGalleryMap = getChatPartnerGalleryMap(partnerNames);
        const nextGalleryMap = partnerNames.reduce<Record<string, PartnerGalleryItem[]>>(
          (result, partnerName) => {
            const localRecord = recordsByPartnerName[partnerName];
            result[partnerName] = localRecord ? localRecord.items : [];
            return result;
          },
          {},
        );
        const nextExternalGalleryMap = partnerNames.reduce<Record<string, PartnerGalleryItem[]>>(
          (result, partnerName) => {
            const localRecord = recordsByPartnerName[partnerName];
            const chatGalleryItems = chatGalleryMap[partnerName] ?? [];
            if (!localRecord && chatGalleryItems.length > 0) {
              result[partnerName] = chatGalleryItems;
            }
            return result;
          },
          {},
        );
        const nextPredefinedGalleryMap = await getPredefinedPartnerGalleryMap(partnerNames);
        if (!ignore) {
          setPartnerGalleryMap(nextGalleryMap);
          setPartnerExternalGalleryMap(nextExternalGalleryMap);
          setPartnerPredefinedGalleryMap(nextPredefinedGalleryMap);
          setIsPartnerGalleryLoading(false);
        }
      } catch (error) {
        console.warn('[DestinyTab] パートナー画像の読み込みに失敗:', error);
        if (!ignore) {
          setPartnerGalleryMap({});
          setPartnerExternalGalleryMap({});
          setPartnerPredefinedGalleryMap({});
          setIsPartnerGalleryLoading(false);
        }
      }
    };

    void loadPartnerGalleries();

    return () => {
      ignore = true;
    };
  }, [avatarScopeKey, partnerEntries]);

  useEffect(() => {
    writeSessionState(partnerCategoryStorageKey, activePartnerListCategory);
  }, [activePartnerListCategory, partnerCategoryStorageKey]);

  useEffect(() => {
    if (!selectedPartnerName) {
      writeSessionState(partnerNameStorageKey, null);
      return;
    }

    writeSessionState(partnerNameStorageKey, selectedPartnerName);
  }, [partnerNameStorageKey, selectedPartnerName]);

  useEffect(() => {
    writeSessionState(partnerMobileDetailOpenStorageKey, isPartnerDetailOpen);
  }, [isPartnerDetailOpen, partnerMobileDetailOpenStorageKey]);

  useEffect(() => {
    writeSessionState(partnerDetailStorageKey, activePartnerDetailSection);
  }, [activePartnerDetailSection, partnerDetailStorageKey]);

  useEffect(() => {
    writeSessionState(partnerFilterStorageKey, activePartnerAssetFilter);
  }, [activePartnerAssetFilter, partnerFilterStorageKey]);

  useEffect(() => {
    writeSessionState(partnerSearchStorageKey, partnerSearchKeyword);
  }, [partnerSearchKeyword, partnerSearchStorageKey]);

  useEffect(() => {
    writeSessionState(partnerLabelStorageKey, activePartnerLabel);
  }, [activePartnerLabel, partnerLabelStorageKey]);

  useEffect(() => {
    if (!selectedPartnerName || !activePartnerName) return;
    if (selectedPartnerName === activePartnerName) return;
    setSelectedPartnerName(activePartnerName);
  }, [activePartnerName, selectedPartnerName]);

  const activePartnerAvatarActionState = activeAvatarPartnerName
    ? {
        ...getAvatarActionState({
          current_url: getPartnerAvatarUrl(activeAvatarPartnerName),
          custom_url: partnerAvatarMap[activeAvatarPartnerName],
          default_url: partnerDefaultAvatarMap[activeAvatarPartnerName],
          removed: partnerAvatarRemovedMap[activeAvatarPartnerName],
        }),
        canDelete: Boolean(getPartnerAvatarUrl(activeAvatarPartnerName)),
      }
    : null;

  return (
    <div
      className={`${styles.destinyTab} ${isPartnerDetailVisible ? styles.destinyTabDetailModeMobile : ''}`}
    >
      {/* 運命ポイント */}
      <Card className={styles.destinyTabPoints}>
        <div className={styles.destinyPoints}>
          <i className={`fa-solid fa-star ${styles.destinyPointsIcon}`} />
          <span className={styles.destinyPointsLabel}>運命ポイント</span>
          {editEnabled ? (
            <EditableField
              path="運命ポイント"
              value={destinyPoints ?? 0}
              type="number"
              numberConfig={{ min: 0, step: 1 }}
            />
          ) : (
            <span className={styles.destinyPointsValue}>{destinyPoints ?? 0}</span>
          )}
        </div>
      </Card>

      {/* 関係一覧 */}
      <section className={styles.destinyTabPartners}>
        <div className={styles.partnerSectionTitle}>関係一覧</div>
        {renderPartners()}
      </section>

      {isPartnerDetailVisible && (
        <div className={styles.partnerDetailPageMobile}>
          <div className={styles.partnerDetailPageTopbar}>
            <button className={styles.partnerBackBtn} onClick={handlePartnerDetailBack}>
              <i className="fa-solid fa-chevron-left" />
              <span>関係一覧に戻る</span>
            </button>
          </div>
          <div className={styles.partnerDetailPageBody}>{renderActivePartnerDetailContent()}</div>
        </div>
      )}

      {activeAvatarPartnerName ? (
        <AvatarActionModal
          open
          title={`${activeAvatarPartnerName}のアバター`}
          subtitle="ローカル画像のインポート、画像リンクの保存、現在のアバターのエクスポート・削除、デフォルトアバターへの復元に対応しています。"
          linkPlaceholder={`${activeAvatarPartnerName}のアバター画像リンクを入力してください`}
          canExport={activePartnerAvatarActionState?.canExport ?? false}
          canDelete={activePartnerAvatarActionState?.canDelete ?? false}
          canReset={activePartnerAvatarActionState?.canReset ?? false}
          deleteLabel="アバターを削除"
          onClose={closePartnerAvatarModal}
          onUpload={(file: File) => handlePartnerAvatarUpload(activeAvatarPartnerName, file)}
          onSubmitLink={(url: string) => handlePartnerAvatarUrlInput(activeAvatarPartnerName, url)}
          onExport={() => handlePartnerAvatarExport(activeAvatarPartnerName)}
          onDelete={() => handlePartnerAvatarRemove(activeAvatarPartnerName)}
          onReset={() => handlePartnerAvatarReset(activeAvatarPartnerName)}
        />
      ) : null}

      {activeGalleryPreview && activeGalleryPreviewItem ? (
        <div
          className={styles.partnerGalleryPreviewOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={`${activeGalleryPreview.partnerName}のアルバムプレビュー`}
          onClick={() => setActiveGalleryPreview(null)}
        >
          <div
            className={styles.partnerGalleryPreviewPanel}
            onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.partnerGalleryPreviewClose}
              onClick={() => setActiveGalleryPreview(null)}
              aria-label="画像プレビューを閉じる"
            >
              <i className="fa-solid fa-xmark" />
            </button>
            <img
              src={activeGalleryPreviewItem.url}
              alt={activeGalleryPreviewItem.title}
              className={styles.partnerGalleryPreviewImage}
            />
            <div className={styles.partnerGalleryPreviewTitle}>
              {activeGalleryPreviewItem.title}
            </div>
          </div>
        </div>
      ) : null}

      <DeleteConfirmModal
        open={Boolean(pendingGalleryDelete)}
        target={pendingGalleryDeleteTarget}
        onConfirm={() => {
          void confirmPartnerGalleryDelete();
        }}
        onCancel={cancelPartnerGalleryDelete}
      />

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
 * 命定ページコンポーネント（HOC でラップ）
 */
export const DestinyTab = withMvuData({ baseClassName: styles.destinyTab })(DestinyTabContent);
