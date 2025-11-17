const { jsonToToon, formatStats } = require('../dist/index');

// Example 1: Basic conversion without stats
console.log('=== Example 1: Basic Conversion ===\n');
const simpleData = {
  name: 'Alice',
  age: 30,
  city: 'New York'
};

const toonOutput = jsonToToon(simpleData);
console.log(toonOutput);
console.log('\n');

// Example 2: Conversion with statistics
console.log('=== Example 2: With Statistics ===\n');
const userData = {
  users: [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'user' },
    { id: 4, name: 'Diana', email: 'diana@example.com', role: 'moderator' }
  ]
};

const result = jsonToToon(userData, { includeStats: true });
console.log('TOON Output:');
console.log(result.toon);
console.log('\n');
console.log(formatStats(result.stats));
console.log('\n');

// Example 3: Large dataset comparison
console.log('=== Example 3: Large Dataset ===\n');
const largeData = {
  products: Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    price: Math.random() * 100,
    category: ['Electronics', 'Clothing', 'Food', 'Books'][i % 4],
    inStock: i % 3 !== 0
  }))
};

const largeResult = jsonToToon(largeData, { includeStats: true });
console.log(formatStats(largeResult.stats));
console.log('\n');

// Example 4: Nested structure with stats
console.log('=== Example 4: Nested Structure ===\n');
const nestedData = {
  company: {
    name: 'TechCorp',
    founded: 2020,
    departments: [
      {
        name: 'Engineering',
        headCount: 50,
        teams: ['Backend', 'Frontend', 'DevOps']
      },
      {
        name: 'Sales',
        headCount: 30,
        teams: ['Enterprise', 'SMB', 'Partnerships']
      }
    ],
    locations: [
      { city: 'San Francisco', employees: 45 },
      { city: 'New York', employees: 35 }
    ]
  }
};
console.log('Original JSON:');
console.log(JSON.stringify(nestedData, null, 2));
console.log('\n');

const nestedResult = jsonToToon(nestedData, { includeStats: true, sortKeys: true });
console.log('TOON Output (with sorted keys):');
console.log(nestedResult.toon);
console.log('\n');
console.log(formatStats(nestedResult.stats));
console.log('\n');

// Example 5: Calculate cost savings for API calls
console.log('=== Example 5: API Cost Calculation ===\n');
const apiData = {
  transactions: Array.from({ length: 100 }, (_, i) => ({
    id: `txn_${i}`,
    amount: Math.floor(Math.random() * 10000),
    status: ['completed', 'pending', 'failed'][i % 3],
    timestamp: Date.now() - i * 60000
  }))
};

console.log('Simulated API JSON Payload:');
console.log(JSON.stringify(apiData, null, 2));
console.log('\n');
const apiResult = jsonToToon(apiData, { includeStats: true });
const stats = apiResult.stats;

console.log('TOON Payload:');
console.log(apiResult.toon);
console.log('\n');
console.log('Statistics:');

console.log(`Original JSON Tokens: ${stats.jsonTokenCount}`);
console.log(`TOON Tokens: ${stats.toonTokenCount}`);
console.log(`Tokens Saved per Request: ${stats.tokensSaved}`);
console.log(`Percentage Saved: ${stats.percentageSaved}%`);
console.log('\nCost Savings (Claude Sonnet 4 @ $3/M input tokens):');
console.log(`  Per request: $${((stats.tokensSaved / 1000000) * 3).toFixed(6)}`);
console.log(`  Per 1,000 requests: $${((stats.tokensSaved / 1000000) * 3 * 1000).toFixed(2)}`);
console.log(`  Per 1,000,000 requests: $${((stats.tokensSaved / 1000000) * 3 * 1000000).toFixed(2)}`);
console.log('\n');

// Example 6: Comparing different data structures
console.log('=== Example 6: Structure Comparison ===\n');

const structures = [
  {
    name: 'Flat Object',
    data: { a: 1, b: 2, c: 3, d: 4, e: 5 }
  },
  {
    name: 'Uniform Array',
    data: {
      items: Array.from({ length: 10 }, (_, i) => ({ id: i, value: i * 10 }))
    }
  },
  {
    name: 'Mixed Array',
    data: {
      items: [1, 'text', true, { nested: 'object' }, [1, 2, 3]]
    }
  }
];

structures.forEach(({ name, data }) => {
  const result = jsonToToon(data, { includeStats: true });
  console.log(`${name}:`);
  console.log(`  Tokens Saved: ${result.stats.tokensSaved} (${result.stats.percentageSaved}%)`);
  console.log(`  Compression: ${result.stats.compressionRatio}x`);
  console.log();
});