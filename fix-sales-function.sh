#!/bin/bash

# Script to fix the loadSalesData function in renderer.js
echo "Starting loadSalesData fix script..."

# Navigate to the project directory
cd /Users/dineshkumargopalakrishnan/RetailApp

# Create a backup of the current renderer.js file
echo "Creating backup of renderer.js..."
cp src/renderer.js src/renderer.js.bak

# Download the fixed loadSalesData function
echo "Downloading fixed loadSalesData function..."
curl -o fix-sales-data.js https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/fix-sales-data.js

# Create a temporary file with the fixed function
echo "Creating temporary file with fixed function..."
cat > temp_fix.js << 'EOL'
// Temporary file to help find and replace the loadSalesData function

// MARKER_START_LOAD_SALES_DATA
async function loadSalesData() {
EOL

# Find the loadSalesData function in renderer.js and replace it
echo "Finding and replacing loadSalesData function..."
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
    echo "Manual replacement required."
  fi
else
  echo "loadSalesData function not found in renderer.js."
  echo "Adding the fixed function to the end of the file..."
  cat fix-sales-data.js >> src/renderer.js
fi

# Clean up temporary files
echo "Cleaning up..."
rm -f temp_fix.js fix-sales-data.js

echo "Fix complete! Please restart your application."
echo "If you encounter any issues, you can restore the backup from src/renderer.js.bak"