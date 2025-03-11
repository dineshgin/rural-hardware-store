# Rural Hardware Store Management System

A comprehensive retail management application designed for hardware stores in rural India.

## Features

### Customer Management
- Store customer details (name, contact, address)
- Track customer purchase history
- Manage customer credit/payments

### Inventory Management
- Track diverse products (paint, tools, nails, pipes, etc.)
- Support multiple units of measurement (pieces, kg, liters, grams)
- Easy stock entry and adjustment
- Low stock alerts

### Sales Processing
- Simple POS interface for quick sales
- Support for different payment methods
- Generate sales invoices
- Handle returns and exchanges

### Reporting
- Daily sales reports
- Customer-wise sales analysis
- Product-wise sales analysis
- Inventory valuation reports
- Profit/loss statements

### Technical Features
- Works offline without internet
- Data synchronization when internet is available
- Simple, intuitive interface for elderly users
- Support for multiple stores in the future
- Data backup and recovery

## Technology Stack

- **Frontend**: Electron.js with React for cross-platform desktop application
- **Backend**: Node.js with Express
- **Database**: SQLite for local storage, with optional MongoDB for cloud sync
- **Printing**: Support for local printer integration
- **Deployment**: Packaged as standalone desktop application

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation
1. Clone this repository
   ```
   git clone https://github.com/dineshgin/rural-hardware-store.git
   cd rural-hardware-store
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the application
   ```
   npm start
   ```

## Development Roadmap

1. Phase 1: Core functionality (inventory, sales, customer management)
2. Phase 2: Reporting and analytics
3. Phase 3: Multi-store support and cloud synchronization
4. Phase 4: Advanced features (supplier management, purchase orders)