type FormatAsTavernRegexedStringOption = {
  /** テキストが存在する深度; 指定しない場合は酒場の正規表現の`深度`オプションを考慮しない: その深度が酒場の正規表現の`最小深度`と`最大深度`の範囲内かどうかに関係なく有効になる */
  depth?: number;
  /** キャラクターカード名; 指定しない場合は現在のキャラクターカード名を使用 */
  character_name?: string;
};

/**
 * `text` に酒場の正規表現を適用する
 *
 * @param text 酒場の正規表現を適用するテキスト
 * @param source テキストの出典, 例えばユーザー入力や AI 出力からのもの. 酒場の正規表現の`作用範囲`オプションに対応する.
 * @param destination テキストが何として使用されるか, 例えば表示用かプロンプトとしてか. 酒場の正規表現の`形式のみ表示`と`形式のみプロンプト`オプションに対応する.
 * @param option オプション
 *   - `depth?:number`: テキストが存在する深度; 指定しない場合は酒場の正規表現の`深度`オプションを考慮しない: その深度が酒場の正規表現の`最小深度`と`最大深度`の範囲内かどうかに関係なく有効になる
 *   - `character_name?:string`: キャラクターカード名; 指定しない場合は現在のキャラクターカード名を使用
 *
 * @example
 * // 最後のフロアのテキストを取得し、それを表示として使われる AI 出力とみなして、酒場の正規表現を適用する
 * const message = getChatMessages(-1)[0];
 * const result = formatAsTavernRegexedString(message.message, 'ai_output', 'display', { depth: 0 });
 */
declare function formatAsTavernRegexedString(
  text: string,
  source: 'user_input' | 'ai_output' | 'slash_command' | 'world_info' | 'reasoning',
  destination: 'display' | 'prompt',
  { depth, character_name }?: FormatAsTavernRegexedStringOption,
): string;

type TavernRegex = {
  id: string;
  script_name: string;
  enabled: boolean;
  /** @deprecated 新しい API を使用する場合はこのフィールドを返さない, 古い scope パラメータを使用する場合のみ返す */
  scope?: 'global' | 'character';

  find_regex: string;
  replace_string: string;
  trim_strings: string[];

  source: {
    user_input: boolean;
    ai_output: boolean;
    slash_command: boolean;
    world_info: boolean;
    reasoning: boolean;
  };

  destination: {
    display: boolean;
    prompt: boolean;
  };
  run_on_edit: boolean;

  min_depth: number | null;
  max_depth: number | null;
};

/**
 * ローカル正規表現が有効かどうかを判定する
 */
declare function isCharacterTavernRegexesEnabled(): boolean;

type TavernRegexOptionGlobal = {
  /** グローバル正規表現 (`'global'`) に対して操作する */
  type: 'global';
};
type TavernRegexOptionCharacter = {
  /** キャラクターカードのローカル正規表現 (`'character'`) に対して操作する */
  type: 'character';
  name?: string | 'current';
};
type TavernRegexOptionPreset = {
  /** プリセット正規表現 (`'preset'`) に対して操作する */
  type: 'preset';
  name?: string | 'in_use';
};
type TavernRegexOption = TavernRegexOptionGlobal | TavernRegexOptionCharacter | TavernRegexOptionPreset;

/**
 * 酒場の正規表現を取得する
 *
 * @param option 操作する酒場の正規表現のタイプ
 *
 * @returns 配列, 配列の要素は酒場の正規表現 `TavernRegex`. この配列は正規表現がテキストに作用する順序でソートされる, つまり酒場で正規表現が表示される場所が上から下に並ぶ.
 */
declare function getTavernRegexes(option: TavernRegexOption): TavernRegex[];

type ReplaceTavernRegexesOption = {
  scope?: 'all' | 'global' | 'character';
};

/**
 * 酒場の正規表現を完全に `regexes` で置き換える.
 * - **これは非常に遅い操作です!** 正規表現に対するすべての処理を済ませてから、一括で replaceTavernRegexes を呼ぶようにしてください.
 * - **正規表現を再適用するため、チャットメッセージ全体を再読み込みします**, `tavern_events.CHAT_CHANGED` が発火し、フロアメッセージが再読み込みされます.
 *
 * これほど直接的な関数を提供しているのは、正規表現の順序を入れ替えるなどの必要があるかもしれないからだ.
 *
 * @param regexes 置換に使用する酒場の正規表現
 * @param option 操作する酒場の正規表現のタイプ
 */
declare function replaceTavernRegexes(regexes: TavernRegex[], option: TavernRegexOption): Promise<void>;

type TavernRegexUpdater =
  | ((regexes: TavernRegex[]) => TavernRegex[])
  | ((regexes: TavernRegex[]) => Promise<TavernRegex[]>);

/**
 * `updater` 関数で酒場の正規表現を更新する
 *
 * @param updater 酒場の正規表現を更新する関数. 酒場の正規表現を引数として受け取り、更新後の酒場の正規表現を返す.
 * @param option 操作する酒場の正規表現のタイプ
 *
 * @returns 更新後の酒場の正規表現
 *
 * @example
 * // 名前に "舞台少女" を含むすべてのグローバル正規表現を有効にする
 * await updateTavernRegexesWith(
 *   regexes => {
 *     regexes.forEach(regex => {
 *       if (regex.script_name.includes('舞台少女')) {
 *         regex.enabled = true;
 *       }
 *     });
 *     return regexes;
 *   },
 *   { type: 'global' },
 * );
 */
declare function updateTavernRegexesWith(
  updater: TavernRegexUpdater,
  option: TavernRegexOption,
): Promise<TavernRegex[]>;
