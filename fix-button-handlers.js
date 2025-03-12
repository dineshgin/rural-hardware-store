// Fix for button click handlers
// This script focuses on fixing the "Add" buttons for customers and products

// Function to manually add event listeners to all buttons
function fixAllButtonHandlers() {
  console.log('Fixing all button handlers...');
  
  // Fix Add Customer button
  const addCustomerBtn = document.getElementById('add-customer-btn');
  if (addCustomerBtn) {
    console.log('Found Add Customer button, adding event listener');
    // Remove any existing event listeners
    const newAddCustomerBtn = addCustomerBtn.cloneNode(true);
    addCustomerBtn.parentNode.replaceChild(newAddCustomerBtn, addCustomerBtn);
    
    // Add new event listener
    newAddCustomerBtn.addEventListener('click', function() {
      console.log('Add Customer button clicked');
      try {
        openAddCustomerModal();
      } catch (error) {
        console.error('Error opening add customer modal:', error);
        alert('Error: ' + error.message);
      }
    });
  } else {
    console.error('Add Customer button not found');
  }
  
  // Fix Add Product button
  const addProductBtn = document.getElementById('add-product-btn');
  if (addProductBtn) {
    console.log('Found Add Product button, adding event listener');
    // Remove any existing event listeners
    const newAddProductBtn = addProductBtn.cloneNode(true);
    addProductBtn.parentNode.replaceChild(newAddProductBtn, addProductBtn);
    
    // Add new event listener
    newAddProductBtn.addEventListener('click', function() {
      console.log('Add Product button clicked');
      try {
        openAddProductModal();
      } catch (error) {
        console.error('Error opening add product modal:', error);
        alert('Error: ' + error.message);
      }
    });
  } else {
    console.error('Add Product button not found');
  }
  
  // Fix New Sale button
  const newSaleBtn = document.getElementById('new-sale-btn');
  if (newSaleBtn) {
    console.log('Found New Sale button, adding event listener');
    // Remove any existing event listeners
    const newNewSaleBtn = newSaleBtn.cloneNode(true);
    newSaleBtn.parentNode.replaceChild(newNewSaleBtn, newSaleBtn);
    
    // Add new event listener
    newNewSaleBtn.addEventListener('click', function() {
      console.log('New Sale button clicked');
      try {
        openNewSaleModal();
      } catch (error) {
        console.error('Error opening new sale modal:', error);
        alert('Error: ' + error.message);
      }
    });
  } else {
    console.error('New Sale button not found');
  }
  
  // Fix Add Item button
  const addItemBtn = document.getElementById('add-item-btn');
  if (addItemBtn) {
    console.log('Found Add Item button, adding event listener');
    // Remove any existing event listeners
    const newAddItemBtn = addItemBtn.cloneNode(true);
    addItemBtn.parentNode.replaceChild(newAddItemBtn, addItemBtn);
    
    // Add new event listener
    newAddItemBtn.addEventListener('click', function() {
      console.log('Add Item button clicked');
      try {
        openAddItemModal();
      } catch (error) {
        console.error('Error opening add item modal:', error);
        alert('Error: ' + error.message);
      }
    });
  } else {
    console.error('Add Item button not found');
  }
  
  // Fix Save Customer button
  const saveCustomerBtn = document.getElementById('save-customer-btn');
  if (saveCustomerBtn) {
    console.log('Found Save Customer button, adding event listener');
    // Remove any existing event listeners
    const newSaveCustomerBtn = saveCustomerBtn.cloneNode(true);
    saveCustomerBtn.parentNode.replaceChild(newSaveCustomerBtn, saveCustomerBtn);
    
    // Add new event listener
    newSaveCustomerBtn.addEventListener('click', function() {
      console.log('Save Customer button clicked');
      try {
        saveCustomer();
      } catch (error) {
        console.error('Error saving customer:', error);
        alert('Error: ' + error.message);
      }
    });
  } else {
    console.error('Save Customer button not found');
  }
  
  // Fix Save Product button
  const saveProductBtn = document.getElementById('save-product-btn');
  if (saveProductBtn) {
    console.log('Found Save Product button, adding event listener');
    // Remove any existing event listeners
    const newSaveProductBtn = saveProductBtn.cloneNode(true);
    saveProductBtn.parentNode.replaceChild(newSaveProductBtn, saveProductBtn);
    
    // Add new event listener
    newSaveProductBtn.addEventListener('click', function() {
      console.log('Save Product button clicked');
      try {
        saveProduct();
      } catch (error) {
        console.error('Error saving product:', error);
        alert('Error: ' + error.message);
      }
    });
  } else {
    console.error('Save Product button not found');
  }
  
  // Fix Save Sale button
  const saveSaleBtn = document.getElementById('save-sale-btn');
  if (saveSaleBtn) {
    console.log('Found Save Sale button, adding event listener');
    // Remove any existing event listeners
    const newSaveSaleBtn = saveSaleBtn.cloneNode(true);
    saveSaleBtn.parentNode.replaceChild(newSaveSaleBtn, saveSaleBtn);
    
    // Add new event listener
    newSaveSaleBtn.addEventListener('click', function() {
      console.log('Save Sale button clicked');
      try {
        saveSale();
      } catch (error) {
        console.error('Error saving sale:', error);
        alert('Error: ' + error.message);
      }
    });
  } else {
    console.error('Save Sale button not found');
  }
  
  // Fix Confirm Add Item button
  const confirmAddItemBtn = document.getElementById('confirm-add-item-btn');
  if (confirmAddItemBtn) {
    console.log('Found Confirm Add Item button, adding event listener');
    // Remove any existing event listeners
    const newConfirmAddItemBtn = confirmAddItemBtn.cloneNode(true);
    confirmAddItemBtn.parentNode.replaceChild(newConfirmAddItemBtn, confirmAddItemBtn);
    
    // Add new event listener
    newConfirmAddItemBtn.addEventListener('click', function() {
      console.log('Confirm Add Item button clicked');
      try {
        addItemToSale();
      } catch (error) {
        console.error('Error adding item to sale:', error);
        alert('Error: ' + error.message);
      }
    });
  } else {
    console.error('Confirm Add Item button not found');
  }
  
  console.log('All button handlers fixed');
}

// Simple implementation of openAddCustomerModal
function openAddCustomerModal() {
  console.log('Opening add customer modal');
  
  try {
    // Reset form
    const form = document.getElementById('add-customer-form');
    if (form) form.reset();
    
    // Show modal
    safeShowModal('add-customer-modal');
  } catch (error) {
    console.error('Error in openAddCustomerModal:', error);
    alert('Error: ' + error.message);
  }
}

// Simple implementation of openAddProductModal
function openAddProductModal() {
  console.log('Opening add product modal');
  
  try {
    // Reset form
    const form = document.getElementById('add-product-form');
    if (form) form.reset();
    
    // Load categories and units
    loadCategoriesForDropdown('category-select');
    loadUnitsForDropdown('unit-select');
    
    // Show modal
    safeShowModal('add-product-modal');
  } catch (error) {
    console.error('Error in openAddProductModal:', error);
    alert('Error: ' + error.message);
  }
}

// Simple implementation of saveCustomer
async function saveCustomer() {
  console.log('Saving customer');
  
  try {
    // Get form values
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const address = document.getElementById('customer-address').value;
    const email = document.getElementById('customer-email').value;
    const notes = document.getElementById('customer-notes').value;
    
    // Validate
    if (!name) {
      alert('Please enter a customer name');
      return;
    }
    
    // Create customer object
    const customer = {
      name,
      phone,
      address,
      email,
      notes
    };
    
    console.log('Customer data:', customer);
    
    // Save to database
    await ipcRenderer.invoke('save-customer', customer);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('add-customer-modal'));
    if (modal) modal.hide();
    
    // Reload customers data
    loadCustomersData();
    
    alert('Customer saved successfully');
  } catch (error) {
    console.error('Error saving customer:', error);
    alert('Error saving customer: ' + error.message);
  }
}

// Simple implementation of saveProduct
async function saveProduct() {
  console.log('Saving product');
  
  try {
    // Get form values
    const name = document.getElementById('product-name').value;
    const description = document.getElementById('product-description').value;
    const categoryId = document.getElementById('category-select').value;
    const unitId = document.getElementById('unit-select').value;
    const sku = document.getElementById('product-sku').value;
    const barcode = document.getElementById('product-barcode').value;
    const purchasePrice = document.getElementById('purchase-price').value;
    const sellingPrice = document.getElementById('selling-price').value;
    const currentStock = document.getElementById('current-stock').value;
    const minStock = document.getElementById('min-stock').value;
    
    // Validate
    if (!name) {
      alert('Please enter a product name');
      return;
    }
    
    if (!purchasePrice || !sellingPrice) {
      alert('Please enter purchase and selling prices');
      return;
    }
    
    // Create product object
    const product = {
      name,
      description,
      categoryId: categoryId || null,
      unitId: unitId || null,
      sku,
      barcode,
      purchasePrice: parseFloat(purchasePrice),
      sellingPrice: parseFloat(sellingPrice),
      currentStock: parseFloat(currentStock || 0),
      minStock: parseFloat(minStock || 0)
    };
    
    console.log('Product data:', product);
    
    // Save to database
    await ipcRenderer.invoke('save-product', product);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('add-product-modal'));
    if (modal) modal.hide();
    
    // Reload inventory data
    loadInventoryData();
    
    alert('Product saved successfully');
  } catch (error) {
    console.error('Error saving product:', error);
    alert('Error saving product: ' + error.message);
  }
}

// Simple implementation of addItemToSale
function addItemToSale() {
  console.log('Adding item to sale');
  
  try {
    // Get form values
    const productSelect = document.getElementById('product-select');
    const productId = productSelect.value;
    const productName = productSelect.options[productSelect.selectedIndex].text;
    const price = parseFloat(document.getElementById('product-price').value);
    const quantity = parseFloat(document.getElementById('product-quantity').value);
    const total = parseFloat(document.getElementById('item-total').value);
    
    // Validate
    if (!productId) {
      alert('Please select a product');
      return;
    }
    
    if (!quantity || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    // Add to table
    const tableBody = document.getElementById('sale-items-table').querySelector('tbody');
    
    // Remove empty row if it exists
    const emptyRow = document.getElementById('empty-row');
    if (emptyRow) {
      emptyRow.remove();
    }
    
    // Create new row
    const row = document.createElement('tr');
    row.dataset.productId = productId;
    row.dataset.price = price;
    row.dataset.quantity = quantity;
    row.dataset.total = total;
    
    // Create cells
    const productCell = document.createElement('td');
    productCell.textContent = productName;
    row.appendChild(productCell);
    
    const priceCell = document.createElement('td');
    priceCell.textContent = formatCurrency(price);
    row.appendChild(priceCell);
    
    const quantityCell = document.createElement('td');
    quantityCell.textContent = quantity;
    row.appendChild(quantityCell);
    
    const totalCell = document.createElement('td');
    totalCell.textContent = formatCurrency(total);
    row.appendChild(totalCell);
    
    const actionsCell = document.createElement('td');
    const removeButton = document.createElement('button');
    removeButton.className = 'btn btn-sm btn-danger';
    removeButton.innerHTML = '<i class="bi bi-trash"></i> Remove';
    removeButton.addEventListener('click', function() {
      row.remove();
      updateSaleTotals();
      
      // If no items left, add empty row
      if (tableBody.children.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.id = 'empty-row';
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 5;
        emptyCell.className = 'text-center';
        emptyCell.textContent = 'No items added';
        emptyRow.appendChild(emptyCell);
        tableBody.appendChild(emptyRow);
      }
    });
    actionsCell.appendChild(removeButton);
    row.appendChild(actionsCell);
    
    tableBody.appendChild(row);
    
    // Update totals
    updateSaleTotals();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('add-item-modal'));
    if (modal) modal.hide();
  } catch (error) {
    console.error('Error adding item to sale:', error);
    alert('Error adding item to sale: ' + error.message);
  }
}

// Call this function when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, fixing button handlers');
  setTimeout(fixAllButtonHandlers, 1000); // Delay to ensure all elements are loaded
});