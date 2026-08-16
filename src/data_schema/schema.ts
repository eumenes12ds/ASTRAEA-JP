import {
  clampedMum,
  IdentitySchema,
  InventoryItemSchema,
  minLimitedNum,
  StatusEffectSchema,
  TaskSchema,
} from './utils';

const assets = z
  .record(
    z.string(),
    z
      .object({
        品質: z.string().prefault(''),
        タイプ: z.string().prefault(''),
        決済: z.string().prefault(''),
        タグ: z.array(z.string()).prefault([]).transform(_.uniq),
        効果: z.record(z.string(), z.string()).prefault({}),
        説明: z.string().prefault(''),
      })
      .prefault({}),
  )
  .prefault({});

/**
 * プレイヤー情報
 */
const player = z
  .object({
    ...IdentitySchema.shape,
    累計経験値: z.coerce.number().prefault(0),
    レベルアップ必要経験: z.union([z.coerce.number().prefault(120), z.literal('MAX')]),
    冒険者ランク: z.string().prefault('未評価'),
    生命値: z.coerce.number().prefault(0),
    生命値上限: z.coerce.number().prefault(0),
    マナ値: z.coerce.number().prefault(0),
    マナ値上限: z.coerce.number().prefault(0),
    体力値: z.coerce.number().prefault(0),
    体力値上限: z.coerce.number().prefault(0),
    属性ポイント: z.coerce.number().prefault(0).transform(Math.round),
    インベントリ: z
      .record(z.string(), InventoryItemSchema)
      .prefault({})
      .transform(items => _.pickBy(items, item => item.数量 > 0)),
    資産: assets,
    金銭: z.coerce.number().prefault(0).transform(Math.round),
    状態効果: z.record(z.string(), StatusEffectSchema).prefault({}),
  })
  .prefault({})
  .transform(data => {
    const processed = {
      ...data,
      レベルアップ必要経験: data.レベル >= 25 ? 'MAX' : data.レベルアップ必要経験,
      生命値: _.clamp(data.生命値, 0, data.生命値上限),
      マナ値: _.clamp(data.マナ値, 0, data.マナ値上限),
      体力値: _.clamp(data.体力値, 0, data.体力値上限),
    };

    return _.pick(processed, [
      // 基本情報
      '種族',
      '身分',
      '職業',
      '生命階層',
      // レベルシステム
      'レベル',
      '累計経験値',
      'レベルアップ必要経験',
      '冒険者ランク',
      // 属性ポイント（属性の前に配置）
      '属性ポイント',
      // 属性
      '属性',
      // リソース値
      '生命値上限',
      '生命値',
      'マナ値上限',
      'マナ値',
      '体力値上限',
      '体力値',
      // 状態効果
      '状態効果',
      // アイテムと金銭
      '金銭',
      'インベントリ',
      '資産',
      // 装備、スキル、登神長階
      '装備',
      'スキル',
      '登神長階',
    ]);
  });

/**
 * 関係一覧情報
 */
const partners = z
  .record(
    z.string(),
    z
      .object({
        ...IdentitySchema.shape,
        在席: z.boolean().prefault(false),
        タグ: z.array(z.string()).prefault([]).transform(_.uniq),
        性格: z.string().prefault(''),
        好意: z.string().prefault(''),
        外見: z.string().prefault(''),
        服装: z.string().prefault(''),
        生命値: z.coerce.number().prefault(0),
        生命値上限: z.coerce.number().prefault(0),
        マナ値: z.coerce.number().prefault(0),
        マナ値上限: z.coerce.number().prefault(0),
        体力値: z.coerce.number().prefault(0),
        体力値上限: z.coerce.number().prefault(0),
        命定契約: z.boolean().prefault(false),
        好感度: clampedMum(0, -100, 100),
        状態効果: z.record(z.string(), StatusEffectSchema).prefault({}),
        インベントリ: z
          .record(z.string(), InventoryItemSchema)
          .prefault({})
          .transform(items => _.pickBy(items, item => item.数量 > 0)),
        資産: assets,
        本音: z.string().prefault(''),
        背景ストーリー: z.string().prefault(''),
      })
      .prefault({})
      .transform(data => {
        const processed = {
          ...data,
          生命値: _.clamp(data.生命値, 0, data.生命値上限),
          マナ値: _.clamp(data.マナ値, 0, data.マナ値上限),
          体力値: _.clamp(data.体力値, 0, data.体力値上限),
        };

        return _.pick(processed, [
          // 状態情報
          '在席',
          // ユーザー管理タグ
          'タグ',
          // 基本情報
          '種族',
          '身分',
          '職業',
          '生命階層',
          // 外見の特徴
          '性格',
          '好意',
          '外見',
          '服装',
          // レベル
          'レベル',
          // リソース値
          '生命値上限',
          '生命値',
          'マナ値上限',
          'マナ値',
          '体力値上限',
          '体力値',
          // 属性
          '属性',
          '状態効果',
          // アイテム
          'インベントリ',
          '資産',
          // 装備、スキル、登神長階
          '装備',
          'スキル',
          '登神長階',
          // 関係情報
          '命定契約',
          '好感度',
          // ストーリー情報
          '本音',
          '背景ストーリー',
        ]);
      }),
  )
  .prefault({});

/**
 * ニュース情報
 */
const news = z.object({
  アスタリア速報: z
    .object({
      勢力の要聞: z.string().prefault(''),
      尊位の軌跡: z.string().prefault(''),
      軍事行動: z.string().prefault(''),
      経済の動脈: z.string().prefault(''),
      災害警報: z.string().prefault(''),
    })
    .prefault({}),
  酒場の掲示板: z
    .object({
      高額懸賞: z.string().prefault(''),
      冒険の発見: z.string().prefault(''),
      モンスターの異変: z.string().prefault(''),
      指名手配犯: z.string().prefault(''),
      宝物の噂: z.string().prefault(''),
    })
    .prefault({}),
  午後のお茶会: z
    .object({
      社交の逸話: z.string().prefault(''),
      千里の眺望: z.string().prefault(''),
      運命のさざ波: z.string().prefault(''),
      邂逅の予兆: z.string().prefault(''),
    })
    .prefault({}),
});

export const Schema = z.object({
  イベント: z.record(z.any(), z.any()).prefault({}),
  世界: z
    .object({
      時間: z.string().prefault(''),
      場所: z.string().prefault(''),
    })
    .prefault({}),
  タスク一覧: z.record(z.string(), TaskSchema).prefault({}),
  主人公: player.prefault({}),
  運命ポイント: minLimitedNum(0, 0),
  関係一覧: partners,
  ニュース: news.prefault({}),
});
