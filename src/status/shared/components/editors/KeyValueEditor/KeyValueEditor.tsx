import { FC, KeyboardEvent, useState } from 'react';
import styles from './KeyValueEditor.module.scss';

export interface KeyValueEditorProps {
  /** 現在のキーと値のペア */
  value: Record<string, string | number>;
  /** 値変更コールバック */
  onChange: (value: Record<string, string | number>) => void;
  /** キーのプレースホルダー */
  keyPlaceholder?: string;
  /** 値のプレースホルダー */
  valuePlaceholder?: string;
  /** 無効かどうか */
  disabled?: boolean;
  /** カスタムクラス名 */
  className?: string;
  /** 値タイプ */
  valueType?: 'string' | 'number';
}

/**
 * キーと値のペアエディタコンポーネント
 * 効果・属性などのキーと値のペアデータの編集に使用
 */
export const KeyValueEditor: FC<KeyValueEditorProps> = ({
  value,
  onChange,
  keyPlaceholder = 'キー',
  valuePlaceholder = '値',
  disabled = false,
  className,
  valueType = 'string',
}) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleCommit = (nextValue: Record<string, string | number>) => {
    onChange(nextValue);
  };

  const handleAdd = () => {
    const trimmedKey = newKey.trim();
    if (!trimmedKey || !newValue) return;
    if (trimmedKey in value) return; // キーは既に存在

    const parsedValue = valueType === 'number' ? parseFloat(newValue) || 0 : newValue;
    handleCommit({ ...value, [trimmedKey]: parsedValue });
    setNewKey('');
    setNewValue('');
  };

  const handleRemove = (keyToRemove: string) => {
    if (disabled) return;
    const newObj = { ...value };
    delete newObj[keyToRemove];
    handleCommit(newObj);
  };

  const handleStartEdit = (key: string) => {
    if (disabled) return;
    setEditingKey(key);
    setEditingValue(String(value[key]));
  };

  /** 編集を確定（フォーカス喪失またはキー入力でトリガー） */
  const handleConfirmEdit = () => {
    if (editingKey === null) return;
    const parsedValue = valueType === 'number' ? parseFloat(editingValue) || 0 : editingValue;
    handleCommit({ ...value, [editingKey]: parsedValue });
    setEditingKey(null);
    setEditingValue('');
  };

  /** 編集をキャンセル（Escape でトリガー） */
  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditingValue('');
  };

  /** フォーカス喪失時に自動保存（他のエディタの動作と一致） */
  const handleBlur = () => {
    if (!disabled) {
      handleConfirmEdit();
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    action: 'add' | 'edit',
  ) => {
    // Ctrl+Enter または Cmd+Enter で確定
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (action === 'add') {
        handleAdd();
      } else {
        handleConfirmEdit();
      }
    } else if (e.key === 'Escape') {
      if (action === 'edit') {
        handleCancelEdit();
      }
    }
  };

  const entries = Object.entries(value);

  return (
    <div
      className={`${styles.keyValueEditor} ${disabled ? styles.disabled : ''} ${className ?? ''}`}
    >
      <div className={styles.content}>
        {/* 既存のエントリ */}
        {entries.length > 0 && (
          <div className={styles.entries}>
            {entries.map(([key, val]) => (
              <div key={key} className={styles.entry}>
                <span className={styles.entryKey}>{key}</span>
                {editingKey === key ? (
                  <div className={styles.editWrapper}>
                    {valueType === 'number' ? (
                      <input
                        type="number"
                        value={editingValue}
                        onChange={e => setEditingValue(e.target.value)}
                        onKeyDown={e => handleKeyDown(e, 'edit')}
                        onBlur={handleBlur}
                        className={styles.editInput}
                        autoFocus
                      />
                    ) : (
                      <textarea
                        value={editingValue}
                        onChange={e => setEditingValue(e.target.value)}
                        onKeyDown={e => handleKeyDown(e, 'edit')}
                        onBlur={handleBlur}
                        className={styles.editTextarea}
                        rows={3}
                        autoFocus
                        placeholder="フォーカス喪失で自動保存・Esc でキャンセル"
                      />
                    )}
                  </div>
                ) : (
                  <>
                    <span
                      className={styles.entryValue}
                      onClick={() => handleStartEdit(key)}
                      title="クリックで編集"
                    >
                      {val}
                    </span>
                    {!disabled && (
                      <button
                        className={styles.removeBtn}
                        onClick={() => handleRemove(key)}
                        title="削除"
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 新規エントリの追加 */}
        {!disabled && (
          <div className={styles.addRow}>
            <input
              type="text"
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              onKeyDown={e => handleKeyDown(e, 'add')}
              placeholder={keyPlaceholder}
              className={styles.addInput}
            />
            {valueType === 'number' ? (
              <input
                type="number"
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                onKeyDown={e => handleKeyDown(e, 'add')}
                placeholder={valuePlaceholder}
                className={styles.addInput}
              />
            ) : (
              <textarea
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                onKeyDown={e => handleKeyDown(e, 'add')}
                placeholder={`${valuePlaceholder} (Ctrl+Enter で追加)`}
                className={styles.addTextarea}
                rows={2}
              />
            )}
            <button
              className={styles.addBtn}
              onClick={handleAdd}
              disabled={!newKey.trim() || !newValue}
              title="追加 (Ctrl+Enter)"
            >
              <i className="fa-solid fa-plus" />
            </button>
          </div>
        )}

        {entries.length === 0 && disabled && <span className={styles.empty}>データなし</span>}
      </div>
    </div>
  );
};
