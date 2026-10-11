import { FC } from 'react';
import { ThemeList } from '../../config/theme-presets';
import { useThemeStore } from '../../core/stores';
import { Card } from '../../shared/components';
import styles from './SettingsTab.module.scss';

/**
 * 設定ページコンポーネント
 */
export const SettingsTab: FC = () => {
  const { currentThemeId, setTheme, reset, saveTheme } = useThemeStore();

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
