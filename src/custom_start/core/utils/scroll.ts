import { nextTick } from 'vue';

/**
 * iframe の位置までスクロール（親ページを iframe の表示領域までスクロールさせる）
 * モーダル表示時にユーザーがモーダル内容を確実に見られるようにする
 */
export const scrollToIframe = (): void => {
  nextTick(() => {
    const frameElement = window.frameElement;
    if (frameElement) {
      frameElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
};
