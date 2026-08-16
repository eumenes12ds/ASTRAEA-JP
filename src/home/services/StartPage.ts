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
  if (typeof SillyTavern === 'undefined' || !SillyTavern.chat || SillyTavern.chat.length === 0) {
    console.warn('SillyTavern environment not detected. Action will not be executed.');
    return false;
  }

  const swipeIndex = swipeId;

  if (
    typeof SillyTavern.chat[0].swipe_id !== 'undefined' &&
    SillyTavern.chat[0].swipe_id !== swipeIndex
  ) {
    if (SillyTavern.chat[0].swipes && SillyTavern.chat[0].swipes.length > swipeIndex) {
      SillyTavern.chat[0].swipe_id = swipeIndex;
      SillyTavern.chat[0].mes = SillyTavern.chat[0].swipes[swipeIndex];
      await SillyTavern.saveChat();
      await SillyTavern.reloadCurrentChat();
      console.log(`Successfully switched to scenario (swipe_id: ${swipeIndex}).`);
      return true;
    } else {
      console.error(`Swipe index ${swipeIndex} is out of bounds or swipes array is missing.`);
      return false;
    }
  } else {
    console.log(`Scenario ${swipeIndex} is already selected or swipe data is unavailable.`);
    return true;
  }
}
