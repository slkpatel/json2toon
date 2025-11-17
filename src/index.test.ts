import { jsonToToon, formatStats, ConversionResult } from './index';

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