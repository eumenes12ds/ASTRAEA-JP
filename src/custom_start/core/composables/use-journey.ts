/**
 * 旅程実行 Composable
 * キャラクターデータの送信と AI との対話を処理
 */
import { storeToRefs } from 'pinia';

import { useCharacterStore, useCustomContentStore } from '../store';
import { generateAIPrompt, writeCharacterToMvu } from '../utils/data-exporter';

interface UseJourneyReturn {
  /** 旅程を開始する */
  executeJourney: () => Promise<void>;
}

/**
 * 旅程実行を使用
 */
export function useJourney(): UseJourneyReturn {
  const characterStore = useCharacterStore();
  const customContentStore = useCustomContentStore();
  const { character } = storeToRefs(characterStore);

  const executeJourney = async () => {
    try {
      // 1. MVU 変数に書き込む
      await writeCharacterToMvu(
        character.value,
        characterStore.selectedEquipments,
        characterStore.selectedItems,
        characterStore.selectedAssets,
        characterStore.selectedSkills,
        characterStore.selectedPartners,
      );
      console.log('✅ キャラクターデータを MVU 変数に書き込みました');

      // 2. AI プロンプトを生成
      const aiPrompt = generateAIPrompt(
        character.value,
        characterStore.selectedBackground,
        customContentStore.customBackgroundDescription,
      );
      console.log('✅ AI プロンプトを生成しました：\n', aiPrompt);

      // 3. AI に送信（createChatMessages 関数を使用し、スラッシュコマンドの解析問題を回避）
      await createChatMessages([{ role: 'user', message: aiPrompt }]);

      console.log('✅ キャラクター情報を AI に送信しました');

      // 4. AI の返信をトリガー
      await triggerSlash('/trigger');
    } catch (error) {
      console.error('❌ 旅程の開始中にエラーが発生しました：', error);
    }
  };

  return {
    executeJourney,
  };
}
