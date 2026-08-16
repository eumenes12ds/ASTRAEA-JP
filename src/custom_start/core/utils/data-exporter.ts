import {
  ATTRIBUTES,
  calculateAPByLevel,
  getLevelTierName,
  getTierAttributeBonus,
} from '../data/base-info';
import { RARITY_MAP } from '../data/constants';
import type {
  Asset,
  Attributes,
  Background,
  CharacterConfig,
  Equipment,
  Item,
  Partner,
  Skill,
} from '../types';

type MvuItemSource = {
  name?: string;
  rarity?: string;
  type?: string;
  tag?: string[];
  effect?: Record<string, string>;
  description?: string;
};

type MvuEquipmentSource = MvuItemSource & {
  position?: string;
};

type MvuSkillSource = MvuItemSource & {
  consume?: string;
};

const getRarityName = (rarity?: string) => _.get(RARITY_MAP, rarity || '', rarity || 'ノーマル');

const cleanRecord = (record?: Record<string, string>) => _.pickBy(record || {}, value => !!value);

const toBaseItemVariable = (item: MvuItemSource) => ({
  品質: getRarityName(item.rarity),
  タイプ: item.type || '',
  タグ: _.uniq(item.tag || []),
  効果: cleanRecord(item.effect),
  説明: item.description || '',
});

const toEquipmentVariable = (item: MvuEquipmentSource) => ({
  ...toBaseItemVariable(item),
  位置: item.position || '',
});

const toInventoryVariable = (item: Item) => ({
  ...toBaseItemVariable(item),
  数量: Math.max(1, Math.round(item.quantity || 1)),
});

const toAssetVariable = (asset: Asset) => ({
  ...toBaseItemVariable(asset),
  決済: asset.settlement || '',
});

const toSkillVariable = (skill: MvuSkillSource) => ({
  ...toBaseItemVariable(skill),
  コスト: skill.consume || '',
});

const toNamedRecord = <T extends { name?: string }, V>(
  list: T[],
  mapper: (item: T) => V,
): Record<string, V> =>
  _.fromPairs(
    _.chain(list)
      .filter(item => !!item.name)
      .map(item => [item.name as string, mapper(item)])
      .value(),
  );

const getCharacterDisplayValues = (character: CharacterConfig) => ({
  race: character.race === 'カスタム' ? character.customRace : character.race,
  identity: character.identity === 'カスタム' ? character.customIdentity : character.identity,
});

const calculateFinalAttributes = (character: CharacterConfig): Attributes => {
  const tierBonus = getTierAttributeBonus(character.level);
  return _.fromPairs(
    _.map(ATTRIBUTES, attr => [
      attr,
      character.basePoints[attr] + tierBonus + character.attributePoints[attr],
    ]),
  ) as Attributes;
};

const toAscensionVariable = (stairway?: Partner['stairway']) => ({
  有効化: Boolean(stairway?.isOpen),
  要素: stairway?.elements ?? {},
  権能: stairway?.powers ?? {},
  法則: stairway?.laws ?? {},
  神位: stairway?.godlyRank ?? '',
  神国: stairway?.godKingdom
    ? {
        名称: stairway.godKingdom.name || '',
        説明: stairway.godKingdom.description || '',
      }
    : {
        名称: '',
        説明: '',
      },
});

const toPartnerVariable = (partner: Partner) => ({
  在席: true,
  生命階層: partner.lifeLevel,
  レベル: partner.level,
  種族: partner.race,
  身分: [...partner.identity],
  職業: [...partner.career],
  性格: partner.personality,
  好意: partner.like,
  外見: partner.app,
  服装: partner.cloth,
  属性: {
    筋力: partner.attributes.strength,
    敏捷: partner.attributes.dexterity,
    耐久: partner.attributes.constitution,
    知力: partner.attributes.intelligence,
    精神: partner.attributes.mind,
  },
  状態効果: {},
  インベントリ: {},
  装備: toNamedRecord(partner.equip, toEquipmentVariable),
  スキル: toNamedRecord(partner.skills, toSkillVariable),
  登神長階: toAscensionVariable(partner.stairway),
  命定契約: partner.isContract,
  好感度: partner.affinity,
  本音: partner.comment || '',
  背景ストーリー: partner.backgroundInfo || '',
});

/**
 * キャラクターデータを MVU 変数に書き込む
 * lodash の _.set で stat_data を直接操作し、replaceMvuData で書き戻す
 */
export async function writeCharacterToMvu(
  character: CharacterConfig,
  equipments: Equipment[],
  items: Item[],
  assets: Asset[],
  skills: Skill[],
  partners: Partner[],
): Promise<void> {
  await waitGlobalInitialized('Mvu');

  const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
  const displayValues = getCharacterDisplayValues(character);
  const maxAp = calculateAPByLevel(character.level);
  const usedAp = _.sum(_.values(character.attributePoints));

  // 運命ポイント
  _.set(mvuData, 'stat_data.運命ポイント', character.destinyPoints);
  _.set(mvuData, 'stat_data.主人公', {
    種族: displayValues.race || '',
    身分: displayValues.identity ? [displayValues.identity] : [],
    職業: [],
    生命階層: getLevelTierName(character.level),
    レベル: character.level,
    累計経験値: 0,
    レベルアップ必要経験: character.level >= 25 ? 'MAX' : 120,
    冒険者ランク: '未評価',
    属性ポイント: Math.max(0, maxAp - usedAp),
    属性: calculateFinalAttributes(character),
    生命値上限: 0,
    生命値: 0,
    マナ値上限: 0,
    マナ値: 0,
    体力値上限: 0,
    体力値: 0,
    状態効果: {},
    金銭: Math.max(0, Math.round(character.money)),
    インベントリ: toNamedRecord(items, toInventoryVariable),
    資産: toNamedRecord(assets, toAssetVariable),
    装備: toNamedRecord(equipments, toEquipmentVariable),
    スキル: toNamedRecord(skills, toSkillVariable),
    登神長階: toAscensionVariable(),
  });
  _.set(mvuData, 'stat_data.関係一覧', toNamedRecord(partners, toPartnerVariable));

  // 更新後のデータを書き戻す
  await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
  console.log('✅ キャラクターの構造化データがメッセージフロア変数に正常に書き込まれました');
}

/**
 * AI に送るプロンプトデータ（プレーンテキスト形式）を生成
 */
export function generateAIPrompt(
  character: CharacterConfig,
  background: Background | null,
  customBackgroundDescription?: string,
): string {
  const lines: string[] = [];
  const displayGender = character.gender === 'カスタム' ? character.customGender : character.gender;
  const displayLocation =
    character.startLocation === 'カスタム' ? character.customStartLocation : character.startLocation;

  lines.push('【シナリオ生成コンテキスト】');
  lines.push(
    'キャラクター、属性、金銭、装備、インベントリ、資産、スキル、パートナーなどの構造化データは <status_current_variables> に書き込まれています。',
  );
  lines.push('以下は schema 外のフィールドと、創作が必要な初期コンテキストのみを提供します。');
  lines.push('');
  lines.push(`名前: ${character.name || '未設定'}`);
  lines.push(`性別: ${displayGender || '未設定'}`);
  lines.push(`年齢: ${character.age}歳`);
  lines.push(`初期場所: ${displayLocation || '未設定'}`);
  lines.push('');
  lines.push('【初回の変数更新要件】');
  lines.push(
    '初回の AI 返信では、<status_current_variables> 内の以下のフィールドを必ず更新し、空値や 0 のプレースホルダーを残さないこと：',
  );
  lines.push('- 世界.時間');
  lines.push('- 世界.場所');
  lines.push('- 主人公.生命値上限 / 主人公.生命値');
  lines.push('- 主人公.マナ値上限 / 主人公.マナ値');
  lines.push('- 主人公.体力値上限 / 主人公.体力値');
  lines.push('- 主人公.装備.*.位置');

  // 初期シナリオ
  if (background) {
    lines.push('');
    lines.push('【初期シナリオ】');
    lines.push(`${background.name}`);
    // カスタム開始時はユーザー入力の説明を使用し、それ以外はプリセットの説明を使用
    const description =
      background.name === '【カスタム開始】' && customBackgroundDescription
        ? customBackgroundDescription
        : background.description;
    lines.push(`説明: ${description}`);
  }

  const content = lines.join('\n');
  const instructions = `---
<status_current_variables> と上記の内容に基づいて、説明と状況に合った初期シナリオを生成してください！
（注意：初期シナリオを生成する際は、まず上記の内容が完全かどうかを確認し、不完全な場合は関連する設定を参考にして補完してください。）`;

  return `\`\`\`text\n${content}\n\`\`\`\n\n${instructions}`;
}
