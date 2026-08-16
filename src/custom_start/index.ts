/**
 * アプリケーションのエントリファイル
 * Vue アプリの初期化、ルーターと状態管理のマウントを担当
 */
import './core/styles/index.scss';

import { createApp } from 'vue';

import App from './core/App.vue';
import { router } from './core/router';
import { pinia } from './core/store';

const app = createApp(App);

$(() => {
  app.use(pinia);
  app.use(router);
  app.mount('#app');
});
