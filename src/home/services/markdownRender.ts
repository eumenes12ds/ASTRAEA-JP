/**
 * 軽量 Markdown → HTML レンダラー
 * 対応する基本構文：見出し、太字、斜体、インラインコード、リンク、番号なしリスト、テーブル、水平線、改行
 */

/**
 * Markdown テキストを HTML 文字列に変換する
 * @param md 元の Markdown テキスト
 * @returns HTML 文字列
 */
export function renderMarkdown(md: string): string {
  if (!md) return '';

  // まず HTML 特殊文字をエスケープして XSS を防ぐ
  let html = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 行ごとに処理
  const lines = html.split('\n');
  const result: string[] = [];
  let inList = false;
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    // 水平線 ---
    if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed)) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push('<hr>');
      i++;
      continue;
    }

    // 見出し h1~h3
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      const level = headingMatch[1].length;
      result.push(`<h${level}>${inlineFormat(headingMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    // テーブル検出：現在の行と次の行がテーブル形式に一致する場合
    if (isTableRow(trimmed) && i + 1 < lines.length && isTableSeparator(lines[i + 1].trim())) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      // テーブルを解析
      const tableLines: string[] = [];
      while (i < lines.length && isTableRow(lines[i].trim())) {
        tableLines.push(lines[i].trim());
        // 区切り行をスキップ
        if (i + 1 < lines.length && isTableSeparator(lines[i + 1].trim())) {
          i++; // | :--- | :--- | 行をスキップ
        }
        i++;
      }
      result.push(renderTable(tableLines));
      continue;
    }

    // 番号なしリスト項目 (- または *)
    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push(`<li>${inlineFormat(listMatch[1])}</li>`);
      i++;
      continue;
    }

    // ノーマル行
    if (inList) {
      result.push('</ul>');
      inList = false;
    }

    if (trimmed === '') {
      result.push('<br>');
    } else {
      result.push(inlineFormat(trimmed) + '<br>');
    }
    i++;
  }

  if (inList) {
    result.push('</ul>');
  }

  return result.join('');
}

/**
 * インラインの Markdown 書式を処理する
 */
function inlineFormat(text: string): string {
  return (
    text
      // インラインコード `code`
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // 太字 **text**
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // 斜体 *text*
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // リンク [text](url)
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
      )
  );
}

/**
 * テーブル行かどうかを判定（| 区切りを含む）
 */
function isTableRow(line: string): boolean {
  return /^\|(.+)\|$/.test(line.trim());
}

/**
 * テーブルの区切り行かどうかを判定（| :--- | :--- | など）
 */
function isTableSeparator(line: string): boolean {
  return /^\|[\s:]*-{2,}[\s:]*(\|[\s:]*-{2,}[\s:]*)*\|$/.test(line.trim());
}

/**
 * テーブルを描画する
 */
function renderTable(rows: string[]): string {
  if (rows.length === 0) return '';

  const parseRow = (row: string): string[] =>
    row
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map(cell => cell.trim());

  const headerCells = parseRow(rows[0]);
  let html = '<table><thead><tr>';
  for (const cell of headerCells) {
    html += `<th>${inlineFormat(cell)}</th>`;
  }
  html += '</tr></thead><tbody>';

  for (let i = 1; i < rows.length; i++) {
    const cells = parseRow(rows[i]);
    html += '<tr>';
    for (const cell of cells) {
      html += `<td>${inlineFormat(cell)}</td>`;
    }
    html += '</tr>';
  }

  html += '</tbody></table>';
  return html;
}
