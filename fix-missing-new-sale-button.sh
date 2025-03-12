#!/bin/bash

# Script to fix the missing New Sale button in the Rural Hardware Store application

# Set the project directory
PROJECT_DIR="/Users/dineshkumargopalakrishnan/RetailApp"

# Create backups directory if it doesn't exist
mkdir -p "$PROJECT_DIR/backups"

# Get current timestamp for backup files
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

echo "Creating backups of important files..."
cp "$PROJECT_DIR/src/index.html" "$PROJECT_DIR/backups/index.html.backup.$TIMESTAMP"
echo "Backups created in $PROJECT_DIR/backups/"

# Create a direct fix for the sales page
echo "Creating a fixed sales page with New Sale button..."

cat > "$PROJECT_DIR/src/sales-page-fixed.html" << 'EOF'
<!-- Fixed Sales Page with New Sale Button -->
<div id="sales-page" class="page-container">
  <h2>Sales</h2>
  <div class="row mb-4">
    <div class="col">
      <button id="new-sale-btn" class="btn btn-primary btn-lg">
        <i class="bi bi-plus-circle"></i> New Sale
      </button>
    </div>
  </div>
  
  <div class="card">
    <div class="card-header">
      <h5>Recent Sales</h5>
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

# Create a direct JavaScript fix to ensure the New Sale button works
echo "Creating JavaScript fix for the New Sale button..."

cat > "$PROJECT_DIR/src/fix-new-sale-button.js" << 'EOF'
// Fix for the missing New Sale button

document.addEventListener('DOMContentLoaded', function() {
  console.log('Fixing New Sale button...');
  
  // Function to add the New Sale button if it doesn't exist
  function ensureNewSaleButton() {
    const salesPage = document.getElementById('sales-page');
    if (!salesPage) {
      console.error('Sales page not found');
      return;
    }
    
    // Check if the New Sale button exists
    let newSaleBtn = document.getElementById('new-sale-btn');
    
    if (!newSaleBtn) {
      console.log('New Sale button not found, creating it...');
      
      // Create the button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'row mb-4';
      
      const buttonCol = document.createElement('div');
      buttonCol.className = 'col';
      
      // Create the button
      newSaleBtn = document.createElement('button');
      newSaleBtn.id = 'new-sale-btn';
      newSaleBtn.className = 'btn btn-primary btn-lg';
      newSaleBtn.innerHTML = '<i class="bi bi-plus-circle"></i> New Sale';
      
      // Add event listener
      newSaleBtn.addEventListener('click', function() {
        console.log('New Sale button clicked');
        try {
          openNewSaleModal();
        } catch (error) {
          console.error('Error opening new sale modal:', error);
          alert('Error: ' + error.message);
        }
      });
      
      // Append the button
      buttonCol.appendChild(newSaleBtn);
      buttonContainer.appendChild(buttonCol);
      
      // Insert at the beginning of the sales page, after the h2
      const h2 = salesPage.querySelector('h2');
      if (h2) {
        h2.insertAdjacentElement('afterend', buttonContainer);
      } else {
        salesPage.insertAdjacentElement('afterbegin', buttonContainer);
      }
      
      console.log('New Sale button created and added to the page');
    } else {
      console.log('New Sale button already exists');
    }
  }
  
  // Simple implementation of openNewSaleModal
  window.openNewSaleModal = function() {
    console.log('Opening new sale modal');
    
    try {
      // Reset form if it exists
      const form = document.getElementById('new-sale-form');
      if (form) form.reset();
      
      // Clear the items table
      const tableBody = document.getElementById('sale-items-table')?.querySelector('tbody');
      if (tableBody) {
        tableBody.innerHTML = '<tr id="empty-row"><td colspan="5" class="text-center">No items added</td></tr>';
      }
      
      // Set the date to today
      const dateInput = document.getElementById('sale-date');
      if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
      }
      
      // Load customers for the dropdown
      try {
        loadCustomersForDropdown('customer-select');
      } catch (e) {
        console.error('Error loading customers:', e);
      }
      
      // Reset totals
      document.getElementById('subtotal')?.textContent = '₹0.00';
      document.getElementById('tax-amount')?.textContent = '₹0.00';
      document.getElementById('discount-amount')?.value = '0';
      document.getElementById('total-amount')?.textContent = '₹0.00';
      
      // Show the modal
      const modal = document.getElementById('new-sale-modal');
      if (modal) {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
      } else {
        console.error('New sale modal not found');
        alert('Error: New sale modal not found');
      }
    } catch (error) {
      console.error('Error in openNewSaleModal:', error);
      alert('Error: ' + error.message);
    }
  };
  
  // Run immediately
  setTimeout(ensureNewSaleButton, 500);
  
  // Also run when the sales page is shown
  document.querySelectorAll('[data-page="sales"]').forEach(button => {
    button.addEventListener('click', function() {
      setTimeout(ensureNewSaleButton, 500);
    });
  });
});
EOF

# Update the index.html file to include the fixed sales page
echo "Updating index.html with the fixed sales page..."

# Check if the sales page exists in index.html
if grep -q '<div id="sales-page" class="page-container">' "$PROJECT_DIR/src/index.html"; then
  # Replace the existing sales page with our fixed version
  sed -i '' '/<div id="sales-page" class="page-container">/,/<\/div>/d' "$PROJECT_DIR/src/index.html"
  
  # Add our fixed sales page before the inventory page
  sed -i '' '/<div id="inventory-page" class="page-container">/i\\
'"$(cat "$PROJECT_DIR/src/sales-page-fixed.html")"'\
\
' "$PROJECT_DIR/src/index.html"
else
  # If the sales page doesn't exist, add it before the inventory page
  sed -i '' '/<div id="inventory-page" class="page-container">/i\\
'"$(cat "$PROJECT_DIR/src/sales-page-fixed.html")"'\
\
' "$PROJECT_DIR/src/index.html"
fi

# Add the fix-new-sale-button.js script to index.html
echo "Adding the New Sale button fix script to index.html..."
if ! grep -q "fix-new-sale-button.js" "$PROJECT_DIR/src/index.html"; then
  sed -i '' '/<script src="\.\/renderer\.js"><\/script>/a\\
  <script src="./fix-new-sale-button.js"></script>\
' "$PROJECT_DIR/src/index.html"
fi

# Copy the fix script to the src directory
cp "$PROJECT_DIR/src/fix-new-sale-button.js" "$PROJECT_DIR/src/fix-new-sale-button.js"

# Create a simple New Sale modal if it doesn't exist
echo "Ensuring New Sale modal exists..."
if ! grep -q '<div class="modal fade" id="new-sale-modal"' "$PROJECT_DIR/src/index.html"; then
  cat > "$PROJECT_DIR/src/new-sale-modal.html" << 'EOF'
<!-- New Sale Modal -->
<div class="modal fade" id="new-sale-modal" tabindex="-1" aria-labelledby="newSaleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="newSaleModalLabel">New Sale</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="new-sale-form">
          <div class="row mb-3">
            <div class="col-md-6">
              <label for="customer-select" class="form-label">Customer</label>
              <select id="customer-select" class="form-select">
                <option value="">Walk-in Customer</option>
                <!-- Customer options will be loaded here -->
              </select>
            </div>
            <div class="col-md-6">
              <label for="sale-date" class="form-label">Date</label>
              <input type="date" class="form-control" id="sale-date">
            </div>
          </div>
          
          <div class="row mb-3">
            <div class="col">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5>Items</h5>
                <button type="button" id="add-item-btn" class="btn btn-success btn-sm">
                  <i class="bi bi-plus"></i> Add Item
                </button>
              </div>
              <div class="table-responsive">
                <table class="table table-bordered" id="sale-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr id="empty-row">
                      <td colspan="5" class="text-center">No items added</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="sale-notes" class="form-label">Notes</label>
                <textarea class="form-control" id="sale-notes" rows="3"></textarea>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <div class="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span id="subtotal">₹0.00</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Tax (18%):</span>
                    <span id="tax-amount">₹0.00</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Discount:</span>
                    <div class="input-group input-group-sm" style="width: 120px;">
                      <input type="number" class="form-control" id="discount-amount" value="0">
                      <span class="input-group-text">₹</span>
                    </div>
                  </div>
                  <hr>
                  <div class="d-flex justify-content-between fw-bold">
                    <span>Total:</span>
                    <span id="total-amount">₹0.00</span>
                  </div>
                  <div class="mt-3">
                    <label for="payment-method" class="form-label">Payment Method</label>
                    <select class="form-select" id="payment-method">
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="credit">Store Credit</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary" id="save-sale-btn">Complete Sale</button>
      </div>
    </div>
  </div>
</div>
EOF

  # Add the New Sale modal to index.html
  sed -i '' '/<\/body>/i\\
'"$(cat "$PROJECT_DIR/src/new-sale-modal.html")"'\
' "$PROJECT_DIR/src/index.html"
fi

echo "Fix for missing New Sale button applied!"
echo ""
echo "Please restart your application to see the changes."
echo "If you encounter any issues, you can restore from the backups in $PROJECT_DIR/backups/"