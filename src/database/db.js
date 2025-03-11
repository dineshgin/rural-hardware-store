const path = require('path');
const { app } = require('electron');
const fs = require('fs');
const Database = require('better-sqlite3');

// Create database directory if it doesn't exist
const userDataPath = app ? app.getPath('userData') : './data';
const dbDir = path.join(userDataPath, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dbDir, 'database.db');

// Initialize database connection
let db;
try {
  db = new Database(dbPath);
  console.log('Connected to SQLite database');
} catch (error) {
  console.error('Database connection error:', error);
}

// Create tables if they don't exist
function initDatabase() {
  try {
    // Create Customer table
    db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        email TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create ProductCategory table
    db.exec(`
      CREATE TABLE IF NOT EXISTS product_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create UnitOfMeasurement table
    db.exec(`
      CREATE TABLE IF NOT EXISTS units_of_measurement (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        abbreviation TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Product table
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        sku TEXT,
        barcode TEXT,
        purchase_price REAL NOT NULL,
        selling_price REAL NOT NULL,
        current_stock REAL DEFAULT 0,
        min_stock_level REAL DEFAULT 0,
        image TEXT,
        category_id INTEGER,
        unit_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES product_categories (id),
        FOREIGN KEY (unit_id) REFERENCES units_of_measurement (id)
      )
    `);

    // Create Invoice table
    db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT NOT NULL UNIQUE,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_amount REAL NOT NULL,
        discount REAL DEFAULT 0,
        tax REAL DEFAULT 0,
        final_amount REAL NOT NULL,
        payment_method TEXT,
        payment_status TEXT CHECK(payment_status IN ('Paid', 'Partial', 'Unpaid')) DEFAULT 'Unpaid',
        notes TEXT,
        customer_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id)
      )
    `);

    // Create InvoiceItem table
    db.exec(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quantity REAL NOT NULL,
        unit_price REAL NOT NULL,
        discount REAL DEFAULT 0,
        total REAL NOT NULL,
        invoice_id INTEGER,
        product_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `);

    // Create StockTransaction table
    db.exec(`
      CREATE TABLE IF NOT EXISTS stock_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT CHECK(type IN ('Purchase', 'Sale', 'Adjustment', 'Return')) NOT NULL,
        quantity REAL NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        product_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `);

    // Insert default units of measurement if they don't exist
    const unitCount = db.prepare('SELECT COUNT(*) as count FROM units_of_measurement').get().count;
    if (unitCount === 0) {
      const insertUnit = db.prepare('INSERT INTO units_of_measurement (name, abbreviation) VALUES (?, ?)');
      const units = [
        ['Piece', 'pc'],
        ['Kilogram', 'kg'],
        ['Gram', 'g'],
        ['Liter', 'L'],
        ['Milliliter', 'ml'],
        ['Meter', 'm'],
        ['Centimeter', 'cm'],
        ['Inch', 'in'],
        ['Foot', 'ft'],
        ['Box', 'box'],
        ['Packet', 'pkt']
      ];
      
      units.forEach(unit => {
        insertUnit.run(unit[0], unit[1]);
      });
    }

    // Insert default product categories if they don't exist
    const categoryCount = db.prepare('SELECT COUNT(*) as count FROM product_categories').get().count;
    if (categoryCount === 0) {
      const insertCategory = db.prepare('INSERT INTO product_categories (name, description) VALUES (?, ?)');
      const categories = [
        ['Paint', 'All types of paints and painting supplies'],
        ['Tools', 'Hand tools and power tools'],
        ['Fasteners', 'Nails, screws, bolts, etc.'],
        ['Plumbing', 'Pipes, fittings, and plumbing supplies'],
        ['Electrical', 'Wires, switches, and electrical supplies'],
        ['Building Materials', 'Cement, sand, bricks, etc.'],
        ['Hardware', 'Locks, hinges, handles, etc.']
      ];
      
      categories.forEach(category => {
        insertCategory.run(category[0], category[1]);
      });
    }

    console.log('Database initialized with default values');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Customer operations
const customerOperations = {
  getAll: () => {
    return db.prepare('SELECT * FROM customers ORDER BY name').all();
  },
  getById: (id) => {
    return db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  },
  create: (customer) => {
    const stmt = db.prepare(`
      INSERT INTO customers (name, phone, address, email, notes)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(customer.name, customer.phone, customer.address, customer.email, customer.notes);
    return result.lastInsertRowid;
  },
  update: (id, customer) => {
    const stmt = db.prepare(`
      UPDATE customers
      SET name = ?, phone = ?, address = ?, email = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(customer.name, customer.phone, customer.address, customer.email, customer.notes, id);
  },
  delete: (id) => {
    return db.prepare('DELETE FROM customers WHERE id = ?').run(id);
  }
};

// Product operations
const productOperations = {
  getAll: () => {
    return db.prepare(`
      SELECT p.*, c.name as category_name, u.name as unit_name, u.abbreviation as unit_abbreviation
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      LEFT JOIN units_of_measurement u ON p.unit_id = u.id
      ORDER BY p.name
    `).all();
  },
  getById: (id) => {
    return db.prepare(`
      SELECT p.*, c.name as category_name, u.name as unit_name, u.abbreviation as unit_abbreviation
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      LEFT JOIN units_of_measurement u ON p.unit_id = u.id
      WHERE p.id = ?
    `).get(id);
  },
  create: (product) => {
    const stmt = db.prepare(`
      INSERT INTO products (name, description, sku, barcode, purchase_price, selling_price, 
                           current_stock, min_stock_level, image, category_id, unit_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      product.name, product.description, product.sku, product.barcode,
      product.purchasePrice, product.sellingPrice, product.currentStock,
      product.minStockLevel, product.image, product.categoryId, product.unitId
    );
    return result.lastInsertRowid;
  },
  update: (id, product) => {
    const stmt = db.prepare(`
      UPDATE products
      SET name = ?, description = ?, sku = ?, barcode = ?, purchase_price = ?,
          selling_price = ?, current_stock = ?, min_stock_level = ?, image = ?,
          category_id = ?, unit_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(
      product.name, product.description, product.sku, product.barcode,
      product.purchasePrice, product.sellingPrice, product.currentStock,
      product.minStockLevel, product.image, product.categoryId, product.unitId, id
    );
  },
  updateStock: (id, quantity) => {
    const stmt = db.prepare(`
      UPDATE products
      SET current_stock = current_stock + ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(quantity, id);
  },
  delete: (id) => {
    return db.prepare('DELETE FROM products WHERE id = ?').run(id);
  },
  getLowStock: () => {
    return db.prepare('SELECT * FROM products WHERE current_stock <= min_stock_level').all();
  }
};

// Invoice operations
const invoiceOperations = {
  getAll: () => {
    return db.prepare(`
      SELECT i.*, c.name as customer_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      ORDER BY i.date DESC
    `).all();
  },
  getById: (id) => {
    return db.prepare(`
      SELECT i.*, c.name as customer_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ?
    `).get(id);
  },
  getItems: (invoiceId) => {
    return db.prepare(`
      SELECT ii.*, p.name as product_name, u.abbreviation as unit
      FROM invoice_items ii
      JOIN products p ON ii.product_id = p.id
      LEFT JOIN units_of_measurement u ON p.unit_id = u.id
      WHERE ii.invoice_id = ?
    `).all(invoiceId);
  },
  create: (invoice, items) => {
    // Start a transaction
    const transaction = db.transaction((invoice, items) => {
      // Insert invoice
      const invoiceStmt = db.prepare(`
        INSERT INTO invoices (invoice_number, date, total_amount, discount, tax, 
                             final_amount, payment_method, payment_status, notes, customer_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const invoiceResult = invoiceStmt.run(
        invoice.invoiceNumber, invoice.date, invoice.totalAmount,
        invoice.discount, invoice.tax, invoice.finalAmount,
        invoice.paymentMethod, invoice.paymentStatus, invoice.notes, invoice.customerId
      );
      
      const invoiceId = invoiceResult.lastInsertRowid;
      
      // Insert invoice items
      const itemStmt = db.prepare(`
        INSERT INTO invoice_items (quantity, unit_price, discount, total, invoice_id, product_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      // Update product stock
      const stockUpdateStmt = db.prepare(`
        UPDATE products
        SET current_stock = current_stock - ?
        WHERE id = ?
      `);
      
      // Record stock transaction
      const stockTransactionStmt = db.prepare(`
        INSERT INTO stock_transactions (type, quantity, product_id, notes)
        VALUES ('Sale', ?, ?, ?)
      `);
      
      // Process each item
      items.forEach(item => {
        // Add item to invoice
        itemStmt.run(
          item.quantity, item.unitPrice, item.discount,
          item.total, invoiceId, item.productId
        );
        
        // Update product stock
        stockUpdateStmt.run(item.quantity, item.productId);
        
        // Record stock transaction
        stockTransactionStmt.run(
          item.quantity, 
          item.productId, 
          `Sale through invoice #${invoice.invoiceNumber}`
        );
      });
      
      return invoiceId;
    });
    
    // Execute the transaction
    return transaction(invoice, items);
  },
  update: (id, invoice) => {
    const stmt = db.prepare(`
      UPDATE invoices
      SET payment_status = ?, payment_method = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(invoice.paymentStatus, invoice.paymentMethod, invoice.notes, id);
  },
  delete: (id) => {
    // This should be a transaction that also restores stock
    const transaction = db.transaction((id) => {
      // Get all items for this invoice
      const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(id);
      
      // Restore stock for each item
      const stockUpdateStmt = db.prepare(`
        UPDATE products
        SET current_stock = current_stock + ?
        WHERE id = ?
      `);
      
      items.forEach(item => {
        stockUpdateStmt.run(item.quantity, item.product_id);
      });
      
      // Delete invoice items
      db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(id);
      
      // Delete invoice
      db.prepare('DELETE FROM invoices WHERE id = ?').run(id);
    });
    
    return transaction(id);
  },
  getLatestInvoiceNumber: () => {
    const result = db.prepare('SELECT MAX(invoice_number) as max FROM invoices').get();
    return result.max || 'INV-0000';
  }
};

// Category operations
const categoryOperations = {
  getAll: () => {
    return db.prepare('SELECT * FROM product_categories ORDER BY name').all();
  },
  getById: (id) => {
    return db.prepare('SELECT * FROM product_categories WHERE id = ?').get(id);
  }
};

// Unit operations
const unitOperations = {
  getAll: () => {
    return db.prepare('SELECT * FROM units_of_measurement ORDER BY name').all();
  },
  getById: (id) => {
    return db.prepare('SELECT * FROM units_of_measurement WHERE id = ?').get(id);
  }
};

// Report operations
const reportOperations = {
  getDailySales: (date) => {
    return db.prepare(`
      SELECT SUM(final_amount) as total, COUNT(*) as count
      FROM invoices
      WHERE date(date) = date(?)
    `).get(date);
  },
  getSalesByDateRange: (startDate, endDate) => {
    return db.prepare(`
      SELECT date(date) as sale_date, SUM(final_amount) as total, COUNT(*) as count
      FROM invoices
      WHERE date(date) BETWEEN date(?) AND date(?)
      GROUP BY date(date)
      ORDER BY date(date)
    `).all(startDate, endDate);
  },
  getTopSellingProducts: (limit = 10) => {
    return db.prepare(`
      SELECT p.id, p.name, SUM(ii.quantity) as quantity_sold, 
             SUM(ii.total) as total_sales
      FROM invoice_items ii
      JOIN products p ON ii.product_id = p.id
      GROUP BY p.id
      ORDER BY quantity_sold DESC
      LIMIT ?
    `).all(limit);
  },
  getCustomerSales: (customerId) => {
    return db.prepare(`
      SELECT i.*, COUNT(ii.id) as item_count
      FROM invoices i
      JOIN invoice_items ii ON i.id = ii.invoice_id
      WHERE i.customer_id = ?
      GROUP BY i.id
      ORDER BY i.date DESC
    `).all(customerId);
  }
};

module.exports = {
  initDatabase,
  customers: customerOperations,
  products: productOperations,
  invoices: invoiceOperations,
  categories: categoryOperations,
  units: unitOperations,
  reports: reportOperations
};