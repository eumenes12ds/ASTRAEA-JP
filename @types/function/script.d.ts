/**
 * 有効状態にある酒場アシスタントのスクリプトボタンをすべて取得する, 主に QR アシスタントなどの互換スクリプトボタンを便利にするため
 */
declare function getAllEnabledScriptButtons(): { [script_id: string]: { button_id: string; button_name: string }[] };

type ScriptButton = {
  name: string;
  visible: boolean;
};

type Script = {
  type: 'script';
  enabled: boolean;
  name: string;
  id: string;
  content: string;
  info: string;
  button: {
    enabled: boolean;
    buttons: Array<ScriptButton>;
  };
  data: Record<string, any>;
  export_with: {
    data: boolean;
    button: boolean;
  };
};
type ScriptFolder = {
  type: 'folder';
  enabled: boolean;
  name: string;
  id: string;
  icon: string;
  color: string;
  scripts: Script[];
};
type ScriptTree = Script | ScriptFolder;

type ScriptTreesOptions = {
  /** グローバルスクリプト (`'chat'`)、現在のプリセットスクリプト (`'preset'`)、または現在のキャラクターカードスクリプト (`'global'`) に対して操作する */
  type: 'global' | 'preset' | 'character';
};

/**
 * 酒場アシスタントのスクリプト一覧を取得する
 *
 * @param option 操作する酒場アシスタントのスクリプトタイプ
 *
 * @returns 酒場アシスタントのスクリプト一覧
 */
declare function getScriptTrees(option: ScriptTreesOptions): ScriptTree[];

/**
 * 酒場アシスタントの一覧を完全に `script_trees` で置き換える
 *
 * @param script_trees 置換に使用する酒場アシスタントの一覧
 * @param option 操作する酒場アシスタントのスクリプトタイプ
 */
declare function replaceScriptTrees(script_trees: TypeFest.PartialDeep<ScriptTree>[], option: ScriptTreesOptions): void;

/**
 * `updater` 関数で酒場アシスタントの一覧を更新する
 *
 * @param updater 酒場アシスタントの一覧を更新する関数. 酒場アシスタントの一覧を引数として受け取り、更新後の酒場アシスタントの一覧を返す.
 * @param option 操作する酒場アシスタントのスクリプトタイプ
 *
 * @returns 更新後の酒場アシスタントの一覧
 */
declare function updateScriptTreesWith(
  updater: (script_trees: ScriptTree[]) => TypeFest.PartialDeep<ScriptTree>[],
  option: ScriptTreesOptions,
): ScriptTree[];

/**
 * `updater` 関数で酒場アシスタントの一覧を更新する
 *
 * @param updater 酒場アシスタントの一覧を更新する関数. 酒場アシスタントの一覧を引数として受け取り、更新後の酒場アシスタントの一覧を返す.
 * @param option 操作する酒場アシスタントのスクリプトタイプ
 *
 * @returns 更新後の酒場アシスタントの一覧
 */
declare function updateScriptTreesWith(
  updater: (script_trees: ScriptTree[]) => Promise<TypeFest.PartialDeep<ScriptTree>[]>,
  option: ScriptTreesOptions,
): Promise<ScriptTree[]>;
