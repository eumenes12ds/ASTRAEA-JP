import { FC, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import styles from './NumberEditor.module.scss';

export interface NumberEditorProps {
  /** 現在の値 */
  value: number;
  /** 値変更コールバック */
  onChange: (value: number) => void;
  /** 最小値 */
  min?: number;
  /** 最大値 */
  max?: number;
  /** ステップ値 */
  step?: number;
  /** 無効かどうか */
  disabled?: boolean;
  /** カスタムクラス名 */
  className?: string;
  /** サフィックス（単位など） */
  suffix?: string;
  /** 増減ボタンを表示するかどうか */
  showButtons?: boolean;
}

/**
 * 数字エディタコンポーネント
 * ステップ調整と直接入力に対応
 */
export const NumberEditor: FC<NumberEditorProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  className,
  suffix,
  showButtons = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(String(value));
  // ステップ中は表示値のみ更新し、入力状態には切り替えない
  const [isStepping, setIsStepping] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const tempValueRef = useRef(tempValue);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  // 参照を同期
  useEffect(() => {
    tempValueRef.current = tempValue;
  }, [tempValue]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // 外部の値を同期（ステップ中は一時値を上書きしない）
  useEffect(() => {
    if (!isEditing && !isStepping) {
      setTempValue(String(value));
      setIsStepping(false);
    }
  }, [value, isEditing, isStepping]);

  // 自動フォーカス
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  /** 値を範囲内に制限 */
  const clampValue = (val: number): number => {
    let clamped = val;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    return clamped;
  };

  const getNextStepValue = (delta: number) => {
    // ステップ中は一時値を基準として続行
    const baseValue = isEditing || isStepping ? parseFloat(tempValue) || value : value;
    return clampValue(baseValue + delta);
  };

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setTempValue(String(value));
  };

  const handleCommit = useCallback(() => {
    const currentTempValue = tempValueRef.current;
    const currentValue = valueRef.current;

    if (currentTempValue === String(currentValue)) {
      setIsEditing(false);
      setIsStepping(false);
      return;
    }

    const parsed = parseFloat(currentTempValue);
    if (!isNaN(parsed)) {
      onChangeRef.current(clampValue(parsed));
    }
    setIsEditing(false);
    setIsStepping(false);
  }, []);

  // ステップ操作のデバウンス: 停止後 1s で確定をトリガー
  const debouncedCommitRef = useRef(_.debounce((commitFn: () => void) => commitFn(), 1000));

  useEffect(() => {
    // アンマウントまたは再生成時にデバウンス確定をキャンセル
    return () => {
      debouncedCommitRef.current.cancel();
    };
  }, []);

  const handleCancel = () => {
    setTempValue(String(value));
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBlur = () => {
    // フォーカス喪失時に即座に確定し、デバウンスをキャンセル
    debouncedCommitRef.current.cancel();
    if (!disabled) {
      handleCommit();
    }
  };

  const handleIncrement = () => {
    if (disabled) return;
    // ステップボタンで連続的に値を変更し、操作停止後に確定をトリガー
    const nextValue = getNextStepValue(step);
    setTempValue(String(nextValue));
    setIsStepping(true);
    debouncedCommitRef.current(handleCommit);
  };

  const handleDecrement = () => {
    if (disabled) return;
    // ステップボタンで連続的に値を変更し、操作停止後に確定をトリガー
    const nextValue = getNextStepValue(-step);
    setTempValue(String(nextValue));
    setIsStepping(true);
    debouncedCommitRef.current(handleCommit);
  };

  if (isEditing) {
    return (
      <div className={`${styles.numberEditor} ${styles.editMode} ${className ?? ''}`}>
        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="number"
            value={tempValue}
            onChange={e => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            min={min}
            max={max}
            step={step}
            className={styles.input}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.numberEditor} ${styles.displayMode} ${disabled ? styles.disabled : ''} ${className ?? ''}`}
    >
      <div className={styles.valueWrapper}>
        {showButtons && (
          <button
            className={styles.stepBtn}
            onClick={handleDecrement}
            disabled={disabled || (min !== undefined && value <= min)}
            title="減らす"
          >
            <i className="fa-solid fa-minus" />
          </button>
        )}
        <span
          className={styles.displayValue}
          onClick={handleStartEdit}
          title={disabled ? '編集不可' : 'クリックで編集'}
        >
          {isStepping ? tempValue : value}
          {suffix && <span className={styles.suffix}>{suffix}</span>}
        </span>
        {showButtons && (
          <button
            className={styles.stepBtn}
            onClick={handleIncrement}
            disabled={disabled || (max !== undefined && value >= max)}
            title="増やす"
          >
            <i className="fa-solid fa-plus" />
          </button>
        )}
      </div>
    </div>
  );
};
