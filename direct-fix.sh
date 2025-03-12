#!/bin/bash

# Direct fix for the Rural Hardware Store application
# This script directly adds the complete sales page fix to your application

# Set the project directory
PROJECT_DIR="/Users/dineshkumargopalakrishnan/RetailApp"

# Create backups directory if it doesn't exist
mkdir -p "$PROJECT_DIR/backups"

# Get current timestamp for backup files
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

echo "Creating backups of important files..."
cp "$PROJECT_DIR/src/index.html" "$PROJECT_DIR/backups/index.html.backup.$TIMESTAMP"
echo "Backups created in $PROJECT_DIR/backups/"

# Download the complete sales page fix script
echo "Downloading complete sales page fix script..."
curl -s -o "$PROJECT_DIR/complete-sales-page-fix.js" https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/complete-sales-page-fix.js
echo "Download complete."

# Add the script to index.html
echo "Adding the script to index.html..."
if ! grep -q "complete-sales-page-fix.js" "$PROJECT_DIR/src/index.html"; then
  sed -i '' '/<\/head>/i\\
  <script src="../complete-sales-page-fix.js"></script>\
' "$PROJECT_DIR/src/index.html"
fi

# Create a simple CSS file to fix layout issues
echo "Creating CSS fixes..."
mkdir -p "$PROJECT_DIR/src/styles"
cat > "$PROJECT_DIR/src/styles/emergency-fixes.css" << 'EOF'
/* Emergency fixes for Rural Hardware Store */

/* Fix for the sales page layout */
#sales-page {
  padding: 20px !important;
  height: auto !important;
  min-height: 100% !important;
  overflow-y: visible !important;
  display: block !important;
}

/* Ensure the New Sale button is at the top and visible */
#new-sale-btn {
  margin-bottom: 20px !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}

/* Fix for input fields */
input[type="text"],
input[type="number"],
input[type="tel"],
input[type="email"],
input[type="date"],
textarea,
select {
  pointer-events: auto !important;
  background-color: #fff !important;
  opacity: 1 !important;
}

/* Fix for modals */
.modal {
  pointer-events: auto !important;
}

.modal-dialog {
  max-width: 600px !important;
  margin: 1.75rem auto !important;
}

/* Fix for buttons */
.btn {
  pointer-events: auto !important;
  cursor: pointer !important;
}

/* Fix for the page containers */
.page-container {
  display: none;
  padding: 20px !important;
  height: auto !important;
  min-height: 100% !important;
}

.page-container.active {
  display: block !important;
}

/* Fix for the main content area */
.main-content {
  height: 100vh !important;
  overflow-y: auto !important;
  padding: 0 !important;
}

/* Fix for tables */
.table {
  width: 100% !important;
  margin-bottom: 1rem !important;
}

/* Fix for cards */
.card {
  margin-bottom: 20px !important;
}
EOF

# Add the CSS file to index.html
echo "Adding CSS fixes to index.html..."
if ! grep -q "emergency-fixes.css" "$PROJECT_DIR/src/index.html"; then
  sed -i '' '/<\/head>/i\\
  <link rel="stylesheet" href="./styles/emergency-fixes.css">\
' "$PROJECT_DIR/src/index.html"
fi

# Create a direct HTML fix for the sales page
echo "Creating direct HTML fix for the sales page..."
cat > "$PROJECT_DIR/direct-sales-fix.html" << 'EOF'
<div id="sales-page" class="page-container">
  <h2 class="mb-4">Sales</h2>
  
  <div class="row mb-4">
    <div class="col-12">
      <button id="new-sale-btn" class="btn btn-primary btn-lg">
        <i class="bi bi-plus-circle"></i> New Sale
      </button>
    </div>
  </div>
  
  <div class="card">
    <div class="card-header">
      <h5 class="mb-0">Recent Sales</h5>
    </div>
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="sales-table-body">
            <tr>
              <td colspan="7" class="text-center">Loading sales data...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
EOF

# Create a script to manually insert the sales page
echo "Creating script to manually insert the sales page..."
cat > "$PROJECT_DIR/insert-sales-page.js" << 'EOF'
// Script to manually insert the sales page
document.addEventListener('DOMContentLoaded', function() {
  console.log('Manually inserting sales page...');
  
  // Function to insert the sales page
  function insertSalesPage() {
    // Load the sales page HTML
    fetch('./direct-sales-fix.html')
      .then(response => response.text())
      .then(html => {
        // Find the existing sales page
        const existingSalesPage = document.getElementById('sales-page');
        
        if (existingSalesPage) {
          // Replace the existing sales page
          existingSalesPage.outerHTML = html;
          console.log('Existing sales page replaced');
        } else {
          // If no sales page exists, find where to insert it
          const pageContent = document.getElementById('page-content');
          
          if (pageContent) {
            // Insert after the dashboard page
            const dashboardPage = document.getElementById('dashboard-page');
            
            if (dashboardPage) {
              dashboardPage.insertAdjacentHTML('afterend', html);
              console.log('Sales page inserted after dashboard page');
            } else {
              // If no dashboard page, insert at the beginning of page-content
              pageContent.insertAdjacentHTML('afterbegin', html);
              console.log('Sales page inserted at the beginning of page-content');
            }
          } else {
            console.error('Page content element not found');
          }
        }
        
        // Add event listener to the new sale button
        const newSaleBtn = document.getElementById('new-sale-btn');
        if (newSaleBtn) {
          newSaleBtn.addEventListener('click', function() {
            console.log('New Sale button clicked');
            try {
              openNewSaleModal();
            } catch (error) {
              console.error('Error opening new sale modal:', error);
              alert('Error: ' + error.message);
            }
          });
          console.log('Event listener added to New Sale button');
        } else {
          console.error('New Sale button not found after insertion');
        }
      })
      .catch(error => {
        console.error('Error loading sales page HTML:', error);
      });
  }
  
  // Run the function after a delay
  setTimeout(insertSalesPage, 1000);
});
EOF

# Add the script to index.html
echo "Adding insert-sales-page.js to index.html..."
if ! grep -q "insert-sales-page.js" "$PROJECT_DIR/src/index.html"; then
  sed -i '' '/<\/head>/i\\
  <script src="../insert-sales-page.js"></script>\
' "$PROJECT_DIR/src/index.html"
fi

# Copy the files to the project directory
cp "$PROJECT_DIR/direct-sales-fix.html" "$PROJECT_DIR/direct-sales-fix.html"
cp "$PROJECT_DIR/insert-sales-page.js" "$PROJECT_DIR/insert-sales-page.js"

echo "Direct fix applied!"
echo ""
echo "Please restart your application with:"
echo "cd $PROJECT_DIR && npm start"
echo ""
echo "After restarting, you should see the New Sale button at the top of the sales page."
echo "If you encounter any issues, you can restore from the backups in $PROJECT_DIR/backups/"