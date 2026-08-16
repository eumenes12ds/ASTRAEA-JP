import { ChangeEvent, FC, useId, useState } from 'react';
import { ConfirmModal } from '../ConfirmModal';
import styles from './AvatarActionModal.module.scss';

export interface AvatarActionModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  linkPlaceholder?: string;
  canExport?: boolean;
  canDelete?: boolean;
  canReset?: boolean;
  deleteLabel?: string;
  resetLabel?: string;
  onClose: () => void;
  onUpload: (file: File) => Promise<void> | void;
  onSubmitLink: (url: string) => Promise<void> | void;
  onExport?: () => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  onReset?: () => Promise<void> | void;
}

/**
 * アバター操作モーダル
 */
export const AvatarActionModal: FC<AvatarActionModalProps> = ({
  open,
  title,
  subtitle,
  linkPlaceholder = 'アバターの画像リンクを入力',
  canExport = false,
  canDelete = false,
  canReset = false,
  deleteLabel = 'アバターを削除',
  resetLabel = 'デフォルトに戻す',
  onClose,
  onUpload,
  onSubmitLink,
  onExport,
  onDelete,
  onReset,
}) => {
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputId = useId();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';

    if (!selectedFile) {
      return;
    }

    await onUpload(selectedFile);
    onClose();
  };

  const handleLinkSubmit = async () => {
    const normalizedUrl = _.trim(avatarUrl);
    if (!normalizedUrl) {
      return;
    }

    await onSubmitLink(normalizedUrl);
    setAvatarUrl('');
    onClose();
  };

  const handleClose = () => {
    setAvatarUrl('');
    onClose();
  };

  const handleExport = async () => {
    await onExport?.();
    onClose();
  };

  const handleDelete = async () => {
    await onDelete?.();
    onClose();
  };

  const handleReset = async () => {
    await onReset?.();
    onClose();
  };

  return (
    <ConfirmModal open={open} title={title} onClose={handleClose} className={styles.modal}>
      <div className={styles.panel}>
        {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}

        <div className={styles.section}>
          <div className={styles.sectionTitle}>ローカルからインポート</div>
          <label htmlFor={fileInputId} className={styles.actionButton}>
            <i className="fa-solid fa-upload" />
            <span>アバターをインポート</span>
          </label>
          <input
            id={fileInputId}
            className={styles.fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={event => {
              void handleFileChange(event);
            }}
          />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>画像リンク</div>
          <div className={styles.linkRow}>
            <input
              className={styles.linkInput}
              value={avatarUrl}
              placeholder={linkPlaceholder}
              onChange={event => setAvatarUrl(event.target.value)}
            />
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => {
                void handleLinkSubmit();
              }}
              disabled={!_.trim(avatarUrl)}
            >
              <i className="fa-solid fa-link" />
              <span>リンクを保存</span>
            </button>
          </div>
        </div>

        <div className={styles.footerActions}>
          {canExport ? (
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => {
                void handleExport();
              }}
            >
              <i className="fa-solid fa-file-export" />
              <span>アバターをエクスポート</span>
            </button>
          ) : null}

          {canDelete ? (
            <button
              type="button"
              className={`${styles.actionButton} ${styles.actionButtonDanger}`}
              onClick={() => {
                void handleDelete();
              }}
            >
              <i className="fa-solid fa-trash" />
              <span>{deleteLabel}</span>
            </button>
          ) : null}

          {canReset ? (
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => {
                void handleReset();
              }}
            >
              <i className="fa-solid fa-rotate-left" />
              <span>{resetLabel}</span>
            </button>
          ) : null}
        </div>
      </div>
    </ConfirmModal>
  );
};
