import type { CSSProperties, FC, ReactNode } from 'react';

export interface IconTitleProps {
  icon?: string;
  text: ReactNode;
  className: string;
  style?: CSSProperties;
  as?: 'div' | 'span';
}

/**
 * アイコン + テキストタイトル
 */
export const IconTitle: FC<IconTitleProps> = ({ icon, text, className, style, as = 'div' }) => {
  const Component = as;

  return (
    <Component className={className} style={style}>
      {icon && <i className={icon} />}
      <span>{text}</span>
    </Component>
  );
};
