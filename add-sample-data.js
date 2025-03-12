// Script to add sample data to the database
// Run this with: node add-sample-data.js

const path = require('path');
const Database = require('better-sqlite3');

// Path to the database file
const dbPath = path.join(__dirname, 'database.sqlite');
console.log(`Opening database at: ${dbPath}`);

// Connect to the database
const db = new Database(dbPath, { verbose: console.log });

// Create tables if they don't exist
function createTables() {
  console.log('Creating tables if they don\'t exist...');
  
  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    )
  `);
  
  // Units table
  db.exec(`
    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      abbreviation TEXT
    )
  `);
  
  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      categoryId INTEGER,
      unitId INTEGER,
      sku TEXT,
      barcode TEXT,
      purchasePrice REAL NOT NULL,
      sellingPrice REAL NOT NULL,
      currentStock REAL DEFAULT 0,
      minStock REAL DEFAULT 0,
      FOREIGN KEY (categoryId) REFERENCES categories (id),
      FOREIGN KEY (unitId) REFERENCES units (id)
    )
  `);
  
  // Customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      email TEXT,
      notes TEXT
    )
  `);
  
  // Invoices table
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoiceNumber TEXT NOT NULL,
      date TEXT NOT NULL,
      customerId INTEGER,
      subtotal REAL NOT NULL,
      discountRate REAL DEFAULT 0,
      discountAmount REAL DEFAULT 0,
      taxRate REAL DEFAULT 0,
      taxAmount REAL DEFAULT 0,
      totalAmount REAL NOT NULL,
      paymentMethod TEXT,
      paymentStatus TEXT DEFAULT 'Paid',
      notes TEXT,
      FOREIGN KEY (customerId) REFERENCES customers (id)
    )
  `);
  
  // Invoice items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoiceId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      quantity REAL NOT NULL,
      price REAL NOT NULL,
      total REAL NOT NULL,
      FOREIGN KEY (invoiceId) REFERENCES invoices (id),
      FOREIGN KEY (productId) REFERENCES products (id)
    )
  `);
  
  console.log('Tables created successfully');
}

// Add sample categories
function addSampleCategories() {
  console.log('Adding sample categories...');
  
  const categories = [
    { name: 'Hardware', description: 'General hardware items' },
    { name: 'Tools', description: 'Hand and power tools' },
    { name: 'Plumbing', description: 'Plumbing supplies' },
    { name: 'Electrical', description: 'Electrical supplies' },
    { name: 'Paint', description: 'Paint and painting supplies' }
  ];
  
  const stmt = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
  
  categories.forEach(category => {
    try {
      stmt.run(category.name, category.description);
    } catch (error) {
      console.error(`Error adding category ${category.name}:`, error.message);
    }
  });
  
  console.log('Sample categories added');
}

// Add sample units
function addSampleUnits() {
  console.log('Adding sample units...');
  
  const units = [
    { name: 'Piece', abbreviation: 'pc' },
    { name: 'Kilogram', abbreviation: 'kg' },
    { name: 'Meter', abbreviation: 'm' },
    { name: 'Liter', abbreviation: 'L' },
    { name: 'Box', abbreviation: 'box' }
  ];
  
  const stmt = db.prepare('INSERT INTO units (name, abbreviation) VALUES (?, ?)');
  
  units.forEach(unit => {
    try {
      stmt.run(unit.name, unit.abbreviation);
    } catch (error) {
      console.error(`Error adding unit ${unit.name}:`, error.message);
    }
  });
  
  console.log('Sample units added');
}

// Add sample products
function addSampleProducts() {
  console.log('Adding sample products...');
  
  const products = [
    {
      name: 'Hammer',
      description: 'Standard claw hammer',
      categoryId: 2, // Tools
      unitId: 1, // Piece
      sku: 'TL-001',
      barcode: '1000000001',
      purchasePrice: 150,
      sellingPrice: 250,
      currentStock: 20,
      minStock: 5
    },
    {
      name: 'Screwdriver Set',
      description: '6-piece screwdriver set',
      categoryId: 2, // Tools
      unitId: 5, // Box
      sku: 'TL-002',
      barcode: '1000000002',
      purchasePrice: 200,
      sellingPrice: 350,
      currentStock: 15,
      minStock: 3
    },
    {
      name: 'PVC Pipe (1 inch)',
      description: '1-inch diameter PVC pipe',
      categoryId: 3, // Plumbing
      unitId: 3, // Meter
      sku: 'PL-001',
      barcode: '1000000003',
      purchasePrice: 30,
      sellingPrice: 50,
      currentStock: 100,
      minStock: 20
    },
    {
      name: 'Light Bulb (LED)',
      description: '9W LED light bulb',
      categoryId: 4, // Electrical
      unitId: 1, // Piece
      sku: 'EL-001',
      barcode: '1000000004',
      purchasePrice: 60,
      sellingPrice: 100,
      currentStock: 50,
      minStock: 10
    },
    {
      name: 'Wall Paint (White)',
      description: 'Interior wall paint, white color',
      categoryId: 5, // Paint
      unitId: 4, // Liter
      sku: 'PT-001',
      barcode: '1000000005',
      purchasePrice: 120,
      sellingPrice: 200,
      currentStock: 30,
      minStock: 5
    },
    {
      name: 'Nails (3 inch)',
      description: '3-inch common nails',
      categoryId: 1, // Hardware
      unitId: 2, // Kilogram
      sku: 'HW-001',
      barcode: '1000000006',
      purchasePrice: 80,
      sellingPrice: 120,
      currentStock: 25,
      minStock: 5
    }
  ];
  
  const stmt = db.prepare(`
    INSERT INTO products 
    (name, description, categoryId, unitId, sku, barcode, purchasePrice, sellingPrice, currentStock, minStock) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  products.forEach(product => {
    try {
      stmt.run(
        product.name,
        product.description,
        product.categoryId,
        product.unitId,
        product.sku,
        product.barcode,
        product.purchasePrice,
        product.sellingPrice,
        product.currentStock,
        product.minStock
      );
    } catch (error) {
      console.error(`Error adding product ${product.name}:`, error.message);
    }
  });
  
  console.log('Sample products added');
}

// Add sample customers
function addSampleCustomers() {
  console.log('Adding sample customers...');
  
  const customers = [
    {
      name: 'Raj Kumar',
      phone: '9876543210',
      address: '123 Main St, Village',
      email: 'raj@example.com',
      notes: 'Regular customer'
    },
    {
      name: 'Priya Singh',
      phone: '8765432109',
      address: '456 Market Rd, Village',
      email: 'priya@example.com',
      notes: 'Buys in bulk'
    },
    {
      name: 'Mohan Patel',
      phone: '7654321098',
      address: '789 Temple St, Village',
      email: 'mohan@example.com',
      notes: 'Contractor'
    }
  ];
  
  const stmt = db.prepare(`
    INSERT INTO customers 
    (name, phone, address, email, notes) 
    VALUES (?, ?, ?, ?, ?)
  `);
  
  customers.forEach(customer => {
    try {
      stmt.run(
        customer.name,
        customer.phone,
        customer.address,
        customer.email,
        customer.notes
      );
    } catch (error) {
      console.error(`Error adding customer ${customer.name}:`, error.message);
    }
  });
  
  console.log('Sample customers added');
}

// Add sample invoices
function addSampleInvoices() {
  console.log('Adding sample invoices...');
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const invoices = [
    {
      invoiceNumber: 'INV-001',
      date: today,
      customerId: 1, // Raj Kumar
      subtotal: 500,
      discountRate: 0,
      discountAmount: 0,
      taxRate: 18,
      taxAmount: 90,
      totalAmount: 590,
      paymentMethod: 'Cash',
      paymentStatus: 'Paid',
      notes: 'First invoice'
    },
    {
      invoiceNumber: 'INV-002',
      date: today,
      customerId: 2, // Priya Singh
      subtotal: 1000,
      discountRate: 5,
      discountAmount: 50,
      taxRate: 18,
      taxAmount: 171,
      totalAmount: 1121,
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      notes: 'Bulk purchase'
    },
    {
      invoiceNumber: 'INV-003',
      date: yesterdayStr,
      customerId: 3, // Mohan Patel
      subtotal: 2000,
      discountRate: 10,
      discountAmount: 200,
      taxRate: 18,
      taxAmount: 324,
      totalAmount: 2124,
      paymentMethod: 'Credit',
      paymentStatus: 'Pending',
      notes: 'Construction project'
    }
  ];
  
  const invoiceStmt = db.prepare(`
    INSERT INTO invoices 
    (invoiceNumber, date, customerId, subtotal, discountRate, discountAmount, taxRate, taxAmount, totalAmount, paymentMethod, paymentStatus, notes) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const itemStmt = db.prepare(`
    INSERT INTO invoice_items 
    (invoiceId, productId, quantity, price, total) 
    VALUES (?, ?, ?, ?, ?)
  `);
  
  // Sample invoice items
  const invoiceItems = [
    // Items for INV-001
    { invoiceId: 1, productId: 1, quantity: 1, price: 250, total: 250 }, // Hammer
    { invoiceId: 1, productId: 4, quantity: 2.5, price: 100, total: 250 }, // Light Bulb
    
    // Items for INV-002
    { invoiceId: 2, productId: 2, quantity: 2, price: 350, total: 700 }, // Screwdriver Set
    { invoiceId: 2, productId: 5, quantity: 1.5, price: 200, total: 300 }, // Wall Paint
    
    // Items for INV-003
    { invoiceId: 3, productId: 3, quantity: 20, price: 50, total: 1000 }, // PVC Pipe
    { invoiceId: 3, productId: 6, quantity: 5, price: 120, total: 600 }, // Nails
    { invoiceId: 3, productId: 4, quantity: 4, price: 100, total: 400 } // Light Bulb
  ];
  
  // Insert invoices
  invoices.forEach(invoice => {
    try {
      invoiceStmt.run(
        invoice.invoiceNumber,
        invoice.date,
        invoice.customerId,
        invoice.subtotal,
        invoice.discountRate,
        invoice.discountAmount,
        invoice.taxRate,
        invoice.taxAmount,
        invoice.totalAmount,
        invoice.paymentMethod,
        invoice.paymentStatus,
        invoice.notes
      );
    } catch (error) {
      console.error(`Error adding invoice ${invoice.invoiceNumber}:`, error.message);
    }
  });
  
  // Insert invoice items
  invoiceItems.forEach(item => {
    try {
      itemStmt.run(
        item.invoiceId,
        item.productId,
        item.quantity,
        item.price,
        item.total
      );
    } catch (error) {
      console.error(`Error adding invoice item for invoice ${item.invoiceId}, product ${item.productId}:`, error.message);
    }
  });
  
  console.log('Sample invoices added');
}

// Main function to add all sample data
function addAllSampleData() {
  try {
    // Begin transaction
    db.exec('BEGIN TRANSACTION');
    
    // Create tables if they don't exist
    createTables();
    
    // Add sample data
    addSampleCategories();
    addSampleUnits();
    addSampleProducts();
    addSampleCustomers();
    addSampleInvoices();
    
    // Commit transaction
    db.exec('COMMIT');
    
    console.log('All sample data added successfully');
  } catch (error) {
    // Rollback transaction on error
    db.exec('ROLLBACK');
    console.error('Error adding sample data:', error);
  } finally {
    // Close the database connection
    db.close();
  }
}

// Run the main function
addAllSampleData();