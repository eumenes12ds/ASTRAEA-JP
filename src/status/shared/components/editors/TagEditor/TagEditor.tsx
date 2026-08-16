import { FC, KeyboardEvent, useRef, useState } from 'react';
import styles from './TagEditor.module.scss';

export interface TagEditorProps {
  /** 現在のタグリスト */
  value: string[];
  /** 値変更コールバック */
  onChange: (value: string[]) => void;
  /** プレースホルダー */
  placeholder?: string;
  /** 無効かどうか */
  disabled?: boolean;
  /** 最大タグ数 */
  maxTags?: number;
  /** カスタムクラス名 */
  className?: string;
}

/**
 * タグエディタコンポーネント
 * タグの追加・削除に対応
 */
export const TagEditor: FC<TagEditorProps> = ({
  value,
  onChange,
  placeholder = 'タグを追加...',
  disabled = false,
  maxTags,
  className,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCommit = (nextValue: string[]) => {
    onChange(nextValue);
  };

  const handleAddTag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) {
      setInputValue('');
      return;
    }
    if (maxTags && value.length >= maxTags) return;

    handleCommit([...value, trimmed]);
    setInputValue('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (disabled) return;
    handleCommit(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // 入力欄が空のとき、Backspace で最後のタグを削除
      handleRemoveTag(value[value.length - 1]);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      handleAddTag();
    }
    setIsEditing(false);
  };

  const canAddMore = !maxTags || value.length < maxTags;

  return (
    <div className={`${styles.tagEditor} ${disabled ? styles.disabled : ''} ${className ?? ''}`}>
      <div className={styles.tagsContainer}>
        {value.map((tag, idx) => (
          <span key={idx} className={styles.tag}>
            {tag}
            {!disabled && (
              <button
                className={styles.removeBtn}
                onClick={() => handleRemoveTag(tag)}
                title="タグを削除"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </span>
        ))}
        {!disabled &&
          canAddMore &&
          (isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder={placeholder}
              className={styles.input}
            />
          ) : (
            <button className={styles.addBtn} onClick={handleStartEdit} title="タグを追加">
              <i className="fa-solid fa-plus" />
            </button>
          ))}
      </div>
    </div>
  );
};
