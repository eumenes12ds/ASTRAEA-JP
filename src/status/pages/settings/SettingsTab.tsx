import { FC } from 'react';
import { ThemeList } from '../../config/theme-presets';
import { useEditorSettingStore, useThemeStore } from '../../core/stores';
import { Card } from '../../shared/components';
import { ToggleEditor } from '../../shared/components/editors/ToggleEditor/ToggleEditor';
import styles from './SettingsTab.module.scss';

/**
 * 設定ページコンポーネント
 */
export const SettingsTab: FC = () => {
  const { currentThemeId, setTheme, reset, saveTheme } = useThemeStore();
  const { editEnabled, setEditEnabled, saveSettings } = useEditorSettingStore();

  const handleToggle = async (next: boolean) => {
    setEditEnabled(next);
    await saveSettings();
    toastr.success(next ? '編集を有効にしました' : '編集を無効にしました');
  };

  /** テーマ変更の処理 */
  const handleThemeChange = (themeId: string) => {
    setTheme(themeId as any);
  };

  /** 保存の処理 */
  const handleSave = async () => {
    await saveTheme();
    toastr.success('テーマを保存しました');
  };

  /** リセットの処理 */
  const handleReset = async () => {
    await reset();
    toastr.info('デフォルトテーマに戻しました');
  };

  return (
    <div className={styles.settingsTab}>
      {/* 編集設定 */}
      <div className={styles.editSettingBar}>
        <span className={styles.editSettingLabel}>データ編集を許可</span>
        <ToggleEditor
          value={editEnabled}
          onChange={handleToggle}
          labelOff="オフ"
          labelOn="オン"
          size="sm"
        />
      </div>

      <Card title="テーマ設定" className={styles.settingsTabTheme}>
        <div className={styles.themeSelector}>
          <div className={styles.themeSelectorLabel}>テーマを選択</div>
          <div className={styles.themeOptions}>
            {ThemeList.map(theme => (
              <button
                key={theme.id}
                className={`${styles.themeOption} ${currentThemeId === theme.id ? styles.themeOptionActive : ''}`}
                onClick={() => handleThemeChange(theme.id)}
              >
                <span className={styles.themePreview} data-theme={theme.id} />
                <span className={styles.themeName}>{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.themeActions}>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleReset}>
            デフォルトに戻す
          </button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>
            テーマを保存
          </button>
        </div>
      </Card>
    </div>
  );
};
