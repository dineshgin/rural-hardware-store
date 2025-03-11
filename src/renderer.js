// Renderer process - handles UI interactions
const { ipcRenderer } = require('electron');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Navigation handling
  const navButtons = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page-container');
  
  // Add click event to all navigation buttons
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Get the page to show
      const pageId = button.getAttribute('data-page');
      
      // Remove active class from all buttons and pages
      navButtons.forEach(btn => btn.classList.remove('active'));
      pages.forEach(page => page.classList.remove('active'));
      
      // Add active class to clicked button and corresponding page
      button.classList.add('active');
      document.getElementById(`${pageId}-page`).classList.add('active');
    });
  });
  
  // Quick action buttons
  const newSaleBtn = document.querySelector('.btn-primary');
  if (newSaleBtn) {
    newSaleBtn.addEventListener('click', () => {
      // Show sales page
      navButtons.forEach(btn => btn.classList.remove('active'));
      pages.forEach(page => page.classList.remove('active'));
      
      const salesBtn = document.querySelector('[data-page="sales"]');
      salesBtn.classList.add('active');
      document.getElementById('sales-page').classList.add('active');
      
      // Additional logic for new sale can be added here
    });
  }
  
  const addProductBtn = document.querySelector('.btn-success');
  if (addProductBtn) {
    addProductBtn.addEventListener('click', () => {
      // Show inventory page
      navButtons.forEach(btn => btn.classList.remove('active'));
      pages.forEach(page => page.classList.remove('active'));
      
      const inventoryBtn = document.querySelector('[data-page="inventory"]');
      inventoryBtn.classList.add('active');
      document.getElementById('inventory-page').classList.add('active');
      
      // Additional logic for adding product can be added here
    });
  }
  
  const addCustomerBtn = document.querySelector('.btn-info');
  if (addCustomerBtn) {
    addCustomerBtn.addEventListener('click', () => {
      // Show customers page
      navButtons.forEach(btn => btn.classList.remove('active'));
      pages.forEach(page => page.classList.remove('active'));
      
      const customersBtn = document.querySelector('[data-page="customers"]');
      customersBtn.classList.add('active');
      document.getElementById('customers-page').classList.add('active');
      
      // Additional logic for adding customer can be added here
    });
  }
  
  const generateReportBtn = document.querySelector('.btn-warning');
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', () => {
      // Show reports page
      navButtons.forEach(btn => btn.classList.remove('active'));
      pages.forEach(page => page.classList.remove('active'));
      
      const reportsBtn = document.querySelector('[data-page="reports"]');
      reportsBtn.classList.add('active');
      document.getElementById('reports-page').classList.add('active');
      
      // Additional logic for generating report can be added here
    });
  }
  
  // Initialize dashboard data
  initializeDashboard();
});

// Function to initialize dashboard with data
async function initializeDashboard() {
  try {
    // Show loading state
    const dashboardCards = document.querySelectorAll('.card-title');
    dashboardCards.forEach(card => {
      card.innerHTML = '<small>Loading...</small>';
    });
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch real data from the database
    const [dailySales, products, lowStock, invoices] = await Promise.all([
      ipcRenderer.invoke('get-daily-sales', today),
      ipcRenderer.invoke('get-products'),
      ipcRenderer.invoke('get-low-stock'),
      ipcRenderer.invoke('get-invoices')
    ]);
    
    // Calculate pending payments
    const pendingInvoices = invoices.filter(inv => inv.payment_status !== 'Paid');
    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.final_amount, 0);
    
    // Update dashboard with real data
    updateDashboardData({
      todaySales: dailySales?.total || 0,
      transactionCount: dailySales?.count || 0,
      productCount: products.length,
      lowStockCount: lowStock.length,
      pendingAmount: pendingAmount,
      pendingInvoices: pendingInvoices.length
    });
    
    // Update recent sales table
    updateRecentSales(invoices.slice(0, 5));
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    
    // Update with mock data if there's an error
    updateDashboardData({
      todaySales: 12500,
      transactionCount: 8,
      productCount: 156,
      lowStockCount: 12,
      pendingAmount: 8750,
      pendingInvoices: 3
    });
  }
}

// Update dashboard with data
function updateDashboardData(data) {
  // Format currency for Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Update cards with data
  const cards = document.querySelectorAll('.card');
  
  // Today's sales
  cards[0].querySelector('.card-title').textContent = formatCurrency(data.todaySales);
  cards[0].querySelector('.card-text').textContent = `${data.transactionCount} transactions`;
  
  // Total products
  cards[1].querySelector('.card-title').textContent = data.productCount;
  cards[1].querySelector('.card-text').textContent = 'In inventory';
  
  // Low stock
  cards[2].querySelector('.card-title').textContent = data.lowStockCount;
  cards[2].querySelector('.card-text').textContent = 'Items below minimum';
  
  // Pending payments
  cards[3].querySelector('.card-title').textContent = formatCurrency(data.pendingAmount);
  cards[3].querySelector('.card-text').textContent = `${data.pendingInvoices} invoices`;
}

// Update recent sales table
function updateRecentSales(invoices) {
  const tableBody = document.querySelector('.table tbody');
  if (!tableBody) return;
  
  // Format currency for Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };
  
  // Clear existing rows
  tableBody.innerHTML = '';
  
  // If no invoices, show message
  if (!invoices || invoices.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No recent sales</td></tr>';
    return;
  }
  
  // Add invoice rows
  invoices.forEach(invoice => {
    const row = document.createElement('tr');
    
    // Create status indicator
    let statusClass = '';
    switch (invoice.payment_status) {
      case 'Paid':
        statusClass = 'status-paid';
        break;
      case 'Partial':
        statusClass = 'status-partial';
        break;
      case 'Unpaid':
        statusClass = 'status-unpaid';
        break;
    }
    
    row.innerHTML = `
      <td>${invoice.invoice_number}</td>
      <td>${invoice.customer_name || 'Walk-in Customer'}</td>
      <td>${formatDate(invoice.date)}</td>
      <td>${formatCurrency(invoice.final_amount)}</td>
      <td>
        <span class="status-indicator ${statusClass}"></span>
        ${invoice.payment_status}
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

// Database operations through IPC
// Customer operations
async function fetchCustomers() {
  try {
    return await ipcRenderer.invoke('get-customers');
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

async function saveCustomer(customerData) {
  try {
    return await ipcRenderer.invoke('save-customer', customerData);
  } catch (error) {
    console.error('Error saving customer:', error);
    throw error;
  }
}

// Product operations
async function fetchProducts() {
  try {
    return await ipcRenderer.invoke('get-products');
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function saveProduct(productData) {
  try {
    return await ipcRenderer.invoke('save-product', productData);
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
}

// Invoice operations
async function createInvoice(invoiceData, items) {
  try {
    return await ipcRenderer.invoke('save-invoice', { invoice: invoiceData, items });
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

async function getNextInvoiceNumber() {
  try {
    return await ipcRenderer.invoke('get-next-invoice-number');
  } catch (error) {
    console.error('Error getting next invoice number:', error);
    return 'INV-0001';
  }
}

// Backup operations
async function createBackup() {
  try {
    return await ipcRenderer.invoke('data-backup');
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
}