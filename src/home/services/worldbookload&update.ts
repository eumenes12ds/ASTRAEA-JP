// 世界書の名前を取得
export function getWorldBookName() {
  const bookInfo = window.top?.TavernHelper.getCharWorldbookNames('current');
  const BookName = bookInfo ? bookInfo.primary : null;
  return BookName;
}
// エントリを取得
export async function getWorldbookEntries(bookName: string | null) {
  if (!bookName) {
    return;
  }
  const worldbook = await window.top?.TavernHelper.getWorldbook(bookName);
  if (!worldbook) {
    return;
  }
  return worldbook.map((entry: { name: string; enabled: boolean }) => ({
    name: entry.name,
    enabled: entry.enabled,
  }));
}
// 正規表現でエントリを絞り込み
export async function getFilteredEntries(pattern: RegExp, bookName: string | null) {
  const worldbook = await getWorldbookEntries(bookName);
  if (!worldbook || worldbook.length === 0) {
    return [];
  }
  return worldbook
    .filter((entry: { name: string }) => pattern.test(entry.name))
    .map((entry: { name: any; enabled: any }) => ({
      name: entry.name,
      enabled: entry.enabled,
    }));
}
/**
 * 世界書エントリの有効状態を更新
 *
 * @param entries 変更後のエントリリスト。name と enabled プロパティを含む
 * @throws 世界書がバインドされていないか、世界書が存在しない場合にエラーを投げる
 *
 * @example
 * // 世界書を更新
 * await updateWorldBook(entries);
 */
export async function updateWorldBook(
  entries: Array<{ name: string; enabled: boolean }>,
  bookName: string,
): Promise<void> {
  if (!bookName) {
    return;
  }
  if (!bookName) {
    throw new Error('No worldbook bound to current character');
  }

  const enabledMap = new Map(entries.map(e => [e.name, e.enabled]));

  await window.top?.TavernHelper.updateWorldbookWith(bookName, worldbook => {
    return worldbook.map(entry => {
      const newEnabled = enabledMap.get(entry.name);
      if (newEnabled !== undefined) {
        return { ...entry, enabled: newEnabled };
      }
      return entry;
    });
  });
}
