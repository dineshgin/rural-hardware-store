// Complete Sales Page Fix
// This script completely replaces the sales page with a properly formatted version

document.addEventListener('DOMContentLoaded', function() {
  console.log('Applying complete sales page fix...');
  
  // Function to completely replace the sales page
  function replaceEntireSalesPage() {
    console.log('Replacing entire sales page...');
    
    // Create the new sales page content
    const newSalesPageHTML = `
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
    `;
    
    // Find the existing sales page
    const existingSalesPage = document.getElementById('sales-page');
    
    if (existingSalesPage) {
      // Replace the existing sales page
      existingSalesPage.outerHTML = newSalesPageHTML;
      console.log('Existing sales page replaced');
    } else {
      // If no sales page exists, find where to insert it
      const pageContent = document.getElementById('page-content');
      
      if (pageContent) {
        // Insert after the dashboard page
        const dashboardPage = document.getElementById('dashboard-page');
        
        if (dashboardPage) {
          dashboardPage.insertAdjacentHTML('afterend', newSalesPageHTML);
          console.log('Sales page inserted after dashboard page');
        } else {
          // If no dashboard page, insert at the beginning of page-content
          pageContent.insertAdjacentHTML('afterbegin', newSalesPageHTML);
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
        openNewSaleModal();
      });
      console.log('Event listener added to New Sale button');
    } else {
      console.error('New Sale button not found after replacement');
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
        const salesPage = document.getElementById('sales-page');
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
  }
  
  // Function to create the New Sale modal if it doesn't exist
  function ensureNewSaleModal() {
    if (!document.getElementById('new-sale-modal')) {
      console.log('Creating New Sale modal...');
      
      const newSaleModalHTML = `
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
      `;
      
      // Add the modal to the body
      document.body.insertAdjacentHTML('beforeend', newSaleModalHTML);
      console.log('New Sale modal created');
    }
  }
  
  // Function to implement openNewSaleModal if it doesn't exist
  function implementOpenNewSaleModal() {
    if (typeof window.openNewSaleModal !== 'function') {
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
  }
  
  // Function to add CSS fixes
  function addCSSFixes() {
    console.log('Adding CSS fixes...');
    
    // Create a style element
    const style = document.createElement('style');
    style.textContent = `
      /* Fix for the sales page layout */
      #sales-page {
        padding: 20px;
        height: auto;
        min-height: 100%;
        overflow-y: visible;
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
        height: auto;
        min-height: 100%;
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
      
      /* Fix for tables */
      .table {
        width: 100%;
        margin-bottom: 1rem;
      }
      
      /* Fix for cards */
      .card {
        margin-bottom: 20px;
      }
    `;
    
    // Add the style element to the head
    document.head.appendChild(style);
    console.log('CSS fixes added');
  }
  
  // Run all fixes
  setTimeout(function() {
    addCSSFixes();
    replaceEntireSalesPage();
    ensureNewSaleModal();
    implementOpenNewSaleModal();
    
    console.log('All fixes applied');
  }, 500);
});