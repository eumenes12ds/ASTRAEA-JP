export {};

interface Prefetch {
  title: string;
  assets: string[];
}

const Settings = z.object({
  リソースプリロード: z.string().default(''),
});

const variable_option = { type: 'script', script_id: getScriptId() } as const;

function get_prefetches(): Prefetch[] {
  const settings = Settings.parse(getVariables(variable_option));
  insertVariables(settings, variable_option);

  const globalRegexes = getTavernRegexes({ type: 'global' });
  const characterRegexes = getTavernRegexes({ type: 'character', name: 'current' });
  const allRegexes = [...globalRegexes, ...characterRegexes];

  return _(allRegexes)
    .filter(regex => regex.enabled && regex.script_name.includes('プリロード-'))
    .map(regex => ({
      title: regex.script_name.replace('プリロード-', '').replaceAll(/【.+?】/gs, ''),
      content: regex.replace_string,
    }))
    .concat([{ title: 'スクリプト変数', content: settings.リソースプリロード }])
    .map(({ title, content }) => ({
      title,
      assets: content
        .split('\n')
        .map(asset => asset.trim())
        .filter(asset => !!asset),
    }))
    .value();
}

const CACHE_NAME = 'Astraea-cache-v1';

// 並行制御の設定
const CONCURRENCY_LIMIT = 4; // 同時に実行する最大リクエスト数
const BATCH_DELAY = 100; // バッチ間隔（ミリ秒）

/**
 * タスクを一括実行し、並行数を制限する
 * @param tasks タスク関数の配列
 * @param concurrency 最大並行数
 * @param delayBetweenBatches バッチ間隔
 */
const runWithConcurrency = async <T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
  delayBetweenBatches = 0,
): Promise<PromiseSettledResult<T>[]> => {
  const results: PromiseSettledResult<T>[] = [];
  let index = 0;

  const runNext = async (): Promise<void> => {
    while (index < tasks.length) {
      const currentIndex = index++;
      const task = tasks[currentIndex];
      try {
        const value = await task();
        results[currentIndex] = { status: 'fulfilled', value };
      } catch (reason) {
        results[currentIndex] = { status: 'rejected', reason };
      }
    }
  };

  // concurrency 個の並行ワーカーを起動する
  const workers = Array(Math.min(concurrency, tasks.length))
    .fill(null)
    .map(async (_, workerIndex) => {
      // 各ワーカーに初期遅延を追加して同時起動を避ける
      if (delayBetweenBatches > 0 && workerIndex > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches * workerIndex));
      }
      await runNext();
    });

  await Promise.all(workers);
  return results;
};

const cacheAsset = async (asset: string): Promise<void> => {
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(asset);
    if (cached) return;
    const response = await fetch(asset, { mode: 'cors' });
    if (response.ok) {
      await cache.put(asset, response.clone());
    }
  } catch (error) {
    console.warn('[ImagePreload] リソースのキャッシュに失敗:', asset, error);
  }
};

const preloadImage = (asset: string): Promise<void> => {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = asset;
  });
};

/**
 * 単一のリソースをプリロードしてキャッシュする
 */
const preloadAndCacheAsset = async (asset: string): Promise<void> => {
  await preloadImage(asset);
  await cacheAsset(asset);
};

$(() => {
  // プリロードが必要な全リソースを収集する（重複除去）
  const allAssets = _.uniq(get_prefetches().flatMap(prefetch => prefetch.assets));

  // タスク関数の配列に変換する
  const tasks = allAssets.map(asset => () => preloadAndCacheAsset(asset));

  // 並行制御でプリロードを実行する
  runWithConcurrency(tasks, CONCURRENCY_LIMIT, BATCH_DELAY).then(results => {
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    if (allAssets.length > 0) {
      console.log(
        `[ImagePreload] プリロード完了: ${succeeded} 成功, ${failed} 失敗, 計 ${allAssets.length} 個のリソース`,
      );
    }
  });
});
