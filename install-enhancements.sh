#!/bin/bash

# Script to install the enhanced sales functionality
# This script will download and integrate the enhanced sales components

# Set the project directory
PROJECT_DIR="/Users/dineshkumargopalakrishnan/RetailApp"

# Create backups directory if it doesn't exist
mkdir -p "$PROJECT_DIR/backups"

# Get current timestamp for backup files
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

echo "Creating backups of important files..."
cp "$PROJECT_DIR/src/index.html" "$PROJECT_DIR/backups/index.html.backup.$TIMESTAMP"
cp "$PROJECT_DIR/src/renderer.js" "$PROJECT_DIR/backups/renderer.js.backup.$TIMESTAMP"
cp "$PROJECT_DIR/main.js" "$PROJECT_DIR/backups/main.js.backup.$TIMESTAMP"
echo "Backups created in $PROJECT_DIR/backups/"

# Download the enhanced sales files
echo "Downloading enhanced sales files..."
curl -s -o "$PROJECT_DIR/src/enhanced-sales.html" https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/src/enhanced-sales.html
curl -s -o "$PROJECT_DIR/src/enhanced-sales.js" https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/src/enhanced-sales.js
curl -s -o "$PROJECT_DIR/src/enhanced-ipc-handlers.js" https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/src/enhanced-ipc-handlers.js
echo "Download complete."

# Check if the files were downloaded successfully
if [ ! -f "$PROJECT_DIR/src/enhanced-sales.html" ] || [ ! -f "$PROJECT_DIR/src/enhanced-sales.js" ] || [ ! -f "$PROJECT_DIR/src/enhanced-ipc-handlers.js" ]; then
  echo "Error: Failed to download one or more enhanced sales files"
  exit 1
fi

# Update index.html to include the enhanced sales page
echo "Updating index.html..."
# Find the sales page div and replace it with the enhanced version
sed -i '' '/id="sales-page"/,/<\/div>/d' "$PROJECT_DIR/src/index.html"

# Add the enhanced sales page content before the inventory page
sed -i '' '/<div id="inventory-page"/i\
<!-- Enhanced Sales Page -->\
<div id="sales-page" class="page-container">\
  <h2>Sales</h2>\
  <div class="row mb-3">\
    <div class="col">\
      <button id="new-sale-btn" class="btn btn-primary">\
        <i class="bi bi-plus-circle"></i> New Sale\
      </button>\
    </div>\
  </div>\
  \
  <div class="card">\
    <div class="card-header">\
      Recent Sales\
    </div>\
    <div class="card-body">\
      <table class="table table-striped">\
        <thead>\
          <tr>\
            <th>Invoice #</th>\
            <th>Customer</th>\
            <th>Date</th>\
            <th>Items</th>\
            <th>Total</th>\
            <th>Status</th>\
            <th>Actions</th>\
          </tr>\
        </thead>\
        <tbody id="sales-table-body">\
          <tr>\
            <td colspan="7" class="text-center">Loading sales data...</td>\
          </tr>\
        </tbody>\
      </table>\
    </div>\
  </div>\
</div>\
' "$PROJECT_DIR/src/index.html"

# Add the modals to the end of the body
sed -i '' '/<\/body>/i\
  <!-- Enhanced Sales Modals -->\
  <div id="enhanced-sales-modals"></div>\
  <script>\
    // Load enhanced sales modals\
    fetch("./enhanced-sales.html")\
      .then(response => response.text())\
      .then(html => {\
        const parser = new DOMParser();\
        const doc = parser.parseFromString(html, "text/html");\
        const modals = doc.querySelectorAll(".modal");\
        const container = document.getElementById("enhanced-sales-modals");\
        modals.forEach(modal => {\
          container.appendChild(modal);\
        });\
        console.log("Enhanced sales modals loaded");\
      })\
      .catch(error => {\
        console.error("Error loading enhanced sales modals:", error);\
      });\
  </script>\
' "$PROJECT_DIR/src/index.html"

# Add the enhanced sales script to index.html
sed -i '' '/<script src="\.\/renderer\.js"><\/script>/a\
  <script src="./enhanced-sales.js"></script>\
' "$PROJECT_DIR/src/index.html"

# Update main.js to include the enhanced IPC handlers
echo "Updating main.js..."
# Add the import at the top of the file
sed -i '' '/const { app, BrowserWindow, ipcMain } = require/a\
const { registerEnhancedIpcHandlers } = require("./src/enhanced-ipc-handlers");\
' "$PROJECT_DIR/main.js"

# Add the registration call after app is ready
sed -i '' '/app.on("ready", async () => {/a\
  // Register enhanced IPC handlers\
  registerEnhancedIpcHandlers();\
' "$PROJECT_DIR/main.js"

# Create units table if it doesn't exist
echo "Ensuring units table exists in the database..."
cat > "$PROJECT_DIR/src/database/ensure-units.js" << 'EOF'
// Script to ensure the units table exists and has default values
const { getDatabase } = require('./db');

function ensureUnitsTable() {
  const db = getDatabase();
  
  // Check if units table exists
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='units'").get();
  
  if (!tableExists) {
    console.log('Creating units table...');
    
    // Create the units table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
      )
    `).run();
    
    // Insert default units
    const defaultUnits = [
      { name: 'Piece', description: 'Individual item' },
      { name: 'Box', description: 'Box containing multiple items' },
      { name: 'Kg', description: 'Kilogram' },
      { name: 'Meter', description: 'Meter length' },
      { name: 'Liter', description: 'Liter volume' },
      { name: 'Dozen', description: '12 pieces' }
    ];
    
    const insert = db.prepare('INSERT INTO units (name, description) VALUES (?, ?)');
    
    defaultUnits.forEach(unit => {
      insert.run(unit.name, unit.description);
    });
    
    console.log('Units table created with default values');
  } else {
    console.log('Units table already exists');
  }
}

ensureUnitsTable();
EOF

# Run the script to ensure units table exists
echo "Running database setup script..."
cd "$PROJECT_DIR"
node src/database/ensure-units.js

echo "Installation complete!"
echo ""
echo "The enhanced sales functionality has been installed. You now have:"
echo "1. Improved 'Add Item' modal with quick product creation"
echo "2. Support for different units of measurement (piece, box, kg, etc.)"
echo "3. Barcode scanning capability"
echo "4. Better price input handling"
echo ""
echo "Please restart your application to see the changes."
echo "If you encounter any issues, you can restore from the backups in $PROJECT_DIR/backups/"