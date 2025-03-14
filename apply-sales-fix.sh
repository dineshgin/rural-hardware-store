#!/bin/bash

# Script to apply the sales tab fix to the Rural Hardware Store application

# Set the project directory
PROJECT_DIR="/Users/dineshkumargopalakrishnan/RetailApp"

# Create backups directory if it doesn't exist
mkdir -p "$PROJECT_DIR/backups"

# Get current timestamp for backup files
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

echo "Creating backups of important files..."
cp "$PROJECT_DIR/src/index.html" "$PROJECT_DIR/backups/index.html.backup.$TIMESTAMP"
echo "Backups created in $PROJECT_DIR/backups/"

# Download the sales tab fix script
echo "Downloading sales tab fix script..."
curl -s -o "$PROJECT_DIR/fix-sales-tab.js" https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/fix-sales-tab.js
echo "Download complete."

# Add the script to index.html
echo "Adding the script to index.html..."
if ! grep -q "fix-sales-tab.js" "$PROJECT_DIR/src/index.html"; then
  sed -i '' '/<\/head>/i\\
  <script src="../fix-sales-tab.js"></script>\
' "$PROJECT_DIR/src/index.html"
fi

# Create a simple CSS file to ensure the sales page is visible
echo "Creating CSS fixes..."
mkdir -p "$PROJECT_DIR/src/styles"
cat > "$PROJECT_DIR/src/styles/sales-fixes.css" << 'EOF'
/* Sales page fixes for Rural Hardware Store */

/* Fix for the sales page layout */
#sales-page {
  padding: 20px !important;
  height: auto !important;
  min-height: 100% !important;
  overflow-y: visible !important;
  display: block !important;
}

/* Ensure the New Sale button is at the top and visible */
#new-sale-btn {
  margin-bottom: 20px !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}

/* Fix for input fields */
input[type="text"],
input[type="number"],
input[type="tel"],
input[type="email"],
input[type="date"],
textarea,
select {
  pointer-events: auto !important;
  background-color: #fff !important;
  opacity: 1 !important;
}

/* Fix for modals */
.modal {
  pointer-events: auto !important;
}

.modal-dialog {
  max-width: 600px !important;
  margin: 1.75rem auto !important;
}

/* Fix for buttons */
.btn {
  pointer-events: auto !important;
  cursor: pointer !important;
}

/* Fix for the page containers */
.page-container {
  display: none;
  padding: 20px !important;
  height: auto !important;
  min-height: 100% !important;
}

.page-container.active {
  display: block !important;
}

/* Fix for the main content area */
.main-content {
  height: 100vh !important;
  overflow-y: auto !important;
  padding: 0 !important;
}

/* Fix for tables */
.table {
  width: 100% !important;
  margin-bottom: 1rem !important;
}

/* Fix for cards */
.card {
  margin-bottom: 20px !important;
}
EOF

# Add the CSS file to index.html
echo "Adding CSS fixes to index.html..."
if ! grep -q "sales-fixes.css" "$PROJECT_DIR/src/index.html"; then
  sed -i '' '/<\/head>/i\\
  <link rel="stylesheet" href="./styles/sales-fixes.css">\
' "$PROJECT_DIR/src/index.html"
fi

# Create a simple IPC handler for sales functionality
echo "Creating IPC handlers for sales functionality..."
cat > "$PROJECT_DIR/src/sales-ipc-handlers.js" << 'EOF'
// IPC handlers for sales functionality
const { ipcMain } = require('electron');
const { getDatabase } = require('./database/db');

function registerSalesIpcHandlers() {
  console.log('Registering sales IPC handlers');
  
  // Get all products
  ipcMain.handle('get-products', async (event) => {
    try {
      console.log('Getting all products');
      const db = getDatabase();
      
      const products = db.prepare(`
        SELECT 
          p.*,
          u.name as unit_name
        FROM products p
        LEFT JOIN units u ON p.unit_id = u.id
        ORDER BY p.name
      `).all();
      
      return products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        categoryId: product.category_id,
        unitId: product.unit_id,
        unitName: product.unit_name,
        sku: product.sku,
        barcode: product.barcode,
        purchasePrice: product.purchase_price,
        sellingPrice: product.selling_price,
        currentStock: product.current_stock,
        minStock: product.min_stock
      }));
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  });
  
  // Get product by ID
  ipcMain.handle('get-product', async (event, productId) => {
    try {
      console.log('Getting product by ID:', productId);
      const db = getDatabase();
      
      const product = db.prepare(`
        SELECT 
          p.*,
          u.name as unit_name
        FROM products p
        LEFT JOIN units u ON p.unit_id = u.id
        WHERE p.id = ?
      `).get(productId);
      
      if (product) {
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          categoryId: product.category_id,
          unitId: product.unit_id,
          sku: product.sku,
          barcode: product.barcode,
          purchasePrice: product.purchase_price,
          sellingPrice: product.selling_price,
          currentStock: product.current_stock,
          minStock: product.min_stock,
          unit: {
            id: product.unit_id,
            name: product.unit_name
          }
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting product by ID:', error);
      throw error;
    }
  });
  
  // Get all customers
  ipcMain.handle('get-customers', async (event) => {
    try {
      console.log('Getting all customers');
      const db = getDatabase();
      
      const customers = db.prepare('SELECT * FROM customers ORDER BY name').all();
      return customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        email: customer.email,
        notes: customer.notes
      }));
    } catch (error) {
      console.error('Error getting customers:', error);
      throw error;
    }
  });
  
  // Save sale
  ipcMain.handle('save-sale', async (event, sale) => {
    try {
      console.log('Saving sale:', sale);
      const db = getDatabase();
      
      // Start a transaction
      db.prepare('BEGIN TRANSACTION').run();
      
      try {
        // Insert the sale
        const saleResult = db.prepare(`
          INSERT INTO invoices (
            customer_id, 
            invoice_date, 
            subtotal, 
            tax_amount, 
            discount_amount, 
            total_amount, 
            payment_method, 
            notes, 
            status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          sale.customerId || null,
          sale.date,
          sale.subtotal,
          sale.taxAmount,
          sale.discountAmount,
          sale.totalAmount,
          sale.paymentMethod,
          sale.notes || '',
          'completed'
        );
        
        const invoiceId = saleResult.lastInsertRowid;
        
        // Insert the sale items
        for (const item of sale.items) {
          db.prepare(`
            INSERT INTO invoice_items (
              invoice_id, 
              product_id, 
              quantity, 
              unit_price, 
              total_price
            ) VALUES (?, ?, ?, ?, ?)
          `).run(
            invoiceId,
            item.productId,
            item.quantity,
            item.price,
            item.total
          );
          
          // Update the product stock
          db.prepare(`
            UPDATE products 
            SET current_stock = current_stock - ? 
            WHERE id = ?
          `).run(item.quantity, item.productId);
        }
        
        // Commit the transaction
        db.prepare('COMMIT').run();
        
        console.log('Sale saved with ID:', invoiceId);
        return { success: true, id: invoiceId };
      } catch (error) {
        // Rollback the transaction if there's an error
        db.prepare('ROLLBACK').run();
        throw error;
      }
    } catch (error) {
      console.error('Error saving sale:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Get recent sales
  ipcMain.handle('get-recent-sales', async (event, limit = 10) => {
    try {
      console.log('Getting recent sales, limit:', limit);
      const db = getDatabase();
      
      const sales = db.prepare(`
        SELECT 
          i.*,
          c.name as customer_name,
          (SELECT COUNT(*) FROM invoice_items WHERE invoice_id = i.id) as item_count
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        ORDER BY i.invoice_date DESC
        LIMIT ?
      `).all(limit);
      
      return sales.map(sale => ({
        id: sale.id,
        invoiceNumber: `INV-${sale.id.toString().padStart(5, '0')}`,
        customerId: sale.customer_id,
        customerName: sale.customer_name || 'Walk-in Customer',
        date: sale.invoice_date,
        subtotal: sale.subtotal,
        taxAmount: sale.tax_amount,
        discountAmount: sale.discount_amount,
        totalAmount: sale.total_amount,
        paymentMethod: sale.payment_method,
        notes: sale.notes,
        status: sale.status,
        itemCount: sale.item_count
      }));
    } catch (error) {
      console.error('Error getting recent sales:', error);
      throw error;
    }
  });
  
  console.log('Sales IPC handlers registered');
}

module.exports = { registerSalesIpcHandlers };
EOF

# Update main.js to include the sales IPC handlers
echo "Updating main.js to include sales IPC handlers..."
if ! grep -q "registerSalesIpcHandlers" "$PROJECT_DIR/main.js"; then
  # Add the import at the top of the file
  sed -i '' '/const { app, BrowserWindow, ipcMain } = require/a\\
const { registerSalesIpcHandlers } = require("./src/sales-ipc-handlers");\
' "$PROJECT_DIR/main.js"

  # Add the registration call after app is ready
  sed -i '' '/app.on("ready", async () => {/a\\
  // Register sales IPC handlers\
  registerSalesIpcHandlers();\
' "$PROJECT_DIR/main.js"
fi

# Create a function to load sales data
echo "Creating function to load sales data..."
cat > "$PROJECT_DIR/src/load-sales-data.js" << 'EOF'
// Function to load sales data
async function loadSalesData() {
  console.log('Loading sales data...');
  
  const tableBody = document.getElementById('sales-table-body');
  if (!tableBody) {
    console.error('Sales table body not found');
    return;
  }
  
  // Show loading message
  tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading sales data...</td></tr>';
  
  try {
    // Get recent sales from the database
    const sales = await ipcRenderer.invoke('get-recent-sales', 20);
    
    if (sales && sales.length > 0) {
      // Clear the table
      tableBody.innerHTML = '';
      
      // Add each sale to the table
      sales.forEach(sale => {
        const row = document.createElement('tr');
        
        // Format the date
        const date = new Date(sale.date);
        const formattedDate = date.toLocaleDateString();
        
        // Create the row content
        row.innerHTML = `
          <td>${sale.invoiceNumber}</td>
          <td>${sale.customerName}</td>
          <td>${formattedDate}</td>
          <td>${sale.itemCount}</td>
          <td>₹${sale.totalAmount.toFixed(2)}</td>
          <td><span class="badge bg-success">${sale.status}</span></td>
          <td>
            <button class="btn btn-sm btn-info view-sale-btn" data-sale-id="${sale.id}">View</button>
            <button class="btn btn-sm btn-secondary print-sale-btn" data-sale-id="${sale.id}">Print</button>
          </td>
        `;
        
        tableBody.appendChild(row);
      });
      
      // Add event listeners to the view and print buttons
      tableBody.querySelectorAll('.view-sale-btn').forEach(button => {
        button.addEventListener('click', function() {
          const saleId = this.dataset.saleId;
          console.log('View sale button clicked for sale ID:', saleId);
          // Implement view sale functionality
        });
      });
      
      tableBody.querySelectorAll('.print-sale-btn').forEach(button => {
        button.addEventListener('click', function() {
          const saleId = this.dataset.saleId;
          console.log('Print sale button clicked for sale ID:', saleId);
          // Implement print sale functionality
        });
      });
    } else {
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No sales found</td></tr>';
    }
  } catch (error) {
    console.error('Error loading sales data:', error);
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error loading sales data: ${error.message}</td></tr>`;
  }
}

// Add the function to the window object
window.loadSalesData = loadSalesData;

// Load sales data when the sales page is shown
document.addEventListener('DOMContentLoaded', function() {
  const salesNavButton = document.querySelector('[data-page="sales"]');
  if (salesNavButton) {
    salesNavButton.addEventListener('click', function() {
      setTimeout(loadSalesData, 500);
    });
  }
  
  // Also load sales data if we're already on the sales page
  setTimeout(function() {
    const salesPage = document.getElementById('sales-page');
    if (salesPage && salesPage.classList.contains('active')) {
      loadSalesData();
    }
  }, 1000);
});
EOF

# Add the load-sales-data.js script to index.html
echo "Adding load-sales-data.js to index.html..."
if ! grep -q "load-sales-data.js" "$PROJECT_DIR/src/index.html"; then
  sed -i '' '/<\/head>/i\\
  <script src="./load-sales-data.js"></script>\
' "$PROJECT_DIR/src/index.html"
fi

# Copy the files to the project directory
cp "$PROJECT_DIR/src/sales-ipc-handlers.js" "$PROJECT_DIR/src/sales-ipc-handlers.js"
cp "$PROJECT_DIR/src/load-sales-data.js" "$PROJECT_DIR/src/load-sales-data.js"

echo "Sales tab fix applied!"
echo ""
echo "Please restart your application with:"
echo "cd $PROJECT_DIR && npm start"
echo ""
echo "After restarting, you should see the New Sale button at the top of the sales page."
echo "If you encounter any issues, you can restore from the backups in $PROJECT_DIR/backups/"