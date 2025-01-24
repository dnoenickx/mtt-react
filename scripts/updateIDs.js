const fs = require('fs');
const path = require('path');

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
  segment.events = segment.events
    .map((eventID) => {
      const event = trailEvents.find((e) => e.id === eventID);
      return event ? event : null;
    })
    .filter((event) => event) // Remove any nulls (if any events were not found)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort in reverse order (newest first)

  // Update event IDs after sorting
  segment.events = segment.events.map((event) => event.id);
  return segment;
}

// Function to round coordinates to 6 decimal places
function roundCoordinates(segment) {
  if (segment.geometry && segment.geometry.type === 'MultiLineString') {
    segment.geometry.coordinates = segment.geometry.coordinates.map((line) =>
      line.map((coords) => coords.map((coord) => Math.round(coord * 1e6) / 1e6))
    );
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

  // Round coordinates to 6 decimal places
  updatedData.segments = updatedData.segments.map((segment) => roundCoordinates(segment));

  logUnlinkedIDs(updatedData);

  return {
    lastUpdated: new Date().toISOString(),
    ...Object.fromEntries(Object.entries(updatedData).filter(([key]) => key !== 'lastUpdated')),
  };
}

// Read the data from the file
const filePath = path.join(__dirname, '../src/data.json');
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  const parsedData = JSON.parse(data);
  const updatedData = updateData(parsedData);

  // Write the updated data back to the file
  fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log('Data updated successfully!');
    }
  });
});
