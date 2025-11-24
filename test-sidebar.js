// Simple test script to verify sidebar functionality
// This can be run in the browser console to test the sidebar

console.log('Testing sidebar functionality...');

// Test 1: Check if toggleSidebar function exists
if (typeof window !== 'undefined') {
    // Check if sidebar elements are present
    const sidebar = document.querySelector('[data-sidebar]');
    const sidebarTrigger = document.querySelector('[data-sidebar="trigger"]');
    const sidebarCollapseButton = document.querySelector('button[aria-label="Toggle sidebar"]');
    
    console.log('Sidebar element found:', !!sidebar);
    console.log('Sidebar trigger found:', !!sidebarTrigger);
    console.log('Sidebar collapse button found:', !!sidebarCollapseButton);
    
    // Test 2: Check keyboard navigation
    const navLinks = document.querySelectorAll('a[href], button[tabindex="0"]');
    console.log('Navigable elements found:', navLinks.length);
    
    // Test 3: Check if navigation links have proper attributes
    navLinks.forEach((link, index) => {
        const hasTabIndex = link.hasAttribute('tabindex');
        const hasAriaLabel = link.hasAttribute('aria-label') || link.textContent.trim();
        console.log(`Link ${index + 1}: ${link.textContent.trim()}, tabIndex: ${hasTabIndex}, accessible: ${hasAriaLabel}`);
    });
    
    console.log('Sidebar test completed. Check the results above.');
} else {
    console.log('This test must be run in a browser environment.');
}
