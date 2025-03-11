#!/bin/bash

# Navigate to the project directory
cd /Users/dineshkumargopalakrishnan/RetailApp

echo "Starting direct fix for better-sqlite3 installation..."

# Remove any existing better-sqlite3 installation
echo "Removing any existing better-sqlite3 installation..."
npm uninstall better-sqlite3

# Clean npm cache
echo "Cleaning npm cache..."
npm cache clean --force

# Install better-sqlite3 directly in the project folder
echo "Installing better-sqlite3 directly in the project folder..."
npm install better-sqlite3 --save

# Verify the installation
echo "Verifying the installation..."
if [ -d "node_modules/better-sqlite3" ]; then
  echo "better-sqlite3 installed successfully!"
else
  echo "Installation failed. Trying alternative approach..."
  
  # Try installing with specific version
  npm install better-sqlite3@8.3.0 --save
  
  if [ -d "node_modules/better-sqlite3" ]; then
    echo "better-sqlite3 installed successfully with specific version!"
  else
    echo "Installation still failed. Please check your Node.js and npm versions."
  fi
fi

echo "Fix completed. Try running 'npm start' now."