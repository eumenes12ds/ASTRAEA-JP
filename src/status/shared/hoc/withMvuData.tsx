import { ComponentType, FC, ReactElement } from 'react';
import { useMvuDataStore } from '../../core/stores';
import type { StatData } from '../../core/types';

/**
 * HOC Props インターフェース
 * ラップされたコンポーネントは data を prop として受け取る
 */
export interface WithMvuDataProps {
  data: StatData;
}

/**
 * HOC 設定選択肢
 */
export interface WithMvuDataOptions {
  /** ベーススタイルクラス名。loading/error/empty 状態のスタイルクラス生成に使用 */
  baseClassName?: string;
  /** カスタム loading 描画 */
  renderLoading?: (className?: string) => ReactElement;
  /** カスタム error 描画 */
  renderError?: (error: string, className?: string) => ReactElement;
  /** カスタム empty 描画 */
  renderEmpty?: (className?: string) => ReactElement;
}

/**
 * 高階コンポーネント: コンポーネントに MVU データを注入し、読み込み状態を処理
 * @param options - HOC 設定選択肢
 * @returns コンポーネントを受け取り、拡張されたコンポーネントを返す関数
 *
 * @example
 * ```tsx
 * // 基本の使い方
 * const MyTab = withMvuData({ baseClassName: 'myTab' })(MyTabContent);
 *
 * // MyTabContent コンポーネント定義
 * const MyTabContent: FC<WithMvuDataProps> = ({ data }) => {
 *   // data を直接使用し、loading/error 状態の処理は不要
 *   return <div>{data.任意のフィールド}</div>;
 * };
 *
 * // カスタム描画
 * const MyTab = withMvuData({
 *   baseClassName: 'myTab',
 *   renderLoading: (cls) => <div className={cls}>読み込み中...</div>
 * })(MyTabContent);
 * ```
 */
export function withMvuData(options: WithMvuDataOptions = {}) {
  const { baseClassName = '', renderLoading, renderError, renderEmpty } = options;

  return function <P extends WithMvuDataProps>(
    WrappedComponent: ComponentType<P>,
  ): FC<Omit<P, keyof WithMvuDataProps>> {
    const WithMvuDataComponent: FC<Omit<P, keyof WithMvuDataProps>> = props => {
      const { data, loading, error } = useMvuDataStore();

      // 状態に関連するスタイルクラス名を生成
      const getStateClassName = (state: 'Loading' | 'Error' | 'Empty') => {
        return baseClassName ? `${baseClassName} ${baseClassName}${state}` : '';
      };

      // loading 状態を処理
      if (loading) {
        if (renderLoading) {
          return renderLoading(getStateClassName('Loading'));
        }
        return <div className={getStateClassName('Loading')}>Loading...</div>;
      }

      // error 状態を処理
      if (error) {
        if (renderError) {
          return renderError(error, getStateClassName('Error'));
        }
        return <div className={getStateClassName('Error')}>Error: {error}</div>;
      }

      // empty 状態を処理
      if (!data) {
        if (renderEmpty) {
          return renderEmpty(getStateClassName('Empty'));
        }
        return <div className={getStateClassName('Empty')}>No data available.</div>;
      }

      // データ準備完了。ラップされたコンポーネントを描画
      return <WrappedComponent {...(props as P)} data={data} />;
    };

    // コンポーネントの表示名を設定し、デバッグを容易に
    WithMvuDataComponent.displayName = `withMvuData(${
      WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;

    return WithMvuDataComponent;
  };
}
