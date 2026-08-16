/**
 * フロントエンドUI またはスクリプト内で使用して、フロントエンドUI またはスクリプトを再読み込みする
 *
 * これは `window.location.reload()` を呼ぶのと同じで、グローバルに共有されたインターフェースが無効になる;
 *   フロントエンドUI の再読み込み後も引き継ぎたいデータがある場合は、この関数を使わずに自分で再読み込み方法を実装するべきだ
 *
 * @example
 * // チャットファイルが変更されたときに、フロントエンドUI またはスクリプトを再読み込みする
 * let current_chat_id = SillyTavern.getCurrentChatId();
 * eventOn(tavern_events.CHAT_CHANGED, chat_id => {
 *   if (current_chat_id !== chat_id) {
 *     current_chat_id = chat_id;
 *     reloadIframe();
 *   }
 * })
 *
 * @example
 * // 自分で再読み込み方法を実装する
 * function initailzie() { ... }
 * $(initialize);
 *
 * function destroy() { eventClearAll(); ... }
 * $(window).on('pagehide', destroy);
 *
 * function reload() {
 *   destory();
 *   initialize();
 * }
 */
declare function reloadIframe(): void;

/**
 * フロントエンドUI またはスクリプトの識別名を取得する
 *
 * @returns フロントエンドUI の場合は `TH-message--フロア番号--フロントエンドUI がそのフロアで何番目のUIか`, スクリプトライブラリの場合は `TH-script--スクリプト名--スクリプトid`
 */
declare function getIframeName(): string;

/**
 * 本メッセージフロア iframe が属するフロアのフロア id を取得する, **メッセージフロアの iframe にのみ**使用できる
 *
 * @returns フロア id
 *
 * @throws メッセージフロアの iframe 内で使用しない場合、エラーをスローする
 */
declare function getCurrentMessageId(): number;

/**
 * スクリプトのスクリプトライブラリ id を取得する, **スクリプト内でのみ使用できる**
 *
 * @returns スクリプトライブラリの id
 *
 * @throws スクリプト内で使用しない場合、エラーをスローする
 */
declare function getScriptId(): string;
