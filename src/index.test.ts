import { jsonToToon, formatStats, ConversionResult, toonToJson } from './index';

describe('jsonToToon', () => {
  describe('Simple Objects', () => {
    test('converts simple key-value pairs', () => {
      const input = {
        name: 'Alice',
        age: 30,
        active: true
      };
      const result = jsonToToon(input);
      expect(result).toContain('name: Alice');
      expect(result).toContain('age: 30');
      expect(result).toContain('active: true');
    });

    test('handles nested objects', () => {
      const input = {
        user: {
          name: 'Bob',
          address: {
            city: 'New York',
            zip: '10001'
          }
        }
      };
      const result = jsonToToon(input);
      expect(result).toContain('user:');
      expect(result).toContain('name: Bob');
      expect(result).toContain('address:');
      expect(result).toContain('city: New York');
    });
  });

  describe('Uniform Arrays', () => {
    test('converts uniform array to tabular format', () => {
      const input = {
        users: [
          { id: 1, name: 'Alice', role: 'admin' },
          { id: 2, name: 'Bob', role: 'user' }
        ]
      };
      const result = jsonToToon(input);
      expect(result).toContain('users[2]{id,name,role}:');
      expect(result).toContain('1,Alice,admin');
      expect(result).toContain('2,Bob,user');
    });

    test('handles empty arrays', () => {
      const input = { items: [] };
      const result = jsonToToon(input);
      expect(result).toContain('items[0]{}:');
    });
  });

  describe('Non-Uniform Arrays', () => {
    test('converts mixed type arrays', () => {
      const input = {
        mixed: [1, 'string', true, null]
      };
      const result = jsonToToon(input);
      expect(result).toContain('mixed[4]:');
      expect(result).toContain('1');
      expect(result).toContain('string');
      expect(result).toContain('true');
      expect(result).toContain('null');
    });

    test('handles arrays with different object structures', () => {
      const input = {
        items: [
          { id: 1, name: 'Item1' },
          { id: 2, name: 'Item2', extra: 'data' }
        ]
      };
      const result = jsonToToon(input);
      expect(result).toContain('items[2]:');
    });
  });

  describe('Special Characters', () => {
    test('escapes commas in values', () => {
      const input = {
        users: [
          { name: 'Smith, John', age: 30 }
        ]
      };
      const result = jsonToToon(input);
      expect(result).toContain('"Smith, John"');
    });

    test('escapes quotes in values', () => {
      const input = {
        users: [
          { quote: 'He said "hello"', id: 1 }
        ]
      };
      const result = jsonToToon(input);
      expect(result).toContain('He said ""hello""');
    });
  });

  describe('Options', () => {
    test('respects custom indentation', () => {
      const input = {
        parent: {
          child: 'value'
        }
      };
      const result = jsonToToon(input, { indent: 4 });
      expect(result).toContain('    child: value');
    });

    test('sorts keys when sortKeys is true', () => {
      const input = {
        zebra: 1,
        apple: 2,
        banana: 3
      };
      const result = jsonToToon(input, { sortKeys: true }) as string;
      const lines = result.split('\n');
      expect(lines[0]).toContain('apple');
      expect(lines[1]).toContain('banana');
      expect(lines[2]).toContain('zebra');
    });
  });

  describe('Complex Structures', () => {
    test('handles deeply nested structures', () => {
      const input = {
        company: {
          name: 'Tech Corp',
          departments: [
            {
              name: 'Engineering',
              employees: [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' }
              ]
            }
          ]
        }
      };
      const result = jsonToToon(input);
      expect(result).toContain('company:');
      expect(result).toContain('departments[1]');
      expect(result).toContain('employees[2]{id,name}:');
    });
  });

  describe('Edge Cases', () => {
    test('handles null values', () => {
      const input = { value: null };
      const result = jsonToToon(input);
      expect(result).toContain('value: null');
    });

    test('handles boolean values', () => {
      const input = { isActive: true, isDeleted: false };
      const result = jsonToToon(input);
      expect(result).toContain('isActive: true');
      expect(result).toContain('isDeleted: false');
    });

    test('handles numbers including zero', () => {
      const input = { count: 0, price: 99.99, negative: -5 };
      const result = jsonToToon(input);
      expect(result).toContain('count: 0');
      expect(result).toContain('price: 99.99');
      expect(result).toContain('negative: -5');
    });

    test('parses JSON string input', () => {
      const jsonString = '{"name":"Alice","age":30}';
      const result = jsonToToon(jsonString);
      expect(result).toContain('name: Alice');
      expect(result).toContain('age: 30');
    });
  });
});

describe('toonToJson', () => {
  test('parses simple key-value TOON', () => {
    const toon = `name: Alice\nage: 30\nactive: true`;
    expect(toonToJson(toon)).toEqual({ name: 'Alice', age: 30, active: true });
  });

  test('parses nested objects', () => {
    const toon = `user:\n  name: Bob\n  address:\n    city: New York\n    zip: 10001`;
    expect(toonToJson(toon)).toEqual({ user: { name: 'Bob', address: { city: 'New York', zip: 10001 } } });
  });

  test('parses tabular arrays', () => {
    const toon = `users[2]{id,name,role}:\n  1,Alice,admin\n  2,Bob,user`;
    expect(toonToJson(toon)).toEqual({ users: [ { id: '1', name: 'Alice', role: 'admin' }, { id: '2', name: 'Bob', role: 'user' } ] });
  });

  test('parses non-tabular arrays', () => {
    const toon = `mixed[4]:\n  1\n  string\n  true\n  null`;
    expect(toonToJson(toon)).toEqual({ mixed: [ '1', 'string', true, null ] });
  });

  test('parses deeply nested structure', () => {
    const toon = `company:\n  name: Tech Corp\n  departments[1]:\n    name: Engineering\n    employees[2]{id,name}:\n      1,Alice\n      2,Bob`;
    expect(toonToJson(toon)).toEqual({ company: { name: 'Tech Corp', departments: [ { name: 'Engineering', employees: [ { id: '1', name: 'Alice' }, { id: '2', name: 'Bob' } ] } ] } });
  });

  test('parses boolean and null values', () => {
    const toon = `isActive: true\nisDeleted: false\nvalue: null`;
    expect(toonToJson(toon)).toEqual({ isActive: true, isDeleted: false, value: null });
  });

  test('parses numbers including zero', () => {
    const toon = `count: 0\nprice: 99.99\nnegative: -5`;
    expect(toonToJson(toon)).toEqual({ count: 0, price: 99.99, negative: -5 });
  });
});