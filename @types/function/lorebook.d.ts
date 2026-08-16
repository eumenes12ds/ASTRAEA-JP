/** @deprecated 内蔵ライブラリ「ワールドブック強制用推奨グローバル設定」を使用してください */
type LorebookSettings = {
  selected_global_lorebooks: string[];
  scan_depth: number;
  context_percentage: number;
  budget_cap: number;
  min_activations: number;
  max_depth: number;
  max_recursion_steps: number;
  insertion_strategy: 'evenly' | 'character_first' | 'global_first';
  include_names: boolean;
  recursive: boolean;
  case_sensitive: boolean;
  match_whole_words: boolean;
  use_group_scoring: boolean;
  overflow_alert: boolean;
}

/** @deprecated 内蔵ライブラリ「ワールドブック強制用推奨グローバル設定」を使用してください */
declare function getLorebookSettings(): LorebookSettings;
/** @deprecated 内蔵ライブラリ「ワールドブック強制用推奨グローバル設定」を使用してください */
declare function setLorebookSettings(settings: Partial<LorebookSettings>): void;

/** @deprecated `getWorldbookNames` を使用してください */
declare function getLorebooks(): string[];

/** @deprecated `deleteWorldbook` を使用してください */
declare function deleteLorebook(lorebook: string): Promise<boolean>;

/** @deprecated `createWorldbook` を使用してください */
declare function createLorebook(lorebook: string): Promise<boolean>;

/** @deprecated `getCharWorldbookNames` を使用してください */
type CharLorebooks = {
  primary: string | null;
  additional: string[];
}

/** @deprecated `getCharWorldbookNames` を使用してください */
type GetCharLorebooksOption = {
  name?: string;
  type?: 'all' | 'primary' | 'additional';
}

/** @deprecated `getCharWorldbookNames` を使用してください */
declare function getCharLorebooks({ name, type }?: GetCharLorebooksOption): CharLorebooks;

/** @deprecated `getCharWorldbookNames` を使用してください */
declare function getCurrentCharPrimaryLorebook(): string | null;

/** @deprecated `rebindCharWorldbook` を使用してください */
declare function setCurrentCharLorebooks(lorebooks: Partial<CharLorebooks>): Promise<void>;

/** @deprecated `getChatWorldbook` を使用してください */
declare function getChatLorebook(): string | null;

/** @deprecated `rebindChatWorldbook` を使用してください */
declare function setChatLorebook(lorebook: string | null): Promise<void>;

/** @deprecated `getOrCreateChatWorldbook` を使用してください */
declare function getOrCreateChatLorebook(lorebook?: string): Promise<string>;
