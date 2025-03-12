// Script to diagnose database issues
// Run this with: node diagnose-db.js

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Find SQLite database files in the current directory and subdirectories
function findDatabaseFiles() {
  console.log('Searching for SQLite database files...');
  
  const dbFiles = [];
  
  function searchDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        // Skip node_modules and .git directories
        if (file.name !== 'node_modules' && file.name !== '.git') {
          searchDir(fullPath);
        }
      } else if (file.isFile() && 
                (file.name.endsWith('.sqlite') || 
                 file.name.endsWith('.db') || 
                 file.name.endsWith('.sqlite3'))) {
        dbFiles.push(fullPath);
      }
    }
  }
  
  searchDir('.');
  return dbFiles;
}

// Check if a file is a valid SQLite database
function isValidSQLiteDB(filePath) {
  try {
    // Try to open the file as a SQLite database
    const db = new Database(filePath, { readonly: true });
    
    // Check if we can execute a simple query
    db.prepare('SELECT 1').get();
    
    // Close the database
    db.close();
    
    return true;
  } catch (error) {
    console.log(`File ${filePath} is not a valid SQLite database:`, error.message);
    return false;
  }
}

// Get table information from a database
function getTableInfo(db, tableName) {
  try {
    return db.prepare(`PRAGMA table_info(${tableName})`).all();
  } catch (error) {
    console.error(`Error getting info for table ${tableName}:`, error.message);
    return [];
  }
}

// Get row count for a table
function getRowCount(db, tableName) {
  try {
    const result = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
    return result ? result.count : 0;
  } catch (error) {
    console.error(`Error getting row count for table ${tableName}:`, error.message);
    return 0;
  }
}

// Get sample data from a table
function getSampleData(db, tableName, limit = 5) {
  try {
    return db.prepare(`SELECT * FROM ${tableName} LIMIT ${limit}`).all();
  } catch (error) {
    console.error(`Error getting sample data for table ${tableName}:`, error.message);
    return [];
  }
}

// Main function to diagnose database
function diagnoseDatabase() {
  console.log('Starting database diagnosis...');
  
  // Find database files
  const dbFiles = findDatabaseFiles();
  
  if (dbFiles.length === 0) {
    console.log('No SQLite database files found.');
    return;
  }
  
  console.log(`Found ${dbFiles.length} potential database files:`);
  dbFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  
  // Check each database file
  dbFiles.forEach(dbFile => {
    console.log(`\nAnalyzing database: ${dbFile}`);
    
    if (!isValidSQLiteDB(dbFile)) {
      console.log(`Skipping ${dbFile} as it's not a valid SQLite database.`);
      return;
    }
    
    try {
      // Open the database
      const db = new Database(dbFile, { readonly: true });
      
      // Get list of tables
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
      
      if (tables.length === 0) {
        console.log('No tables found in the database.');
      } else {
        console.log(`Found ${tables.length} tables:`);
        
        // Analyze each table
        tables.forEach(table => {
          const tableName = table.name;
          console.log(`\nTable: ${tableName}`);
          
          // Get table structure
          const columns = getTableInfo(db, tableName);
          console.log(`Columns (${columns.length}):`);
          columns.forEach(col => {
            console.log(`  - ${col.name} (${col.type}${col.pk ? ', PRIMARY KEY' : ''}${col.notnull ? ', NOT NULL' : ''})`);
          });
          
          // Get row count
          const rowCount = getRowCount(db, tableName);
          console.log(`Row count: ${rowCount}`);
          
          // Get sample data if there are rows
          if (rowCount > 0) {
            const sampleData = getSampleData(db, tableName);
            console.log(`Sample data (up to 5 rows):`);
            sampleData.forEach((row, index) => {
              console.log(`  Row ${index + 1}:`, row);
            });
          }
        });
      }
      
      // Close the database
      db.close();
    } catch (error) {
      console.error(`Error analyzing database ${dbFile}:`, error);
    }
  });
  
  console.log('\nDatabase diagnosis complete.');
}

// Run the diagnosis
diagnoseDatabase();