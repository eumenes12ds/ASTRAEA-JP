/**
 * ワールドブック名の一覧を取得する
 *
 * @returns ワールドブック名の一覧
 */
declare function getWorldbookNames(): string[];

/**
 * 現在グローバルで有効になっているワールドブック名の一覧を取得する
 *
 * @returns グローバルのワールドブック名の一覧
 */
declare function getGlobalWorldbookNames(): string[];
/**
 * グローバルのワールドブックを再バインドする
 *
 * @param worldbook_names グローバルで有効にするワールドブック
 */
declare function rebindGlobalWorldbooks(worldbook_names: string[]): Promise<void>;

type CharWorldbooks = {
  primary: string | null;
  additional: string[];
};
/**
 * キャラクターカードにバインドされたワールドブックを取得する
 *
 * @param character_name 検索するキャラクターカード名, 'current' は現在開いているキャラクターカードを表す
 *
 * @returns キャラクターカードにバインドされたワールドブック
 */
declare function getCharWorldbookNames(character_name: TypeFest.LiteralUnion<'current' | string>): CharWorldbooks;
/**
 * キャラクターカードのワールドブックを再バインドする
 *
 * @param character_name キャラクターカード名, 'current' は現在開いているキャラクターカードを表す
 * @param char_worldbooks そのキャラクターカードにバインドするワールドブック
 */
declare function rebindCharWorldbooks(character_name: 'current', char_worldbooks: CharWorldbooks): Promise<void>;

/**
 * チャットファイルにバインドされたワールドブックを取得する
 *
 * @param chat_name チャットファイル名
 *
 * @returns チャットファイルにバインドされたワールドブック, ない場合は `null`
 */
declare function getChatWorldbookName(chat_name: 'current'): string | null;
/**
 * チャットファイルのワールドブックを再バインドする
 *
 * @param character_name チャットファイル名, 'current' は現在開いているチャットを表す
 * @param char_worldbooks そのチャットファイルにバインドするワールドブック
 */
declare function rebindChatWorldbook(chat_name: 'current', worldbook_name: string): Promise<void>;
/**
 * チャットファイルのワールドブックを取得または新規作成する
 *
 * @param chat_name チャットファイル名, 'current' は現在開いているチャットを表す
 * @param worldbook_name ワールドブック名; 指定しない場合は現在の時間に基づいて作成する
 */
declare function getOrCreateChatWorldbook(chat_name: 'current', worldbook_name?: string): Promise<string>;

type WorldbookEntry = {
  /** uid はワールドブック内部で相対的なものであり、ワールドブックをまたいで使用しないこと */
  uid: number;
  name: string;
  enabled: boolean;

  /** 発動ポリシー: エントリをいつ発動するか */
  strategy: {
    /**
     * 発動ポリシーのタイプ:
     * - `'constant'`: 定数🔵, 通称ブルーライト. "有効"、"発動確率%" など他の条件を満たすだけでよい.
     * - `'selective'`: 選択式🟢, 通称グリーンライト. ブルーライトの条件に加えて、`keys` のスキャン条件も満たす必要がある
     * - `'vectorized'`: ベクトル化🔗. 通常は使用しない
     */
    type: 'constant' | 'selective' | 'vectorized';
    /** 主要キーワード. グリーンライトのエントリは、スキャン対象テキスト内でいずれかのキーワードがスキャンされないと発動できない */
    keys: (string | RegExp)[];
    /**
     * 副次キーワード. 副次キーワードの `keys` 配列が空でない場合、エントリは主要キーワードでいずれかのキーワードにマッチするだけでなく、`logic` も満たす必要がある:
     * - `'and_any'`: 副次キーワードのいずれか1つがスキャン対象テキスト内でマッチする
     * - `'and_all'`: 副次キーワードのすべてがスキャン対象テキスト内でマッチする
     * - `'not_all'`: 副次キーワードの少なくとも1つがスキャン対象テキスト内でマッチしない
     * - `'not_any'`: 副次キーワードのすべてがスキャン対象テキスト内でマッチしない
     */
    keys_secondary: { logic: 'and_any' | 'and_all' | 'not_all' | 'not_any'; keys: (string | RegExp)[] };
    /** スキャン深度: 1 は最後のフロアのみをスキャンし、2 は最後の2フロアをスキャンする、という具合 */
    scan_depth: 'same_as_global' | number;
  };
  /** 挿入位置: エントリが発動した場合にどこに挿入するか */
  position: {
    /**
     * 位置のタイプ:
     * - `'before_character_definition'`: キャラクター定義の前
     * - `'after_character_definition'`: キャラクター定義の後
     * - `'before_example_messages'`: サンプルメッセージの前
     * - `'after_example_messages'`: サンプルメッセージの後
     * - `'before_author_note'`: 作者ノートの前
     * - `'after_author_note'`: 作者ノートの後
     * - `'at_depth'`: 指定した深度に挿入する
     */
    type:
      | 'before_character_definition'
      | 'after_character_definition'
      | 'before_example_messages'
      | 'after_example_messages'
      | 'before_author_note'
      | 'after_author_note'
      | 'at_depth'
      | 'outlet';
    /** そのエントリのメッセージのロール, 位置のタイプが `'at_depth'` の場合のみ有効 */
    role: 'system' | 'assistant' | 'user';
    /** そのエントリを挿入する深度, 位置のタイプが `'at_depth'` の場合のみ有効 */
    depth: number;
    // TODO: ワールドブックエントリの挿入: ドキュメントのリンク
    order: number;
  };

  content: string;

  probability: number;
  /** 再帰は、あるワールドブックエントリが発動した後に、そのエントリのプロンプトがさらに他のエントリを発動させることを表す */
  recursion: {
    /** 他のエントリが再帰的に本エントリを発動させることを禁止する */
    prevent_incoming: boolean;
    /** 本エントリが再帰的に他のエントリを発動させることを禁止する */
    prevent_outgoing: boolean;
    /** n 段階目の再帰チェックまで本エントリの発動を遅延させる */
    delay_until: null | number;
  };
  effect: {
    /** スティッキー: エントリが発動した後、以降 n 件のメッセージ内では発動ポリシーや発動確率%に関係なく常に発動する */
    sticky: null | number;
    /** クールダウン: エントリが発動した後、以降 n 件のメッセージ内では再発動できない */
    cooldown: null | number;
    /** 遅延: チャット内に少なくとも n 件のメッセージがある場合にのみ、エントリを発動できる */
    delay: null | number;
  };

  /** 追加フィールド, ワールドブックエントリに追加データをバインドするために使用 */
  extra?: Record<string, any>;
};

/**
 * `worldbook_name` ワールドブックの内容を取得する
 *
 * @param worldbook_name ワールドブック名
 *
 * @returns ワールドブックの内容
 *
 * @throws ワールドブックが存在しない場合、エラーをスローする
 */
declare function getWorldbook(worldbook_name: string): Promise<WorldbookEntry[]>;

/**
 * 新しいワールドブックを作成する
 *
 * @param worldbook_name ワールドブック名
 * @param worldbook ワールドブックの内容; 指定しない場合はエントリが一切ない
 *
 * @returns 作成が発生した場合は `true` を返し、置換が発生した場合は `false` を返す
 */
declare function createWorldbook(worldbook_name: string, worldbook?: WorldbookEntry[]): Promise<boolean>;

/**
 * `worldbook_name` という名前のワールドブックを作成または置換する, 内容は `worldbook`
 *
 * @param worldbook_name ワールドブック名
 * @param worldbook ワールドブックの内容; 指定しない場合はエントリが一切ない
 * @param options オプション
 *   - `render:'debounced'|'immediate'|'none'`: ワールドブックへの変更に対して、ワールドブックエディタはデバウンスレンダリング (debounced) を行うべきか、即時レンダリング (immediate) を行うべきか、それともフロントエンドの表示をリフレッシュしない (none) べきか? デフォルトはパフォーマンスの良いデバウンスレンダリング
 *
 * @returns 作成が発生した場合は `true` を返し、置換が発生した場合は `false` を返す
 */
declare function createOrReplaceWorldbook(
  worldbook_name: string,
  worldbook?: TypeFest.PartialDeep<WorldbookEntry>[],
  { render }?: ReplaceWorldbookOptions,
): Promise<boolean>;

/**
 * `worldbook_name` ワールドブックを削除する
 *
 * @param worldbook_name ワールドブック名
 *
 * @returns 削除に成功したかどうか, ワールドブックが存在しないなどの理由で失敗する可能性がある
 */
declare function deleteWorldbook(worldbook_name: string): Promise<boolean>;

// TODO: rename はワールドブックのバインドを処理する必要がある
// export function renameWorldbook(old_name: string, new_name: string): boolean;

interface ReplaceWorldbookOptions {
  /** ワールドブックへの変更に対して、ワールドブックエディタはデバウンスレンダリング (debounced) を行うべきか、それとも即時レンダリング (immediate) を行うべきか? デフォルトはパフォーマンスの良いデバウンスレンダリング */
  render?: 'debounced' | 'immediate';
}
/**
 * `worldbook_name` ワールドブックの内容を完全に `worldbook` で置き換える
 *
 * @param worldbook_name ワールドブック名
 * @param worldbook ワールドブックの内容
 * @param options オプション
 *   - `render:'debounced'|'immediate'`: ワールドブックへの変更に対して、ワールドブックエディタはデバウンスレンダリング (debounced) を行うべきか、それとも即時レンダリング (immediate) を行うべきか? デフォルトはパフォーマンスの良いデバウンスレンダリング
 *
 * @throws ワールドブックが存在しない場合、エラーをスローする
 *
 * @example
 * // すべてのエントリの再帰を禁止し、他の設定は変更しない
 * const worldbook = await getWorldbook("eramgt少女☆歌劇");
 * await replaceWorldbook(
 *   'eramgt少女☆歌劇',
 *   worldbook.map(entry => ({
 *     ...entry,
 *     recursion: { prevent_incoming: true, prevent_outgoing: true, delay_until: null },
 *   })),
 * );
 *
 * @example
 * // 名前に `'神楽光'` を含むすべてのエントリを削除する
 * const worldbook = await getWorldbook("eramgt少女☆歌劇");
 * _.remove(worldbook, entry => entry.name.includes('神楽光'));
 * await replaceWorldbook("eramgt少女☆歌劇", worldbook);
 */
declare function replaceWorldbook(
  worldbook_name: string,
  worldbook: TypeFest.PartialDeep<WorldbookEntry>[],
  { render }?: ReplaceWorldbookOptions,
): Promise<void>;

type WorldbookUpdater =
  | ((worldbook: WorldbookEntry[]) => TypeFest.PartialDeep<WorldbookEntry>[])
  | ((worldbook: WorldbookEntry[]) => Promise<TypeFest.PartialDeep<WorldbookEntry>[]>);
/**
 * `updater` 関数でワールドブック `worldbook_name` を更新する
 *
 * @param worldbook_name ワールドブック名
 * @param updater ワールドブックを更新する関数. ワールドブックのエントリを引数として受け取り、更新後のワールドブックのエントリを返す
 * @param options オプション
 *   - `render:'debounced'|'immediate'`: ワールドブックへの変更に対して、ワールドブックエディタはデバウンスレンダリング (debounced) を行うべきか、それとも即時レンダリング (immediate) を行うべきか? デフォルトはパフォーマンスの良いデバウンスレンダリング
 *
 * @returns 更新後のワールドブックのエントリ
 *
 * @throws ワールドブックが存在しない場合、エラーをスローする
 *
 * @example
 * // すべてのエントリの再帰を禁止し、他の設定は変更しない
 * await updateWorldbookWith('eramgt少女☆歌劇', worldbook => {
 *   return worldbook.map(entry => ({
 *     ...entry,
 *     recursion: { prevent_incoming: true, prevent_outgoing: true, delay_until: null },
 *   }));
 * });
 *
 * @example
 * // 名前に "神楽光" を含むすべてのエントリを削除する
 * await updateWorldbookWith('eramgt少女☆歌劇', worldbook => {
 *   _.remove(worldbook, entry => entry.name.includes('神楽光'));
 *   return worldbook;
 * });
 */
declare function updateWorldbookWith(
  worldbook_name: string,
  updater: WorldbookUpdater,
  { render }?: ReplaceWorldbookOptions,
): Promise<WorldbookEntry[]>;

/**
 * ワールドブックにエントリを追加する
 *
 * @param worldbook_name ワールドブック名
 * @param new_entries 追加するエントリ, 設定されていないフィールドには酒場が提供するデフォルト値が採用される
 * @param options オプション
 *   - `render:'debounced'|'immediate'`: ワールドブックへの変更に対して、ワールドブックエディタはデバウンスレンダリング (debounced) を行うべきか、それとも即時レンダリング (immediate) を行うべきか? デフォルトはパフォーマンスの良いデバウンスレンダリング
 *
 * @returns 更新後のワールドブックのエントリ、および追加したエントリのフィールド補完後の結果
 *
 * @throws ワールドブックが存在しない場合、エラーをスローする
 *
 * @example
 * // 2つのエントリを作成する, 1つはタイトルが `'神楽光'`, もう1つは空白
 * const { worldbook, new_entries } = await createWorldbookEntries('eramgt少女☆歌劇', [{ name: '神楽光' }, {}]);
 */
declare function createWorldbookEntries(
  worldbook_name: string,
  new_entries: TypeFest.PartialDeep<WorldbookEntry>[],
  { render }?: ReplaceWorldbookOptions,
): Promise<{ worldbook: WorldbookEntry[]; new_entries: WorldbookEntry[] }>;

/**
 * ワールドブック内のエントリを削除する
 *
 * @param worldbook_name ワールドブック名
 * @param predicate 判定関数, `true` を返した場合はそのエントリを削除する
 * @param options オプション
 *   - `render:'debounced'|'immediate'`: ワールドブックへの変更に対して、ワールドブックエディタはデバウンスレンダリング (debounced) を行うべきか、それとも即時レンダリング (immediate) を行うべきか? デフォルトはパフォーマンスの良いデバウンスレンダリング
 *
 * @returns 更新後のワールドブックのエントリ、および削除されたエントリ
 *
 * @throws ワールドブックが存在しない場合、エラーをスローする
 *
 * @example
 * // 名前に `'神楽光'` を含むすべてのエントリを削除する
 * const { worldbook, deleted_entries } = await deleteWorldbookEntries('eramgt少女☆歌劇', entry => entry.name.includes('神楽光'));
 */
declare function deleteWorldbookEntries(
  worldbook_name: string,
  predicate: (entry: WorldbookEntry) => boolean,
  { render }?: ReplaceWorldbookOptions,
): Promise<{ worldbook: WorldbookEntry[]; deleted_entries: WorldbookEntry[] }>;
