/**
 * リスト内で「同時に1枚のカードだけが詳細を展開する」状態を管理する。
 */
export function useActiveCard() {
  const activeName = ref('');

  const toggleActive = (name: string) => {
    activeName.value = activeName.value === name ? '' : name;
  };

  const isActive = (name: string) => activeName.value === name;

  const clearIfMissing = (names: string[]) => {
    if (activeName.value && !names.includes(activeName.value)) {
      activeName.value = '';
    }
  };

  return {
    activeName,
    toggleActive,
    isActive,
    clearIfMissing,
  };
}
