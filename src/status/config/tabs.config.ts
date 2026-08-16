import type { TabItem } from '../layout';

/**
 * Tab 設定
 * 順序：クエスト -> 状態 -> 所持品 -> 命定 -> ニュース
 */
export const TabsConfig: TabItem[] = [
  {
    id: 'quests',
    label: 'クエスト',
    icon: 'fa-solid fa-scroll',
  },
  {
    id: 'status',
    label: 'ステータス',
    icon: 'fa-solid fa-user',
  },
  {
    id: 'items',
    label: '所持品',
    icon: 'fa-solid fa-briefcase',
  },
  {
    id: 'destiny',
    label: '命定',
    icon: 'fa-solid fa-star',
  },
  {
    id: 'news',
    label: 'ニュース',
    icon: 'fa-solid fa-newspaper',
  },
  {
    id: 'map',
    label: '地図',
    icon: 'fa-solid fa-map',
  },
];

/** デフォルトでアクティブな Tab */
export const DefaultTabId = 'status';
