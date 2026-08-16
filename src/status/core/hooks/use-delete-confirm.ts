import { useCallback, useState } from 'react';
import { useMvuDataStore } from '../stores';

/**
 * 削除対象タイプ
 */
export interface DeleteTarget {
  /** 削除タイプ（例：状態効果、パートナー、装備等） */
  type: string;
  /** データパス */
  path: string;
  /** 項目名 */
  name: string;
}

/**
 * 削除確認 Hook の戻り値
 */
export interface UseDeleteConfirmReturn {
  /** 現在の削除対象 */
  deleteTarget: DeleteTarget | null;
  /** 削除対象を設定（確認モーダルを開く） */
  setDeleteTarget: (target: DeleteTarget | null) => void;
  /** 削除処理を実行 */
  handleDelete: () => Promise<void>;
  /** 削除をキャンセル（モーダルを閉じる） */
  cancelDelete: () => void;
  /** 確認モーダルを表示するかどうか */
  isConfirmOpen: boolean;
}

/**
 * 削除確認 Hook
 * 繰り返し発生する削除確認ロジックを抽象化。StatusTab, DestinyTab, ItemsTab 等で使用
 *
 * @example
 * ```tsx
 * const { deleteTarget, setDeleteTarget, handleDelete, cancelDelete, isConfirmOpen } = useDeleteConfirm();
 *
 * // 削除をトリガー
 * setDeleteTarget({ type: '装備', path: '主人公.装備.鉄剣', name: '鉄剣' });
 *
 * // 確認モーダルを描画
 * <ConfirmModal
 *   open={isConfirmOpen}
 *   title={`確認削除${deleteTarget?.type ?? ''}`}
 *   rows={[
 *     { label: '名称', value: deleteTarget?.name ?? '' },
 *     { label: '操作', value: 'この操作は取り消せません' },
 *   ]}
 *   buttons={[
 *     { text: '削除', variant: 'danger', onClick: handleDelete },
 *     { text: 'キャンセル', variant: 'secondary', onClick: cancelDelete },
 *   ]}
 *   onClose={cancelDelete}
 * />
 * ```
 */
export const useDeleteConfirm = (): UseDeleteConfirmReturn => {
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const { deleteField } = useMvuDataStore();

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      await deleteField(deleteTarget.path);
      toastr.success(`「${deleteTarget.name}」を削除しました`);
    } catch {
      toastr.error('削除に失敗しました');
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteField]);

  const cancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  return {
    deleteTarget,
    setDeleteTarget,
    handleDelete,
    cancelDelete,
    isConfirmOpen: !!deleteTarget,
  };
};
