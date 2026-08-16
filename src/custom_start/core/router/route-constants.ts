/**
 * ルート定数モジュール
 * 循環依存を避けるための独立した定数定義
 */

/**
 * ステップメタ情報インターフェース
 */
export interface StepMeta {
  title: string;
  shortTitle: string;
  step: number;
}

/**
 * ステップ設定 - 単一のデータソース
 * ルート生成とステップナビゲーションに使用
 */
export const STEP_CONFIGS: StepMeta[] = [
  { title: '基本情報と属性', shortTitle: '情報/属性', step: 1 },
  { title: '装備とスキル', shortTitle: '装備/スキル', step: 2 },
  { title: 'パートナーと初期背景', shortTitle: 'パートナー/背景', step: 3 },
  { title: '確認と送信', shortTitle: '確認', step: 4 },
];

/**
 * ルート名定数
 */
export const ROUTE_NAMES = {
  LAYOUT: 'Layout',
  BASIC_INFO: 'BasicInfo',
  SELECTIONS: 'Selections',
  BACKGROUND: 'Background',
  CONFIRM: 'Confirm',
} as const;

/**
 * ルートパス定数
 */
export const ROUTE_PATHS = {
  ROOT: '/',
  BASIC: '/basic',
  SELECTIONS: '/selections',
  BACKGROUND: '/background',
  CONFIRM: '/confirm',
} as const;

/**
 * ステップからルート名へのマッピング
 */
export const STEP_TO_ROUTE: Record<number, string> = {
  1: ROUTE_NAMES.BASIC_INFO,
  2: ROUTE_NAMES.SELECTIONS,
  3: ROUTE_NAMES.BACKGROUND,
  4: ROUTE_NAMES.CONFIRM,
};

/**
 * ルート名からステップへのマッピング
 */
export const ROUTE_TO_STEP: Record<string, number> = {
  [ROUTE_NAMES.BASIC_INFO]: 1,
  [ROUTE_NAMES.SELECTIONS]: 2,
  [ROUTE_NAMES.BACKGROUND]: 3,
  [ROUTE_NAMES.CONFIRM]: 4,
};

/**
 * ステップ総数を取得
 */
export const TOTAL_STEPS = STEP_CONFIGS.length;
