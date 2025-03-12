#!/bin/bash

# Navigate to the project directory
cd /Users/dineshkumargopalakrishnan/RetailApp

echo "Starting comprehensive fix for better-sqlite3 installation..."

# Remove node_modules and package-lock.json
echo "Removing node_modules and package-lock.json..."
rm -rf node_modules
rm -f package-lock.json

# Install all dependencies except better-sqlite3
echo "Installing dependencies..."
npm install

# Install better-sqlite3 with specific configuration for Electron
echo "Installing better-sqlite3 specifically for Electron..."
npm install better-sqlite3 --save

# Install electron-rebuild
echo "Installing electron-rebuild..."
npm install --save-dev electron-rebuild

# Get Electron version
ELECTRON_VERSION=$(npm list electron | grep electron | cut -d@ -f2 | cut -d' ' -f1)
echo "Detected Electron version: $ELECTRON_VERSION"

# Rebuild better-sqlite3 for the specific Electron version
echo "Rebuilding better-sqlite3 for Electron..."
npx electron-rebuild -f -w better-sqlite3

echo "Fix completed. Try running 'npm start' now."
echo "If you still encounter issues, please run the following command manually:"
echo "cd /Users/dineshkumargopalakrishnan/RetailApp && npm rebuild better-sqlite3 --runtime=electron --target=$ELECTRON_VERSION --disturl=https://atom.io/download/electron"