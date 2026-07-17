/**
 * CSV 解析与生成工具
 * 支持中文/特殊字符，兼容 Excel 打开
 */

export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * 解析 CSV 文本为结构化数据
 */
export function parseCSV(text: string): CsvParseResult {
  // 去除 UTF-8 BOM
  const clean = text.replace(/^\uFEFF/, '').trim();
  if (!clean) {
    return { headers: [], rows: [] };
  }

  const lines = splitCSVLines(clean);
  if (lines.length < 1) {
    return { headers: [], rows: [] };
  }

  const headers = parseCSVLine(lines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0].trim() === '')) continue;

    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (values[j] || '').trim();
    }
    rows.push(row);
  }

  return { headers, rows };
}

/**
 * 将 CSV 行按引号感知拆分
 */
function splitCSVLines(text: string): string[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    }

    if (ch === '\n' && !inQuotes) {
      if (current.endsWith('\r')) {
        current = current.slice(0, -1);
      }
      lines.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) {
    lines.push(current);
  }
  return lines;
}

/**
 * 解析单行 CSV（支持引号包裹和转义）
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

/**
 * 转义 CSV 字段值
 */
function escapeCSVField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

/**
 * 生成 CSV 文本
 */
export function generateCSV(headers: string[], rows: Record<string, string>[]): string {
  const lines: string[] = [];
  // UTF-8 BOM 确保 Excel 正确识别中文
  lines.push('\uFEFF' + headers.map(escapeCSVField).join(','));
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCSVField(row[h] || '')).join(','));
  }
  return lines.join('\r\n');
}

/**
 * 触发浏览器下载文件
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 读取上传的 CSV 文件
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file, 'UTF-8');
  });
}
