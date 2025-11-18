/**
 * JSON to TOON (Token-Oriented Object Notation) Converter
 * Converts JSON data to TOON format for efficient LLM token usage
 */

export interface ToonOptions {
  indent?: number;
  sortKeys?: boolean;
  includeStats?: boolean;
}

export interface ConversionResult {
  toon: string;
  stats?: ConversionStats;
}

export interface ConversionStats {
  jsonTokenCount: number;
  toonTokenCount: number;
  tokensSaved: number;
  percentageSaved: number;
  jsonSize: number;
  toonSize: number;
  compressionRatio: number;
}

/**
 * Estimates token count for a given text
 * Uses a simple approximation: ~4 characters per token for English text
 * This is a rough estimate; actual tokenization varies by model
 */
function estimateTokenCount(text: string): number {
  // Remove whitespace for more accurate counting
  const withoutExtraSpaces = text.replace(/\s+/g, ' ');
  
  // Rough approximation: 4 characters per token
  // This accounts for common patterns in JSON/TOON
  const charCount = withoutExtraSpaces.length;
  const estimatedTokens = Math.ceil(charCount / 4);
  
  // Add tokens for structural elements (brackets, braces, colons, commas)
  const structuralChars = (text.match(/[{}[\]:,]/g) || []).length;
  
  return estimatedTokens + Math.ceil(structuralChars * 0.3);
}

/**
 * Checks if an array contains uniform objects (all objects with same keys)
 */
function isUniformArray(arr: any[]): boolean {
  if (arr.length === 0) return false;
  if (!arr.every(item => typeof item === 'object' && item !== null && !Array.isArray(item))) {
    return false;
  }

  const firstKeys = Object.keys(arr[0]).sort().join(',');
  return arr.every(item => Object.keys(item).sort().join(',') === firstKeys);
}

/**
 * Escapes special characters in TOON values
 */
function escapeValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'boolean') return value.toString();
  if (typeof value === 'number') return value.toString();
  
  const str = String(value);
  // Escape commas, newlines, and quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts a uniform array to TOON tabular format
 */
function convertUniformArray(key: string, arr: any[], indent: number, options: ToonOptions): string {
  const keys = Object.keys(arr[0]);
  if (options.sortKeys) {
    keys.sort();
  }

  // Check if any values are arrays or nested objects
  const hasComplexValues = arr.some(item => 
    keys.some(k => Array.isArray(item[k]) || (typeof item[k] === 'object' && item[k] !== null))
  );

  // If complex values exist, treat as non-uniform array
  if (hasComplexValues) {
    return convertNonUniformArray(key, arr, indent, options);
  }

  const indentStr = ' '.repeat(indent);
  let result = `${key}[${arr.length}]{${keys.join(',')}}:\n`;

  for (const item of arr) {
    const values = keys.map(k => escapeValue(item[k]));
    result += `${indentStr}${values.join(',')}\n`;
  }

  return result.trimEnd();
}

/**
 * Converts a non-uniform array to TOON format
 */
function convertNonUniformArray(key: string, arr: any[], indent: number, options: ToonOptions): string {
  const indentStr = ' '.repeat(indent);
  let result = `${key}[${arr.length}]:\n`;

  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result += convertObject(value, indent, options)
        .split('\n')
        .map(line => indentStr + line)
        .join('\n') + '\n';
    } else if (Array.isArray(value)) {
      result += `${indentStr}${convertArray(`[${i}]`, value, indent + (options.indent || 2), options)}\n`;
    } else {
      result += `${indentStr}${escapeValue(value)}\n`;
    }
  }

  return result.trimEnd();
}

/**
 * Converts an array to TOON format
 */
function convertArray(key: string, arr: any[], indent: number, options: ToonOptions): string {
  // Handle empty arrays
  if (arr.length === 0) {
    return `${key}[0]{}:`;
  }
  
  if (isUniformArray(arr)) {
    return convertUniformArray(key, arr, indent, options);
  } else {
    return convertNonUniformArray(key, arr, indent, options);
  }
}

/**
 * Converts an object to TOON format
 */
function convertObject(obj: any, indent: number = 0, options: ToonOptions = {}): string {
  const indentStr = ' '.repeat(indent);
  let result = '';

  let keys = Object.keys(obj);
  if (options.sortKeys) {
    keys.sort();
  }

  for (const key of keys) {
    const value = obj[key];

    if (Array.isArray(value)) {
      result += indentStr + convertArray(key, value, indent + (options.indent || 2), options) + '\n';
    } else if (typeof value === 'object' && value !== null) {
      result += `${indentStr}${key}:\n`;
      result += convertObject(value, indent + (options.indent || 2), options) + '\n';
    } else {
      result += `${indentStr}${key}: ${escapeValue(value)}\n`;
    }
  }

  return result.trimEnd();
}

/**
 * Calculates conversion statistics
 */
function calculateStats(jsonStr: string, toonStr: string): ConversionStats {
  const jsonTokenCount = estimateTokenCount(jsonStr);
  const toonTokenCount = estimateTokenCount(toonStr);
  const tokensSaved = jsonTokenCount - toonTokenCount;
  const percentageSaved = ((tokensSaved / jsonTokenCount) * 100);
  
  const jsonSize = jsonStr.length;
  const toonSize = toonStr.length;
  const compressionRatio = (toonSize / jsonSize);

  return {
    jsonTokenCount,
    toonTokenCount,
    tokensSaved,
    percentageSaved: Math.round(percentageSaved * 100) / 100,
    jsonSize,
    toonSize,
    compressionRatio: Math.round(compressionRatio * 1000) / 1000
  };
}

/**
 * Converts JSON to TOON format
 * @param json - JSON object or string to convert
 * @param options - Conversion options
 * @returns TOON formatted string or ConversionResult with stats
 */
export function jsonToToon(json: any, options: ToonOptions = {}): string | ConversionResult {
  const defaultOptions: ToonOptions = {
    indent: 2,
    sortKeys: false,
    includeStats: false,
    ...options
  };

  // Parse JSON if string is provided
  const obj = typeof json === 'string' ? JSON.parse(json) : json;
  
  // Generate JSON string for comparison
  const jsonStr = typeof json === 'string' ? json : JSON.stringify(obj, null, 2);

  let toonStr: string;
  
  if (Array.isArray(obj)) {
    toonStr = convertArray('root', obj, 0, defaultOptions);
  } else if (typeof obj === 'object' && obj !== null) {
    toonStr = convertObject(obj, 0, defaultOptions);
  } else {
    toonStr = escapeValue(obj);
  }

  // Return with stats if requested
  if (defaultOptions.includeStats) {
    const stats = calculateStats(jsonStr, toonStr);
    return {
      toon: toonStr,
      stats
    };
  }

  return toonStr;
}

/**
 * Converts TOON back to JSON (basic implementation)
 * Supports simple key-value pairs, nested objects, and tabular arrays
 */
export function toonToJson(toon: string): any {
  // Split lines and trim whitespace
  const lines = toon.split(/\r?\n/).map(line => line.trimEnd());
  let idx = 0;

  function parseObject(indent = 0): any {
    const obj: any = {};
    while (idx < lines.length) {
      const line = lines[idx];
      if (!line.trim()) { idx++; continue; }
      const currentIndent = line.match(/^ */)?.[0].length || 0;
      if (currentIndent < indent) break;
      // Tabular array: key[n]{a,b,c}:
      const tabularMatch = line.match(/^(\w+)\[(\d+)\]{([^}]*)}:/);
      if (tabularMatch) {
        const key = tabularMatch[1];
        const count = parseInt(tabularMatch[2], 10);
        const columns = tabularMatch[3].split(',').map(s => s.trim());
        idx++;
        const arr = [];
        for (let i = 0; i < count && idx < lines.length; i++, idx++) {
          const row = lines[idx].trim();
          if (!row) continue;
          // Handle quoted values
          const values = row.match(/("[^"]*"|[^,]+)/g)?.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"')) || [];
          const item: any = {};
          columns.forEach((col, j) => {
            let val: any = values[j];
            if (val === 'null') val = null;
            else if (val === 'true') val = true;
            else if (val === 'false') val = false;
            else if (!isNaN(Number(val)) && val.trim() !== '') val = Number(val);
            item[col] = val;
          });
          arr.push(item);
        }
        obj[key] = arr;
        continue;
      }
      // Non-tabular array: key[n]:
      const arrayMatch = line.match(/^(\w+)\[(\d+)\]:/);
      if (arrayMatch) {
        const key = arrayMatch[1];
        const count = parseInt(arrayMatch[2], 10);
        idx++;
        const arr = [];
        for (let i = 0; i < count && idx < lines.length; i++, idx++) {
          const arrLine = lines[idx].trim();
          if (!arrLine) continue;
          if (arrLine.match(/^\w+:/)) {
            // Nested object
            idx--;
            arr.push(parseObject(currentIndent + 2));
          } else {
            arr.push(arrLine === 'null' ? null : arrLine);
          }
        }
        obj[key] = arr;
        continue;
      }
      // Nested object: key:
      const nestedMatch = line.match(/^(\w+):$/);
      if (nestedMatch) {
        const key = nestedMatch[1];
        idx++;
        obj[key] = parseObject(currentIndent + 2);
        continue;
      }
      // Key-value: key: value
      const kvMatch = line.match(/^(\w+): (.+)$/);
      if (kvMatch) {
        const key = kvMatch[1];
        const rawValue = kvMatch[2];
        let parsedValue: any = rawValue;
        if (rawValue === 'null') parsedValue = null;
        else if (rawValue === 'true') parsedValue = true;
        else if (rawValue === 'false') parsedValue = false;
        else if (!isNaN(Number(rawValue)) && rawValue.trim() !== '') parsedValue = Number(rawValue);
        obj[key] = parsedValue;
        idx++;
        continue;
      }
      idx++;
    }
    return obj;
  }

  // Start parsing from the top
  return parseObject(0);
}

/**
 * Utility function to print stats in a readable format
 */
export function formatStats(stats: ConversionStats): string {
  return `
Conversion Statistics:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Token Count:
   JSON:  Estimated ${stats.jsonTokenCount} tokens
   TOON:  Estimated ${stats.toonTokenCount} tokens
   Saved: ${stats.tokensSaved} tokens (${stats.percentageSaved}%)

📦 File Size:
   JSON:  ${stats.jsonSize} bytes
   TOON:  ${stats.toonSize} bytes
   Ratio: ${stats.compressionRatio}x

💰 Cost Savings (estimated):
   At $0.003/1K tokens: $${((stats.tokensSaved / 1000) * 0.003).toFixed(6)} per request
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();
}

// Default export
export default {
  jsonToToon,
  toonToJson,
  formatStats
};