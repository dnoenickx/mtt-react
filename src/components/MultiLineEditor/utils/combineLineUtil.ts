import { Feature, LineString, point, distance, lineString } from '@turf/turf';
import { generateUniqueId } from './utils';

// Helper function to get all permutations of an array
function getPermutations<T>(array: T[]): T[][] {
  if (array.length <= 1) return [array];

  const result: T[][] = [];
  array.forEach((current, i) => {
    const remaining = [...array.slice(0, i), ...array.slice(i + 1)];
    const permutationsOfRemaining = getPermutations(remaining);

    permutationsOfRemaining.forEach((perm) => {
      result.push([current, ...perm]);
    });
  });

  return result;
}

// Combine lines by trying all permutations (guaranteed optimal result)
function combineLinesByPermutation(lines: Feature<LineString>[]): Feature<LineString> {
  // Get all possible orderings of the lines
  const allPermutations = getPermutations(lines);

  let bestOrder: Feature<LineString>[] = [];
  let bestOrientation: boolean[] = [];
  let shortestDistance = Infinity;

  // Try each permutation
  allPermutations.forEach((perm) => {
    // For each permutation, try all possible orientations (2^n possibilities)
    const numOrientations = 2 ** perm.length;

    for (let orientationCode = 0; orientationCode < numOrientations; orientationCode += 1) {
      // Convert orientationCode to a binary array of booleans (reverse or not)
      const orientation = Array.from({ length: perm.length }, (_, i) =>
        // eslint-disable-next-line no-bitwise
        Boolean(orientationCode & (1 << i))
      );

      let totalDistance = 0;

      // Calculate total distance for this ordering and orientation
      perm.slice(0, -1).forEach((line1, i) => {
        const line2 = perm[i + 1];
        const coords1 = line1.geometry.coordinates;
        const coords2 = line2.geometry.coordinates;

        // Get the correct endpoints based on orientation
        const point1 = orientation[i] ? coords1[0] : coords1[coords1.length - 1];
        const point2 = orientation[i + 1] ? coords2[coords2.length - 1] : coords2[0];

        totalDistance += distance(point(point1), point(point2));
      });

      // Update if this is better
      if (totalDistance < shortestDistance) {
        shortestDistance = totalDistance;
        bestOrder = [...perm];
        bestOrientation = [...orientation];
      }
    }
  });

  // Build the final line using the best order and orientation
  const combinedCoordinates: number[][] = [];

  bestOrder.forEach((line, index) => {
    const coords = [...line.geometry.coordinates];

    // Reverse if needed
    if (bestOrientation[index]) {
      coords.reverse();
    }

    // For first line, add all coords; for others, check for duplicates with previous endpoint
    if (index === 0) {
      combinedCoordinates.push(...coords);
    } else {
      const prevEnd = combinedCoordinates[combinedCoordinates.length - 1];
      const curStart = coords[0];

      // Skip first point if it's a duplicate
      const isDuplicate =
        Math.abs(prevEnd[0] - curStart[0]) < 1e-8 && Math.abs(prevEnd[1] - curStart[1]) < 1e-8;

      combinedCoordinates.push(...(isDuplicate ? coords.slice(1) : coords));
    }
  });

  // Use Turf's lineString constructor and return with unique ID
  return { ...lineString(combinedCoordinates), id: generateUniqueId() };
}

// Improved greedy approach for larger sets (fallback for performance)
function combineLinesByGreedy(lines: Feature<LineString>[]): Feature<LineString> {
  let bestOrder: Feature<LineString>[] = [];
  let bestOrientation: boolean[] = [];
  let shortestDistance = Infinity;

  // Try each line as a starting point
  for (let startIndex = 0; startIndex < lines.length; startIndex += 1) {
    const remainingLines = [...lines];
    const firstLine = remainingLines.splice(startIndex, 1)[0];

    // Try both orientations of the first line
    for (let firstReversed = 0; firstReversed <= 1; firstReversed += 1) {
      const orderedLines = [firstLine];
      const lineOrientations = [Boolean(firstReversed)];
      let totalDistance = 0;

      const remainingIndices = Array.from({ length: lines.length }, (_, i) => i).filter(
        (i) => i !== startIndex
      );

      // Build the line sequence
      while (remainingIndices.length > 0) {
        const lastLine = orderedLines[orderedLines.length - 1];
        const lastReversed = lineOrientations[lineOrientations.length - 1];

        const lastCoords = lastLine.geometry.coordinates;
        const lastPoint = lastReversed ? lastCoords[0] : lastCoords[lastCoords.length - 1];

        let bestNextIndex = -1;
        let bestNextReversed = false;
        let minDistance = Infinity;

        // Find best next line and orientation
        remainingIndices.forEach((nextIndex) => {
          const nextLine = lines[nextIndex];
          const nextCoords = nextLine.geometry.coordinates;

          // Try both orientations
          const distToStart = distance(point(lastPoint), point(nextCoords[0]));
          const distToEnd = distance(point(lastPoint), point(nextCoords[nextCoords.length - 1]));

          if (distToStart < minDistance) {
            minDistance = distToStart;
            bestNextIndex = nextIndex;
            bestNextReversed = false;
          }

          if (distToEnd < minDistance) {
            minDistance = distToEnd;
            bestNextIndex = nextIndex;
            bestNextReversed = true;
          }
        });

        // Add the best line
        orderedLines.push(lines[bestNextIndex]);
        lineOrientations.push(bestNextReversed);
        totalDistance += minDistance;

        // Update remaining indices
        const idx = remainingIndices.indexOf(bestNextIndex);
        remainingIndices.splice(idx, 1);
      }

      // Check if this is the best solution so far
      if (totalDistance < shortestDistance) {
        shortestDistance = totalDistance;
        bestOrder = [...orderedLines];
        bestOrientation = [...lineOrientations];
      }
    }
  }

  // Build the final line using the best order and orientation
  const combinedCoordinates: number[][] = [];

  bestOrder.forEach((line, index) => {
    const coords = [...line.geometry.coordinates];

    // Reverse if needed
    if (bestOrientation[index]) {
      coords.reverse();
    }

    // For first line, add all coords; for others, check for duplicates with previous endpoint
    if (index === 0) {
      combinedCoordinates.push(...coords);
    } else {
      const prevEnd = combinedCoordinates[combinedCoordinates.length - 1];
      const curStart = coords[0];

      // Skip first point if it's a duplicate
      const isDuplicate =
        Math.abs(prevEnd[0] - curStart[0]) < 1e-8 && Math.abs(prevEnd[1] - curStart[1]) < 1e-8;

      combinedCoordinates.push(...(isDuplicate ? coords.slice(1) : coords));
    }
  });

  // Use Turf's lineString constructor and return with unique ID
  return { ...lineString(combinedCoordinates), id: generateUniqueId() };
}

export const combineLines = (lines: Feature<LineString>[]): Feature<LineString> | undefined => {
  if (lines.length === 0) return undefined;
  if (lines.length === 1) return lines[0];

  // For a smaller number of lines, we can try all permutations
  // This guarantees finding the optimal arrangement
  if (lines.length <= 8) {
    return combineLinesByPermutation(lines);
  }

  // Fall back to the improved greedy approach for larger sets
  return combineLinesByGreedy(lines);
};
