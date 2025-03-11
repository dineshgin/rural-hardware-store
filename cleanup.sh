#!/bin/bash

# Cleanup script to fix SQLite binding issues
echo "Cleaning up SQLite binding issues..."

# Navigate to the project directory
cd /Users/dineshkumargopalakrishnan/RetailApp

# Remove node_modules and package-lock.json
echo "Removing node_modules and package-lock.json..."
rm -rf node_modules
rm -f package-lock.json

# Ensure no sqlite3 references in package.json
echo "Checking package.json for sqlite3 references..."
if grep -q "sqlite3" package.json; then
  echo "Found sqlite3 in package.json, removing..."
  # Use sed to remove the sqlite3 line from package.json
  sed -i '' '/sqlite3/d' package.json
fi

# Reinstall dependencies
echo "Reinstalling dependencies..."
npm install

echo "Cleanup complete! You can now run the application with 'npm start'"