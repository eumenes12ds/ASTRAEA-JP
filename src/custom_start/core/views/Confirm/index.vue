<script setup lang="ts">
import { computed } from 'vue';
import { useCharacterStore, useCustomContentStore } from '../../store';
import type { Partner } from '../../types';

const characterStore = useCharacterStore();
const customContentStore = useCustomContentStore();

// 総コストポイントを計算
const totalConsumed = computed(() => characterStore.consumedPoints);

// 残りポイントを計算
const remainingPoints = computed(() => {
  return characterStore.character.reincarnationPoints - totalConsumed.value;
});

// 表示する性別を取得
const displayGender = computed(() => {
  return characterStore.character.gender === 'カスタム'
    ? characterStore.character.customGender || 'カスタム'
    : characterStore.character.gender;
});

// 表示する種族を取得
const displayRace = computed(() => {
  return characterStore.character.race === 'カスタム'
    ? characterStore.character.customRace || 'カスタム'
    : characterStore.character.race;
});

// 表示する身分を取得
const displayIdentity = computed(() => {
  return characterStore.character.identity === 'カスタム'
    ? characterStore.character.customIdentity || 'カスタム'
    : characterStore.character.identity;
});

// 表示する出生地を取得
const displayLocation = computed(() => {
  return characterStore.character.startLocation === 'カスタム'
    ? characterStore.character.customStartLocation || 'カスタム'
    : characterStore.character.startLocation;
});

// 品質カラーマッピング
const rarityColorMap: Record<string, string> = {
  common: '#9e9e9e',
  uncommon: '#b88a2c',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800',
  mythic: '#e91e63',
  only: '#ff0000',
};

const formatStairwayMap = (map?: Record<string, Record<string, string>>) => {
  return Object.entries(map || {}).map(([name, effects]) => ({
    name,
    effects: Object.entries(effects || {}).map(([key, value]) => ({ key, value })),
  }));
};

const getStairwayView = (partner: Partner) => {
  const stairway = partner.stairway;
  if (!stairway?.isOpen) {
    return {
      isOpen: false,
      isSimple: false,
      text: '',
      elements: [],
      powers: [],
      laws: [],
      godlyRank: '',
      godKingdom: undefined,
    };
  }

  const elements = formatStairwayMap(stairway.elements);
  const powers = formatStairwayMap(stairway.powers);
  const laws = formatStairwayMap(stairway.laws);
  const isSimple = partner.isCustom;

  return {
    isOpen: true,
    isSimple,
    text: isSimple ? stairway.elements?.custom?.desc || '' : '',
    elements,
    powers,
    laws,
    godlyRank: stairway.godlyRank || '',
    godKingdom: stairway.godKingdom,
  };
};
</script>

<template>
  <div class="confirm-page">
    <div class="confirm-panel">
      <!-- タイトル -->
      <div class="panel-header">
        <h2 class="panel-title">情報確認</h2>
        <p class="panel-subtitle">構造化できるデータは MVU 変数に書き込まれます。AI は少量のシナリオコンテキストのみを受け取ります</p>
      </div>

      <!-- ドキュメント内容 -->
      <div class="panel-content">
        <!-- ポイント集計 -->
        <section class="doc-section points-section">
          <div class="points-grid">
            <div class="point-item">
              <span class="point-label">転生ポイント</span>
              <span class="point-value gold">{{
                characterStore.character.reincarnationPoints
              }}</span>
            </div>
            <div class="point-item">
              <span class="point-label">コスト済み</span>
              <span class="point-value">{{ totalConsumed }}</span>
            </div>
            <div class="point-item">
              <span class="point-label">残り</span>
              <span
                class="point-value"
                :class="{ negative: remainingPoints < 0, positive: remainingPoints >= 0 }"
              >
                {{ remainingPoints }}
              </span>
            </div>
            <div class="point-item destiny">
              <span class="point-label">運命ポイント</span>
              <span class="point-value purple">{{ characterStore.character.destinyPoints }}</span>
            </div>
          </div>
        </section>

        <!-- 基本情報 -->
        <section class="doc-section">
          <h3 class="section-title">
            <i class="fa-solid fa-clipboard-list" aria-hidden="true"></i>
            <span>基本情報</span>
          </h3>
          <div class="doc-text">
            <p><strong>名前：</strong>{{ characterStore.character.name || '（未設定）' }}</p>
            <p><strong>性別：</strong>{{ displayGender }}</p>
            <p><strong>年齢：</strong>{{ characterStore.character.age }} 歳</p>
            <p><strong>種族：</strong>{{ displayRace }}</p>
            <p><strong>身分：</strong>{{ displayIdentity }}</p>
            <p><strong>初期場所：</strong>{{ displayLocation }}</p>
            <p><strong>レベル：</strong>Lv.{{ characterStore.character.level }}</p>
            <p><strong>金銭：</strong>{{ characterStore.character.money }} G</p>
          </div>
        </section>

        <!-- 属性 -->
        <section class="doc-section">
          <h3 class="section-title">
            <i class="fa-solid fa-shield-halved" aria-hidden="true"></i>
            <span>キャラクター属性</span>
          </h3>
          <div class="doc-text attributes">
            <p v-for="(value, attr) in characterStore.finalAttributes" :key="attr">
              <strong>{{ attr }}：</strong>
              <span class="attr-detail">
                {{ value }}
              </span>
            </p>
          </div>
        </section>

        <!-- 装備 -->
        <section class="doc-section">
          <h3 class="section-title">
            <i class="fa-solid fa-shield-halved" aria-hidden="true"></i>
            <span>装備 ({{ characterStore.selectedEquipments.length }})</span>
          </h3>
          <div v-if="characterStore.selectedEquipments.length > 0" class="doc-text">
            <div
              v-for="(item, index) in characterStore.selectedEquipments"
              :key="item.name"
              class="item-entry"
            >
              <p class="item-title">
                <strong>{{ index + 1 }}. </strong>
                <span :style="{ color: rarityColorMap[item.rarity] }">{{ item.name }}</span>
                <span class="item-cost">[{{ item.cost }} 点]</span>
              </p>
              <p class="item-meta">
                タイプ：{{ item.type }}
                <span v-if="item.tag && item.tag.length > 0">
                  | タグ：{{ item.tag.join('、') }}</span
                >
              </p>
              <p v-if="Object.keys(item.effect || {}).length > 0" class="item-desc">
                効果：
                <span v-for="(value, key) in item.effect" :key="key" class="effect-inline">
                  {{ key }}：{{ value }}
                </span>
              </p>
              <p v-else class="item-desc">効果：なし</p>
              <p v-if="item.description" class="item-flavor">{{ item.description }}</p>
            </div>
          </div>
          <p v-else class="empty-text">装備が未選択です</p>
        </section>

        <!-- 道具 -->
        <section class="doc-section">
          <h3 class="section-title">
            <i class="fa-solid fa-box-open" aria-hidden="true"></i>
            <span>道具 ({{ characterStore.selectedItems.length }})</span>
          </h3>
          <div v-if="characterStore.selectedItems.length > 0" class="doc-text">
            <div
              v-for="(item, index) in characterStore.selectedItems"
              :key="item.name"
              class="item-entry"
            >
              <p class="item-title">
                <strong>{{ index + 1 }}. </strong>
                <span :style="{ color: rarityColorMap[item.rarity] }">{{ item.name }}</span>
                <span v-if="item.quantity" class="item-quantity">× {{ item.quantity }}</span>
                <span class="item-cost">[{{ item.cost }} 点]</span>
              </p>
              <p class="item-meta">
                タイプ：{{ item.type }}
                <span v-if="item.tag && item.tag.length > 0">
                  | タグ：{{ item.tag.join('、') }}</span
                >
              </p>
              <p v-if="Object.keys(item.effect || {}).length > 0" class="item-desc">
                効果：
                <span v-for="(value, key) in item.effect" :key="key" class="effect-inline">
                  {{ key }}：{{ value }}
                </span>
              </p>
              <p v-else class="item-desc">効果：なし</p>
              <p v-if="item.description" class="item-flavor">{{ item.description }}</p>
            </div>
          </div>
          <p v-else class="empty-text">道具が未選択です</p>
        </section>

        <!-- 資産 -->
        <section class="doc-section">
          <h3 class="section-title">
            <i class="fa-solid fa-building-columns" aria-hidden="true"></i>
            <span>資産 ({{ characterStore.selectedAssets.length }})</span>
          </h3>
          <div v-if="characterStore.selectedAssets.length > 0" class="doc-text">
            <div
              v-for="(asset, index) in characterStore.selectedAssets"
              :key="asset.name"
              class="item-entry"
            >
              <p class="item-title">
                <strong>{{ index + 1 }}. </strong>
                <span :style="{ color: rarityColorMap[asset.rarity] }">{{ asset.name }}</span>
                <span class="item-cost">[{{ asset.cost }} 点]</span>
              </p>
              <p class="item-meta">
                タイプ：{{ asset.type }}
                <span v-if="asset.settlement"> | 決済：{{ asset.settlement }}</span>
                <span v-if="asset.tag && asset.tag.length > 0">
                  | タグ：{{ asset.tag.join('、') }}</span
                >
              </p>
              <p v-if="Object.keys(asset.effect || {}).length > 0" class="item-desc">
                効果：
                <span v-for="(value, key) in asset.effect" :key="key" class="effect-inline">
                  {{ key }}：{{ value }}
                </span>
              </p>
              <p v-else class="item-desc">効果：なし</p>
              <p v-if="asset.description" class="item-flavor">{{ asset.description }}</p>
            </div>
          </div>
          <p v-else class="empty-text">資産が未選択です</p>
        </section>

        <!-- スキル -->
        <section class="doc-section">
          <h3 class="section-title">
            <i class="fa-solid fa-wand-magic" aria-hidden="true"></i>
            <span>スキル ({{ characterStore.selectedSkills.length }})</span>
          </h3>
          <div v-if="characterStore.selectedSkills.length > 0" class="doc-text">
            <div
              v-for="(skill, index) in characterStore.selectedSkills"
              :key="skill.name"
              class="item-entry"
            >
              <p class="item-title">
                <strong>{{ index + 1 }}. </strong>
                <span :style="{ color: rarityColorMap[skill.rarity] }">{{ skill.name }}</span>
                <span class="item-cost">[{{ skill.cost }} 点]</span>
              </p>
              <p class="item-meta">
                タイプ：{{ skill.type }}
                <span v-if="skill.tag && skill.tag.length > 0">
                  | タグ：{{ skill.tag.join('、') }}</span
                >
                <span v-if="skill.consume"> | コスト：{{ skill.consume }}</span>
              </p>
              <p v-if="Object.keys(skill.effect || {}).length > 0" class="item-desc">
                効果：
                <span v-for="(value, key) in skill.effect" :key="key" class="effect-inline">
                  {{ key }}：{{ value }}
                </span>
              </p>
              <p v-else class="item-desc">効果：なし</p>
              <p v-if="skill.description" class="item-flavor">{{ skill.description }}</p>
            </div>
          </div>
          <p v-else class="empty-text">スキルが未選択です</p>
        </section>

        <!-- パートナーリスト -->
        <section class="doc-section">
          <h3 class="section-title">
            <i class="fa-solid fa-user-astronaut" aria-hidden="true"></i>
            <span>パートナーリスト ({{ characterStore.selectedPartners.length }})</span>
          </h3>
          <div v-if="characterStore.selectedPartners.length > 0" class="doc-text">
            <div
              v-for="(partner, index) in characterStore.selectedPartners"
              :key="partner.name"
              class="destined-entry"
            >
              <p class="item-title">
                <strong>{{ index + 1 }}. {{ partner.name }}</strong>
                <span class="item-cost">[{{ partner.cost }} 点]</span>
              </p>
              <p class="item-meta">
                {{ partner.race }} | {{ partner.identity.join('、') }} | Lv.{{ partner.level }} |
                {{ partner.lifeLevel }}
              </p>
              <p v-if="partner.backgroundInfo">{{ partner.backgroundInfo }}</p>
              <div v-if="getStairwayView(partner).isOpen" class="sub-list">
                <p><strong>登神長階：</strong></p>
                <p v-if="getStairwayView(partner).isSimple" class="sub-item">
                  • {{ getStairwayView(partner).text }}
                </p>
                <template v-else>
                  <div v-if="getStairwayView(partner).elements.length > 0" class="sub-item">
                    <p><strong>要素：</strong></p>
                    <div
                      v-for="element in getStairwayView(partner).elements"
                      :key="`element-${element.name}`"
                      class="sub-item"
                    >
                      <p class="sub-item">• {{ element.name }}</p>
                      <p
                        v-for="effect in element.effects"
                        :key="`element-${element.name}-${effect.key}`"
                        class="sub-item"
                      >
                        • {{ effect.key }}：{{ effect.value }}
                      </p>
                    </div>
                  </div>
                  <div v-if="getStairwayView(partner).powers.length > 0" class="sub-item">
                    <p><strong>権能：</strong></p>
                    <div
                      v-for="power in getStairwayView(partner).powers"
                      :key="`power-${power.name}`"
                      class="sub-item"
                    >
                      <p class="sub-item">• {{ power.name }}</p>
                      <p
                        v-for="effect in power.effects"
                        :key="`power-${power.name}-${effect.key}`"
                        class="sub-item"
                      >
                        • {{ effect.key }}：{{ effect.value }}
                      </p>
                    </div>
                  </div>
                  <div v-if="getStairwayView(partner).laws.length > 0" class="sub-item">
                    <p><strong>法則：</strong></p>
                    <div
                      v-for="law in getStairwayView(partner).laws"
                      :key="`law-${law.name}`"
                      class="sub-item"
                    >
                      <p class="sub-item">• {{ law.name }}</p>
                      <p
                        v-for="effect in law.effects"
                        :key="`law-${law.name}-${effect.key}`"
                        class="sub-item"
                      >
                        • {{ effect.key }}：{{ effect.value }}
                      </p>
                    </div>
                  </div>
                  <p v-if="getStairwayView(partner).godlyRank" class="sub-item">
                    • 神位：{{ getStairwayView(partner).godlyRank }}
                  </p>
                  <div
                    v-if="
                      getStairwayView(partner).godKingdom?.name ||
                      getStairwayView(partner).godKingdom?.description
                    "
                    class="sub-item"
                  >
                    <p><strong>神国：</strong></p>
                    <p v-if="getStairwayView(partner).godKingdom?.name" class="sub-item">
                      • 名称：{{ getStairwayView(partner).godKingdom?.name }}
                    </p>
                    <p v-if="getStairwayView(partner).godKingdom?.description" class="sub-item">
                      • 説明：{{ getStairwayView(partner).godKingdom?.description }}
                    </p>
                  </div>
                </template>
              </div>
              <p v-if="partner.comment" class="item-flavor">{{ partner.comment }}</p>

              <div v-if="partner.equip && partner.equip.length > 0" class="sub-list">
                <p><strong>装備：</strong></p>
                <p v-for="(eq, idx) in partner.equip" :key="idx" class="sub-item">
                  • {{ eq.name || eq }}
                </p>
              </div>

              <div v-if="partner.skills && partner.skills.length > 0" class="sub-list">
                <p><strong>スキル：</strong></p>
                <p v-for="(sk, idx) in partner.skills" :key="idx" class="sub-item">
                  • {{ sk.name }}
                </p>
              </div>
            </div>
          </div>
          <p v-else class="empty-text">パートナーが未選択です</p>
        </section>

        <!-- 初期シナリオ -->
        <section class="doc-section">
          <h3 class="section-title">
            <i class="fa-solid fa-book-open" aria-hidden="true"></i>
            <span>初期シナリオ</span>
          </h3>
          <div v-if="characterStore.selectedBackground" class="doc-text">
            <p class="item-title">
              <strong>{{ characterStore.selectedBackground.name }}</strong>
            </p>
            <p
              v-if="
                characterStore.selectedBackground.race || characterStore.selectedBackground.location
              "
              class="item-meta"
            >
              <span v-if="characterStore.selectedBackground.race"
                >種族：{{ characterStore.selectedBackground.race }}</span
              >
              <span
                v-if="
                  characterStore.selectedBackground.race &&
                  characterStore.selectedBackground.location
                "
              >
                |
              </span>
              <span v-if="characterStore.selectedBackground.location"
                >場所：{{ characterStore.selectedBackground.location }}</span
              >
            </p>
            <!-- カスタム開始時はユーザー入力の内容を表示し、それ以外はプリセットの説明を表示 -->
            <p
              v-if="
                characterStore.selectedBackground.name === '【カスタム開始】' &&
                customContentStore.customBackgroundDescription
              "
              class="background-desc"
            >
              {{ customContentStore.customBackgroundDescription }}
            </p>
            <p v-else class="background-desc">
              {{ characterStore.selectedBackground.description }}
            </p>
          </div>
          <p v-else class="empty-text">初期シナリオが未選択です</p>
        </section>

        <!-- ヒント情報 -->
        <div v-if="remainingPoints !== 0" class="final-notice">
          <div v-if="remainingPoints < 0" class="notice warning">
            <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
            <span>警告：転生ポイントが {{ Math.abs(remainingPoints) }} 点不足しています。戻って調整してください</span>
          </div>
          <div v-else class="notice info">
            <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
            <span>ヒント：転生ポイントが {{ remainingPoints }} 点未使用です</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.confirm-page {
  max-width: 1080px;
  margin: 0 auto;
}

.confirm-panel {
  overflow: hidden;
}

.panel-header {
  text-align: center;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%);
  border-bottom: 2px solid var(--border-color);

  .panel-title {
    font-size: 1.6rem;
    color: var(--title-color);
    margin: 0 0 var(--spacing-xs) 0;
    font-weight: 700;
  }

  .panel-subtitle {
    font-size: 0.95rem;
    color: var(--text-light);
    margin: 0;
  }
}

.panel-content {
  padding: var(--spacing-lg);
}

// ポイント集計エリア
.points-section {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0.02) 100%);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md) !important;
  margin-bottom: var(--spacing-lg) !important;
}

.points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--spacing-md);

  .point-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    background: var(--card-bg);
    border-radius: var(--radius-md);

    &.destiny {
      background: linear-gradient(
        135deg,
        rgba(156, 39, 176, 0.1) 0%,
        rgba(156, 39, 176, 0.05) 100%
      );
    }

    .point-label {
      font-size: 0.85rem;
      color: var(--text-light);
      font-weight: 500;
    }

    .point-value {
      font-size: 1.5rem;
      font-weight: 700;
      font-family: var(--font-mono);
      color: var(--text-color);

      &.gold {
        color: var(--accent-color);
      }

      &.purple {
        color: #9c27b0;
      }

      &.positive {
        color: var(--success-color);
      }

      &.negative {
        color: var(--error-color);
      }
    }
  }
}

// ドキュメントセクション
.doc-section {
  padding: var(--spacing-lg) 0;
  border-bottom: 1px solid var(--border-color-light);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 1.2rem;
  color: var(--title-color);
  margin: 0 0 var(--spacing-md) 0;
  font-weight: 700;

  i {
    color: var(--accent-color);
  }
}

.doc-text {
  line-height: 1.8;
  color: var(--text-color);
  overflow-wrap: anywhere;

  p {
    margin: 0 0 var(--spacing-sm) 0;

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      color: var(--text-light);
      font-weight: 600;
    }
  }

  &.attributes {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm) var(--spacing-lg);

    .attr-detail {
      font-family: var(--font-mono);
      color: var(--accent-color);
      font-weight: 700;
      font-size: 1.1em;
    }
  }
}

// アイテムエントリ
.item-entry,
.destined-entry {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px dashed var(--border-color-light);

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .item-title {
    font-size: 1.05rem;
    margin-bottom: var(--spacing-xs) !important;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--spacing-xs);

    .item-quantity {
      font-size: 0.9rem;
      color: var(--success-color);
      font-weight: 600;
      margin-left: var(--spacing-xs);
    }

    .item-cost {
      font-size: 0.9rem;
      color: var(--accent-color);
      font-weight: 600;
      font-family: var(--font-mono);
      margin-left: var(--spacing-xs);
    }
  }

  .item-meta {
    font-size: 0.9rem;
    color: var(--text-light);
    margin-bottom: var(--spacing-xs) !important;
  }

  .item-desc {
    margin-bottom: var(--spacing-xs) !important;
  }

  .effect-inline {
    display: block;
    margin-left: 12px;
    margin-top: 4px;
    padding: 2px 6px;
    background: rgba(212, 175, 55, 0.12);
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
  }

  .item-flavor {
    font-size: 0.9rem;
    color: var(--text-light);
    font-style: italic;
  }

  .sub-list {
    margin-top: var(--spacing-sm);
    padding-left: var(--spacing-md);

    p {
      margin-bottom: 4px !important;

      strong {
        color: var(--text-color);
      }
    }

    .sub-item {
      font-size: 0.95rem;
      color: var(--text-light);
    }
  }
}

.background-story,
.background-desc {
  white-space: pre-wrap;
  line-height: 1.8;
}

.empty-text {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--text-light);
  font-style: italic;
}

// 最終ヒント
.final-notice {
  margin-top: var(--spacing-lg);

  .notice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    font-size: 0.95rem;
    font-weight: 600;
    text-align: center;

    &.warning {
      background: rgba(244, 67, 54, 0.1);
      color: var(--error-color);
      border: 2px solid var(--error-color);
    }

    &.info {
      background: rgba(33, 150, 243, 0.1);
      color: #2196f3;
      border: 2px solid #2196f3;
    }
  }
}

// レスポンシブデザイン
@media (max-width: 768px) {
  .confirm-page {
    max-width: 100%;
  }

  .panel-header {
    padding: var(--spacing-md);

    .panel-title {
      font-size: 1.3rem;
    }
  }

  .panel-content {
    padding: var(--spacing-md);
  }

  .points-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }

  .doc-text.attributes {
    grid-template-columns: 1fr;
  }

  .item-entry,
  .destined-entry {
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-md);
  }

  .section-title {
    font-size: 1.05rem;
  }

  .final-notice {
    .notice {
      align-items: flex-start;
      justify-content: flex-start;
      text-align: left;
    }
  }
}

@media (max-width: 480px) {
  .panel-content {
    padding: var(--spacing-sm);
  }

  .points-grid {
    grid-template-columns: 1fr;
  }

  .points-section {
    padding: var(--spacing-sm) !important;
  }
}
</style>
