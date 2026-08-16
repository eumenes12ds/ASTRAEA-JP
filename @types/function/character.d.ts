type Character = {
  avatar: `${string}.png` | Blob;
  version: string;
  creator: string;
  creator_notes: string;

  worldbook: string | null;
  description: string;
  first_messages: string[];

  extensions: {
    regex_scripts: TavernRegex[];
    tavern_helper: {
      scripts: ScriptTree[];
      variables: Record<string, any>;
    };
    [other: string]: any;
  };
};

/**
 * キャラクターカード名の一覧を取得する
 *
 * @returns キャラクターカード名の一覧
 */
declare function getCharacterNames(): string[];

/**
 * キャラクターカードのアバター id の一覧を取得する
 *
 * @returns キャラクターカードのアバター id の一覧
 */
declare function getCharacterIds(): string[];

/**
 * 現在のキャラクターカード名を取得する
 *
 * @returns 現在のキャラクターカード名, 現在キャラクターカードがない場合は `null` を返す
 */
declare function getCurrentCharacterName(): string | null;

/**
 * 現在のキャラクターカードのアバター id を取得する
 *
 * @returns 現在のキャラクターカードのアバター id, 現在キャラクターカードがない場合は `null` を返す
 */
declare function getCurrentCharacterId(): string | null;

/**
 * `character_name` キャラクターカードを新規作成する, 内容は `character`
 *
 * @param character_name キャラクターカード名
 * @param character キャラクターカードのデータ; 指定しない場合はデフォルトデータを使用
 *
 * @returns 作成に成功したかどうか, 同名のキャラクターカードが既に存在する場合や `'current'` という名前のキャラクターカードを作成しようとした場合は失敗する
 *
 * @throws バックエンドへのアクセスに失敗した場合、例外をスローする
 */
declare function createCharacter(
  character_name: Exclude<string, 'current'>,
  character?: TypeFest.PartialDeep<Character>,
): Promise<boolean>;

/**
 * `character_name` という名前のキャラクターカードを作成または置換する, 内容は `character`
 *
 * @param character_name キャラクターカード名
 * @param character キャラクターカードのデータ; 指定しない場合はデフォルトデータを使用
 * @param options オプション
 *   - `render:'debounced'|'immediate'|'none'`: 酒場のページはデバウンスレンダリング (debounced) を行うべきか、即時レンダリング (immediate) を行うべきか、それともフロントエンドの表示をリフレッシュしない (none) べきか? デフォルトはパフォーマンスの良いデバウンスレンダリング
 *
 * @returns 作成が発生した場合は `true` を返し、置換が発生した場合は `false` を返す
 *
 * @throws バックエンドへのアクセスに失敗した場合、例外をスローする
 */
declare function createOrReplaceCharacter(
  character_name: Exclude<string, 'current'>,
  character?: TypeFest.PartialDeep<Character>,
  options?: ReplaceCharacterOptions,
): Promise<boolean>;

/**
 * `character_name` キャラクターカードを削除する
 *
 * @param character_name キャラクターカード名
 * @param options オプション
 *   - `delete_chats:boolean`: キャラクターカードのチャットファイルも同時に削除するかどうか
 *
 * @returns 削除に成功したかどうか, キャラクターカードが存在しないなどの理由で失敗する可能性がある
 */
declare function deleteCharacter(
  character_name: TypeFest.LiteralUnion<'current', string>,
  options?: { delete_chats?: boolean },
): Promise<boolean>;

/**
 * `character_name` キャラクターカードの内容を取得する
 *
 * @param character_name キャラクターカード名
 *
 * @returns キャラクターカードの内容
 *
 * @throws キャラクターカードが存在しない場合、例外をスローする
 */
declare function getCharacter(character_name: TypeFest.LiteralUnion<'current', string>): Promise<Character>;

type ReplaceCharacterOptions = {
  /** 酒場のページはデバウンスレンダリング (debounced) を行うべきか、即時レンダリング (immediate) を行うべきか、それともフロントエンドの表示をリフレッシュしない (none) べきか? デフォルトはパフォーマンスの良いデバウンスレンダリング */
  render?: 'debounced' | 'immediate' | 'none';
};

/**
 * `character_name` キャラクターカードの内容を完全に `character` で置き換える
 *
 * @param character_name キャラクターカード名
 * @param character キャラクターカードのデータ
 * @param options オプション
 *   - `render:'debounced'|'immediate'|'none'`: 酒場のページはデバウンスレンダリング (debounced) を行うべきか、即時レンダリング (immediate) を行うべきか、それともフロントエンドの表示をリフレッシュしない (none) べきか? デフォルトはパフォーマンスの良いデバウンスレンダリング
 *
 * @throws キャラクターカードが存在しない場合、例外をスローする
 * @throws バックエンドへのアクセスに失敗した場合、例外をスローする
 *
 * @example
 * // キャラクターカードの冒頭メッセージを変更する
 * const character = await getCharacter('キャラクターカード名');
 * character.first_messages = ['新しい冒頭メッセージ1', '新しい冒頭メッセージ2'];
 * await replaceCharacter('キャラクターカード名', character);
 *
 * @example
 * // キャラクターカードのローカル正規表現をクリアする
 * const character = await getCharacter('キャラクターカード名');
 * character.extensions.regex_scripts = [];
 * await replaceCharacter('キャラクターカード名', character);
 *
 * @example
 * // キャラクターカードのアバターを変更する
 * const character = await getCharacter('キャラクターカード名');
 * character.avatar = await fetch('https://example.com/avatar.png').then(response => response.blob());
 * await replaceCharacter('キャラクターカード名', character);
 */
declare function replaceCharacter(
  character_name: Exclude<string, 'current'>,
  character: TypeFest.PartialDeep<Character>,
  options?: ReplaceCharacterOptions,
): Promise<void>;

type CharacterUpdater = ((character: Character) => Character) | ((character: Character) => Promise<Character>);

/**
 * `updater` 関数で `character_name` キャラクターカードを更新する
 *
 * @param character_name キャラクターカード名
 * @param updater キャラクターカードを更新する関数. キャラクターカードの内容を引数として受け取り、更新後のキャラクターカードの内容を返す.
 * @param options オプション
 *   - `render:'debounced'|'immediate'|'none'`: キャラクターカードに対して操作する場合、デバウンスレンダリング (debounced) を行うべきか、即時レンダリング (immediate) を行うべきか、それともフロントエンドの表示をリフレッシュしない (none) べきか? デフォルトはパフォーマンスの良いデバウンスレンダリング
 *
 * @returns 更新後のキャラクターカードの内容
 *
 * @throws キャラクターカードが存在しない場合、例外をスローする
 * @throws バックエンドへのアクセスに失敗した場合、例外をスローする
 *
 * @example
 * // キャラクターカードに冒頭メッセージを1つ追加する
 * await updateCharacterWith('キャラクターカード名', character => {
 *   character.first_messages.push('新しい冒頭メッセージ');
 *   return character;
 * });
 *
 * @example
 * // キャラクターカードのローカル正規表現をクリアする
 * await updateCharacterWith('キャラクターカード名', character => {
 *   character.extensions.regex_scripts = [];
 *   return character;
 * });
 *
 * @example
 * // キャラクターカードのアバターを変更する
 * await updateCharacterWith('キャラクターカード名', async character => {
 *   character.avatar = await fetch('https://example.com/avatar.png').then(response => response.blob());
 *   return character;
 * });
 */
declare function updateCharacterWith(
  character_name: TypeFest.LiteralUnion<'current', string>,
  updater: CharacterUpdater,
): Promise<Character>;
