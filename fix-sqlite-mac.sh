#!/bin/bash

# This script is specifically for fixing better-sqlite3 on macOS with Electron

# Navigate to the project directory
cd /Users/dineshkumargopalakrishnan/RetailApp

echo "Starting macOS-specific fix for better-sqlite3..."

# Clean up existing installation
echo "Cleaning up existing installation..."
rm -rf node_modules
rm -f package-lock.json

# Install dependencies except better-sqlite3
echo "Installing dependencies without better-sqlite3..."
npm install --no-save $(node -e "const pkg=require('./package.json'); console.log(Object.keys(pkg.dependencies).filter(dep => dep !== 'better-sqlite3').map(dep => dep + '@' + pkg.dependencies[dep]).join(' '))")

# Install better-sqlite3 with specific configuration
echo "Installing better-sqlite3 with specific configuration..."
npm install better-sqlite3 --build-from-source --save

# Install electron-rebuild
echo "Installing electron-rebuild..."
npm install --save-dev electron-rebuild

# Rebuild better-sqlite3 for Electron
echo "Rebuilding better-sqlite3 for Electron..."
npx electron-rebuild -f -w better-sqlite3

echo "Fix completed. Try running 'npm start' now."
echo ""
echo "If you still encounter issues, try running these commands manually:"
echo "cd /Users/dineshkumargopalakrishnan/RetailApp"
echo "npm uninstall better-sqlite3"
echo "npm install better-sqlite3 --build-from-source"
echo "npx electron-rebuild -f -w better-sqlite3"