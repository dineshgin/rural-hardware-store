#!/bin/bash

# Script to fix all issues with the Rural Hardware Store app
echo "Starting comprehensive fix script..."

# Navigate to the project directory
cd /Users/dineshkumargopalakrishnan/RetailApp

# Create backups of important files
echo "Creating backups of important files..."
mkdir -p backups
cp src/renderer.js backups/renderer.js.bak
cp main.js backups/main.js.bak

# Download the fixed files
echo "Downloading fixed files..."
curl -o fix-sales-data.js https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/fix-sales-data.js
curl -o fix-ipc-handlers.js https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/fix-ipc-handlers.js
curl -o missing-functions.js https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/missing-functions.js

# Fix the loadSalesData function in renderer.js
echo "Fixing loadSalesData function in renderer.js..."
if grep -q "async function loadSalesData()" src/renderer.js; then
  # Extract the start and end line numbers of the loadSalesData function
  start_line=$(grep -n "async function loadSalesData()" src/renderer.js | cut -d: -f1)
  
  if [ -n "$start_line" ]; then
    # Find the end of the function (next function declaration or end of file)
    end_line=$(tail -n +$((start_line+1)) src/renderer.js | grep -n "^[a-z]* *function " | head -1 | cut -d: -f1)
    
    if [ -n "$end_line" ]; then
      end_line=$((start_line + end_line - 1))
    else
      # If no next function, use end of file
      end_line=$(wc -l < src/renderer.js)
    fi
    
    # Replace the function
    echo "Replacing loadSalesData function (lines $start_line to $end_line)..."
    head -n $((start_line-1)) src/renderer.js > src/renderer.js.new
    cat fix-sales-data.js >> src/renderer.js.new
    tail -n +$((end_line+1)) src/renderer.js >> src/renderer.js.new
    mv src/renderer.js.new src/renderer.js
    
    echo "Function replaced successfully!"
  else
    echo "Could not determine start line of loadSalesData function."
    echo "Adding the fixed function to the end of the file..."
    cat fix-sales-data.js >> src/renderer.js
  fi
else
  echo "loadSalesData function not found in renderer.js."
  echo "Adding the fixed function to the end of the file..."
  cat fix-sales-data.js >> src/renderer.js
fi

# Add missing functions to renderer.js if needed
echo "Checking for missing functions in renderer.js..."
missing_functions=0

# Check for key functions
for func in "loadInventoryData" "loadCustomersData" "updateDashboardData" "viewInvoice" "printInvoice" "deleteInvoice"; do
  if ! grep -q "function $func" src/renderer.js; then
    missing_functions=1
    echo "Function $func is missing."
  fi
done

if [ $missing_functions -eq 1 ]; then
  echo "Adding missing functions to renderer.js..."
  cat missing-functions.js >> src/renderer.js
  echo "Missing functions added!"
fi

# Add IPC handlers to main.js if needed
echo "Checking for IPC handlers in main.js..."
if ! grep -q "ipcMain.handle('get-invoices'" main.js; then
  echo "Adding IPC handlers to main.js..."
  cat fix-ipc-handlers.js >> main.js
  echo "IPC handlers added!"
fi

# Clean up downloaded files
echo "Cleaning up..."
rm -f fix-sales-data.js fix-ipc-handlers.js missing-functions.js

echo "All fixes applied! Please restart your application."
echo "If you encounter any issues, you can restore the backups from the 'backups' directory."
echo ""
echo "Additional debugging tips:"
echo "1. Check the console for error messages (Cmd+Option+I on Mac, Ctrl+Shift+I on Windows/Linux)"
echo "2. If you see 'invoices.forEach is not a function', it means the get-invoices IPC handler is not returning an array"
echo "3. Try adding some sample data to your database to test the functionality"
echo ""
echo "Good luck!"