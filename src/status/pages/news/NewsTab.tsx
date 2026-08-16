import _ from 'lodash';
import { FC, useMemo } from 'react';
import { useEditorSettingStore } from '../../core/stores';
import { Card, EditableField, EmptyHint, IconTitle } from '../../shared/components';
import { withMvuData, WithMvuDataProps } from '../../shared/hoc';
import styles from './NewsTab.module.scss';

/** ニュースカテゴリ設定 */
const NewsCategories = [
  {
    key: 'アスタリア速報',
    icon: 'fa-solid fa-newspaper',
    colorClassName: 'categoryAccentNews',
  },
  {
    key: '酒場の掲示板',
    icon: 'fa-solid fa-clipboard',
    colorClassName: 'categoryAccentBoard',
  },
  {
    key: '午後のお茶会',
    icon: 'fa-solid fa-mug-hot',
    colorClassName: 'categoryAccentTea',
  },
] as const;

type NewsCategoryKey = (typeof NewsCategories)[number]['key'];

type NewsFeedEntry = {
  categoryKey: NewsCategoryKey;
  icon: string;
  colorClassName: string;
  title: string;
  content: string;
};

/**
 * ニュースページの内容コンポーネント
 */
const NewsTabContent: FC<WithMvuDataProps> = ({ data }) => {
  const { editEnabled } = useEditorSettingStore();
  const news = data.ニュース ?? {};

  const feedEntries = useMemo<NewsFeedEntry[]>(() => {
    return NewsCategories.flatMap(category => {
      const categoryData = _.get(news, category.key, {}) as Record<string, string>;

      return (_.entries(categoryData) as [string, string][])
        .filter(([, content]) => Boolean(content?.trim()))
        .map(([title, content]) => ({
          categoryKey: category.key,
          icon: category.icon,
          colorClassName: category.colorClassName,
          title,
          content,
        }));
    });
  }, [news]);

  if (feedEntries.length === 0) {
    return (
      <div className={styles.newsTab}>
        <Card className={styles.emptyCard} bodyClassName={styles.emptyCardBody}>
          <EmptyHint className={styles.emptyHint} icon="fa-solid fa-newspaper" text="ニュースなし" />
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.newsTab}>
      <div className={styles.newsFeed}>
        {feedEntries.map(entry => {
          const fieldPath = `ニュース.${entry.categoryKey}.${entry.title}`;

          return (
            <Card
              key={`${entry.categoryKey}-${entry.title}`}
              className={styles.newsFeedCard}
              bodyClassName={styles.newsFeedCardBody}
            >
              <div className={styles.newsFeedMeta}>
                <span className={`${styles.newsCategoryBadge} ${styles[entry.colorClassName]}`}>
                  <i className={entry.icon} />
                  <span>{entry.categoryKey}</span>
                </span>
              </div>

              <div className={styles.newsFeedTitleRow}>
                <IconTitle text={entry.title} className={styles.newsFeedTitle} as="span" />
              </div>

              <div className={styles.newsFeedContent}>
                {editEnabled ? (
                  <EditableField
                    path={fieldPath}
                    value={entry.content}
                    type="textarea"
                    className={styles.editableContent}
                  />
                ) : (
                  <span className={styles.newsFeedText}>{entry.content}</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

/**
 * ニュースページコンポーネント（HOC でラップ）
 */
export const NewsTab = withMvuData({ baseClassName: styles.newsTab })(NewsTabContent);
