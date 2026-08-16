// レア度タイプ
export type Rarity = 'only' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

// 物品タイプ
export interface Item {
  name: string;
  cost: number;
  type: string;
  tag?: string[];
  rarity: Rarity;
  quantity?: number;
  effect: Record<string, string>;
  description: string;
  isCustom?: boolean; // カスタムデータかどうかを示す
}

// 資産タイプ
export type Asset = Omit<Item, 'quantity'> & {
  settlement?: string;
};

// 装備タイプ
export type Equipment = Omit<Item, 'quantity'> & {
  position?: string;
};

// スキルタイプ
export type Skill = Omit<Item, 'quantity'> & {
  consume?: string;
  isCustom?: boolean; // カスタムデータかどうかを示す
};

// パートナータイプ
export interface Partner {
  name: string;
  cost: number;
  lifeLevel: string;
  level: number;
  race: string;
  identity: string[];
  career: string[];
  personality: string;
  like: string;
  app: string;
  cloth: string;
  equip: Partial<Omit<Equipment, 'cost'>>[];
  attributes: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    mind: number;
  };
  stairway: {
    isOpen: boolean;
    elements?: Record<string, Record<string, string>>; // ネストされたキーと値のペア：{ "要素名": { "効果名": "効果説明" } }
    powers?: Record<string, Record<string, string>>; // ネストされたキーと値のペア：{ "権能名": { "効果名": "効果説明" } }
    laws?: Record<string, Record<string, string>>; // ネストされたキーと値のペア：{ "法則名": { "効果名": "効果説明" } }
    godlyRank?: string;
    godKingdom?: {
      name: string;
      description: string;
    };
  };
  isContract: boolean;
  affinity: number;
  comment?: string;
  backgroundInfo?: string;
  skills: Omit<Skill, 'cost'>[];
  isCustom?: boolean; // カスタムデータかどうかを示す
}

// 背景タイプ
export interface Background {
  name: string;
  description: string;
  requiredRace?: string;
  requiredLocation?: string;
  requiredIdentity?: string;
  [key: string]: any;
}

// 基礎情報データタイプ
export interface BaseInfoData {
  genders?: string[];
  raceCosts?: Record<string, number>;
  identityCosts?: Record<string, number>;
  startLocations?: string[];
}

// 属性タイプ
export interface Attributes {
  筋力: number;
  敏捷: number;
  耐久: number;
  知力: number;
  精神: number;
}

// キャラクター設定タイプ
export interface CharacterConfig {
  name: string;
  gender: string;
  customGender: string;
  age: number;
  race: string;
  customRace: string;
  identity: string;
  customIdentity: string;
  startLocation: string;
  customStartLocation: string;
  level: number;
  /** 基礎ポイント配分（合計上限25、単項上限6） */
  basePoints: Record<keyof Attributes, number>;
  /** 追加ポイント配分（合計 = Lv-1） */
  attributePoints: Record<keyof Attributes, number>;
  reincarnationPoints: number; // 転生ポイント
  destinyPoints: number; // 運命ポイント
  money: number; // 金銭
}
