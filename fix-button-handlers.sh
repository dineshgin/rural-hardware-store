#!/bin/bash

# Script to fix button handlers in the Rural Hardware Store application
# This script will add the button handler fix script to the renderer process

# Set the project directory
PROJECT_DIR="/Users/dineshkumargopalakrishnan/RetailApp"

# Create backups directory if it doesn't exist
mkdir -p "$PROJECT_DIR/backups"

# Get current timestamp for backup files
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

echo "Creating backups of important files..."
cp "$PROJECT_DIR/src/renderer.js" "$PROJECT_DIR/backups/renderer.js.backup.$TIMESTAMP"
echo "Backups created in $PROJECT_DIR/backups/"

# Download the button handler fix script
echo "Downloading button handler fix script..."
curl -s -o "$PROJECT_DIR/fix-button-handlers.js" https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/fix-button-handlers.js
echo "Download complete."

# Check if the script was downloaded successfully
if [ ! -f "$PROJECT_DIR/fix-button-handlers.js" ]; then
  echo "Error: Failed to download fix-button-handlers.js"
  exit 1
fi

# Add the script to index.html
echo "Adding button handler fix script to index.html..."

# Check if the script is already included
if grep -q "fix-button-handlers.js" "$PROJECT_DIR/src/index.html"; then
  echo "Button handler fix script is already included in index.html"
else
  # Add the script before the closing body tag
  sed -i '' 's|</body>|    <script src="../fix-button-handlers.js"></script>\n</body>|' "$PROJECT_DIR/src/index.html"
  echo "Button handler fix script added to index.html"
fi

# Create a helper function to ensure modals work
echo "Creating a helper function for safe modal display..."

# Create a file with the safe modal function
cat > "$PROJECT_DIR/safe-modal.js" << 'EOF'
// Helper function to safely show Bootstrap modals
function safeShowModal(modalId) {
  console.log(`Attempting to show modal: ${modalId}`);
  
  try {
    const modalElement = document.getElementById(modalId);
    
    if (!modalElement) {
      console.error(`Modal element not found: ${modalId}`);
      alert(`Error: Modal element not found: ${modalId}`);
      return;
    }
    
    console.log(`Modal element found: ${modalId}`);
    
    // Check if Bootstrap is available
    if (typeof bootstrap === 'undefined') {
      console.error('Bootstrap is not defined');
      alert('Error: Bootstrap is not loaded properly');
      return;
    }
    
    console.log('Bootstrap is available');
    
    // Try to get existing modal instance
    let modalInstance = bootstrap.Modal.getInstance(modalElement);
    
    if (!modalInstance) {
      console.log(`Creating new modal instance for ${modalId}`);
      try {
        modalInstance = new bootstrap.Modal(modalElement);
      } catch (error) {
        console.error(`Error creating modal instance: ${error.message}`);
        alert(`Error creating modal: ${error.message}`);
        return;
      }
    }
    
    console.log(`Showing modal: ${modalId}`);
    modalInstance.show();
    
  } catch (error) {
    console.error(`Error showing modal ${modalId}:`, error);
    alert(`Error showing modal: ${error.message}`);
  }
}

// Add this function to the global scope
window.safeShowModal = safeShowModal;

// Add this to the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded in safe-modal.js');
});
EOF

# Add the safe modal script to index.html
echo "Adding safe modal script to index.html..."

# Check if the script is already included
if grep -q "safe-modal.js" "$PROJECT_DIR/src/index.html"; then
  echo "Safe modal script is already included in index.html"
else
  # Add the script before the fix-button-handlers.js script
  sed -i '' 's|<script src="../fix-button-handlers.js"></script>|<script src="../safe-modal.js"></script>\n    <script src="../fix-button-handlers.js"></script>|' "$PROJECT_DIR/src/index.html"
  echo "Safe modal script added to index.html"
fi

echo "Adding missing IPC handlers if needed..."

# Check if main.js has the necessary IPC handlers
if ! grep -q "ipcMain.handle('save-customer'" "$PROJECT_DIR/main.js"; then
  echo "Adding save-customer IPC handler to main.js..."
  cat >> "$PROJECT_DIR/main.js" << 'EOF'

// Add missing IPC handlers
ipcMain.handle('save-customer', async (event, customer) => {
  try {
    console.log('Saving customer:', customer);
    const db = getDatabase();
    const result = db.prepare('INSERT INTO customers (name, phone, address, email, notes) VALUES (?, ?, ?, ?, ?)').run(
      customer.name,
      customer.phone || '',
      customer.address || '',
      customer.email || '',
      customer.notes || ''
    );
    console.log('Customer saved with ID:', result.lastInsertRowid);
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    console.error('Error saving customer:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-product', async (event, product) => {
  try {
    console.log('Saving product:', product);
    const db = getDatabase();
    const result = db.prepare(
      'INSERT INTO products (name, description, category_id, unit_id, sku, barcode, purchase_price, selling_price, current_stock, min_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      product.name,
      product.description || '',
      product.categoryId,
      product.unitId,
      product.sku || '',
      product.barcode || '',
      product.purchasePrice,
      product.sellingPrice,
      product.currentStock || 0,
      product.minStock || 0
    );
    console.log('Product saved with ID:', result.lastInsertRowid);
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    console.error('Error saving product:', error);
    return { success: false, error: error.message };
  }
});
EOF
  echo "IPC handlers added to main.js"
fi

echo "Fix complete! Please restart your application."
echo ""
echo "After restarting, you should be able to:"
echo "1. Add new customers by clicking the 'Add Customer' button"
echo "2. Add new products by clicking the 'Add Product' button"
echo "3. Create new sales by clicking the 'New Sale' button"
echo "4. Add items to a sale by clicking the 'Add Item' button"
echo ""
echo "If you still encounter issues, please check the developer console (Ctrl+Shift+I or Cmd+Option+I) for error messages."