// ==================== 変数出力方式関連 ====================

import { getWorldBookName, updateWorldBook } from '@/home/services/worldbookload&update';

// 固定のエントリ名
const OUTPUT_ENTRY_MAIN_API = 'output_format (AI出力に合わせてオン、メインAPI)';
const OUTPUT_ENTRY_EXTRA_API = '[mvu_update]output_format (追加モデルで変数を更新する時にオン)';
const OUTPUT_ENTRY_EXTRA_API_LATEST_INPUT =
  '[mvu_update]ユーザーの最新入力(追加モデルで変数を更新する時にオン)';

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

// 現在のキャラクターカードを取得（ホーム/カスタム開始は iframe として酒場ページ内で動作）
function currentCharacter(): any {
  try {
    const ctx =
      (window.top as any)?.SillyTavern?.getContext?.() ||
      (window as any).SillyTavern?.getContext?.();
    if (!ctx) return null;
    const chars = Array.isArray(ctx.characters) ? ctx.characters : [];
    return chars[ctx.characterId] || null;
  } catch {
    return null;
  }
}

/**
 * 管理側（8091）の当該カード設定に基づいて変数更新 API を決定：
 * - 「メインAPIに従う」（kiosk_variable_update = main）→ メインAPI
 * - 「追加モデル解析」（kiosk_variable_update = extra）→ 追加API
 * 読み取り順：外部 meta（kiosk-card-meta.json、管理側スイッチの永続化先）→ カード内蔵フィールド → 既定メインAPI。
 */
export async function resolveCardUpdateMode(): Promise<'main' | 'extra'> {
  try {
    const character = currentCharacter();
    const avatar = character?.avatar;
    if (avatar) {
      try {
        const response = await fetch('/kiosk/api/card-meta', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          const val = data?.cards?.[avatar]?.kiosk_variable_update;
          if (val === 'main' || val === 'extra') return val;
        }
      } catch {
        /* kiosk 以外の環境（外部配布等）ではこの API が無いため、フォールバック */
      }
    }
    const embedded =
      character?.data?.extensions?.kiosk_variable_update ||
      character?.extensions?.kiosk_variable_update ||
      '';
    if (embedded === 'main' || embedded === 'extra') return embedded;
  } catch {
    /* ignore */
  }
  return 'main';
}

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
