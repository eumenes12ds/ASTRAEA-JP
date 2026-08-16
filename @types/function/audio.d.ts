type Audio = {
  /** タイトル */
  title: string;
  /** オーディオのURL */
  url: string;
};

type AudioWithOptionalTitle = {
  /** タイトル */
  title?: string;
  /** オーディオのURL */
  url: string;
};

/**
 * 指定されたオーディオを再生する; そのオーディオが再生リストにない場合は、再生リストに追加される.
 *
 * @param type BGM ('bgm') または効果音 ('ambient')
 * @param audio 再生するオーディオ; タイトル (`title`) が設定されていない場合は、リンク (`url`) からファイル名を抽出してタイトルとする
 *
 * @example
 * // 指定されたリンクを BGM として再生する
 * playAudio('bgm', { url: 'http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3' });
 *
 * @example
 * // 指定されたリンクにタイトルを設定し、BGM として再生する
 * playAudio('bgm', { title: 'Kangaroo Music', url: 'http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3' });
 */
declare function playAudio(type: 'bgm' | 'ambient', audio: AudioWithOptionalTitle): void;

/**
 * 音楽を一時停止する
 *
 * @param type BGM ('bgm') または効果音 ('ambient')
 */
declare function pauseAudio(type: 'bgm' | 'ambient'): void;

/**
 * 再生リストを取得する
 *
 * @param type BGM ('bgm') または効果音 ('ambient')
 * @returns 再生リスト
 */
declare function getAudioList(type: 'bgm' | 'ambient'): Audio[];

/**
 * 再生リストを完全に `audio_list` で置き換える
 *
 * @param type BGM ('bgm') または効果音 ('ambient')
 * @param audio_list 新しい再生リスト; 中にタイトル (`title`) が設定されていないオーディオがある場合は、リンク (`url`) からファイル名を抽出してタイトルとする
 */
declare function replaceAudioList(type: 'bgm' | 'ambient', audio_list: AudioWithOptionalTitle[]): void;

/**
 * 再生リストの末尾に存在しないオーディオを追加する; 同じ `title` または `url` のオーディオは重複して追加されない
 *
 * @param type BGM ('bgm') または効果音 ('ambient')
 * @param audio_list 挿入するオーディオのリスト; 中にタイトル (`title`) が設定されていないオーディオがある場合は、リンク (`url`) からファイル名を抽出してタイトルとする
 */
declare function appendAudioList(type: 'bgm' | 'ambient', audio_list: AudioWithOptionalTitle[]): void;

type AudioSettings = {
  /** 有効かどうか */
  enabled: boolean;
  /**
   * 現在の再生モード
   * - repeat_one: 1曲リピート
   * - repeat_all: 全曲リピート
   * - shuffle: シャッフル再生
   * - play_one_and_stop: 1曲再生後に停止
   */
  mode: 'repeat_one' | 'repeat_all' | 'shuffle' | 'play_one_and_stop';
  /** ミュートかどうか */
  muted: boolean;
  /** 現在の音量 (0-100) */
  volume: number;
};

/**
 * オーディオ設定を取得する
 *
 * @param type BGM ('bgm') または効果音 ('ambient')
 * @returns オーディオ設定
 */
declare function getAudioSettings(type: 'bgm' | 'ambient'): AudioSettings;

/**
 * オーディオ設定を変更する; 指定されていないフィールドは元の設定を使用する.
 *
 * @param type BGM ('bgm') または効果音 ('ambient')
 * @param settings 変更するオーディオ設定
 *
 * @example
 * // BGM を1曲リピートに設定する
 * setAudioSettings('bgm', { mode: 'repeat_one' });
 *
 * @example
 * // 効果音をミュートに設定する
 * setAudioSettings('ambient', { muted: true });
 *
 * @example
 * // BGM の音量を 50% に設定する
 * setAudioSettings('bgm', { volume: 50 });
 */
declare function setAudioSettings(type: 'bgm' | 'ambient', settings: Partial<AudioSettings>): void;

type CurrentAudio = {
  /** 現在選択中/再生中のオーディオのリンク; 曲が選択されていない場合は空文字列 */
  src: string;
  /** 現在選択中のオーディオのタイトル; 一致しない場合は空文字列 */
  title: string;
  /** 再生中かどうか */
  playing: boolean;
  /** 再生進行度 (0-100) */
  progress: number;
};

/**
 * 現在再生中のオーディオ情報を取得する: リンク、タイトル、再生中かどうか、進行度
 *
 * @param type BGM ('bgm') または効果音 ('ambient')
 * @returns 現在のオーディオ情報
 *
 * @example
 * // 現在再生中の BGM を取得する
 * const { title, src, playing, progress } = getCurrentAudio('bgm');
 */
declare function getCurrentAudio(type: 'bgm' | 'ambient'): CurrentAudio;
