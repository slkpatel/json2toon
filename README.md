# json2toon

Convert JSON to [TOON (Token-Oriented Object Notation)](https://github.com/toon-format/toon) and back, for efficient LLM token usage, with statistics and CLI support.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## Features
- Convert JSON ↔ TOON format
- Token counting and cost savings statistics
- Handles nested objects, arrays, tabular data
- Escapes special characters
- Customizable indentation and key sorting
- TypeScript support
- Easy CLI and library usage

---

## Installation

```bash
npm install -g json2toon # CLI usage
npm install json2toon      # Library usage
```

---

## Quick Start

### Library Usage

```javascript
const { jsonToToon, toonToJson } = require('json2toon');

// JSON → TOON
const data = {
  users: [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'user' }
  ]
};
const toon = jsonToToon(data);
console.log('TOON Output:\n', toon);

// TOON → JSON
const toonStr = `users[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user`;
const json = toonToJson(toonStr);
console.log('JSON Output:', json);
```

---

### CLI Usage

Convert JSON to TOON:
```bash
json2toon -i data.json -o output.toon
```

Convert TOON to JSON:
```bash
json2toon -i data.toon -j -o output.json
```

Show conversion statistics:
```bash
json2toon -i data.json -s
```

See all CLI options:
```bash
json2toon --help
```

---

## Online Playground
Try it in your browser: [JSON ↔ TOON Playground](https://utoolslib.com/json-toon-converter/)

---

## API Reference

### `jsonToToon(json, options?)`
Converts JSON to TOON format.
- `json`: object or JSON string
- `options` (optional):
  - `indent` (number): Indentation spaces (default: 2)
  - `sortKeys` (boolean): Sort object keys (default: false)
  - `includeStats` (boolean): Return statistics (default: false)

Returns:
- TOON string, or
- `{ toon, stats }` if `includeStats: true`

### `toonToJson(toon)`
Converts TOON format back to JSON.
- `toon`: TOON string
- Returns: JSON object

### `formatStats(stats)`
Formats conversion statistics for display.

---

## Example: Tabular Array

```javascript
const data = {
  products: [
    { id: 1, name: 'Laptop', price: 999.99 },
    { id: 2, name: 'Mouse', price: 29.99 },
    { id: 3, name: 'Keyboard', price: 79.99 }
  ]
};
console.log(jsonToToon(data));
// products[3]{id,name,price}:
//   1,Laptop,999.99
//   2,Mouse,29.99
//   3,Keyboard,79.99
```

---

## Example: Nested Objects

```javascript
const data = {
  company: {
    name: 'TechCorp',
    location: { city: 'San Francisco', state: 'CA' }
  }
};
console.log(jsonToToon(data));
// company:
//   name: TechCorp
//   location:
//     city: San Francisco
//     state: CA
```

---

## Example: Cost Savings

```javascript
const result = jsonToToon(largeDataset, { includeStats: true });
console.log(formatStats(result.stats));
```

---

## Use Cases
- Reduce LLM API costs (30-60% fewer tokens)
- Fit more data in prompt/context
- Faster API responses
- Batch cost analysis
- A/B testing for prompt efficiency

---

## What is TOON?
TOON ([spec](https://github.com/toon-format/toon)) is a compact, readable format for LLMs:
- YAML-style indentation for objects
- CSV-style tabular layout for arrays
- Lossless JSON compatibility

**Example:**
```json
{
  "users": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ]
}
```
TOON:
```
users[2]{id,name}:
  1,Alice
  2,Bob
```

---

## TypeScript Support

You can use all main functions and types in TypeScript projects:

```typescript
import { jsonToToon, toonToJson, formatStats, ConversionResult, ConversionStats } from 'json2toon';

const result: ConversionResult = jsonToToon(data, { includeStats: true });
const stats: ConversionStats = result.stats;
console.log(formatStats(stats));

// ConversionStats type:
// When includeStats: true, you get detailed metrics:
interface ConversionStats {
  jsonTokenCount: number;      // Estimated tokens in JSON
  toonTokenCount: number;      // Estimated tokens in TOON
  tokensSaved: number;         // Tokens saved by conversion
  percentageSaved: number;     // Percentage of tokens saved
  jsonSize: number;            // JSON size in bytes
  toonSize: number;            // TOON size in bytes
  compressionRatio: number;    // Size ratio (TOON/JSON)
}
```

---

## Contributing
Contributions are welcome! Please submit a Pull Request.

---

## License
MIT © Sumit Patel

---

## Links
- [TOON Specification](https://github.com/toon-format/toon)
- [GitHub Repository](https://github.com/slkpatel/json2toon.git)
- [npm Package](https://www.npmjs.com/package/json2toon)
- [Report Issues](https://github.com/slkpatel/json2toon/issues)

---

## Acknowledgments
Based on the [TOON specification](https://github.com/toon-format/toon) for efficient LLM token usage.