import { FC, useCallback, useMemo, useState } from 'react';
import { useEditorSettingStore, useMvuDataStore } from '../../../core/stores';
import type { ConfirmModalRow } from '../ConfirmModal';
import { ConfirmModal } from '../ConfirmModal';
import type { SelectEditorOption } from '../editors';
import {
  KeyValueEditor,
  NumberEditor,
  SelectEditor,
  TagEditor,
  TextEditor,
  ToggleEditor,
} from '../editors';
import styles from './EditableField.module.scss';

/** フィールドタイプ */
type FieldType = 'text' | 'number' | 'tags' | 'keyvalue' | 'textarea' | 'select' | 'toggle';

export interface EditableFieldProps {
  /** データパス (stat_data からの相対パス) */
  path: string;
  /** 現在の値 */
  value: unknown;
  /** フィールドタイプ */
  type?: FieldType;
  /** ラベル */
  label?: string;
  /** 無効かどうか */
  disabled?: boolean;
  /** 編集モードロックを迂回: 「データ編集を許可」がオフでも編集可能（確認モーダルは経由） */
  bypassEditGuard?: boolean;
  /** カスタムクラス名 */
  className?: string;
  /** 数字エディタ設定 */
  numberConfig?: {
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
  };
  /** キーと値のペアエディタ設定 */
  keyValueConfig?: {
    keyPlaceholder?: string;
    valuePlaceholder?: string;
    valueType?: 'string' | 'number';
  };
  /** セレクタ設定 */
  selectConfig?: {
    options: SelectEditorOption[];
  };
  /** スイッチエディタ設定 */
  toggleConfig?: {
    /** オフ状態のテキスト */
    labelOff?: string;
    /** オン状態のテキスト */
    labelOn?: string;
    /** サイズ */
    size?: 'sm' | 'md';
  };
  /** 更新成功コールバック */
  onUpdateSuccess?: () => void;
}

/**
 * 編集可能フィールドコンポーネント
 * フィールドタイプに応じてエディタを自動選択し、RUD 操作を統合
 */
export const EditableField: FC<EditableFieldProps> = ({
  path,
  value,
  type = 'text',
  label,
  disabled = false,
  bypassEditGuard = false,
  className,
  numberConfig,
  keyValueConfig,
  selectConfig,
  toggleConfig,
  onUpdateSuccess,
}) => {
  const { updateField } = useMvuDataStore();

  const [pendingValue, setPendingValue] = useState<unknown | null>(null);
  const [pendingLabel, setPendingLabel] = useState<string>('');
  const [pendingPrevValue, setPendingPrevValue] = useState<unknown | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { editEnabled } = useEditorSettingStore();
  const isDisabled = disabled || (!bypassEditGuard && !editEnabled);

  const formattedCurrentValue = useMemo(() => value, [value]);

  const formatValue = (target: unknown) => {
    // 確認モーダル表示用に値をフォーマット
    if (target === null || target === undefined) return 'なし';
    if (typeof target === 'string') return target;
    if (typeof target === 'number' || typeof target === 'boolean') return String(target);
    try {
      return JSON.stringify(target);
    } catch {
      return String(target);
    }
  };

  /** 確認状態に入る */
  const handleChange = useCallback(
    (newVal: unknown) => {
      if (isDisabled) return;
      // 変化がない場合はモーダルを表示しない
      if (_.isEqual(newVal, formattedCurrentValue)) return;
      setPendingValue(newVal);
      setPendingPrevValue(formattedCurrentValue);
      setPendingLabel(label ?? path);
      setShowConfirm(true);
    },
    [isDisabled, formattedCurrentValue, label, path],
  );

  /** 確定して送信 */
  const confirmUpdate = useCallback(async () => {
    if (!showConfirm) return;
    const success = await updateField(path, pendingValue);
    setShowConfirm(false);
    setPendingValue(null);
    setPendingPrevValue(null);

    if (success) {
      toastr.success('保存しました');
      onUpdateSuccess?.();
    } else {
      toastr.error('保存に失敗しました');
    }
  }, [showConfirm, updateField, path, pendingValue, onUpdateSuccess]);

  /** 送信をキャンセル */
  const cancelUpdate = useCallback(() => {
    setShowConfirm(false);
    setPendingValue(null);
    setPendingPrevValue(null);
  }, []);

  /** エディタを描画 */
  const renderEditor = () => {
    switch (type) {
      case 'number':
        return (
          <NumberEditor
            value={typeof value === 'number' ? value : 0}
            onChange={handleChange}
            disabled={isDisabled}
            {...numberConfig}
          />
        );

      case 'tags':
        return (
          <TagEditor
            value={Array.isArray(value) ? value : []}
            onChange={handleChange}
            disabled={isDisabled}
          />
        );

      case 'keyvalue':
        return (
          <KeyValueEditor
            value={
              typeof value === 'object' && value !== null
                ? (value as Record<string, string | number>)
                : {}
            }
            onChange={handleChange}
            disabled={isDisabled}
            {...keyValueConfig}
          />
        );

      case 'textarea':
        return (
          <TextEditor
            value={typeof value === 'string' ? value : String(value ?? '')}
            onChange={handleChange}
            disabled={isDisabled}
            multiline
            rows={3}
          />
        );

      case 'select':
        return (
          <SelectEditor
            value={String(value ?? '')}
            onChange={handleChange}
            options={selectConfig?.options ?? []}
            disabled={isDisabled}
          />
        );

      case 'toggle':
        return (
          <ToggleEditor
            value={Boolean(value)}
            onChange={handleChange}
            disabled={isDisabled}
            {...toggleConfig}
          />
        );

      case 'text':
      default:
        return (
          <TextEditor
            value={typeof value === 'string' ? value : String(value ?? '')}
            onChange={handleChange}
            disabled={isDisabled}
          />
        );
    }
  };

  return (
    <div className={`${styles.editableField} ${className ?? ''}`}>
      <div className={styles.editorWrapper}>{renderEditor()}</div>

      <ConfirmModal
        open={showConfirm}
        title="変更を確認"
        rows={
          [
            { label: 'フィールド', value: pendingLabel },
            { label: '旧値', value: formatValue(pendingPrevValue) },
            { label: '新値', value: formatValue(pendingValue) },
          ] as ConfirmModalRow[]
        }
        buttons={[
          { text: '確認', variant: 'primary', onClick: confirmUpdate },
          { text: 'キャンセル', variant: 'secondary', onClick: cancelUpdate },
        ]}
        onClose={cancelUpdate}
      />
    </div>
  );
};
