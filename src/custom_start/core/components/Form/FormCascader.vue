<script setup lang="ts">
import CascaderTreeNode, { type CascaderOption } from './CascaderTreeNode.vue';

// 外部利用のためにタイプを再エクスポート
export type { CascaderOption };

interface Props {
  modelValue: string;
  options: CascaderOption[];
  placeholder?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  separator?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '選択してください',
  disabled: false,
  searchPlaceholder: '検索...',
  separator: '-',
});

const emit = defineEmits<Emits>();

// 状態
const isOpen = ref(false);
const searchQuery = ref('');
const expandedNodes = ref<Set<string>>(new Set());
const wrapperRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);

// タッチデバイス（モバイル）かどうかを検出
const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// 現在選択中の値の表示テキストを取得
const displayText = computed(() => {
  if (!props.modelValue) return props.placeholder;
  return props.modelValue;
});

// 検索用にすべての選択肢をフラット化
const flattenOptions = (
  options: CascaderOption[],
  parentPath = '',
): Array<{ option: CascaderOption; path: string; fullValue: string }> => {
  const result: Array<{ option: CascaderOption; path: string; fullValue: string }> = [];

  for (const option of options) {
    const currentPath = parentPath
      ? `${parentPath}${props.separator}${option.label}`
      : option.label;
    // option.value は完全なパスを含むため、そのまま使用
    const fullValue = option.value;

    result.push({ option, path: currentPath, fullValue });

    if (option.children && option.children.length > 0) {
      result.push(...flattenOptions(option.children, currentPath));
    }
  }

  return result;
};

// 検索フィルタ後のフラットな選択肢（選択可能な葉ノードのみ表示）
const filteredFlatOptions = computed(() => {
  if (!searchQuery.value.trim()) return [];

  const query = searchQuery.value.toLowerCase();
  const flat = flattenOptions(props.options);

  // フィルタ：1. 検索語に一致 2. 葉ノードのみ（子ノードのないものだけ選択可能）
  return flat.filter(
    item =>
      item.path.toLowerCase().includes(query) &&
      !(item.option.children && item.option.children.length > 0),
  );
});

// 検索モードかどうか
const isSearchMode = computed(() => searchQuery.value.trim().length > 0);

// 一致テキストをハイライト
const highlightMatch = (text: string): string => {
  if (!searchQuery.value.trim()) return text;
  const query = searchQuery.value.trim();
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="highlight">$1</mark>');
};

// ノードの展開状態を切り替え
const toggleNode = (nodeValue: string) => {
  if (expandedNodes.value.has(nodeValue)) {
    expandedNodes.value.delete(nodeValue);
  } else {
    expandedNodes.value.add(nodeValue);
  }
  // リアクティブな更新をトリガー
  expandedNodes.value = new Set(expandedNodes.value);
};

// 選択肢を選択
const selectOption = (value: string, hasChildren: boolean) => {
  // 子ノードがある場合は展開のみ行い選択しない
  if (hasChildren) {
    toggleNode(value);
    return;
  }

  emit('update:modelValue', value);
  emit('change', value);
  isOpen.value = false;
  searchQuery.value = '';
};

// 検索結果から選択
const selectFromSearch = (fullValue: string) => {
  emit('update:modelValue', fullValue);
  emit('change', fullValue);
  isOpen.value = false;
  searchQuery.value = '';
};

// ドロップダウンを切り替え
const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  // タッチデバイス以外（PC）のみ検索ボックスに自動フォーカス
  // モバイルでは自動フォーカスせず、仮想キーボードで選択肢が隠れるのを防ぐ
  if (isOpen.value && !isTouchDevice()) {
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
};

// 外部クリックで閉じる
const handleClickOutside = (event: MouseEvent) => {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
    isOpen.value = false;
    searchQuery.value = '';
  }
};

// キーボードナビゲーション
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isOpen.value = false;
    searchQuery.value = '';
  }
};

// 初期化時に選択中の値の親ノードを展開
const initExpandedNodes = () => {
  if (!props.modelValue) return;

  const parts = props.modelValue.split(props.separator);
  let path = '';

  for (let i = 0; i < parts.length - 1; i++) {
    path = path ? `${path}${props.separator}${parts[i]}` : parts[i];
    expandedNodes.value.add(path);
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeydown);
  initExpandedNodes();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeydown);
});

watch(isOpen, newVal => {
  if (!newVal) {
    searchQuery.value = '';
  }
});

watch(
  () => props.modelValue,
  () => {
    initExpandedNodes();
  },
);
</script>

<template>
  <div ref="wrapperRef" class="cascader-wrapper">
    <!-- トリガー -->
    <div
      class="cascader-trigger"
      :class="{ 'is-open': isOpen, 'is-disabled': disabled }"
      @click="toggleDropdown"
    >
      <span class="selected-text" :class="{ placeholder: !modelValue }">
        {{ displayText }}
      </span>
      <span class="trigger-arrow" :class="{ rotated: isOpen }">▼</span>
    </div>

    <!-- ドロップダウンパネル -->
    <div v-show="isOpen" class="cascader-dropdown">
      <!-- 検索ボックス -->
      <div class="search-box">
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          class="search-input"
          :placeholder="searchPlaceholder"
          @click.stop
        />
        <span v-if="searchQuery" class="clear-btn" @click.stop="searchQuery = ''">✕</span>
      </div>

      <!-- 検索結果モード -->
      <div v-if="isSearchMode" class="search-results">
        <div
          v-for="item in filteredFlatOptions"
          :key="item.fullValue"
          class="search-result-item"
          :class="{ 'is-selected': item.fullValue === modelValue }"
          @click="selectFromSearch(item.fullValue)"
        >
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="highlightMatch(item.path)"></span>
        </div>
        <div v-if="filteredFlatOptions.length === 0" class="no-results">一致する結果がありません</div>
      </div>

      <!-- ツリー閲覧モード -->
      <div v-else class="tree-container">
        <CascaderTreeNode
          :options="options"
          :model-value="modelValue"
          :expanded-nodes="expandedNodes"
          :depth="0"
          @toggle="toggleNode"
          @select="selectOption"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cascader-wrapper {
  position: relative;
  width: 100%;
}

// トリガー
.cascader-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  color: var(--text-color);
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  cursor: pointer;

  &:hover:not(.is-disabled) {
    border-color: var(--border-color-strong);
  }

  &.is-open {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
  }

  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--border-color-light);
  }

  .selected-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.placeholder {
      color: var(--text-light);
    }
  }

  .trigger-arrow {
    color: var(--accent-color);
    font-size: 0.7rem;
    transition: transform var(--transition-normal);
    margin-left: var(--spacing-sm);

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

// ドロップダウンパネル
.cascader-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

// 検索ボックス
.search-box {
  position: relative;
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);

  .search-input {
    width: 100%;
    padding: var(--spacing-xs) var(--spacing-sm);
    padding-right: 28px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    font-size: 0.9rem;
    outline: none;
    background: var(--input-bg);
    color: var(--text-color);

    &:focus {
      border-color: var(--accent-color);
    }

    &::placeholder {
      color: var(--text-light);
    }
  }

  .clear-btn {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-light);
    cursor: pointer;
    font-size: 0.8rem;
    padding: 2px 4px;

    &:hover {
      color: var(--text-color);
    }
  }
}

// ツリーコンテナ
.tree-container {
  max-height: 300px;
  overflow-y: auto;
  padding: var(--spacing-xs) 0;
}

// 検索結果
.search-results {
  max-height: 300px;
  overflow-y: auto;
}

.search-result-item {
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  font-size: 0.9rem;

  &:hover {
    background: var(--hover-bg, rgba(212, 175, 55, 0.1));
  }

  &.is-selected {
    background: rgba(212, 175, 55, 0.15);
    color: var(--accent-color);
    font-weight: 600;
  }

  :deep(.highlight) {
    background: rgba(212, 175, 55, 0.3);
    color: inherit;
    padding: 0 2px;
    border-radius: 2px;
  }
}

.no-results {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--text-light);
  font-size: 0.9rem;
}

// モバイル端末対応
@media (max-width: 768px) {
  .cascader-trigger {
    min-height: 44px;
  }

  .search-result-item {
    min-height: 44px;
    display: flex;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .search-input {
    min-height: 40px;
  }
}
</style>
