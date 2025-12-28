// Replace the getUrlParameter function in your edit-product.html
// Find this function and replace it with:

function getUrlParameter(name) {
    // Simple method for PowerShell 5.1 compatibility
    const url = window.location.href;
    const nameEscaped = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + nameEscaped + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    
    if (!results) {
        console.error('Parameter not found:', name, 'in URL:', url);
        return null;
    }
    if (!results[2]) {
        console.error('Parameter has no value:', name);
        return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Also update the loadProductData function to add debugging:
async function loadProductData() {
    console.log('Current URL:', window.location.href);
    console.log('URL Search:', window.location.search);
    
    const productId = getUrlParameter('id');
    console.log('Extracted Product ID:', productId);
    
    if (!productId) {
        showError('No product ID found in URL. URL should be: edit-product.html?id=PRODUCT-ID');
        showLoading(false);
        return;
    }
    
    // ... rest of your code
}
