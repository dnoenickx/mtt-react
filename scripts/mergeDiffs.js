const path = require('path');
const fs = require('fs');

function detectAndMergeDiffs(originalData, diffs, diffFilenames) {
  // Create a deep copy of the original data to avoid mutating the original
  const mergedData = JSON.parse(JSON.stringify(originalData));

  // Track conflicts (multiple files modifying the same object)
  const conflicts = {};

  // Get all collection keys except 'meta'
  const collectionKeys = Object.keys(originalData).filter((key) => key !== 'meta');

  // Initialize conflict tracking structure for all collection keys
  collectionKeys.forEach((collectionKey) => {
    conflicts[collectionKey] = {};
  });

  // First pass: detect conflicts
  diffs.forEach((diff, diffIndex) => {
    const filename = diffFilenames[diffIndex];

    // Iterate through each collection type
    collectionKeys.forEach((collectionKey) => {
      if (!diff[collectionKey]) return;

      diff[collectionKey].forEach((diffItem) => {
        if (!diffItem.id) return; // Skip items without ID

        // Track which files modify this item
        if (!conflicts[collectionKey][diffItem.id]) {
          conflicts[collectionKey][diffItem.id] = { files: [], operations: [] };
        }

        conflicts[collectionKey][diffItem.id].files.push(filename);
        conflicts[collectionKey][diffItem.id].operations.push(
          diffItem.deleted ? 'delete' : 'modify/add'
        );
      });
    });
  });

  // Second pass: perform merge while aware of conflicts
  collectionKeys.forEach((collectionKey) => {
    const collection = mergedData[collectionKey];
    const diffCollection = diffs.flatMap((diff) => diff[collectionKey] || []);

    // Process each diff for this collection
    diffCollection.forEach((diffItem) => {
      if (!diffItem.id) return; // Skip items without ID

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

  // Filter conflicts to only include items modified by multiple files
  Object.keys(conflicts).forEach((collectionKey) => {
    Object.keys(conflicts[collectionKey]).forEach((itemId) => {
      if (conflicts[collectionKey][itemId].files.length <= 1) {
        delete conflicts[collectionKey][itemId];
      }
    });

    // Remove empty collections
    if (Object.keys(conflicts[collectionKey]).length === 0) {
      delete conflicts[collectionKey];
    }
  });

  return { mergedData, conflicts };
}

function main() {
  // Read original JSON
  const dataPath = path.join(__dirname, '../src/data.json');
  const originalData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // Read diff JSONs (could be multiple)
  const diffsPath = path.join(__dirname, '/diffs');

  // Get and process diff files
  const diffs = [];
  const validFilenames = [];
  
  fs.readdirSync(diffsPath, { withFileTypes: true })
    .filter(dirent => dirent.isFile())
    .forEach(dirent => {
      const filePath = path.join(diffsPath, dirent.name);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        diffs.push(JSON.parse(content));
        validFilenames.push(filePath);
      } catch (error) {
        console.error(`Error reading or parsing ${filePath}:`, error.message);
      }
    });

  // Detect conflicts and merge diffs
  const { mergedData, conflicts } = detectAndMergeDiffs(originalData, diffs, validFilenames);

  // Write merged data to a new file
  fs.writeFileSync(dataPath, JSON.stringify(mergedData, null, 4));

  // Print conflict information
  if (Object.keys(conflicts).length > 0) {
    console.log('\nCONFLICTS DETECTED: Multiple files modifying the same objects\n');

    for (const collectionKey in conflicts) {
      console.log(`\n${collectionKey.toUpperCase()} CONFLICTS:`);
      console.log('----------------------------------------');

      for (const itemId in conflicts[collectionKey]) {
        const conflictInfo = conflicts[collectionKey][itemId];
        console.log(`ID: ${itemId}`);
        console.log(`Modified by ${conflictInfo.files.length} files:`);

        conflictInfo.files.forEach((file, index) => {
          console.log(`  - ${file} (${conflictInfo.operations[index]})`);
        });
        console.log('');
      }
    }

    console.log('\nWarning: Last file processed takes precedence in conflicts.');
    console.log('Review these changes carefully!');
  } else {
    console.log('No conflicts detected. All objects are modified by at most one file.');
  }

  console.log('\nJSON merge completed successfully!');
}

// Uncomment to run
main();
