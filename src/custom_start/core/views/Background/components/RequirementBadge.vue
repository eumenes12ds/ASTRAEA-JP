<script setup lang="ts">
/**
 * 制限条件バッジコンポーネント
 * 背景/初期シナリオの各種制限条件（種族、地域、身分など）の表示に使用
 */

interface Props {
  /** 制限条件タグ */
  label: string;
  /** 制限条件が要求する値 */
  requiredValue: string;
  /** 現在のキャラクターの実際の値 */
  currentValue: string;
  /** マッチングモード：'exact' 完全一致（デフォルト）、'prefix' プレフィックス一致（階層場所用） */
  matchMode?: 'exact' | 'prefix';
}

const props = withDefaults(defineProps<Props>(), {
  matchMode: 'exact',
});

// 要件を満たしているか確認
const isMet = computed(() => {
  if (props.matchMode === 'prefix') {
    // 完全一致、または現在の場所が要求場所の子場所
    return (
      props.currentValue === props.requiredValue ||
      props.currentValue.startsWith(props.requiredValue + '-')
    );
  }
  return props.currentValue === props.requiredValue;
});
</script>

<script lang="ts">
import { computed } from 'vue';
</script>

<template>
  <div class="requirement-item">
    <span class="requirement-label">{{ label }}：</span>
    <span
      class="requirement-value"
      :class="{
        'requirement-met': isMet,
        'requirement-unmet': !isMet,
      }"
    >
      {{ requiredValue }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.requirement-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.75rem;

  .requirement-label {
    color: var(--text-light);
    font-weight: 500;
    font-size: 0.85rem;
  }

  .requirement-value {
    font-weight: 600;
    word-break: break-word;
    line-height: 1.4;

    &.requirement-met {
      color: var(--success-color);
    }

    &.requirement-unmet {
      color: var(--error-color);
    }
  }
}
</style>
