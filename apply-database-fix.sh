#!/bin/bash

# Script to apply database fix to Rural Hardware Store application
echo "Starting database fix application..."

# Set the project directory
PROJECT_DIR="/Users/dineshkumargopalakrishnan/RetailApp"
cd "$PROJECT_DIR" || { echo "Error: Cannot change to project directory $PROJECT_DIR"; exit 1; }

# Create backups directory
BACKUP_DIR="$PROJECT_DIR/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "Created backup directory: $BACKUP_DIR"

# Backup database files
echo "Backing up database files..."
mkdir -p "$BACKUP_DIR/src/database"
if [ -d "$PROJECT_DIR/src/database" ]; then
  cp -r "$PROJECT_DIR/src/database" "$BACKUP_DIR/src/"
  echo "Database directory backed up"
fi

# Backup main.js
if [ -f "$PROJECT_DIR/main.js" ]; then
  cp "$PROJECT_DIR/main.js" "$BACKUP_DIR/"
  echo "main.js backed up"
fi

# Download the database fix script
echo "Downloading database fix script..."
curl -s -o "$PROJECT_DIR/database-fix.js" https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/database-fix.js
if [ $? -ne 0 ]; then
  echo "Error: Failed to download database fix script"
  exit 1
fi
echo "Database fix script downloaded successfully"

# Create a script to apply the fix on application startup
echo "Creating startup fix script..."
cat > "$PROJECT_DIR/apply-fix-on-startup.js" << 'EOL'
// Script to apply database fix on application startup
const { fixDatabaseConnection } = require('./database-fix');

console.log('Applying database fix on startup...');
fixDatabaseConnection()
  .then(result => {
    console.log('Database fix applied:', result);
  })
  .catch(error => {
    console.error('Error applying database fix:', error);
  });
EOL

# Modify main.js to include the fix script
echo "Modifying main.js to include fix script..."
MAIN_JS="$PROJECT_DIR/main.js"
if [ -f "$MAIN_JS" ]; then
  # Create a temporary file
  TEMP_FILE=$(mktemp)
  
  # Add the fix script import at the beginning of the file
  echo "// Apply database fix on startup" > "$TEMP_FILE"
  echo "require('./apply-fix-on-startup');" >> "$TEMP_FILE"
  echo "" >> "$TEMP_FILE"
  
  # Append the original content
  cat "$MAIN_JS" >> "$TEMP_FILE"
  
  # Replace the original file
  mv "$TEMP_FILE" "$MAIN_JS"
  echo "main.js modified to include fix script"
else
  echo "Warning: main.js not found, cannot modify"
fi

# Create a simple sales page fix
echo "Creating sales page fix..."
cat > "$PROJECT_DIR/sales-page-fix.js" << 'EOL'
// Fix for sales page
document.addEventListener('DOMContentLoaded', function() {
  console.log('Applying sales page fix...');
  
  // Function to fix the sales page
  function fixSalesPage() {
    console.log('Fixing sales page...');
    
    // Get the sales page container
    const salesPage = document.getElementById('sales-page');
    if (!salesPage) {
      console.error('Sales page not found');
      return;
    }
    
    // Add New Sale button if it doesn't exist
    if (!document.getElementById('new-sale-btn')) {
      console.log('Adding New Sale button...');
      const buttonRow = document.createElement('div');
      buttonRow.className = 'row mb-4';
      buttonRow.innerHTML = `
        <div class="col-12">
          <button id="new-sale-btn" class="btn btn-primary btn-lg">
            <i class="bi bi-plus-circle"></i> New Sale
          </button>
        </div>
      `;
      salesPage.insertBefore(buttonRow, salesPage.firstChild);
      
      // Add event listener to the new sale button
      const newSaleBtn = document.getElementById('new-sale-btn');
      if (newSaleBtn) {
        newSaleBtn.addEventListener('click', function() {
          console.log('New Sale button clicked');
          alert('New Sale button clicked! This functionality will be implemented soon.');
        });
        console.log('Event listener added to New Sale button');
      }
    }
    
    console.log('Sales page fixed');
  }
  
  // Run the fix function after a delay
  setTimeout(fixSalesPage, 1000);
  
  // Also run when the sales button is clicked
  const salesButton = document.querySelector('[data-page="sales"]');
  if (salesButton) {
    salesButton.addEventListener('click', function() {
      setTimeout(fixSalesPage, 500);
    });
    console.log('Event listener added to sales button');
  }
});
EOL

# Add the sales page fix to index.html
echo "Adding sales page fix to index.html..."
INDEX_HTML="$PROJECT_DIR/src/index.html"
if [ -f "$INDEX_HTML" ]; then
  # Backup index.html
  cp "$INDEX_HTML" "$BACKUP_DIR/"
  echo "index.html backed up"
  
  # Check if the script is already included
  if ! grep -q "sales-page-fix.js" "$INDEX_HTML"; then
    # Add the script tag before the closing </body> tag
    sed -i '' 's|</body>|<script src="../sales-page-fix.js"></script>\n</body>|' "$INDEX_HTML"
    echo "Sales page fix added to index.html"
  else
    echo "Sales page fix already included in index.html"
  fi
else
  echo "Warning: index.html not found, cannot modify"
fi

# Add CSS fixes
echo "Adding CSS fixes..."
cat > "$PROJECT_DIR/sales-page-fix.css" << 'EOL'
/* CSS fixes for sales page */

/* Make sure the sales page is visible */
#sales-page {
  display: block !important;
  padding: 20px !important;
  height: auto !important;
  min-height: 100% !important;
  overflow-y: visible !important;
}

/* Ensure the New Sale button is visible */
#new-sale-btn {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  margin-bottom: 20px !important;
  font-size: 1.25rem !important;
  padding: 0.5rem 1rem !important;
  background-color: #0d6efd !important;
  border-color: #0d6efd !important;
  color: white !important;
}

/* Fix for buttons */
.btn {
  pointer-events: auto !important;
  cursor: pointer !important;
}

/* Fix for sales table */
#sales-page .card {
  margin-top: 20px !important;
  display: block !important;
}

/* Fix for table headers */
#sales-page th {
  background-color: #f8f9fa !important;
  color: #212529 !important;
}

/* Fix for table rows */
#sales-page tr {
  display: table-row !important;
}

/* Fix for table cells */
#sales-page td {
  display: table-cell !important;
}
EOL

# Add the CSS file to index.html
if [ -f "$INDEX_HTML" ]; then
  # Check if the CSS is already included
  if ! grep -q "sales-page-fix.css" "$INDEX_HTML"; then
    # Add the link tag in the head section
    sed -i '' 's|</head>|<link rel="stylesheet" href="../sales-page-fix.css">\n</head>|' "$INDEX_HTML"
    echo "CSS fixes added to index.html"
  else
    echo "CSS fixes already included in index.html"
  fi
fi

echo "Fix application completed successfully!"
echo "Please restart your application to apply the fixes."
echo "Run: cd $PROJECT_DIR && npm start"
echo ""
echo "If you encounter any issues, you can restore from backups in: $BACKUP_DIR"