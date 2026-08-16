type PersonaConnection = {
  type: 'character' | 'group';
  id: string;
};

type Persona = {
  avatar_id: string;
  avatar: `${string}.png` | Blob;
  name: string;
  title: string;
  description: string;
  position: number;
  depth: number;
  role: number;
  lorebook: string;
  connections: PersonaConnection[];
  is_default: boolean;
};

type ReplacePersonaOptions = {
  /** 酒場のページは persona 管理リストをデバウンスレンダリング (debounced) するべきか、即時レンダリング (immediate) するべきか、それともフロントエンドの表示をリフレッシュしない (none) べきか? デフォルトはデバウンスレンダリング */
  render?: 'debounced' | 'immediate' | 'none';
};

/**
 * persona 名の一覧を取得する
 *
 * @returns persona 名の一覧
 */
declare function getPersonaNames(): string[];

/**
 * persona のアバター id の一覧を取得する
 *
 * @returns persona のアバター id の一覧
 */
declare function getPersonaIds(): string[];

/**
 * 現在の persona 名を取得する
 *
 * @returns 現在の persona 名, 現在 persona がない場合は `null` を返す
 */
declare function getCurrentPersonaName(): string | null;

/**
 * 現在の persona のアバター id を取得する
 *
 * @returns 現在の persona のアバター id, 現在 persona がない場合は `null` を返す
 */
declare function getCurrentPersonaId(): string | null;

/**
 * persona のアバターパスを取得する
 *
 * @param persona_id persona 名、アバター id、または `'current'`
 *
 * @returns persona のアバターパス, persona が存在しない場合や名前がユニークでない場合は `null` を返す
 */
declare function getPersonaAvatarPath(persona_id?: TypeFest.LiteralUnion<'current', string>): string | null;

/**
 * persona の内容を取得する
 *
 * @param persona_id persona 名、アバター id、または `'current'`
 *
 * @returns persona の内容
 *
 * @throws persona が存在しない場合や名前がユニークでない場合、例外をスローする
 */
declare function getPersona(persona_id: TypeFest.LiteralUnion<'current', string>): Persona;

/**
 * persona を新規作成する
 *
 * @param persona_name persona 名
 * @param persona persona のデータ; 指定しない場合はデフォルトのアバターとデフォルトの説明設定を使用
 * @param options オプション
 *   - `render:'debounced'|'immediate'|'none'`: 酒場のページはデバウンスレンダリング、即時レンダリング、それともフロントエンドの表示をリフレッシュしない
 *
 * @returns 作成に成功したかどうか, 同名の persona、同じアバター id の persona が既に存在する場合や `'current'` という名前の persona を作成しようとした場合は失敗する
 *
 * @throws バックエンドへのアクセスに失敗した場合、例外をスローする
 */
declare function createPersona(
  persona_name: Exclude<string, 'current'>,
  persona?: TypeFest.PartialDeep<Persona>,
  options?: ReplacePersonaOptions,
): Promise<boolean>;

/**
 * `persona_name` という名前の persona を作成または置換する
 *
 * @param persona_name persona 名またはアバター id
 * @param persona persona のデータ; 指定しない場合はデフォルトのアバターとデフォルトの説明設定を使用
 * @param options オプション
 *   - `render:'debounced'|'immediate'|'none'`: 酒場のページはデバウンスレンダリング、即時レンダリング、それともフロントエンドの表示をリフレッシュしない
 *
 * @returns 作成が発生した場合は `true` を返し、置換が発生した場合は `false` を返す
 *
 * @throws persona 名がユニークでない場合、例外をスローする
 * @throws バックエンドへのアクセスに失敗した場合、例外をスローする
 */
declare function createOrReplacePersona(
  persona_name: Exclude<string, 'current'>,
  persona?: TypeFest.PartialDeep<Persona>,
  options?: ReplacePersonaOptions,
): Promise<boolean>;

/**
 * persona を削除する
 *
 * @param persona_id persona 名、アバター id、または `'current'`
 *
 * @returns 削除に成功したかどうか, persona が存在しない、名前がユニークでないなどの理由で失敗する可能性がある
 *
 * @throws バックエンドへのアクセスに失敗した場合、例外をスローする
 */
declare function deletePersona(persona_id: TypeFest.LiteralUnion<'current', string>): Promise<boolean>;

/**
 * persona の内容を完全に置き換える
 *
 * @param persona_id persona 名、アバター id、または `'current'`
 * @param persona persona のデータ
 * @param options オプション
 *   - `render:'debounced'|'immediate'|'none'`: 酒場のページはデバウンスレンダリング、即時レンダリング、それともフロントエンドの表示をリフレッシュしない
 *
 * @throws persona が存在しない場合や名前がユニークでない場合、例外をスローする
 * @throws バックエンドへのアクセスに失敗した場合、例外をスローする
 *
 * @example
 * const persona = getPersona('プレイヤー');
 * persona.description = '新しいプレイヤー説明';
 * await replacePersona('プレイヤー', persona);
 */
declare function replacePersona(
  persona_id: TypeFest.LiteralUnion<'current', string>,
  persona: TypeFest.PartialDeep<Persona>,
  options?: ReplacePersonaOptions,
): Promise<void>;

type PersonaUpdater = ((persona: Persona) => Persona) | ((persona: Persona) => Promise<Persona>);

/**
 * `updater` 関数で persona を更新する
 *
 * @param persona_id persona 名、アバター id、または `'current'`
 * @param updater persona を更新する関数. persona の内容を引数として受け取り、更新後の persona の内容を返す.
 * @param options オプション
 *   - `render:'debounced'|'immediate'|'none'`: 酒場のページはデバウンスレンダリング、即時レンダリング、それともフロントエンドの表示をリフレッシュしない
 *
 * @returns 更新後の persona の内容
 *
 * @throws persona が存在しない場合や名前がユニークでない場合、例外をスローする
 * @throws バックエンドへのアクセスに失敗した場合、例外をスローする
 *
 * @example
 * await updatePersonaWith('プレイヤー', persona => {
 *   persona.title = 'ナレーター表示タイトル';
 *   return persona;
 * });
 */
declare function updatePersonaWith(
  persona_id: TypeFest.LiteralUnion<'current', string>,
  updater: PersonaUpdater,
  options?: ReplacePersonaOptions,
): Promise<Persona>;
