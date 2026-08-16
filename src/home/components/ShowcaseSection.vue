<template>
  <div class="showcase-section">
    <!-- プロローグ展示エリア -->
    <div class="showcase-banner">
      <div class="banner-ornament">❖</div>
      <p class="banner-title">プロローグ · アスタリア</p>
      <p class="banner-sub">星の光は旅人を問わず、運命は筆を執る者を愛す</p>
      <p class="banner-hint">下からコアをひとつ選んで灯し、「旅を始める」をクリックしてください</p>
    </div>

    <!-- 統合された情報パネル -->
    <details class="info-panel">
      <summary>
        <span>世界の背景と関連情報</span>
        <span class="arrow-toggle">❖</span>
      </summary>
      <div class="info-content">
        <h3>アスタリアの世界</h3>
        <p>
          幼い頃、あなたはそんな物語を読んだことがあるだろうか？剣と魔法の異世界に息づく、幻想の物語。澄み切った揺るぎない誓いの言葉、英雄の騎行、そして凡人の手で紡がれる一頁のエピック。
        </p>

        <div class="world-quote">「故郷は背に、世界は目の前に。」</div>
        <div class="world-quote">
          「長夜が来たらん。我は今より見張りとなり、死に至るまで守り続けん。我は妻を娶らず、領地を持たず、子をもうけず。我は宝冠を戴かず、寵愛を競わず。我は職務に忠を尽くし、この地に生を捧げ死を迎えん。我は闇の中の剣、長城の守人、寒気を退ける炎、暁の光、眠りを呼び覚ます角笛、王国を護る堅盾なり。我が生命と栄誉を夜警団に捧げん。今夜も、夜々もそうあれ。」
        </div>
        <div class="world-quote">
          「栄光こそ我が命！」<br />
          「黒松よ常緑であれ。角笛よ長く鳴り響け。理想よ、初めの輝きのままに。長剣よ、往時の鋭さのままに。」
        </div>

        <p>
          ここはアスタリア。剣と魔法、詩と遠方、歴史とレジェンド、生者と死者、英雄とエピック、神々と運命の世界。
        </p>
        <p>夢と幼き日の、いちばんロマンティックな筆を手に取り、あなただけの冒険の物語を、自らの手で紡いでください。</p>
      </div>
    </details>
  </div>
</template>

<style scoped>
.showcase-banner {
  padding: 14px 22px;
  text-align: center;
}

.showcase-banner .banner-ornament {
  color: var(--border-strong-color);
  font-size: 1.35em;
  line-height: 1;
  margin-bottom: 6px;
}

.showcase-banner .banner-title {
  font-family: var(--title-font);
  font-weight: 700;
  color: var(--title-color);
  font-size: 1.3em;
  letter-spacing: 0.14em;
  margin: 0 0 6px;
}

.showcase-banner .banner-sub {
  font-style: italic;
  color: #e2c68d;
  margin: 0 0 8px;
  font-size: 0.97em;
}

.showcase-banner .banner-hint {
  font-size: 0.9em;
  color: #f2e8d2;
  opacity: 1;
  margin: 0;
}

.info-panel {
  margin-bottom: 25px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  background-color: var(--item-bg-color);
}

.info-panel > summary {
  font-family: var(--title-font);
  font-weight: 700;
  font-size: 1.1em;
  color: var(--title-color);
  background-color: rgba(58, 46, 30, 0.8);
  padding: 12px 20px;
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
}

.info-panel > summary::-webkit-details-marker {
  display: none;
}

.info-panel > summary:hover {
  background-color: rgba(78, 62, 40, 0.9);
}

.arrow-toggle {
  font-size: 0.8em;
  transition: transform 0.3s ease-out;
  display: inline-block;
}

.info-panel[open] > summary .arrow-toggle {
  transform: rotate(-90deg);
}

.info-content {
  padding: 15px 25px 25px 25px;
  line-height: 1.7;
  color: #e9dcc4;
  background-color: rgba(50, 40, 26, 0.9);
}

.info-content h3 {
  font-family: var(--title-font);
  color: var(--title-color);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 8px;
  margin: 25px 0 15px 0;
  font-size: 1.4em;
}

.info-content h3:first-child {
  margin-top: 5px;
}

.info-content p,
.info-content ul {
  margin: 0 0 1em 0;
}

.info-content ul {
  list-style: none;
  padding-left: 5px;
}

.info-content li {
  padding-left: 20px;
  position: relative;
}

.info-content li::before {
  content: '»';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--border-strong-color);
  font-weight: bold;
}

.info-content a {
  color: var(--link-color);
  text-decoration: none;
  font-weight: 500;
  word-break: break-all;
}

.info-content a:hover {
  text-decoration: underline;
  color: var(--title-color);
}

.world-quote {
  background-color: rgba(58, 46, 30, 0.55);
  border-left: 3px solid var(--border-strong-color);
  padding: 12px 18px;
  margin: 15px 0;
  font-style: normal;
  color: #f2e8d2;
  font-family: 'KaiTi', 'STKaiti', '楷体', var(--body-font);
  line-height: 1.6;
}
</style>
