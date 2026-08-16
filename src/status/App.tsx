import { FC, useEffect, useMemo, useState } from 'react';
import { DefaultTabId, TabsConfig } from './config/tabs.config';
import { useEditorSettingStore, useMvuDataStore, useThemeStore } from './core/stores';
import { ContentArea, TabBar, TitleBar, Window } from './layout';
import { DestinyTab, ItemsTab, MapTab, NewsTab, QuestsTab, SettingsTab, StatusTab } from './pages';

const App: FC = () => {
  const [activeTab, setActiveTab] = useState(DefaultTabId);
  const [showSettings, setShowSettings] = useState(false);

  const { loadSettings } = useEditorSettingStore();
  const { loadTheme } = useThemeStore();
  const { data } = useMvuDataStore();

  useEffect(() => {
    loadSettings();
    loadTheme();
  }, [loadSettings, loadTheme]);

  /** バッジ付きの Tab 設定 */
  const tabsWithBadge = useMemo(() => {
    const questEntries = Object.entries(data?.タスク一覧 ?? {});
    const questCount = questEntries.filter(
      ([, quest]) => (quest.状態?.trim() || '') !== '完了',
    ).length;
    return TabsConfig.map(tab => (tab.id === 'quests' ? { ...tab, badge: questCount } : tab));
  }, [data?.タスク一覧]);

  /**
   * 現在の Tab の内容を描画
   */
  const renderTabContent = () => {
    // 設定ページを表示する場合、設定を描画
    if (showSettings) {
      return <SettingsTab />;
    }

    // アクティブな Tab に応じて対応する内容を描画
    switch (activeTab) {
      case 'quests':
        return <QuestsTab />;
      case 'status':
        return <StatusTab />;
      case 'items':
        return <ItemsTab />;
      case 'destiny':
        return <DestinyTab />;
      case 'news':
        return <NewsTab />;
      case 'map':
        return <MapTab />;
      default:
        return <div className="placeholder">不明なページ</div>;
    }
  };

  /**
   * 設定ボタンのクリック
   */
  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
  };

  /**
   * Tab の切り替え
   */
  const handleTabChange = (tabId: string) => {
    setShowSettings(false);
    setActiveTab(tabId);
  };

  return (
    <Window>
      <TitleBar onSettingsClick={handleSettingsClick} />
      <TabBar
        tabs={tabsWithBadge}
        activeTab={showSettings ? '' : activeTab}
        onTabChange={handleTabChange}
      />
      <ContentArea>{renderTabContent()}</ContentArea>
    </Window>
  );
};

export default App;
