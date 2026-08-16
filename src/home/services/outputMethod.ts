// ==================== 変数出力方式関連 ====================

import { getWorldBookName, updateWorldBook } from '@/home/services/worldbookload&update';

// 固定のエントリ名
const OUTPUT_ENTRY_MAIN_API = 'output_format (AI出力に合わせてオン、メインAPI)';
const OUTPUT_ENTRY_EXTRA_API = '[mvu_update]output_format (追加モデルで変数を更新する時にオン)';
const OUTPUT_ENTRY_EXTRA_API_LATEST_INPUT = '[mvu_update]ユーザーの最新入力(追加モデルで変数を更新する時にオン)';

// 変数出力方式の選択肢
export const OUTPUT_OPTIONS = [
  {
    value: 'メインAPI',
    label: 'メインAPI',
    desc: 'メインAPIで変数更新を解析する',
    entryNames: [OUTPUT_ENTRY_MAIN_API],
  },
  {
    value: '追加API',
    label: '追加API',
    desc: '追加APIで変数更新を解析する',
    entryNames: [OUTPUT_ENTRY_EXTRA_API, OUTPUT_ENTRY_EXTRA_API_LATEST_INPUT],
  },
];

/**
 * 出力方式の選択を世界書に保存する
 * @param selectedValue 選択された出力方式の値（'メインAPI' または '追加API'）
 */
export async function saveOutputSelection(selectedValue: string): Promise<void> {
  const bookName = getWorldBookName();
  if (!bookName) {
    console.error('世界書が見つかりません');
    return;
  }

  // 選択に基づいて更新エントリを構築；選択された出力方式に対応する全エントリを有効化する
  const updatedEntries = OUTPUT_OPTIONS.flatMap(opt =>
    opt.entryNames.map(name => ({
      name,
      enabled: opt.value === selectedValue,
    })),
  );

  await updateWorldBook(updatedEntries, bookName);
}
