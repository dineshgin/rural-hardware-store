# Windows Setup Guide

This guide will help you set up and run the Rural Hardware Store application on Windows.

## Prerequisites

1. **Install Node.js and npm**
   - Download and install from [Node.js official website](https://nodejs.org/)
   - Choose the LTS (Long Term Support) version
   - Make sure to check the option to install necessary tools during installation

2. **Install Git (Optional)**
   - Download and install from [Git official website](https://git-scm.com/download/win)
   - This is only needed if you want to clone the repository

3. **Install Build Tools**
   - Open PowerShell as Administrator and run:
   ```
   npm install --global --production windows-build-tools
   ```
   - This installs Visual Studio Build Tools and Python

## Installation

### Option 1: Using Git

1. Open Command Prompt or PowerShell
2. Clone the repository:
   ```
   git clone https://github.com/dineshgin/rural-hardware-store.git
   ```
3. Navigate to the project directory:
   ```
   cd rural-hardware-store
   ```

### Option 2: Download ZIP

1. Go to https://github.com/dineshgin/rural-hardware-store
2. Click the "Code" button and select "Download ZIP"
3. Extract the ZIP file to a location of your choice
4. Open Command Prompt or PowerShell and navigate to the extracted folder

## Running the Application

1. Install dependencies:
   ```
   npm install
   ```

2. If you encounter any issues with better-sqlite3, run:
   ```
   npm uninstall better-sqlite3
   npm install better-sqlite3 --save
   ```

3. Start the application:
   ```
   npm start
   ```

## Troubleshooting

If you encounter issues with native modules like better-sqlite3:

1. Make sure you have the build tools installed as mentioned in the prerequisites
2. Try running:
   ```
   npm install --save-dev electron-rebuild
   npx electron-rebuild -f -w better-sqlite3
   ```

3. If you still have issues, create a file named `windows-fix.bat` with the following content:
   ```bat
   @echo off
   echo Fixing better-sqlite3 installation...
   npm uninstall better-sqlite3
   npm cache clean --force
   npm install better-sqlite3@8.3.0 --save
   echo Fix completed. Try running 'npm start' now.
   pause
   ```

4. Run the batch file by double-clicking it

## Creating an Installer

To create a Windows installer:

1. Run:
   ```
   npm run build
   ```

2. The installer will be created in the `dist` folder