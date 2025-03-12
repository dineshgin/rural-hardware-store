#!/bin/bash

# Script to fix Bootstrap integration issues
echo "Starting Bootstrap fix script..."

# Navigate to the project directory
cd /Users/dineshkumargopalakrishnan/RetailApp

# Ensure we have the latest Bootstrap
echo "Reinstalling Bootstrap..."
npm uninstall bootstrap
npm install bootstrap@5.3.0 --save

# Create a simple test file to verify Bootstrap is working
echo "Creating Bootstrap test file..."
cat > bootstrap-test.js << 'EOL'
// Simple script to test if Bootstrap is working
console.log('Testing Bootstrap integration...');

// Check if Bootstrap is available
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking Bootstrap...');
    
    if (typeof bootstrap === 'undefined') {
      console.error('Bootstrap is not defined. Make sure bootstrap.bundle.min.js is loaded correctly.');
    } else {
      console.log('Bootstrap is available:', bootstrap);
      console.log('Bootstrap version:', bootstrap.Modal.VERSION);
      
      // Test creating a modal
      try {
        const modalElement = document.getElementById('test-modal');
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          console.log('Modal instance created successfully:', modal);
        } else {
          console.error('Test modal element not found');
        }
      } catch (error) {
        console.error('Error creating modal:', error);
      }
    }
  });
}
EOL

# Update the index.html to properly load Bootstrap
echo "Updating index.html to properly load Bootstrap..."
cat > src/bootstrap-fix.js << 'EOL'
// Bootstrap initialization helper
window.initializeBootstrapModals = function() {
  console.log('Initializing Bootstrap modals...');
  
  // Check if Bootstrap is available
  if (typeof bootstrap === 'undefined') {
    console.error('Bootstrap is not defined. Make sure bootstrap.bundle.min.js is loaded correctly.');
    return false;
  }
  
  // Initialize all modals on the page
  const modalElements = document.querySelectorAll('.modal');
  console.log(`Found ${modalElements.length} modal elements`);
  
  modalElements.forEach((modalElement, index) => {
    try {
      // Create modal instance without options
      const modalInstance = new bootstrap.Modal(modalElement);
      console.log(`Modal #${index} (${modalElement.id}) initialized successfully`);
      
      // Store the instance on the element for easy access
      modalElement._bootstrapModal = modalInstance;
    } catch (error) {
      console.error(`Error initializing modal #${index} (${modalElement.id}):`, error);
    }
  });
  
  // Set up the test button
  const testButton = document.getElementById('test-bootstrap-modal');
  if (testButton) {
    testButton.addEventListener('click', function() {
      console.log('Test button clicked');
      try {
        const testModal = document.getElementById('test-modal');
        if (!testModal) {
          throw new Error('Test modal element not found');
        }
        
        if (testModal._bootstrapModal) {
          testModal._bootstrapModal.show();
          console.log('Test modal shown using stored instance');
        } else {
          const modal = new bootstrap.Modal(testModal);
          modal.show();
          console.log('Test modal shown using new instance');
        }
      } catch (error) {
        console.error('Error showing test modal:', error);
        alert('Error showing test modal: ' + error.message);
      }
    });
  }
  
  return true;
};

// Call this function when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    window.initializeBootstrapModals();
  }, 500); // Small delay to ensure everything is loaded
});
EOL

echo "Fix script completed. Please restart your application and try again."
echo "If issues persist, try opening the bootstrap-test.html file in a browser to test Bootstrap independently."