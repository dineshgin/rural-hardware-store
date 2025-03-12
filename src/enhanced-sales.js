// Enhanced Sales Functionality
// This script adds support for different units of measurement and quick product creation

// Function to initialize the enhanced sales functionality
function initEnhancedSales() {
  console.log('Initializing enhanced sales functionality');
  
  // Set up event listeners for the quick add product button
  const quickAddProductBtn = document.getElementById('quick-add-product-btn');
  if (quickAddProductBtn) {
    quickAddProductBtn.addEventListener('click', function() {
      console.log('Quick add product button clicked');
      toggleQuickAddProductForm();
    });
  }
  
  // Set up event listener for the save quick product button
  const saveQuickProductBtn = document.getElementById('save-quick-product-btn');
  if (saveQuickProductBtn) {
    saveQuickProductBtn.addEventListener('click', function() {
      console.log('Save quick product button clicked');
      saveQuickProduct();
    });
  }
  
  // Set up event listener for the quick add customer button
  const quickAddCustomerBtn = document.getElementById('quick-add-customer-btn');
  if (quickAddCustomerBtn) {
    quickAddCustomerBtn.addEventListener('click', function() {
      console.log('Quick add customer button clicked');
      openQuickAddCustomerModal();
    });
  }
  
  // Set up event listener for the save quick customer button
  const saveQuickCustomerBtn = document.getElementById('save-quick-customer-btn');
  if (saveQuickCustomerBtn) {
    saveQuickCustomerBtn.addEventListener('click', function() {
      console.log('Save quick customer button clicked');
      saveQuickCustomer();
    });
  }
  
  // Set up event listener for the product select dropdown
  const productSelect = document.getElementById('product-select');
  if (productSelect) {
    productSelect.addEventListener('change', function() {
      console.log('Product selected:', this.value);
      loadProductDetails(this.value);
    });
  }
  
  // Set up event listeners for price and quantity inputs to calculate total
  const priceInput = document.getElementById('product-price');
  const quantityInput = document.getElementById('product-quantity');
  
  if (priceInput && quantityInput) {
    const updateTotal = function() {
      const price = parseFloat(priceInput.value) || 0;
      const quantity = parseFloat(quantityInput.value) || 0;
      const total = price * quantity;
      
      const totalInput = document.getElementById('item-total');
      if (totalInput) {
        totalInput.value = total.toFixed(2);
      }
    };
    
    priceInput.addEventListener('input', updateTotal);
    quantityInput.addEventListener('input', updateTotal);
  }
  
  // Set up barcode search functionality
  const barcodeInput = document.getElementById('barcode-input');
  const searchBarcodeBtn = document.getElementById('search-barcode-btn');
  
  if (barcodeInput && searchBarcodeBtn) {
    // Auto-search when Enter key is pressed
    barcodeInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        searchProductByBarcode(this.value);
      }
    });
    
    // Search when button is clicked
    searchBarcodeBtn.addEventListener('click', function() {
      searchProductByBarcode(barcodeInput.value);
    });
  }
  
  console.log('Enhanced sales functionality initialized');
}

// Function to toggle the quick add product form
function toggleQuickAddProductForm() {
  const quickAddProductForm = document.getElementById('quick-add-product-form');
  if (quickAddProductForm) {
    const isVisible = quickAddProductForm.style.display !== 'none';
    quickAddProductForm.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
      // Load categories and units for the dropdowns
      loadCategoriesForDropdown('quick-category-select');
      loadUnitsForDropdown('quick-unit-select');
      
      // If there's a barcode in the barcode input, copy it to the quick barcode input
      const barcodeInput = document.getElementById('barcode-input');
      const quickBarcodeInput = document.getElementById('quick-barcode');
      if (barcodeInput && quickBarcodeInput && barcodeInput.value) {
        quickBarcodeInput.value = barcodeInput.value;
      }
    }
  }
}

// Function to save a quick product
async function saveQuickProduct() {
  console.log('Saving quick product');
  
  try {
    // Get form values
    const name = document.getElementById('quick-product-name').value;
    const categoryId = document.getElementById('quick-category-select').value;
    const unitId = document.getElementById('quick-unit-select').value;
    const purchasePrice = document.getElementById('quick-purchase-price').value;
    const sellingPrice = document.getElementById('quick-selling-price').value;
    const currentStock = document.getElementById('quick-current-stock').value;
    const barcode = document.getElementById('quick-barcode').value;
    
    // Validate
    if (!name) {
      alert('Please enter a product name');
      return;
    }
    
    if (!unitId) {
      alert('Please select a unit');
      return;
    }
    
    if (!purchasePrice || !sellingPrice) {
      alert('Please enter purchase and selling prices');
      return;
    }
    
    // Create product object
    const product = {
      name,
      description: '',
      categoryId: categoryId || null,
      unitId,
      sku: '',
      barcode,
      purchasePrice: parseFloat(purchasePrice),
      sellingPrice: parseFloat(sellingPrice),
      currentStock: parseFloat(currentStock || 0),
      minStock: 0
    };
    
    console.log('Quick product data:', product);
    
    // Save to database
    const result = await ipcRenderer.invoke('save-product', product);
    
    if (result.success) {
      // Hide the quick add form
      const quickAddProductForm = document.getElementById('quick-add-product-form');
      if (quickAddProductForm) {
        quickAddProductForm.style.display = 'none';
      }
      
      // Reload the product dropdown and select the new product
      await loadProductsForDropdown('product-select', result.id);
      
      // Load the product details
      loadProductDetails(result.id);
      
      alert('Product saved successfully');
    } else {
      throw new Error(result.error || 'Failed to save product');
    }
  } catch (error) {
    console.error('Error saving quick product:', error);
    alert('Error saving product: ' + error.message);
  }
}

// Function to open the quick add customer modal
function openQuickAddCustomerModal() {
  console.log('Opening quick add customer modal');
  
  try {
    // Reset form
    const form = document.getElementById('quick-add-customer-modal').querySelector('form');
    if (form) form.reset();
    
    // Show modal
    safeShowModal('quick-add-customer-modal');
  } catch (error) {
    console.error('Error opening quick add customer modal:', error);
    alert('Error: ' + error.message);
  }
}

// Function to save a quick customer
async function saveQuickCustomer() {
  console.log('Saving quick customer');
  
  try {
    // Get form values
    const name = document.getElementById('quick-customer-name').value;
    const phone = document.getElementById('quick-customer-phone').value;
    const address = document.getElementById('quick-customer-address').value;
    
    // Validate
    if (!name) {
      alert('Please enter a customer name');
      return;
    }
    
    // Create customer object
    const customer = {
      name,
      phone: phone || '',
      address: address || '',
      email: '',
      notes: ''
    };
    
    console.log('Quick customer data:', customer);
    
    // Save to database
    const result = await ipcRenderer.invoke('save-customer', customer);
    
    if (result.success) {
      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('quick-add-customer-modal'));
      if (modal) modal.hide();
      
      // Reload the customer dropdown and select the new customer
      await loadCustomersForDropdown('customer-select', result.id);
      
      alert('Customer saved successfully');
    } else {
      throw new Error(result.error || 'Failed to save customer');
    }
  } catch (error) {
    console.error('Error saving quick customer:', error);
    alert('Error saving customer: ' + error.message);
  }
}

// Function to load product details when a product is selected
async function loadProductDetails(productId) {
  console.log('Loading product details for ID:', productId);
  
  if (!productId) {
    // Clear the price and unit fields
    const priceInput = document.getElementById('product-price');
    const quantityUnitSpan = document.getElementById('quantity-unit');
    
    if (priceInput) priceInput.value = '';
    if (quantityUnitSpan) quantityUnitSpan.textContent = 'pcs';
    
    return;
  }
  
  try {
    // Get product details from the database
    const product = await ipcRenderer.invoke('get-product', productId);
    
    if (product) {
      console.log('Product details:', product);
      
      // Set the price
      const priceInput = document.getElementById('product-price');
      if (priceInput) {
        priceInput.value = product.sellingPrice.toFixed(2);
      }
      
      // Set the unit label
      const quantityUnitSpan = document.getElementById('quantity-unit');
      if (quantityUnitSpan && product.unit) {
        quantityUnitSpan.textContent = product.unit.name || 'pcs';
      }
      
      // Update the total
      const quantityInput = document.getElementById('product-quantity');
      if (quantityInput && priceInput) {
        const price = parseFloat(priceInput.value) || 0;
        const quantity = parseFloat(quantityInput.value) || 0;
        const total = price * quantity;
        
        const totalInput = document.getElementById('item-total');
        if (totalInput) {
          totalInput.value = total.toFixed(2);
        }
      }
    } else {
      console.error('Product not found');
    }
  } catch (error) {
    console.error('Error loading product details:', error);
  }
}

// Function to search for a product by barcode
async function searchProductByBarcode(barcode) {
  console.log('Searching for product with barcode:', barcode);
  
  if (!barcode) {
    alert('Please enter a barcode');
    return;
  }
  
  try {
    // Search for the product in the database
    const product = await ipcRenderer.invoke('get-product-by-barcode', barcode);
    
    if (product) {
      console.log('Product found:', product);
      
      // Select the product in the dropdown
      const productSelect = document.getElementById('product-select');
      if (productSelect) {
        productSelect.value = product.id;
        
        // Trigger the change event to load product details
        const event = new Event('change');
        productSelect.dispatchEvent(event);
      }
    } else {
      console.log('Product not found with barcode:', barcode);
      
      // Ask if the user wants to create a new product
      if (confirm('Product not found. Would you like to create a new product with this barcode?')) {
        // Show the quick add product form
        toggleQuickAddProductForm();
        
        // Set the barcode in the quick add form
        const quickBarcodeInput = document.getElementById('quick-barcode');
        if (quickBarcodeInput) {
          quickBarcodeInput.value = barcode;
        }
      }
    }
  } catch (error) {
    console.error('Error searching for product by barcode:', error);
    alert('Error: ' + error.message);
  }
}

// Function to load products for a dropdown
async function loadProductsForDropdown(selectId, selectedProductId) {
  console.log('Loading products for dropdown:', selectId);
  
  const select = document.getElementById(selectId);
  if (!select) {
    console.error('Select element not found:', selectId);
    return;
  }
  
  try {
    // Get products from the database
    const products = await ipcRenderer.invoke('get-products');
    
    // Clear existing options except the first one
    while (select.options.length > 1) {
      select.remove(1);
    }
    
    // Add products to the dropdown
    if (products && products.length > 0) {
      products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.name;
        select.appendChild(option);
      });
      
      // Select the specified product if provided
      if (selectedProductId) {
        select.value = selectedProductId;
      }
    } else {
      console.log('No products found');
    }
  } catch (error) {
    console.error('Error loading products for dropdown:', error);
  }
}

// Function to load customers for a dropdown
async function loadCustomersForDropdown(selectId, selectedCustomerId) {
  console.log('Loading customers for dropdown:', selectId);
  
  const select = document.getElementById(selectId);
  if (!select) {
    console.error('Select element not found:', selectId);
    return;
  }
  
  try {
    // Get customers from the database
    const customers = await ipcRenderer.invoke('get-customers');
    
    // Clear existing options except the first one
    while (select.options.length > 1) {
      select.remove(1);
    }
    
    // Add customers to the dropdown
    if (customers && customers.length > 0) {
      customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        select.appendChild(option);
      });
      
      // Select the specified customer if provided
      if (selectedCustomerId) {
        select.value = selectedCustomerId;
      }
    } else {
      console.log('No customers found');
    }
  } catch (error) {
    console.error('Error loading customers for dropdown:', error);
  }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing enhanced sales');
  setTimeout(initEnhancedSales, 1500); // Delay to ensure all elements are loaded
});