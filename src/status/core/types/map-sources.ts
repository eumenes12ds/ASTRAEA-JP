export const mapSources = {
  low: {
    type: 'image',
    url: 'https://raw.githubusercontent.com/eumenes12ds/ASTRAEA-JP/v1.5.3/static/map/Maplite-4096.webp',
  },
  small: {
    type: 'image',
    url: 'https://raw.githubusercontent.com/eumenes12ds/ASTRAEA-JP/v1.5.3/static/map/Maplite.webp',
  },
} as const;

export type MapSourceKey = keyof typeof mapSources;
