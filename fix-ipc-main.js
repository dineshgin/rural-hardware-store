// IPC handlers for main.js
// These handlers are essential for the application to work correctly

// Import required modules
const { ipcMain } = require('electron');
const db = require('./src/database/db');

// Set up IPC handlers for customers
ipcMain.handle('get-customers', async () => {
  try {
    console.log('IPC: Getting all customers');
    const customers = await db.getAllCustomers();
    console.log(`Retrieved ${customers ? customers.length : 0} customers`);
    return customers || [];
  } catch (error) {
    console.error('Error getting customers:', error);
    return [];
  }
});

// Set up IPC handlers for products
ipcMain.handle('get-products', async () => {
  try {
    console.log('IPC: Getting all products');
    const products = await db.getAllProducts();
    console.log(`Retrieved ${products ? products.length : 0} products`);
    return products || [];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
});

// Set up IPC handlers for categories
ipcMain.handle('get-categories', async () => {
  try {
    console.log('IPC: Getting all categories');
    const categories = await db.getAllCategories();
    console.log(`Retrieved ${categories ? categories.length : 0} categories`);
    return categories || [];
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
});

// Set up IPC handlers for units
ipcMain.handle('get-units', async () => {
  try {
    console.log('IPC: Getting all units');
    const units = await db.getAllUnits();
    console.log(`Retrieved ${units ? units.length : 0} units`);
    return units || [];
  } catch (error) {
    console.error('Error getting units:', error);
    return [];
  }
});

// Set up IPC handlers for invoices
ipcMain.handle('get-invoices', async () => {
  try {
    console.log('IPC: Getting all invoices');
    const invoices = await db.getAllInvoices();
    console.log(`Retrieved ${invoices ? invoices.length : 0} invoices`);
    return invoices || [];
  } catch (error) {
    console.error('Error getting invoices:', error);
    return [];
  }
});

ipcMain.handle('get-invoice', async (event, invoiceId) => {
  try {
    console.log(`IPC: Getting invoice ${invoiceId}`);
    const invoice = await db.getInvoiceById(invoiceId);
    return invoice || null;
  } catch (error) {
    console.error(`Error getting invoice ${invoiceId}:`, error);
    return null;
  }
});

ipcMain.handle('get-invoice-items', async (event, invoiceId) => {
  try {
    console.log(`IPC: Getting items for invoice ${invoiceId}`);
    const items = await db.getInvoiceItems(invoiceId);
    return items || [];
  } catch (error) {
    console.error(`Error getting items for invoice ${invoiceId}:`, error);
    return [];
  }
});

// Set up IPC handlers for dashboard data
ipcMain.handle('get-dashboard-data', async () => {
  try {
    console.log('IPC: Getting dashboard data');
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's sales
    const todaySales = await db.getTodaySales();
    
    // Get total products
    const totalProducts = await db.getTotalProducts();
    
    // Get low stock items
    const lowStockItems = await db.getLowStockItems();
    
    // Get pending payments
    const pendingPayments = await db.getPendingPayments();
    
    // Get recent sales (last 5)
    const recentSales = await db.getRecentSales(5);
    
    return {
      todaySales: todaySales.total || 0,
      todayTransactions: todaySales.count || 0,
      totalProducts: totalProducts || 0,
      lowStockItems: lowStockItems || 0,
      pendingPayments: pendingPayments.total || 0,
      pendingInvoices: pendingPayments.count || 0,
      recentSales: recentSales || []
    };
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    return {
      todaySales: 0,
      todayTransactions: 0,
      totalProducts: 0,
      lowStockItems: 0,
      pendingPayments: 0,
      pendingInvoices: 0,
      recentSales: []
    };
  }
});

// Set up IPC handlers for invoice number
ipcMain.handle('get-next-invoice-number', async () => {
  try {
    console.log('IPC: Getting next invoice number');
    const nextNumber = await db.getNextInvoiceNumber();
    console.log('Next invoice number:', nextNumber);
    
    // Ensure we return a string
    if (typeof nextNumber === 'string') {
      return nextNumber;
    } else if (typeof nextNumber === 'number') {
      return `INV-${String(nextNumber).padStart(4, '0')}`;
    } else if (nextNumber && typeof nextNumber === 'object') {
      if (nextNumber.number) return nextNumber.number;
      if (nextNumber.invoiceNumber) return nextNumber.invoiceNumber;
      if (nextNumber.id) return `INV-${String(nextNumber.id).padStart(4, '0')}`;
    }
    
    // Fallback
    return `INV-${String(Date.now()).slice(-4).padStart(4, '0')}`;
  } catch (error) {
    console.error('Error getting next invoice number:', error);
    // Generate a fallback invoice number based on timestamp
    return `INV-${String(Date.now()).slice(-4).padStart(4, '0')}`;
  }
});