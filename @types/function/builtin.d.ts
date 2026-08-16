declare const builtin: {
  /**
   * メッセージを1件ページに追加してレンダリングする
   *
   * @param mes レンダリングするフロアデータ
   * @param options オプション
   * - `type`: フロアのタイプ; デフォルトは `'normal'`
   * - `insertAfter`: 指定したフロアの後ろに挿入; デフォルトは `null`
   * - `scroll`: 新しいフロアまでスクロールするか; デフォルトは `true`
   * - `insertBefore`: 指定したフロアの前に挿入; デフォルトは `null`
   * - `forceId`: 指定したフロア番号を強制使用; デフォルトは `null`
   * - `showSwipes`: スワイプボタンを表示するか; デフォルトは `true`
   */
  addOneMessage: (
    mes: Record<string, any>,
    options?: {
      type?: string;
      insertAfter?: number;
      scroll?: boolean;
      insertBefore?: number;
      forceId?: number;
      showSwipes?: boolean;
    },
  ) => void;
  /**
   * テキストをクリップボードにコピーする
   *
   * @param text コピーするテキスト
   */
  copyText: (text: string) => void;
  duringGenerating: () => boolean;
  getImageTokenCost: (data_url: string, quality: 'low' | 'auto' | 'high') => Promise<number>;
  getVideoTokenCost: (data_url: string) => Promise<number>;
  parseRegexFromString: (regex: string) => RegExp | null;
  promptManager: {
    messages: Array<{
      collection: Array<{
        identifier: string;
        role: 'user' | 'assistant' | 'system';
        content: string;
        tokens: number;
      }>;
      identifier: string;
    }>;
    getPromptCollection: () => {
      collection: Array<{
        identifier: string;
        name: string;
        enabled?: boolean;

        injection_position: 0 | 1;
        injection_depth: number;
        injection_order: number;

        role: 'user' | 'assistant' | 'system';
        content: string;

        system_prompt: boolean;
        marker?: boolean;

        extra?: Record<string, any>;

        forbid_overrides?: boolean;
      }>;
      [key: string]: any;
    };
    [key: string]: any;
  };
  /** 現在のチャットをリフレッシュし、CHARACTER_MESSAGE_RENDERED と USER_MESSAGE_RENDERED イベントを発火して再レンダリングする */
  reloadAndRenderChatWithoutEvents: () => Promise<void>;
  /** 現在のチャットをリフレッシュするが、イベントは一切発火しない */
  reloadChatWithoutEvents: () => Promise<void>;
  /** ワールドブックエディタの表示をリフレッシュする */
  reloadEditor: (file: string, load_if_not_selected?: boolean) => void;
  /** ワールドブックエディタの表示をリフレッシュする (デバウンス) */
  reloadEditorDebounced: (file: string, load_if_not_selected?: boolean) => void;
  /** markdown を html にレンダリングする */
  renderMarkdown: (string: string) => string;
  /** プリセットのプロンプト一覧をリフレッシュする */
  renderPromptManager: (after_try_generate?: boolean) => void;
  /** プリセットのプロンプト一覧をリフレッシュする (デバウンス) */
  renderPromptManagerDebounced: (after_try_generate?: boolean) => void;
  saveSettings: () => Promise<void>;
  uuidv4: () => string;
};
