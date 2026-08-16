import type { Ascension as AscensionType } from '@/status/core/types/mvu-data';
import { FC } from 'react';
import { EditableField } from '../EditableField';
import styles from './Ascension.module.scss';

export interface AscensionProps {
  data?: AscensionType;
  /** コンパクトモードかどうか（パートナー詳細用） */
  compact?: boolean;
  /** 編集モードを有効にするかどうか */
  editEnabled?: boolean;
  /** データパスプレフィックス */
  pathPrefix?: string;
}

/** 単一ステージ項目の描画（要素/権能/法則） */
interface SectionConfig {
  data?: Record<string, Record<string, string>>;
  title: string;
  icon: string;
  itemClass: string;
}

/**
 * 登神長階コンポーネント
 * 主人公とパートナーの両方で再利用可能
 */
export const Ascension: FC<AscensionProps> = ({
  data,
  compact = false,
  editEnabled = false,
  pathPrefix,
}) => {
  if (!data?.有効化) {
    return <div className={styles.empty}>登神長階は未開放です</div>;
  }

  /** ステージブロックの描画（要素/権能/法則） */
  const renderSection = ({
    data: sectionData,
    title,
    icon,
    itemClass,
    sectionKey,
  }: SectionConfig & { sectionKey: string }) => {
    // データが空の場合は表示しない（schema でフィルタされた場合を含む）
    if (_.isEmpty(sectionData)) return null;

    return (
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <i className={icon} /> {title}
        </div>
        <div className={styles.items}>
          {_.map(sectionData, (details, name) => (
            <div key={name} className={`${styles.item} ${styles[itemClass]}`}>
              <div className={styles.itemName}>{name}</div>
              {editEnabled && pathPrefix ? (
                <div className={styles.itemDetails}>
                  <EditableField
                    path={`${pathPrefix}.${sectionKey}.${name}`}
                    value={details ?? {}}
                    type="keyvalue"
                  />
                </div>
              ) : (
                !_.isEmpty(details) && (
                  <div className={styles.itemDetails}>
                    {_.map(details, (value, key) => (
                      <div key={key} className={styles.detailRow}>
                        <span className={styles.detailKey}>{key}</span>
                        <span className={styles.detailValue}>{value}</span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.ascension} ${compact ? styles.compact : ''}`}>
      {/* 要素 */}
      {renderSection({
        data: data.要素,
        title: '要素',
        icon: 'fa-solid fa-atom',
        itemClass: 'itemElement',
        sectionKey: '要素',
      })}

      {/* 権能 */}
      {renderSection({
        data: data.権能,
        title: '権能',
        icon: 'fa-solid fa-fire',
        itemClass: 'itemPower',
        sectionKey: '権能',
      })}

      {/* 法則 */}
      {renderSection({
        data: data.法則,
        title: '法則',
        icon: 'fa-solid fa-scroll',
        itemClass: 'itemLaw',
        sectionKey: '法則',
      })}

      {/* 神位 */}
      {data.神位 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <i className="fa-solid fa-crown" /> 神位
          </div>
          <div className={styles.godInfo}>
            {editEnabled && pathPrefix ? (
              <EditableField path={`${pathPrefix}.神位`} value={data.神位} type="text" />
            ) : (
              <div className={styles.godTitle}>{data.神位}</div>
            )}
          </div>
        </div>
      )}

      {/* 神国 */}
      {(data.神国?.名称 || data.神国?.説明) && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <i className="fa-solid fa-landmark" /> 神国
          </div>
          <div className={styles.godInfo}>
            {editEnabled && pathPrefix ? (
              <>
                <div className={styles.godInfoRow}>
                  <span className={styles.godInfoLabel}>名称:</span>
                  <EditableField
                    path={`${pathPrefix}.神国.名称`}
                    value={data.神国?.名称}
                    type="text"
                  />
                </div>
                <div className={styles.godInfoRow}>
                  <span className={styles.godInfoLabel}>説明:</span>
                  <EditableField
                    path={`${pathPrefix}.神国.説明`}
                    value={data.神国?.説明}
                    type="textarea"
                  />
                </div>
              </>
            ) : (
              <>
                {data.神国?.名称 && <div className={styles.godTitle}>{data.神国.名称}</div>}
                {data.神国?.説明 && <div className={styles.kingdomDesc}>{data.神国.説明}</div>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
