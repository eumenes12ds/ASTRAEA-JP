/**
 * テーマタイプ定義
 * 新しいウィンドウ式レイアウト設計に基づく
 */

/** テーマの色設定 */
export interface ThemeColors {
  // ウィンドウコンテナ
  /** ウィンドウ背景色 */
  windowBg: string;
  /** ウィンドウ枠線色 */
  windowBorder: string;

  // タイトルバー
  /** タイトルバー背景色 */
  titleBarBg: string;
  /** タイトルバー文字色 */
  titleBarText: string;
  /** タイトルバーアイコン色 */
  titleBarIcon: string;
  /** タイトルバーボタンのホバー背景 */
  titleBarBtnHover: string;

  // Tab バー
  /** Tab バー背景色 */
  tabBarBg: string;
  /** Tab デフォルト文字色 */
  tabText: string;
  /** Tab アクティブ文字色 */
  tabActiveText: string;
  /** Tab アクティブインジケータ色 */
  tabIndicator: string;
  /** Tab ホバー背景色 */
  tabHoverBg: string;

  // コンテンツエリア
  /** コンテンツエリア背景色 */
  contentBg: string;
  /** カード背景色 */
  cardBg: string;
  /** カード枠線色 */
  cardBorder: string;
  /** ソフトサーフェス背景色 */
  surfaceMuted: string;
  /** オーバーレイ背景色 */
  overlayBg: string;

  // テキスト色
  /** 主要テキスト色 */
  textPrimary: string;
  /** 副次テキスト色 */
  textSecondary: string;
  /** 淡色テキスト色 */
  textMuted: string;

  // リソースバー色
  /** 生命値色 */
  resourceHp: string;
  /** マナ値色 */
  resourceMp: string;
  /** 体力値色 */
  resourceSp: string;
  /** 経験値色 */
  resourceExp: string;
  /** リソース数値の文字色 */
  resourceText: string;

  // 品質色
  /** ノーマル品質 */
  qualityCommon: string;
  /** ユニーク品質 */
  qualityUnique: string;
  /** ミシック品質 */
  qualityMythic: string;
  /** レジェンド品質 */
  qualityLegendary: string;
  /** エピック品質 */
  qualityEpic: string;
  /** レア品質 */
  qualityRare: string;
  /** アンコモン品質 */
  qualityUncommon: string;

  // インタラクション状態
  /** メインボタン背景 */
  primaryBg: string;
  /** メインボタン文字 */
  primaryText: string;
  /** 成功状態 */
  success: string;
  /** 警告状態 */
  warning: string;
  /** エラー状態 */
  error: string;
  /** エラー本文文字 */
  errorText: string;
  /** 塗りつぶしエラーコントロール文字 */
  errorSolidText: string;

  // 命定システム専用
  /** 好感度バー色 */
  affection: string;
  /** 好感度バー背景 */
  affectionBg: string;
  /** 好感度テキスト */
  affectionText: string;
  /** 在席タグ背景 */
  tagPresent: string;
  /** 在席タグテキスト */
  tagPresentText: string;
  /** 契約タグ背景 */
  tagContract: string;
  /** 契約タグテキスト */
  tagContractText: string;

  // 登神長階色
  /** 要素色 */
  ascensionElement: string;
  /** 権能色 */
  ascensionPower: string;
  /** 法則色 */
  ascensionLaw: string;

  // 通貨色
  /** 金貨色 */
  currencyGold: string;
  /** 銀貨色 */
  currencySilver: string;
  /** 銅貨色 */
  currencyCopper: string;
}

/**
 * プリセットテーマID
 */
export type ThemePresetId =
  | 'parchment' // 西洋ファンタジー羊皮紙（デフォルト）
  | 'crimson' // ダークワイン
  | 'indigo' // ディープインディゴ
  | 'bronze' // ブロンズゴールド
  | 'sakura' // 桜パープル
  | 'obsidian' // 墨黒
  | 'ivory' // クリーム羊皮紙
  | 'misty-lilac'; // ミストパープル

/**
 * テーマ設定
 */
export interface Theme {
  id: ThemePresetId;
  name: string;
  colors: ThemeColors;
}
