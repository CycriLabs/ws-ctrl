import { describe, expect, test } from 'vitest';
import { stringify } from './stringify.js';

class TestClass {}

describe('stringify', () => {
  test('should stringify a string', () => {
    expect(stringify('test')).toBe('test');
  });

  test('should stringify an array', () => {
    expect(stringify(['a', 'b', 'c'])).toBe('[a, b, c]');
    expect(stringify([1, 2, 3])).toBe('[1, 2, 3]');
  });

  test('should stringify nested arrays', () => {
    expect(stringify(['a', ['b', 'c']])).toBe('[a, [b, c]]');
  });

  test('should stringify null and undefined', () => {
    expect(stringify(null)).toBe('null');
    expect(stringify(undefined)).toBe('undefined');
  });

  test('should stringify objects with name property', () => {
    const obj = { name: 'TestObject' };
    expect(stringify(obj)).toBe('TestObject');
  });

  test('should stringify objects with overriddenName property', () => {
    const obj = { overriddenName: 'OverriddenName', name: 'Name' };
    expect(stringify(obj)).toBe('OverriddenName');
  });

  test('should stringify objects with toString method', () => {
    const obj = {
      toString() {
        return 'CustomToString';
      },
    };
    expect(stringify(obj)).toBe('CustomToString');
  });

  test('should truncate multiline strings from toString', () => {
    const obj = {
      toString() {
        return 'First line\nSecond line';
      },
    };
    expect(stringify(obj)).toBe('First line');
  });

  test('should handle objects with null toString result', () => {
    const obj = {
      toString() {
        return null;
      },
    };
    expect(stringify(obj)).toBe('null');
  });

  test('should handle classes', () => {
    expect(stringify(TestClass)).toBe('TestClass');
  });
});
