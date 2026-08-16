type Preset = {
  settings: {
    /** 最大コンテキストトークン数 */
    max_context: number;
    /** 最大応答トークン数 */
    max_completion_tokens: number;
    /** 1回の生成でいくつの応答を生成するか */
    reply_count: number;

    /** ストリーミングするかどうか */
    should_stream: boolean;

    /** 温度 */
    temperature: number;
    /** 頻度ペナルティ */
    frequency_penalty: number;
    /** 存在ペナルティ */
    presence_penalty: number;
    top_p: number;
    /** 繰り返しペナルティ */
    repetition_penalty: number;
    min_p: number;
    top_k: number;
    top_a: number;

    /** シード, -1 はランダムを表す */
    seed: number;

    /** システムメッセージを圧縮: 連続するシステムメッセージを1つのメッセージにまとめる */
    squash_system_messages: boolean;

    /** 推論強度, つまり内蔵の思考連鎖への投入度合い. 例えば、酒場が gemini-2.5-flash に直接接続している場合、`min` では内蔵の思考連鎖を使用しない */
    reasoning_effort: 'auto' | 'min' | 'low' | 'medium' | 'high' | 'max';
    /** 思考連鎖をリクエスト: モデルが内蔵の思考連鎖の思考プロセスを返すことを許可する; これは内蔵の思考連鎖の表示・非表示にのみ影響し、モデルが内蔵の思考連鎖を使用するかどうかは決定しないことに注意 */
    request_thoughts: boolean;
    /** 画像をリクエスト: モデルが応答内で画像を返すことを許可する */
    request_images: boolean;
    /** 関数呼び出しを有効化: モデルが関数呼び出し機能を使用できるようにする; 例えば cursor がこれを利用して応答内でファイルの読み書きやコマンド実行を行う */
    enable_function_calling: boolean;
    /** ネットワーク検索を有効化: モデルがネットワーク検索機能を使用できるようにする */
    enable_web_search: boolean;

    /** 画像をプロンプトとして送信できるかどうか */
    allow_sending_images: 'disabled' | 'auto' | 'low' | 'high';
    /** 動画をプロンプトとして送信できるかどうか */
    allow_sending_videos: boolean;

    /**
     * キャラクター名プレフィックス: メッセージにキャラクター名のプレフィックスを追加するかどうか、およびどのように追加するか
     * - `none`: 追加しない
     * - `default`: キャラクターカードと名前が異なるメッセージにキャラクター名のプレフィックスを追加し、`content` フィールドの先頭に追加する (つまり送信されるメッセージ内容は `キャラクター名: メッセージ内容`)
     * - `content`: すべてのメッセージにキャラクター名のプレフィックスを追加し、`content` フィールドの先頭に追加する (つまり送信されるメッセージ内容は `キャラクター名: メッセージ内容`)
     * - `completion`: モデルに送信する際、キャラクター名を `name` フィールドに書き込む; 英数字とアンダースコアのみ対応し、Claude、Google などのモデルには適用できない
     */
    character_name_prefix: 'none' | 'default' | 'content' | 'completion';
    /** ユーザーメッセージを引用符で囲む: モデルに送信する前に、すべてのユーザーメッセージを引用符で囲む */
    wrap_user_messages_in_quotes: boolean;
  };

  /** プロンプトリストに追加済みのプロンプト */
  prompts: PresetPrompt[];
  /** ドロップダウン内にある、プロンプトリストに追加されていないプロンプト */
  prompts_unused: PresetPrompt[];

  /** 追加フィールド, プリセットに追加データをバインドするために使用 */
  extensions: {
    regex_scripts?: TavernRegex[];
    tavern_helper?: {
      scripts: Record<string, any>[];
      variales: Record<string, any>;
    };
    [other: string]: any;
  };
};

type PresetPrompt = {
  /**
   * id に基づいて、プリセットプロンプトは以下の3種類に分類される:
   * - 通常のプロンプト (`isPresetNormalPrompt`): プリセット画面で手動で追加できるプロンプト
   * - システムプロンプト (`isPresetSystemPrompt`): 酒場が設定するシステムプロンプト, ただし実際には手動で追加したプロンプトと比べて何の利点もなく、`main`、`nsfw`、`jailbreak`、`enhance_definitions` に分かれる
   * - プレースホルダープロンプト (`isPresetPlaceholderPrompt`): ワールドブックエントリ、キャラクターカード、プレイヤーキャラクター、チャット記録などのプロンプトの挿入位置を表すために使用し、`world_info_before`、`persona_description`、`char_description`、`char_personality`、`scenario`、`world_info_after`、`dialogue_examples`、`chat_history` に分かれる
   */
  id: TypeFest.LiteralUnion<
    | 'main'
    | 'nsfw'
    | 'jailbreak'
    | 'enhanceDefinitions'
    | 'worldInfoBefore'
    | 'personaDescription'
    | 'charDescription'
    | 'charPersonality'
    | 'scenario'
    | 'worldInfoAfter'
    | 'dialogueExamples'
    | 'chatHistory',
    string
  >;
  name: string;
  enabled: boolean;

  /**
   * 挿入位置, 通常のプロンプトとプレースホルダープロンプトにのみ使用
   *   - `'relative'`: プロンプトの相対位置に応じて挿入
   *   - `'in_chat'`: チャット記録の対応する深度に挿入, 対応する深度 `depth` と順序 `order` を設定する必要がある
   */
  position?:
    | {
        type: 'relative';
        depth?: never;
        order?: never;
      }
    | { type: 'in_chat'; depth: number; order: number };
  role: 'system' | 'user' | 'assistant';
  /** 通常のプロンプトとシステムプロンプトにのみ使用 */
  content?: string;

  /** 追加フィールド, プリセットプロンプトに追加データをバインドするために使用 */
  extra?: Record<string, any>;
};
type PresetNormalPrompt = TypeFest.SetRequired<{ id: string } & Omit<PresetPrompt, 'id'>, 'position' | 'content'>;
type PresetSystemPrompt = TypeFest.SetRequired<
  { id: 'main' | 'nsfw' | 'jailbreak' | 'enhanceDefinitions' } & Omit<PresetPrompt, 'id' | 'position'>,
  'content'
>;
type PresetPlaceholderPrompt = TypeFest.SetRequired<
  {
    id:
      | 'worldInfoBefore'
      | 'personaDescription'
      | 'charDescription'
      | 'charPersonality'
      | 'scenario'
      | 'worldInfoAfter'
      | 'dialogueExamples'
      | 'chatHistory';
  } & Omit<PresetPrompt, 'id' | 'content'>,
  'position'
>;
declare function isPresetNormalPrompt(prompt: PresetPrompt): prompt is PresetNormalPrompt;
declare function isPresetSystemPrompt(prompt: PresetPrompt): prompt is PresetSystemPrompt;
declare function isPresetPlaceholderPrompt(prompt: PresetPrompt): prompt is PresetPlaceholderPrompt;

declare const default_preset: Preset;

/**
 * プリセット名の一覧を取得する
 *
 * @returns プリセット名の一覧
 */
declare function getPresetNames(): string[];

/**
 * 酒場で現在使用されているプリセット (`'in_use'`) がどのプリセットから読み込まれたかを取得する.
 *
 * この表現に必ず注意してください, `'in_use'` プリセットは `getLoadedPresetName()` プリセットから読み込まれたものですが、そのプリセット内容は `getLoadedPresetName()` プリセットと異なる場合があります.
 *   思い出してください: 酒場でプリセットを編集すると、編集結果は即座にチャットに反映されます (`'in_use'` プリセットが変更される),
 *   しかし保存ボタンをクリックしていない場合 (`'in_use'` プリセットの内容を `getLoadedPresetName()` プリセットに保存していない場合)、プリセットを切り替えると編集結果は失われます.
 *
 * @returns プリセット名
 */
declare function getLoadedPresetName(): string;

/**
 * `preset_name` プリセットを酒場で現在使用されているプリセット (`'in_use'`) として読み込む
 *
 * @param preset_name プリセット名
 * @returns 切り替えに成功したかどうか, プリセットが存在しないなどの理由で失敗する可能性がある
 */
declare function loadPreset(preset_name: Exclude<string, 'in_use'>): boolean;

/**
 * `preset_name` プリセットの内容を取得する
 *
 * @param preset_name プリセット名
 *
 * @returns プリセットの内容
 *
 * @throws プリセットが存在しない場合、例外をスローする
 */
declare function getPreset(preset_name: TypeFest.LiteralUnion<'in_use', string>): Preset;

/**
 * `preset_name` プリセットを新規作成する, 内容は `preset`
 *
 * @param preset_name プリセット名
 * @param preset プリセットの内容; 指定しない場合はデフォルトの内容を使用
 *
 * @returns 作成に成功したかどうか, 同名のプリセットが既に存在する場合や `'in_use'` という名前のプリセットを作成しようとした場合は失敗する
 *
 * @throws 作成したプリセット内容に重複したシステム/プレースホルダープロンプトが存在する場合、例外をスローする
 */
declare function createPreset(preset_name: Exclude<string, 'in_use'>, preset?: Preset): Promise<boolean>;

/**
 * `preset_name` という名前のプリセットを作成または置換する, 内容は `preset`
 *
 * @param preset_name プリセット名
 * @param preset プリセットの内容; 指定しない場合はデフォルトの内容を使用
 * @param options オプション
 *   - `render:'debounced'|'immediate'`: `'in_use'` プリセットに対して操作する場合、プリセット画面をデバウンスで再レンダリング (debounced) するべきか、即時に再レンダリング (immediate) するべきか? デフォルトはパフォーマンスの良いデバウンスレンダリング
 *
 * @returns 作成が発生した場合は `true` を返し、置換が発生した場合は `false` を返す
 */
declare function createOrReplacePreset(
  preset_name: TypeFest.LiteralUnion<'in_use', string>,
  preset?: Preset,
  { render }?: ReplacePresetOptions,
): Promise<boolean>;

/**
 * `preset_name` プリセットを削除する
 *
 * @param preset_name プリセット名
 *
 * @returns 削除に成功したかどうか, プリセットが存在しないなどの理由で失敗する可能性がある
 */
declare function deletePreset(preset_name: Exclude<string, 'in_use'>): Promise<boolean>;

/**
 * `preset_name` プリセットを `new_name` に名前変更する
 *
 * @param preset_name プリセット名
 * @param new_name 新しい名前
 *
 * @returns 名前変更に成功したかどうか, プリセットが存在しないなどの理由で失敗する可能性がある
 */
declare function renamePreset(preset_name: Exclude<string, 'in_use'>, new_name: string): Promise<boolean>;

type ReplacePresetOptions = {
  /** `'in_use'` プリセットに対して操作する場合、デバウンスレンダリング (debounced) を行うべきか、即時レンダリング (immediate) を行うべきか、それともフロントエンドの表示をリフレッシュしない (none) べきか? デフォルトはパフォーマンスの良いデバウンスレンダリング */
  render?: 'debounced' | 'immediate' | 'none';
};
/**
 * `preset_name` プリセットの内容を完全に `preset` で置き換える
 *
 * @param preset_name プリセット名
 * @param preset プリセットの内容
 * @param options オプション
 *   - `render:'debounced'|'immediate'`: `'in_use'` プリセットに対して操作する場合、デバウンスレンダリング (debounced) を行うべきか、それとも即時レンダリング (immediate) を行うべきか? デフォルトはパフォーマンスの良いデバウンスレンダリング
 *
 * @throws プリセットが存在しない場合、例外をスローする
 * @throws 置換するプリセット内容に重複したシステム/プレースホルダープロンプトが存在する場合、例外をスローする
 *
 * @example
 * // 酒場で現在使用されているプリセットでストリーミングを有効にする
 * const preset = getPreset('in_use');
 * preset.settings.should_stream = true;
 * await replacePreset('in_use', preset);
 *
 * @example
 * // 酒場で現在使用されているプリセットのうち、名前に "COT" を含むエントリを無効にする
 * const preset = getPreset('in_use');
 * preset.prompts.filter(prompt => prompt.name.includes('COT')).forEach(prompt => prompt.enabled = false);
 * await replacePreset('in_use', preset);
 *
 * @example
 * // 酒場で現在使用されているプリセットにプロンプトエントリを1つ追加する
 * const preset = getPreset('in_use');
 * preset.prompts.push({
 *   id: 'new_prompt',
 *   name: '新しいプロンプト',
 *   enabled: true,
 *   position: { type: 'relative' },
 *   role: 'user',
 *   content: '新しいプロンプト内容',
 * });
 * await replacePreset('in_use', preset);
 *
 * @example
 * // 'プリセットA' のエントリを順番に 'プリセットB' の先頭にコピーする
 * const preset_a = getPreset('プリセットA');
 * const preset_b = getPreset('プリセットB');
 * preset_b.prompts = [...preset_a.prompts, ...preset_b.prompts];
 * await replacePreset('プリセットB', preset_b);
 */
declare function replacePreset(
  preset_name: TypeFest.LiteralUnion<'in_use', string>,
  preset: Preset,
  { render }?: ReplacePresetOptions,
): Promise<void>;

type PresetUpdater = ((preset: Preset) => Preset) | ((preset: Preset) => Promise<Preset>);
/**
 * `updater` 関数で `preset_name` プリセットを更新する
 *
 * @param preset_name プリセット名
 * @param updater プリセットを更新する関数. プリセットの内容を引数として受け取り、更新後のプリセットの内容を返す.
 * @param options オプション
 *   - `render:'debounced'|'immediate'`: `'in_use'` プリセットに対して操作する場合、デバウンスレンダリング (debounced) を行うべきか、それとも即時レンダリング (immediate) を行うべきか? デフォルトはパフォーマンスの良いデバウンスレンダリング
 *
 * @returns 更新後のプリセットの内容
 *
 * @throws プリセットが存在しない場合、例外をスローする
 * @throws 置換するプリセット内容に重複したシステム/プレースホルダープロンプトが存在する場合、例外をスローする
 *
 * @example
 * // 酒場で現在使用されているプリセットでストリーミングを有効にする
 * await updatePresetWith('in_use', preset => {
 *   preset.settings.should_stream = true;
 *   return preset;
 * });
 *
 * @example
 * // 酒場で現在使用されているプリセットのうち、名前に "COT" を含むエントリを無効にする
 * await updatePresetWith('in_use', preset => {
 *   preset.prompts.filter(prompt => prompt.name.includes('COT')).forEach(prompt => prompt.enabled = false);
 *   return preset;
 * });
 *
 * @example
 * // 酒場で現在使用されているプリセットにプロンプトエントリを1つ追加する
 * await updatePresetWith('in_use', preset => {
 *   preset.prompts.push({
 *     id: 'new_prompt',
 *     name: '新しいプロンプト',
 *     enabled: true,
 *     position: { type: 'relative' },
 *     role: 'user',
 *     content: '新しいプロンプト内容',
 *   });
 *   return preset;
 * });
 *
 * @example
 * // 'プリセットA' のエントリを順番に 'プリセットB' の先頭にコピーする
 * await updatePresetWith('プリセットB', preset => {
 *   const another_preset = getPreset('プリセットA');
 *   preset.prompts = [...another_preset.prompts, ...preset.prompts];
 *   return preset;
 * });
 */
declare function updatePresetWith(
  preset_name: TypeFest.LiteralUnion<'in_use', string>,
  updater: PresetUpdater,
  { render }?: ReplacePresetOptions,
): Promise<Preset>;

/**
 * プリセット内容をプリセットに反映する, 存在しない内容は元の値が採用される
 *
 * @param preset_name プリセット名
 * @param preset プリセットの内容
 * @param options オプション
 *   - `render:'debounced'|'immediate'`: `'in_use'` プリセットに対して操作する場合、デバウンスレンダリング (debounced) を行うべきか、それとも即時レンダリング (immediate) を行うべきか? デフォルトはパフォーマンスの良いデバウンスレンダリング
 *
 * @returns 更新後のプリセットの内容
 *
 * @throws プリセットが存在しない場合、例外をスローする
 * @throws 置換するプリセット内容に重複したシステム/プレースホルダープロンプトが存在する場合、例外をスローする
 *
 * @example
 * // 酒場で現在使用されているプリセットでストリーミングを有効にする
 * await setPreset('in_use', { settings: { should_stream: true } });
 *
 * @example
 * // 'プリセットA' のエントリを順番に 'プリセットB' の先頭にコピーする
 * await setPreset('プリセットB', {
 *   prompts: [...getPreset('プリセットA').prompts, ...getPreset('プリセットB').prompts],
 * });
 */
declare function setPreset(
  preset_name: TypeFest.LiteralUnion<'in_use', string>,
  preset: TypeFest.PartialDeep<Preset>,
  { render }?: ReplacePresetOptions,
): Promise<Preset>;
