import { FC, ReactNode, useCallback, useEffect } from 'react';
import styles from './ItemInspectModal.module.scss';

export interface ItemInspectModalProps {
  /** 表示するかどうか */
  open: boolean;
  /** タイトル */
  title: string;
  /** サブタイトル */
  subtitle?: ReactNode;
  /** 内容 */
  children: ReactNode;
  /** クローズコールバック */
  onClose?: () => void;
  /** オーバーレイクリックで閉じるかどうか */
  closeOnOverlay?: boolean;
  /** カスタムクラス名 */
  className?: string;
}

/**
 * 資産詳細中央パネル
 * ItemsTab の二次詳細情報を表示するために使用。ボトムシートや折りたたみパネルに依存しない。
 */
export const ItemInspectModal: FC<ItemInspectModalProps> = ({
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
      if (!closeOnOverlay) return;

      if (event.target === event.currentTarget) {
        onClose?.();
      }
    },
    [closeOnOverlay, onClose],
  );

  const handlePanelClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  }, []);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${className ?? ''}`.trim()} onClick={handlePanelClick}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <div className={styles.title}>{title}</div>
            {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            title="詳細を閉じる"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
};
