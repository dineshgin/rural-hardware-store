// Missing functions for renderer.js
// Copy and paste these functions into your renderer.js file

// Function to load sales data
async function loadSalesData() {
  console.log('Loading sales data');
  
  try {
    const salesTable = document.getElementById('sales-table');
    if (!salesTable) {
      console.error('Sales table not found');
      return;
    }
    
    const tableBody = salesTable.querySelector('tbody');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading sales data...</td></tr>';
    
    // Fetch invoices from the database
    const invoices = await ipcRenderer.invoke('get-invoices');
    
    if (invoices.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No sales records found</td></tr>';
      return;
    }
    
    // Helper functions for formatting
    const formatCurrency = (amount) => {
      return '₹' + parseFloat(amount).toFixed(2);
    };
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN');
    };
    
    // Clear the table and add the invoices
    tableBody.innerHTML = '';
    
    invoices.forEach(invoice => {
      const row = document.createElement('tr');
      
      // Create invoice number cell
      const invoiceNumberCell = document.createElement('td');
      invoiceNumberCell.textContent = invoice.invoiceNumber;
      row.appendChild(invoiceNumberCell);
      
      // Create customer cell
      const customerCell = document.createElement('td');
      customerCell.textContent = invoice.customerName || 'Walk-in Customer';
      row.appendChild(customerCell);
      
      // Create date cell
      const dateCell = document.createElement('td');
      dateCell.textContent = formatDate(invoice.date);
      row.appendChild(dateCell);
      
      // Create amount cell
      const amountCell = document.createElement('td');
      amountCell.textContent = formatCurrency(invoice.totalAmount);
      row.appendChild(amountCell);
      
      // Create status cell
      const statusCell = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = `badge ${invoice.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'}`;
      statusBadge.textContent = invoice.paymentStatus;
      statusCell.appendChild(statusBadge);
      row.appendChild(statusCell);
      
      // Create actions cell
      const actionsCell = document.createElement('td');
      
      // View button
      const viewButton = document.createElement('button');
      viewButton.className = 'btn btn-sm btn-info me-1';
      viewButton.innerHTML = '<i class="bi bi-eye"></i> View';
      viewButton.addEventListener('click', () => viewInvoice(invoice.id));
      actionsCell.appendChild(viewButton);
      
      // Print button
      const printButton = document.createElement('button');
      printButton.className = 'btn btn-sm btn-secondary me-1';
      printButton.innerHTML = '<i class="bi bi-printer"></i> Print';
      printButton.addEventListener('click', () => printInvoice(invoice.id));
      actionsCell.appendChild(printButton);
      
      // Delete button
      const deleteButton = document.createElement('button');
      deleteButton.className = 'btn btn-sm btn-danger';
      deleteButton.innerHTML = '<i class="bi bi-trash"></i> Delete';
      deleteButton.addEventListener('click', () => deleteInvoice(invoice.id));
      actionsCell.appendChild(deleteButton);
      
      row.appendChild(actionsCell);
      
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading sales data:', error);
    alert('Error loading sales data: ' + error.message);
  }
}

// Function to view invoice details
async function viewInvoice(invoiceId) {
  console.log(`Viewing invoice: ${invoiceId}`);
  
  try {
    const invoiceData = await ipcRenderer.invoke('get-invoice', invoiceId);
    const invoiceItems = await ipcRenderer.invoke('get-invoice-items', invoiceId);
    
    const modalBody = document.getElementById('invoice-details');
    
    // Helper functions for formatting
    const formatCurrency = (amount) => {
      return '₹' + parseFloat(amount).toFixed(2);
    };
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN');
    };
    
    // Create invoice details HTML
    let html = `
      <div class="invoice-header mb-4">
        <div class="row">
          <div class="col-md-6">
            <h4>Invoice #${invoiceData.invoiceNumber}</h4>
            <p>Date: ${formatDate(invoiceData.date)}</p>
          </div>
          <div class="col-md-6 text-end">
            <span class="badge ${invoiceData.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'}">${invoiceData.paymentStatus}</span>
            <p>Payment Method: ${invoiceData.paymentMethod}</p>
          </div>
        </div>
      </div>
      
      <div class="customer-info mb-4">
        <h5>Customer Information</h5>
        <p>${invoiceData.customerName || 'Walk-in Customer'}</p>
      </div>
      
      <div class="items-info mb-4">
        <h5>Items</h5>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add invoice items
    invoiceItems.forEach(item => {
      html += `
        <tr>
          <td>${item.productName}</td>
          <td>${formatCurrency(item.price)}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.total)}</td>
        </tr>
      `;
    });
    
    // Add totals
    html += `
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="text-end">Subtotal:</td>
              <td>${formatCurrency(invoiceData.subtotal)}</td>
            </tr>
            <tr>
              <td colspan="3" class="text-end">Discount (${invoiceData.discountRate}%):</td>
              <td>${formatCurrency(invoiceData.discountAmount)}</td>
            </tr>
            <tr>
              <td colspan="3" class="text-end">Tax (${invoiceData.taxRate}%):</td>
              <td>${formatCurrency(invoiceData.taxAmount)}</td>
            </tr>
            <tr>
              <td colspan="3" class="text-end"><strong>Total:</strong></td>
              <td><strong>${formatCurrency(invoiceData.totalAmount)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div class="notes-info">
        <h5>Notes</h5>
        <p>${invoiceData.notes || 'No notes'}</p>
      </div>
    `;
    
    modalBody.innerHTML = html;
    
    // Show the modal
    safeShowModal('view-invoice-modal');
  } catch (error) {
    console.error('Error viewing invoice:', error);
    alert('Error viewing invoice: ' + error.message);
  }
}

// Function to print invoice
function printInvoice(invoiceId) {
  console.log(`Printing invoice: ${invoiceId}`);
  
  // You can implement this to generate a printable version of the invoice
  // For now, we'll just show a message
  alert('Printing functionality will be implemented soon.');
}

// Function to delete invoice
async function deleteInvoice(invoiceId) {
  console.log(`Deleting invoice: ${invoiceId}`);
  
  if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
    try {
      await ipcRenderer.invoke('delete-invoice', invoiceId);
      alert('Invoice deleted successfully.');
      loadSalesData(); // Reload the sales data
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Error deleting invoice: ' + error.message);
    }
  }
}

// Function to load inventory data
async function loadInventoryData() {
  console.log('Loading inventory data');
  
  try {
    const inventoryTable = document.getElementById('inventory-table');
    if (!inventoryTable) {
      console.error('Inventory table not found');
      return;
    }
    
    const tableBody = inventoryTable.querySelector('tbody');
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading inventory data...</td></tr>';
    
    // Fetch products from the database
    const products = await fetchProducts();
    
    if (products.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
      return;
    }
    
    // Helper function for formatting currency
    const formatCurrency = (amount) => {
      return '₹' + parseFloat(amount).toFixed(2);
    };
    
    // Clear the table and add the products
    tableBody.innerHTML = '';
    
    products.forEach(product => {
      const row = document.createElement('tr');
      
      // Create name cell
      const nameCell = document.createElement('td');
      nameCell.textContent = product.name;
      row.appendChild(nameCell);
      
      // Create category cell
      const categoryCell = document.createElement('td');
      categoryCell.textContent = product.categoryName || 'Uncategorized';
      row.appendChild(categoryCell);
      
      // Create unit cell
      const unitCell = document.createElement('td');
      unitCell.textContent = product.unitName || 'N/A';
      row.appendChild(unitCell);
      
      // Create stock cell
      const stockCell = document.createElement('td');
      const stockBadge = document.createElement('span');
      stockBadge.className = `badge ${product.currentStock <= product.minStock ? 'bg-danger' : 'bg-success'}`;
      stockBadge.textContent = product.currentStock;
      stockCell.appendChild(stockBadge);
      row.appendChild(stockCell);
      
      // Create purchase price cell
      const purchasePriceCell = document.createElement('td');
      purchasePriceCell.textContent = formatCurrency(product.purchasePrice);
      row.appendChild(purchasePriceCell);
      
      // Create selling price cell
      const sellingPriceCell = document.createElement('td');
      sellingPriceCell.textContent = formatCurrency(product.sellingPrice);
      row.appendChild(sellingPriceCell);
      
      // Create actions cell
      const actionsCell = document.createElement('td');
      
      // Edit button
      const editButton = document.createElement('button');
      editButton.className = 'btn btn-sm btn-primary me-1';
      editButton.innerHTML = '<i class="bi bi-pencil"></i> Edit';
      editButton.addEventListener('click', () => editProduct(product.id));
      actionsCell.appendChild(editButton);
      
      // Delete button
      const deleteButton = document.createElement('button');
      deleteButton.className = 'btn btn-sm btn-danger';
      deleteButton.innerHTML = '<i class="bi bi-trash"></i> Delete';
      deleteButton.addEventListener('click', () => deleteProduct(product.id));
      actionsCell.appendChild(deleteButton);
      
      row.appendChild(actionsCell);
      
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading inventory data:', error);
    alert('Error loading inventory data: ' + error.message);
  }
}

// Function to load customers data
async function loadCustomersData() {
  console.log('Loading customers data');
  
  try {
    const customersTable = document.getElementById('customers-table');
    if (!customersTable) {
      console.error('Customers table not found');
      return;
    }
    
    const tableBody = customersTable.querySelector('tbody');
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading customer data...</td></tr>';
    
    // Fetch customers from the database
    const customers = await fetchCustomers();
    
    if (customers.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No customers found</td></tr>';
      return;
    }
    
    // Clear the table and add the customers
    tableBody.innerHTML = '';
    
    customers.forEach(customer => {
      const row = document.createElement('tr');
      
      // Create name cell
      const nameCell = document.createElement('td');
      nameCell.textContent = customer.name;
      row.appendChild(nameCell);
      
      // Create phone cell
      const phoneCell = document.createElement('td');
      phoneCell.textContent = customer.phone || 'N/A';
      row.appendChild(phoneCell);
      
      // Create address cell
      const addressCell = document.createElement('td');
      addressCell.textContent = customer.address || 'N/A';
      row.appendChild(addressCell);
      
      // Create email cell
      const emailCell = document.createElement('td');
      emailCell.textContent = customer.email || 'N/A';
      row.appendChild(emailCell);
      
      // Create actions cell
      const actionsCell = document.createElement('td');
      
      // View button
      const viewButton = document.createElement('button');
      viewButton.className = 'btn btn-sm btn-info me-1';
      viewButton.innerHTML = '<i class="bi bi-eye"></i> View';
      viewButton.addEventListener('click', () => viewCustomer(customer.id));
      actionsCell.appendChild(viewButton);
      
      // Edit button
      const editButton = document.createElement('button');
      editButton.className = 'btn btn-sm btn-primary me-1';
      editButton.innerHTML = '<i class="bi bi-pencil"></i> Edit';
      editButton.addEventListener('click', () => editCustomer(customer.id));
      actionsCell.appendChild(editButton);
      
      // Delete button
      const deleteButton = document.createElement('button');
      deleteButton.className = 'btn btn-sm btn-danger';
      deleteButton.innerHTML = '<i class="bi bi-trash"></i> Delete';
      deleteButton.addEventListener('click', () => deleteCustomer(customer.id));
      actionsCell.appendChild(deleteButton);
      
      row.appendChild(actionsCell);
      
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading customers data:', error);
    alert('Error loading customers data: ' + error.message);
  }
}

// Function to update dashboard data
function updateDashboardData(data) {
  console.log('Updating dashboard data', data);
  
  // Helper function for formatting currency
  const formatCurrency = (amount) => {
    return '₹' + parseFloat(amount).toFixed(2);
  };
  
  // Update the dashboard cards
  document.querySelector('.bg-primary .card-title').textContent = formatCurrency(data.todaySales || 0);
  document.querySelector('.bg-primary .card-text').textContent = `${data.todayTransactions || 0} transactions`;
  
  document.querySelector('.bg-success .card-title').textContent = data.totalProducts || 0;
  document.querySelector('.bg-success .card-text').textContent = 'In inventory';
  
  document.querySelector('.bg-warning .card-title').textContent = data.lowStockItems || 0;
  document.querySelector('.bg-warning .card-text').textContent = 'Items below minimum';
  
  document.querySelector('.bg-danger .card-title').textContent = formatCurrency(data.pendingPayments || 0);
  document.querySelector('.bg-danger .card-text').textContent = `${data.pendingInvoices || 0} invoices`;
  
  // Update recent sales
  updateRecentSales(data.recentSales || []);
}

// Function to update recent sales on dashboard
function updateRecentSales(invoices) {
  console.log('Updating recent sales', invoices);
  
  // Helper functions for formatting
  const formatCurrency = (amount) => {
    return '₹' + parseFloat(amount).toFixed(2);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };
  
  const tableBody = document.querySelector('#dashboard-page .card:first-of-type table tbody');
  
  if (invoices.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No recent sales</td></tr>';
    return;
  }
  
  // Clear the table and add the invoices
  tableBody.innerHTML = '';
  
  invoices.slice(0, 5).forEach(invoice => {
    const row = document.createElement('tr');
    
    // Create invoice number cell
    const invoiceNumberCell = document.createElement('td');
    invoiceNumberCell.textContent = invoice.invoiceNumber;
    row.appendChild(invoiceNumberCell);
    
    // Create customer cell
    const customerCell = document.createElement('td');
    customerCell.textContent = invoice.customerName || 'Walk-in Customer';
    row.appendChild(customerCell);
    
    // Create date cell
    const dateCell = document.createElement('td');
    dateCell.textContent = formatDate(invoice.date);
    row.appendChild(dateCell);
    
    // Create amount cell
    const amountCell = document.createElement('td');
    amountCell.textContent = formatCurrency(invoice.totalAmount);
    row.appendChild(amountCell);
    
    // Create status cell
    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = `badge ${invoice.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'}`;
    statusBadge.textContent = invoice.paymentStatus;
    statusCell.appendChild(statusBadge);
    row.appendChild(statusCell);
    
    tableBody.appendChild(row);
  });
}

// Function to set up quick action buttons
function setupQuickActionButtons() {
  console.log('Setting up quick action buttons');
  
  const quickActionButtons = document.querySelectorAll('#dashboard-page .quick-actions button');
  
  quickActionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const action = button.textContent.trim();
      
      switch (action) {
        case 'New Sale':
          showPage('sales');
          loadPageData('sales');
          setTimeout(() => openNewSaleModal(), 500);
          break;
        case 'Add Product':
          showPage('inventory');
          loadPageData('inventory');
          setTimeout(() => openAddProductModal(), 500);
          break;
        case 'Add Customer':
          showPage('customers');
          loadPageData('customers');
          setTimeout(() => openAddCustomerModal(), 500);
          break;
        case 'Generate Report':
          showPage('reports');
          loadPageData('reports');
          break;
      }
    });
  });
}