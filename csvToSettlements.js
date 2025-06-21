const fs = require("fs");
const path = require("path");

function csvToSettlements(csvFilePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`Error: File "${csvFilePath}" does not exist.`);
      return;
    }

    // Read the CSV file
    const csvContent = fs.readFileSync(csvFilePath, "utf8");
    const lines = csvContent.split("\n");

    if (lines.length < 2) {
      console.error("Error: CSV file must have at least 2 rows (header + data).");
      return;
    }

    // Skip the header row and process data rows
    const settlements = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Parse CSV line (simple CSV parser - handles basic cases)
      const columns = parseCSVLine(line);

      // Check if we have enough columns
      if (columns.length < 8) {
        console.warn(`Warning: Row ${i + 1} has fewer than 8 columns. Skipping.`);
        continue;
      }

      // Extract name (2st column, index 1) and id (8th column, index 7)
      const name = columns[1].trim();
      const id = columns[7].trim();

      // Skip rows with empty name or id
      if (!name || !id) {
        console.warn(`Warning: Row ${i + 1} has empty name or id. Skipping.`);
        continue;
      }

      settlements.push({
        id: id,
        name: name,
      });
    }

    if (settlements.length === 0) {
      console.warn("Warning: No valid settlements found in CSV file.");
      return;
    }

    // Generate output file path
    const inputDir = path.dirname(csvFilePath);
    const inputBaseName = path.basename(csvFilePath, path.extname(csvFilePath));
    const outputFilePath = path.join(inputDir, `${inputBaseName}.js`);

    // Generate JavaScript content
    const jsContent = `// Generated from ${path.basename(csvFilePath)}
// Date: ${new Date().toISOString()}

var settlements = ${JSON.stringify(settlements, null, 2)};

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = settlements;
}
`;

    // Write the output file
    fs.writeFileSync(outputFilePath, jsContent, "utf8");

    console.log(`✓ Successfully converted ${settlements.length} settlements`);
    console.log(`✓ Output written to: ${outputFilePath}`);
  } catch (error) {
    console.error("Error processing CSV file:", error.message);
  }
}

// Simple CSV parser that handles quoted fields and commas
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Handle escaped quotes ("")
        current += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // Found a separator outside of quotes
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current);

  return result;
}

// Command line usage
if (require.main === module) {
  const csvFilePath = process.argv[2];

  if (!csvFilePath) {
    console.log("Usage: node csvToSettlements.js <path-to-csv-file>");
    console.log("");
    console.log("Example:");
    console.log("  node csvToSettlements.js settlements.csv");
    console.log("");
    console.log("The script will:");
    console.log("  - Read the CSV file (first row is header)");
    console.log("  - Extract name from 1st column and id from 8th column");
    console.log("  - Generate a .js file with the same base name");
    process.exit(1);
  }

  csvToSettlements(csvFilePath);
}
