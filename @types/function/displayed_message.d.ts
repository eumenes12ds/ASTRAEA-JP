/**
 * メッセージフロア番号に対応するメッセージ内容の JQuery インスタンスを取得する
 *
 * 実用的な関数というより、JQuery が使えることを示すサンプルに近い
 *
 * @param message_id 取得するメッセージフロア番号, 酒場のページにそのメッセージフロアが表示されている必要がある
 * @returns そのメッセージフロアの html を取得できた場合は対応する JQuery を返し、それ以外の場合は空の JQuery を返す
 *
 * @example
 * // 0 フロアのメッセージ内容のテキストを取得する
 * const text = retrieveDisplayedMessage(0).text();
 *
 * @example
 * // 0 フロアのメッセージ内容のテキストを変更する
 * // - このような変更は今回の表示にのみ影響し、メッセージファイルには保存されないため、メッセージの再読み込みやページのリフレッシュなどの操作を行うと元に戻る;
 * // - 実際にメッセージファイルを変更する場合は、`setChatMessage` を使用してください
 * retrieveDisplayedMessage(0).text("new text");
 * retrieveDisplayedMessage(0).append("<pre>new text</pre>");
 * retrieveDisplayedMessage(0).append(formatAsDisplayedMessage("{{char}} speaks in {{lastMessageId}}"));
 */
declare function retrieveDisplayedMessage(message_id: number): JQuery<HTMLDivElement>;

type FormatAsDisplayedMessageOption = {
  /** メッセージが存在するフロア, そのフロアが既に存在している必要がある, つまり `[0, getLastMessageId()]` の範囲内; デフォルトは 'last' */
  message_id?: 'last' | 'last_user' | 'last_char' | number;
};

/**
 * 文字列を酒場が表示に使用する html 形式に処理する. 処理内容は、
 * 1. 文字列中の酒場マクロを置換する
 * 2. 文字列に対応する酒場の正規表現を適用する
 * 3. 文字列を html 形式に調整する
 *
 * @param text 処理する文字列
 * @param option オプション
 *   - `message_id?:number`: メッセージが存在するフロア, そのフロアが既に存在している必要がある, つまり `[0, getLastMessageId()]` の範囲内; デフォルトは最新フロア
 *
 * @returns 処理結果
 *
 * @throws 指定されたメッセージフロア番号 `message_id` が `[0, getLastMessageId()]` の範囲内にない場合、エラーをスローする
 *
 * @example
 * const text = formatAsDisplayedMessage("{{char}} speaks in {{lastMessageId}}");
 * => "<p>少女☆歌劇 speaks in 5</p>";
 */
declare function formatAsDisplayedMessage(text: string, { message_id }?: FormatAsDisplayedMessageOption): string;

/**
 * 単一フロアの表示をリフレッシュまたは置き換える, そのフロアがページ上に表示されていない場合は何もしない
 *
 * @param message_id リフレッシュするメッセージフロア番号
 * @param $mes リフレッシュするメッセージフロアに対応する JQuery インスタンス, 未指定の場合は `message_id` から自動的に取得される
 *
 * @example
 * // 0 フロアの表示をリフレッシュする
 * await refreshOneMessage(0);
 *
 * @example
 * // 最新フロアの表示をリフレッシュする
 * await refreshOneMessage(getLastMessageId());
 *
 * @example
 * // 強制的に 5 フロアに 0 フロアのメッセージを表示させる, これはページの表示にのみ影響し、実際のチャット記録には影響しない
 * await refreshOneMessage(0, $('#chat > .mes[mesid="5"]'));
 *
 * @example
 * // 強制的に最後のフロアに 0 フロアのメッセージを表示させる, これはページの表示にのみ影響し、実際のチャット記録には影響しない
 * await refreshOneMessage(0, $('#chat > .mes.last_mes'));
 */
declare function refreshOneMessage(message_id: number, $mes?: JQuery): Promise<void>;
