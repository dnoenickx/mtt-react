import { expect, test, describe, it } from 'vitest';
import { createMapping, getItem, normalizeMultiLineString, simpleDiff } from './utils';

describe('normalize GeoJSON', () => {
  test('MultiLineString', () => {
    const multiLineString = '{"type":"MultiLineString","coordinates":[[[-1,1],[-2,2],[-3,3]]]}';

    expect(normalizeMultiLineString(multiLineString)).toEqual({
      type: 'MultiLineString',
      coordinates: [
        [
          [-1, 1],
          [-2, 2],
          [-3, 3],
        ],
      ],
    });
  });

  test('LineString', () => {
    const lineString = '{"type":"LineString","coordinates":[[-1,1],[-2,2],[-3,3]]}';

    expect(normalizeMultiLineString(lineString)).toEqual({
      type: 'MultiLineString',
      coordinates: [
        [
          [-1, 1],
          [-2, 2],
          [-3, 3],
        ],
      ],
    });
  });

  test('LineString Feature', () => {
    const lineStringFeature =
      '{"type":"Feature","properties":{},"geometry":{"type":"LineString","coordinates":[[-1,1],[-2,2],[-3,3]]}}';

    expect(normalizeMultiLineString(lineStringFeature)).toEqual({
      type: 'MultiLineString',
      coordinates: [
        [
          [-1, 1],
          [-2, 2],
          [-3, 3],
        ],
      ],
    });
  });

  test('MultiLineString Feature', () => {
    const multiLineStringFeature = `{
      "type":"Feature",
      "properties":{},
      "geometry":{
        "type":"MultiLineString",
        "coordinates":[
          [[-1,1],[-2,2],[-3,3]],
          [[-4,4],[-5,5],[-6,6]]
        ]
      }
    }`;

    expect(normalizeMultiLineString(multiLineStringFeature)).toEqual({
      type: 'MultiLineString',
      coordinates: [
        [
          [-1, 1],
          [-2, 2],
          [-3, 3],
        ],
        [
          [-4, 4],
          [-5, 5],
          [-6, 6],
        ],
      ],
    });
  });

  test('LineString Feature Collection', () => {
    const lineStringFeatureCollection = `{
      "type":"FeatureCollection",
      "features":[
        {"type":"Feature","properties":{},"geometry":{"type":"LineString","coordinates":[[-1,1],[-2,2],[-3,3]]}},
        {"type":"Feature","properties":{},"geometry":{"type":"LineString","coordinates":[[-4,4],[-5,5],[-6,6]]}}
      ]
    }`;

    expect(normalizeMultiLineString(lineStringFeatureCollection)).toEqual({
      type: 'MultiLineString',
      coordinates: [
        [
          [-1, 1],
          [-2, 2],
          [-3, 3],
        ],
        [
          [-4, 4],
          [-5, 5],
          [-6, 6],
        ],
      ],
    });
  });

  test('MultiLineString Feature Collection', () => {
    const multiLineStringFeatureCollection = `{
      "type":"FeatureCollection",
      "features":[
        {"type":"Feature","properties":{},"geometry":{"type":"MultiLineString","coordinates":[[[-1,1],[-2,2],[-3,3]]]}},
        {"type":"Feature","properties":{},"geometry":{"type":"MultiLineString","coordinates":[[[-4,4],[-5,5],[-6,6]]]}}
      ]
    }`;

    expect(normalizeMultiLineString(multiLineStringFeatureCollection)).toEqual({
      type: 'MultiLineString',
      coordinates: [
        [
          [-1, 1],
          [-2, 2],
          [-3, 3],
        ],
        [
          [-4, 4],
          [-5, 5],
          [-6, 6],
        ],
      ],
    });
  });

  test('Feature Collection with MultiLineStrings and LineString', () => {
    const mixedFeatureCollection = `{
      "type":"FeatureCollection",
      "features":[
        {"type":"Feature","properties":{},"geometry":{"type":"MultiLineString","coordinates":[[[-1,1],[-2,2],[-3,3]]]}},
        {"type":"Feature","properties":{},"geometry":{"type":"LineString","coordinates":[[-4,4],[-5,5],[-6,6]]}}
      ]
    }`;

    expect(normalizeMultiLineString(mixedFeatureCollection)).toEqual({
      type: 'MultiLineString',
      coordinates: [
        [
          [-1, 1],
          [-2, 2],
          [-3, 3],
        ],
        [
          [-4, 4],
          [-5, 5],
          [-6, 6],
        ],
      ],
    });
  });

  test('Invalid Input', () => {
    const invalidInput = 'This is not a valid GeoJSON string';
    expect(() => normalizeMultiLineString(invalidInput)).toThrowError();
  });
});

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

describe('getItem', () => {
  it('maintains lists', () => {
    const expectedValue = {
      '1': {
        trailIds: [9, 8, 7, 6],
      },
    };

    localStorage.setItem('test', JSON.stringify(expectedValue));

    const value = getItem('test');

    expect(value).toEqual(expectedValue);
  });

  it('replaces nulls', () => {
    localStorage.setItem('test', '{"1":null}');

    const value = getItem('test');

    expect(value).toEqual({ 1: undefined });
  });
});
