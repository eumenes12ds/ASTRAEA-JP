import type { FC, ReactNode } from 'react';

export interface EmptyHintProps {
  className?: string;
  icon?: string;
  text?: ReactNode;
  as?: 'div' | 'span';
  children?: ReactNode;
}

/**
 * 空状態のヒント
 * 渡された className を使用して各ページのスタイルに合わせる
 */
export const EmptyHint: FC<EmptyHintProps> = ({ className, icon, text, as = 'div', children }) => {
  const Component = as;

  return (
    <Component className={className}>
      {icon && <i className={icon} aria-hidden="true" />}
      {text}
      {children}
    </Component>
  );
};
