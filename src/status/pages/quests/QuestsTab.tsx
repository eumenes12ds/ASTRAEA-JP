import _ from 'lodash';
import { FC, useEffect, useMemo, useState } from 'react';
import { useDeleteConfirm } from '../../core/hooks';
import { useEditorSettingStore } from '../../core/stores';
import type { Task } from '../../core/types';
import { buildSessionKey, readSessionState, writeSessionState } from '../../core/utils';
import {
  Card,
  DeleteConfirmModal,
  EditableField,
  EmptyHint,
  IconTitle,
  ItemInspectModal,
} from '../../shared/components';
import { withMvuData, WithMvuDataProps } from '../../shared/hoc';
import styles from './QuestsTab.module.scss';

const ALL_STATUS = '全部';

const QuestFields = [
  { key: '状態', label: '状態', type: 'text' as const },
  { key: '重要度', label: '重要度', type: 'select' as const },
  { key: '進捗', label: '進捗', type: 'textarea' as const },
  { key: '詳細', label: '詳細', type: 'textarea' as const },
  { key: '目標', label: '目標', type: 'textarea' as const },
  { key: '報酬', label: '報酬', type: 'textarea' as const },
] as const;

type QuestFieldKey = (typeof QuestFields)[number]['key'];

type InspectQuestState = {
  name: string;
} | null;

const PriorityRankMap: Record<string, number> = {
  高: 0,
  中: 1,
  低: 2,
};

const PriorityOptions = [
  { value: '高', label: '高' },
  { value: '中', label: '中' },
  { value: '低', label: '低' },
];

interface QuestSummaryCardProps {
  name: string;
  quest: Task;
  editEnabled: boolean;
  onInspect: () => void;
  onDelete: (name: string, path: string) => void;
}

const QuestSummaryCard: FC<QuestSummaryCardProps> = ({
  name,
  quest,
  editEnabled,
  onInspect,
  onDelete,
}) => {
  const basePath = `タスク一覧.${name}`;

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete(name, basePath);
  };

  return (
    <button type="button" className={styles.questCard} onClick={onInspect}>
      <div className={styles.questCardHeader}>
        <div className={styles.questCardTitleGroup}>
          <IconTitle text={name} className={styles.questTitle} />
          <div className={styles.questBadges}>
            {quest.状態 ? <span className={styles.questStatusBadge}>{quest.状態}</span> : null}
            {quest.重要度 ? (
              <span
                className={`${styles.questPriorityBadge} ${styles[`priority${quest.重要度}`] ?? ''}`.trim()}
              >
                {quest.重要度}
              </span>
            ) : null}
          </div>
        </div>
        {editEnabled ? (
          <button
            type="button"
            className={styles.deleteButton}
            onClick={handleDeleteClick}
            title="タスクを削除"
          >
            <i className="fa-solid fa-trash-can" />
          </button>
        ) : null}
      </div>

      {quest.進捗 ? <div className={styles.questProgress}>{quest.進捗}</div> : null}

      {quest.詳細 ? <div className={styles.questDetailPreview}>{quest.詳細}</div> : null}

      <div className={styles.questMeta}>
        {quest.目標 ? (
          <div className={styles.questMetaRow}>
            <span className={styles.questMetaLabel}>目標</span>
            <span className={styles.questMetaValue}>{quest.目標}</span>
          </div>
        ) : null}
        {quest.報酬 ? (
          <div className={styles.questMetaRow}>
            <span className={styles.questMetaLabel}>報酬</span>
            <span className={styles.questMetaValue}>{quest.報酬}</span>
          </div>
        ) : null}
      </div>
    </button>
  );
};

interface QuestDetailContentProps {
  name: string;
  quest: Task;
  editEnabled: boolean;
}

const QuestDetailContent: FC<QuestDetailContentProps> = ({ name, quest, editEnabled }) => {
  const basePath = `タスク一覧.${name}`;

  const renderFieldContent = (fieldKey: QuestFieldKey) => {
    const value = quest[fieldKey] ?? '';
    const fieldPath = `${basePath}.${fieldKey}`;

    if (!editEnabled) {
      return <div className={styles.questDetailValue}>{value || 'なし'}</div>;
    }

    if (fieldKey === '重要度') {
      return (
        <EditableField
          path={fieldPath}
          value={value || '中'}
          type="select"
          selectConfig={{ options: PriorityOptions }}
          className={styles.questEditableField}
        />
      );
    }

    if (fieldKey === '状態') {
      return (
        <EditableField
          path={fieldPath}
          value={value}
          type="text"
          className={styles.questEditableField}
        />
      );
    }

    return (
      <EditableField
        path={fieldPath}
        value={value}
        type="textarea"
        className={styles.questEditableField}
      />
    );
  };

  return (
    <div className={styles.questDetailContent}>
      {QuestFields.map(field => (
        <section key={field.key} className={styles.questDetailSection}>
          <div className={styles.questDetailSectionTitle}>{field.label}</div>
          {renderFieldContent(field.key)}
        </section>
      ))}
    </div>
  );
};

const QuestsTabContent: FC<WithMvuDataProps> = ({ data }) => {
  const editEnabled = useEditorSettingStore(state => state.editEnabled);
  const { deleteTarget, setDeleteTarget, handleDelete, cancelDelete, isConfirmOpen } =
    useDeleteConfirm();

  const statusStorageKey = buildSessionKey('quests', 'active-status');
  const focusStorageKey = buildSessionKey('quests', 'focus-quest');

  const [activeStatus, setActiveStatus] = useState<string>(() =>
    readSessionState<string>(statusStorageKey, ALL_STATUS),
  );
  const [inspectQuest, setInspectQuest] = useState<InspectQuestState>(null);
  const [focusQuestName, setFocusQuestName] = useState<string>(() =>
    readSessionState<string>(focusStorageKey, ''),
  );

  const quests = data.タスク一覧 ?? {};
  const inspectedQuest = inspectQuest ? quests[inspectQuest.name] : undefined;
  const questEntries = useMemo(() => _.entries(quests) as [string, Task][], [quests]);

  const statusOptions = useMemo(() => {
    const dynamicStatuses = _.uniq(
      questEntries
        .map(([, quest]) => quest.状態?.trim())
        .filter((status): status is string => Boolean(status)),
    );

    return [ALL_STATUS, ...dynamicStatuses];
  }, [questEntries]);

  useEffect(() => {
    if (statusOptions.length === 0) return;
    if (!statusOptions.includes(activeStatus)) {
      setActiveStatus(ALL_STATUS);
    }
  }, [activeStatus, statusOptions]);

  const normalizedActiveStatus = statusOptions.includes(activeStatus) ? activeStatus : ALL_STATUS;

  const filteredQuestEntries = useMemo(() => {
    const entries =
      normalizedActiveStatus === ALL_STATUS
        ? questEntries
        : questEntries.filter(([, quest]) => (quest.状態?.trim() || '') === normalizedActiveStatus);

    return _.orderBy(
      entries,
      [([, quest]) => PriorityRankMap[quest.重要度 ?? '中'] ?? 99, ([name]) => name.toLowerCase()],
      ['asc', 'asc'],
    );
  }, [normalizedActiveStatus, questEntries]);

  const statusCountMap = useMemo(() => {
    return statusOptions.reduce<Record<string, number>>((acc, status) => {
      if (status === ALL_STATUS) {
        acc[status] = questEntries.length;
        return acc;
      }

      acc[status] = questEntries.filter(
        ([, quest]) => (quest.状態?.trim() || '') === status,
      ).length;
      return acc;
    }, {});
  }, [questEntries, statusOptions]);

  const focusQuestOptions = useMemo(() => {
    return _.orderBy(
      questEntries,
      [([, quest]) => PriorityRankMap[quest.重要度 ?? '中'] ?? 99, ([name]) => name.toLowerCase()],
      ['asc', 'asc'],
    );
  }, [questEntries]);

  const featuredQuestEntry = useMemo(() => {
    if (!focusQuestName) {
      return null;
    }

    return questEntries.find(([name]) => name === focusQuestName) ?? null;
  }, [focusQuestName, questEntries]);

  useEffect(() => {
    if (!focusQuestName) {
      writeSessionState(focusStorageKey, '');
      return;
    }

    const exists = questEntries.some(([name]) => name === focusQuestName);
    if (!exists) {
      setFocusQuestName('');
      writeSessionState(focusStorageKey, '');
      return;
    }

    writeSessionState(focusStorageKey, focusQuestName);
  }, [focusQuestName, focusStorageKey, questEntries]);

  useEffect(() => {
    writeSessionState(statusStorageKey, activeStatus);
  }, [activeStatus, statusStorageKey]);

  const handleDeleteRequest = (name: string, path: string) => {
    setDeleteTarget({ type: 'タスク', path, name });
  };

  const handleInspectQuest = (name: string) => {
    setInspectQuest({ name });
  };

  const handleCloseInspect = () => {
    setInspectQuest(null);
  };

  return (
    <div className={styles.questsTab}>
      <Card className={styles.overviewCard} bodyClassName={styles.overviewCardBody}>
        <div className={styles.overviewHeader}>
          <IconTitle
            icon="fa-solid fa-list-check"
            text="クエスト概況"
            className={styles.overviewTitle}
            as="span"
          />
        </div>

        <div className={styles.overviewStats}>
          {statusOptions.map(status => (
            <div key={status} className={styles.overviewStatItem}>
              <span className={styles.overviewStatLabel}>{status}</span>
              <span className={styles.overviewStatValue}>{statusCountMap[status] ?? 0}</span>
            </div>
          ))}
        </div>

        <div className={styles.overviewFocus}>
          <div className={styles.overviewFocusHeader}>
            <span className={styles.overviewFocusLabel}>現在の焦点</span>
            {focusQuestName ? (
              <button
                type="button"
                className={styles.focusClearButton}
                onClick={() => setFocusQuestName('')}
              >
                クリア
              </button>
            ) : null}
          </div>

          {questEntries.length > 0 ? (
            <div className={styles.overviewFocusControls}>
              <label className={styles.overviewFocusSelectLabel} htmlFor="quest-focus-select">
                焦点クエストを選択
              </label>
              <select
                id="quest-focus-select"
                className={styles.overviewFocusSelect}
                value={focusQuestName}
                onChange={event => setFocusQuestName(event.target.value)}
              >
                <option value="">未設定</option>
                {focusQuestOptions.map(([name]) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {featuredQuestEntry ? (
            <div className={styles.overviewFocusContent}>
              <div className={styles.overviewFocusLine}>
                <span className={styles.overviewFocusLineLabel}>目標</span>
                <span className={styles.overviewFocusText}>
                  {featuredQuestEntry[1].目標 || '目標なし'}
                </span>
              </div>
              <div className={styles.overviewFocusLine}>
                <span className={styles.overviewFocusLineLabel}>進捗</span>
                <span
                  className={
                    featuredQuestEntry[1].進捗
                      ? styles.overviewFocusText
                      : styles.overviewFocusTextEmpty
                  }
                >
                  {featuredQuestEntry[1].進捗 || '進捗なし'}
                </span>
              </div>
            </div>
          ) : (
            <span className={styles.overviewFocusEmpty}>
              {questEntries.length === 0
                ? 'タスク焦点なし'
                : '上の一覧から焦点にするタスクを選択してください'}
            </span>
          )}
        </div>
      </Card>

      {statusOptions.length > 1 ? (
        <div className={styles.statusFilterBar}>
          {statusOptions.map(status => (
            <button
              key={status}
              type="button"
              className={`${styles.statusFilterBtn} ${normalizedActiveStatus === status ? styles.statusFilterBtnActive : ''}`}
              onClick={() => setActiveStatus(status)}
            >
              <span>{status}</span>
              <span className={styles.statusFilterCount}>{statusCountMap[status] ?? 0}</span>
            </button>
          ))}
        </div>
      ) : null}

      {filteredQuestEntries.length === 0 ? (
        <Card className={styles.emptyCard} bodyClassName={styles.emptyCardBody}>
          <EmptyHint
            className={styles.emptyHint}
            icon="fa-solid fa-scroll"
            text={
              normalizedActiveStatus === ALL_STATUS
                ? 'タスクなし'
                : `"${normalizedActiveStatus}"状態のタスクなし`
            }
          />
        </Card>
      ) : (
        <div className={styles.questList}>
          {filteredQuestEntries.map(([name, quest]) => (
            <QuestSummaryCard
              key={name}
              name={name}
              quest={quest}
              editEnabled={editEnabled}
              onInspect={() => handleInspectQuest(name)}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      <ItemInspectModal
        open={!!inspectQuest}
        title={inspectQuest?.name ?? ''}
        subtitle={
          inspectQuest && inspectedQuest ? (
            <div className={styles.inspectSubtitle}>
              {inspectedQuest.状態 ? (
                <span className={styles.questStatusBadge}>{inspectedQuest.状態}</span>
              ) : null}
              {inspectedQuest.重要度 ? (
                <span
                  className={`${styles.questPriorityBadge} ${styles[`priority${inspectedQuest.重要度}`] ?? ''}`.trim()}
                >
                  {inspectedQuest.重要度}
                </span>
              ) : null}
            </div>
          ) : null
        }
        onClose={handleCloseInspect}
      >
        {inspectQuest && inspectedQuest ? (
          <QuestDetailContent
            name={inspectQuest.name}
            quest={inspectedQuest}
            editEnabled={editEnabled}
          />
        ) : null}
      </ItemInspectModal>

      <DeleteConfirmModal
        open={isConfirmOpen}
        target={deleteTarget}
        onConfirm={handleDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export const QuestsTab = withMvuData({ baseClassName: styles.questsTab })(QuestsTabContent);
