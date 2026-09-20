export const mapSources = {
  low: {
    type: 'image',
    url: 'https://raw.githubusercontent.com/eumenes12ds/ASTRAEA-JP/v1.5.15/static/map/map-4096.webp',
  },
  small: {
    type: 'image',
    url: 'https://raw.githubusercontent.com/eumenes12ds/ASTRAEA-JP/v1.5.15/static/map/map-8340.webp',
  },
} as const;

export type MapSourceKey = keyof typeof mapSources;
