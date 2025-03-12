// Fix for New Sale functionality

// Fix for getNextInvoiceNumber function
async function getNextInvoiceNumber() {
  try {
    const result = await ipcRenderer.invoke('get-next-invoice-number');
    console.log('Next invoice number result:', result);
    
    // Handle different return types
    if (typeof result === 'string') {
      return result;
    } else if (typeof result === 'object' && result !== null) {
      // If it's an object, try to extract a string representation
      if (result.number) return result.number;
      if (result.invoiceNumber) return result.invoiceNumber;
      if (result.id) return `INV-${result.id}`;
      
      // Last resort: stringify but warn about it
      console.warn('Invoice number is an object, converting to string:', result);
      return `INV-${Date.now()}`;
    } else if (typeof result === 'number') {
      return `INV-${result}`;
    }
    
    // Fallback
    return `INV-${Date.now()}`;
  } catch (error) {
    console.error('Error getting next invoice number:', error);
    return `INV-${Date.now()}`;
  }
}

// Fix for openNewSaleModal function
async function openNewSaleModal() {
  console.log('Opening new sale modal');
  
  try {
    // Get the next invoice number
    const invoiceNumber = await getNextInvoiceNumber();
    console.log('Invoice number:', invoiceNumber);
    
    const invoiceNumberInput = document.getElementById('invoice-number');
    if (invoiceNumberInput) {
      invoiceNumberInput.value = invoiceNumber;
    } else {
      console.error('Invoice number input not found');
    }
    
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('invoice-date');
    if (dateInput) {
      dateInput.value = today;
    } else {
      console.error('Invoice date input not found');
    }
    
    // Load customers for dropdown
    await loadCustomersForDropdown();
    
    // Clear any existing items
    const tableBody = document.getElementById('sale-items-table')?.querySelector('tbody');
    if (tableBody) {
      tableBody.innerHTML = '<tr id="empty-row"><td colspan="5" class="text-center">No items added</td></tr>';
    } else {
      console.error('Sale items table body not found');
    }
    
    // Reset totals
    const subtotalElement = document.getElementById('subtotal');
    if (subtotalElement) subtotalElement.textContent = formatCurrency(0);
    
    const discountInput = document.getElementById('discount');
    if (discountInput) discountInput.value = 0;
    
    const discountAmountElement = document.getElementById('discount-amount');
    if (discountAmountElement) discountAmountElement.textContent = formatCurrency(0);
    
    const taxInput = document.getElementById('tax');
    if (taxInput) taxInput.value = 18;
    
    const taxAmountElement = document.getElementById('tax-amount');
    if (taxAmountElement) taxAmountElement.textContent = formatCurrency(0);
    
    const totalAmountElement = document.getElementById('total-amount');
    if (totalAmountElement) totalAmountElement.textContent = formatCurrency(0);
    
    // Clear notes
    const notesInput = document.getElementById('notes');
    if (notesInput) notesInput.value = '';
    
    // Show the modal
    safeShowModal('new-sale-modal');
  } catch (error) {
    console.error('Error opening new sale modal:', error);
    alert('Error opening new sale modal: ' + error.message);
  }
}

// Fix for loadCustomersForDropdown function
async function loadCustomersForDropdown() {
  try {
    const customerSelect = document.getElementById('customer-select');
    if (!customerSelect) {
      console.error('Customer select element not found');
      return;
    }
    
    customerSelect.innerHTML = '<option value="">Walk-in Customer</option>';
    
    const customers = await fetchCustomers();
    console.log('Customers data:', customers);
    
    // Check if customers is an array
    if (!Array.isArray(customers)) {
      console.warn('Customers data is not an array:', customers);
      
      // If it's an object with data property that is an array, use that
      if (customers && Array.isArray(customers.data)) {
        console.log('Using customers.data instead:', customers.data);
        customers.data.forEach(addCustomerToDropdown);
      } else if (typeof customers === 'object' && customers !== null) {
        // Try to convert object to array if possible
        try {
          const tempArray = Object.values(customers);
          if (Array.isArray(tempArray) && tempArray.length > 0) {
            console.log('Converted customers object to array:', tempArray);
            tempArray.forEach(addCustomerToDropdown);
          }
        } catch (e) {
          console.error('Failed to convert customers to array:', e);
        }
      }
      return;
    }
    
    // If we have an array, add each customer to the dropdown
    customers.forEach(addCustomerToDropdown);
    
    function addCustomerToDropdown(customer) {
      if (!customer || typeof customer !== 'object') {
        console.warn('Invalid customer data:', customer);
        return;
      }
      
      const option = document.createElement('option');
      option.value = customer.id;
      option.textContent = customer.name;
      customerSelect.appendChild(option);
    }
  } catch (error) {
    console.error('Error loading customers for dropdown:', error);
  }
}

// Fix for openAddItemModal function
async function openAddItemModal() {
  console.log('Opening add item modal');
  
  try {
    // Load products for dropdown
    await loadProductsForDropdown();
    
    // Reset form
    const productSelect = document.getElementById('product-select');
    if (productSelect) productSelect.value = '';
    
    const productPrice = document.getElementById('product-price');
    if (productPrice) productPrice.value = '';
    
    const productQuantity = document.getElementById('product-quantity');
    if (productQuantity) productQuantity.value = 1;
    
    const itemTotal = document.getElementById('item-total');
    if (itemTotal) itemTotal.value = '';
    
    // Show the modal
    safeShowModal('add-item-modal');
  } catch (error) {
    console.error('Error opening add item modal:', error);
    alert('Error opening add item modal: ' + error.message);
  }
}

// Fix for loadProductsForDropdown function
async function loadProductsForDropdown() {
  try {
    const productSelect = document.getElementById('product-select');
    if (!productSelect) {
      console.error('Product select element not found');
      return;
    }
    
    productSelect.innerHTML = '<option value="">Select Product</option>';
    
    const products = await fetchProducts();
    console.log('Products data:', products);
    
    // Check if products is an array
    if (!Array.isArray(products)) {
      console.warn('Products data is not an array:', products);
      
      // If it's an object with data property that is an array, use that
      if (products && Array.isArray(products.data)) {
        console.log('Using products.data instead:', products.data);
        products.data.forEach(addProductToDropdown);
      } else if (typeof products === 'object' && products !== null) {
        // Try to convert object to array if possible
        try {
          const tempArray = Object.values(products);
          if (Array.isArray(tempArray) && tempArray.length > 0) {
            console.log('Converted products object to array:', tempArray);
            tempArray.forEach(addProductToDropdown);
          }
        } catch (e) {
          console.error('Failed to convert products to array:', e);
        }
      }
      return;
    }
    
    // If we have an array, add each product to the dropdown
    products.forEach(addProductToDropdown);
    
    function addProductToDropdown(product) {
      if (!product || typeof product !== 'object') {
        console.warn('Invalid product data:', product);
        return;
      }
      
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = product.name;
      option.dataset.price = product.sellingPrice;
      productSelect.appendChild(option);
    }
    
    // Add event listener to update price when product is selected
    productSelect.addEventListener('change', updateProductPrice);
  } catch (error) {
    console.error('Error loading products for dropdown:', error);
  }
}

// Fix for updateProductPrice function
function updateProductPrice() {
  const productSelect = document.getElementById('product-select');
  const productPrice = document.getElementById('product-price');
  const productQuantity = document.getElementById('product-quantity');
  const itemTotal = document.getElementById('item-total');
  
  if (!productSelect || !productPrice || !productQuantity || !itemTotal) {
    console.error('One or more elements not found for updateProductPrice');
    return;
  }
  
  const selectedOption = productSelect.options[productSelect.selectedIndex];
  
  if (selectedOption && selectedOption.value) {
    const price = parseFloat(selectedOption.dataset.price) || 0;
    productPrice.value = price.toFixed(2);
    
    // Update total
    const quantity = parseFloat(productQuantity.value) || 0;
    const total = price * quantity;
    itemTotal.value = total.toFixed(2);
  } else {
    productPrice.value = '';
    itemTotal.value = '';
  }
}

// Fix for loadInventoryData function
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
    let products = await fetchProducts();
    console.log('Products data:', products);
    
    // Check if products is an array
    if (!Array.isArray(products)) {
      console.warn('Products data is not an array:', products);
      
      // If it's an object with data property that is an array, use that
      if (products && Array.isArray(products.data)) {
        products = products.data;
        console.log('Using products.data instead:', products);
      } else if (typeof products === 'object' && products !== null) {
        // Try to convert object to array if possible
        try {
          const tempArray = Object.values(products);
          if (Array.isArray(tempArray) && tempArray.length > 0) {
            products = tempArray;
            console.log('Converted products object to array:', products);
          } else {
            products = [];
          }
        } catch (e) {
          console.error('Failed to convert products to array:', e);
          products = [];
        }
      } else {
        // Default to empty array
        products = [];
      }
    }
    
    if (products.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
      return;
    }
    
    // Helper function for formatting currency
    const formatCurrency = (amount) => {
      return '₹' + parseFloat(amount || 0).toFixed(2);
    };
    
    // Clear the table and add the products
    tableBody.innerHTML = '';
    
    products.forEach(product => {
      // Skip if product is not a valid object
      if (!product || typeof product !== 'object') {
        console.warn('Invalid product data:', product);
        return;
      }
      
      const row = document.createElement('tr');
      
      // Create name cell
      const nameCell = document.createElement('td');
      nameCell.textContent = product.name || 'Unknown Product';
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
      stockBadge.className = `badge ${(product.currentStock <= product.minStock) ? 'bg-danger' : 'bg-success'}`;
      stockBadge.textContent = product.currentStock || 0;
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

// Fix for loadCustomersData function
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
    let customers = await fetchCustomers();
    console.log('Customers data:', customers);
    
    // Check if customers is an array
    if (!Array.isArray(customers)) {
      console.warn('Customers data is not an array:', customers);
      
      // If it's an object with data property that is an array, use that
      if (customers && Array.isArray(customers.data)) {
        customers = customers.data;
        console.log('Using customers.data instead:', customers);
      } else if (typeof customers === 'object' && customers !== null) {
        // Try to convert object to array if possible
        try {
          const tempArray = Object.values(customers);
          if (Array.isArray(tempArray) && tempArray.length > 0) {
            customers = tempArray;
            console.log('Converted customers object to array:', customers);
          } else {
            customers = [];
          }
        } catch (e) {
          console.error('Failed to convert customers to array:', e);
          customers = [];
        }
      } else {
        // Default to empty array
        customers = [];
      }
    }
    
    if (customers.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No customers found</td></tr>';
      return;
    }
    
    // Clear the table and add the customers
    tableBody.innerHTML = '';
    
    customers.forEach(customer => {
      // Skip if customer is not a valid object
      if (!customer || typeof customer !== 'object') {
        console.warn('Invalid customer data:', customer);
        return;
      }
      
      const row = document.createElement('tr');
      
      // Create name cell
      const nameCell = document.createElement('td');
      nameCell.textContent = customer.name || 'Unknown Customer';
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