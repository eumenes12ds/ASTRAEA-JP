import { klona } from 'klona';

/**
 * 酒場のマクロを使用してテキストを解析
 */
export async function parseMacro(text: string): Promise<string> {
  if (!text) return text;
  try {
    return (await SillyTavern.substituteParams(text)) as unknown as string;
  } catch {
    return text;
  }
}

/**
 * オブジェクトを深く走査し、すべての文字列フィールドのマクロを解析
 * @param obj 解析するオブジェクト
 * @returns 解析後のオブジェクトのディープコピー
 */
export async function parseMacroDeep<T>(obj: T): Promise<T> {
  const cloned = klona(obj);

  const parseValue = async (value: unknown): Promise<unknown> => {
    if (_.isString(value)) {
      return parseMacro(value);
    }
    if (_.isArray(value)) {
      return Promise.all(value.map(parseValue));
    }
    if (_.isPlainObject(value)) {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        result[k] = await parseValue(v);
      }
      return result;
    }
    return value;
  };

  return (await parseValue(cloned)) as T;
}
