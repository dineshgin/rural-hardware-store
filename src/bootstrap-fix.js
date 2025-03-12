// Bootstrap initialization helper
console.log('Bootstrap fix script loaded');

// Simple function to check if Bootstrap is loaded
function isBootstrapLoaded() {
  return typeof bootstrap !== 'undefined';
}

// Function to safely show a modal
function safeShowModal(modalId) {
  console.log(`Attempting to show modal: ${modalId}`);
  
  if (!isBootstrapLoaded()) {
    console.error('Bootstrap is not loaded');
    alert('Error: Bootstrap is not loaded. Cannot show modal.');
    return false;
  }
  
  try {
    const modalElement = document.getElementById(modalId);
    if (!modalElement) {
      console.error(`Modal element not found: ${modalId}`);
      return false;
    }
    
    // Create a new modal instance each time (avoid storing references that might cause recursion)
    const modal = new bootstrap.Modal(modalElement, {
      backdrop: true,
      keyboard: true,
      focus: true
    });
    
    modal.show();
    console.log(`Modal ${modalId} shown successfully`);
    return true;
  } catch (error) {
    console.error(`Error showing modal ${modalId}:`, error);
    alert(`Error showing modal: ${error.message}`);
    return false;
  }
}

// Set up the test button when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded in bootstrap-fix.js');
  
  // Check Bootstrap
  if (isBootstrapLoaded()) {
    console.log('Bootstrap is loaded:', bootstrap.Modal.VERSION);
  } else {
    console.error('Bootstrap is not loaded!');
  }
  
  // Set up test button
  const testButton = document.getElementById('test-bootstrap-modal');
  if (testButton) {
    console.log('Found test button, setting up event listener');
    
    // Remove any existing event listeners to avoid duplicates
    const newButton = testButton.cloneNode(true);
    testButton.parentNode.replaceChild(newButton, testButton);
    
    // Add new event listener
    newButton.addEventListener('click', function(event) {
      console.log('Test button clicked');
      event.preventDefault();
      safeShowModal('test-modal');
    });
  } else {
    console.error('Test button not found');
  }
  
  // Override any existing modal functions to use our safe version
  window.showModal = safeShowModal;
});

// Export functions for use in other scripts
window.bootstrapFix = {
  isBootstrapLoaded,
  safeShowModal
};