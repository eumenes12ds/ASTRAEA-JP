// Display assets only: worldbook entry names remain the selection/save identifiers.
const base = 'https://testingcf.jsdelivr.net/gh/eumenes12ds/ASTRAEA-JP';
const portraits: Record<string, string> = {
  'オットー・アポカリプス': 'otto',
  エリアコア: 'ellia',
  ウィローコア: 'willow',
  アーミヤコア: 'amiya',
  'ドン・キホーテコア': 'don-quixote',
  キリンコア: 'giraffe',
  'ガウェイン・セシルコア': 'gawain',
  黒ウィローコア: 'dark-willow',
  ダリアンコア: 'dalian',
  小夜啼鳥コア: 'nightingale',
  チャチャコア: 'chacha',
  マーリンコア: 'merlin',
  読者コア: 'reader',
  先祖コア: 'ancestor',
};

export function corePortrait(label: string): string | undefined {
  if (label === 'リリスコア') return `${base}@v1.5.8/static/images/lilith/guiding.png`;
  const name = portraits[label];
  return name ? `${base}@v1.5.9/static/images/fate-cores/${name}.png` : undefined;
}

export function coreDisplayName(label: string): string {
  return label.replace(/コア$/, '');
}
