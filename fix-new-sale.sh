#!/bin/bash

# Script to fix New Sale functionality
echo "Starting New Sale fix script..."

# Navigate to the project directory
cd /Users/dineshkumargopalakrishnan/RetailApp

# Create a backup of the current renderer.js file
echo "Creating backup of renderer.js..."
cp src/renderer.js src/renderer.js.bak.$(date +%Y%m%d%H%M%S)

# Download the fixed functions
echo "Downloading fixed functions..."
curl -o fix-new-sale.js https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/fix-new-sale.js

# Create a temporary file to help with replacements
echo "Creating temporary file for replacements..."
cat > temp_functions.txt << 'EOL'
getNextInvoiceNumber
openNewSaleModal
loadCustomersForDropdown
openAddItemModal
loadProductsForDropdown
updateProductPrice
loadInventoryData
loadCustomersData
EOL

# Replace each function in renderer.js
echo "Replacing functions in renderer.js..."
while read -r func_name; do
  echo "Processing function: $func_name"
  
  # Extract the function from fix-new-sale.js
  func_content=$(sed -n "/function $func_name(/,/^}/p" fix-new-sale.js)
  
  if [ -z "$func_content" ]; then
    echo "Warning: Could not extract function $func_name from fix-new-sale.js"
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

# Clean up temporary files
echo "Cleaning up..."
rm -f temp_functions.txt temp_func.js fix-new-sale.js

echo "Fix complete! Please restart your application."
echo "If you encounter any issues, you can restore the backup from src/renderer.js.bak.*"