import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import styles from './TextEditor.module.scss';

export interface TextEditorProps {
  /** 現在の値 */
  value: string;
  /** 値変更コールバック */
  onChange: (value: string) => void;
  /** プレースホルダー */
  placeholder?: string;
  /** 複数行かどうか */
  multiline?: boolean;
  /** 複数行時の行数 */
  rows?: number;
  /** 無効かどうか */
  disabled?: boolean;
  /** 最大文字数 */
  maxLength?: number;
  /** カスタムクラス名 */
  className?: string;
  /** 編集モード: inline は行内編集、modal はモーダル編集 */
  mode?: 'inline' | 'modal';
}

/**
 * テキストエディタコンポーネント
 * 単一行/複数行のテキスト編集に対応
 */
export const TextEditor: FC<TextEditorProps> = ({
  value,
  onChange,
  placeholder = '入力してください...',
  multiline = false,
  rows = 3,
  disabled = false,
  maxLength,
  className,
  mode = 'inline',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // 外部の値を同期
  useEffect(() => {
    if (!isEditing) {
      setTempValue(value);
    }
  }, [value, isEditing]);

  // 自動フォーカス
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setTempValue(value);
  };

  const handleCommit = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBlur = () => {
    if (!disabled) {
      handleCommit();
    }
  };

  const displayValue = value || placeholder;

  if (mode === 'inline' && !isEditing) {
    return (
      <div
        className={`${styles.textEditor} ${styles.displayMode} ${disabled ? styles.disabled : ''} ${className ?? ''}`}
        onClick={handleStartEdit}
        title={disabled ? '編集不可' : 'クリックで編集'}
      >
        <span className={`${styles.displayValue} ${!value ? styles.placeholder : ''}`}>
          {displayValue}
        </span>
        {!disabled && <i className={`fa-solid fa-pen ${styles.editIcon}`} />}
      </div>
    );
  }

  const inputProps = {
    ref: inputRef as React.RefObject<HTMLInputElement & HTMLTextAreaElement>,
    value: tempValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setTempValue(e.target.value),
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
    placeholder,
    disabled,
    maxLength,
    className: styles.input,
  };

  return (
    <div className={`${styles.textEditor} ${styles.editMode} ${className ?? ''}`}>
      <div className={styles.inputWrapper}>
        {multiline ? (
          <textarea {...inputProps} rows={rows} />
        ) : (
          <input type="text" {...inputProps} />
        )}
      </div>
    </div>
  );
};
