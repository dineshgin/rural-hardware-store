#!/bin/bash

# Script to fix Bootstrap by using CDN instead of local files
echo "Starting Bootstrap CDN fix script..."

# Navigate to the project directory
cd /Users/dineshkumargopalakrishnan/RetailApp

# Make sure Bootstrap is installed (even though we'll use CDN)
echo "Installing Bootstrap..."
npm install bootstrap@5.3.0 --save

# Create a simple test file to verify Bootstrap is working
echo "Creating Bootstrap test file..."
cat > bootstrap-cdn-test.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bootstrap CDN Test</title>
  <!-- Load Bootstrap CSS from CDN -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Bootstrap CDN Test</h1>
    <p>This page tests if Bootstrap can be loaded from CDN.</p>
    
    <button type="button" class="btn btn-primary" id="testButton">
      Launch test modal
    </button>
    
    <div class="modal fade" id="testModal" tabindex="-1" aria-labelledby="testModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="testModalLabel">Test Modal</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>If you can see this modal, Bootstrap is working correctly!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Load Bootstrap JS from CDN -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  
  <script>
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM loaded, Bootstrap version:', typeof bootstrap !== 'undefined' ? bootstrap.Modal.VERSION : 'not loaded');
      
      // Set up button click handler
      const button = document.getElementById('testButton');
      if (button) {
        button.addEventListener('click', function() {
          console.log('Test button clicked');
          try {
            const modalElement = document.getElementById('testModal');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            console.log('Modal shown successfully');
          } catch (error) {
            console.error('Error showing modal:', error);
            alert('Error: ' + error.message);
          }
        });
      }
    });
  </script>
</body>
</html>
EOL

echo "Fix script completed. Please restart your application and try again."
echo "You can also open bootstrap-cdn-test.html in a browser to test Bootstrap independently."