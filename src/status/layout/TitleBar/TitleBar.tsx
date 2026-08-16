import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useMvuDataStore } from '../../core/stores';
import styles from './TitleBar.module.scss';

interface TitleBarProps {
  onSettingsClick?: () => void;
}

/**
 * タイトルバーコンポーネント
 * 世界情報と操作ボタンを表示
 */
export const TitleBar: FC<TitleBarProps> = ({ onSettingsClick }) => {
  const { data, refresh, loading } = useMvuDataStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenTarget, setFullscreenTarget] = useState<HTMLElement | null>(null);

  const worldInfo = data?.世界;

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    setFullscreenTarget(document.getElementById('status-window'));
  }, []);

  const isFullscreenSupported = useMemo(() => {
    if (typeof document === 'undefined' || !fullscreenTarget) {
      return false;
    }
    const element = fullscreenTarget as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
      mozRequestFullScreen?: () => Promise<void>;
    };
    return Boolean(
      document.fullscreenEnabled ||
      element.requestFullscreen ||
      element.webkitRequestFullscreen ||
      element.msRequestFullscreen ||
      element.mozRequestFullScreen,
    );
  }, [fullscreenTarget]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!fullscreenTarget) {
        setIsFullscreen(false);
        return;
      }
      const doc = document as Document & {
        webkitFullscreenElement?: Element | null;
        msFullscreenElement?: Element | null;
        mozFullScreenElement?: Element | null;
      };
      const activeElement =
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.msFullscreenElement ||
        doc.mozFullScreenElement;
      setIsFullscreen(activeElement === fullscreenTarget);
    };

    handleFullscreenChange();
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [fullscreenTarget]);

  const handleFullscreenToggle = useCallback(async () => {
    if (!fullscreenTarget) {
      return;
    }
    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void>;
      msExitFullscreen?: () => Promise<void>;
      mozCancelFullScreen?: () => Promise<void>;
      webkitFullscreenElement?: Element | null;
      msFullscreenElement?: Element | null;
      mozFullScreenElement?: Element | null;
    };
    const activeElement =
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.msFullscreenElement ||
      doc.mozFullScreenElement;

    if (activeElement) {
      if (activeElement !== fullscreenTarget) {
        return;
      }
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen();
      }
      return;
    }

    const element = fullscreenTarget as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
      mozRequestFullScreen?: () => Promise<void>;
    };

    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      await element.msRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      await element.mozRequestFullScreen();
    }
  }, [fullscreenTarget]);

  return (
    <div className={styles.titleBar}>
      {/* 世界情報 */}
      <div className={styles.info}>
        {worldInfo?.時間 && (
          <span className={styles.time}>
            <i className="fa-regular fa-clock" />
            {worldInfo.時間}
          </span>
        )}
        {worldInfo?.場所 && (
          <span className={styles.location}>
            <i className="fa-solid fa-location-dot" />
            {worldInfo.場所}
          </span>
        )}
      </div>

      {/* 操作ボタン */}
      <div className={styles.actions}>
        <button
          className={styles.btn}
          onClick={handleFullscreenToggle}
          disabled={!isFullscreenSupported}
          title={isFullscreen ? '全画面を終了' : '全画面に切り替え'}
        >
          <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`} />
        </button>
        <button
          className={styles.btn}
          onClick={() => refresh()}
          disabled={loading}
          title="データを更新"
        >
          <i className={`fa-solid fa-rotate-right ${loading ? 'fa-spin' : ''}`} />
        </button>
        <button className={styles.btn} onClick={onSettingsClick} title="設定">
          <i className="fa-solid fa-gear" />
        </button>
      </div>
    </div>
  );
};
