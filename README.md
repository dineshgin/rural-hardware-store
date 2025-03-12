# Rural Hardware Store

A retail management system for rural hardware stores, designed to work offline and be user-friendly for elderly users.

## Features

- Product management
- Customer management
- Sales and invoicing
- Inventory tracking
- Reports generation
- Offline functionality

## Installation

### Prerequisites

- Node.js (LTS version recommended)
- npm (comes with Node.js)

### Setup

1. Clone the repository:
```
git clone https://github.com/dineshgin/rural-hardware-store.git
```

2. Navigate to the project directory:
```
cd rural-hardware-store
```

3. Install dependencies:
```
npm install
```

4. Start the application:
```
npm start
```

## Fixing SQLite Issues on macOS

If you encounter issues with better-sqlite3 on macOS, run these commands directly in your terminal:

```bash
cd /Users/dineshkumargopalakrishnan/RetailApp

# Clean up existing installation
rm -rf node_modules
rm -f package-lock.json

# Install dependencies
npm install

# Install better-sqlite3 with specific configuration
npm install better-sqlite3 --build-from-source --save

# Install electron-rebuild
npm install --save-dev electron-rebuild

# Rebuild better-sqlite3 for Electron
npx electron-rebuild -f -w better-sqlite3
```

Then try running the application again with:
```
npm start
```

## Usage

The application provides an intuitive interface for managing your hardware store:

- **Dashboard**: Overview of sales, inventory, and pending payments
- **Sales**: Create and manage sales transactions
- **Inventory**: Manage products and stock levels
- **Customers**: Maintain customer information
- **Reports**: Generate various reports for business analysis
- **Settings**: Configure application settings

## License

MIT