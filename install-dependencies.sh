#!/bin/bash

# Script to install missing dependencies for Rural Hardware Store application
echo "Installing missing dependencies..."

# Set the project directory
PROJECT_DIR="/Users/dineshkumargopalakrishnan/RetailApp"
cd "$PROJECT_DIR" || { echo "Error: Cannot change to project directory $PROJECT_DIR"; exit 1; }

# Install sqlite3
echo "Installing sqlite3 package..."
npm install sqlite3 --save

# Create a simpler fix for the sales page
echo "Creating a simpler sales page fix..."

# Create a simple JavaScript fix
cat > "$PROJECT_DIR/simple-sales-fix.js" << 'EOL'
// Simple fix for sales page
document.addEventListener('DOMContentLoaded', function() {
  console.log('Applying simple sales page fix...');
  
  // Function to add New Sale button
  function addNewSaleButton() {
    console.log('Adding New Sale button...');
    
    // Get the sales page container
    const salesPage = document.querySelector('#sales-page');
    if (!salesPage) {
      console.error('Sales page not found');
      return;
    }
    
    // Check if button already exists
    if (document.querySelector('#new-sale-btn')) {
      console.log('New Sale button already exists');
      return;
    }
    
    // Create button
    const newSaleBtn = document.createElement('button');
    newSaleBtn.id = 'new-sale-btn';
    newSaleBtn.className = 'btn btn-primary btn-lg mb-4';
    newSaleBtn.innerHTML = '<i class="bi bi-plus-circle"></i> New Sale';
    newSaleBtn.style.display = 'block';
    newSaleBtn.style.marginBottom = '20px';
    
    // Add click handler
    newSaleBtn.addEventListener('click', function() {
      console.log('New Sale button clicked');
      alert('New Sale button clicked!');
    });
    
    // Insert at the beginning of the sales page
    salesPage.insertBefore(newSaleBtn, salesPage.firstChild);
    console.log('New Sale button added');
  }
  
  // Function to fix sales page
  function fixSalesPage() {
    // Add New Sale button
    addNewSaleButton();
    
    // Make sure the sales page is visible
    const salesPage = document.querySelector('#sales-page');
    if (salesPage) {
      salesPage.style.display = 'block';
      salesPage.style.padding = '20px';
      salesPage.style.height = 'auto';
      salesPage.style.minHeight = '100%';
      salesPage.style.overflowY = 'visible';
    }
    
    // Make sure the sales table is visible
    const salesTable = document.querySelector('#sales-page .card');
    if (salesTable) {
      salesTable.style.display = 'block';
      salesTable.style.marginTop = '20px';
    }
  }
  
  // Run fix when page loads
  setTimeout(fixSalesPage, 1000);
  
  // Run fix when sales tab is clicked
  const salesTab = document.querySelector('[data-page="sales"]');
  if (salesTab) {
    salesTab.addEventListener('click', function() {
      setTimeout(fixSalesPage, 500);
    });
  }
});
EOL

# Add the script to index.html
INDEX_HTML="$PROJECT_DIR/src/index.html"
if [ -f "$INDEX_HTML" ]; then
  # Backup index.html
  cp "$INDEX_HTML" "$INDEX_HTML.bak"
  echo "index.html backed up to $INDEX_HTML.bak"
  
  # Check if the script is already included
  if ! grep -q "simple-sales-fix.js" "$INDEX_HTML"; then
    # Add the script tag before the closing </body> tag
    sed -i '' 's|</body>|<script src="../simple-sales-fix.js"></script>\n</body>|' "$INDEX_HTML"
    echo "Simple sales fix added to index.html"
  else
    echo "Simple sales fix already included in index.html"
  fi
else
  echo "Warning: index.html not found, cannot modify"
fi

# Remove the problematic files
echo "Removing problematic files..."
rm -f "$PROJECT_DIR/database-fix.js" "$PROJECT_DIR/apply-fix-on-startup.js"

# Fix main.js if needed
MAIN_JS="$PROJECT_DIR/main.js"
if [ -f "$MAIN_JS" ]; then
  # Backup main.js
  cp "$MAIN_JS" "$MAIN_JS.bak"
  echo "main.js backed up to $MAIN_JS.bak"
  
  # Remove the require for apply-fix-on-startup
  sed -i '' '/require.*apply-fix-on-startup/d' "$MAIN_JS"
  echo "Removed problematic require from main.js"
fi

echo "Dependencies installed and simple fix applied!"
echo "Please restart your application to see the changes:"
echo "cd $PROJECT_DIR && npm start"