import { compare } from 'compare-versions';
import JSON5 from 'json5';
import { jsonrepair } from 'jsonrepair';
import { toDotPath } from 'zod/v4/core';

export function assignInplace<T>(destination: T[], new_array: T[]): T[] {
  destination.length = 0;
  destination.push(...new_array);
  return destination;
}

// _.merge の配列マージ処理を修正する。[1, 2, 3] と [4, 5] をマージすると [4, 5, 3] ではなく [4, 5] になる
export function correctlyMerge<TObject, TSource>(lhs: TObject, rhs: TSource): TObject & TSource {
  return _.mergeWith(lhs, rhs, (_lhs, rhs) => (_.isArray(rhs) ? rhs : undefined));
}

export function chunkBy<T>(array: T[], predicate: (lhs: T, rhs: T) => boolean): T[][] {
  if (array.length === 0) {
    return [];
  }

  const chunks: T[][] = [[array[0]]];
  for (const [lhs, rhs] of _.zip(_.dropRight(array), _.drop(array))) {
    if (predicate(lhs!, rhs!)) {
      chunks[chunks.length - 1].push(rhs!);
    } else {
      chunks.push([rhs!]);
    }
  }
  return chunks;
}

export function regexFromString(input: string, replace_macros?: boolean): RegExp | null {
  if (!input) {
    return null;
  }
  const makeRegex = (pattern: string, flags: string) => {
    if (replace_macros) {
      pattern = substitudeMacros(pattern);
    }
    return new RegExp(pattern, flags);
  };
  try {
    const match = input.match(/\/(.+)\/([a-z]*)/i);
    if (!match) {
      return makeRegex(_.escapeRegExp(input), 'i');
    }
    if (match[2] && !/^(?!.*?(.).*?\1)[gmixXsuUAJ]+$/.test(match[3])) {
      return makeRegex(input, 'i');
    }
    let flags = match[2] ?? '';
    _.pull(flags, 'g');
    if (flags.indexOf('i') === -1) {
      flags = flags + 'i';
    }
    return makeRegex(match[1], flags);
  } catch {
    return null;
  }
}

export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function checkMinimumVersion(expected: string, title: string) {
  if (compare(await getTavernHelperVersion(), expected, '<')) {
    toastr.error(
      `'${title}' には Tavern Helper バージョン >= '${expected}' が必要です`,
      'バージョン非互換',
    );
  }
}

export function prettifyErrorWithInput(error: z.ZodError) {
  return _([...error.issues])
    .sortBy(issue => issue.path?.length ?? 0)
    .flatMap(issue => {
      const lines = [`✖ ${issue.message}`];
      if (issue.path?.length) {
        lines.push(`  → パス: ${toDotPath(issue.path)}`);
      }
      if (issue.input !== undefined) {
        lines.push(`  → 入力: ${JSON.stringify(issue.input)}`);
      }
      return lines;
    })
    .join('\n');
}

export function literalYamlify(value: any) {
  return YAML.stringify(value, { blockQuote: 'literal' });
}

export function parseString(content: string): any {
  const json_first = /^[[{]/s.test(content.trimStart());
  try {
    if (json_first) {
      throw Error(`expected error`);
    }
    return YAML.parseDocument(content, { merge: true }).toJS();
  } catch (yaml_error1) {
    try {
      // eslint-disable-next-line import-x/no-named-as-default-member
      return JSON5.parse(content);
    } catch (json5_error) {
      try {
        return JSON.parse(jsonrepair(content));
      } catch (json_error) {
        try {
          if (!json_first) {
            throw Error(`expected error`);
          }
          return YAML.parseDocument(content, { merge: true }).toJS();
        } catch (yaml_error2) {
          const toError = (error: unknown) =>
            error instanceof Error ? `${error.stack ? error.stack : error.message}` : String(error);

          throw new Error(
            literalYamlify({
              ['解析対象の文字列が有効な YAML/JSON/JSON5 形式ではありません']: {
                文字列内容: content,
                YAMLエラー情報: toError(json_first ? yaml_error2 : yaml_error1),
                JSON5エラー情報: toError(json5_error),
                JSONエラー情報: toError(json_error),
              },
            }),
          );
        }
      }
    }
  }
}
