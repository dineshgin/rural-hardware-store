// Enhanced IPC Handlers for the Rural Hardware Store application
// This file contains additional IPC handlers for the enhanced sales functionality

const { ipcMain } = require('electron');
const { getDatabase } = require('./database/db');

// Function to register all enhanced IPC handlers
function registerEnhancedIpcHandlers() {
  console.log('Registering enhanced IPC handlers');
  
  // Get product by ID with unit information
  ipcMain.handle('get-product', async (event, productId) => {
    try {
      console.log('Getting product by ID:', productId);
      const db = getDatabase();
      
      // Get the product with its unit information
      const product = db.prepare(`
        SELECT 
          p.*,
          u.name as unit_name,
          u.id as unit_id
        FROM products p
        LEFT JOIN units u ON p.unit_id = u.id
        WHERE p.id = ?
      `).get(productId);
      
      if (product) {
        // Format the product object
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
        console.log('Product not found with ID:', productId);
        return null;
      }
    } catch (error) {
      console.error('Error getting product by ID:', error);
      throw error;
    }
  });
  
  // Get product by barcode
  ipcMain.handle('get-product-by-barcode', async (event, barcode) => {
    try {
      console.log('Getting product by barcode:', barcode);
      const db = getDatabase();
      
      // Get the product with its unit information
      const product = db.prepare(`
        SELECT 
          p.*,
          u.name as unit_name,
          u.id as unit_id
        FROM products p
        LEFT JOIN units u ON p.unit_id = u.id
        WHERE p.barcode = ?
      `).get(barcode);
      
      if (product) {
        // Format the product object
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
        console.log('Product not found with barcode:', barcode);
        return null;
      }
    } catch (error) {
      console.error('Error getting product by barcode:', error);
      throw error;
    }
  });
  
  // Get all units
  ipcMain.handle('get-units', async (event) => {
    try {
      console.log('Getting all units');
      const db = getDatabase();
      
      const units = db.prepare('SELECT * FROM units').all();
      return units.map(unit => ({
        id: unit.id,
        name: unit.name,
        description: unit.description
      }));
    } catch (error) {
      console.error('Error getting units:', error);
      throw error;
    }
  });
  
  // Save unit
  ipcMain.handle('save-unit', async (event, unit) => {
    try {
      console.log('Saving unit:', unit);
      const db = getDatabase();
      
      const result = db.prepare('INSERT INTO units (name, description) VALUES (?, ?)').run(
        unit.name,
        unit.description || ''
      );
      
      console.log('Unit saved with ID:', result.lastInsertRowid);
      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      console.error('Error saving unit:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Get all categories
  ipcMain.handle('get-categories', async (event) => {
    try {
      console.log('Getting all categories');
      const db = getDatabase();
      
      const categories = db.prepare('SELECT * FROM categories').all();
      return categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description
      }));
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  });
  
  // Save category
  ipcMain.handle('save-category', async (event, category) => {
    try {
      console.log('Saving category:', category);
      const db = getDatabase();
      
      const result = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(
        category.name,
        category.description || ''
      );
      
      console.log('Category saved with ID:', result.lastInsertRowid);
      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      console.error('Error saving category:', error);
      return { success: false, error: error.message };
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
  
  // Get sale details
  ipcMain.handle('get-sale-details', async (event, saleId) => {
    try {
      console.log('Getting sale details for ID:', saleId);
      const db = getDatabase();
      
      // Get the sale
      const sale = db.prepare(`
        SELECT 
          i.*,
          c.name as customer_name,
          c.phone as customer_phone,
          c.address as customer_address
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        WHERE i.id = ?
      `).get(saleId);
      
      if (!sale) {
        console.log('Sale not found with ID:', saleId);
        return null;
      }
      
      // Get the sale items
      const items = db.prepare(`
        SELECT 
          ii.*,
          p.name as product_name,
          u.name as unit_name
        FROM invoice_items ii
        JOIN products p ON ii.product_id = p.id
        LEFT JOIN units u ON p.unit_id = u.id
        WHERE ii.invoice_id = ?
      `).all(saleId);
      
      // Format the sale object
      return {
        id: sale.id,
        invoiceNumber: `INV-${sale.id.toString().padStart(5, '0')}`,
        customerId: sale.customer_id,
        customer: sale.customer_id ? {
          id: sale.customer_id,
          name: sale.customer_name,
          phone: sale.customer_phone,
          address: sale.customer_address
        } : null,
        date: sale.invoice_date,
        subtotal: sale.subtotal,
        taxAmount: sale.tax_amount,
        discountAmount: sale.discount_amount,
        totalAmount: sale.total_amount,
        paymentMethod: sale.payment_method,
        notes: sale.notes,
        status: sale.status,
        items: items.map(item => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          unitName: item.unit_name || 'pcs',
          quantity: item.quantity,
          price: item.unit_price,
          total: item.total_price
        }))
      };
    } catch (error) {
      console.error('Error getting sale details:', error);
      throw error;
    }
  });
  
  console.log('Enhanced IPC handlers registered');
}

module.exports = { registerEnhancedIpcHandlers };