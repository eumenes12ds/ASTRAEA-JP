/**
 * キャラクターカード管理クラス
 * キャラクターカードのデータ操作をカプセル化し、便利なアクセス方法を提供する
 */
declare class RawCharacter {
  constructor(characterData: SillyTavern.v1CharData);

  /**
   * 名前またはアバター id でキャラクターカードのデータを検索する
   * @param options 検索オプション
   * @returns 見つかったキャラクターカードのデータ, 見つからない場合は null
   */
  static find({
    name,
    allowAvatar,
  }?: {
    name: TypeFest.LiteralUnion<'current', string>;
    allowAvatar?: boolean;
  }): SillyTavern.v1CharData;

  /**
   * 名前でキャラクターカードのデータの characters 配列内のインデックスを検索する（this_chid に類似）
   * @param name キャラクター名
   * @returns characters 配列内のキャラクターカードのデータのインデックス, 見つからない場合は -1 を返す
   */
  static findCharacterIndex(name: string): any;

  /**
   * サーバーから各チャットファイルのチャット内容を取得し、辞書にコンパイルする。
   * この関数は指定されたチャットメタデータのリストを走査し、各チャットの実際のチャット内容をリクエストする。
   *
   * @param {Array} data - 各チャットのメタデータ（ファイル名など）を含む配列。
   * @param {boolean} isGroupChat - チャットがグループチャットかどうかを示すフラグ。
   * @returns {Promise<Object>} chat_dict - 各キーがファイル名で、値が
   * サーバーから取得した対応するチャット内容である辞書。
   */
  static getChatsFromFiles(data: any[], isGroupChat: boolean): Promise<Record<string, any>>;

  /**
   * キャラクター管理内のデータを取得する
   * @returns キャラクター管理内の完全なデータオブジェクト
   */
  getCardData(): SillyTavern.v1CharData;

  /**
   * キャラクターのアバター ID を取得する
   * @returns アバター ID/ファイル名
   */
  getAvatarId(): string;

  /**
   * 正規表現スクリプトを取得する
   * @returns 正規表現スクリプトの配列
   */
  getRegexScripts(): Array<{
    id: string;
    scriptName: string;
    findRegex: string;
    replaceString: string;
    trimStrings: string[];
    placement: number[];
    disabled: boolean;
    markdownOnly: boolean;
    promptOnly: boolean;
    runOnEdit: boolean;
    substituteRegex: number | boolean;
    minDepth: number;
    maxDepth: number;
  }>;

  /**
   * キャラクターブックを取得する
   * @returns キャラクターブックのデータオブジェクトまたは null
   */
  getCharacterBook(): {
    name: string;
    entries: Array<{
      keys: string[];
      secondary_keys?: string[];
      comment: string;
      content: string;
      constant: boolean;
      selective: boolean;
      insertion_order: number;
      enabled: boolean;
      position: string;
      extensions: any;
      id: number;
    }>;
  } | null;

  /**
   * キャラクターのワールド名を取得する
   * @returns ワールド名
   */
  getWorldName(): string;
}

/**
 * キャラクターカードのデータを取得する
 * @param name キャラクター名またはアバター ID
 * @param allowAvatar アバター ID による検索を許可するかどうか
 * @returns キャラクターカードのデータ
 */
declare function getCharData(name: TypeFest.LiteralUnion<'current', string>): SillyTavern.v1CharData | null;

/**
 * キャラクターのアバターパスを取得する
 * @param name キャラクター名またはアバター ID
 * @param allowAvatar アバター ID による検索を許可するかどうか
 * @returns キャラクターのアバターパス
 */
declare function getCharAvatarPath(name: TypeFest.LiteralUnion<'current', string>): string | null;

/**
 * キャラクターのチャット履歴の要約を取得する
 * @param name キャラクター名またはアバター ID
 * @param allowAvatar アバター ID による検索を許可するかどうか
 * @returns チャット履歴の要約の配列
 */
declare function getChatHistoryBrief(
  name: TypeFest.LiteralUnion<'current', string>,
  allowAvatar?: boolean,
): Promise<any[] | null>;

/**
 * チャット履歴の詳細を取得する
 * @param data チャットデータの配列
 * @param isGroupChat グループチャットかどうか
 * @returns チャット履歴の詳細
 */
declare function getChatHistoryDetail(data: any[], isGroupChat?: boolean): Promise<Record<string, any> | null>;
