import { FC, ReactNode, useEffect } from 'react';
import { useMvuDataStore, useThemeStore } from '../../core/stores';
import styles from './Window.module.scss';

interface WindowProps {
  children: ReactNode;
}

/**
 * ウィンドウコンテナコンポーネント
 */
export const Window: FC<WindowProps> = ({ children }) => {
  const { loadTheme, applyCssVariables } = useThemeStore();
  const { refresh } = useMvuDataStore();

  useEffect(() => {
    // 初期化
    loadTheme();
    applyCssVariables();
    refresh();
  }, []);

  return (
    <div id="status-window" className={styles.statusWindow}>
      {children}
    </div>
  );
};
