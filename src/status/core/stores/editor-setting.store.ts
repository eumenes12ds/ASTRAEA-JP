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
  immer((set, get) => ({
    editEnabled: false,

    setEditEnabled: enabled => {
      set(state => {
        state.editEnabled = enabled;
      });
    },

    loadSettings: () => {
      try {
        const variables = getVariables({ type: 'character' });
        const setting = _.get(variables, 'status_edit_enabled', null);
        if (typeof setting === 'boolean') {
          set(state => {
            state.editEnabled = setting;
          });
        }
      } catch (error) {
        console.error('[StatusBar] 編集設定の読み込みに失敗:', error);
      }
    },

    saveSettings: async () => {
      try {
        await insertOrAssignVariables(
          { status_edit_enabled: get().editEnabled },
          { type: 'character' },
        );
      } catch (error) {
        console.error('[StatusBar] 編集設定の保存に失敗:', error);
      }
    },
  })),
);
