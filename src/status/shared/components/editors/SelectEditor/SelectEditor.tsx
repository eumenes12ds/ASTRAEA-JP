import { ChangeEvent, FC } from 'react';
import styles from './SelectEditor.module.scss';

export interface SelectEditorOption {
  label: string;
  value: string;
}

export interface SelectEditorProps {
  /** 現在の値 */
  value: string;
  /** 値変更コールバック */
  onChange: (value: string) => void;
  /** 選択肢リスト */
  options: SelectEditorOption[];
  /** 無効かどうか */
  disabled?: boolean;
  /** カスタムクラス名 */
  className?: string;
}

/**
 * 列挙型セレクトエディタ
 */
export const SelectEditor: FC<SelectEditorProps> = ({
  value,
  onChange,
  options,
  disabled = false,
  className,
}) => {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`${styles.selectEditor} ${disabled ? styles.disabled : ''} ${className ?? ''}`}>
      <div className={styles.selectWrapper}>
        <select value={value} onChange={handleChange} disabled={disabled} className={styles.select}>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <i className={`fa-solid fa-angle-down ${styles.icon}`} />
      </div>
    </div>
  );
};
