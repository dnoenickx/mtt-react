import { expect, test } from 'vitest';
import { segments } from './segments';
import { trails } from './trails';

describe('segments', () => {
  test('IDs unique', () => {
    const segmentIds = segments.map((segment) => segment.id);
    const duplicateIds = segmentIds.filter((id, index) => segmentIds.indexOf(id) !== index);

    expect(new Set(segmentIds).size, `Duplicate segment IDs: ${duplicateIds}`).toBe(
      segments.length
    );
  });

  test('trail IDs exist', () => {
    const invalidTrailIds: number[] = [];

    segments.forEach((segment) => {
      segment.trailIds.forEach((trailId: number) => {
        if (!trails.some((trail) => trail.id === trailId)) {
          invalidTrailIds.push(trailId);
        }
      });
    });

    if (invalidTrailIds.length > 0) {
      console.error('Trail IDs not found:', invalidTrailIds);
      expect(false).toBe(true); // Fail the test if invalid trail IDs exist
    }
  });
});

describe('trails', () => {
  test('trail IDs unique', () => {
    const trailIds = trails.map((trail) => trail.id);
    const duplicateIds = trailIds.filter((id, index) => trailIds.indexOf(id) !== index);

    expect(new Set(trailIds).size, `Duplicate segment IDs: ${duplicateIds}`).toBe(trails.length);
  });
});
