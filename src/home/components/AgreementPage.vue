<template>
  <div class="agreement-page">
    <!-- 環境チェックエリア -->
    <h2 class="section-heading">環境チェック</h2>
    <div class="env-check-container">
      <!-- タバーンヘルパー -->
      <div class="env-check-item">
        <div class="env-check-label">
          <span class="icon">⚙️</span>
          <span>タバーンヘルパー</span>
        </div>
        <div class="env-check-details">
          <span
            >バージョン:
            <strong :class="'status-' + (envStatus.tavernHelper.version ? 'ok' : 'unknown')">
              {{ envStatus.tavernHelper.version || '不明' }}
            </strong></span
          >
          <span
            >状態:
            <strong :class="'status-' + envStatus.tavernHelper.status">
              {{ envStatus.tavernHelper.statusText }}
            </strong></span
          >
        </div>
      </div>

      <!-- プロンプトテンプレート (EJS) -->
      <div class="env-check-item">
        <div class="env-check-label">
          <span class="icon">📄</span>
          <span>プロンプトテンプレート (EJS)</span>
        </div>
        <div class="env-check-details">
          <span
            >状態:
            <strong :class="'status-' + envStatus.ejsTemplate.status">
              {{ envStatus.ejsTemplate.statusText }}
            </strong></span
          >
          <span
            >有効?:
            <strong :class="'status-' + envStatus.ejsTemplate.enabledStatus">
              {{ envStatus.ejsTemplate.enabledText }}
            </strong></span
          >
        </div>
      </div>

      <!-- MVU フレームワーク -->
      <div class="env-check-item">
        <div class="env-check-label">
          <span class="icon">🧩</span>
          <span>MVU フレームワーク</span>
        </div>
        <div class="env-check-details">
          <span
            >状態:
            <strong :class="'status-' + envStatus.mvu.status">
              {{ envStatus.mvu.statusText }}
            </strong></span
          >
        </div>
      </div>

      <div class="recheck-container">
        <button class="recheck-button" :disabled="isChecking" @click="handleRecheck">
          {{ isChecking ? '検査中...' : '再検査' }}
        </button>
        <button v-if="canSkip" class="skip-button" @click="showSkipConfirm = true">検査をスキップ</button>
      </div>
    </div>

    <!-- 続行ボタン -->
    <div class="agreement-action">
      <button class="agree-button" :disabled="!canContinue" @click="handleContinue">続行</button>
    </div>

    <!-- 規約チェック -->
    <div class="agreement-checkbox-row" @click.prevent="toggleAgreed">
      <span class="custom-checkbox" :class="{ checked: isAgreed }">
        <span v-if="isAgreed" class="check-mark">✓</span>
      </span>
      <span class="agreement-text">
        私は<a class="agreement-link" @click.stop.prevent="showAgreementModal = true"
          >最終ユーザー使用許諾契約</a
        >に同意します
      </span>
    </div>

    <div class="flavor-text-container">
      <p class="flavor-text" :class="{ 'flavor-fading': isFlavorFading }">
        “ {{ currentFlavorText }} ”
      </p>
    </div>

    <!-- ユーザー契約モーダル -->
    <transition name="fade">
      <div v-if="showAgreementModal" class="modal-overlay" @click.self="showAgreementModal = false">
        <div class="modal-content agreement-modal">
          <h3 class="modal-title">最終ユーザー使用許諾契約</h3>
          <div class="modal-scroll-body">
            <h4>一、総則</h4>
            <p>
              「ASTRAEA」（以下「本プロジェクト」といいます）をご利用いただきありがとうございます。本プロジェクトは SillyTavern
              プラットフォームを基盤とするインタラクティブ・ストーリー／ロールプレイ創作コンテンツ集であり、キャラクターカード、世界書、フロントエンドUI、関連スクリプトツールなどを含みます（これらに限りません）。
            </p>
            <p>
              本プロジェクトをご利用になる前に、本契約の各条項をよくお読みいただき、十分にご理解ください。「同意」をクリックするか、その他の方法で本契約の受諾を確認した時点で、本契約の条項を読み、理解し、その拘束に同意したものとみなされます。
            </p>
            <p>本プロジェクトは無料で提供されます。</p>
            <h4>二、知的財産権</h4>
            <ul>
              <li>
                本プロジェクト内の<strong>オリジナルテキスト、キャラクター設定、世界観デザイン、美術素材およびコード</strong>などの知的財産権は、本プロジェクトの制作チームに帰属します。
              </li>
              <li>本プロジェクトには第三者のオープンソースコンポーネントや素材が含まれる場合があり、それぞれ対応するオープンソースライセンスに従います。</li>
              <li>本プロジェクトのいかなる内容も<strong>商業目的</strong>に使用してはなりません。</li>
            </ul>

            <h4>三、使用上の規範</h4>
            <ul>
              <li>本プロジェクトは<strong>個人学習、娯楽、および非商業的な交流</strong>のためにのみ利用できます。</li>
              <li>
                本プロジェクトを逆コンパイル、リバースエンジニアリングしたり、いかなる方法でもソースコードの抽出を試みてはなりません（公開済みの部分を除く）。
              </li>
              <li>本プロジェクトの内容を再配布、転売、または二次創作物として商品化してはなりません。</li>
              <li>中国国内のコミュニティやQQグループで本内容を拡散・議論してはなりません。</li>
              <li>
                本プロジェクトの利用体験や成果を公の場で共有する際は、<strong>出典を明記</strong>し、制作チームの成果を尊重してください。
              </li>
            </ul>

            <h4>四、免責事項</h4>
            <ul>
              <li>
                本プロジェクトは<strong>「現状のまま」</strong>提供され、制作チームはその適合性、完全性、またはエラーがないことについて、明示的または黙示的ないかなる保証も行いません。
              </li>
              <li>
                ユーザー自身の環境設定、ネットワーク状況、または不適切な操作によって生じたいかなる問題についても、制作チームは<strong>責任を負いません</strong>。
              </li>
              <li>
                本プロジェクトが生成するテキスト内容は AI モデルによって生成されます。制作チームは AI
                が生成した具体的な内容について<strong>審査義務および法的責任を負いません</strong>。
              </li>
              <li>ユーザーは AI 生成内容の妥当性と適切性を自ら判断し、自身の利用行為に対して責任を負うものとします。</li>
            </ul>

            <h4>五、プライバシーとデータ</h4>
            <ul>
              <li>
                本プロジェクトはユーザーのローカル環境で動作し、あなたの個人データを<strong>能動的に収集、アップロード、または保存することはありません</strong>。
              </li>
              <li>
                AI サービスとの通信は、ご自身で設定した API によって行われ、関連するデータの取り扱いは、対応する
                AI サービス提供者のプライバシーポリシーに従います。
              </li>
            </ul>

            <h4>六、契約の変更</h4>
            <p>
              制作チームはいつでも本契約を変更する権利を留保します。契約変更後も本プロジェクトを利用し続けた場合、変更後の契約内容を受け入れたものとみなされます。重大な変更については、更新のお知らせなどの方法でユーザーに通知されます。
            </p>

            <h4>七、その他</h4>
            <ul>
              <li>本契約の解釈権は、本プロジェクトの制作チームに帰属します。</li>
              <li>本契約のいずれかの条項が無効または執行不能と判断された場合でも、その他の条項は引き続き有効です。</li>
              <li>ご不明な点がある場合は、プロジェクトの公式チャンネルを通じて制作チームにご連絡ください。</li>
              <li>
                あなたの行為の重大性に応じて、制作チームはあなたの死後にウォーハンマー40,000の世界へ転生させ、永遠に帝皇へ己の価値を捧げさせるかどうかを独自に判断できます。
              </li>
            </ul>
          </div>
          <div class="modal-actions">
            <button class="modal-btn modal-btn-close" @click="showAgreementModal = false">
              閉じる
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 環境チェックスキップ確認モーダル -->
    <transition name="fade">
      <div v-if="showSkipConfirm" class="modal-overlay" @click.self="showSkipConfirm = false">
        <div class="modal-content">
          <h3 class="modal-title">⚠️ 環境チェックをスキップ</h3>
          <div class="modal-body">
            <p>環境チェックをスキップしようとしています。以下の内容をよく読んで確認してください：</p>
            <ul class="modal-list">
              <li>現在の実行環境のすべてのコンポーネントに<strong>異常がない</strong>ことを確認しました</li>
              <li>環境チェックをスキップすると、以降の機能が<strong>正常に使用できなくなる</strong>可能性があることを理解しています</li>
              <li>環境に起因するいかなる異常についても、<strong>作者は一切の責任を負いません</strong></li>
            </ul>
          </div>
          <div class="modal-actions">
            <button class="modal-btn modal-btn-cancel" @click="showSkipConfirm = false">
              キャンセル
            </button>
            <button class="modal-btn modal-btn-confirm" @click="confirmSkip">スキップを確認</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';
import { initialEnvStatus, performFullEnvCheck } from '../services/envCheck';

const emit = defineEmits(['agreed', 'envCheckComplete']);

// リピーターユーザーかどうか（過去に契約に同意したか）
const previouslyAgreed = inject<boolean>('previouslyAgreed', false);

const flavorTexts = [
  '黄昏が近づく。旅人よ、汝の筆はすでに整っている',
  '酒場の炉火は赤々と燃えている。今宵の詩篇は誰が紡ぐのか？',
  '星々は行間へと沈み、運命の歯車が回り始める',
  '聞け、風が運ぶいにしえの歌謡…',
  '昼と夜の境目で、あなただけの物語を探せ',
  '運命の詩篇は、しばしば取るに足らないひと時の間から始まる',
  '命一串は実はウォーハンマー世界観。488年開幕の8を二つ横倒しにすると40kになるから',
  '極めて極めて極めて極めて極めて極めて極めて極めて極めて極めて',
  'なぜならなぜならなぜならなぜならなぜならなぜならなぜならなぜならなぜならなぜならなぜなら',
];
let flavorIndex = Math.floor(Math.random() * flavorTexts.length);
const currentFlavorText = ref(flavorTexts[flavorIndex]);
const isFlavorFading = ref(false);
let flavorTimer: ReturnType<typeof setInterval> | null = null;

// 環境チェック関連
const isChecking = ref(false);
const recheckCount = ref(0);
const showSkipConfirm = ref(false);
const envStatus = ref({ ...initialEnvStatus });
const envPassed = ref(false);

// ユーザー契約関連
const isAgreed = ref(previouslyAgreed ? true : false);
const showAgreementModal = ref(false);

/** 再検査を3回行っても合格しない場合、スキップを許可する */
const canSkip = computed(() => {
  return recheckCount.value >= 3 && !envStatus.value.allOk && !isChecking.value;
});

/** 環境チェックに合格（またはスキップ）し、契約に同意している場合に続行できる */
const canContinue = computed(() => {
  return envPassed.value && isAgreed.value;
});

async function performCheck() {
  isChecking.value = true;

  try {
    const result = await performFullEnvCheck();
    envStatus.value = result;
    emit('envCheckComplete', result);

    if (result.allOk) {
      envPassed.value = true;
    }
  } catch (error) {
    console.error('環境チェックに失敗しました:', error);
  } finally {
    isChecking.value = false;
  }
}

/** 手動で再検査し、カウントを加算する */
function handleRecheck() {
  recheckCount.value++;
  performCheck();
}

/** 環境チェックのスキップを確認する */
function confirmSkip() {
  showSkipConfirm.value = false;
  envPassed.value = true;
  // リピーターユーザーはスキップ後に直接自動遷移（契約への同意が確認済みであること）
  if (isAgreed.value) {
    emit('agreed');
  }
}

function toggleAgreed() {
  isAgreed.value = !isAgreed.value;
}

function handleContinue() {
  if (canContinue.value) {
    emit('agreed');
  }
}

// 環境チェック状態を監視
watch(
  () => envStatus.value.allOk,
  allOk => {
    if (allOk && !isChecking.value) {
      envPassed.value = true;
    }
  },
);

// リピーターユーザー：環境合格後に自動遷移
watch(envPassed, passed => {
  if (passed && previouslyAgreed && isAgreed.value) {
    emit('agreed');
  }
});

onMounted(() => {
  performCheck();
  flavorTimer = setInterval(() => {
    // 先にフェードアウト
    isFlavorFading.value = true;
    setTimeout(() => {
      // フェードアウト完了後にテキストを切り替え
      flavorIndex = (flavorIndex + 1) % flavorTexts.length;
      currentFlavorText.value = flavorTexts[flavorIndex];
      // 再びフェードイン
      isFlavorFading.value = false;
    }, 600);
  }, 5000);
});

onUnmounted(() => {
  if (flavorTimer) {
    clearInterval(flavorTimer);
    flavorTimer = null;
  }
});
</script>

<style scoped>
.agreement-page {
  max-width: 900px;
  width: 100%;
  margin: auto;
}

/* エリアタイトル */
.section-heading {
  font-family: var(--title-font);
  font-weight: 700;
  color: var(--title-color);
  text-align: center;
  margin: 0 0 10px 0;
  font-size: 2.2em;
}

/* 環境チェックコンテナ  */
.env-check-container {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: rgba(253, 250, 245, 0.9);
  padding: 10px 20px;
  margin: 25px auto;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  max-width: 440px;
  width: 100%;
}

.env-check-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 5px;
  flex-wrap: wrap;
  gap: 10px;
}

.env-check-item:not(:last-child) {
  border-bottom: 1px dashed var(--border-color);
}

.env-check-label {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: var(--title-color);
}

.env-check-label .icon {
  font-size: 1.4em;
  margin-right: 12px;
  opacity: 0.8;
  line-height: 1;
}

.env-check-details {
  display: flex;
  align-items: center;
  font-size: 0.9em;
  gap: 15px;
  text-align: right;
}

.env-check-details strong {
  font-weight: 700;
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  min-width: 55px;
  text-align: center;
  border: 1px solid transparent;
}

.recheck-container {
  text-align: center;
  margin: 15px 0 0 0;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.recheck-button {
  font-family: var(--body-font);
  font-weight: 500;
  font-size: 1em;
  color: var(--title-color);
  background-color: var(--item-bg-color);
  border: 1px solid var(--border-color);
  padding: 8px 25px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.recheck-button:hover:not(:disabled) {
  background-color: var(--item-bg-hover-color);
  border-color: var(--border-strong-color);
}

.recheck-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.skip-button {
  font-family: var(--body-font);
  font-weight: 500;
  font-size: 1em;
  color: #856404;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  padding: 8px 25px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.skip-button:hover {
  background-color: #ffe69c;
  border-color: #e0a800;
}

.success-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  margin-top: 0;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  color: #155724;
  font-weight: 500;
}

.success-icon {
  font-size: 1.2em;
}

/* 続行ボタン */
.agreement-action {
  text-align: center;
  margin: 20px 0 0 0;
}

.agree-button {
  font-family: var(--body-font);
  font-weight: 600;
  font-size: 1.1em;
  color: #fff;
  background-color: var(--title-color);
  border: 1px solid var(--border-strong-color);
  padding: 12px 50px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 2px;
}

.agree-button:hover:not(:disabled) {
  background-color: var(--border-strong-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.agree-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background-color: #a89080;
  border-color: var(--border-color);
}

/* 契約チェックボックス行（ボタンの下） */
.agreement-checkbox-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 16px 0 20px 0;
  cursor: pointer;
  user-select: none;
  font-size: 0.95em;
  color: var(--text-color);
}

.agreement-checkbox-row:hover .custom-checkbox:not(.checked) {
  border-color: var(--border-strong-color);
}

.custom-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--item-bg-color);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.custom-checkbox.checked {
  background-color: var(--title-color);
  border-color: var(--title-color);
}

.check-mark {
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.agreement-text {
  line-height: 1.4;
}

.agreement-link {
  color: var(--link-color);
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s ease;
}

.agreement-link:hover {
  color: var(--title-color);
}

/* モーダルスタイル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background-color: #fffdf7;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 24px 28px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.agreement-modal {
  max-width: 600px;
}

.modal-title {
  font-family: var(--title-font);
  font-weight: 700;
  color: var(--title-color);
  margin: 0 0 16px 0;
  font-size: 1.3em;
  text-align: center;
}

.modal-scroll-body {
  max-height: 400px;
  overflow-y: auto;
  font-size: 0.92em;
  color: var(--text-color, #333);
  line-height: 1.7;
  padding-right: 5px;
}

.modal-scroll-body h4 {
  font-family: var(--title-font);
  color: var(--title-color);
  margin: 16px 0 8px 0;
  font-size: 1.05em;
  border-bottom: 1px dashed var(--border-color);
  padding-bottom: 4px;
}

.modal-scroll-body h4:first-child {
  margin-top: 0;
}

.modal-scroll-body p {
  margin: 0 0 8px 0;
}

.modal-scroll-body ul {
  margin: 0 0 8px 0;
  padding-left: 20px;
}

.modal-scroll-body li {
  margin-bottom: 5px;
}

.modal-scroll-body li strong {
  color: #c0392b;
}

.modal-scroll-body::-webkit-scrollbar {
  width: 5px;
}

.modal-scroll-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-scroll-body::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 3px;
}

.modal-body {
  font-size: 0.95em;
  color: var(--text-color, #333);
  line-height: 1.6;
}

.modal-body p {
  margin: 0 0 10px 0;
}

.modal-list {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.modal-list li {
  margin-bottom: 8px;
}

.modal-list li strong {
  color: #c0392b;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-btn {
  font-family: var(--body-font);
  font-weight: 500;
  font-size: 0.95em;
  padding: 8px 22px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
}

.modal-btn-close {
  color: var(--title-color);
  background-color: var(--item-bg-color, #f0f0f0);
  border-color: var(--border-color, #ccc);
}

.modal-btn-close:hover {
  background-color: var(--item-bg-hover-color, #e0e0e0);
}

.modal-btn-cancel {
  color: var(--title-color);
  background-color: var(--item-bg-color, #f0f0f0);
  border-color: var(--border-color, #ccc);
}

.modal-btn-cancel:hover {
  background-color: var(--item-bg-hover-color, #e0e0e0);
}

.modal-btn-confirm {
  color: #fff;
  background-color: #e67e22;
  border-color: #d35400;
}

.modal-btn-confirm:hover {
  background-color: #d35400;
}

/* フェードイン・フェードアウト */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.flavor-text-container {
  text-align: center;
  margin-top: 45px; /* 上部の機能エリアとの間に大きめの間隔を取り、余白を活かす */
  margin-bottom: 20px;
  padding: 0 20px;
  opacity: 0.8; /* 全体をわずかに透明にして焦点を奪わない */
}

.flavor-text {
  font-family:
    'Palatino Linotype', 'Book Antiqua', 'KaiTi', '楷体', serif; /* 優雅なセリフ体／楷書体を優先 */
  font-style: italic; /* 斜体で詩的な雰囲気を強調 */
  font-size: 0.95em;
  color: #9d8873; /* くすんだ墨跡のような、灰がかった茶色 */
  letter-spacing: 2px; /* 文字間隔を広げて読むテンポをゆっくりに */
  margin: 0;
  transition: opacity 0.6s ease;
}

.flavor-text.flavor-fading {
  opacity: 0;
}

/* レスポンシブ */
@media screen and (max-width: 600px) {
  .section-heading {
    font-size: 1.8em;
  }

  .agree-button {
    padding: 10px 35px;
    font-size: 1em;
  }

  .modal-scroll-body {
    max-height: 300px;
  }
}
</style>
