const path = require('path');
const fs = require('fs');

function mergeDiffs(originalData, diffs) {
  // Create a deep copy of the original data to avoid mutating the original
  const mergedData = JSON.parse(JSON.stringify(originalData));

  // Iterate through each collection type (segments, trailEvents, trails)
  Object.keys(mergedData).forEach((collectionKey) => {
    const collection = mergedData[collectionKey];
    const diffCollection = diffs.flatMap((diff) => diff[collectionKey] || []);

    // Process each diff for this collection
    diffCollection.forEach((diffItem) => {
      const existingIndex = collection.findIndex((item) => item.id === diffItem.id);

      if (diffItem.deleted) {
        // If marked for deletion, remove the item
        if (existingIndex !== -1) {
          collection.splice(existingIndex, 1);
        }
      } else if (existingIndex !== -1) {
        // Update existing item
        Object.keys(diffItem).forEach((key) => {
          if (key !== 'id') {
            collection[existingIndex][key] = diffItem[key];
          }
        });
      } else {
        // Add new item
        collection.push(diffItem);
      }
    });
  });

  return mergedData;
}

function main() {
  // Read original JSON
  const dataPath = path.join(__dirname, '../src/data.json');
  const originalData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // Read diff JSONs (could be multiple)
  const diffsPath = path.join(__dirname, '/diffs');

  // Get JSON files from directory
  const diffFiles = fs.readdirSync(diffsPath).map((file) => path.join(diffsPath, file));

  // Read and parse diff files
  const diffs = diffFiles.map((file) => JSON.parse(fs.readFileSync(file, 'utf8')));

  // Merge diffs
  const mergedData = mergeDiffs(originalData, diffs);

  // Write merged data to a new file
  fs.writeFileSync(dataPath, JSON.stringify(mergedData, null, 2));

  console.log('JSON merge completed successfully!');
}

// Uncomment to run
main();
