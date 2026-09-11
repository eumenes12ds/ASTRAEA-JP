# リリスの会話画像

ASTRAEA-JP の常駐正規表現「運命コア・リリス会話装飾」で使用する 21 枚の表情画像と 2 枚の装飾 SVG です。

画像の出典: [AkabaneSaki/myrepo](https://github.com/AkabaneSaki/myrepo/tree/1d2b5f335b66f02c5e7d20e5506c2a929bc55cff/picture/lilith)。元の作者に帰属します。表情画像はバイト単位で保持し、英語ファイル名に変更しました。装飾 SVG は元の正規表現から抽出しています。詳細な出典とハッシュは manifest.json を参照してください。

実行時の参照は ASTRAEA-JP の固定タグ v1.5.8 を使用します。正規表現のインポート用 JSON は ../../regex/lilith-dialogue.json です。世界書の名前「リリス」と日本語 mood に対応し、旧チャットの中国語名と mood も読み取ります。不明な mood や画像の読み込み失敗時には playful.png を表示します。

| 世界書の mood | 旧チャットの mood | ファイル |
| --- | --- | --- |
| 厳粛 | 严肃 | serious.png |
| お茶目 | 俏皮 | playful.png |
| 嘲笑 | 嘲笑 | mocking.png |
| 軽蔑 | 嫌弃 | disdainful.png |
| 祝賀 | 庆祝 | celebrating.png |
| 嬉しい | 开心 | happy.png |
| 恐怖 | 恐惧 | afraid.png |
| 戦慄 | 惊恐 | terrified.png |
| 驚き | 惊讶 | surprised.png |
| 指導 | 指导 | guiding.png |
| 叱責 | 斥责 | scolding.png |
| 無言 | 无语 | speechless.png |
| 怒り | 气愤 | angry.png |
| 渇望 | 渴望 | longing.png |
| 狂喜 | 狂喜 | ecstatic.png |
| 号泣 | 痛哭 | crying.png |
| エッチ | 色色 | flirty.png |
| 誇り | 骄傲 | proud.png |
| 励まし | 鼓励 | encouraging.png |
| 意地悪笑い | 坏笑 | mischievous.png |
| 興奮 | 兴奋 | excited.png |
