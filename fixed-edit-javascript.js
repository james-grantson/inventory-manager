    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Global variables
        let currentProductData = {};
        let originalProductData = {};

        // Get URL parameters - FIXED VERSION
        function getUrlParameter(name) {
            name = name.replace(/[\[\]]/g, '\\$&');
            const url = window.location.href;
            const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
            const results = regex.exec(url);
            
            if (!results) {
                console.log('Parameter not found:', name, 'in URL:', url);
                return null;
            }
            if (!results[2]) {
                console.log('Parameter has no value:', name);
                return '';
            }
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        }

        // Alternative simple method
        function getProductIdFromUrl() {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            
            if (!id) {
                // Try alternative method
                const queryString = window.location.search;
                const urlParams = new URLSearchParams(queryString);
                return urlParams.get('id');
            }
            return id;
        }

        // Load product data - FIXED VERSION
        async function loadProductData() {
            // Try multiple methods to get product ID
            let productId = getUrlParameter('id');
            
            if (!productId) {
                productId = getProductIdFromUrl();
            }
            
            // Last resort: check URL directly
            if (!productId) {
                const url = window.location.href;
                const match = url.match(/[?&]id=([^&]+)/);
                if (match) {
                    productId = match[1];
                }
            }
            
            console.log('Extracted product ID:', productId);
            
            if (!productId || productId.trim() === '') {
                showError('No product ID specified in URL. Please go back to the dashboard and click "Edit" on a product.');
                showLoading(false);
                hideForm();
                return;
            }
            
            try {
                showLoading(true);
                hideError();
                hideForm();
                
                console.log('Fetching product data for ID:', productId);
                const response = await fetch(`/api/products/${productId}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Product not found. It may have been deleted.');
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const product = await response.json();
                console.log('Product data loaded:', product);
                
                currentProductData = product;
                originalProductData = JSON.parse(JSON.stringify(product));
                
                populateForm(product);
                updateCurrentProfit(product);
                showForm();
                showLoading(false);
                
            } catch (error) {
                console.error('Error loading product:', error);
                showError(`Failed to load product: ${error.message}`);
                showLoading(false);
            }
        }

        // Populate form with current data - FIXED to handle null values
        function populateForm(product) {
            // Set product ID
            document.getElementById('productId').value = product.id || '';
            document.getElementById('currentProductId').textContent = product.id || 'Unknown';
            
            // Current values - with null checks
            document.getElementById('currentName').textContent = product.name || 'Not set';
            document.getElementById('currentSKU').textContent = product.sku || 'Not set';
            document.getElementById('currentDescription').textContent = product.description || 'Not set';
            document.getElementById('currentCategory').textContent = product.category || 'Not set';
            document.getElementById('currentPrice').textContent = formatPrice(product.price || 0);
            document.getElementById('currentCost').textContent = product.cost ? formatPrice(product.cost) : 'Not set';
            document.getElementById('currentQuantity').textContent = product.quantity || 0;
            document.getElementById('currentMinStock').textContent = product.minStock || 10;
            document.getElementById('currentSupplier').textContent = product.supplier || 'Not set';
            document.getElementById('currentLocation').textContent = product.location || 'Not set';
            
            // Select current category
            if (product.category) {
                selectCategory(product.category, false);
            }
        }

        // Format price
        function formatPrice(price) {
            if (!price) return '0.00';
            return new Intl.NumberFormat('en-GH', {
                style: 'currency',
                currency: 'GHS',
                minimumFractionDigits: 2
            }).format(price);
        }

        // Category selection
        function selectCategory(category, showNotification = true) {
            // Remove selected class from all cards
            document.querySelectorAll('.category-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // Add selected class to clicked card
            const card = document.querySelector(`.category-card[data-category="${category}"]`);
            if (card) {
                card.classList.add('selected');
            } else {
                // If category doesn't match any card, select "Other"
                const otherCard = document.querySelector('.category-card[data-category="Other"]');
                if (otherCard) {
                    otherCard.classList.add('selected');
                }
            }
            
            if (showNotification) {
                showNotificationMessage(`Selected: ${category}`, 'info');
            }
        }

        // Calculate profit preview
        function calculateProfit() {
            const price = parseFloat(document.getElementById('productPrice').value) || currentProductData.price || 0;
            const cost = parseFloat(document.getElementById('productCost').value) || currentProductData.cost || 0;
            const quantity = parseInt(document.getElementById('productQuantity').value) || currentProductData.quantity || 0;
            
            if (cost > 0 && price > 0) {
                const profitPerItem = price - cost;
                const profitMargin = cost > 0 ? ((profitPerItem / cost) * 100) : 0;
                const totalProfit = profitPerItem * quantity;
                
                document.getElementById('profitPerItem').textContent = `${profitPerItem.toFixed(2)}`;
                document.getElementById('profitMargin').textContent = `${profitMargin.toFixed(1)}%`;
                document.getElementById('totalProfit').textContent = `${totalProfit.toFixed(2)}`;
                
                // Color code based on profit margin
                const marginElement = document.getElementById('profitMargin');
                if (profitMargin > 30) {
                    marginElement.className = 'profit-value text-success';
                } else if (profitMargin > 10) {
                    marginElement.className = 'profit-value text-warning';
                } else {
                    marginElement.className = 'profit-value text-danger';
                }
                
                document.getElementById('profitPreview').style.display = 'block';
            } else {
                document.getElementById('profitPreview').style.display = 'none';
            }
        }

        // Update current profit display
        function updateCurrentProfit(product) {
            const price = product.price || 0;
            const cost = product.cost || 0;
            const quantity = product.quantity || 0;
            
            if (cost > 0 && price > 0) {
                const profitPerItem = price - cost;
                const profitMargin = cost > 0 ? ((profitPerItem / cost) * 100) : 0;
                const totalProfit = profitPerItem * quantity;
                
                document.getElementById('currentProfitPerItem').textContent = `${profitPerItem.toFixed(2)}`;
                document.getElementById('currentProfitMargin').textContent = `${profitMargin.toFixed(1)}%`;
                document.getElementById('currentTotalProfit').textContent = `${totalProfit.toFixed(2)}`;
                
                // Color code based on profit margin
                const marginElement = document.getElementById('currentProfitMargin');
                if (profitMargin > 30) {
                    marginElement.className = 'profit-value text-success';
                } else if (profitMargin > 10) {
                    marginElement.className = 'profit-value text-warning';
                } else {
                    marginElement.className = 'profit-value text-danger';
                }
            }
        }

        // Show notification
        function showNotificationMessage(message, type = 'success') {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = `alert alert-${type} alert-dismissible fade show`;
            notification.style.display = 'block';
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }

        // Show loading state
        function showLoading(show) {
            document.getElementById('loading').style.display = show ? 'block' : 'none';
        }

        // Show form
        function showForm() {
            document.getElementById('formContainer').style.display = 'block';
        }

        // Hide form
        function hideForm() {
            document.getElementById('formContainer').style.display = 'none';
        }

        // Show error - FIXED to handle ternary operator
        function showError(message) {
            const errorElement = document.getElementById('errorDetails');
            if (errorElement) {
                errorElement.textContent = message;
            }
            document.getElementById('errorMessage').style.display = 'block';
            
            // Add a back button
            const errorDiv = document.getElementById('errorMessage');
            if (!errorDiv.querySelector('.back-button')) {
                const backButton = document.createElement('button');
                backButton.className = 'btn btn-outline-primary btn-sm mt-2 back-button';
                backButton.innerHTML = '<i class="fas fa-arrow-left me-1"></i> Back to Dashboard';
                backButton.onclick = function() {
                    window.location.href = 'index.html';
                };
                errorDiv.querySelector('.alert-heading').parentElement.appendChild(backButton);
            }
        }

        // Hide error
        function hideError() {
            document.getElementById('errorMessage').style.display = 'none';
        }

        // Reset form to original values
        function resetForm() {
            // Clear all input fields
            document.getElementById('productName').value = '';
            document.getElementById('productSKU').value = '';
            document.getElementById('productDescription').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productCost').value = '';
            document.getElementById('productQuantity').value = '';
            document.getElementById('productMinStock').value = '';
            document.getElementById('productSupplier').value = '';
            document.getElementById('productLocation').value = '';
            
            // Reset category selection
            document.querySelectorAll('.category-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // Hide profit preview
            document.getElementById('profitPreview').style.display = 'none';
            
            showNotificationMessage('All changes have been reset', 'info');
        }

        // Handle form submission for partial update
        document.getElementById('productForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const productId = document.getElementById('productId').value;
            
            if (!productId) {
                showNotificationMessage('Product ID is missing. Please reload the page.', 'danger');
                return;
            }
            
            const updateData = {};
            
            // Collect only fields that have been changed (non-empty)
            const fields = [
                { id: 'productName', name: 'name' },
                { id: 'productSKU', name: 'sku' },
                { id: 'productDescription', name: 'description' },
                { id: 'productPrice', name: 'price', type: 'number' },
                { id: 'productCost', name: 'cost', type: 'number' },
                { id: 'productQuantity', name: 'quantity', type: 'number' },
                { id: 'productMinStock', name: 'minStock', type: 'number' },
                { id: 'productSupplier', name: 'supplier' },
                { id: 'productLocation', name: 'location' }
            ];
            
            fields.forEach(field => {
                const element = document.getElementById(field.id);
                const value = element.value.trim();
                
                if (value !== '') {
                    if (field.type === 'number') {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                            updateData[field.name] = numValue;
                        }
                    } else {
                        updateData[field.name] = value;
                    }
                }
            });
            
            // Handle category (from selected card)
            const selectedCategoryCard = document.querySelector('.category-card.selected');
            if (selectedCategoryCard) {
                const selectedCategory = selectedCategoryCard.getAttribute('data-category');
                if (selectedCategory !== currentProductData.category) {
                    updateData.category = selectedCategory;
                }
            }
            
            // Validate update data
            if (Object.keys(updateData).length === 0) {
                showNotificationMessage('No changes detected. Please make changes before updating.', 'warning');
                return;
            }
            
            // Validate numeric fields
            if (updateData.price !== undefined && (isNaN(updateData.price) || updateData.price <= 0)) {
                showNotificationMessage('Please enter a valid selling price', 'danger');
                return;
            }
            
            if (updateData.cost !== undefined && (isNaN(updateData.cost) || updateData.cost < 0)) {
                showNotificationMessage('Please enter a valid cost price or leave empty', 'danger');
                return;
            }
            
            if (updateData.quantity !== undefined && (isNaN(updateData.quantity) || updateData.quantity < 0)) {
                showNotificationMessage('Please enter a valid quantity', 'danger');
                return;
            }
            
            if (updateData.minStock !== undefined && (isNaN(updateData.minStock) || updateData.minStock < 1)) {
                showNotificationMessage('Minimum stock must be at least 1', 'danger');
                return;
            }
            
            // Disable submit button
            const submitBtn = document.getElementById('submitBtn');
            const originalHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Updating...';
            submitBtn.disabled = true;
            
            try {
                // Use PATCH method for partial update
                const response = await fetch(`/api/products/${productId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    if (data.error === 'Duplicate SKU') {
                        throw new Error('This SKU already exists. Please use a different SKU.');
                    }
                    throw new Error(data.message || data.error || 'Failed to update product');
                }
                
                showNotificationMessage('Product updated successfully!', 'success');
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                
            } catch (error) {
                console.error('Error:', error);
                showNotificationMessage(error.message, 'danger');
                
                // Re-enable button
                submitBtn.innerHTML = originalHtml;
                submitBtn.disabled = false;
            }
        });

        // Input validation
        document.getElementById('productPrice').addEventListener('input', function(e) {
            let value = e.target.value;
            if (value.includes('-')) {
                e.target.value = value.replace('-', '');
            }
            calculateProfit();
        });

        document.getElementById('productCost').addEventListener('input', function(e) {
            let value = e.target.value;
            if (value.includes('-')) {
                e.target.value = value.replace('-', '');
            }
            calculateProfit();
        });

        document.getElementById('productQuantity').addEventListener('input', function(e) {
            let value = e.target.value;
            if (value.includes('-')) {
                e.target.value = value.replace('-', '');
            }
            calculateProfit();
        });

        document.getElementById('productMinStock').addEventListener('input', function(e) {
            let value = e.target.value;
            if (value.includes('-')) {
                e.target.value = value.replace('-', '');
            }
        });

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Page loaded, starting to load product data...');
            console.log('Current URL:', window.location.href);
            console.log('URL search:', window.location.search);
            
            // Debug: log all URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            console.log('URL parameters:');
            for (const [key, value] of urlParams) {
                console.log(`  ${key}: ${value}`);
            }
            
            loadProductData();
        });
    </script>
