/**
 * シナリオ一覧の設定
 */
export const scenarios = [
  { index: 1, label: '私の物語は私自身の手で紡ぐ' },
  { index: 2, label: '《糸と天国と彼岸花》' },
];

/**
 * シナリオの切り替え（スワイプ）
 */
export async function switchSwipe(swipeId: number): Promise<boolean> {
  if (!Number.isInteger(swipeId) || swipeId < 0) {
    console.warn('Invalid scenario index.');
    return false;
  }

  const greeting = getChatMessages(0, { include_swipes: true })[0];
  if (!greeting || typeof greeting.swipes?.[swipeId] !== 'string') {
    console.error(`Scenario ${swipeId} is unavailable.`);
    return false;
  }
  if (greeting.swipe_id === swipeId) return true;

  // 初回入力前の会話はサーバーに保存されない場合がある。
  // 再読込せず、助手の API で本文・変数・表示を同じスワイプに切り替える。
  await setChatMessages([{ message_id: 0, swipe_id: swipeId }], { refresh: 'affected' });
  return true;
}
