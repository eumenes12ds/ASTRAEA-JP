import { MapMarkerIcon } from '../types/map-markers';

export const DEFAULT_DRAW_COLOR = '#ffcc66';
export const DEFAULT_MARKER_COLOR = '#ffcc66';
export const DEFAULT_MARKER_ICON: MapMarkerIcon = 'fa-solid fa-location-dot';

export const drawColorOptions = [
  '#ffcc66',
  '#ff6b6b',
  '#4dabf7',
  '#63e6be',
  '#845ef7',
  '#ffd43b',
  '#ffffff',
  '#000000',
];

export const markerIconLabels: Record<MapMarkerIcon, string> = {
  'fa-solid fa-location-dot': '場所',
  'fa-solid fa-star': '星',
  'fa-solid fa-flag': '旗',
  'fa-solid fa-landmark': 'ランドマーク',
  'fa-solid fa-skull-crossbones': '危険',
  'fa-solid fa-city': '都市',
  'fa-solid fa-mountain': '山脈',
  'fa-solid fa-tree': '森',
  'fa-solid fa-water': '水域',
  'fa-solid fa-campground': 'キャンプ',
};

export const markerIconOptions: MapMarkerIcon[] = [
  'fa-solid fa-location-dot',
  'fa-solid fa-star',
  'fa-solid fa-flag',
  'fa-solid fa-landmark',
  'fa-solid fa-skull-crossbones',
  'fa-solid fa-city',
  'fa-solid fa-mountain',
  'fa-solid fa-tree',
  'fa-solid fa-water',
  'fa-solid fa-campground',
];
