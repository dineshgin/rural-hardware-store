#!/bin/bash

# Script to directly replace the sales page in the Rural Hardware Store application

# Set the project directory
PROJECT_DIR="/Users/dineshkumargopalakrishnan/RetailApp"

# Create backups directory if it doesn't exist
mkdir -p "$PROJECT_DIR/backups"

# Get current timestamp for backup files
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

echo "Creating backups of important files..."
cp "$PROJECT_DIR/src/index.html" "$PROJECT_DIR/backups/index.html.backup.$TIMESTAMP"
echo "Backups created in $PROJECT_DIR/backups/"

# Download the direct HTML fix
echo "Downloading direct HTML fix..."
curl -s -o "$PROJECT_DIR/direct-html-fix.html" https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/direct-html-fix.html
echo "Download complete."

# Create a script to replace the sales page
echo "Creating script to replace the sales page..."
cat > "$PROJECT_DIR/replace-sales-page.js" << 'EOF'
// Script to replace the sales page with the fixed version
document.addEventListener('DOMContentLoaded', function() {
  console.log('Replacing sales page with fixed version...');
  
  // Function to replace the sales page
  function replaceSalesPage() {
    // Load the fixed HTML
    fetch('./direct-html-fix.html')
      .then(response => response.text())
      .then(html => {
        // Parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Get the sales page content
        const fixedSalesPage = doc.getElementById('sales-page');
        
        if (fixedSalesPage) {
          // Find the existing sales page
          const existingSalesPage = document.getElementById('sales-page');
          
          if (existingSalesPage) {
            // Replace the existing sales page
            existingSalesPage.innerHTML = fixedSalesPage.innerHTML;
            console.log('Existing sales page replaced with fixed version');
          } else {
            console.error('Existing sales page not found');
          }
          
          // Add the modals to the body
          const modals = doc.querySelectorAll('.modal');
          modals.forEach(modal => {
            // Check if the modal already exists
            const existingModal = document.getElementById(modal.id);
            if (existingModal) {
              // Replace the existing modal
              existingModal.innerHTML = modal.innerHTML;
              console.log(`Existing modal ${modal.id} replaced with fixed version`);
            } else {
              // Add the modal to the body
              document.body.appendChild(modal.cloneNode(true));
              console.log(`Modal ${modal.id} added to the body`);
            }
          });
          
          // Add the script to the body
          const scripts = doc.querySelectorAll('script');
          scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            document.body.appendChild(newScript);
            console.log('Script added to the body');
          });
          
          console.log('Sales page replacement complete');
        } else {
          console.error('Fixed sales page not found in the HTML');
        }
      })
      .catch(error => {
        console.error('Error loading fixed HTML:', error);
      });
  }
  
  // Run the replacement function after a delay
  setTimeout(replaceSalesPage, 1000);
  
  // Also run when the sales button is clicked
  const salesButton = document.querySelector('[data-page="sales"]');
  if (salesButton) {
    salesButton.addEventListener('click', function() {
      setTimeout(replaceSalesPage, 500);
    });
    console.log('Event listener added to sales button');
  }
});
EOF

# Add the script to index.html
echo "Adding replace-sales-page.js to index.html..."
if ! grep -q "replace-sales-page.js" "$PROJECT_DIR/src/index.html"; then
  sed -i '' '/<\/head>/i\\
  <script src="../replace-sales-page.js"></script>\
' "$PROJECT_DIR/src/index.html"
fi

# Create a CSS file to ensure the sales page is visible
echo "Creating CSS fixes..."
mkdir -p "$PROJECT_DIR/src/styles"
cat > "$PROJECT_DIR/src/styles/direct-sales-fixes.css" << 'EOF'
/* Direct sales page fixes */

/* Make sure the sales page is visible */
#sales-page {
  display: block !important;
  padding: 20px !important;
  height: auto !important;
  min-height: 100% !important;
  overflow-y: visible !important;
}

/* Ensure the New Sale button is visible */
#new-sale-btn {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  margin-bottom: 20px !important;
  font-size: 1.25rem !important;
  padding: 0.5rem 1rem !important;
  background-color: #0d6efd !important;
  border-color: #0d6efd !important;
  color: white !important;
}

/* Fix for modals */
.modal {
  display: none;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  z-index: 1050 !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
  outline: 0 !important;
}

.modal.show {
  display: block !important;
}

.modal-dialog {
  position: relative !important;
  width: auto !important;
  margin: 1.75rem auto !important;
  pointer-events: auto !important;
}

.modal-content {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  width: 100% !important;
  pointer-events: auto !important;
  background-color: #fff !important;
  background-clip: padding-box !important;
  border: 1px solid rgba(0, 0, 0, 0.2) !important;
  border-radius: 0.3rem !important;
  outline: 0 !important;
}

/* Fix for input fields */
input[type="text"],
input[type="number"],
input[type="tel"],
input[type="email"],
input[type="date"],
textarea,
select {
  pointer-events: auto !important;
  background-color: #fff !important;
  opacity: 1 !important;
}

/* Fix for buttons */
.btn {
  pointer-events: auto !important;
  cursor: pointer !important;
}
EOF

# Add the CSS file to index.html
echo "Adding direct-sales-fixes.css to index.html..."
if ! grep -q "direct-sales-fixes.css" "$PROJECT_DIR/src/index.html"; then
  sed -i '' '/<\/head>/i\\
  <link rel="stylesheet" href="./styles/direct-sales-fixes.css">\
' "$PROJECT_DIR/src/index.html"
fi

# Copy the files to the project directory
cp "$PROJECT_DIR/replace-sales-page.js" "$PROJECT_DIR/replace-sales-page.js"

echo "Direct sales page replacement applied!"
echo ""
echo "Please restart your application with:"
echo "cd $PROJECT_DIR && npm start"
echo ""
echo "After restarting, you should see the New Sale button at the top of the sales page."
echo "If you encounter any issues, you can restore from the backups in $PROJECT_DIR/backups/"