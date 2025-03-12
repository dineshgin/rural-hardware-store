// Script to fix remaining issues with the Rural Hardware Store app
// This script focuses on:
// 1. Fixing the customer dropdown
// 2. Fixing the "Add Item" button
// 3. Fixing the "New Sale" button on the dashboard

// Fix for fetchCustomers function - ensures it returns an array
async function fetchCustomers() {
  console.log('Fetching customers...');
  try {
    // Call the IPC handler to get customers
    const result = await ipcRenderer.invoke('get-customers');
    console.log('Raw customers result:', result);
    
    // Ensure we return an array
    if (Array.isArray(result)) {
      return result;
    } else if (result && Array.isArray(result.data)) {
      return result.data;
    } else if (result && typeof result === 'object') {
      // Try to convert object to array
      const customers = Object.values(result);
      if (Array.isArray(customers) && customers.length > 0) {
        return customers;
      }
    }
    
    // If all else fails, return an empty array
    console.warn('Could not get customers, returning empty array');
    return [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

// Fix for fetchProducts function - ensures it returns an array
async function fetchProducts() {
  console.log('Fetching products...');
  try {
    // Call the IPC handler to get products
    const result = await ipcRenderer.invoke('get-products');
    console.log('Raw products result:', result);
    
    // Ensure we return an array
    if (Array.isArray(result)) {
      return result;
    } else if (result && Array.isArray(result.data)) {
      return result.data;
    } else if (result && typeof result === 'object') {
      // Try to convert object to array
      const products = Object.values(result);
      if (Array.isArray(products) && products.length > 0) {
        return products;
      }
    }
    
    // If all else fails, return an empty array
    console.warn('Could not get products, returning empty array');
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Fix for setupQuickActionButtons function - ensures "New Sale" button works
function setupQuickActionButtons() {
  console.log('Setting up quick action buttons');
  
  // Get all quick action buttons
  const quickActionButtons = document.querySelectorAll('#dashboard-page .card:nth-of-type(2) .card-body .btn');
  console.log(`Found ${quickActionButtons.length} quick action buttons`);
  
  quickActionButtons.forEach(button => {
    // Remove any existing event listeners
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    // Add new event listener
    newButton.addEventListener('click', () => {
      const buttonText = newButton.textContent.trim();
      console.log(`Quick action button clicked: ${buttonText}`);
      
      switch (buttonText) {
        case 'New Sale':
          console.log('Navigating to sales page and opening new sale modal');
          showPage('sales');
          loadPageData('sales');
          // Use setTimeout to ensure the page is loaded before opening the modal
          setTimeout(() => {
            console.log('Opening new sale modal from quick action');
            openNewSaleModal();
          }, 500);
          break;
        case 'Add Product':
          console.log('Navigating to inventory page and opening add product modal');
          showPage('inventory');
          loadPageData('inventory');
          setTimeout(() => {
            openAddProductModal();
          }, 500);
          break;
        case 'Add Customer':
          console.log('Navigating to customers page and opening add customer modal');
          showPage('customers');
          loadPageData('customers');
          setTimeout(() => {
            openAddCustomerModal();
          }, 500);
          break;
        case 'Generate Report':
          console.log('Navigating to reports page');
          showPage('reports');
          loadPageData('reports');
          break;
        default:
          console.warn(`Unknown quick action button: ${buttonText}`);
      }
    });
  });
}

// Fix for openAddItemModal function - ensures it works properly
async function openAddItemModal() {
  console.log('Opening add item modal');
  
  try {
    // Reset form fields
    const productSelect = document.getElementById('product-select');
    if (productSelect) {
      productSelect.innerHTML = '<option value="">Select Product</option>';
    } else {
      console.error('Product select element not found');
    }
    
    const productPrice = document.getElementById('product-price');
    if (productPrice) productPrice.value = '';
    
    const productQuantity = document.getElementById('product-quantity');
    if (productQuantity) productQuantity.value = 1;
    
    const itemTotal = document.getElementById('item-total');
    if (itemTotal) itemTotal.value = '';
    
    // Load products
    const products = await fetchProducts();
    console.log(`Fetched ${products.length} products for dropdown`);
    
    if (productSelect && products.length > 0) {
      products.forEach(product => {
        if (product && typeof product === 'object') {
          const option = document.createElement('option');
          option.value = product.id;
          option.textContent = product.name || 'Unknown Product';
          option.dataset.price = product.sellingPrice || 0;
          productSelect.appendChild(option);
        }
      });
      
      // Add event listeners
      productSelect.addEventListener('change', updateProductPrice);
      
      if (productQuantity) {
        productQuantity.addEventListener('input', updateItemTotal);
      }
    }
    
    // Show the modal
    const modal = document.getElementById('add-item-modal');
    if (modal) {
      console.log('Showing add item modal');
      safeShowModal('add-item-modal');
    } else {
      console.error('Add item modal element not found');
    }
  } catch (error) {
    console.error('Error opening add item modal:', error);
    alert('Error opening add item modal: ' + error.message);
  }
}

// Fix for updateProductPrice function
function updateProductPrice() {
  console.log('Updating product price');
  
  const productSelect = document.getElementById('product-select');
  const productPrice = document.getElementById('product-price');
  const productQuantity = document.getElementById('product-quantity');
  const itemTotal = document.getElementById('item-total');
  
  if (!productSelect || !productPrice) {
    console.error('Product select or price element not found');
    return;
  }
  
  const selectedOption = productSelect.options[productSelect.selectedIndex];
  
  if (selectedOption && selectedOption.value) {
    const price = parseFloat(selectedOption.dataset.price) || 0;
    productPrice.value = price.toFixed(2);
    console.log(`Selected product price: ${price}`);
    
    // Update total if quantity is available
    if (productQuantity && itemTotal) {
      const quantity = parseFloat(productQuantity.value) || 0;
      const total = price * quantity;
      itemTotal.value = total.toFixed(2);
      console.log(`Updated item total: ${total}`);
    }
  } else {
    productPrice.value = '';
    if (itemTotal) itemTotal.value = '';
  }
}

// Fix for updateItemTotal function
function updateItemTotal() {
  console.log('Updating item total');
  
  const productPrice = document.getElementById('product-price');
  const productQuantity = document.getElementById('product-quantity');
  const itemTotal = document.getElementById('item-total');
  
  if (!productPrice || !productQuantity || !itemTotal) {
    console.error('One or more elements not found for updateItemTotal');
    return;
  }
  
  const price = parseFloat(productPrice.value) || 0;
  const quantity = parseFloat(productQuantity.value) || 0;
  const total = price * quantity;
  
  itemTotal.value = total.toFixed(2);
  console.log(`Updated item total: ${total}`);
}