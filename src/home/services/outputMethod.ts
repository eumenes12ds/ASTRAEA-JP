// ==================== 変数出力方式関連 ====================

import { getWorldBookName } from '@/home/services/worldbookload&update';

// Published worldbook UIDs survive display-name localization.
export const OUTPUT_OPTIONS = [
  { value: '主AI追従出力', label: '主AI追従出力', desc: '本文と同じ応答で変数を更新する', entryIds: [48699] },
  { value: '追加モデル解析', label: '追加モデル解析', desc: '追加モデルで変数を更新する', entryIds: [902272] },
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
  const aliases: Record<string,string> = { 'メインAPI':'主AI追従出力', '追加API':'追加モデル解析', '随AI输出':'主AI追従出力', '额外模型解析':'追加モデル解析', 'AI出力に従う':'主AI追従出力' };
  const selected = aliases[selectedValue] || selectedValue;
  if (!OUTPUT_OPTIONS.some(option => option.value === selected)) throw new Error('変数の出力方式が無効です。');
  const bookName = getWorldBookName();
  if (!bookName) throw new Error('世界書が見つかりません。');
  const helper = window.top?.TavernHelper;
  if (!helper?.updateWorldbookWith) throw new Error('世界書更新インターフェースが見つかりません。');
  await helper.updateWorldbookWith(bookName, entries => {
    const required = OUTPUT_OPTIONS.flatMap(option => option.entryIds);
    if (!required.every(uid => entries.filter(entry => entry.uid === uid).length === 1)) throw new Error('変数更新エントリの識別子が見つからないか重複しています。');
    return entries.map(entry => {
      const option = OUTPUT_OPTIONS.find(option => option.entryIds.includes(entry.uid));
      if (option) return { ...entry, enabled: option.value === selected };
      if (entry.uid === 998553) {
        const config = JSON.parse(entry.content);
        return { ...entry, content: JSON.stringify({ ...config, 更新方式: selected }) };
      }
      return entry;
    });
  });
}
