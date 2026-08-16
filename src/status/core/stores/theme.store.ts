import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { DefaultTheme, ThemePresets } from '../../config/theme-presets';
import type { Theme, ThemeColors, ThemePresetId } from '../types';

interface ThemeState {
  /** 現在選択中のテーマID */
  currentThemeId: ThemePresetId;
  /** 読み込み済みかどうか */
  loaded: boolean;
}

interface ThemeActions {
  /** 酒館変数からテーマを読み込む */
  loadTheme: () => void;
  /** テーマを酒館変数に保存 */
  saveTheme: () => Promise<void>;
  /** テーマを切り替え */
  setTheme: (themeId: ThemePresetId) => void;
  /** デフォルトテーマにリセット */
  reset: () => Promise<void>;
  /** CSS 変数を DOM に適用 */
  applyCssVariables: () => void;
  /** 現在のテーマを取得 */
  getCurrentTheme: () => Theme;
  /** 現在のテーマ色を取得 */
  getColors: () => ThemeColors;
}

type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>()(
  immer((set, get) => ({
    // State
    currentThemeId: DefaultTheme.id,
    loaded: false,

    // Actions

    loadTheme: () => {
      try {
        const variables = getVariables({ type: 'character' });
        const savedThemeId = _.get(variables, 'status_theme_id', null) as ThemePresetId | null;

        if (savedThemeId && ThemePresets[savedThemeId]) {
          set(state => {
            state.currentThemeId = savedThemeId;
          });
        }

        set(state => {
          state.loaded = true;
        });

        // CSS 変数を適用
        get().applyCssVariables();
      } catch (error) {
        console.error('[StatusBar] テーマの読み込みに失敗:', error);
        set(state => {
          state.loaded = true;
        });
      }
    },

    saveTheme: async () => {
      try {
        await insertOrAssignVariables(
          { status_theme_id: get().currentThemeId },
          { type: 'character' },
        );
      } catch (error) {
        console.error('[StatusBar] テーマの保存に失敗:', error);
      }
    },

    setTheme: themeId => {
      if (!ThemePresets[themeId]) {
        console.warn(`[StatusBar] 未知のテーマID: ${themeId}`);
        return;
      }

      set(state => {
        state.currentThemeId = themeId;
      });

      get().applyCssVariables();
    },

    reset: async () => {
      set(state => {
        state.currentThemeId = DefaultTheme.id;
      });

      try {
        await deleteVariable('status_theme_id', { type: 'character' });
      } catch (error) {
        console.error('[StatusBar] テーマのリセットに失敗:', error);
      }

      get().applyCssVariables();
    },

    getCurrentTheme: () => {
      const { currentThemeId } = get();
      return ThemePresets[currentThemeId] || DefaultTheme;
    },

    getColors: () => {
      return get().getCurrentTheme().colors;
    },

    applyCssVariables: () => {
      const colors = get().getColors();
      const root = document.documentElement;

      Object.entries(colors).forEach(([key, value]) => {
        // キャメルケースを kebab-case に変換: windowBg -> window-bg
        const cssVarName = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVarName, String(value));
      });

      // テーマの明暗をマークし、スタイル層がライト/ダークテーマに適応できるようにする
      const bg = colors.windowBg;
      const match = /^#([0-9a-f]{6})$/i.exec(bg);
      if (match) {
        const channels = [0, 2, 4].map(i => parseInt(match[1].slice(i, i + 2), 16) / 255);
        const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
        root.dataset.themeMode = luminance > 0.5 ? 'light' : 'dark';
      }
    },
  })),
);
