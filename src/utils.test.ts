import { expect, test, describe, it } from 'vitest';
import { createMapping, simpleDiff } from './utils';

describe('createMapping', () => {
  test('happy path', () => {
    const list = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ];

    const key = 'id';
    const mapping = createMapping(list, key);

    expect(mapping).toEqual({
      1: { id: 1, name: 'Alice' },
      2: { id: 2, name: 'Bob' },
      3: { id: 3, name: 'Charlie' },
    });
  });

  test('empty array', () => {
    const list: any[] = [];
    const key = 'id';
    const mapping = createMapping(list, key);

    expect(mapping).toEqual({});
  });

  test('error when key not found', () => {
    const list = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ];

    const key = 'age';

    expect(() => createMapping(list, key)).toThrowError(
      "Key 'age' does not exist in any of the objects."
    );
  });
});

describe('simpleDiff', () => {
  it('return an empty object if oldVal and newVal are identical', () => {
    const oldVal = { a: 1, b: 2, c: { d: 3, e: [4, 5] } };
    const newVal = { a: 1, b: 2, c: { d: 3, e: [4, 5] } };
    expect(simpleDiff(oldVal, newVal)).toEqual({});
  });

  it('return differences between oldVal and newVal', () => {
    const oldVal = { a: 1, b: 2, c: { d: 3, e: [4, 5] } };
    const newVal = { a: 1, b: 4, c: { d: 3, e: [6, 7] }, f: { g: 8 } };
    expect(simpleDiff(oldVal, newVal)).toEqual({ b: 4, c: { e: [6, 7] }, f: { g: 8 } });
  });

  it('handle empty objects', () => {
    const oldVal = {};
    const newVal = { a: 1, b: 2, c: { d: 3 } };
    expect(simpleDiff(oldVal, newVal)).toEqual({ a: 1, b: 2, c: { d: 3 } });
  });

  it('handle oldVal being empty', () => {
    const oldVal = {};
    const newVal = { a: 1, b: 2, c: { d: 3 } };
    expect(simpleDiff(oldVal, newVal)).toEqual({ a: 1, b: 2, c: { d: 3 } });
  });

  it('handle newVal being empty', () => {
    const oldVal = { a: 1, b: 2, c: { d: 3 } };
    const newVal = {};
    expect(simpleDiff(oldVal, newVal)).toEqual({ a: undefined, b: undefined, c: undefined });
  });

  it('handle both oldVal and newVal being empty', () => {
    const oldVal = {};
    const newVal = {};
    expect(simpleDiff(oldVal, newVal)).toEqual({});
  });

  it('handle nested objects', () => {
    const oldVal = { a: 1, b: { c: 2, d: 3 } };
    const newVal = { a: 1, b: { c: 4, e: 5 } };
    expect(simpleDiff(oldVal, newVal)).toEqual({ b: { c: 4, d: undefined, e: 5 } });
  });

  it('handle nested arrays', () => {
    const oldVal = { a: [1, 2, 3], b: { c: [4, 5], d: 6 } };
    const newVal = { a: [1, 2, 4], b: { c: [4, 6], e: [7, 8] } };
    expect(simpleDiff(oldVal, newVal)).toEqual({
      a: [1, 2, 4],
      b: { c: [4, 6], d: undefined, e: [7, 8] },
    });
  });

  it('handle deep nested objects and arrays', () => {
    const oldVal = { a: { b: { c: [1, 2] } }, d: [{ e: { f: 3 } }] };
    const newVal = { a: { b: { c: [1, 3] } }, d: [{ e: { f: 4 } }, { g: 5 }] };
    expect(simpleDiff(oldVal, newVal)).toEqual({
      a: { b: { c: [1, 3] } },
      d: [{ e: { f: 4 } }, { g: 5 }],
    });
  });
});
