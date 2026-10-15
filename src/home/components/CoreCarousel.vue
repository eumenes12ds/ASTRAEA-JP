<template>
  <section class="core-carousel" aria-label="運命コア一覧" :style="{ '--arrow-scale': arrowScale }">
    <p class="carousel-hint">左右にスワイプして、コアをひとつ選択</p>
    <div class="carousel-row">
      <button
        type="button"
        class="carousel-arrow previous"
        :style="{ top: `${portraitCenter}px` }"
        aria-label="前のコアを表示"
        @click="browse(-1)"
      >
        <svg class="arrow-icon" viewBox="0 0 24 32" aria-hidden="true">
          <path class="arrow-highlight" d="M16 4H21L9 16L21 28H16L4 16Z" />
          <path class="arrow-outline" d="M16 4H21L9 16L21 28H16L4 16Z" />
          <path class="arrow-fill" d="M16 4H21L9 16L21 28H16L4 16Z" />
        </svg>
      </button>
      <div
        ref="track"
        class="core-track"
        :class="{ dragging }"
        @scroll.passive="handleScroll"
        @pointerdown="pointerDown"
        @pointermove="pointerMove"
        @pointerup="pointerEnd"
        @pointercancel="pointerEnd"
        @lostpointercapture="pointerEnd"
        @click.capture="guardClick"
        @keydown="handleKey"
      >
        <template v-for="copy in 3" :key="copy">
          <button
            v-for="(core, index) in cores"
            :key="`${copy}:${core.value}`"
            type="button"
            class="core-option"
            :class="{ selected: selected === core.value }"
            :data-core-index="index"
            :data-copy="copy"
            :aria-label="core.label"
            :aria-pressed="selected === core.value"
            :aria-hidden="copy !== 2 ? true : undefined"
            :tabindex="copy === 2 && index === Math.max(0, selectedIndex) ? 0 : -1"
            @click="choose(core.value, index)"
          >
            <span class="portrait-wrap">
              <img
                v-if="corePortrait(core.label) && !failedImages.has(core.value)"
                :src="corePortrait(core.label)"
                alt=""
                draggable="false"
                loading="lazy"
                decoding="async"
                @error="failedImages.add(core.value)"
              />
              <span v-else class="portrait-fallback" aria-hidden="true">{{
                coreDisplayName(core.label).slice(0, 1)
              }}</span>
              <span v-if="selected === core.value" class="selection-mark" aria-hidden="true">
                <svg class="selection-check" viewBox="0 0 24 24">
                  <path d="M5 12L10 17L20 7" />
                </svg>
              </span>
            </span>
            <span class="core-name" :title="coreDisplayName(core.label)">{{
              coreDisplayName(core.label)
            }}</span>
          </button>
        </template>
      </div>
      <button
        type="button"
        class="carousel-arrow next"
        :style="{ top: `${portraitCenter}px` }"
        aria-label="次のコアを表示"
        @click="browse(1)"
      >
        <svg class="arrow-icon" viewBox="0 0 24 32" aria-hidden="true">
          <path class="arrow-highlight" d="M8 4H3L15 16L3 28H8L20 16Z" />
          <path class="arrow-outline" d="M8 4H3L15 16L3 28H8L20 16Z" />
          <path class="arrow-fill" d="M8 4H3L15 16L3 28H8L20 16Z" />
        </svg>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { CoreOption } from '../services/CorePage';
import { coreDisplayName, corePortrait } from '../services/corePortraits';

const props = defineProps<{ cores: CoreOption[]; selected: string | null }>();
const emit = defineEmits<{ select: [value: string] }>();
const track = ref<HTMLDivElement>();
const dragging = ref(false);
const portraitCenter = ref(0);
const arrowScale = ref(1);
const failedImages = ref(new Set<string>());
const selectedIndex = computed(() => props.cores.findIndex(core => core.value === props.selected));
let resizeObserver: ResizeObserver | undefined;
let scrollFrame = 0;
let animationFrame = 0;
let lastWidth = 0;
let pointer: {
  id: number;
  x: number;
  y: number;
  scroll: number;
  touch: boolean;
  moved: boolean;
} | null = null;
let suppressClickUntil = 0;
const step = () => {
  const buttons = track.value?.querySelectorAll<HTMLElement>('.core-option');
  return buttons && buttons.length > 1 ? buttons[1].offsetLeft - buttons[0].offsetLeft : 0;
};

function normalize() {
  const el = track.value,
    cycle = step() * props.cores.length;
  if (!el || !cycle) return 0;
  let delta = 0;
  while (el.scrollLeft + delta < cycle / 2) delta += cycle;
  while (el.scrollLeft + delta >= cycle * 1.5) delta -= cycle;
  if (delta) {
    el.scrollLeft += delta;
    if (pointer) pointer.scroll += delta;
  }
  return delta;
}

function handleScroll() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    if (!animationFrame) normalize();
  });
}

function stopAnimation() {
  cancelAnimationFrame(animationFrame);
  animationFrame = 0;
}

function moveTo(left: number, animate = true) {
  const el = track.value;
  if (!el) return;
  stopAnimation();
  if (!animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.scrollLeft = left;
    normalize();
    return;
  }
  const from = el.scrollLeft,
    distance = left - from,
    start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / 220);
    el.scrollLeft = from + distance * (1 - (1 - t) ** 3);
    if (t < 1) animationFrame = requestAnimationFrame(tick);
    else {
      animationFrame = 0;
      normalize();
    }
  };
  animationFrame = requestAnimationFrame(tick);
}

function center(index: number, animate = true) {
  const el = track.value,
    unit = step();
  if (!el || !unit) return;
  const itemWidth = el.querySelector<HTMLElement>('.core-option')!.offsetWidth;
  const cycle = unit * props.cores.length;
  const target = cycle + Math.max(0, index) * unit - (el.clientWidth - itemWidth) / 2;
  const nearest = animate ? target + Math.round((el.scrollLeft - target) / cycle) * cycle : target;
  moveTo(nearest, animate);
}

function browse(direction: number) {
  if (track.value) moveTo(track.value.scrollLeft + direction * step());
}

function choose(value: string, index: number) {
  emit('select', value);
  center(index);
}

function guardClick(event: MouseEvent) {
  if (event.detail > 0 && performance.now() < suppressClickUntil) {
    event.preventDefault();
    event.stopPropagation();
  }
}

function pointerDown(event: PointerEvent) {
  if (!event.isPrimary || event.button !== 0 || !track.value) return;
  stopAnimation();
  pointer = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    scroll: track.value.scrollLeft,
    touch: event.pointerType === 'touch',
    moved: false,
  };
}

function pointerMove(event: PointerEvent) {
  const el = track.value;
  if (!pointer || pointer.id !== event.pointerId || !el) return;
  const dx = event.clientX - pointer.x,
    dy = event.clientY - pointer.y;
  if (!pointer.moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
    pointer.moved = true;
    if (!pointer.touch) {
      dragging.value = true;
      el.setPointerCapture(event.pointerId);
    }
  }
  if (pointer.moved) {
    suppressClickUntil = performance.now() + 350;
    if (!pointer.touch) {
      event.preventDefault();
      el.scrollLeft = pointer.scroll - dx;
    }
  }
}

function pointerEnd(event: PointerEvent) {
  if (!pointer || pointer.id !== event.pointerId) return;
  if (pointer.moved || event.type === 'pointercancel') suppressClickUntil = performance.now() + 350;
  pointer = null;
  dragging.value = false;
  if (track.value?.hasPointerCapture(event.pointerId))
    track.value.releasePointerCapture(event.pointerId);
  normalize();
}

function handleKey(event: KeyboardEvent) {
  const button = (event.target as HTMLElement).closest<HTMLElement>('.core-option');
  if (!button || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const count = props.cores.length,
    index = Number(button.dataset.coreIndex);
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? count - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + count) % count;
  track.value
    ?.querySelector<HTMLElement>(`[data-copy="2"][data-core-index="${next}"]`)
    ?.focus({ preventScroll: true });
  center(next);
}

watch(
  () => props.cores,
  async () => {
    await nextTick();
    center(selectedIndex.value, false);
  },
);
onMounted(async () => {
  await nextTick();
  if (!track.value) return;
  center(selectedIndex.value, false);
  resizeObserver = new ResizeObserver(() => {
    const width = track.value?.clientWidth || 0;
    const portrait = track.value?.querySelector<HTMLElement>('.portrait-wrap');
    const row = track.value?.parentElement;
    if (portrait && row) {
      const bounds = portrait.getBoundingClientRect();
      portraitCenter.value = bounds.top - row.getBoundingClientRect().top + bounds.height / 2;
      // モバイルで矢印用の列を確保した分だけ、画像と同じ比率で矢印も縮小。
      const originalMobilePortraitWidth = (row.clientWidth - 20) / 3;
      arrowScale.value = window.matchMedia('(max-width: 600px)').matches
        ? Math.min(1, bounds.width / originalMobilePortraitWidth)
        : 1;
    }
    if (width !== lastWidth) {
      lastWidth = width;
      center(selectedIndex.value, false);
    }
  });
  resizeObserver.observe(track.value);
});
onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  cancelAnimationFrame(scrollFrame);
  stopAnimation();
  pointer = null;
});
</script>

<style scoped>
.core-carousel {
  min-width: 0;
  contain: inline-size;
}
.carousel-hint {
  text-align: center;
  color: var(--link-color);
  margin: 8px 0 14px;
  font-size: 0.9em;
}
.carousel-row {
  position: relative;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 8px;
}
.core-track {
  position: relative;
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
  user-select: none;
  cursor: grab;
  padding: 5px 0;
}
.core-track::-webkit-scrollbar {
  display: none;
}
.core-track.dragging {
  cursor: grabbing;
}
.core-option {
  flex: 0 0 calc((100% - 48px) / 5);
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  padding: 0;
  background: transparent;
  border: 0;
  color: var(--text-color);
  font: inherit;
  cursor: inherit;
  text-align: center;
}
.portrait-wrap {
  display: block;
  aspect-ratio: 1;
  width: 100%;
  position: relative;
  background: var(--item-bg-color);
  border: 2px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  box-sizing: border-box;
}
.portrait-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}
.portrait-fallback {
  display: grid;
  place-items: center;
  height: 100%;
  color: var(--title-color);
  font-size: 2em;
}
.core-option.selected .portrait-wrap {
  border: 3px solid #f5c765;
  box-shadow:
    0 0 0 1px #fff0c2,
    0 0 6px 1px rgba(245, 199, 101, 0.55);
}
.selection-mark {
  position: absolute;
  top: 0;
  right: 0;
  display: grid;
  place-items: center;
  width: 32%;
  min-width: 12px;
  max-width: 27px;
  aspect-ratio: 1;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 18% 100%, 0 82%);
  background: linear-gradient(135deg, #ffe7af, #f3c768);
  color: #3e2d12;
  pointer-events: none;
}
.selection-check {
  width: 75%;
  height: 75%;
  fill: none;
  stroke: currentColor;
  stroke-width: 3.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.core-name {
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.core-option.selected .core-name {
  color: var(--border-strong-color);
}
.carousel-arrow {
  position: relative;
  align-self: start;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--link-color);
  font-size: 28px;
  cursor: pointer;
}
.carousel-arrow:hover {
  color: var(--title-color);
}
.arrow-icon {
  display: block;
  width: calc(24px * var(--arrow-scale, 1));
  height: calc(32px * var(--arrow-scale, 1));
  margin: auto;
  pointer-events: none;
  fill: #f2cf87;
  stroke-linejoin: round;
}
.arrow-highlight {
  stroke: #ffe9b5;
  stroke-width: 5px;
}
.arrow-outline {
  stroke: #21170d;
  stroke-width: 3px;
}
.arrow-fill {
  stroke: none;
}
.core-option:focus-visible {
  outline: 2px solid var(--border-strong-color);
  outline-offset: -2px;
  border-radius: 6px;
}
.carousel-arrow:focus-visible {
  outline: 2px solid var(--border-strong-color);
  outline-offset: 2px;
}
@media (max-width: 600px) {
  .carousel-row {
    gap: 4px;
  }
  .core-track {
    gap: 8px;
  }
  .core-option {
    flex-basis: calc((100% - 16px) / 3);
  }
  .core-name {
    font-size: 11px;
  }
}
</style>
