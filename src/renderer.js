// Renderer process - handles UI interactions

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
    // In a real app, this would fetch data from the database
    // For now, we'll just simulate loading
    
    // Show loading state
    const dashboardCards = document.querySelectorAll('.card-title');
    dashboardCards.forEach(card => {
      card.innerHTML = '<small>Loading...</small>';
    });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update with mock data
    updateDashboardData({
      todaySales: 12500,
      transactionCount: 8,
      productCount: 156,
      lowStockCount: 12,
      pendingAmount: 8750,
      pendingInvoices: 3
    });
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
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

// IPC communication with main process
// This would be used to communicate with the database
// For example:
/*
const { ipcRenderer } = require('electron');

// Request data from main process
async function fetchCustomers() {
  try {
    const customers = await ipcRenderer.invoke('fetch-customers');
    return customers;
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

// Send data to main process
async function saveCustomer(customerData) {
  try {
    const result = await ipcRenderer.invoke('save-customer', customerData);
    return result;
  } catch (error) {
    console.error('Error saving customer:', error);
    throw error;
  }
}
*/