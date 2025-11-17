# json2toon

Convert JSON to [TOON (Token-Oriented Object Notation)](https://github.com/toon-format/toon) format for efficient LLM token usage with detailed statistics.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)


## Features

- ✅ Convert JSON to [TOON](https://github.com/toon-format/toon) format
- ✅ **Token counting and statistics**
- ✅ **Cost savings calculator**
- ✅ Handles uniform arrays with tabular layout
- ✅ Handles nested objects and arrays
- ✅ Escapes special characters
- ✅ Customizable indentation
- ✅ Optional key sorting
- ✅ TypeScript support with full type definitions
- ✅ CLI for easy conversion from the command line

## Installation

```bash
npm install -g json2toon # for CLI usage
```

## 🔧 Basic Usage (Library)

```javascript
const { jsonToToon } = require('json2toon');

const data = {
  name: 'Alice',
  age: 30,
  active: true
};

console.log(jsonToToon(data));
// Output:
// name: Alice
// age: 30
// active: true
```

## CLI Usage

Convert a JSON file to TOON format:

```bash
json2toon -i data.json -o output.toon
```

Show conversion statistics:

```bash
json2toon -i data.json -s
```

See all CLI options:

```bash
json2toon --help
```

## With Statistics (Library)

Get detailed token count and cost savings information:

```javascript
const { jsonToToon, formatStats } = require('json2toon');

const users = {
  users: [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'user' }
  ]
};

const result = jsonToToon(users, { includeStats: true });
console.log('TOON Output:');
console.log(result.toon);
console.log(formatStats(result.stats));
```

## API Reference

### `jsonToToon(json, options?)`
Converts JSON to TOON format ([spec](https://github.com/toon-format/toon)).

**Parameters:**
- `json` (object | string): JSON object or JSON string to convert
- `options` (object, optional):
  - `indent` (number): Number of spaces for indentation (default: 2)
  - `sortKeys` (boolean): Sort object keys alphabetically (default: false)
  - `includeStats` (boolean): Return statistics with conversion (default: false)

**Returns:**
- Without stats: `string` - TOON formatted string
- With stats: `ConversionResult` object with:
  - `toon` (string): TOON formatted output
  - `stats` (ConversionStats): Detailed statistics

### `formatStats(stats)`
Formats conversion statistics into a readable string.

**Parameters:**
- `stats` (ConversionStats): Statistics object from conversion

**Returns:** `string` - Formatted statistics report

## Statistics Object

When `includeStats: true`, you get detailed metrics:

```typescript
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

## Examples

### Uniform Array (Tabular Format)

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

### Nested Objects

```javascript
const data = {
  company: {
    name: 'TechCorp',
    location: {
      city: 'San Francisco',
      state: 'CA'
    }
  }
};

console.log(jsonToToon(data));
// company:
//   name: TechCorp
//   location:
//     city: San Francisco
//     state: CA
```

### Calculate Cost Savings for API Calls

```javascript
const largeDataset = {
  records: Array.from({ length: 100 }, (_, i) => ({
    id: i,
    timestamp: Date.now(),
    status: 'active'
  }))
};

const result = jsonToToon(largeDataset, { includeStats: true });

console.log(`Tokens saved per request: ${result.stats.tokensSaved}`);
console.log(`Cost per 1M requests (at $3/M tokens): $${
  (result.stats.tokensSaved / 1000000) * 3 * 1000000
}`);
```

## Use Cases

1. **Reduce LLM API Costs**: Save 30-60% on token usage for structured data
2. **Faster Processing**: Fewer tokens mean faster API responses
3. **Optimize Prompts**: Fit more data within context limits
4. **Batch Operations**: Analyze cost savings for large-scale operations
5. **A/B Testing**: Compare different data structures for efficiency

## What is TOON?

TOON ([specification](https://github.com/toon-format/toon)) is a compact format designed for LLM prompts that:

- Reduces token usage by 30-60% compared to JSON
- Uses YAML-style indentation for nested objects
- Uses CSV-style tabular layout for uniform arrays
- Maintains lossless JSON compatibility
- Improves readability while being more compact

### Format Examples

**JSON:**
```json
{
  "users": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ]
}
```

**TOON:**
```
users[2]{id,name}:
  1,Alice
  2,Bob
```

## Options

```javascript
jsonToToon(data, {
  indent: 4,           // Custom indentation (default: 2)
  sortKeys: true,      // Sort object keys alphabetically (default: false)
  includeStats: true   // Include conversion statistics (default: false)
});
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import { jsonToToon, formatStats, ConversionResult, ConversionStats } from 'json2toon';

const result: ConversionResult = jsonToToon(data, { includeStats: true });
const stats: ConversionStats = result.stats;
```

## Testing

```bash
npm test                 # Run tests
npm run test:coverage    # Run tests with coverage
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Sumit Patel

## 🔗 Links

- [TOON Specification](https://github.com/toon-format/toon)
- [GitHub Repository](https://github.com/slkpatel/json2toon.git)
- [npm Package](https://www.npmjs.com/package/json2toon)
- [Report Issues](https://github.com/slkpatel/json2toon/issues)

## Acknowledgments

Based on the [TOON specification](https://github.com/toon-format/toon) for efficient LLM token usage.