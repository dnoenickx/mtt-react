const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');

// Helper function to update IDs for segments, trails, and events
function generateNewIdMapping(items, threshold) {
  const idMapping = {};
  let currentID = threshold + 1;
  for (const item of items) {
    if (item.id > threshold) {
      idMapping[item.id] = currentID++;
    }
  }
  return idMapping;
}

// Helper to find the number that precedes the first gap that is
// greater than the provided threshold when items are sorted
function findStartOfFirstGapLargerThanN(arr, gapThreshold = 1000) {
  return (
    arr
      .sort((a, b) => a - b)
      .map((val, idx, sortedArr) => ({
        lower: val,
        gap: idx < sortedArr.length - 1 ? sortedArr[idx + 1] - val : Infinity,
      }))
      .find(({ gap }) => gap > gapThreshold)?.lower || null
  );
}

// Update segment, trail, and event IDs in the data
function updateIDs(data) {
  const segmentThreshold = findStartOfFirstGapLargerThanN(data.segments.map(({ id }) => id));
  const eventThreshold = findStartOfFirstGapLargerThanN(data.trailEvents.map(({ id }) => id));
  const trailThreshold = findStartOfFirstGapLargerThanN(data.trails.map(({ id }) => id));

  const segmentIDMapping = generateNewIdMapping(data.segments, segmentThreshold);
  const trailIDMapping = generateNewIdMapping(data.trails, trailThreshold);
  const eventIDMapping = generateNewIdMapping(data.trailEvents, eventThreshold);

  // Update IDs in the segments, trails, and events
  data.segments = data.segments.map((segment) => {
    segment.id = segmentIDMapping[segment.id] || segment.id;
    segment.trails = segment.trails.map((trailID) => trailIDMapping[trailID] || trailID);
    segment.events = segment.events.map((eventID) => eventIDMapping[eventID] || eventID);
    return segment;
  });

  data.trails = data.trails.map((trail) => {
    trail.id = trailIDMapping[trail.id] || trail.id;
    return trail;
  });

  data.trailEvents = data.trailEvents.map((event) => {
    event.id = eventIDMapping[event.id] || event.id;
    return event;
  });

  return data;
}

// Helper function to log unlinked IDs
function logUnlinkedIDs(data) {
  const unlinkedTrailIDs = data.trails.filter(
    (trail) => !data.segments.some((segment) => segment.trails.includes(trail.id))
  );
  const unlinkedEventIDs = data.trailEvents.filter(
    (event) => !data.segments.some((segment) => segment.events.includes(event.id))
  );

  console.log(
    'Unlinked Trail IDs:',
    unlinkedTrailIDs.map((trail) => trail.id)
  );
  console.log(
    'Unlinked Event IDs:',
    unlinkedEventIDs.map((event) => event.id)
  );
}

// Function to sort events within a segment in reverse chronological order (newest first)
function sortSegmentEvents(segment, trailEvents) {
  // Create a Set to track seen event IDs for deduplication
  const seenEventIDs = new Set();

  segment.events = segment.events
    .map((eventID) => {
      // Skip if we've already processed this ID (deduplication)
      if (seenEventIDs.has(eventID)) return null;

      // Mark as seen
      seenEventIDs.add(eventID);

      const event = trailEvents.find((e) => e.id === eventID);
      return event ? event : null;
    })
    .filter((event) => event) // Remove any nulls (duplicates or events not found)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort in reverse order (newest first)

  // Update event IDs after sorting
  segment.events = segment.events.map((event) => event.id);
  return segment;
}

// Function to round coordinates to 7 decimal places
function roundCoordinates(segment) {
  if (segment.geometry && segment.geometry.type === 'MultiLineString') {
    segment.geometry.coordinates = segment.geometry.coordinates.map((line) =>
      line.map((coords) => coords.map((coord) => Math.round(coord * 1e7) / 1e7))
    );
  }
  return segment;
}

// NEW FUNCTION: Simplify segment geometries to 5 feet tolerance
function simplifyGeometries(segment) {
  if (segment.geometry && segment.geometry.type === 'MultiLineString') {
    // Create a feature collection from the segment's geometry
    const lines = segment.geometry.coordinates.map((coords) => {
      return turf.lineString(coords);
    });
    const fc = turf.featureCollection(lines);

    // Get the centroid to calculate the tolerance in degrees
    const referencePoint = turf.centroid(fc);

    // Calculate the distance of 5 feet in degrees at this location
    const destPoint = turf.destination(referencePoint, 5, 0, { units: 'feet' });
    const latDiff = destPoint.geometry.coordinates[1] - referencePoint.geometry.coordinates[1];

    // Simplify each line in the MultiLineString
    const simplifiedLines = lines.map((line) => {
      return turf.simplify(line, {
        tolerance: latDiff,
        highQuality: true,
        mutate: true,
      });
    });

    // Update the segment's geometry with simplified coordinates
    segment.geometry.coordinates = simplifiedLines.map((line) => line.geometry.coordinates);
  }
  return segment;
}

// Function to update the data
function updateData(data) {
  // Update IDs
  const updatedData = updateIDs(data);

  // Sort segment events by date (newest first)
  updatedData.segments = updatedData.segments.map((segment) =>
    sortSegmentEvents(segment, updatedData.trailEvents)
  );

  // Simplify geometries with 5 feet tolerance
  updatedData.segments = updatedData.segments.map((segment) => simplifyGeometries(segment));

  // Round coordinates to 7 decimal places
  updatedData.segments = updatedData.segments.map((segment) => roundCoordinates(segment));

  logUnlinkedIDs(updatedData);

  return {
    lastUpdated: new Date().toISOString(),
    ...Object.fromEntries(Object.entries(updatedData).filter(([key]) => key !== 'lastUpdated')),
  };
}

// Parse command line arguments
const minified = process.argv.includes('--minify');

// Read the data from the file
const filePath = path.join(__dirname, '../src/data.json');
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  const parsedData = JSON.parse(data);
  const updatedData = updateData(parsedData);

  // Set space parameter based on minify flag
  const space = minified ? 0 : 2;

  // Write the updated data back to the file
  fs.writeFile(filePath, JSON.stringify(updatedData, null, space), (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log('Data updated successfully!');
    }
  });
});
