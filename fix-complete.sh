#!/bin/bash

# Complete fix script for Rural Hardware Store app
echo "Starting complete fix script..."

# Navigate to the project directory
cd /Users/dineshkumargopalakrishnan/RetailApp

# Create backups of important files
echo "Creating backups of important files..."
mkdir -p backups
cp src/renderer.js backups/renderer.js.bak.$(date +%Y%m%d%H%M%S)
cp main.js backups/main.js.bak.$(date +%Y%m%d%H%M%S)
cp src/database/db.js backups/db.js.bak.$(date +%Y%m%d%H%M%S)

# Download all the fix scripts
echo "Downloading fix scripts..."
curl -o diagnose-db.js https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/diagnose-db.js
curl -o fix-remaining-issues.js https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/fix-remaining-issues.js
curl -o fix-ipc-main.js https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/fix-ipc-main.js
curl -o add-sample-data.js https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/add-sample-data.js

# Step 1: Fix IPC handlers in main.js
echo "Fixing IPC handlers in main.js..."
if ! grep -q "ipcMain.handle('get-customers'" main.js; then
  echo "Adding customer IPC handlers to main.js..."
  cat fix-ipc-main.js >> main.js
  echo "IPC handlers added!"
else
  echo "IPC handlers already exist in main.js."
fi

# Step 2: Fix renderer.js functions
echo "Fixing renderer.js functions..."

# Create a temporary file with the list of functions to fix
cat > temp_functions.txt << 'EOL'
fetchCustomers
fetchProducts
setupQuickActionButtons
openAddItemModal
updateProductPrice
updateItemTotal
getNextInvoiceNumber
openNewSaleModal
loadCustomersForDropdown
loadSalesData
loadInventoryData
loadCustomersData
EOL

# Replace each function in renderer.js
while read -r func_name; do
  echo "Processing function: $func_name"
  
  # Try to extract the function from fix-remaining-issues.js first
  func_content=$(sed -n "/function $func_name(/,/^}/p" fix-remaining-issues.js)
  
  # If not found, try other fix files
  if [ -z "$func_content" ]; then
    func_content=$(sed -n "/function $func_name(/,/^}/p" fix-sales-data.js 2>/dev/null)
  fi
  
  if [ -z "$func_content" ]; then
    func_content=$(sed -n "/function $func_name(/,/^}/p" fix-new-sale.js 2>/dev/null)
  fi
  
  if [ -z "$func_content" ]; then
    echo "Warning: Could not extract function $func_name from fix files"
    continue
  fi
  
  # Check if the function exists in renderer.js
  if grep -q "function $func_name(" src/renderer.js; then
    echo "Function $func_name exists in renderer.js, replacing it..."
    
    # Create a temporary file with the function content
    echo "$func_content" > temp_func.js
    
    # Get the line numbers for the function in renderer.js
    start_line=$(grep -n "function $func_name(" src/renderer.js | cut -d: -f1)
    
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
      echo "Replacing function $func_name (lines $start_line to $end_line)..."
      head -n $((start_line-1)) src/renderer.js > src/renderer.js.new
      cat temp_func.js >> src/renderer.js.new
      tail -n +$((end_line+1)) src/renderer.js >> src/renderer.js.new
      mv src/renderer.js.new src/renderer.js
    else
      echo "Could not determine start line of function $func_name."
    fi
  else
    echo "Function $func_name does not exist in renderer.js, adding it..."
    echo "$func_content" >> src/renderer.js
  fi
done < temp_functions.txt

# Step 3: Run the database diagnosis script
echo "Running database diagnosis script..."
node diagnose-db.js

# Step 4: Ask if user wants to add sample data
echo "Would you like to add sample data to the database? (y/n)"
read -r add_sample_data

if [ "$add_sample_data" = "y" ]; then
  echo "Adding sample data to the database..."
  node add-sample-data.js
fi

# Clean up downloaded files
echo "Cleaning up..."
rm -f temp_functions.txt temp_func.js

echo "All fixes applied! Please restart your application."
echo ""
echo "Here's what was fixed:"
echo "1. Added proper IPC handlers to main.js"
echo "2. Fixed renderer.js functions for handling customers, products, and sales"
echo "3. Improved error handling and data type checking"
echo "4. Added sample data to the database (if you chose to)"
echo ""
echo "If you encounter any issues, you can restore the backups from the 'backups' directory."
echo ""
echo "Additional debugging tips:"
echo "1. Check the console for error messages (Cmd+Option+I on Mac, Ctrl+Shift+I on Windows/Linux)"
echo "2. If you still see errors, try running the diagnose-db.js script again to check if the database has been populated"
echo "3. Make sure your database.js file has all the necessary functions implemented"
echo ""
echo "Good luck!"