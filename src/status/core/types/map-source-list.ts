import { mapSources, type MapSourceKey } from './map-sources';

export interface MapSourceConfig {
  key: MapSourceKey;
  name: string;
  url: string;
}

export const mapSourceList: MapSourceConfig[] = [
  {
    key: 'low',
    name: '低解像度地図',
    url: mapSources.low.url,
  },
  {
    key: 'small',
    name: '高解像度地図',
    url: mapSources.small.url,
  },
];

export type { MapSourceKey };
