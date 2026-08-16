type ChatMessage = {
  message_id: number;
  name: string;
  role: 'system' | 'assistant' | 'user';
  is_hidden: boolean;
  message: string;
  data: Record<string, any>;
  extra: Record<string, any>;
};

type ChatMessageSwiped = {
  message_id: number;
  name: string;
  role: 'system' | 'assistant' | 'user';
  is_hidden: boolean;
  swipe_id: number;
  swipes: string[];
  swipes_data: Record<string, any>[];
  swipes_info: Record<string, any>[];
};

type GetChatMessagesOption = {
  /** role でメッセージをフィルタリング; デフォルトは `'all'` */
  role?: 'all' | 'system' | 'assistant' | 'user';
  /** 非表示かどうかでメッセージをフィルタリング; デフォルトは `'all'` */
  hide_state?: 'all' | 'hidden' | 'unhidden';
  /** AI が使用していないメッセージページの情報を含めるかどうか, 例えば選択されなかった冒頭メッセージや、矢印クリックでリロールされたフロアなど. 含めない場合は戻り値のタイプが `ChatMessage`, 含める場合は `ChatMessageSwiped`; デフォルトは `false` */
  include_swipes?: boolean;
};

/**
 * チャットメッセージを取得する, 各フロアで AI が使用したメッセージページのみを取得
 *
 * @param range 取得するメッセージフロア番号またはフロアの範囲, 例えば `0`, `'0-{{lastMessageId}}'`, `-1` など. 負の数は末尾からの深さを表し, 例えば `-1` は最新のメッセージフロア, `-2` は最後から2番目のメッセージフロアを表す.
 * @param option オプション
 *   - `role:'all'|'system'|'assistant'|'user'`: role でメッセージをフィルタリング; デフォルトは `'all'`
 *   - `hide_state:'all'|'hidden'|'unhidden'`: 非表示かどうかでメッセージをフィルタリング; デフォルトは `'all'`
 *   - `include_swipes:false`: AI が使用していないメッセージページの情報を含めない
 *
 * @returns `ChatMessage` の配列, 指定されたフロア範囲内に実際に存在するすべてのフロアを含み, message_id の低い順にソートされる; 範囲内にフロアがまったく存在しない場合 (例えば現在 3 フロアしかないのに範囲が `4-5` の場合) は空の配列を返す
 *
 * @example
 * // 10 フロアで AI が使用したメッセージページのみを取得する
 * const chat_messages = getChatMessages(10);
 * const chat_messages = getChatMessages('10');
 * const chat_messages = getChatMessages('10', { include_swipes: false });
 *
 * @example
 * // 最新フロアで AI が使用したメッセージページを取得する
 * const chat_message = getChatMessages(-1)[0];  // または getChatMessages('{{lastMessageId}}')[0]
 *
 * @example
 * // すべてのフロアで AI が使用したメッセージページを取得する
 * const chat_messages = getChatMessages('0-{{lastMessageId}}');
 */
declare function getChatMessages(
  range: string | number,
  { role, hide_state, include_swipes }?: Omit<GetChatMessagesOption, 'include_swipes'> & { include_swipes?: false },
): ChatMessage[];

/**
 * チャットメッセージを取得する, 各フロアのすべてのメッセージページを取得し、AI が使用していないメッセージページのメッセージも含む
 *
 * @param range 取得するメッセージフロア番号またはフロアの範囲, 例えば `0`, `'0-{{lastMessageId}}'`, `-1` など. 負の数は末尾からの深さを表し, 例えば `-1` は最新のメッセージフロア, `-2` は最後から2番目のメッセージフロアを表す.
 * @param option オプション
 *   - `role:'all'|'system'|'assistant'|'user'`: role でメッセージをフィルタリング; デフォルトは `'all'`
 *   - `hide_state:'all'|'hidden'|'unhidden'`: 非表示かどうかでメッセージをフィルタリング; デフォルトは `'all'`
 *   - `include_swipes:true`: AI が使用していないメッセージページの情報を含める
 *
 * @returns `ChatMessage` の配列, 指定されたフロア範囲内に実際に存在するすべてのフロアを含み, message_id の低い順にソートされる; 範囲内にフロアがまったく存在しない場合 (例えば現在 3 フロアしかないのに範囲が `4-5` の場合) は空の配列を返す
 *
 * @example
 * // 10 フロアのすべてのメッセージページを取得する
 * const chat_messages = getChatMessages(10, { include_swipes: true });
 * const chat_messages = getChatMessages('10', { include_swipes: true });
 *
 * @example
 * // 最新フロアのすべてのメッセージページを取得する
 * const chat_message = getChatMessages(-1, { include_swipes: true })[0];  // または getChatMessages('{{lastMessageId}}', { include_swipes: true })[0]
 *
 * @example
 * // すべてのフロアのすべてのメッセージページを取得する
 * const chat_messages = getChatMessages('0-{{lastMessageId}}', { include_swipes: true });
 */
declare function getChatMessages(
  range: string | number,
  { role, hide_state, include_swipes }?: Omit<GetChatMessagesOption, 'include_swipes'> & { include_swipes?: true },
): ChatMessageSwiped[];

/**
 * チャットメッセージを取得する
 *
 * @param range 取得するメッセージフロア番号またはフロアの範囲, 例えば `0`, `'0-{{lastMessageId}}'`, `-1` など. 負の数は末尾からの深さを表し, 例えば `-1` は最新のメッセージフロア, `-2` は最後から2番目のメッセージフロアを表す.
 * @param option オプション
 *   - `role:'all'|'system'|'assistant'|'user'`: role でメッセージをフィルタリング; デフォルトは `'all'`
 *   - `hide_state:'all'|'hidden'|'unhidden'`: 非表示かどうかでメッセージをフィルタリング; デフォルトは `'all'`
 *   - `include_swipes:boolean`: AI が使用していないメッセージページの情報を含めるかどうか, 例えば選択されなかった冒頭メッセージや、矢印クリックでリロールされたフロアなど. 含めない場合は戻り値のタイプが `ChatMessage`, 含める場合は `ChatMessageSwiped`; デフォルトは `false`
 *
 * @returns 配列, 配列の要素は各フロアのメッセージで, message_id の低い順にソートされ, タイプは `ChatMessage` または `ChatMessageSwiped` (`include_swipes` の値による, デフォルトは `ChatMessage`).
 */
declare function getChatMessages(
  range: string | number,
  { role, hide_state, include_swipes }?: GetChatMessagesOption,
): (ChatMessage | ChatMessageSwiped)[];

type SetChatMessagesOption = {
  /**
   * フロアのページ上の表示を更新するか; デフォルトは `'affected'`
   * - `'none'`: ページの表示を更新しない
   * - `'affected'`: 影響を受けたフロアの表示のみを更新する, 表示を更新するときに `tavern_events.USER_MESSAGE_RENDERED` または `tavern_events.CHARACTER_MESSAGE_RENDERED` イベントが送信される
   * - `'all'`: チャットメッセージ全体を再読み込みする, `tavern_events.CHAT_CHANGED` イベントが発火する
   */
  refresh?: 'none' | 'affected' | 'all';
};

/**
 * チャットメッセージのデータを変更する
 *
 * @param chat_messages 変更するメッセージ, `message_id` フィールドを必ず含む必要がある
 * @param option オプション
 *   - `refresh:'none'|'affected'|'all'`: フロアのページ上の表示を更新するか; デフォルトは `'affected'`
 *
 * @example
 * // 10 フロアで AI が使用したメッセージページの本文を変更する
 * await setChatMessages([{message_id: 10, message: '新しいメッセージ'}]);
 *
 * @example
 * // 冒頭メッセージを設定する
 * await setChatMessages([{message_id: 0, swipes: ['冒頭1', '冒頭2']}])
 *
 * @example
 * // 冒頭メッセージ 3 に切り替える
 * await setChatMessages([{message_id: 0, swipe_id: 2}]);
 *
 * @example
 * // 4 フロアのフロントエンドUI を再レンダリングする (`{render: 'affected'}` を利用)
 * await setChatMessages([{message_id: 4}]);
 *
 * @example
 * // 最後から2番目のフロアのフロア変数を補完する
 * const chat_message = getChatMessages(-2)[0];
 * _.set(chat_message.data, '神楽光好感度', 5);
 * await setChatMessages([{message_id: 0, data: chat_message.data}], {refresh: 'none'});
 *
 * @example
 * // すべてのフロアを非表示にする
 * const last_message_id = getLastMessageId();
 * await setChatMessages(_.range(last_message_id + 1).map(message_id => ({message_id, is_hidden: true})));
 */
declare function setChatMessages(
  chat_messages: Array<{ message_id: number } & (Partial<ChatMessage> | Partial<ChatMessageSwiped>)>,
  { refresh }?: SetChatMessagesOption,
): Promise<void>;

type ChatMessageCreating = {
  name?: string;
  role: 'system' | 'assistant' | 'user';
  is_hidden?: boolean;
  message: string;
  data?: Record<string, any>;
  extra?: Record<string, any>;
};

type CreateChatMessagesOption = SetChatMessagesOption & {
  /** @deprecated `insert_before` を使用してください */
  insert_at?: number | 'end';

  /** 指定したフロアの前または末尾に挿入; デフォルトは末尾 */
  insert_before?: number | 'end';
};

/**
 * チャットメッセージを作成する
 *
 * @param chat_messages 作成するメッセージ, `role` と `message` フィールドを必ず含む必要がある
 * @param option オプション
 *   - `insert_before:number|'end'`: 指定したフロアの前または末尾に挿入; デフォルトは末尾
 *   - `refresh:'none'|'affected'|'all'`: フロアのページ上の表示を更新するか; デフォルトは `'affected'`
 *
 * @example
 * // 10 フロアの前にメッセージを1件挿入する
 * await createChatMessages([{role: 'user', message: 'こんにちは'}], {insert_at: 10});
 *
 * @example
 * // 末尾にメッセージを1件挿入する
 * await createChatMessages([{role: 'user', message: 'こんにちは'}]);
 */
declare function createChatMessages(
  chat_messages: ChatMessageCreating[],
  { insert_before, refresh }?: CreateChatMessagesOption,
): Promise<void>;

/**
 * チャットメッセージを削除する
 *
 * @param message_ids 削除するメッセージフロア番号の配列
 * @param option オプション
 *   - `refresh:'none'|'affected'|'all'`: フロアのページ上の表示を更新するか; デフォルトは `'affected'`
 *
 * @example
 * // 10 フロア、15 フロア、最後から2番目のフロア、最後のフロアを削除する
 * await deleteChatMessages([10, 15, -2, getLastMessageId()]);
 *
 * @example
 * // すべてのフロアを削除する
 * await deleteChatMessages(_.range(getLastMessageId() + 1));
 */
declare function deleteChatMessages(message_ids: number[], { refresh }?: SetChatMessagesOption): Promise<void>;

/**
 * 元の順序が `[begin, middle) [middle, end)` のフロアを `[middle, end) [begin, middle)` に回転させる
 *
 * @param begin 回転前の先頭フロアのフロア番号
 * @param middle 回転後に最前面に置かれるフロア番号
 * @param end 回転前の末尾フロアのフロア番号 + 1
 * @param option オプション
 *   - `refresh:'none'|'affected'|'all'`: フロアのページ上の表示を更新するか; デフォルトは `'affected'`
 *
 * @example
 * // 最後のフロアを 5 フロアの前に移動する
 * await rotateChatMessages(5, getLastMessageId(), getLastMessageId() + 1);
 *
 * // 最後の 3 フロアを 1 フロアの前に移動する
 * await rotateChatMessages(1, getLastMessageId() - 2, getLastMessageId() + 1);
 *
 * // 先頭の 3 フロアを最後に移動する
 * await rotateChatMessages(0, 3, getLastMessageId() + 1);
 */
declare function rotateChatMessages(
  begin: number,
  middle: number,
  end: number,
  { refresh }?: SetChatMessagesOption,
): Promise<void>;
