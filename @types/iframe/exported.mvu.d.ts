declare namespace Mvu {
  type MvuData = {
    /** mvu が initvar エントリを初期化済みのワールドブックの一覧 */
    initialized_lorebooks: Record<string, any[]>;

    /** 実際の変数データ */
    stat_data: Record<string, any>;

    [key: string]: any;
  };

  type CommandInfo = SetCommandInfo | InsertCommandInfo | DeleteCommandInfo | AddCommandInfo | MoveCommandInfo;
  type SetCommandInfo = {
    type: 'set';
    full_match: string;
    args:
      | [path: string, new_value_literal: string]
      | [path: string, expected_old_value_literal: string, new_value_literal: string];
    reason: string;
  };
  type InsertCommandInfo = {
    type: 'insert';
    full_match: string;
    args:
      | [path: string, value_literal: string] // 末尾に値を追加する
      | [path: string, index_or_key_literal: string, value_literal: string]; // 指定したインデックス/キーに値を挿入する
    reason: string;
  };
  type DeleteCommandInfo = {
    type: 'delete';
    full_match: string;
    args: [path: string] | [path: string, index_or_key_or_value_literal: string];
    reason: string;
  };
  type AddCommandInfo = {
    type: 'add';
    full_match: string;
    args: [path: string, delta_or_toggle_literal: string];
    reason: string;
  };
  type MoveCommandInfo = {
    type: 'move';
    full_match: string;
    args: [from: string, to: string];
    reason: string;
  };
}

/**
 * mvu 変数フレームワークスクリプトが提供する追加機能, mvu 変数フレームワークスクリプトを追加でインストールする必要がある, 詳細は https://github.com/MagicalAstrogy/MagVarUpdate/blob/master/src/export_globals.ts を参照
 * **使用する前に、まず `await waitGlobalInitialized('Mvu')` で Mvu の初期化完了を待つべきだ**
 * 酒場のページで f12 を押し、コンソールに `window.Mvu` と入力すると、現在の Mvu 変数フレームワークが提供するインターフェースを確認できる
 */
declare const Mvu: {
  events: {
    /** 新しいチャットを開いて変数を初期化するときに発火するイベント  */
    VARIABLE_INITIALIZED: 'mag_variable_initiailized';

    /** 変数更新の1ラウンドが開始されるときに発火するイベント */
    VARIABLE_UPDATE_STARTED: 'mag_variable_update_started';

    /**
     * 変数更新の1ラウンド中に、テキストからすべての更新コマンドの解析に成功したときに発火するイベント
     *
     * @example
     * // Gemini が CJK 文字の間に挿入する '-' を修正する, 例えば 'キャラクター.絡-絡' を 'キャラクター.絡絡' に修正する
     * eventOn(Mvu.events.COMMAND_PARSED, commands => {
     *   commands.forEach(command => {
     *     command.args[0] = command.args[0].replace(/-/g, '');
     *   });
     * });
     *
     * @example
     * // 繁体字を修正する, 例えば '絡絡' を '络络' に修正する
     * eventOn(Mvu.events.COMMAND_PARSED, commands => {
     *   commands.forEach(command => {
     *     command.args[0] = command.args[0].replaceAll('絡絡', '络络');
     *   });
     * });
     *
     * @example
     * // 新しい更新コマンドを追加する
     * eventOn(Mvu.events.COMMAND_PARSED, commands => {
     *   commands.push({
     *     type: 'set',
     *     full_match: `_.set('絡絡.好感度', 5)`,
     *     args: ['絡絡.好感度', 5],
     *     reason: 'スクリプトによる強制更新',
     *   });
     * });
     */
    COMMAND_PARSED: 'mag_command_parsed';

    /**
     * 変数更新の1ラウンドが終了するときに発火するイベント
     *
     * @example
     * // 好感度が 0 を下回らないようにする
     * eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, variables => {
     *   if (_.get(variables, 'stat_data.キャラクター.絡絡.好感度') < 0) {
     *     _.set(variables, 'stat_data.キャラクター.絡絡.好感度', 0);
     *   }
     * })
     *
     * @example
     * // 好感度の増加幅が 3 を超えないようにする
     * eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (variables, variables_before_update) => {
     *   const old_value = _.get(variables_before_update, 'stat_data.キャラクター.絡絡.好感度');
     *   const new_value = _.get(variables, 'stat_data.キャラクター.絡絡.好感度');
     *
     *   // 新しい好感度は 旧好感度-3 と 旧好感度+3 の間でなければならない
     *   _.set(variables, 'stat_data.キャラクター.絡絡.好感度', _.clamp(new_value, old_value - 3, old_value + 3));
     * });
     */
    VARIABLE_UPDATE_ENDED: 'mag_variable_update_ended';

    /** 更新後の変数でフロアを更新する直前に発火するイベント  */
    BEFORE_MESSAGE_UPDATE: 'mag_before_message_update';
  };

  /**
   * 変数テーブルを取得し、それを mvu データを含む MvuData として扱う
   *
   * @param オプション
   *   - `type?:'message'|'chat'|'character'|'global'`: 特定のフロアのチャット変数 (`message`)、チャット変数テーブル (`'chat'`)、キャラクターカード変数 (`'character'`)、またはグローバル変数テーブル (`'global'`) に対して操作する, デフォルトは `'chat'`
   *   - `message_id?:number|'latest'`: `type` が `'message'` の場合、この引数は取得するメッセージフロア番号を指定する, 負の数の場合は末尾からのインデックス, 例えば `-1` は最新のメッセージフロアを取得することを表す; デフォルトは `'latest'`
   *   - `script_id?:string`: `type` が `'script'` の場合、この引数は取得するスクリプト ID を指定する; スクリプト内で呼び出す場合は、`getScriptId()` でそのスクリプト ID を取得できる
   *
   * @returns MvuData データテーブル
   *
   * @example
   * // 最新のメッセージフロアの mvu データを取得する
   * const message_data = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
   *
   * // メッセージフロアの iframe 内で、その iframe が属するフロアの mvu データを取得する
   * const message_data = Mvu.getMvuData({ type: 'message', message_id: getCurrentMessageId() });
   */
  getMvuData: (options: VariableOption) => Mvu.MvuData;

  /**
   * 変数テーブルを mvu データを含む `mvu_data` で完全に置き換える (ただし、`parseMessages` で自分で変数を処理していない場合は、mvu イベントをリッスンして mvu データを変更する方が推奨される!)
   *
   * @param variables 置換に使用する変数テーブル
   * @param option オプション
   *   - `type?:'message'|'chat'|'character'|'global'`: 特定のフロアのチャット変数 (`message`)、チャット変数テーブル (`'chat'`)、キャラクターカード変数 (`'character'`)、またはグローバル変数テーブル (`'global'`) に対して操作する, デフォルトは `'chat'`
   *   - `message_id?:number|'latest'`: `type` が `'message'` の場合、この引数は取得するメッセージフロア番号を指定する, 負の数の場合は末尾からのインデックス, 例えば `-1` は最新のメッセージフロアを取得することを表す; デフォルトは `'latest'`
   *   - `script_id?:string`: `type` が `'script'` の場合、この引数は取得するスクリプト ID を指定する; スクリプト内で呼び出す場合は、`getScriptId()` でそのスクリプト ID を取得できる
   *
   * @example
   * // 絡絡の好感度を 30 に変更する
   * const mvu_data = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
   * _.set(mvu_data, 'stat_data.キャラクター.絡絡.好感度', 30);
   * await Mvu.replaceMvuData(mvu_data, { type: 'message', message_id: 'latest' });
   */
  replaceMvuData: (mvu_data: Mvu.MvuData, options: VariableOption) => Promise<void>;

  /**
   * 変数更新コマンド (`_.set`) を含むメッセージ `message` を解析し、それに基づいて `old_data` 内の mvu 変数データを更新する
   *
   * @param message _.set() コマンドを含むメッセージ文字列
   * @param old_data 現在の MvuData データ
   *
   * @returns 変数が更新された場合は新しい MvuData を返し、それ以外の場合は `undefined` を返す
   *
   * @example
   * // 絡絡の好感度を 30 に変更する
   * const old_data = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
   * const new_data = await Mvu.parseMessage("_.set('キャラクター.絡絡.好感度', 30); // 強制変更", old_data);
   * await Mvu.replaceMvuData(new_data, { type: 'message', message_id: 'latest' });
   */
  parseMessage: (message: string, old_data: Mvu.MvuData) => Promise<Mvu.MvuData>;

  /**
   * 酒場が追加のモデル解析を行っているかどうか
   */
  isDuringExtraAnalysis: () => boolean;
};

interface ListenerType {
  [Mvu.events.VARIABLE_INITIALIZED]: (variables: Mvu.MvuData, swipe_id: number) => void;

  [Mvu.events.VARIABLE_UPDATE_STARTED]: (variables: Mvu.MvuData) => void;

  [Mvu.events.COMMAND_PARSED]: (variables: Mvu.MvuData, commands: Mvu.CommandInfo[], message_content: string) => void;

  [Mvu.events.VARIABLE_UPDATE_ENDED]: (variables: Mvu.MvuData, variables_before_update: Mvu.MvuData) => void;

  [Mvu.events.BEFORE_MESSAGE_UPDATE]: (context: { variables: Mvu.MvuData; message_content: string }) => void;
}
