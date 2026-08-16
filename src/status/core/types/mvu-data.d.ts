/**
 * MVU データタイプ定義
 * schema から導出し、タイプの同期を維持
 */
import type { Schema } from '@/data_schema/schema';

/**
 * 完全な stat_data タイプ
 */
export type StatData = z.infer<typeof Schema>;

/**
 * 世界情報
 */
export type WorldInfo = StatData['世界'];

/**
 * タスク情報
 */
export type Task = StatData['タスク一覧'][string];

/**
 * 主人公情報
 */
export type PlayerData = StatData['主人公'];

/**
 * 運命ポイント
 */
export type DestinyPoints = StatData['運命ポイント'];

/**
 * 関係一覧情報
 */
export type Partner = StatData['関係一覧'][string];

/**
 * ニュース情報
 */
export type News = StatData['ニュース'];

/**
 * 登神長階情報
 */
export type Ascension = PlayerData['登神長階'];
