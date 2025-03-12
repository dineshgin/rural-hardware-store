# Enhanced Sales Functionality

This document explains the enhanced sales functionality added to the Rural Hardware Store application, specifically addressing the ability to handle different units of measurement and quick product creation during sales.

## Features

### 1. Support for Different Units of Measurement

The enhanced sales system now properly supports various units of measurement for products:

- **Piece-based products**: Standard items sold by count (e.g., nails, screws, tools)
- **Weight-based products**: Items sold by weight (e.g., cement, sand, gravel)
- **Length-based products**: Items sold by length (e.g., pipes, wires, ropes)
- **Volume-based products**: Items sold by volume (e.g., paint, oil)
- **Box/Package-based products**: Items sold in standard packages (e.g., boxes of tiles)

When adding items to a sale, the unit of measurement is automatically displayed in the quantity field, making it clear what unit the customer is purchasing.

### 2. Quick Product Creation

You can now add new products directly from the sales interface:

1. When adding an item to a sale, click the "New" button next to the product dropdown
2. Fill in the basic product details:
   - Product name
   - Category (optional)
   - Unit of measurement
   - Purchase price
   - Selling price
   - Current stock
   - Barcode (optional)
3. Click "Save & Select" to create the product and add it to the current sale

This feature is especially useful for:
- Adding new products on-the-fly during a sale
- Quickly entering products that a customer brings to the counter
- Handling special order items that aren't in your regular inventory

### 3. Barcode Scanning Support

The enhanced sales system includes barcode scanning support:

1. In the "Add Item" modal, you can scan or manually enter a barcode
2. If the product exists, it will be automatically selected
3. If the product doesn't exist, you'll be prompted to create a new product with that barcode

### 4. Improved Price Handling

The price input fields now properly handle decimal values, making it easy to enter precise prices for:
- Weight-based products (e.g., ₹45.50 per kg)
- Length-based products (e.g., ₹12.75 per meter)
- Fractional quantities (e.g., 0.5 kg of nails)

## Installation

To install the enhanced sales functionality:

1. Download the installation script:
   ```bash
   curl -o install-enhancements.sh https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/install-enhancements.sh
   ```

2. Make the script executable:
   ```bash
   chmod +x install-enhancements.sh
   ```

3. Run the script:
   ```bash
   ./install-enhancements.sh
   ```

4. Restart your application

## Default Units

The installation script adds the following default units to your database:

1. Piece - Individual item
2. Box - Box containing multiple items
3. Kg - Kilogram
4. Meter - Meter length
5. Liter - Liter volume
6. Dozen - 12 pieces

You can add more units through the application's settings page.

## Troubleshooting

If you encounter issues after installing the enhanced sales functionality:

1. Check the developer console (Ctrl+Shift+I or Cmd+Option+I) for error messages
2. Ensure that all required database tables exist (products, units, categories)
3. Verify that the enhanced JavaScript files are properly loaded in the browser
4. If necessary, restore from the backups created during installation (located in the `backups` directory)

For additional help, please open an issue on the GitHub repository.