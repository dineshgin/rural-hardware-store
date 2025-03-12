// Bootstrap Diagnostic Script
// Run this in the developer console to diagnose Bootstrap issues

(function() {
  console.log('Running Bootstrap diagnostic...');
  
  // Check if Bootstrap is loaded
  const bootstrapLoaded = typeof bootstrap !== 'undefined';
  console.log('Bootstrap loaded:', bootstrapLoaded);
  
  if (bootstrapLoaded) {
    console.log('Bootstrap version:', bootstrap.Modal.VERSION);
  } else {
    console.error('Bootstrap is not loaded! Check your script includes.');
    
    // Check if the script tag exists
    const scriptTags = document.querySelectorAll('script');
    let bootstrapScriptFound = false;
    
    scriptTags.forEach(script => {
      if (script.src.includes('bootstrap')) {
        console.log('Found Bootstrap script:', script.src);
        bootstrapScriptFound = true;
      }
    });
    
    if (!bootstrapScriptFound) {
      console.error('No Bootstrap script tag found in the document!');
    }
    
    return;
  }
  
  // Check for modal elements
  const modalElements = document.querySelectorAll('.modal');
  console.log(`Found ${modalElements.length} modal elements`);
  
  modalElements.forEach((modal, index) => {
    console.log(`Modal #${index}:`, {
      id: modal.id,
      classes: modal.className,
      attributes: Array.from(modal.attributes).map(attr => `${attr.name}="${attr.value}"`).join(', ')
    });
  });
  
  // Test creating a modal instance
  if (modalElements.length > 0) {
    try {
      const testModal = new bootstrap.Modal(modalElements[0]);
      console.log('Successfully created a test modal instance:', testModal);
    } catch (error) {
      console.error('Error creating modal instance:', error);
    }
  }
  
  // Check for event listeners on the test button
  const testButton = document.getElementById('test-bootstrap-modal');
  if (testButton) {
    console.log('Found test button:', testButton);
    
    // We can't directly access event listeners, but we can test by triggering a click
    console.log('Simulating click on test button...');
    
    // Create a new click event
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    // Log what happens when we dispatch the event
    console.log('Event dispatched, check for errors in the console');
    testButton.dispatchEvent(clickEvent);
  } else {
    console.error('Test button not found!');
  }
  
  // Check for circular references that might cause stack overflow
  console.log('Checking for potential circular references...');
  
  // Look for common patterns that might cause recursion
  const potentialIssues = [];
  
  // Check if any modal has itself as a parent
  modalElements.forEach(modal => {
    if (modal.contains(modal)) {
      potentialIssues.push(`Modal ${modal.id} contains itself as a child (circular DOM reference)`);
    }
  });
  
  // Check window and document for circular references to bootstrap
  if (window.bootstrap === bootstrap) {
    console.log('Normal: window.bootstrap references bootstrap');
  }
  
  if (potentialIssues.length > 0) {
    console.error('Potential issues found:');
    potentialIssues.forEach(issue => console.error('- ' + issue));
  } else {
    console.log('No obvious circular references found');
  }
  
  console.log('Bootstrap diagnostic complete');
})();