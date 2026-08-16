import { FC } from 'react';
import styles from './ToggleEditor.module.scss';

export interface ToggleEditorProps {
  /** 現在の値 */
  value: boolean;
  /** 値変更コールバック */
  onChange: (value: boolean) => void;
  /** 無効かどうか */
  disabled?: boolean;
  /** カスタムクラス名 */
  className?: string;
  /** 左側のテキスト（オフ状態の表示） */
  labelOff?: string;
  /** 右側のテキスト（オン状態の表示） */
  labelOn?: string;
  /** サイズ */
  size?: 'sm' | 'md';
}

/**
 * ブールスイッチエディタ
 * 左右の状態テキスト表示に対応。"在席"、"命定契約"等のシーンに適する
 */
export const ToggleEditor: FC<ToggleEditorProps> = ({
  value,
  onChange,
  disabled = false,
  className,
  labelOff,
  labelOn,
  size = 'md',
}) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(!value);
    }
  };

  return (
    <div
      className={`${styles.toggleEditor} ${disabled ? styles.disabled : ''} ${styles[size]} ${className ?? ''}`}
    >
      {labelOff && (
        <span
          className={`${styles.labelText} ${styles.labelOff} ${!value ? styles.active : ''}`}
          onClick={handleClick}
        >
          {labelOff}
        </span>
      )}
      <button
        type="button"
        className={`${styles.toggle} ${value ? styles.isOn : ''}`}
        onClick={handleClick}
        aria-pressed={value}
        disabled={disabled}
      >
        <span className={styles.thumb} />
      </button>
      {labelOn && (
        <span
          className={`${styles.labelText} ${styles.labelOn} ${value ? styles.active : ''}`}
          onClick={handleClick}
        >
          {labelOn}
        </span>
      )}
    </div>
  );
};
