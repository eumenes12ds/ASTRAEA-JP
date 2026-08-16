/**
 * 数値フォーマット用ユーティリティ
 * 大きな数値を見やすい形式に変換する（日本語・英語共通）
 */

/** 数値単位の設定 */
const NumberUnits = [
  { threshold: 1_0000_0000_0000, suffix: '兆', divisor: 1_0000_0000_0000 }, // 一兆
  { threshold: 1_0000_0000, suffix: '億', divisor: 1_0000_0000 },
  { threshold: 1_0000, suffix: '万', divisor: 1_0000 },
] as const;

/**
 * 小数末尾の余分なゼロを除去
 * @param numStr - 数値文字列
 * @returns 処理後の文字列
 */
function trimTrailingZeros(numStr: string): string {
  if (!numStr.includes('.')) return numStr;
  return numStr.replace(/\.?0+$/, '');
}

/**
 * 金銭数値を読みやすい形式にフォーマット
 * - 10000 未満: 元の数値を千分位で表示（例: 1,234 や -1,234）
 * - 10000 以上: 簡略形式 + 千分位の元値（例: 1.5万 (15,000)）
 *
 * @param value - 金銭数値（負数対応）
 * @returns フォーマット後の文字列
 */
export function formatMoney(value: number): string {
  if (!Number.isFinite(value)) return '0';

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const originalFormatted = value.toLocaleString('en-US');

  // 適切な単位を探す
  for (const unit of NumberUnits) {
    if (absValue >= unit.threshold) {
      const divided = absValue / unit.divisor;
      // 小数第2位まで保持し、末尾の0を除去
      const formatted = trimTrailingZeros(divided.toFixed(2));
      return `${sign}${formatted}${unit.suffix} (${originalFormatted})`;
    }
  }

  // 万未満の数値は千分位形式で表示
  return originalFormatted;
}
