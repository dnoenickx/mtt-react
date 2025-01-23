const fs = require('fs');
const path = require('path');

function findFirstGapGreaterThanN(arr, gapThreshold = 1000) {
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

// Function to update IDs in the data
function updateIDs(data) {
  // Find ID after which we sould re-assign
  const segmentThreshold = findFirstGapGreaterThanN(data.segments.map(({ id }) => id));
  const eventThreshold = findFirstGapGreaterThanN(data.trailEvents.map(({ id }) => id));
  const trailThreshold = findFirstGapGreaterThanN(data.trails.map(({ id }) => id));

  // Helper function to generate a mapping of old to new IDs
  function generateNewIDs(items, threshold, startFrom) {
    const idMapping = {};
    let currentID = startFrom;
    for (const item of items) {
      if (item.id > threshold) {
        idMapping[item.id] = currentID++;
      }
    }
    return idMapping;
  }

  // Generate ID mappings for segments, trails, and events
  const segmentIDMapping = generateNewIDs(data.segments, segmentThreshold, segmentThreshold + 1);
  const trailIDMapping = generateNewIDs(data.trails, trailThreshold, trailThreshold + 1);
  const eventIDMapping = generateNewIDs(data.trailEvents, eventThreshold, eventThreshold + 1);

  // Update segments
  data.segments = data.segments.map((segment) => {
    segment.id = segmentIDMapping[segment.id] || segment.id;
    // Update trail and event references
    segment.trails = segment.trails.map((trailID) => trailIDMapping[trailID] || trailID);
    segment.events = segment.events.map((eventID) => eventIDMapping[eventID] || eventID);
    return segment;
  });

  // Update trails
  data.trails = data.trails.map((trail) => {
    trail.id = trailIDMapping[trail.id] || trail.id;
    return trail;
  });

  // Update trailEvents
  data.trailEvents = data.trailEvents.map((event) => {
    event.id = eventIDMapping[event.id] || event.id;
    return event;
  });

  return {
    lastUpdated: new Date().toISOString(),
    ...Object.fromEntries(Object.entries(data).filter(([key]) => key !== 'lastUpdated')),
  };
}

// Read the data from the file
const filePath = path.join(__dirname, '../src/data.json');
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Parse the JSON data
  const parsedData = JSON.parse(data);

  // Call the function to update IDs
  const updatedData = updateIDs(parsedData);

  // Write the updated data back to the file
  fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log('Data updated successfully');
    }
  });
});
