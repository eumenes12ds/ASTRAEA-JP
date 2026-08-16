type VariableOptionNormal = {
  /** チャット変数 (`'chat'`)、現在のプリセット (`'preset'`)、またはグローバル変数 (`'global'`) に対して操作する */
  type: 'chat' | 'preset' | 'global';
};
type VariableOptionCharacter = {
  /**
   * 現在のキャラクターカード (`'character'`) に対して操作する
   *
   * @throws キャラクターカードが開かれていない場合、エラーをスローする
   */
  type: 'character';
};
type VariableOptionMessage = {
  /** メッセージフロア変数 (`message`) に対して操作する */
  type: 'message';
  /**
   * 変数を取得するメッセージフロア番号を指定する, 負の数の場合は末尾からのインデックス, 例えば `-1` は最新のメッセージフロアを取得することを表す; デフォルトは `'latest'`
   *
   * @throws 指定されたメッセージフロア番号 `message_id` が範囲 `[-chat.length, chat.length)` を超えている場合、エラーをスローする
   */
  message_id?: number | 'latest';
};
type VariableOptionScript = {
  /** スクリプト変数 (`'script'`) に対して操作する */
  type: 'script';
  /** 操作する変数のスクリプト ID を指定する; スクリプト内で呼び出す場合は指定する必要はない, もちろん `getScriptId()` でそのスクリプト ID を取得することもできる */
  script_id?: string;
};
type VariableOptionExtension = {
  /** 拡張機能変数 (`'extension'`) に対して操作する */
  type: 'extension';
  /** 操作する変数の拡張機能 ID を指定する */
  extension_id: string;
};
type VariableOption = VariableOptionNormal | VariableOptionCharacter | VariableOptionMessage | VariableOptionScript | VariableOptionExtension;

/**
 * 変数テーブルを取得する
 *
 * @param option 操作する変数のタイプ
 *
 * @returns 変数テーブル
 *
 * @example
 * // すべてのチャット変数を取得してポップアップで結果を出力する
 * const variables = getVariables({type: 'chat'});
 * alert(variables);
 *
 * @example
 * // すべてのグローバル変数を取得する
 * const variables = getVariables({type: 'global'});
 * // 酒場アシスタントには lodash ライブラリが組み込まれており、特定の変数が存在するかどうかの確認など、さまざまなことに使える
 * if (_.has(variables, "神楽光.好感度")) {
 *   ...
 * }
 *
 * @example
 * // 最後から2番目のフロアのチャット変数を取得する
 * const variables = getVariables({type: 'message', message_id: -2});
 *
 * @example
 * // スクリプト内でそのスクリプトにバインドされた変数を取得する
 * const variables = getVariables({type: 'script'});
 */
declare function getVariables(option: VariableOption): Record<string, any>;

/**
 * 変数テーブルを完全に `variables` で置き換える
 *
 * これほど直接的な関数を提供しているのは、酒場アシスタントに lodash ライブラリが組み込まれているからだ:
 *   `insertOrAssignVariables` などの関数は、実際にはまず `getVariables` で変数テーブルを取得し、lodash ライブラリで処理してから、`replaceVariables` で変数テーブルを置き換えているだけだ.
 *
 * @param variables 置換に使用する変数テーブル
 * @param option 操作する変数のタイプ
 *
 * @example
 * // 実行前のチャット変数: `{愛城華恋: {好感度: 5}}`
 * replaceVariables({神楽光: {好感度: 5, 認知度: 0}});
 * // 実行後のチャット変数: `{神楽光: {好感度: 5, 認知度: 0}}`
 *
 * @example
 * // `{神楽光: {好感度: 5}}` 変数を削除する
 * let variables = getVariables();
 * _.unset(variables, "神楽光.好感度");
 * replaceVariables(variables);
 *
 * @example
 * // スクリプト内でそのスクリプトにバインドされた変数を置き換える
 * replaceVariables({神楽光: {好感度: 5, 認知度: 0}}, {type: 'script'});
 */
declare function replaceVariables(variables: Record<string, any>, option: VariableOption): void;

/**
 * `updater` 関数で変数テーブルを更新する
 *
 * @param updater 変数テーブルを更新する関数. 変数テーブルを引数として受け取り、更新後の変数テーブルを返す.
 * @param option 操作する変数のタイプ
 *
 * @returns 更新後の変数テーブル
 *
 * @example
 * // `{神楽光: {好感度: 5}}` 変数を削除する
 * updateVariablesWith(variables => {
 *   _.unset(variables, "神楽光.好感度");
 *   return variables;
 * });
 *
 * @example
 * // "愛城華恋.好感度" を元の 2 倍に更新する, その変数が存在しない場合は 0 に設定する
 * updateVariablesWith(variables => _.update(variables, "愛城華恋.好感度", value => value ? value * 2 : 0), {type: 'chat'});
 */
declare function updateVariablesWith(
  updater: (variables: Record<string, any>) => Record<string, any>,
  option: VariableOption,
): Record<string, any>;

/**
 * `updater` 関数で変数テーブルを更新する
 *
 * @param updater 変数テーブルを更新する関数. 変数テーブルを引数として受け取り、更新後の変数テーブルを返す.
 * @param option 操作する変数のタイプ
 *
 * @returns 更新後の変数テーブル
 *
 * @example
 * await updateVariablesWith(async variables => {await update(variables); return variables;}, {type: 'chat'});
 */
declare function updateVariablesWith(
  updater: (variables: Record<string, any>) => Promise<Record<string, any>>,
  option: VariableOption,
): Promise<Record<string, any>>;

/**
 * 変数の値を挿入または変更する, 変数が存在するかどうかによる.
 *
 * @param variables 更新する変数
 *   - 変数が存在しない場合は、その変数を新規追加する
 *   - 変数が既に存在する場合は、その変数の値を変更する
 * @param option 操作する変数のタイプ
 *
 * @returns 更新後の変数テーブル
 *
 * @example
 * // 実行前の変数: `{愛城華恋: {好感度: 5}}`
 * await insertOrAssignVariables({愛城華恋: {好感度: 10}, 神楽光: {好感度: 5, 認知度: 0}}, {type: 'chat'});
 * // 実行後の変数: `{愛城華恋: {好感度: 10}, 神楽光: {好感度: 5, 認知度: 0}}`
 */
declare function insertOrAssignVariables(variables: Record<string, any>, option: VariableOption): Record<string, any>;

/**
 * 新しい変数を挿入する, 変数が既に存在する場合は何もしない
 *
 * @param variables 挿入する変数
 *   - 変数が存在しない場合は、その変数を新規追加する
 *   - 変数が既に存在する場合は、何もしない
 * @param option 操作する変数のタイプ
 *
 * @returns 更新後の変数テーブル
 *
 * @example
 * // 実行前の変数: `{愛城華恋: {好感度: 5}}`
 * await insertVariables({愛城華恋: {好感度: 10}, 神楽光: {好感度: 5, 認知度: 0}}, {type: 'chat'});
 * // 実行後の変数: `{愛城華恋: {好感度: 5}, 神楽光: {好感度: 5, 認知度: 0}}`
 */
declare function insertVariables(variables: Record<string, any>, option: VariableOption): Record<string, any>;

/**
 * 変数を削除する, 変数が存在しない場合は何もしない
 *
 * @param variable_path 削除する変数のパス
 *   - 変数が存在しない場合は、何もしない
 *   - 変数が既に存在する場合は、その変数を削除する
 * @param option 操作する変数のタイプ
 *
 * @returns 更新後の変数テーブル、および変数の削除に成功したかどうか
 *
 * @example
 * // 実行前の変数: `{愛城華恋: {好感度: 5}}`
 * await deleteVariable("愛城華恋.好感度", {type: 'chat'});
 * // 実行後の変数: `{愛城華恋: {}}`
 */
declare function deleteVariable(
  variable_path: string,
  option: VariableOption,
): { variables: Record<string, any>; delete_occurred: boolean };

/**
 * 変数マネージャーに変数構造を登録する. 登録後、変数マネージャーは変数構造に従って変数を検証する
 *
 * **これは変数マネージャーという UI で変数を表示・管理しやすくするだけであり、コードレベルには一切影響しない**
 *
 * @param schema zod ライブラリで表される変数構造
 * @param option 変数構造を登録する変数のタイプ
 *
 * @example
 * // メッセージフロア変数の構造として、stat_data 内に好感度の数値変数がある構造を登録する
 * registerVariableSchema(z.object({
 *   stat_data: z.object({
 *     好感度: z.number(),
 *   }),
 * }), {type: 'message'});
 */
declare function registerVariableSchema(
  schema: z.ZodType<any>,
  option: { type: 'global' | 'preset' | 'character' | 'chat' | 'message' },
): void;
