/**
 * Slash コマンドを実行する, コマンドを書き間違えても何のフィードバックも得られないことに注意
 *
 * 使用できるコマンドは[作成テンプレート](https://stagedog.github.io/青空莉/工具经验/实时编写前端界面或脚本/)の `slash_command.txt` または[コマンドマニュアル](https://rentry.org/sillytavern-script-book)を参照.
 *
 * @param command 実行する Slash コマンド
 * @returns Slash パイプラインの結果, コマンドがエラーになった場合や `/abort` が実行された場合は `undefined` を返す
 *
 * @throws Slash コマンドがエラーになった場合、エラーをスローする
 *
 * @example
 * // 酒場のUIにプロンプトメッセージ `実行成功!` を表示する
 * triggerSlash('/echo severity=success 実行成功!');
 * // ただし、toastr で直接プロンプトを表示する方が推奨される
 * toastr.success('実行成功!');
 *
 * @example
 * // 現在のチャットメッセージの最後のメッセージに対応する id を取得する
 * const last_message_id = await triggerSlash('/pass {{lastMessageId}}');
 * // ただし、酒場アシスタントの関数を使う方が推奨される
 * const last_message = getLastMessageId();
 *
 * @example
 * // ユーザー入力をメッセージフロアの末尾に1件作成する
 * await createChatMessages([{ role: 'user', content: 'こんにちは' }]);
 * // AI の返信をトリガーする
 * await triggerSlash('/trigger');
 */
declare function triggerSlash(command: string): Promise<string>;
