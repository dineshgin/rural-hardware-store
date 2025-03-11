#!/bin/bash

# Navigate to the project directory
cd /Users/dineshkumargopalakrishnan/RetailApp

# Clean up existing installation
echo "Cleaning up existing installation..."
rm -rf node_modules
rm -f package-lock.json

# Install dependencies
echo "Installing dependencies..."
npm install

# Install electron-rebuild
echo "Installing electron-rebuild..."
npm install --save-dev electron-rebuild

# Rebuild native modules specifically for better-sqlite3
echo "Rebuilding native modules for better-sqlite3..."
npx electron-rebuild -f -w better-sqlite3

echo "Fix completed. Try running 'npm start' now."