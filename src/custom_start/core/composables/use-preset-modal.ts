/**
 * プリセットモーダル管理 Composable
 */
import { useCharacterStore } from '../store';
import { findMatchingPreset, hasPresets } from '../utils/preset-manager';

type PresetModalMode = 'manage' | 'load';

interface UsePresetModalReturn {
  /** モーダルが表示されるか */
  showModal: Ref<boolean>;
  /** モーダルのモード */
  modalMode: Ref<PresetModalMode>;
  /** 管理モードのモーダルを開く */
  openManageModal: () => void;
  /** 読み込みモードのモーダルを開く */
  openLoadModal: () => void;
  /** モーダルを閉じる */
  closeModal: () => void;
  /** チェックして読み込みモーダルを表示 (初期化用) */
  checkAndShowLoadModal: () => void;
  /** 現在の設定が既存プリセットと一致するか確認 */
  checkMatchingPreset: () => string | null;
}

/**
 * プリセットモーダル管理を使用
 */
export function usePresetModal(): UsePresetModalReturn {
  const characterStore = useCharacterStore();
  const showModal = ref(false);
  const modalMode = ref<PresetModalMode>('manage');

  const openManageModal = () => {
    modalMode.value = 'manage';
    showModal.value = true;
  };

  const openLoadModal = () => {
    modalMode.value = 'load';
    showModal.value = true;
  };

  const closeModal = () => {
    showModal.value = false;
  };

  const checkAndShowLoadModal = () => {
    if (hasPresets()) {
      openLoadModal();
    }
  };

  const checkMatchingPreset = (): string | null => {
    return findMatchingPreset(characterStore);
  };

  return {
    showModal,
    modalMode,
    openManageModal,
    openLoadModal,
    closeModal,
    checkAndShowLoadModal,
    checkMatchingPreset,
  };
}
