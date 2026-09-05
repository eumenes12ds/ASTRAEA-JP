import { FC, MouseEventHandler } from 'react';
import styles from './AvatarPanel.module.scss';

export type AvatarPanelSize = 'sm' | 'md' | 'lg';

export interface AvatarPanelProps {
  /** アバターURL。空の場合はプレースホルダーを表示 */
  src?: string;
  /** 画像の代替テキスト */
  alt: string;
  /** サイズ仕様 */
  size?: AvatarPanelSize;
  /** 画像の読み込み失敗 */
  onImageError?: () => void;
  /** アバターのクリック */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** カスタムクラス名 */
  className?: string;
}

const DefaultAvatarSrc = `https://testingcf.jsdelivr.net/gh/eumenes12ds/ASTRAEA-JP@v${__APP_VERSION__}/public/images/avatar.png`;

const SizeClassMap: Record<AvatarPanelSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

/**
 * 汎用アバターパネルコンポーネント
 */
export const AvatarPanel: FC<AvatarPanelProps> = ({
  src,
  alt,
  size = 'md',
  onImageError,
  onClick,
  className = '',
}) => {
  const displaySrc = src || DefaultAvatarSrc;

  return (
    <div className={`${styles.avatarPanel} ${SizeClassMap[size]} ${className}`.trim()}>
      <button
        type="button"
        className={styles.imageButton}
        onClick={onClick}
        aria-label={alt}
        title={alt}
      >
        <div className={styles.imageShell}>
          <img
            className={styles.image}
            src={displaySrc}
            alt={alt}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            onError={onImageError}
          />
        </div>
      </button>
    </div>
  );
};
