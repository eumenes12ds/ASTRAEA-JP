/**
 * 環境状態の初期値
 */
export const initialEnvStatus = {
  tavernHelper: {
    version: null as string | null,
    status: 'unknown',
    statusText: '読み込み中...',
  },
  ejsTemplate: {
    status: 'unknown',
    statusText: '読み込み中...',
    enabledStatus: 'unknown',
    enabledText: '読み込み中...',
  },
  mvu: {
    status: 'unknown',
    statusText: '読み込み中...',
  },
  allOk: false,
};

/**
 * バージョン比較ツール
 * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersion(v1: string | null, v2: string): number {
  if (!v1 || !v2) return -1;
  const s1 = String(v1);
  const s2 = String(v2);
  const arr1 = s1.split('.').map(Number);
  const arr2 = s2.split('.').map(Number);
  const len = Math.max(arr1.length, arr2.length);
  for (let i = 0; i < len; i++) {
    const num1 = arr1[i] || 0;
    const num2 = arr2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}
// タバーンヘルパーをチェック
export function checkTavernHelper() {
  const version = getTavernHelperVersion();

  if (!version) {
    return {
      version: null,
      status: 'error',
      statusText: '見つかりません',
    };
  }

  const isVersionOk = compareVersion(version, '4.8.19') >= 0;

  return {
    version,
    status: isVersionOk ? 'ok' : 'warn',
    statusText: isVersionOk ? '正常' : 'バージョンが古すぎます',
  };
}
// EJS をチェック
export function checkEjsTemplate() {
  try {
    const context = window.top?.SillyTavern.getContext();
    const ejsTemplateSettings = context.extensionSettings.EjsTemplate;

    if (!ejsTemplateSettings) {
      return {
        status: 'error',
        statusText: '未検出',
        enabled: false,
        enabledStatus: 'unknown',
        enabledText: '---',
      };
    }

    return {
      status: 'ok',
      statusText: '存在',
      enabled: ejsTemplateSettings.enabled,
      enabledStatus: ejsTemplateSettings.enabled ? 'ok' : 'warn',
      enabledText: ejsTemplateSettings.enabled ? '有効' : '無効',
    };
  } catch (e) {
    return {
      status: 'error',
      statusText: 'アクセスできません',
      enabled: false,
      enabledStatus: 'unknown',
      enabledText: '---',
    };
  }
}
// MVU をチェック
export async function checkMvu() {
  const timeoutDuration = 3000;
  let timeoutId;

  try {
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('timed out'));
      }, timeoutDuration);
    });

    await Promise.race([waitGlobalInitialized('Mvu'), timeoutPromise]);

    clearTimeout(timeoutId);

    return { status: 'ok', statusText: '正常' };
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    return { status: 'error', statusText: '異常/タイムアウト' };
  }
}
// 完全な環境チェックを実行
export async function performFullEnvCheck() {
  const tavernHelper = checkTavernHelper();
  const ejsTemplate = checkEjsTemplate();
  const mvu = await checkMvu();

  const allOk =
    tavernHelper.status === 'ok' &&
    ejsTemplate.status === 'ok' &&
    ejsTemplate.enabledStatus === 'ok' &&
    mvu.status === 'ok';

  return {
    tavernHelper,
    ejsTemplate,
    mvu,
    allOk,
  };
}
