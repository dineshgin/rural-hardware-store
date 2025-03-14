#!/bin/bash

# Script to fix better-sqlite3 compatibility with Electron
echo "Starting SQLite fix for Electron..."

# Set the project directory
PROJECT_DIR="/Users/dineshkumargopalakrishnan/RetailApp"
cd "$PROJECT_DIR" || { echo "Error: Cannot change to project directory $PROJECT_DIR"; exit 1; }

# Create backups directory
BACKUP_DIR="$PROJECT_DIR/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "Created backup directory: $BACKUP_DIR"

# Backup database files
echo "Backing up database files..."
mkdir -p "$BACKUP_DIR/src/database"
if [ -d "$PROJECT_DIR/src/database" ]; then
  cp -r "$PROJECT_DIR/src/database" "$BACKUP_DIR/src/"
  echo "Database directory backed up"
fi

# Backup main.js
if [ -f "$PROJECT_DIR/main.js" ]; then
  cp "$PROJECT_DIR/main.js" "$BACKUP_DIR/"
  echo "main.js backed up"
fi

# Backup package.json
if [ -f "$PROJECT_DIR/package.json" ]; then
  cp "$PROJECT_DIR/package.json" "$BACKUP_DIR/"
  echo "package.json backed up"
fi

# Remove the problematic files from previous fix attempts
echo "Removing problematic files from previous fix attempts..."
rm -f "$PROJECT_DIR/database-fix.js" "$PROJECT_DIR/apply-fix-on-startup.js"

# Fix main.js if needed
MAIN_JS="$PROJECT_DIR/main.js"
if [ -f "$MAIN_JS" ]; then
  # Remove the require for apply-fix-on-startup
  sed -i '' '/require.*apply-fix-on-startup/d' "$MAIN_JS"
  echo "Removed problematic require from main.js"
fi

# Install electron-rebuild
echo "Installing electron-rebuild..."
npm install --save-dev electron-rebuild

# Get electron version
ELECTRON_VERSION=$(npm list electron | grep electron | sed 's/.*@//')
echo "Detected Electron version: $ELECTRON_VERSION"

# Remove better-sqlite3 and install sqlite3
echo "Switching from better-sqlite3 to sqlite3..."
npm uninstall better-sqlite3
npm install sqlite3 --save

# Rebuild native modules for Electron
echo "Rebuilding native modules for Electron..."
npx electron-rebuild -f -w sqlite3

# Create a fix for the database.js file
echo "Creating fix for database.js..."
DB_JS="$PROJECT_DIR/src/database/db.js"
if [ -f "$DB_JS" ]; then
  # Backup the file
  cp "$DB_JS" "$BACKUP_DIR/src/database/"
  echo "db.js backed up"
  
  # Create a new db.js file
  cat > "$DB_JS" << 'EOL'
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Database connection
let db;

// Initialize database
function initDatabase() {
  return new Promise((resolve, reject) => {
    try {
      console.log('Initializing database...');
      const dbPath = path.join(__dirname, 'store.db');
      console.log(`Database path: ${dbPath}`);
      
      db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Database connection error:', err);
          reject(err);
          return;
        }
        console.log('Connected to SQLite database');
        
        // Create tables if they don't exist
        db.serialize(() => {
          // Customers table
          db.run(`
            CREATE TABLE IF NOT EXISTS customers (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              phone TEXT,
              address TEXT,
              email TEXT
            )
          `);
          
          // Products table
          db.run(`
            CREATE TABLE IF NOT EXISTS products (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              description TEXT,
              price REAL NOT NULL,
              stock INTEGER DEFAULT 0,
              category TEXT
            )
          `);
          
          // Sales table
          db.run(`
            CREATE TABLE IF NOT EXISTS sales (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              customer_id INTEGER,
              date TEXT,
              total REAL,
              payment_method TEXT,
              status TEXT DEFAULT 'Completed',
              notes TEXT,
              FOREIGN KEY (customer_id) REFERENCES customers (id)
            )
          `);
          
          // Sale items table
          db.run(`
            CREATE TABLE IF NOT EXISTS sale_items (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              sale_id INTEGER,
              product_id INTEGER,
              quantity INTEGER,
              price REAL,
              FOREIGN KEY (sale_id) REFERENCES sales (id),
              FOREIGN KEY (product_id) REFERENCES products (id)
            )
          `, (err) => {
            if (err) {
              console.error('Error creating tables:', err);
              reject(err);
            } else {
              console.log('Database initialized successfully');
              resolve();
            }
          });
        });
      });
    } catch (error) {
      console.error('Database initialization error:', error);
      reject(error);
    }
  });
}

// Database operations
const dbOperations = {
  // Customer operations
  customers: {
    getAll: function() {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM customers ORDER BY name', [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
    
    getById: function(id) {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM customers WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    },
    
    add: function(customer) {
      return new Promise((resolve, reject) => {
        const { name, phone, address, email } = customer;
        db.run(
          'INSERT INTO customers (name, phone, address, email) VALUES (?, ?, ?, ?)',
          [name, phone, address, email],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id: this.lastID, ...customer });
            }
          }
        );
      });
    },
    
    update: function(id, customer) {
      return new Promise((resolve, reject) => {
        const { name, phone, address, email } = customer;
        db.run(
          'UPDATE customers SET name = ?, phone = ?, address = ?, email = ? WHERE id = ?',
          [name, phone, address, email, id],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, ...customer });
            }
          }
        );
      });
    },
    
    delete: function(id) {
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM customers WHERE id = ?', [id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id });
          }
        });
      });
    }
  },
  
  // Product operations
  products: {
    getAll: function() {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM products ORDER BY name', [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
    
    getById: function(id) {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    },
    
    add: function(product) {
      return new Promise((resolve, reject) => {
        const { name, description, price, stock, category } = product;
        db.run(
          'INSERT INTO products (name, description, price, stock, category) VALUES (?, ?, ?, ?, ?)',
          [name, description, price, stock, category],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id: this.lastID, ...product });
            }
          }
        );
      });
    },
    
    update: function(id, product) {
      return new Promise((resolve, reject) => {
        const { name, description, price, stock, category } = product;
        db.run(
          'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ? WHERE id = ?',
          [name, description, price, stock, category, id],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, ...product });
            }
          }
        );
      });
    },
    
    delete: function(id) {
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id });
          }
        });
      });
    },
    
    updateStock: function(id, quantity) {
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [quantity, id],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, quantity });
            }
          }
        );
      });
    }
  },
  
  // Sales operations
  sales: {
    getAll: function() {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT 
            s.id, 
            s.date, 
            s.total, 
            s.payment_method,
            s.status,
            c.name as customer_name,
            COUNT(si.id) as item_count
          FROM sales s
          LEFT JOIN customers c ON s.customer_id = c.id
          LEFT JOIN sale_items si ON s.id = si.sale_id
          GROUP BY s.id
          ORDER BY s.date DESC
        `;
        
        db.all(query, [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
    
    getById: function(id) {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT 
            s.id, 
            s.date, 
            s.total, 
            s.payment_method,
            s.status,
            s.notes,
            c.id as customer_id,
            c.name as customer_name
          FROM sales s
          LEFT JOIN customers c ON s.customer_id = c.id
          WHERE s.id = ?
        `;
        
        db.get(query, [id], (err, sale) => {
          if (err) {
            reject(err);
          } else if (!sale) {
            resolve(null);
          } else {
            // Get sale items
            const itemsQuery = `
              SELECT 
                si.id,
                si.quantity,
                si.price,
                p.id as product_id,
                p.name as product_name
              FROM sale_items si
              JOIN products p ON si.product_id = p.id
              WHERE si.sale_id = ?
            `;
            
            db.all(itemsQuery, [id], (err, items) => {
              if (err) {
                reject(err);
              } else {
                sale.items = items;
                resolve(sale);
              }
            });
          }
        });
      });
    },
    
    add: function(sale) {
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');
          
          const { customer_id, date, total, payment_method, status, notes, items } = sale;
          
          db.run(
            'INSERT INTO sales (customer_id, date, total, payment_method, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [customer_id, date, total, payment_method, status || 'Completed', notes],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                reject(err);
                return;
              }
              
              const saleId = this.lastID;
              let itemsProcessed = 0;
              
              // If no items, commit and resolve
              if (!items || items.length === 0) {
                db.run('COMMIT');
                resolve({ id: saleId, ...sale });
                return;
              }
              
              // Add sale items
              items.forEach(item => {
                db.run(
                  'INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                  [saleId, item.product_id, item.quantity, item.price],
                  function(err) {
                    if (err) {
                      db.run('ROLLBACK');
                      reject(err);
                      return;
                    }
                    
                    // Update product stock
                    db.run(
                      'UPDATE products SET stock = stock - ? WHERE id = ?',
                      [item.quantity, item.product_id],
                      function(err) {
                        if (err) {
                          db.run('ROLLBACK');
                          reject(err);
                          return;
                        }
                        
                        itemsProcessed++;
                        
                        // If all items processed, commit and resolve
                        if (itemsProcessed === items.length) {
                          db.run('COMMIT');
                          resolve({ id: saleId, ...sale });
                        }
                      }
                    );
                  }
                );
              });
            }
          );
        });
      });
    },
    
    update: function(id, sale) {
      return new Promise((resolve, reject) => {
        const { status, payment_method, notes } = sale;
        db.run(
          'UPDATE sales SET status = ?, payment_method = ?, notes = ? WHERE id = ?',
          [status, payment_method, notes, id],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, ...sale });
            }
          }
        );
      });
    },
    
    delete: function(id) {
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');
          
          // Get sale items to restore stock
          db.all('SELECT product_id, quantity FROM sale_items WHERE sale_id = ?', [id], (err, items) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            // Restore stock for each item
            let itemsProcessed = 0;
            
            // If no items, delete sale and resolve
            if (!items || items.length === 0) {
              db.run('DELETE FROM sales WHERE id = ?', [id], function(err) {
                if (err) {
                  db.run('ROLLBACK');
                  reject(err);
                } else {
                  db.run('COMMIT');
                  resolve({ id });
                }
              });
              return;
            }
            
            items.forEach(item => {
              db.run(
                'UPDATE products SET stock = stock + ? WHERE id = ?',
                [item.quantity, item.product_id],
                function(err) {
                  if (err) {
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                  }
                  
                  itemsProcessed++;
                  
                  // If all items processed, delete sale items and sale
                  if (itemsProcessed === items.length) {
                    db.run('DELETE FROM sale_items WHERE sale_id = ?', [id], function(err) {
                      if (err) {
                        db.run('ROLLBACK');
                        reject(err);
                        return;
                      }
                      
                      db.run('DELETE FROM sales WHERE id = ?', [id], function(err) {
                        if (err) {
                          db.run('ROLLBACK');
                          reject(err);
                        } else {
                          db.run('COMMIT');
                          resolve({ id });
                        }
                      });
                    });
                  }
                }
              );
            });
          });
        });
      });
    }
  },
  
  // Dashboard operations
  dashboard: {
    getSummary: function() {
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          let summary = {};
          
          // Get total customers
          db.get('SELECT COUNT(*) as count FROM customers', [], (err, row) => {
            if (err) {
              reject(err);
              return;
            }
            
            summary.totalCustomers = row.count;
            
            // Get total products
            db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
              if (err) {
                reject(err);
                return;
              }
              
              summary.totalProducts = row.count;
              
              // Get total sales
              db.get('SELECT COUNT(*) as count, SUM(total) as total FROM sales', [], (err, row) => {
                if (err) {
                  reject(err);
                  return;
                }
                
                summary.totalSales = row.count;
                summary.totalRevenue = row.total || 0;
                
                // Get low stock products
                db.all('SELECT * FROM products WHERE stock <= 5 ORDER BY stock ASC', [], (err, rows) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  
                  summary.lowStockProducts = rows;
                  resolve(summary);
                });
              });
            });
          });
        });
      });
    },
    
    getDailySales: function() {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT 
            date(date) as sale_date,
            SUM(total) as daily_total,
            COUNT(*) as sale_count
          FROM sales
          GROUP BY date(date)
          ORDER BY date(date) DESC
          LIMIT 7
        `;
        
        db.all(query, [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
    
    getTopProducts: function() {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT 
            p.id,
            p.name,
            SUM(si.quantity) as total_quantity,
            SUM(si.quantity * si.price) as total_revenue
          FROM sale_items si
          JOIN products p ON si.product_id = p.id
          GROUP BY p.id
          ORDER BY total_quantity DESC
          LIMIT 5
        `;
        
        db.all(query, [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
    
    getTopCustomers: function() {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT 
            c.id,
            c.name,
            COUNT(s.id) as total_purchases,
            SUM(s.total) as total_spent
          FROM sales s
          JOIN customers c ON s.customer_id = c.id
          GROUP BY c.id
          ORDER BY total_spent DESC
          LIMIT 5
        `;
        
        db.all(query, [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }
  }
};

module.exports = {
  initDatabase,
  ...dbOperations
};
EOL
  echo "Created new db.js file with sqlite3 support"
else
  echo "Warning: db.js not found, cannot modify"
fi

# Create a simple sales page fix
echo "Creating a simple sales page fix..."
cat > "$PROJECT_DIR/simple-sales-fix.js" << 'EOL'
// Simple fix for sales page
document.addEventListener('DOMContentLoaded', function() {
  console.log('Applying simple sales page fix...');
  
  // Function to add New Sale button
  function addNewSaleButton() {
    console.log('Adding New Sale button...');
    
    // Get the sales page container
    const salesPage = document.querySelector('#sales-page');
    if (!salesPage) {
      console.error('Sales page not found');
      return;
    }
    
    // Check if button already exists
    if (document.querySelector('#new-sale-btn')) {
      console.log('New Sale button already exists');
      return;
    }
    
    // Create button
    const newSaleBtn = document.createElement('button');
    newSaleBtn.id = 'new-sale-btn';
    newSaleBtn.className = 'btn btn-primary btn-lg mb-4';
    newSaleBtn.innerHTML = '<i class="bi bi-plus-circle"></i> New Sale';
    newSaleBtn.style.display = 'block';
    newSaleBtn.style.marginBottom = '20px';
    
    // Add click handler
    newSaleBtn.addEventListener('click', function() {
      console.log('New Sale button clicked');
      alert('New Sale button clicked!');
    });
    
    // Insert at the beginning of the sales page
    salesPage.insertBefore(newSaleBtn, salesPage.firstChild);
    console.log('New Sale button added');
  }
  
  // Function to fix sales page
  function fixSalesPage() {
    // Add New Sale button
    addNewSaleButton();
    
    // Make sure the sales page is visible
    const salesPage = document.querySelector('#sales-page');
    if (salesPage) {
      salesPage.style.display = 'block';
      salesPage.style.padding = '20px';
      salesPage.style.height = 'auto';
      salesPage.style.minHeight = '100%';
      salesPage.style.overflowY = 'visible';
    }
    
    // Make sure the sales table is visible
    const salesTable = document.querySelector('#sales-page .card');
    if (salesTable) {
      salesTable.style.display = 'block';
      salesTable.style.marginTop = '20px';
    }
  }
  
  // Run fix when page loads
  setTimeout(fixSalesPage, 1000);
  
  // Run fix when sales tab is clicked
  const salesTab = document.querySelector('[data-page="sales"]');
  if (salesTab) {
    salesTab.addEventListener('click', function() {
      setTimeout(fixSalesPage, 500);
    });
  }
});
EOL

# Add the script to index.html
INDEX_HTML="$PROJECT_DIR/src/index.html"
if [ -f "$INDEX_HTML" ]; then
  # Backup index.html
  cp "$INDEX_HTML" "$BACKUP_DIR/"
  echo "index.html backed up"
  
  # Check if the script is already included
  if ! grep -q "simple-sales-fix.js" "$INDEX_HTML"; then
    # Add the script tag before the closing </body> tag
    sed -i '' 's|</body>|<script src="../simple-sales-fix.js"></script>\n</body>|' "$INDEX_HTML"
    echo "Simple sales fix added to index.html"
  else
    echo "Simple sales fix already included in index.html"
  fi
else
  echo "Warning: index.html not found, cannot modify"
fi

echo "SQLite fix completed!"
echo "Please restart your application to see the changes:"
echo "cd $PROJECT_DIR && npm start"