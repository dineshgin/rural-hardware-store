const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./src/database/db');

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
  initDatabase()
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
ipcMain.handle('data-backup', async (event) => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Save Database Backup',
    defaultPath: path.join(app.getPath('documents'), 'hardware-store-backup.db'),
    filters: [{ name: 'Database Files', extensions: ['db'] }]
  });

  if (filePath) {
    try {
      const dbPath = path.join(app.getPath('userData'), 'database.db');
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