// Fix for Sales Tab in Rural Hardware Store application
// This script fixes the missing New Sale button and repositions the sales data

document.addEventListener('DOMContentLoaded', function() {
  console.log('Applying sales tab fixes...');
  
  // Function to fix the sales page
  function fixSalesPage() {
    console.log('Fixing sales page...');
    
    // Get the sales page container
    const salesPage = document.getElementById('sales-page');
    if (!salesPage) {
      console.error('Sales page not found');
      return;
    }
    
    // Clear the current content
    salesPage.innerHTML = '';
    
    // Add the new content with proper structure
    salesPage.innerHTML = `
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
    `;
    
    // Add event listener to the new sale button
    const newSaleBtn = document.getElementById('new-sale-btn');
    if (newSaleBtn) {
      newSaleBtn.addEventListener('click', function() {
        console.log('New Sale button clicked');
        openNewSaleModal();
      });
      console.log('Event listener added to New Sale button');
    } else {
      console.error('New Sale button not found after fixing sales page');
    }
    
    // Make sure the sales page is visible when the sales button is clicked
    const salesNavButton = document.querySelector('[data-page="sales"]');
    if (salesNavButton) {
      salesNavButton.addEventListener('click', function() {
        // Hide all pages
        document.querySelectorAll('.page-container').forEach(page => {
          page.classList.remove('active');
        });
        
        // Show the sales page
        if (salesPage) {
          salesPage.classList.add('active');
        }
        
        // Update active button
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
        });
        this.classList.add('active');
      });
    }
    
    console.log('Sales page fixed');
  }
  
  // Function to ensure the New Sale modal exists
  function ensureNewSaleModal() {
    console.log('Ensuring New Sale modal exists...');
    
    // Check if the modal already exists
    let newSaleModal = document.getElementById('new-sale-modal');
    
    if (!newSaleModal) {
      console.log('New Sale modal not found, creating it...');
      
      // Create the modal
      newSaleModal = document.createElement('div');
      newSaleModal.id = 'new-sale-modal';
      newSaleModal.className = 'modal fade';
      newSaleModal.tabIndex = -1;
      newSaleModal.setAttribute('aria-labelledby', 'newSaleModalLabel');
      newSaleModal.setAttribute('aria-hidden', 'true');
      
      newSaleModal.innerHTML = `
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
      `;
      
      // Add the modal to the body
      document.body.appendChild(newSaleModal);
      console.log('New Sale modal created');
    } else {
      console.log('New Sale modal already exists');
    }
    
    // Ensure the Add Item modal exists
    ensureAddItemModal();
  }
  
  // Function to ensure the Add Item modal exists
  function ensureAddItemModal() {
    console.log('Ensuring Add Item modal exists...');
    
    // Check if the modal already exists
    let addItemModal = document.getElementById('add-item-modal');
    
    if (!addItemModal) {
      console.log('Add Item modal not found, creating it...');
      
      // Create the modal
      addItemModal = document.createElement('div');
      addItemModal.id = 'add-item-modal';
      addItemModal.className = 'modal fade';
      addItemModal.tabIndex = -1;
      addItemModal.setAttribute('aria-labelledby', 'addItemModalLabel');
      addItemModal.setAttribute('aria-hidden', 'true');
      
      addItemModal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="addItemModalLabel">Add Item</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="product-select" class="form-label">Select Product</label>
                <div class="input-group">
                  <select class="form-select" id="product-select">
                    <option value="">Select a product</option>
                    <!-- Product options will be loaded here -->
                  </select>
                  <button class="btn btn-outline-secondary" type="button" id="quick-add-product-btn">
                    <i class="bi bi-plus"></i> New
                  </button>
                </div>
              </div>
              
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="product-price" class="form-label">Price</label>
                  <div class="input-group">
                    <span class="input-group-text">₹</span>
                    <input type="number" class="form-control" id="product-price" step="0.01" value="0.00">
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="product-quantity" class="form-label">Quantity</label>
                  <div class="input-group">
                    <input type="number" class="form-control" id="product-quantity" value="1" min="0.01" step="0.01">
                    <span class="input-group-text" id="quantity-unit">pcs</span>
                  </div>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="item-total" class="form-label">Total</label>
                <div class="input-group">
                  <span class="input-group-text">₹</span>
                  <input type="number" class="form-control" id="item-total" value="0.00" readonly>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="confirm-add-item-btn">Add to Sale</button>
            </div>
          </div>
        </div>
      `;
      
      // Add the modal to the body
      document.body.appendChild(addItemModal);
      console.log('Add Item modal created');
    } else {
      console.log('Add Item modal already exists');
    }
  }
  
  // Function to implement the openNewSaleModal function
  function implementOpenNewSaleModal() {
    console.log('Implementing openNewSaleModal function...');
    
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
        
        // Try to load customers for the dropdown
        try {
          if (typeof loadCustomersForDropdown === 'function') {
            loadCustomersForDropdown('customer-select');
          }
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
    
    console.log('openNewSaleModal function implemented');
  }
  
  // Function to set up event listeners for the Add Item modal
  function setupAddItemModalListeners() {
    console.log('Setting up Add Item modal listeners...');
    
    // Add Item button in the New Sale modal
    const addItemBtn = document.getElementById('add-item-btn');
    if (addItemBtn) {
      addItemBtn.addEventListener('click', function() {
        console.log('Add Item button clicked');
        
        // Try to load products for the dropdown
        try {
          if (typeof loadProductsForDropdown === 'function') {
            loadProductsForDropdown('product-select');
          }
        } catch (e) {
          console.error('Error loading products:', e);
        }
        
        // Show the modal
        const modal = document.getElementById('add-item-modal');
        if (modal) {
          const bsModal = new bootstrap.Modal(modal);
          bsModal.show();
        } else {
          console.error('Add Item modal not found');
          alert('Error: Add Item modal not found');
        }
      });
      console.log('Event listener added to Add Item button');
    } else {
      console.error('Add Item button not found');
    }
    
    // Product select dropdown
    const productSelect = document.getElementById('product-select');
    const productPrice = document.getElementById('product-price');
    const productQuantity = document.getElementById('product-quantity');
    const itemTotal = document.getElementById('item-total');
    
    if (productSelect && productPrice && productQuantity && itemTotal) {
      // Update price when product is selected
      productSelect.addEventListener('change', function() {
        console.log('Product selected:', this.value);
        
        if (this.value) {
          // Try to get product details
          try {
            if (typeof ipcRenderer !== 'undefined') {
              ipcRenderer.invoke('get-product', parseInt(this.value))
                .then(product => {
                  if (product) {
                    productPrice.value = product.sellingPrice.toFixed(2);
                    
                    // Update the quantity unit
                    const quantityUnit = document.getElementById('quantity-unit');
                    if (quantityUnit && product.unit) {
                      quantityUnit.textContent = product.unit.name || 'pcs';
                    }
                    
                    // Update the total
                    updateItemTotal();
                  }
                })
                .catch(error => {
                  console.error('Error getting product details:', error);
                });
            }
          } catch (e) {
            console.error('Error updating product price:', e);
          }
        } else {
          productPrice.value = '0.00';
          updateItemTotal();
        }
      });
      
      // Update total when price or quantity changes
      productPrice.addEventListener('input', updateItemTotal);
      productQuantity.addEventListener('input', updateItemTotal);
      
      function updateItemTotal() {
        const price = parseFloat(productPrice.value) || 0;
        const quantity = parseFloat(productQuantity.value) || 0;
        itemTotal.value = (price * quantity).toFixed(2);
      }
      
      console.log('Event listeners added to product select and price/quantity inputs');
    } else {
      console.error('Product select or price/quantity inputs not found');
    }
    
    // Confirm Add Item button
    const confirmAddItemBtn = document.getElementById('confirm-add-item-btn');
    if (confirmAddItemBtn) {
      confirmAddItemBtn.addEventListener('click', function() {
        console.log('Confirm Add Item button clicked');
        
        const productSelect = document.getElementById('product-select');
        const productPrice = document.getElementById('product-price');
        const productQuantity = document.getElementById('product-quantity');
        const itemTotal = document.getElementById('item-total');
        
        if (!productSelect.value) {
          alert('Please select a product');
          return;
        }
        
        if (!productQuantity.value || parseFloat(productQuantity.value) <= 0) {
          alert('Please enter a valid quantity');
          return;
        }
        
        // Get the product name
        const productName = productSelect.options[productSelect.selectedIndex].text;
        
        // Get the table body
        const tableBody = document.getElementById('sale-items-table').querySelector('tbody');
        
        // Remove empty row if it exists
        const emptyRow = document.getElementById('empty-row');
        if (emptyRow) {
          emptyRow.remove();
        }
        
        // Create new row
        const row = document.createElement('tr');
        row.dataset.productId = productSelect.value;
        row.dataset.price = productPrice.value;
        row.dataset.quantity = productQuantity.value;
        row.dataset.total = itemTotal.value;
        
        // Add cells
        row.innerHTML = `
          <td>${productName}</td>
          <td>₹${parseFloat(productPrice.value).toFixed(2)}</td>
          <td>${parseFloat(productQuantity.value).toFixed(2)}</td>
          <td>₹${parseFloat(itemTotal.value).toFixed(2)}</td>
          <td>
            <button class="btn btn-sm btn-danger remove-item-btn">
              <i class="bi bi-trash"></i> Remove
            </button>
          </td>
        `;
        
        // Add the row to the table
        tableBody.appendChild(row);
        
        // Add event listener to the remove button
        const removeBtn = row.querySelector('.remove-item-btn');
        removeBtn.addEventListener('click', function() {
          row.remove();
          
          // If no items left, add empty row
          if (tableBody.children.length === 0) {
            tableBody.innerHTML = `
              <tr id="empty-row">
                <td colspan="5" class="text-center">No items added</td>
              </tr>
            `;
          }
          
          // Update totals
          updateSaleTotals();
        });
        
        // Update totals
        updateSaleTotals();
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('add-item-modal'));
        modal.hide();
      });
      console.log('Event listener added to Confirm Add Item button');
    } else {
      console.error('Confirm Add Item button not found');
    }
  }
  
  // Function to update sale totals
  function updateSaleTotals() {
    console.log('Updating sale totals...');
    
    const tableBody = document.getElementById('sale-items-table').querySelector('tbody');
    const rows = tableBody.querySelectorAll('tr:not(#empty-row)');
    
    let subtotal = 0;
    
    rows.forEach(row => {
      const total = parseFloat(row.dataset.total) || 0;
      subtotal += total;
    });
    
    const taxRate = 0.18; // 18%
    const taxAmount = subtotal * taxRate;
    const discountAmount = parseFloat(document.getElementById('discount-amount').value) || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;
    
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('tax-amount').textContent = `₹${taxAmount.toFixed(2)}`;
    document.getElementById('total-amount').textContent = `₹${totalAmount.toFixed(2)}`;
    
    console.log('Sale totals updated');
  }
  
  // Function to set up the Save Sale button
  function setupSaveSaleButton() {
    console.log('Setting up Save Sale button...');
    
    const saveSaleBtn = document.getElementById('save-sale-btn');
    if (saveSaleBtn) {
      saveSaleBtn.addEventListener('click', function() {
        console.log('Save Sale button clicked');
        
        const tableBody = document.getElementById('sale-items-table').querySelector('tbody');
        const rows = tableBody.querySelectorAll('tr:not(#empty-row)');
        
        if (rows.length === 0) {
          alert('Please add at least one item to the sale');
          return;
        }
        
        // Get the customer ID
        const customerSelect = document.getElementById('customer-select');
        const customerId = customerSelect ? customerSelect.value : '';
        
        // Get the date
        const dateInput = document.getElementById('sale-date');
        const date = dateInput ? dateInput.value : '';
        
        // Get the notes
        const notesInput = document.getElementById('sale-notes');
        const notes = notesInput ? notesInput.value : '';
        
        // Get the payment method
        const paymentMethodSelect = document.getElementById('payment-method');
        const paymentMethod = paymentMethodSelect ? paymentMethodSelect.value : 'cash';
        
        // Get the totals
        const subtotalElement = document.getElementById('subtotal');
        const taxAmountElement = document.getElementById('tax-amount');
        const discountAmountInput = document.getElementById('discount-amount');
        const totalAmountElement = document.getElementById('total-amount');
        
        const subtotal = parseFloat(subtotalElement?.textContent?.replace('₹', '') || 0);
        const taxAmount = parseFloat(taxAmountElement?.textContent?.replace('₹', '') || 0);
        const discountAmount = parseFloat(discountAmountInput?.value || 0);
        const totalAmount = parseFloat(totalAmountElement?.textContent?.replace('₹', '') || 0);
        
        // Create the items array
        const items = [];
        rows.forEach(row => {
          items.push({
            productId: parseInt(row.dataset.productId),
            price: parseFloat(row.dataset.price),
            quantity: parseFloat(row.dataset.quantity),
            total: parseFloat(row.dataset.total)
          });
        });
        
        // Create the sale object
        const sale = {
          customerId: customerId || null,
          date,
          notes,
          paymentMethod,
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount,
          items
        };
        
        console.log('Sale data:', sale);
        
        // Try to save the sale
        try {
          if (typeof ipcRenderer !== 'undefined') {
            ipcRenderer.invoke('save-sale', sale)
              .then(result => {
                if (result.success) {
                  alert('Sale completed successfully!');
                  
                  // Close the modal
                  const modal = bootstrap.Modal.getInstance(document.getElementById('new-sale-modal'));
                  modal.hide();
                  
                  // Reload sales data
                  if (typeof loadSalesData === 'function') {
                    loadSalesData();
                  }
                } else {
                  alert('Error saving sale: ' + (result.error || 'Unknown error'));
                }
              })
              .catch(error => {
                console.error('Error saving sale:', error);
                alert('Error saving sale: ' + error.message);
              });
          } else {
            // For testing without IPC
            alert('Sale completed successfully!');
            
            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('new-sale-modal'));
            modal.hide();
          }
        } catch (error) {
          console.error('Error saving sale:', error);
          alert('Error saving sale: ' + error.message);
        }
      });
      console.log('Event listener added to Save Sale button');
    } else {
      console.error('Save Sale button not found');
    }
  }
  
  // Function to add CSS fixes
  function addCSSFixes() {
    console.log('Adding CSS fixes...');
    
    // Create a style element
    const style = document.createElement('style');
    style.textContent = `
      /* Fix for the sales page layout */
      #sales-page {
        padding: 20px !important;
        height: auto !important;
        min-height: 100% !important;
        overflow-y: visible !important;
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
    `;
    
    // Add the style element to the head
    document.head.appendChild(style);
    console.log('CSS fixes added');
  }
  
  // Run all fixes with a delay to ensure the DOM is loaded
  setTimeout(function() {
    addCSSFixes();
    fixSalesPage();
    ensureNewSaleModal();
    implementOpenNewSaleModal();
    setupAddItemModalListeners();
    setupSaveSaleButton();
    
    // Add a global function to update the discount amount
    document.getElementById('discount-amount')?.addEventListener('input', updateSaleTotals);
    
    console.log('All sales tab fixes applied');
  }, 1000);
});