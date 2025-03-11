const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

// Create database directory if it doesn't exist
const userDataPath = app ? app.getPath('userData') : './data';
const dbDir = path.join(userDataPath, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(dbDir, 'database.db'),
  logging: false
});

// Define Customer model
const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.TEXT
  },
  email: {
    type: DataTypes.STRING
  },
  notes: {
    type: DataTypes.TEXT
  }
});

// Define Product Category model
const ProductCategory = sequelize.define('ProductCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  }
});

// Define Unit of Measurement model
const UnitOfMeasurement = sequelize.define('UnitOfMeasurement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  abbreviation: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Define Product model
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  sku: {
    type: DataTypes.STRING
  },
  barcode: {
    type: DataTypes.STRING
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  sellingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currentStock: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  minStockLevel: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  image: {
    type: DataTypes.STRING
  }
});

// Define Invoice model
const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  finalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING
  },
  paymentStatus: {
    type: DataTypes.ENUM('Paid', 'Partial', 'Unpaid'),
    defaultValue: 'Unpaid'
  },
  notes: {
    type: DataTypes.TEXT
  }
});

// Define InvoiceItem model
const InvoiceItem = sequelize.define('InvoiceItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
});

// Define StockTransaction model
const StockTransaction = sequelize.define('StockTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('Purchase', 'Sale', 'Adjustment', 'Return'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT
  }
});

// Define relationships
Product.belongsTo(ProductCategory);
ProductCategory.hasMany(Product);

Product.belongsTo(UnitOfMeasurement);
UnitOfMeasurement.hasMany(Product);

Invoice.belongsTo(Customer);
Customer.hasMany(Invoice);

InvoiceItem.belongsTo(Invoice);
Invoice.hasMany(InvoiceItem);

InvoiceItem.belongsTo(Product);
Product.hasMany(InvoiceItem);

StockTransaction.belongsTo(Product);
Product.hasMany(StockTransaction);

// Initialize database with default values
async function initDatabase() {
  try {
    // Sync all models with database
    await sequelize.sync();

    // Check if units of measurement exist, if not create defaults
    const unitCount = await UnitOfMeasurement.count();
    if (unitCount === 0) {
      await UnitOfMeasurement.bulkCreate([
        { name: 'Piece', abbreviation: 'pc' },
        { name: 'Kilogram', abbreviation: 'kg' },
        { name: 'Gram', abbreviation: 'g' },
        { name: 'Liter', abbreviation: 'L' },
        { name: 'Milliliter', abbreviation: 'ml' },
        { name: 'Meter', abbreviation: 'm' },
        { name: 'Centimeter', abbreviation: 'cm' },
        { name: 'Inch', abbreviation: 'in' },
        { name: 'Foot', abbreviation: 'ft' },
        { name: 'Box', abbreviation: 'box' },
        { name: 'Packet', abbreviation: 'pkt' }
      ]);
    }

    // Check if product categories exist, if not create defaults
    const categoryCount = await ProductCategory.count();
    if (categoryCount === 0) {
      await ProductCategory.bulkCreate([
        { name: 'Paint', description: 'All types of paints and painting supplies' },
        { name: 'Tools', description: 'Hand tools and power tools' },
        { name: 'Fasteners', description: 'Nails, screws, bolts, etc.' },
        { name: 'Plumbing', description: 'Pipes, fittings, and plumbing supplies' },
        { name: 'Electrical', description: 'Wires, switches, and electrical supplies' },
        { name: 'Building Materials', description: 'Cement, sand, bricks, etc.' },
        { name: 'Hardware', description: 'Locks, hinges, handles, etc.' }
      ]);
    }

    console.log('Database initialized with default values');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  Customer,
  Product,
  ProductCategory,
  UnitOfMeasurement,
  Invoice,
  InvoiceItem,
  StockTransaction,
  initDatabase
};