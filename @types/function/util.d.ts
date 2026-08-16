/**
 * 文字列中の酒場マクロを置換する
 *
 * @param text 置換する文字列
 * @returns 置換結果
 *
 * @example
 * const text = substitudeMacros("{{char}} speaks in {{lastMessageId}}");
 * text == "少女☆歌劇 speaks in 5";
 */
declare function substitudeMacros(text: string): string;

/**
 * 最新フロアの id を取得する
 *
 * @returns 最新フロアの id
 */
declare function getLastMessageId(): number;

/**
 * 任意の関数をラップし、エラーメッセージを酒場の通知で表示する同機能の関数を返す
 *
 * @param fn ラップする関数
 * @returns ラップ後の関数
 *
 * @example
 * // `test` 関数をラップし、酒場の通知に 'test' テキストを表示する
 * function test() {
 *   throw Error(`test`);
 * }
 * errorCatched(test)();
 */
declare function errorCatched<T extends any[], U>(fn: (...args: T) => U): (...args: T) => U;

/**
 * フロントエンドUI の iframe 識別名 `iframe_name` から、そのフロアのフロア番号を取得する, **フロントエンドUI の iframe 識別名にのみ使用できる**
 *
 * @param iframe_name フロントエンドUI の iframe 識別名
 * @returns フロア番号
 *
 * @throws 指定された `iframe_name` がフロントエンドUI の iframe 識別名でない場合、エラーをスローする
 */
declare function getMessageId(iframe_name: string): number;
