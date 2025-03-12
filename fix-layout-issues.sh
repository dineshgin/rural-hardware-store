#!/bin/bash

# Script to fix layout and input field issues in the Rural Hardware Store application

# Set the project directory
PROJECT_DIR="/Users/dineshkumargopalakrishnan/RetailApp"

# Create backups directory if it doesn't exist
mkdir -p "$PROJECT_DIR/backups"

# Get current timestamp for backup files
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

echo "Creating backups of important files..."
cp "$PROJECT_DIR/src/index.html" "$PROJECT_DIR/backups/index.html.backup.$TIMESTAMP"
cp "$PROJECT_DIR/src/styles/main.css" "$PROJECT_DIR/backups/main.css.backup.$TIMESTAMP" 2>/dev/null
echo "Backups created in $PROJECT_DIR/backups/"

# Fix the sales page layout
echo "Fixing sales page layout..."

# Create or update the CSS file to fix layout issues
mkdir -p "$PROJECT_DIR/src/styles"
cat > "$PROJECT_DIR/src/styles/layout-fix.css" << 'EOF'
/* Layout fixes for Rural Hardware Store */

/* Fix for the sales page layout */
#sales-page {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

/* Ensure the New Sale button is at the top */
#sales-page .btn-primary {
  margin-bottom: 20px;
}

/* Fix for input fields */
input[type="text"],
input[type="number"],
input[type="tel"],
input[type="email"],
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
  max-width: 600px;
  margin: 1.75rem auto;
}

/* Fix for buttons */
.btn {
  pointer-events: auto !important;
}

/* Fix for the page containers */
.page-container {
  display: none;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.page-container.active {
  display: block;
}

/* Fix for the main content area */
.main-content {
  height: 100vh;
  overflow-y: auto;
  padding: 0;
}

/* Fix for the sidebar */
.sidebar {
  height: 100vh;
  overflow-y: auto;
}

/* Fix for tables */
.table {
  width: 100%;
  margin-bottom: 1rem;
}

/* Fix for cards */
.card {
  margin-bottom: 20px;
}
EOF

# Add the CSS file to index.html
echo "Adding layout fix CSS to index.html..."
if ! grep -q "layout-fix.css" "$PROJECT_DIR/src/index.html"; then
  sed -i '' '/<link rel="stylesheet" href="\.\/styles\/main\.css">/a\\
  <link rel="stylesheet" href="./styles/layout-fix.css">\
' "$PROJECT_DIR/src/index.html"
fi

# Fix the sales page in index.html
echo "Updating sales page in index.html..."
cat > "$PROJECT_DIR/src/fixed-sales-page.html" << 'EOF'
<div id="sales-page" class="page-container">
  <h2>Sales</h2>
  <div class="row mb-3">
    <div class="col">
      <button id="new-sale-btn" class="btn btn-primary">
        <i class="bi bi-plus-circle"></i> New Sale
      </button>
    </div>
  </div>
  
  <div class="card">
    <div class="card-header">
      Recent Sales
    </div>
    <div class="card-body">
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
EOF

# Replace the sales page in index.html
sed -i '' '/<div id="sales-page" class="page-container">/,/<\/div>/d' "$PROJECT_DIR/src/index.html"
sed -i '' '/<div id="inventory-page" class="page-container">/i\\
<!-- Sales Page -->\
'"$(cat "$PROJECT_DIR/src/fixed-sales-page.html")"'\
\
' "$PROJECT_DIR/src/index.html"

# Create a fix for input fields
echo "Creating fix for input fields..."
cat > "$PROJECT_DIR/src/fix-input-fields.js" << 'EOF'
// Fix for input fields in the Rural Hardware Store application

document.addEventListener('DOMContentLoaded', function() {
  console.log('Fixing input fields...');
  
  // Function to fix input fields
  function fixInputFields() {
    // Fix all input fields
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.style.pointerEvents = 'auto';
      input.style.backgroundColor = '#fff';
      input.style.opacity = '1';
      
      // Remove any disabled attribute
      input.removeAttribute('disabled');
      input.removeAttribute('readonly');
      
      // Ensure the input is focusable
      input.tabIndex = 0;
    });
    
    console.log('Fixed', inputs.length, 'input fields');
  }
  
  // Run the fix immediately
  fixInputFields();
  
  // Also run the fix when modals are shown
  document.addEventListener('shown.bs.modal', function() {
    console.log('Modal shown, fixing input fields...');
    setTimeout(fixInputFields, 100);
  });
  
  // Run the fix periodically to catch dynamically added elements
  setInterval(fixInputFields, 2000);
});
EOF

# Add the fix-input-fields.js script to index.html
echo "Adding input field fix script to index.html..."
if ! grep -q "fix-input-fields.js" "$PROJECT_DIR/src/index.html"; then
  sed -i '' '/<script src="\.\/renderer\.js"><\/script>/a\\
  <script src="./fix-input-fields.js"></script>\
' "$PROJECT_DIR/src/index.html"
fi

# Fix the modal display
echo "Creating fix for modal display..."
cat > "$PROJECT_DIR/src/fix-modals.js" << 'EOF'
// Fix for modal display in the Rural Hardware Store application

document.addEventListener('DOMContentLoaded', function() {
  console.log('Fixing modals...');
  
  // Override the bootstrap modal show method
  const originalModalShow = bootstrap.Modal.prototype.show;
  bootstrap.Modal.prototype.show = function() {
    console.log('Showing modal:', this._element.id);
    
    // Fix the modal backdrop
    document.body.classList.add('modal-open');
    
    // Fix the modal element
    this._element.style.display = 'block';
    this._element.style.pointerEvents = 'auto';
    this._element.removeAttribute('aria-hidden');
    this._element.setAttribute('aria-modal', 'true');
    this._element.setAttribute('role', 'dialog');
    
    // Call the original show method
    originalModalShow.call(this);
    
    // Additional fixes after the modal is shown
    setTimeout(() => {
      // Fix input fields in the modal
      const inputs = this._element.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.style.pointerEvents = 'auto';
        input.style.backgroundColor = '#fff';
        input.style.opacity = '1';
        
        // Remove any disabled attribute
        input.removeAttribute('disabled');
        input.removeAttribute('readonly');
        
        // Ensure the input is focusable
        input.tabIndex = 0;
      });
      
      console.log('Fixed', inputs.length, 'input fields in modal');
    }, 100);
  };
  
  console.log('Modal fix applied');
});
EOF

# Add the fix-modals.js script to index.html
echo "Adding modal fix script to index.html..."
if ! grep -q "fix-modals.js" "$PROJECT_DIR/src/index.html"; then
  sed -i '' '/<script src="\.\/renderer\.js"><\/script>/a\\
  <script src="./fix-modals.js"></script>\
' "$PROJECT_DIR/src/index.html"
fi

# Copy the fix scripts to the src directory
cp "$PROJECT_DIR/src/fix-input-fields.js" "$PROJECT_DIR/src/fix-input-fields.js"
cp "$PROJECT_DIR/src/fix-modals.js" "$PROJECT_DIR/src/fix-modals.js"

echo "Layout and input field fixes applied!"
echo ""
echo "Please restart your application to see the changes."
echo "If you encounter any issues, you can restore from the backups in $PROJECT_DIR/backups/"