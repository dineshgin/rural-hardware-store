// Fix for database connection issues
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Function to fix database connection
function fixDatabaseConnection() {
  try {
    console.log('Attempting to fix database connection...');
    
    // Path to the database file
    const dbPath = path.join(__dirname, 'src', 'database', 'store.db');
    console.log(`Database path: ${dbPath}`);
    
    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      console.error(`Database file not found at: ${dbPath}`);
      
      // Create database directory if it doesn't exist
      const dbDir = path.join(__dirname, 'src', 'database');
      if (!fs.existsSync(dbDir)) {
        console.log(`Creating database directory: ${dbDir}`);
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      // Create an empty database file
      console.log('Creating new database file...');
      const db = new sqlite3.Database(dbPath);
      
      // Create necessary tables
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
        `);
        
        // Add some sample data
        db.run(`INSERT INTO customers (name, phone, address, email) VALUES ('John Doe', '555-1234', '123 Main St', 'john@example.com')`);
        db.run(`INSERT INTO products (name, description, price, stock, category) VALUES ('Hammer', 'Standard claw hammer', 12.99, 25, 'Tools')`);
        db.run(`INSERT INTO products (name, description, price, stock, category) VALUES ('Nails', '2-inch nails (box of 100)', 5.99, 50, 'Hardware')`);
      });
      
      db.close();
      console.log('Database created successfully with sample data');
    } else {
      console.log('Database file exists, checking connection...');
      
      // Test database connection
      const db = new sqlite3.Database(dbPath);
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='customers'", (err, row) => {
        if (err) {
          console.error('Error connecting to database:', err.message);
        } else if (!row) {
          console.log('Customers table not found, creating schema...');
          
          // Create necessary tables
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
            `);
            
            // Add some sample data
            db.run(`INSERT INTO customers (name, phone, address, email) VALUES ('John Doe', '555-1234', '123 Main St', 'john@example.com')`);
            db.run(`INSERT INTO products (name, description, price, stock, category) VALUES ('Hammer', 'Standard claw hammer', 12.99, 25, 'Tools')`);
            db.run(`INSERT INTO products (name, description, price, stock, category) VALUES ('Nails', '2-inch nails (box of 100)', 5.99, 50, 'Hardware')`);
          });
          
          console.log('Database schema created successfully with sample data');
        } else {
          console.log('Database connection successful');
        }
      });
      
      db.close();
    }
    
    // Fix the database.js file
    const dbJsPath = path.join(__dirname, 'src', 'database', 'db.js');
    if (fs.existsSync(dbJsPath)) {
      console.log('Checking database.js file...');
      
      let dbJsContent = fs.readFileSync(dbJsPath, 'utf8');
      
      // Check if there's an issue with the db initialization
      if (dbJsContent.includes('let db;') && !dbJsContent.includes('db = new sqlite3.Database')) {
        console.log('Fixing db.js initialization...');
        
        // Replace the problematic initialization
        const fixedDbJs = dbJsContent.replace(
          'let db;',
          `let db;
// Initialize database connection
function initDb() {
  const dbPath = path.join(__dirname, 'store.db');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Could not connect to database', err);
    } else {
      console.log('Connected to database');
    }
  });
}

// Call initDb immediately
initDb();`
        );
        
        fs.writeFileSync(dbJsPath, fixedDbJs);
        console.log('Fixed db.js initialization');
      }
      
      // Check for the getDailySales function (line 432 from error)
      if (dbJsContent.includes('getDailySales')) {
        console.log('Fixing getDailySales function...');
        
        // Add a check for db before using it
        const fixedGetDailySales = `
  getDailySales: function() {
    return new Promise((resolve, reject) => {
      if (!db) {
        console.log('Database not initialized, initializing now...');
        initDb();
      }
      
      if (!db) {
        reject(new Error('Database connection failed'));
        return;
      }
      
      const query = \`
        SELECT 
          date(date) as sale_date,
          SUM(total) as daily_total,
          COUNT(*) as sale_count
        FROM sales
        GROUP BY date(date)
        ORDER BY date(date) DESC
        LIMIT 7
      \`;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },`;
        
        // Replace the getDailySales function
        const newDbJsContent = dbJsContent.replace(
          /getDailySales:[\s\S]*?},/,
          fixedGetDailySales
        );
        
        fs.writeFileSync(dbJsPath, newDbJsContent);
        console.log('Fixed getDailySales function');
      }
      
      // Check for the getAll function (line 283 from error)
      if (dbJsContent.includes('getAll:')) {
        console.log('Fixing getAll function...');
        
        // Add a check for db before using it
        const fixedGetAll = `
  getAll: function() {
    return new Promise((resolve, reject) => {
      if (!db) {
        console.log('Database not initialized, initializing now...');
        initDb();
      }
      
      if (!db) {
        reject(new Error('Database connection failed'));
        return;
      }
      
      const query = \`
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
      \`;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },`;
        
        // Replace the getAll function
        const newDbJsContent = dbJsContent.replace(
          /getAll:[\s\S]*?},/,
          fixedGetAll
        );
        
        fs.writeFileSync(dbJsPath, newDbJsContent);
        console.log('Fixed getAll function');
      }
    } else {
      console.error(`Database.js file not found at: ${dbJsPath}`);
    }
    
    console.log('Database fix completed');
    return true;
  } catch (error) {
    console.error('Error fixing database:', error);
    return false;
  }
}

// Export the fix function
module.exports = { fixDatabaseConnection };

// If this script is run directly, execute the fix
if (require.main === module) {
  fixDatabaseConnection();
}