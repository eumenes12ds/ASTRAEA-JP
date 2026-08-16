/**
 * 数値範囲を制限する
 * @param {number} val - デフォルト値
 * @param {number} min - 最小値
 * @param {number} max - 最大値
 */
export const clampedMum = (val: number, min: number, max: number) =>
  z.coerce
    .number()
    .prefault(val)
    .transform(val => _.clamp(val, min, max));

/**
 * 数値を丸めて最小値を制限する
 * @param {number} val - デフォルト値
 * @param {number} min - 最小値
 */
export const minLimitedNum = (val: number, min: number) =>
  z.coerce
    .number()
    .prefault(val)
    .transform(val => Math.max(Math.round(val), min));

/**
 * record の先頭 n 件を切り出す
 * @param {Record<string, T>} record - 切り出し対象の record
 * @param {number} limit - 切り出す件数
 */
const sliceRecord = <T>(record: Record<string, T>, limit: number): Record<string, T> =>
  _.fromPairs(_.take(_.toPairs(record), limit));

/**
 * タスク schema
 */
export const TaskSchema = z
  .object({
    状態: z.string().prefault(''),
    重要度: z.enum(['低', '中', '高']).prefault('中'),
    進捗: z.string().prefault(''),
    詳細: z.string().prefault(''),
    目標: z.string().prefault(''),
    報酬: z.string().prefault(''),
  })
  .prefault({});

/**
 * 基本アイテム schema
 */
export const BaseItemSchema = z.object({
  品質: z.string().prefault(''),
  タイプ: z.string().prefault(''),
  タグ: z
    .array(z.string())
    .prefault([])
    .transform(arr => _.uniq(arr))
    .optional(),
  効果: z.record(z.string(), z.string()).prefault({}),
  説明: z.string().prefault(''),
});

/**
 * 装備 schema
 */
export const EquipmentSchema = BaseItemSchema.extend({
  位置: z.string().prefault(''),
});

/**
 * スキル schema
 */
export const SkillSchema = BaseItemSchema.extend({
  コスト: z.string().prefault(''),
}).transform(data => _.pick(data, ['品質', 'タイプ', 'コスト', 'タグ', '効果', '説明']));

/**
 * 状態効果 schema (バフ/デバフ/特殊効果)
 */
export const StatusEffectSchema = z
  .object({
    タイプ: z.enum(['バフ', 'デバフ', '特殊']).prefault('バフ'),
    効果: z.string().prefault(''),
    スタック数: z.coerce.number().prefault(1),
    残り時間: z.string().prefault(''),
    出典: z.string().prefault(''),
  })
  .prefault({});

/**
 * インベントリ物品 schema
 */
export const InventoryItemSchema = BaseItemSchema.extend({
  数量: z.coerce.number().prefault(1),
}).transform(data => _.pick(data, ['品質', 'タイプ', '数量', 'タグ', '効果', '説明']));

/**
 * 基本属性 schema
 */
const DefaultAttr = {
  筋力: 0,
  敏捷: 0,
  耐久: 0,
  知力: 0,
  精神: 0,
} as const;

export const BaseAttrSchema = z
  .object(_.mapValues(DefaultAttr, () => z.coerce.number().prefault(0)))
  .prefault({});

/**
 * 登神長階 schema
 *
 * 状態の制約:
 * - 法則がある場合: 権能と要素は空になり、再度獲得できない
 * - 権能がある場合: 要素は空になり、再度獲得できない
 * - 通常時（権能なし かつ 法則なし）: 要素を収集できる（最大3つ）
 */
export const AscensionSchema = z
  .object({
    有効化: z.boolean().prefault(false),
    要素: z.record(z.string(), z.record(z.string(), z.string())).prefault({}),
    権能: z.record(z.string(), z.record(z.string(), z.string())).prefault({}),
    法則: z.record(z.string(), z.record(z.string(), z.string())).prefault({}),
    神位: z.string().prefault(''),
    神国: z
      .object({
        名称: z.string().prefault(''),
        説明: z.string().prefault(''),
      })
      .prefault({}),
  })
  .prefault({})
  .transform(data => {
    const lawNum = _.size(data.法則);
    const powerNum = _.size(data.権能);
    const powerLimit = 1;
    const eleLimit = 3;
    const lawLimit = data.神国?.名称 ? Number.POSITIVE_INFINITY : data.神位 ? 2 : 1;

    // 法則あり: 権能と要素を完全に空にする
    if (lawNum > 0) {
      return {
        ...data,
        要素: {},
        権能: {},
        法則: sliceRecord(data.法則, lawLimit),
      };
    }

    // 権能あり: 要素を空にする
    if (powerNum > 0) {
      return {
        ...data,
        要素: {},
        権能: sliceRecord(data.権能, powerLimit),
        法則: sliceRecord(data.法則, lawLimit),
      };
    }

    // 権能なし かつ 法則なし: 要素を正常に収集
    return {
      ...data,
      要素: sliceRecord(data.要素, eleLimit),
      権能: sliceRecord(data.権能, powerLimit),
      法則: {},
    };
  });

/**
 * 汎用のキャラクター身分情報 schema
 */
export const IdentitySchema = z.object({
  レベル: clampedMum(1, 1, 25),
  生命階層: z.string().prefault(''),
  種族: z.string().prefault(''),
  身分: z
    .array(z.string())
    .prefault([])
    .transform(arr => _.uniq(arr)),
  職業: z
    .array(z.string())
    .prefault([])
    .transform(arr => _.uniq(arr)),
  属性: BaseAttrSchema,
  装備: z.record(z.string(), EquipmentSchema).prefault({}),
  スキル: z.record(z.string(), SkillSchema).prefault({}),
  登神長階: AscensionSchema,
});
