/**
 * ボタンに対応するイベントタイプを取得する, **スクリプト内でのみ使用できる**
 *
 * @param button_name ボタン名
 * @returns イベントタイプ
 *
 * @example
 * const event_type = getButtonEvent('ボタン名');
 * eventOn(event_type, () => {
 *   console.log('ボタンがクリックされました');
 * });
 */
declare function getButtonEvent(button_name: string): string;

/**
 * スクリプトのボタン一覧を取得する, **スクリプト内でのみ使用できる**
 *
 * @returns ボタンの配列
 *
 * @example
 * // スクリプト内で現在のスクリプトのボタン設定を取得する
 * const buttons = getScriptButtons();
 */
declare function getScriptButtons(): ScriptButton[];

/**
 * スクリプトのボタン一覧を完全に置き換える, **スクリプト内でのみ使用できる**
 *
 * @param buttons ボタンの配列
 *
 * @example
 * // スクリプト内でスクリプトボタンを"ゲーム開始"ボタンに設定する
 * replaceScriptButtons([{name: 'ゲーム開始', visible: true}])
 *
 * @example
 * // "場所へ"ボタンをクリックすると、場所の選択肢ボタンに切り替わる
 * eventOnButton("場所へ" () => {
 *   replaceScriptButtons([{name: '学校', visible: true}, {name: '商店', visible: true}])
 * })
 */
declare function replaceScriptButtons(buttons: ScriptButton[]): void;

/**
 * `updater` 関数でスクリプトのボタン一覧を更新する, **スクリプト内でのみ使用できる**
 *
 * @param updater スクリプトのボタン一覧を更新する関数. スクリプトのボタン一覧を引数として受け取り、更新後のスクリプトのボタン一覧を返す.
 *
 * @returns 更新後のスクリプトのボタン一覧
 *
 * @example
 * // 末尾にボタンを1つ追加する
 * updateVariablesWith(buttons => [...buttons, { name: '新しいボタン', visible: true }]);
 */
declare function updateScriptButtonsWith(updater: (buttons: ScriptButton[]) => ScriptButton[]): ScriptButton[];

/**
 * `updater` 関数でスクリプトのボタン一覧を更新する, **スクリプト内でのみ使用できる**
 *
 * @param updater スクリプトのボタン一覧を更新する関数. スクリプトのボタン一覧を引数として受け取り、更新後のスクリプトのボタン一覧を返す.
 *
 * @returns 更新後のスクリプトのボタン一覧
 */
declare function updateScriptButtonsWith(
  updater: (buttons: ScriptButton[]) => Promise<ScriptButton[]>,
): Promise<ScriptButton[]>;

/**
 * スクリプトのボタン一覧の末尾に存在しないボタンを追加する, 同名のボタンは重複して追加されない, **スクリプト内でのみ使用できる**
 *
 * @param buttons
 *
 * @exmaple
 * // "やり直す" ボタンを追加する
 * appendInexistentScriptButtons([{name: 'やり直す', visible: true}]);
 */
declare function appendInexistentScriptButtons(buttons: ScriptButton[]): void;

/** スクリプト名を取得する */
declare function getScriptName(): string;

/** スクリプトの作者コメントを取得する */
declare function getScriptInfo(): string;

/**
 * スクリプトの作者コメントを置き換える
 *
 * @param info 新しい作者コメント
 */
declare function replaceScriptInfo(info: string): void;
