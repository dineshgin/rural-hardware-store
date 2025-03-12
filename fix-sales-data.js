// Updated loadSalesData function with better error handling
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
    let invoices = await ipcRenderer.invoke('get-invoices');
    console.log('Invoices data received:', invoices);
    
    // Check if invoices is an array, if not, convert it or use an empty array
    if (!Array.isArray(invoices)) {
      console.warn('Invoices data is not an array:', invoices);
      
      // If it's an object with data property that is an array, use that
      if (invoices && Array.isArray(invoices.data)) {
        invoices = invoices.data;
        console.log('Using invoices.data instead:', invoices);
      } else if (typeof invoices === 'object' && invoices !== null) {
        // Try to convert object to array if possible
        try {
          const tempArray = Object.values(invoices);
          if (Array.isArray(tempArray) && tempArray.length > 0) {
            invoices = tempArray;
            console.log('Converted object to array:', invoices);
          } else {
            invoices = [];
          }
        } catch (e) {
          console.error('Failed to convert invoices to array:', e);
          invoices = [];
        }
      } else {
        // Default to empty array
        invoices = [];
      }
    }
    
    if (invoices.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No sales records found</td></tr>';
      return;
    }
    
    // Helper functions for formatting
    const formatCurrency = (amount) => {
      return '₹' + parseFloat(amount || 0).toFixed(2);
    };
    
    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN');
      } catch (e) {
        return 'Invalid Date';
      }
    };
    
    // Clear the table and add the invoices
    tableBody.innerHTML = '';
    
    invoices.forEach(invoice => {
      // Skip if invoice is not a valid object
      if (!invoice || typeof invoice !== 'object') {
        console.warn('Invalid invoice data:', invoice);
        return;
      }
      
      const row = document.createElement('tr');
      
      // Create invoice number cell
      const invoiceNumberCell = document.createElement('td');
      invoiceNumberCell.textContent = invoice.invoiceNumber || 'N/A';
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
      statusBadge.textContent = invoice.paymentStatus || 'Unknown';
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
    const salesTable = document.getElementById('sales-table');
    if (salesTable) {
      const tableBody = salesTable.querySelector('tbody');
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error loading sales data: ${error.message}</td></tr>`;
    }
    alert('Error loading sales data: ' + error.message);
  }
}