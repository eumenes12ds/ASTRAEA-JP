import JSON5 from 'json5';

const DATA_BASE_PATH = `https://testingcf.jsdelivr.net/gh/eumenes12ds/ASTRAEA-JP@${__APP_VERSION__}/public/assets/data`;

export const loadPredefinedData = async <T>(file_name: string, log_label: string) => {
  try {
    const response = await fetch(`${DATA_BASE_PATH}/${file_name}`);
    if (!response.ok) {
      console.log(`[${log_label}] プリセットデータファイルが見つかりません:`, file_name);
      return null;
    }

    const text = await response.text();
    const data = JSON5.parse(text) as T;
    console.log(`[${log_label}] プリセットデータファイルの読み込みに成功:`, file_name);
    return data;
  } catch (error) {
    console.warn(`[${log_label}] プリセットデータの読み込みに失敗:`, error);
    return null;
  }
};
