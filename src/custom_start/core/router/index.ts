/**
 * ルーターモジュールのエントリ
 */
import { createMemoryHistory, createRouter } from 'vue-router';

import { routes } from './routes';

/**
 * ルーターインスタンスを作成・設定
 */
export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

// ルート設定と定数をエクスポート
export * from './routes';
