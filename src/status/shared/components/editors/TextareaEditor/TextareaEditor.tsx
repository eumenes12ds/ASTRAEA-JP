import { FC } from 'react';
import { TextEditor } from '../TextEditor/TextEditor';

export interface TextareaEditorProps {
  /** 現在の値 */
  value: string;
  /** 値変更コールバック */
  onChange: (value: string) => void;
  /** プレースホルダー */
  placeholder?: string;
  /** 行数 */
  rows?: number;
  /** 無効かどうか */
  disabled?: boolean;
  /** 最大文字数 */
  maxLength?: number;
  /** カスタムクラス名 */
  className?: string;
}

/**
 * 複数行テキストエディタ
 */
export const TextareaEditor: FC<TextareaEditorProps> = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled = false,
  maxLength,
  className,
}) => {
  return (
    <TextEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      multiline
      rows={rows}
      disabled={disabled}
      maxLength={maxLength}
      className={className}
    />
  );
};
