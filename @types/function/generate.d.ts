/**
 * プロキシプリセット名の一覧を取得する
 *
 * @returns プロキシプリセット名の一覧
 */
declare function getProxyPresetNames(): string[];

/**
 * 酒場で現在有効なプリセットを使用して、AI にテキストを生成させる.
 *
 * この関数は実行中に以下のイベントを送信する:
 * - `iframe_events.GENERATION_STARTED`: 生成開始
 * - ストリーミングが有効な場合, `iframe_events.STREAM_TOKEN_RECEIVED_FULLY`: これをリッスンするとストリーミングの現在の完全なテキストを取得できる ("これは", "これはメッセージ", "これはメッセージのストリーミング")
 * - ストリーミングが有効な場合, `iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY`: これをリッスンするとストリーミングの現在の増分テキストを取得できる ("これは", "メッセージ", "ストリーミング")
 * - `iframe_events.GENERATION_ENDED`: 生成終了, これをリッスンすると生成された最終テキストを取得できる (もちろん関数の戻り値からも取得できる)
 *
 * @param config プロンプトと生成方法の設定
 *   - `user_input?:string`: ユーザー入力
 *   - `should_stream?:boolean`: ストリーミングを有効にするか; デフォルトは 'false'
 *   - `should_silence?:boolean`: サイレント生成にするか; デフォルトは 'false'
 *   - `image?:File|string`: 画像入力
 *   - `overrides?:Overrides`: 上書きオプション. 設定すると、`overrides` で指定されたフィールドが対応するプロンプトを上書きする. 例えば `overrides.char_description = '上書きするキャラクター説明';` とするとキャラクター説明が上書きされる
 *   - `injects?:Omit<InjectionPrompt, 'id'>[]`: 追加で注入するプロンプト
 *   - `max_chat_history?:'all'|number`: チャット履歴を最大何件使用するか
 * @returns 生成された最終テキスト
 *
 * @example
 * // 生成をリクエストする
 * const result = await generate({ user_input: 'こんにちは' });
 * console.info('応答を受信: ', result);
 *
 * @example
 * // 画像入力
 * const result = await generate({ user_input: 'こんにちは', image: 'https://example.com/image.jpg' });
 * console.info('応答を受信: ', result);
 *
 * @example
 * // プロンプトを注入・上書きする
 * const result = await generate({
 *   user_input: 'こんにちは',
 *   injects: [{ role: 'system', content: '思考連鎖...', position: 'in_chat', depth: 0, should_scan: true, }]
 *   overrides: {
 *     char_personality: '優しい',
 *     world_info_before: '',
 *     chat_history: {
 *       prompts: [],
 *     }
 *   }
 * });
 * console.info('応答を受信: ', result);
 *
 * @example
 * // カスタムAPIを使用する
 * const result = await generate({
 *   user_input: 'こんにちは',
 *   custom_api: {
 *     apiurl: 'https://your-proxy-url.com',
 *     key: 'your-api-key',
 *     model: 'gpt-4',
 *     source: 'openai'
 *   }
 * });
 * console.info('応答を受信: ', result);
 *
 * @example
 * // 酒場のプロキシプリセットを使用する
 * const result = await generate({
 *   user_input: 'こんにちは',
 *   custom_api: {
 *     proxy_preset: 'MyProxy',
 *     model: 'gpt-4',
 *   }
 * });
 * console.info('応答を受信: ', result);
 *
 * @example
 * // 現在の ST ソースを使用するが、モデルを切り替える
 * const result = await generate({
 *   user_input: 'こんにちは',
 *   custom_api: {
 *     model: 'gpt-4-turbo',
 *   }
 * });
 * console.info('応答を受信: ', result);
 *
 * @example
 * // ストリーミング生成
 *
 * // ストリーミング応答を受け取るには、事前にイベントをリッスンしておく必要がある
 * eventOn(iframe_events.STREAM_TOKEN_RECEIVED_FULLY, text => {
 *   console.info('ストリーミング応答を受信: ', text);
 * });
 *
 * // その後、生成を実行する
 * const result = await generate({ user_input: 'こんにちは', should_stream: true });
 * console.info('最終応答を受信: ', result);
 *
 * @example
 * // tool use / function calling を使用する
 * const result = await generate({
 *   user_input: '今日の北京の天気はどうですか？',
 *   tools: [{
 *     type: 'function',
 *     function: {
 *       name: 'get_weather',
 *       description: '指定された都市の天気を取得する',
 *       parameters: {
 *         type: 'object',
 *         properties: {
 *           city: { type: 'string', description: '都市名' }
 *         },
 *         required: ['city']
 *       }
 *     }
 *   }],
 *   tool_choice: 'auto'
 * });
 *
 * if (typeof result === 'object' && result.tool_calls) {
 *   for (const call of result.tool_calls) {
 *     console.info(`モデルがツールを呼び出しました: ${call.function.name}(${call.function.arguments})`);
 *   }
 * } else {
 *   console.info('テキスト応答を受信: ', result);
 * }
 *
 * @example
 * // json_schema で構造化出力を強制する
 * const result = await generate({
 *   user_input: 'シナリオを説明',
 *   json_schema: {
 *     name: 'scene_output',
 *     value: {
 *       type: 'object',
 *       properties: {
 *         narrative: { type: 'string' },
 *         mood: { type: 'string', enum: ['happy', 'sad', 'tense'] }
 *       },
 *       required: ['narrative', 'mood']
 *     }
 *   }
 * });
 * const parsed = JSON.parse(result as string);
 * console.info(parsed.narrative, parsed.mood);
 */
declare function generate(config: GenerateConfig): Promise<string | GenerateToolCallResult>;

/**
 * 酒場で現在有効なプリセットを使用せずに、AI にテキストを生成させる.
 *
 * この関数は実行中に以下のイベントを送信する:
 * - `iframe_events.GENERATION_STARTED`: 生成開始
 * - ストリーミングが有効な場合, `iframe_events.STREAM_TOKEN_RECEIVED_FULLY`: これをリッスンするとストリーミングの現在の完全なテキストを取得できる ("これは", "これはメッセージ", "これはメッセージのストリーミング")
 * - ストリーミングが有効な場合, `iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY`: これをリッスンするとストリーミングの現在の増分テキストを取得できる ("これは", "メッセージ", "ストリーミング")
 * - `iframe_events.GENERATION_ENDED`: 生成終了, これをリッスンすると生成された最終テキストを取得できる (もちろん関数の戻り値からも取得できる)
 *
 * @param config プロンプトと生成方法の設定
 *   - `user_input?:string`: ユーザー入力
 *   - `should_stream?:boolean`: ストリーミングを有効にするか; デフォルトは 'false'
 *   - `should_silence?:boolean`: サイレント生成にするか; デフォルトは 'false'
 *   - `image?:File|string`: 画像入力
 *   - `overrides?:Overrides`: 上書きオプション. 設定すると、`overrides` で指定されたフィールドが対応するプロンプトを上書きする. 例えば `overrides.char_description = '上書きするキャラクター説明';` とするとキャラクター説明が上書きされる
 *   - `injects?:Omit<InjectionPrompt, 'id'>[]`: 追加で注入するプロンプト
 *   - `max_chat_history?:'all'|number`: チャット履歴を最大何件使用するか
 *   - `ordered_prompts?:(BuiltinPrompt|RolePrompt)[]`: プロンプトの配列, 配列の要素は順番に AI に送信されるため、カスタムプリセットに相当する
 * @returns 生成された最終テキスト
 *
 * @example
 * // 組み込みプロンプトの順序をカスタマイズする, ordered_prompts に含まれていないものは使用されない
 * const result = await generateRaw({
 *   user_input: 'こんにちは',
 *   ordered_prompts: [
 *     'char_description',
 *     { role: 'system', content: 'システムプロンプト' },
 *     'chat_history',
 *     'user_input',
 *   ]
 * })
 * console.info('応答を受信: ', result);
 *
 * @example
 * // カスタムAPIとカスタムプロンプト順序を使用する
 * const result = await generateRaw({
 *   user_input: 'こんにちは',
 *   custom_api: {
 *     apiurl: 'https://your-proxy-url.com',
 *     key: 'your-api-key',
 *     model: 'gpt-4',
 *     source: 'openai'
 *   },
 *   ordered_prompts: [
 *     'char_description',
 *     'chat_history',
 *     'user_input',
 *   ]
 * })
 * console.info('応答を受信: ', result);
 */
declare function generateRaw(config: GenerateRawConfig): Promise<string | GenerateToolCallResult>;

/**
 * モデル一覧を取得する
 *
 * @param custom_api カスタムAPI設定
 * @returns Promise<string[]> モデル一覧
 * @throws モデル一覧の取得に失敗
 */
declare function getModelList(custom_api: { apiurl: string; key?: string }): Promise<string[]>;

/**
 * 生成リクエストの一意の識別子に基づいて、特定の生成リクエストを停止する
 *
 * @param generation_id 生成リクエストの一意の識別子, 停止する生成リクエストを識別するために使用
 * @returns boolean 生成の停止に成功したかどうか
 */
declare function stopGenerationById(generation_id: string): boolean;

/**
 * 進行中のすべての生成リクエストを停止する
 *
 * @returns boolean すべての生成の停止に成功したかどうか
 */
declare function stopAllGeneration(): boolean;

type GenerateConfig = {
  /** 使用するプリセット名, デフォルトは現在読み込まれているプリセット `'in_use'`; 設定すると、選択したプリセットのプロンプトとパラメータを使用するが、選択したプリセットの正規表現や酒場アシスタントのスクリプトは使用しない */
  preset_name?: 'in_use' | string;

  /**
   * 生成リクエストの一意の識別子, 設定しない場合はランダムな識別子がデフォルトで生成される.
   *
   * 複数の generate/generateRaw が同時に生成をリクエストする場合、各リクエストに一意の識別子を指定できるため、`stopGenerationById` で特定の生成リクエストを停止したり、対応する生成イベントを正しくリッスンしたりできる.
   */
  generation_id?: string;

  /** ユーザー入力 */
  user_input?: string;

  /**
   * 画像入力。以下の形式に対応：
   * - File オブジェクト：input[type="file"] で取得したファイルオブジェクト
   * - Base64 文字列：画像の base64 エンコード
   * - URL 文字列：画像のオンラインアドレス
   */
  image?: File | string | (File | string)[];

  /**
   * ストリーミングを有効にするか; デフォルトは `false`.
   *
   * ストリーミングが有効な場合、ストリーミング結果を受け取るたびに、関数はイベントを送信する:
   * - `iframe_events.STREAM_TOKEN_RECEIVED_FULLY`: これをリッスンするとストリーミングの現在の完全なテキストを取得できる ("これは", "これはメッセージ", "これはメッセージのストリーミング")
   * - `iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY`: これをリッスンするとストリーミングの現在の増分テキストを取得できる ("これは", "メッセージ", "ストリーミング")
   *
   * @example
   * eventOn(iframe_events.STREAM_TOKEN_RECEIVED_FULLY, text => console.info(text));
   */
  should_stream?: boolean;

  /**
   * サイレント生成にするか; デフォルトは `false`.
   * - `false`: 酒場ページの送信ボタンが停止ボタンに変わり、停止ボタンをクリックするとすべての非サイレント生成リクエストが中断される
   * - `true`: 酒場の停止ボタンの状態に影響せず、停止ボタンをクリックしてもその生成は中断されない
   *
   * サイレント生成は停止ボタンでは中断できないが、コード内で以下の方法で生成を停止できる:
   * - その生成リクエストの `generation_id` を使って `stopGenerationById` を呼び出す
   * - `stopAllGeneration` を呼び出す
   */
  should_silence?: boolean;

  /**
   * 上書きオプション. 設定すると、`overrides` で指定されたフィールドが対応するプロンプトを上書きする.
   *   例えば `overrides.char_description = '上書きするキャラクター説明';` とするとキャラクター説明が上書きされる.
   */
  overrides?: Overrides;

  /** 追加で注入するプロンプト */
  injects?: Omit<InjectionPrompt, 'id'>[];

  /** チャット履歴を最大何件使用するか; デフォルトは 'all' */
  max_chat_history?: 'all' | number;

  /** カスタムAPI設定 */
  custom_api?: CustomApiConfig;

  /**
   * ツール定義のリスト（OpenAI 形式）。
   * 渡すと、モデルが純粋なテキストではなく tool_calls を返す可能性があり、その場合関数は `GenerateToolCallResult` オブジェクトを返す。
   */
  tools?: ToolDefinition[];

  /**
   * ツール選択ポリシー:
   * - `'auto'`: モデルがツールを呼び出すかどうかを自分で決める（デフォルト）
   * - `'required'`: モデルはツールを呼び出す必要がある
   * - `'none'`: モデルはツールを呼び出さない
   * - `{ type: 'function', function: { name: string } }`: 指定したツールの呼び出しを強制する
   */
  tool_choice?: ToolChoice;

  /**
   * JSON Schema 定義。指定された schema に適合する JSON をモデルに出力させる。
   * 戻り値は JSON 文字列（自分で JSON.parse する必要がある）。
   *
   * ST サーバーは provider に応じて形式を自動変換する：
   * - OpenAI/DeepSeek/Mistral など → response_format.json_schema
   * - Claude → tool + forced tool_choice に変換
   *
   * tools とは排他的なので、同時に渡さないこと。
   */
  json_schema?: JsonSchema;
};

type GenerateRawConfig = GenerateConfig & {
  /**
   * プロンプトの配列, 配列の要素は順番に AI に送信されるため、カスタムプリセットに相当する. この配列には2種類のタイプを格納できる:
   * - `PlaceholderPrompt`: 組み込みプロンプト. プリセットを使用しないため、"キャラクター説明" などのプロンプトが必要な場合は、自分でどれを使うかを指定して順序を決める必要がある
   *                        自分で指定したくない場合は、`placeholder_prompt_default_order` で酒場のデフォルトプリセットが使用する順序を取得できる (ただし、そのような場合は `generate` を使う方が適しているかもしれない).
   * - `RolePrompt`: 追加で与えるプロンプト.
   */
  ordered_prompts?: (PlaceholderPrompt | RolePrompt)[];
};

/**
 * プリセットが組み込みプロンプトに設定するデフォルトの順序
 */
declare const placeholder_prompt_default_order: PlaceholderPrompt[];

type PlaceholderPrompt =
  | 'world_info_before'
  | 'persona_description'
  | 'char_description'
  | 'char_personality'
  | 'scenario'
  | 'world_info_after'
  | 'dialogue_examples'
  | 'chat_history'
  | 'user_input';

type RolePrompt = {
  role: 'system' | 'assistant' | 'user';
  content: string;
  image?: File | string | (File | string)[];
};

type Overrides = {
  world_info_before?: string;
  persona_description?: string;
  char_description?: string;
  char_personality?: string;
  scenario?: string;
  world_info_after?: string;
  dialogue_examples?: string;

  /**
   * チャット履歴
   * - `with_depth_entries`: ワールドブックで深度に応じて挿入されるエントリを有効にするか; デフォルトは `true`
   * - `author_note`: 設定すると、"作者ノート" を指定された文字列で上書きする
   * - `prompts`: 設定すると、"チャット履歴" を指定されたプロンプトで上書きする
   */
  chat_history?: {
    with_depth_entries?: boolean;
    author_note?: string;
    prompts?: RolePrompt[];
  };
};

/**
 * カスタムAPI設定
 *
 * すべてのフィールドは省略可能：
 * - proxy_preset を指定：酒場のプロキシプリセットの URL と Key を使用
 * - apiurl を指定：カスタム API アドレスを使用
 * - どちらも指定しない：現在の ST ソースを使用するが、model などのパラメータは上書き可能
 */
type CustomApiConfig = {
  /**
   * 酒場のプロキシプリセット名。
   * - プリセットのマッチに成功：プリセットの URL とパスワードを完全に使用する（空でも custom_api のフィールドにフォールバックしない）
   * - プリセットが見つからない：custom_api.apiurl と custom_api.key にフォールバックする
   * 注意：名称は完全に一致する必要がある（大文字小文字を区別し、前後のスペースは自動的に除去される）
   */
  proxy_preset?: string;
  /** カスタムAPIアドレス */
  apiurl?: string;
  /** APIキー */
  key?: string;
  /** モデル名 */
  model?: string;
  /** APIソース, デフォルトは 'openai'. 現在サポートされているソースは酒場の公式コード[`SillyTavern/src/constants.js`](https://github.com/SillyTavern/SillyTavern/blob/2e3dff73a127679f643e971801cd51173c2c34e7/src/constants.js#L164)を参照 */
  source?: string;

  /** 最大応答トークン数 */
  max_tokens?: 'same_as_preset' | 'unset' | number;
  /** 温度 */
  temperature?: 'same_as_preset' | 'unset' | number;
  /** 頻度ペナルティ */
  frequency_penalty?: 'same_as_preset' | 'unset' | number;
  /** 存在ペナルティ */
  presence_penalty?: 'same_as_preset' | 'unset' | number;
  top_p?: 'same_as_preset' | 'unset' | number;
  top_k?: 'same_as_preset' | 'unset' | number;

  /** `source === 'custom'` の場合のみ有効, リクエストボディ内のパラメータを追加で上書き; 例 `{ max_tokens: 1024 }` */
  custom_include_body?: Record<string, any>;
  /** `source === 'custom'` の場合のみ有効, リクエストボディ内のパラメータを除外, 酒場バックエンドの制約によりルートパラメータのみ除外できる; 例 `['max_tokens']` */
  custom_exclude_body?: string[];
  /** `source === 'custom'` の場合のみ有効, リクエストヘッダーのパラメータを追加で上書き; 例 `{ Content-Type: 'application/json' }` */
  custom_include_headers?: Record<string, any>;
};

/**
 * JSON Schema 定義。指定された schema に適合する JSON をモデルに出力させるために使用する。
 *
 * @example
 * const result = await generateRaw({
 *   user_input: 'シナリオを説明',
 *   json_schema: {
 *     name: 'scene_output',
 *     description: 'シナリオの説明とキャラクターの状態',
 *     value: {
 *       type: 'object',
 *       properties: {
 *         narrative: { type: 'string', description: 'ナレーションテキスト' },
 *         status: { type: 'object', properties: { name: { type: 'string' } } }
 *       },
 *       required: ['narrative', 'status']
 *     }
 *   }
 * });
 * const parsed = JSON.parse(result as string);
 */
type JsonSchema = {
  /** Schema 名 */
  name: string;
  /** Schema の説明 */
  description?: string;
  /** JSON Schema 定義 */
  value: Record<string, any>;
  /** 厳格モードかどうか（デフォルト true） */
  strict?: boolean;
};

/**
 * Tool function 定義
 */
type ToolFunction = {
  /** ツール関数名 */
  name: string;
  /** ツール関数の説明 */
  description?: string;
  /** JSON Schema 形式の引数定義 */
  parameters?: Record<string, any>;
};

/**
 * Tool 定義（OpenAI 形式）
 */
type ToolDefinition = {
  type: 'function';
  function: ToolFunction;
};

/**
 * Tool choice の選択肢
 */
type ToolChoice = 'auto' | 'required' | 'none' | 'any' | { type: 'function'; function: { name: string } };

/**
 * モデルが tool_calls を返したときの構造化結果。
 *
 * `generate` / `generateRaw` の設定で `tools` が渡され、かつモデルがツールを呼び出すと判断した場合にのみ返される；
 * それ以外の場合、関数は通常の `string` を返す。
 */
type GenerateToolCallResult = {
  /** モデルが返したテキスト内容（空文字列の可能性あり） */
  content: string;
  /** モデルが呼び出しをリクエストしたツールのリスト */
  tool_calls: {
    id: string;
    type: 'function';
    function: {
      /** ツール関数名 */
      name: string;
      /** JSON 文字列形式の引数 */
      arguments: string;
    };
    /**
     * 暗号化された reasoning/thought シグネチャ（provider が返す場合）。
     *
     * マルチターンの tool call シナリオでは、推理コンテキストを維持するために、シグネチャをそのまま次のリクエストに送り返す必要がある。
     *
     * **Gemini 3 で必須**：thought_signature を送り返さないと 4xx の検証エラーが返る
     * （Gemini 2.5 以前は任意、3.0+ では必須。公式の thought-signatures ドキュメントを参照）。
     *
     * **並行 tool call**：Gemini はシグネチャを**最初の** tool_call にのみ付けるため、
     * 後続の並行 call の `thought_signature` は undefined——この1つのシグネチャが全体を代表するため、
     * 送り返すときは、最初の call に対応する functionCall part にのみ復元すればよい。
     *
     * **マルチターン累積**：**過去のすべてのターン**で返されたシグネチャをまとめて送り返す必要があり、最後の1回だけでは不十分。
     *
     * **検証の回避**（tool call を手動で構築する場合のみ）：thought_signature を
     * `"skip_thought_signature_validator"` または `"context_engineering_is_the_way_to_go"`
     * と設定すると、Gemini サーバー側の検証をスキップできる。
     */
    thought_signature?: string;
  }[];
  /**
   * トップレベルの reasoning シグネチャ（特定の tool_call にバインドされていないもの）。
   *
   * 主に「モデルがテキストのみを返し、tool_calls がない」シナリオで発生：Gemini はシグネチャを最後の
   * text part に付ける（ストリーミングの最終フレームでは空文字列の text + シグネチャになる可能性がある）。OpenRouter は
   * `reasoning_details` で tool にバインドされていない暗号化セグメントを公開し；Claude は thinking ブロックの
   * signature フィールドで提供する。
   *
   * 同様に、マルチターンのシナリオで thinking コンテキストを次のリクエストに送り返すために使用される。
   */
  reasoning_signature?: string;
};

//----------------------------------------------------------------------------------------------------------------------
/**
 * プリセットが組み込みプロンプトに設定するデフォルトの順序
 * @deprecated `placeholder_prompt_default_order` を使用してください
 */
declare const builtin_prompt_default_order: PlaceholderPrompt[];

/** @deprecated `PlaceholderPrompt` を使用してください */
type BuiltinPrompt =
  | 'world_info_before'
  | 'persona_description'
  | 'char_description'
  | 'char_personality'
  | 'scenario'
  | 'world_info_after'
  | 'dialogue_examples'
  | 'chat_history'
  | 'user_input';
