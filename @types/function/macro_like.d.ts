type MacroLikeContext = {
  message_id?: number;
  role?: 'user' | 'assistant' | 'system';
};

type RegisterMacroLikeReturn = {
  /** 登録解除 */
  unregister: () => void;
};

/**
 * 新しいアシスタントマクロを登録する
 *
 * @param regex マッチする正規表現
 * @param replace マッチしたテキストに対して行う置換
 *
 * @example
 * // 行数をカウントするマクロを登録する
 * registerMacros(
 *   /<count_lines>(.*?)<count_lines>/gi,
 *   context => content.split('\n').length
 * );
 *
 * @returns 戻り値
 *   - `unregister`: 登録を解除する
 */
declare function registerMacroLike(
  regex: RegExp,
  replace: (context: MacroLikeContext, substring: string, ...args: any[]) => string,
): RegisterMacroLikeReturn;

/**
 * アシスタントマクロの登録を解除する
 *
 * @param regex アシスタントマクロの正規表現
 */
declare function unregisterMacroLike(regex: RegExp): void;
