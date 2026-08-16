type InjectionPrompt = {
  id: string;
  /**
   * 注入する位置
   * - 'in_chat': チャットに挿入する
   * - 'none': AI には送信されないが、ワールドブックエントリの発動に使用できる.
   */
  position: 'in_chat' | 'none';
  depth: number;

  role: 'system' | 'assistant' | 'user';
  content: string;

  /** プロンプトがどのような場合に有効になるか; デフォルトは常に */
  filter?: (() => boolean) | (() => Promise<boolean>);
  /** スキャン対象テキストとして、ワールドブックの緑ランプエントリのスキャン対象テキストに含めるか; デフォルトは任意 */
  should_scan?: boolean;
};

type injectPromptsOptions = {
  /** 次のリクエスト生成でのみ有効か; デフォルトは false */
  once?: boolean;
};

/**
 * プロンプトを注入する
 *
 * このように注入されたプロンプトは現在のチャットファイル内でのみ有効で、
 * - チャットファイルをまたいで注入したい場合や、新しいチャットを開いたときに再注入したい場合は、`tavern_events.CHAT_CHANGED` イベントをリッスンできる.
 * - あるいは、`tavern_events.GENERATION_AFTER_COMMANDS` イベントをリッスンして、生成前に注入することもできる.
 *
 * @param prompts 注入するプロンプト
 * @param options オプション
 *   - `once:boolean`: 次のリクエスト生成でのみ有効か; デフォルトは false
 *
 * @returns 戻り値
 *   - `uninject`: このプロンプトの注入をキャンセルする
 */
declare function injectPrompts(prompts: InjectionPrompt[], options?: injectPromptsOptions): { uninject: () => void };

/**
 * 注入されたプロンプトを削除する
 *
 * @param ids 削除するプロンプトの id 一覧
 */
declare function uninjectPrompts(ids: string[]): void;
