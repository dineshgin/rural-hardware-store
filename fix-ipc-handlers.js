// IPC handlers for main.js
// Add these to your main.js file if they're missing

// Import required modules
const { ipcMain } = require('electron');
const db = require('./src/database/db');

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

ipcMain.handle('create-invoice', async (event, invoiceData, items) => {
  try {
    console.log('IPC: Creating new invoice');
    const result = await db.createInvoice(invoiceData, items);
    return result;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
});

ipcMain.handle('delete-invoice', async (event, invoiceId) => {
  try {
    console.log(`IPC: Deleting invoice ${invoiceId}`);
    await db.deleteInvoice(invoiceId);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting invoice ${invoiceId}:`, error);
    throw error;
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
    return nextNumber;
  } catch (error) {
    console.error('Error getting next invoice number:', error);
    // Generate a fallback invoice number based on timestamp
    return `INV-${Date.now()}`;
  }
});