/**
 * プリセットテーマ設定
 * すべてのプリセットテーマの色定義を含む
 */
import type { Theme, ThemePresetId } from '../core/types/theme';

/**
 * 西洋ファンタジー羊皮紙テーマ（デフォルト）
 * 古い巻物・革の質感
 */
const ParchmentTheme: Theme = {
  id: 'parchment',
  name: '羊皮紙',
  colors: {
    // ウィンドウコンテナ
    windowBg: '#1c1410',
    windowBorder: '#6b4b2e',

    // タイトルバー
    titleBarBg: '#2a1d14',
    titleBarText: '#f0dec2',
    titleBarIcon: '#caa06a',
    titleBarBtnHover: 'rgba(202, 160, 106, 0.18)',

    // Tab バー
    tabBarBg: '#241810',
    tabText: '#c9ad85',
    tabActiveText: '#f8ebd2',
    tabIndicator: '#c28b48',
    tabHoverBg: 'rgba(194, 139, 72, 0.16)',

    // コンテンツエリア
    contentBg: '#221912',
    cardBg: '#2c2016',
    cardBorder: '#5a412a',
    surfaceMuted: 'color-mix(in srgb, var(--theme-window-bg) 68%, var(--theme-card-bg) 32%)',
    overlayBg: 'color-mix(in srgb, var(--theme-window-bg) 62%, transparent)',

    // テキスト色
    textPrimary: '#f4e3c8',
    textSecondary: '#d2b48c',
    textMuted: '#a1886b',

    // リソースバー
    resourceHp: '#b73a2b',
    resourceMp: '#305fa8',
    resourceSp: '#3b7f52',
    resourceExp: '#c08a2f',
    resourceText: '#e6d2b4',

    // 品質色
    qualityCommon: '#e4d6bb',
    qualityUnique: '#d6a057',
    qualityMythic: '#D58292',
    qualityLegendary: '#e1c067',
    qualityEpic: '#AB8FD4',
    qualityRare: '#6E9CD2',
    qualityUncommon: '#5EA975',

    // インタラクション状態
    primaryBg: '#91602c',
    primaryText: '#f9eed9',
    success: '#4f9b68',
    warning: '#d1a13f',
    error: '#c14a3a',
    errorText: '#ef8272',
    errorSolidText: '#fff',

    // 命定システム
    affection: '#b4586c',
    affectionBg: 'rgba(180, 88, 108, 0.26)',
    affectionText: '#d79aa8',
    tagPresent: 'rgba(76, 162, 96, 0.2)',
    tagPresentText: '#7fc39a',
    tagContract: 'rgba(186, 52, 82, 0.22)',
    tagContractText: '#e19ab0',

    // 登神長階
    ascensionElement: 'rgba(63, 142, 214, 0.16)',
    ascensionPower: 'rgba(220, 150, 40, 0.16)',
    ascensionLaw: 'rgba(152, 80, 186, 0.16)',

    // 通貨
    currencyGold: '#f3c94f',
    currencySilver: '#c2c4c9',
    currencyCopper: '#b67a3a',
  },
};

/**
 * ダークワインテーマ
 * 深く神秘的な暗黒世界の雰囲気
 */
const CrimsonTheme: Theme = {
  id: 'crimson',
  name: 'ダークワイン',
  colors: {
    // ウィンドウコンテナ
    windowBg: '#1b0e10',
    windowBorder: '#6d2b30',

    // タイトルバー
    titleBarBg: '#2b1418',
    titleBarText: '#f0d2d4',
    titleBarIcon: '#c98a8f',
    titleBarBtnHover: 'rgba(201, 138, 143, 0.18)',

    // Tab バー
    tabBarBg: '#231115',
    tabText: '#c99aa0',
    tabActiveText: '#f7d8dc',
    tabIndicator: '#b04a54',
    tabHoverBg: 'rgba(176, 74, 84, 0.16)',

    // コンテンツエリア
    contentBg: '#1f1114',
    cardBg: '#2a171b',
    cardBorder: '#5a2a30',
    surfaceMuted: 'color-mix(in srgb, var(--theme-window-bg) 66%, var(--theme-card-bg) 34%)',
    overlayBg: 'color-mix(in srgb, var(--theme-window-bg) 54%, transparent)',

    // テキスト色
    textPrimary: '#f2d7d9',
    textSecondary: '#d1a3a8',
    textMuted: '#b78388',

    // リソースバー
    resourceHp: '#c23a3a',
    resourceMp: '#3b4f9a',
    resourceSp: '#3e7a55',
    resourceExp: '#c0893c',
    resourceText: '#e6bfc4',

    // 品質色
    qualityCommon: '#e6c0c4',
    qualityUnique: '#d79a55',
    qualityMythic: '#D27A92',
    qualityLegendary: '#e0b35e',
    qualityEpic: '#A689D5',
    qualityRare: '#6796D1',
    qualityUncommon: '#5CA475',

    // インタラクション状態
    primaryBg: '#94323b',
    primaryText: '#fae6e7',
    success: '#4e955f',
    warning: '#d0a040',
    error: '#d24b4f',
    errorText: '#f07a7f',
    errorSolidText: '#0d090a',

    // 命定システム
    affection: '#c04b61',
    affectionBg: 'rgba(192, 75, 97, 0.28)',
    affectionText: '#e29aa6',
    tagPresent: 'rgba(72, 158, 98, 0.2)',
    tagPresentText: '#82c49a',
    tagContract: 'rgba(196, 56, 76, 0.24)',
    tagContractText: '#e29aa2',

    // 登神長階
    ascensionElement: 'rgba(78, 128, 196, 0.16)',
    ascensionPower: 'rgba(216, 132, 36, 0.16)',
    ascensionLaw: 'rgba(156, 72, 112, 0.18)',

    // 通貨
    currencyGold: '#f2c653',
    currencySilver: '#c6c0c4',
    currencyCopper: '#b26d3a',
  },
};

/**
 * ディープインディゴテーマ
 * 深遠で神秘的な魔法の雰囲気
 */
const IndigoTheme: Theme = {
  id: 'indigo',
  name: 'ディープインディゴ',
  colors: {
    // ウィンドウコンテナ
    windowBg: '#0d1322',
    windowBorder: '#2a3f66',

    // タイトルバー
    titleBarBg: '#141d33',
    titleBarText: '#d4dff2',
    titleBarIcon: '#8aa3d4',
    titleBarBtnHover: 'rgba(138, 163, 212, 0.18)',

    // Tab バー
    tabBarBg: '#111828',
    tabText: '#9aaad0',
    tabActiveText: '#e0ecff',
    tabIndicator: '#5a78c6',
    tabHoverBg: 'rgba(90, 120, 198, 0.16)',

    // コンテンツエリア
    contentBg: '#121a2a',
    cardBg: '#182236',
    cardBorder: '#2c3f5e',
    surfaceMuted: 'color-mix(in srgb, var(--theme-window-bg) 70%, var(--theme-card-bg) 30%)',
    overlayBg: 'color-mix(in srgb, var(--theme-window-bg) 56%, transparent)',

    // テキスト色
    textPrimary: '#dbe6f7',
    textSecondary: '#aabbd8',
    textMuted: '#8196b9',

    // リソースバー
    resourceHp: '#b8423c',
    resourceMp: '#3b6fd0',
    resourceSp: '#3d7d64',
    resourceExp: '#c0913a',
    resourceText: '#c7d4f0',

    // 品質色
    qualityCommon: '#d5e0f2',
    qualityUnique: '#d7a35b',
    qualityMythic: '#CE83A2',
    qualityLegendary: '#e1c36d',
    qualityEpic: '#B89DFC',
    qualityRare: '#739AD9',
    qualityUncommon: '#64A681',

    // インタラクション状態
    primaryBg: '#3c5fb8',
    primaryText: '#eef4ff',
    success: '#4a9a6a',
    warning: '#d1a343',
    error: '#c65045',
    errorText: '#ee776b',
    errorSolidText: '#fff',

    // 命定システム
    affection: '#6b58c3',
    affectionBg: 'rgba(107, 88, 195, 0.28)',
    affectionText: '#a595e0',
    tagPresent: 'rgba(74, 164, 112, 0.2)',
    tagPresentText: '#7fc6a2',
    tagContract: 'rgba(170, 88, 164, 0.22)',
    tagContractText: '#d2a0d0',

    // 登神長階
    ascensionElement: 'rgba(76, 146, 230, 0.18)',
    ascensionPower: 'rgba(236, 170, 64, 0.16)',
    ascensionLaw: 'rgba(146, 88, 202, 0.18)',

    // 通貨
    currencyGold: '#f1cf6a',
    currencySilver: '#b7c1cc',
    currencyCopper: '#b07a4a',
  },
};

/**
 * ブロンズゴールドテーマ
 * 華麗で王室的、金属の質感
 */
const BronzeTheme: Theme = {
  id: 'bronze',
  name: 'ブロンズゴールド',
  colors: {
    // ウィンドウコンテナ
    windowBg: '#14160f',
    windowBorder: '#6c6134',

    // タイトルバー
    titleBarBg: '#1d2115',
    titleBarText: '#f2e5bf',
    titleBarIcon: '#c8b06a',
    titleBarBtnHover: 'rgba(200, 176, 106, 0.18)',

    // Tab バー
    tabBarBg: '#181c12',
    tabText: '#c1b082',
    tabActiveText: '#f9edc8',
    tabIndicator: '#9a7f2f',
    tabHoverBg: 'rgba(154, 127, 47, 0.18)',

    // コンテンツエリア
    contentBg: '#171a12',
    cardBg: '#212518',
    cardBorder: '#4f4b2a',
    surfaceMuted: 'color-mix(in srgb, var(--theme-window-bg) 69%, var(--theme-card-bg) 31%)',
    overlayBg: 'color-mix(in srgb, var(--theme-window-bg) 55%, transparent)',

    // テキスト色
    textPrimary: '#f1e4c3',
    textSecondary: '#cbb486',
    textMuted: '#aa956d',

    // リソースバー
    resourceHp: '#b23c2f',
    resourceMp: '#335aa2',
    resourceSp: '#377551',
    resourceExp: '#b98a2b',
    resourceText: '#e2d2a8',

    // 品質色
    qualityCommon: '#e3d5b2',
    qualityUnique: '#d39b42',
    qualityMythic: '#D68296',
    qualityLegendary: '#e2b858',
    qualityEpic: '#A493D8',
    qualityRare: '#739CD3',
    qualityUncommon: '#64A87D',

    // インタラクション状態
    primaryBg: '#8d6a1f',
    primaryText: '#fff4dc',
    success: '#48925f',
    warning: '#d49a2f',
    error: '#bf4533',
    errorText: '#e97862',
    errorSolidText: '#fff',

    // 命定システム
    affection: '#a85e44',
    affectionBg: 'rgba(168, 94, 68, 0.26)',
    affectionText: '#d0a57d',
    tagPresent: 'rgba(68, 148, 92, 0.2)',
    tagPresentText: '#83be98',
    tagContract: 'rgba(178, 64, 64, 0.22)',
    tagContractText: '#d59a94',

    // 登神長階
    ascensionElement: 'rgba(66, 128, 206, 0.16)',
    ascensionPower: 'rgba(220, 160, 36, 0.18)',
    ascensionLaw: 'rgba(146, 82, 180, 0.16)',

    // 通貨
    currencyGold: '#e6c04a',
    currencySilver: '#bdb8b0',
    currencyCopper: '#a8743e',
  },
};

/**
 * 桜パープルテーマ
 * 夢幻的でロマンチック、かわいいスタイル
 */
const SakuraTheme: Theme = {
  id: 'sakura',
  name: '桜パープル',
  colors: {
    // ウィンドウコンテナ
    windowBg: '#1b1016',
    windowBorder: '#6a3a52',

    // タイトルバー
    titleBarBg: '#291820',
    titleBarText: '#f1d7e2',
    titleBarIcon: '#cf8faf',
    titleBarBtnHover: 'rgba(207, 143, 175, 0.18)',

    // Tab バー
    tabBarBg: '#22131b',
    tabText: '#c9a0b8',
    tabActiveText: '#f8ddeb',
    tabIndicator: '#c06a95',
    tabHoverBg: 'rgba(192, 106, 149, 0.16)',

    // コンテンツエリア
    contentBg: '#1f141b',
    cardBg: '#2a1a23',
    cardBorder: '#563345',
    surfaceMuted: 'color-mix(in srgb, var(--theme-window-bg) 67%, var(--theme-card-bg) 33%)',
    overlayBg: 'color-mix(in srgb, var(--theme-window-bg) 54%, transparent)',

    // テキスト色
    textPrimary: '#f2dce7',
    textSecondary: '#d0adc2',
    textMuted: '#a27a90',

    // リソースバー
    resourceHp: '#c3516b',
    resourceMp: '#5a6fd2',
    resourceSp: '#4d9a76',
    resourceExp: '#c28b52',
    resourceText: '#e7c6d6',

    // 品質色
    qualityCommon: '#e6cddc',
    qualityUnique: '#d99a69',
    qualityMythic: '#D27C9D',
    qualityLegendary: '#e0b56a',
    qualityEpic: '#AE88D7',
    qualityRare: '#7796D9',
    qualityUncommon: '#64A47E',

    // インタラクション状態
    primaryBg: '#a44875',
    primaryText: '#fff0f8',
    success: '#4fa070',
    warning: '#d3a44a',
    error: '#d14a69',
    errorText: '#ef7190',
    errorSolidText: '#100a0d',

    // 命定システム
    affection: '#c56a9a',
    affectionBg: 'rgba(197, 106, 154, 0.28)',
    affectionText: '#e5aec8',
    tagPresent: 'rgba(96, 176, 120, 0.2)',
    tagPresentText: '#8ac7a8',
    tagContract: 'rgba(206, 84, 138, 0.22)',
    tagContractText: '#e4a2c0',

    // 登神長階
    ascensionElement: 'rgba(110, 150, 230, 0.16)',
    ascensionPower: 'rgba(240, 160, 80, 0.16)',
    ascensionLaw: 'rgba(178, 88, 206, 0.18)',

    // 通貨
    currencyGold: '#f2c85a',
    currencySilver: '#c8c3d0',
    currencyCopper: '#b57a64',
  },
};

/**
 * 墨黒テーマ
 * ミニマルでモダン、高コントラスト
 */
const ObsidianTheme: Theme = {
  id: 'obsidian',
  name: '墨黒',
  colors: {
    // ウィンドウコンテナ
    windowBg: '#15171c',
    windowBorder: '#323846',

    // タイトルバー
    titleBarBg: '#1a1d24',
    titleBarText: '#f3f5f8',
    titleBarIcon: '#b9c0cc',
    titleBarBtnHover: 'rgba(255, 255, 255, 0.08)',

    // Tab バー
    tabBarBg: '#171a21',
    tabText: '#a6afbd',
    tabActiveText: '#f4f7fb',
    tabIndicator: '#8f9fff',
    tabHoverBg: 'rgba(255, 255, 255, 0.06)',

    // コンテンツエリア
    contentBg: '#12151b',
    cardBg: '#1b1f27',
    cardBorder: '#2c3340',
    surfaceMuted: 'color-mix(in srgb, var(--theme-window-bg) 74%, var(--theme-card-bg) 26%)',
    overlayBg: 'color-mix(in srgb, var(--theme-window-bg) 60%, transparent)',

    // テキスト色
    textPrimary: '#f3f5f8',
    textSecondary: '#c1c8d4',
    textMuted: '#8f98a8',

    // リソースバー
    resourceHp: '#ff5f57',
    resourceMp: '#5b8cff',
    resourceSp: '#35c98a',
    resourceExp: '#f0b84b',
    resourceText: '#f3f5f8',

    // 品質色
    qualityCommon: '#c9d2e0',
    qualityUnique: '#f09f4d',
    qualityMythic: '#E87292',
    qualityLegendary: '#e5c166',
    qualityEpic: '#A885F9',
    qualityRare: '#5d97ff',
    qualityUncommon: '#56bf7b',

    // インタラクション状態
    primaryBg: '#8f9fff',
    primaryText: '#10131a',
    success: '#35c98a',
    warning: '#f0b84b',
    error: '#ff6d6d',
    errorText: '#ff6d6d',
    errorSolidText: '#10131a',

    // 命定システム
    affection: '#ff6f91',
    affectionBg: 'rgba(255, 111, 145, 0.18)',
    affectionText: '#ffb2c1',
    tagPresent: 'rgba(53, 201, 138, 0.16)',
    tagPresentText: '#7ce3b4',
    tagContract: 'rgba(255, 111, 145, 0.16)',
    tagContractText: '#ffb0c0',

    // 登神長階
    ascensionElement: 'rgba(91, 140, 255, 0.12)',
    ascensionPower: 'rgba(240, 184, 75, 0.12)',
    ascensionLaw: 'rgba(154, 114, 248, 0.12)',

    // 通貨
    currencyGold: '#f5c24f',
    currencySilver: '#d4dae4',
    currencyCopper: '#d18b62',
  },
};

/**
 * クリーム羊皮紙テーマ（ライト）
 * 明るく古典的なレトロ紙の質感
 */
const IvoryTheme: Theme = {
  id: 'ivory',
  name: 'クリーム羊皮紙',
  colors: {
    // ウィンドウコンテナ
    windowBg: '#f1e8dc',
    windowBorder: '#c3a97c',

    // タイトルバー
    titleBarBg: '#e4d6c4',
    titleBarText: '#443220',
    titleBarIcon: '#745738',
    titleBarBtnHover: 'rgba(116, 87, 56, 0.12)',

    // Tab バー
    tabBarBg: '#eadfce',
    tabText: '#725944',
    tabActiveText: '#372615',
    tabIndicator: '#936526',
    tabHoverBg: 'rgba(176, 131, 67, 0.12)',

    // コンテンツエリア
    contentBg: '#ede2d2',
    cardBg: '#f5efe4',
    cardBorder: '#cdbb9b',
    surfaceMuted: 'color-mix(in srgb, var(--theme-window-bg) 64%, var(--theme-card-bg) 36%)',
    overlayBg: 'color-mix(in srgb, var(--theme-window-bg) 52%, transparent)',

    // テキスト色
    textPrimary: '#2b2116',
    textSecondary: '#5a4836',
    textMuted: '#6f5a48',

    // リソースバー
    resourceHp: '#8f2f24',
    resourceMp: '#1f4e9a',
    resourceSp: '#1f5e3c',
    resourceExp: '#8a5a1f',
    resourceText: '#f8f4ec',

    // 品質色
    qualityCommon: '#6b6258',
    qualityUnique: '#855716',
    qualityMythic: '#A33852',
    qualityLegendary: '#785A11',
    qualityEpic: '#6e4ab4',
    qualityRare: '#2A5FA2',
    qualityUncommon: '#296B41',

    // インタラクション状態
    primaryBg: '#b58a4a',
    primaryText: '#2b2116',
    success: '#1f5e3c',
    warning: '#8a6422',
    error: '#8f2f23',
    errorText: '#8f2f23',
    errorSolidText: '#fff',

    // 命定システム
    affection: '#b35b6d',
    affectionBg: 'rgba(179, 91, 109, 0.18)',
    affectionText: '#6f2d3a',
    tagPresent: 'rgba(56, 140, 90, 0.16)',
    tagPresentText: '#1f5a3a',
    tagContract: 'rgba(176, 64, 92, 0.16)',
    tagContractText: '#7a2543',

    // 登神長階
    ascensionElement: 'rgba(44, 104, 176, 0.14)',
    ascensionPower: 'rgba(198, 122, 38, 0.14)',
    ascensionLaw: 'rgba(118, 70, 178, 0.14)',

    // 通貨
    currencyGold: '#80600d',
    currencySilver: '#8a8a8a',
    currencyCopper: '#a46a34',
  },
};

/**
 * ミストパープルテーマ（ライト）
 * 淡い霧、柔らかな紫、低彩度の雰囲気
 */
const MistyLilacTheme: Theme = {
  id: 'misty-lilac',
  name: 'ミストパープル',
  colors: {
    // ウィンドウコンテナ
    windowBg: '#F1EDF6',
    windowBorder: '#8574A3',

    // タイトルバー
    titleBarBg: '#D5CCE2',
    titleBarText: '#41374C',
    titleBarIcon: '#635C6F',
    titleBarBtnHover: 'rgba(112, 88, 166, 0.12)',

    // Tab バー
    tabBarBg: '#ECE6F2',
    tabText: '#635C6F',
    tabActiveText: '#41374C',
    tabIndicator: '#7255A8',
    tabHoverBg: 'rgba(114, 85, 168, 0.12)',

    // コンテンツエリア
    contentBg: '#EFEAF5',
    cardBg: '#F6F2FA',
    cardBorder: '#C8C1D6',
    surfaceMuted: 'color-mix(in srgb, var(--theme-window-bg) 62%, var(--theme-card-bg) 38%)',
    overlayBg: 'color-mix(in srgb, var(--theme-window-bg) 50%, transparent)',

    // テキスト色
    textPrimary: '#3a3145',
    textSecondary: '#5a5368',
    textMuted: '#544c62',

    // リソースバー
    resourceHp: '#b02337',
    resourceMp: '#2559b8',
    resourceSp: '#1f7a45',
    resourceExp: '#a66f14',
    resourceText: '#faf7ff',

    // 品質色
    qualityCommon: '#5b5468',
    qualityUnique: '#875A19',
    qualityMythic: '#BA297A',
    qualityLegendary: '#7B5D11',
    qualityEpic: '#734EB9',
    qualityRare: '#2563C6',
    qualityUncommon: '#216F40',

    // インタラクション状態
    primaryBg: '#7A5CB3',
    primaryText: '#fbf8ff',
    success: '#1f7a45',
    warning: '#8f6219',
    error: '#b02337',
    errorText: '#b02337',
    errorSolidText: '#fff',

    // 命定システム
    affection: '#F05CB2',
    affectionBg: 'rgba(240, 92, 178, 0.22)',
    affectionText: '#4a3f5c',
    tagPresent: 'rgba(46, 153, 87, 0.16)',
    tagPresentText: '#155243',
    tagContract: 'rgba(217, 47, 69, 0.16)',
    tagContractText: '#8e1f5e',

    // 登神長階
    ascensionElement: 'rgba(49, 115, 217, 0.14)',
    ascensionPower: 'rgba(185, 137, 45, 0.14)',
    ascensionLaw: 'rgba(117, 88, 171, 0.14)',

    // 通貨
    currencyGold: '#886015',
    currencySilver: '#6F667A',
    currencyCopper: '#8C7BAB',
  },
};

/** すべてのプリセットテーマ */
export const ThemePresets: Record<ThemePresetId, Theme> = {
  parchment: ParchmentTheme,
  crimson: CrimsonTheme,
  indigo: IndigoTheme,
  bronze: BronzeTheme,
  sakura: SakuraTheme,
  obsidian: ObsidianTheme,
  ivory: IvoryTheme,
  'misty-lilac': MistyLilacTheme,
};

/** デフォルトテーマ */
export const DefaultTheme = ParchmentTheme;

/** テーマ一覧（セレクタ用） */
export const ThemeList: Array<{ id: ThemePresetId; name: string }> = [
  { id: 'parchment', name: '羊皮紙' },
  { id: 'crimson', name: 'ダークワイン' },
  { id: 'indigo', name: 'ディープインディゴ' },
  { id: 'bronze', name: 'ブロンズゴールド' },
  { id: 'sakura', name: '桜パープル' },
  { id: 'obsidian', name: '墨黒' },
  { id: 'ivory', name: 'クリーム羊皮紙' },
  { id: 'misty-lilac', name: 'ミストパープル' },
];
