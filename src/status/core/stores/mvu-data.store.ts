import { Schema } from '@/data_schema/schema';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { StatData } from '../types';

interface MvuDataState {
  /** MVU データ */
  data: StatData | null;
  /** 読み込み中かどうか */
  loading: boolean;
  /** エラー情報 */
  error: string | null;
  /** 最終更新時間 */
  lastRefreshTime: Date | null;
}

interface MvuDataActions {
  /** データを更新 (Read) */
  refresh: () => void;
  /** 指定パスの値を更新 */
  updateField: (path: string, value: unknown) => Promise<boolean>;
  /** 指定パスの値を削除 */
  deleteField: (path: string) => Promise<boolean>;
  /** 自由属性ポイントを 1 消費して指定属性を強化（2フィールド原子更新） */
  allocateAttributePoint: (attributeName: string) => Promise<boolean>;
}

type MvuDataStore = MvuDataState & MvuDataActions;

export const useMvuDataStore = create<MvuDataStore>()(
  immer((set, get) => ({
    // State
    data: null,
    loading: true,
    error: null,
    lastRefreshTime: null,

    // Actions

    /**
     * データを更新
     */
    refresh: () => {
      set(state => {
        state.loading = true;
      });

      try {
        // 現在のメッセージフロアの変数データを取得
        const variables = getVariables({
          type: 'message',
          message_id: getCurrentMessageId(),
        });

        // stat_data を抽出して解析
        const rawData = _.get(variables, 'stat_data', {});
        const result = Schema.safeParse(rawData);

        if (!result.success) {
          console.warn('[StatusBar] データ検証に失敗:', result.error);
          set(state => {
            state.error = `データ形式エラー：${result.error.message || '未知のエラー'}`;
            state.loading = false;
          });

          return;
        }

        set(state => {
          state.data = result.data;
          state.loading = false;
          state.error = null;
          state.lastRefreshTime = new Date();
        });

        console.log('[StatusBar] データを更新しました');
      } catch (e) {
        console.error('[StatusBar] データの読み込みに失敗:', e);
        set(state => {
          state.error = e instanceof Error ? e.message : '未知のエラー';
          state.loading = false;
        });
      }
    },

    /**
     * 指定パスの値を更新
     */
    updateField: async (path: string, value: unknown): Promise<boolean> => {
      try {
        await waitGlobalInitialized('Mvu');
        const mvuData = Mvu.getMvuData({
          type: 'message',
          message_id: getCurrentMessageId(),
        });

        // 値を更新
        _.set(mvuData, `stat_data.${path}`, value);

        // 書き戻し
        await Mvu.replaceMvuData(mvuData, {
          type: 'message',
          message_id: getCurrentMessageId(),
        });

        // ローカル状態を更新
        get().refresh();

        return true;
      } catch (e) {
        console.error('[StatusBar] データの更新に失敗:', e);
        return false;
      }
    },

    /**
     * 自由属性ポイントを 1 消費して指定属性を強化（2フィールド原子更新）
     * 属性上限は状態ページの属性エディタと一致させる
     */
    allocateAttributePoint: async (attributeName: string): Promise<boolean> => {
      try {
        await waitGlobalInitialized('Mvu');
        const mvuData = Mvu.getMvuData({
          type: 'message',
          message_id: getCurrentMessageId(),
        });
        const statData = _.get(mvuData, 'stat_data', {});

        const points = _.get(statData, '主人公.属性ポイント', 0);
        const current = _.get(statData, `主人公.属性.${attributeName}`, 0);
        if (!_.isInteger(points) || points < 1) return false;
        if (!_.isNumber(current) || current > 19) return false;

        // 2フィールドを一度に書き戻し、ポイントだけ減る・属性だけ増える中間状態を回避
        _.set(mvuData, 'stat_data.主人公.属性ポイント', points - 1);
        _.set(mvuData, `stat_data.主人公.属性.${attributeName}`, current + 1);

        await Mvu.replaceMvuData(mvuData, {
          type: 'message',
          message_id: getCurrentMessageId(),
        });

        get().refresh();
        return true;
      } catch (e) {
        console.error('[StatusBar] 属性ポイントの割り当てに失敗:', e);
        return false;
      }
    },

    /**
     * 指定パスの値を削除
     */
    deleteField: async (path: string): Promise<boolean> => {
      try {
        await waitGlobalInitialized('Mvu');
        const mvuData = Mvu.getMvuData({
          type: 'message',
          message_id: getCurrentMessageId(),
        });

        // 値を削除
        _.unset(mvuData, `stat_data.${path}`);

        // 書き戻し
        await Mvu.replaceMvuData(mvuData, {
          type: 'message',
          message_id: getCurrentMessageId(),
        });

        // ローカル状態を更新
        get().refresh();

        return true;
      } catch (e) {
        console.error('[StatusBar] データの削除に失敗:', e);
        return false;
      }
    },
  })),
);
