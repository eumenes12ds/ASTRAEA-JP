import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface EditorSettingState {
  /** 編集を許可するかどうか */
  editEnabled: boolean;
}

interface EditorSettingActions {
  /** 編集可否を設定 */
  setEditEnabled: (enabled: boolean) => void;
  /** 酒館変数から設定を読み込む */
  loadSettings: () => void;
  /** 設定を酒館変数に保存 */
  saveSettings: () => Promise<void>;
}

type EditorSettingStore = EditorSettingState & EditorSettingActions;

export const useEditorSettingStore = create<EditorSettingStore>()(
  immer(set => ({
    editEnabled: false,

    setEditEnabled: () => {
      set(state => {
        state.editEnabled = false;
      });
    },

    loadSettings: () => {
      // 旧チャット・キャラクター変数に true が残っていても編集を有効にしない。
      set(state => {
        state.editEnabled = false;
      });
    },

    saveSettings: async () => {
      try {
        await insertOrAssignVariables({ status_edit_enabled: false }, { type: 'character' });
      } catch (error) {
        console.error('[StatusBar] 編集設定の保存に失敗:', error);
      }
    },
  })),
);
