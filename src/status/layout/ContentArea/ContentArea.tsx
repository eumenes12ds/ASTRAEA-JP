import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { FC, ReactNode, useRef } from 'react';
import styles from './ContentArea.module.scss';

// GSAP React プラグインを登録
gsap.registerPlugin(useGSAP);

interface ContentAreaProps {
  children: ReactNode;
}

/**
 * コンテンツエリアコンポーネント
 * Tab コンテンツのコンテナ。GSAP のフェードインアニメーション付き
 */
export const ContentArea: FC<ContentAreaProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // useGSAP hook でフェードインアニメーションを実装し、クリーンアップを自動処理
  useGSAP(
    () => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out',
        },
      );
    },
    { dependencies: [children], scope: containerRef },
  );

  return (
    <div ref={containerRef} className={styles.contentArea}>
      {children}
    </div>
  );
};
