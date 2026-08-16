import { FC } from 'react';
import type { DeleteTarget } from '../../../core/hooks/use-delete-confirm';
import { ConfirmModal } from '../ConfirmModal';

export interface DeleteConfirmModalProps {
  /** 表示するかどうか */
  open: boolean;
  /** 削除対象 */
  target: DeleteTarget | null;
  /** 削除確認コールバック */
  onConfirm: () => void;
  /** キャンセルコールバック */
  onCancel: () => void;
}

/**
 * 削除確認モーダルコンポーネント
 * 各ページで繰り返される削除確認ロジックを抽象化
 */
export const DeleteConfirmModal: FC<DeleteConfirmModalProps> = ({
  open,
  target,
  onConfirm,
  onCancel,
}) => {
  return (
    <ConfirmModal
      open={open}
      title={`${target?.type ?? ''}の削除を確認`}
      rows={[
        { label: '名称', value: target?.name ?? '' },
        { label: '注意', value: 'この操作は取り消せません' },
      ]}
      buttons={[
        { text: '削除', variant: 'danger', onClick: onConfirm },
        { text: 'キャンセル', variant: 'secondary', onClick: onCancel },
      ]}
      onClose={onCancel}
    />
  );
};
