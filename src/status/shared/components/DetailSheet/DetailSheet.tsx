import { FC, ReactNode, useCallback, useEffect } from 'react';
import styles from './DetailSheet.module.scss';

export interface DetailSheetProps {
  open: boolean;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  onClose?: () => void;
  closeOnOverlay?: boolean;
  className?: string;
}

/**
 * ボトムシート詳細コンポーネント
 * モバイルで二次詳細情報を表示するために使用。メインページが長くなったり折りたたみパネルに依存するのを回避
 */
export const DetailSheet: FC<DetailSheetProps> = ({
  open,
  title,
  subtitle,
  children,
  onClose,
  closeOnOverlay = true,
  className,
}) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!closeOnOverlay) {
        return;
      }

      if (event.target === event.currentTarget) {
        onClose?.();
      }
    },
    [closeOnOverlay, onClose],
  );

  const handlePanelClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={`${styles.sheet} ${className ?? ''}`} onClick={handlePanelClick}>
        <div className={styles.handle} />
        <div className={styles.header}>
          <div className={styles.headerText}>
            <div className={styles.title}>{title}</div>
            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
          </div>
          <button className={styles.closeButton} onClick={onClose} title="詳細を閉じる">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
};
