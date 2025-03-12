#!/bin/bash

# Script to fix remaining issues and populate the database
echo "Starting fix and populate script..."

# Navigate to the project directory
cd /Users/dineshkumargopalakrishnan/RetailApp

# Create backups of important files
echo "Creating backups of important files..."
mkdir -p backups
cp src/renderer.js backups/renderer.js.bak.$(date +%Y%m%d%H%M%S)

# Download the scripts
echo "Downloading scripts..."
curl -o diagnose-db.js https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/diagnose-db.js
curl -o fix-remaining-issues.js https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/fix-remaining-issues.js
curl -o add-sample-data.js https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/add-sample-data.js

# Create a temporary file with the list of functions to fix
echo "Creating list of functions to fix..."
cat > temp_functions.txt << 'EOL'
fetchCustomers
fetchProducts
setupQuickActionButtons
openAddItemModal
updateProductPrice
updateItemTotal
EOL

# Replace each function in renderer.js
echo "Replacing functions in renderer.js..."
while read -r func_name; do
  echo "Processing function: $func_name"
  
  # Extract the function from fix-remaining-issues.js
  func_content=$(sed -n "/function $func_name(/,/^}/p" fix-remaining-issues.js)
  
  if [ -z "$func_content" ]; then
    echo "Warning: Could not extract function $func_name from fix-remaining-issues.js"
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

# Run the database diagnosis script
echo "Running database diagnosis script..."
node diagnose-db.js

# Ask if user wants to add sample data
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
echo "If you encounter any issues, you can restore the backups from the 'backups' directory."
echo ""
echo "Additional debugging tips:"
echo "1. Check the console for error messages (Cmd+Option+I on Mac, Ctrl+Shift+I on Windows/Linux)"
echo "2. If you still see errors, try running the diagnose-db.js script again to check if the database has been populated"
echo "3. Make sure your IPC handlers in main.js are correctly implemented"
echo ""
echo "Good luck!"