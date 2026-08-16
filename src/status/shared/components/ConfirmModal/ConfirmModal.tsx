import { FC, ReactNode, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './ConfirmModal.module.scss';

/** 確認モーダルの情報行設定 */
export interface ConfirmModalRow {
  /** 行ラベル */
  label: string;
  /** 行の値 */
  value: ReactNode;
}

/** ボタンタイプ */
export type ConfirmButtonVariant = 'primary' | 'danger' | 'secondary';

/** ボタン設定 */
export interface ConfirmModalButton {
  /** ボタンのテキスト */
  text: string;
  /** ボタンタイプ */
  variant?: ConfirmButtonVariant;
  /** クリックコールバック */
  onClick: () => void;
  /** 無効かどうか */
  disabled?: boolean;
}

export interface ConfirmModalProps {
  /** 表示するかどうか */
  open: boolean;
  /** モーダルのタイトル */
  title: string;
  /** 情報行リスト（シンプルなラベル-値ペアの表示） */
  rows?: ConfirmModalRow[];
  /** カスタムコンテンツ（rows より優先。より柔軟なコンテンツ領域） */
  children?: ReactNode;
  /** ボタン設定リスト */
  buttons?: ConfirmModalButton[];
  /** オーバーレイクリック時のクローズコールバック */
  onClose?: () => void;
  /** オーバーレイクリックで閉じるかどうか。デフォルト true */
  closeOnOverlay?: boolean;
  /** カスタムクラス名 */
  className?: string;
}

/**
 * iframe の位置までスクロール（親ページを iframe の可視領域までスクロールさせる）
 * モーダルは iframe 経由でページに読み込まれるため、親ページを iframe 位置までスクロールしてモーダルを見えるようにする
 */
const scrollToIframe = () => {
  const frameElement = window.frameElement;
  if (frameElement) {
    frameElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

/**
 * 汎用確認モーダルコンポーネント
 * 情報行の表示とカスタムコンテンツに対応
 */
export const ConfirmModal: FC<ConfirmModalProps> = ({
  open,
  title,
  rows,
  children,
  buttons,
  onClose,
  closeOnOverlay = true,
  className,
}) => {
  // モーダル表示時に iframe 位置までスクロール
  useEffect(() => {
    if (open) {
      scrollToIframe();
    }
  }, [open]);

  /** オーバーレイクリックの処理 */
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!closeOnOverlay) return;

      if (event.target === event.currentTarget) {
        onClose?.();
      }
    },
    [closeOnOverlay, onClose],
  );

  /** モーダル内部のクリックのバブリングを防止 */
  const handleModalClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  /** ボタンのスタイルクラス名を取得 */
  const getButtonClass = (variant: ConfirmButtonVariant = 'primary') => {
    switch (variant) {
      case 'danger':
        return styles.btnDanger;
      case 'secondary':
        return styles.btnSecondary;
      case 'primary':
      default:
        return styles.btnPrimary;
    }
  };

  if (!open) return null;

  const modalNode = (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${className ?? ''}`} onClick={handleModalClick}>
        <div className={styles.title}>{title}</div>

        {/* カスタムコンテンツ領域 */}
        {children && <div className={styles.content}>{children}</div>}

        {/* 情報行の表示 */}
        {!children && rows && rows.length > 0 && (
          <div className={styles.body}>
            {rows.map((row, index) => (
              <div key={index} className={styles.row}>
                <span className={styles.label}>{row.label}</span>
                <span className={styles.value}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ボタン領域 */}
        {buttons && buttons.length > 0 && (
          <div className={styles.actions}>
            {buttons.map((btn, index) => (
              <button
                key={index}
                className={getButtonClass(btn.variant)}
                onClick={btn.onClick}
                disabled={btn.disabled}
              >
                {btn.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
};
