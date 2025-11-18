const { toonToJson } = require('../dist/index');

// Example 1: Simple key-value TOON
const toon1 = `name: Alice\nage: 30\nactive: true`;
console.log('Example 1:', toonToJson(toon1));

// Example 2: Nested objects
const toon2 = `user:\n  name: Bob\n  address:\n    city: New York\n    zip: 10001`;
console.log('Example 2:', toonToJson(toon2));

// Example 3: Tabular arrays
const toon3 = `users[2]{id,name,role}:\n  1,Alice,admin\n  2,Bob,user`;
console.log('Example 3:', toonToJson(toon3));

// Example 4: Non-tabular arrays
const toon4 = `mixed[4]:\n  1\n  string\n  true\n  null`;
console.log('Example 4:', toonToJson(toon4));

// Example 5: Deeply nested structure
const toon5 = `company:\n  name: Tech Corp\n  departments[1]:\n    name: Engineering\n    employees[2]{id,name}:\n      1,Alice\n      2,Bob`;
console.log('Example 5:', JSON.stringify(toonToJson(toon5), null, 2));

// Example 6: Boolean, null, and numbers
const toon6 = `isActive: true\nisDeleted: false\nvalue: null\ncount: 0\nprice: 99.99\nnegative: -5`;
console.log('Example 6:', toonToJson(toon6));
