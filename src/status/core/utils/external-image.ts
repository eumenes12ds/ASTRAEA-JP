const ExternalImageHostAllowList = ['files.catbox.moe', 'i.ibb.co', 'wsrv.nl'];
const ExternalImageExtensionAllowList = ['.png', '.jpg', '.jpeg', '.webp', '.avif'];

export interface ExternalImageEntry {
  url: string;
  title: string;
}

export const getAllowedExternalImageUrl = (value: unknown) => {
  if (typeof value !== 'string') {
    if (value !== undefined && value !== null) {
      console.log('[ExternalImage] 非文字列の画像 URL を無視:', value);
    }
    return '';
  }

  const normalizedValue = _.trim(value);
  if (!normalizedValue) {
    return '';
  }

  try {
    const url = new URL(normalizedValue);
    if (url.protocol !== 'https:') {
      console.log('[ExternalImage] 非 https の画像 URL を無視:', normalizedValue);
      return '';
    }

    if (!ExternalImageHostAllowList.includes(url.hostname.toLowerCase())) {
      console.log('[ExternalImage] ホワイトリスト外の画像ドメインを無視:', normalizedValue);
      return '';
    }

    const pathname = url.pathname.toLowerCase();
    const hasAllowedExtension = ExternalImageExtensionAllowList.some(extension =>
      pathname.endsWith(extension),
    );

    if (!hasAllowedExtension) {
      console.log('[ExternalImage] ホワイトリスト外の画像拡張子を無視:', normalizedValue);
      return '';
    }

    return normalizedValue;
  } catch {
    return '';
  }
};

export const getAllowedExternalImageEntry = (value: unknown): ExternalImageEntry | null => {
  if (!_.isPlainObject(value)) {
    if (value !== undefined && value !== null) {
      console.log('[ExternalImage] オブジェクトではない画像エントリを無視:', value);
    }
    return null;
  }

  const titleValue = _.get(value, 'title');
  const title = typeof titleValue === 'string' ? _.trim(titleValue) : '';
  if (!title) {
    console.log('[ExternalImage] title が無い画像エントリを無視:', value);
    return null;
  }

  const url = getAllowedExternalImageUrl(_.get(value, 'url'));
  if (!url) {
    return null;
  }

  return { url, title };
};

export const getAllowedExternalImageEntries = (value: unknown): ExternalImageEntry[] => {
  if (!Array.isArray(value)) {
    if (value !== undefined && value !== null) {
      console.log('[ExternalImage] 配列ではない画像エントリ一覧を無視:', value);
    }
    return [];
  }

  const entries = value.map(getAllowedExternalImageEntry);
  return entries.filter((entry): entry is ExternalImageEntry => Boolean(entry));
};
