declare namespace EjsTemplate {
  type Features = {
    /** 拡張機能を有効にするか */
    enabled: boolean;

    /** 生成コンテンツを処理する */
    generate_enabled: boolean;
    /** 生成時に [GENERATE] ワールドブックエントリを注入する */
    generate_loader_enabled: boolean;
    /** 生成時に @INJECT ワールドブックエントリを注入する */
    inject_loader_enabled: boolean;

    /** フロアメッセージを処理する */
    render_enabled: boolean;
    /** フロアをレンダリングするときに [RENDER] ワールドブックエントリを注入する */
    render_loader_enabled: boolean;
    /** コードブロックを処理する */
    code_blocks_enabled: boolean;
    /** 生のメッセージ内容を処理する */
    raw_message_evaluation_enabled: boolean;
    /** 生成時にフロアメッセージの処理を無視する */
    filter_message_enabled: boolean;
    /** フロアの深度制限を処理する (-1=無制限) */
    depth_limit: number;

    /** 変数の更新を自動保存する */
    autosave_enabled: boolean;
    /** ワールドブックを即時読み込みする */
    preload_worldinfo_enabled: boolean;
    /** with 文ブロックを無効化する */
    with_context_disabled: boolean;
    /** コンソールに詳細情報を表示する */
    debug_enabled: boolean;
    /** 旧設定互換モード, ワールドブック内の GENERATE/RENDER/INJECT エントリが無効の場合に有効とみなす */
    invert_enabled: boolean;
    /** バックグラウンドコンパイルを有効にするか (Web Workers でコンパイル) */
    compile_workers: boolean;
    /** サンドボックスでコードを実行するか (パフォーマンスが低下するが、安全性が向上) */
    sandbox: boolean;

    /** キャッシュ (実験的) (0=無効, 1=すべて, 2=ワールドブックのみ) */
    cache_enabled: number;
    /** キャッシュサイズ */
    cache_size: number;
    /** キャッシュの Hash 関数 */
    cache_hasher: 'h32ToString' | 'h64ToString';
  };
}

/**
 * プロンプトテンプレート構文プラグインが提供する追加機能, プロンプトテンプレート構文プラグインを追加でインストールする必要がある, 詳細は https://github.com/zonde306/ST-Prompt-Template を参照
 * 酒場のページで f12 を押し、コンソールに `window.EjsTemplate` と入力すると、現在のプロンプトテンプレート構文が提供するインターフェースを確認できる
 */
declare const EjsTemplate: {
  /**
   * テキストに対してテンプレート構文処理を行う
   * @note `context` は通常 `prepareContext` から取得し、変更したい場合は元のオブジェクトを直接変更する
   *
   * @param code テンプレートコード
   * @param context 実行環境 (コンテキスト)
   * @param options ejs パラメータ
   * @returns テンプレートを評価した後の内容
   *
   * @example
   * // プロンプトテンプレート構文プラグインが提供する関数で一時的な酒場の正規表現を作成し、メッセージフロアを1回処理する
   * await EjsTemplate.evalTemplate('<%_ await activateRegex(/<thinking>.*?<\/thinking>/gs, '') _%>')
   *
   * @example
   * const env    = await EjsTemplate.prepareContext({ a: 1 });
   * const result = await EjsTemplate.evalTemplate('a is <%= a _%>', env);
   * => result === 'a is 1'
   * // ただし、このような使い方は _.template で行う方が推奨される, 詳細は https://lodash.com/docs/4.17.15#template を参照
   * const compiled = _.template('hello <%= user %>!');
   * const result   = compiled({ 'user': 'fred' });;
   * => result === 'hello user!'
   */
  evaltemplate: (code: string, context?: Record<string, any>, options?: Record<string, any>) => Promise<string>;

  /**
   * テンプレート構文処理に使用する実行環境 (コンテキスト) を作成する
   *
   * @param additional_context 追加の実行環境 (コンテキスト)
   * @param last_message_id マージするメッセージ変数の最大 ID; デフォルトはすべて
   * @returns 実行環境 (コンテキスト)
   */
  prepareContext: (additional_context?: Record<string, any>, last_message_id?: number) => Promise<Record<string, any>>;

  /**
   * テンプレートに構文エラーがないかチェックする
   * 実際には実行されない
   *
   * @param content テンプレートコード
   * @param output_line_count エラー発生時に出力する周辺の行数; デフォルトは 4
   * @returns 構文エラー情報, エラーがない場合は空文字列を返す
   */
  getSyntaxErrorInfo: (code: string, output_line_count?: number) => Promise<string>;

  /**
   * グローバル変数、チャット変数、メッセージフロア変数の和集合を取得する
   *
   * @param end_message_id マージするメッセージフロア変数の最大フロア数
   * @returns マージ後の変数
   */
  allVariables: (end_message_id?: number) => Record<string, any>;

  /**
   * プロンプトテンプレート構文プラグインの設定を取得する
   *
   * @returns 設定内容
   */
  getFeatures: () => EjsTemplate.Features;

  /**
   * プロンプトテンプレート構文プラグインの設定を行う
   *
   * @param features 設定
   */
  setFeatures: (features: Partial<EjsTemplate.Features>) => void;

  /**
   * プロンプトテンプレート構文プラグインの設定をリセットする
   */
  resetFeatures: () => void;
};
