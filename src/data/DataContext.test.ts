import { expect, test } from 'vitest';
import { Segment } from '@/types';
import { appReducer, AppState } from './DataContext';

const emptyState = {
  trails: { original: {}, new: {} },
  segments: { original: {}, new: {} },
  newsflashes: { original: {}, new: {} },
  links: { original: {}, new: {} },
};

const segment1: Segment = {
  id: 1,
  name: 'Segment 1',
  description: 'Description 1',
  state: 'paved',
  trailIds: [11],
  links: [],
  geometry: {
    type: 'LineString',
    coordinates: [[]],
  },
};

const segment2: Segment = {
  id: 2,
  name: 'Segment 2',
  description: 'Description 2',
  state: 'stoneDust',
  trailIds: [22],
  links: [],
  geometry: {
    type: 'MultiLineString',
    coordinates: [[[]]],
  },
};

describe('upsert', () => {
  test('adds a new segment', () => {
    // Mock initial state with existing segment
    let state: AppState = {
      ...emptyState,
      segments: { original: { 1: segment1 }, new: {} },
    };

    // Add a segment
    state = appReducer(state, { action: 'upsert', type: 'segments', value: segment2 });

    // Assert the segment was properly added
    expect(state).toEqual({
      ...emptyState,
      segments: { original: { 1: segment1 }, new: { 2: segment2 } },
    });
  });

  test('deletes original segment', () => {
    // Mock initial state with existing segments
    let state: AppState = {
      ...emptyState,
      segments: { original: { 1: segment1, 2: segment2 }, new: {} },
    };

    // Delete an original segment
    state = appReducer(state, { action: 'delete', type: 'segments', id: 1 });

    // Assert the segment was properly deleted
    expect(state).toEqual({
      ...emptyState,
      segments: { original: { 1: segment1, 2: segment2 }, new: { 2: undefined } },
    });
  });

  test('deletes new segment', () => {
    // Mock initial state with existing segments
    let state: AppState = {
      ...emptyState,
      segments: { original: {}, new: { 1: segment1, 2: segment2 } },
    };

    // Delete a new segment
    state = appReducer(state, { action: 'delete', type: 'segments', id: 1 });

    // Assert the segment was properly deleted
    expect(state).toEqual({
      ...emptyState,
      segments: { original: {}, new: { 2: segment2 } },
    });
  });

  test('merges changes properly', () => {
    // Mock state
    const state: AppState = {
      ...emptyState,
      segments: {
        original: { 1: segment1, 2: segment2 },
        new: {
          1: { ...segment1, description: 'new description 1' },
          2: undefined,
          3: { ...segment2, id: 3 },
        },
      },
    };

    // Assert proper update, deletion, and creation
    expect({ ...state.segments.original, ...state.segments.new }).toEqual({
      1: { ...segment1, description: 'new description 1' },
      3: { ...segment2, id: 3 },
    });
  });
});
