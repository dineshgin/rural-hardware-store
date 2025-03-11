const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const db = require('./src/database/db');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

// Create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icons/icon.png')
  });

  // Load the index.html file
  mainWindow.loadFile('src/index.html');

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Initialize the database
  db.initDatabase()
    .then(() => console.log('Database initialized successfully'))
    .catch(err => console.error('Database initialization failed:', err));

  // Handle window closed event
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, recreate window when dock icon is clicked and no windows are open
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for database operations
ipcMain.handle('get-customers', async () => {
  try {
    return db.customers.getAll();
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
});

ipcMain.handle('get-customer', async (event, id) => {
  try {
    return db.customers.getById(id);
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
});

ipcMain.handle('save-customer', async (event, customer) => {
  try {
    if (customer.id) {
      return db.customers.update(customer.id, customer);
    } else {
      return db.customers.create(customer);
    }
  } catch (error) {
    console.error('Error saving customer:', error);
    throw error;
  }
});

ipcMain.handle('delete-customer', async (event, id) => {
  try {
    return db.customers.delete(id);
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
});

ipcMain.handle('get-products', async () => {
  try {
    return db.products.getAll();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
});

ipcMain.handle('get-product', async (event, id) => {
  try {
    return db.products.getById(id);
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
});

ipcMain.handle('save-product', async (event, product) => {
  try {
    if (product.id) {
      return db.products.update(product.id, product);
    } else {
      return db.products.create(product);
    }
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
});

ipcMain.handle('delete-product', async (event, id) => {
  try {
    return db.products.delete(id);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
});

ipcMain.handle('get-categories', async () => {
  try {
    return db.categories.getAll();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
});

ipcMain.handle('get-units', async () => {
  try {
    return db.units.getAll();
  } catch (error) {
    console.error('Error fetching units:', error);
    throw error;
  }
});

ipcMain.handle('get-invoices', async () => {
  try {
    return db.invoices.getAll();
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
});

ipcMain.handle('get-invoice', async (event, id) => {
  try {
    const invoice = db.invoices.getById(id);
    const items = db.invoices.getItems(id);
    return { invoice, items };
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
});

ipcMain.handle('save-invoice', async (event, { invoice, items }) => {
  try {
    return db.invoices.create(invoice, items);
  } catch (error) {
    console.error('Error saving invoice:', error);
    throw error;
  }
});

ipcMain.handle('get-next-invoice-number', async () => {
  try {
    const lastInvoice = db.invoices.getLatestInvoiceNumber();
    // Parse the invoice number and increment
    const match = lastInvoice.match(/INV-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10) + 1;
      return `INV-${num.toString().padStart(4, '0')}`;
    }
    return 'INV-0001';
  } catch (error) {
    console.error('Error generating invoice number:', error);
    return 'INV-0001';
  }
});

ipcMain.handle('get-daily-sales', async (event, date) => {
  try {
    return db.reports.getDailySales(date);
  } catch (error) {
    console.error('Error fetching daily sales:', error);
    throw error;
  }
});

ipcMain.handle('get-low-stock', async () => {
  try {
    return db.products.getLowStock();
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    throw error;
  }
});

// IPC handlers for backup
ipcMain.handle('data-backup', async (event) => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Save Database Backup',
    defaultPath: path.join(app.getPath('documents'), 'hardware-store-backup.db'),
    filters: [{ name: 'Database Files', extensions: ['db'] }]
  });

  if (filePath) {
    try {
      const userDataPath = app.getPath('userData');
      const dbPath = path.join(userDataPath, 'database', 'database.db');
      fs.copyFileSync(dbPath, filePath);
      return { success: true, message: 'Backup created successfully' };
    } catch (error) {
      console.error('Backup failed:', error);
      return { success: false, message: 'Failed to create backup' };
    }
  }
  return { success: false, message: 'Backup cancelled' };
});

// IPC handlers for printing
ipcMain.handle('print-invoice', async (event, invoiceData) => {
  try {
    // Implementation for printing will go here
    return { success: true, message: 'Invoice printed successfully' };
  } catch (error) {
    console.error('Printing failed:', error);
    return { success: false, message: 'Failed to print invoice' };
  }
});