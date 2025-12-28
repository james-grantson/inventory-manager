// ===========================================
// Inventory Stock Manager - COMPLETE VERSION
// Compatible with UUID IDs and all schema fields
// ===========================================

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();

// Railway-friendly database connection
async function connectDatabase() {
    try {
        await prisma.$connect();
        console.log(" Database connected successfully");
        return true;
    } catch (error) {
        console.error(" Database connection failed:", error.message);
        console.log(" This might be normal during initial Railway setup");
        console.log(" Railway will set up the database automatically");
        return false;
    }
}
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ===========================================
// ROOT ROUTE - Serve the dashboard
// ===========================================

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
}); // Serve from root directory

// Allowed categories for your business
const ALLOWED_CATEGORIES = [
    'Automobile Lubricants',
    'Automobile Parts',
    'Building Materials',
    'Other'
];

// ===========================================
// HELPER: Add profit calculation to products
// ===========================================

function addProfitCalculation(product) {
    const cost = product.cost || 0;
    const price = product.price || 0;
    const profit = price - cost;
    
    return {
        ...product,
        profitPerItem: profit,
        profitMargin: cost > 0 ? ((profit / cost) * 100).toFixed(1) : null,
        totalProfit: profit * product.quantity,
        isLowStock: product.quantity <= product.minStock
    };
}

// ===========================================
// API ENDPOINTS
// ===========================================

// 1. HEALTH CHECK
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        time: new Date().toISOString(),
        database: 'PostgreSQL with Prisma',
        idType: 'UUID',
        currency: 'Ghana Cedis (â‚µ)'
    });
});

// 2. GET ALL PRODUCTS (WITH PROFIT CALCULATION)
app.get('/api/products', async (req, res) => {
    try {
        console.log('ðŸ“¦ Fetching all products...');
        const products = await prisma.product.findMany({
            orderBy: [ { createdAt: "desc" } ]
        });
        
        // Add profit calculation to all products
        const productsWithProfit = products.map(product => addProfitCalculation(product));
        
        console.log(`âœ… Retrieved ${products.length} products`);
        res.json(productsWithProfit);
    } catch (error) {
        console.error('âŒ Error fetching products:', error);
        res.status(500).json({ 
            error: 'Failed to fetch products',
            details: error.message 
        });
    }
});

// 3. GET SINGLE PRODUCT (UUID)
app.get('/api/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log(`ðŸ” Fetching product ID: ${id}`);
        
        const product = await prisma.product.findUnique({
            where: { id }
        });
        
        if (!product) {
            console.log(`âŒ Product ${id} not found`);
            return res.status(404).json({ error: 'Product not found' });
        }
        
        console.log(`âœ… Found product: ${product.name}`);
        const productWithProfit = addProfitCalculation(product);
        res.json(productWithProfit);
        
    } catch (error) {
        console.error(`âŒ Error fetching product ${req.params.id}:`, error);
        res.status(500).json({ 
            error: 'Failed to fetch product',
            details: error.message 
        });
    }
});

// 4. CREATE PRODUCT
app.post('/api/products', async (req, res) => {
    try {
        console.log('ðŸ†• Creating new product...');
        
        const { 
            name, 
            sku, 
            description, 
            price, 
            quantity, 
            category,
            cost,
            supplier,
            location,
            minStock
        } = req.body;
        
        // Basic validation
        if (!name || !name.trim()) {
            return res.status(400).json({ 
                error: 'Product name is required' 
            });
        }
        
        if (!category || !category.trim()) {
            return res.status(400).json({ 
                error: 'Category is required' 
            });
        }
        
        if (!ALLOWED_CATEGORIES.includes(category)) {
            return res.status(400).json({ 
                error: 'Invalid category',
                message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`
            });
        }
        
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum < 0) {
            return res.status(400).json({ 
                error: 'Price must be a positive number' 
            });
        }
        
        const quantityNum = parseInt(quantity);
        if (isNaN(quantityNum) || quantityNum < 0) {
            return res.status(400).json({ 
                error: 'Quantity must be a non-negative integer' 
            });
        }
        
        // Create the product
        const product = await prisma.product.create({
            data: {
                name: name.trim(),
                sku: sku ? sku.trim() : null,
                description: description ? description.trim() : null,
                price: priceNum,
                quantity: quantityNum,
                category: category.trim(),
                cost: cost ? parseFloat(cost) : null,
                supplier: supplier ? supplier.trim() : null,
                location: location ? location.trim() : null,
                minStock: minStock ? parseInt(minStock) : 10
            }
        });
        
        console.log('====================================');
        console.log('âœ… PRODUCT CREATED SUCCESSFULLY');
        console.log(`ID: ${product.id} (UUID)`);
        console.log(`Name: ${product.name}`);
        console.log(`Price: â‚µ${product.price}`);
        console.log(`Cost: ${product.cost ? 'â‚µ' + product.cost : 'Not set'}`);
        console.log(`Quantity: ${product.quantity}`);
        console.log(`Min Stock: ${product.minStock}`);
        console.log('====================================');
        
        const productWithProfit = addProfitCalculation(product);
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: productWithProfit
        });
        
    } catch (error) {
        console.error('âŒ ERROR CREATING PRODUCT:', error);
        
        if (error.code === 'P2002') {
            return res.status(400).json({ 
                error: 'Duplicate SKU',
                message: 'This SKU already exists. Please use a different SKU.'
            });
        }
        
        if (error.code === 'P2003') {
            return res.status(400).json({ 
                error: 'Database constraint failed',
                message: 'Please check your input data'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to create product',
            details: error.message
        });
    }
});

// 5. UPDATE PRODUCT (FIXED FOR PARTIAL UPDATES)
app.put('/api/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log(`âœï¸ Updating product ID: ${id}`);
        
        // Get existing product first
        const existingProduct = await prisma.product.findUnique({
            where: { id }
        });
        
        if (!existingProduct) {
            console.log(`âŒ Product ${id} not found`);
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const { 
            name, 
            sku, 
            description, 
            price, 
            quantity, 
            category,
            cost,
            supplier,
            location,
            minStock
        } = req.body;
        
        // Prepare update data (use existing values if not provided)
        const updateData = {};
        
        // Only include fields that were actually provided
        if (name !== undefined) updateData.name = name.trim();
        if (sku !== undefined) updateData.sku = sku ? sku.trim() : null;
        if (description !== undefined) updateData.description = description ? description.trim() : null;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (quantity !== undefined) updateData.quantity = parseInt(quantity);
        if (category !== undefined) updateData.category = category.trim();
        if (cost !== undefined) updateData.cost = cost ? parseFloat(cost) : null;
        if (supplier !== undefined) updateData.supplier = supplier ? supplier.trim() : null;
        if (location !== undefined) updateData.location = location ? location.trim() : null;
        if (minStock !== undefined) updateData.minStock = parseInt(minStock);
        
        // Validate the merged data
        const validationErrors = [];
        
        if (updateData.name !== undefined && (!updateData.name || updateData.name.trim().length === 0)) {
            validationErrors.push('Product name cannot be empty');
        }
        
        if (updateData.category !== undefined) {
            if (!updateData.category || updateData.category.trim().length === 0) {
                validationErrors.push('Category cannot be empty');
            } else if (!ALLOWED_CATEGORIES.includes(updateData.category)) {
                validationErrors.push(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`);
            }
        }
        
        if (updateData.price !== undefined && (isNaN(updateData.price) || updateData.price < 0)) {
            validationErrors.push('Price must be a positive number');
        }
        
        if (updateData.quantity !== undefined && (isNaN(updateData.quantity) || updateData.quantity < 0)) {
            validationErrors.push('Quantity must be a non-negative integer');
        }
        
        if (validationErrors.length > 0) {
            console.log('âŒ Validation failed:', validationErrors);
            return res.status(400).json({
                error: 'Validation failed',
                messages: validationErrors
            });
        }
        
        // Update the product
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: updateData
        });
        
        console.log(`âœ… Product updated: ${updatedProduct.name}`);
        
        // Add profit calculation
        const costValue = updatedProduct.cost || 0;
        const priceValue = updatedProduct.price || 0;
        const profit = priceValue - costValue;
        
        const productWithProfit = {
            ...updatedProduct,
            profitPerItem: profit,
            profitMargin: costValue > 0 ? ((profit / costValue) * 100).toFixed(1) : null,
            totalProfit: profit * updatedProduct.quantity,
            isLowStock: updatedProduct.quantity <= updatedProduct.minStock
        };
        
        res.json({
            success: true,
            message: 'Product updated successfully',
            product: productWithProfit
        });
        
    } catch (error) {
        console.error(`âŒ Error updating product ${req.params.id}:`, error);
        
        if (error.code === 'P2025') {
            res.status(404).json({ error: 'Product not found' });
        } else if (error.code === 'P2002') {
            res.status(400).json({ 
                error: 'Duplicate SKU',
                message: 'This SKU already exists for another product'
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to update product',
                details: error.message 
            });
        }
    }
});

// 6. DELETE PRODUCT
app.delete('/api/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log(`ðŸ—‘ï¸ Deleting product ID: ${id}`);
        
        const product = await prisma.product.delete({
            where: { id }
        });
        
        console.log(`âœ… Product deleted: ${product.name}`);
        res.json({ 
            success: true,
            message: 'Product deleted successfully',
            deletedProduct: product
        });
        
    } catch (error) {
        console.error(`âŒ Error deleting product ${req.params.id}:`, error);
        if (error.code === 'P2025') {
            res.status(404).json({ error: 'Product not found' });
        } else {
            res.status(500).json({ 
                error: 'Failed to delete product',
                details: error.message 
            });
        }
    }
});

// 7. GET CATEGORIES
app.get('/api/categories', (req, res) => {
    res.json({
        categories: ALLOWED_CATEGORIES,
        count: ALLOWED_CATEGORIES.length
    });
});

// 8. GET LOW STOCK ALERTS
app.get('/api/alerts/low-stock', async (req, res) => {
    try {
        console.log('ðŸš¨ Checking low stock alerts...');
        
        const lowStockProducts = await prisma.product.findMany({
            where: {
                quantity: {
                    lte: prisma.product.fields.minStock
                }
            },
            orderBy: [ { quantity: "asc" } ]
        });
        
        // Add profit calculation to alerts
        const alertsWithProfit = lowStockProducts.map(product => addProfitCalculation(product));
        
        console.log(`âœ… Found ${alertsWithProfit.length} low stock products`);
        res.json({
            count: alertsWithProfit.length,
            alerts: alertsWithProfit,
            timestamp: new Date().toISOString(),
            message: alertsWithProfit.length > 0 ? 
                `Found ${alertsWithProfit.length} products with low stock` :
                'All products have sufficient stock'
        });
        
    } catch (error) {
        console.error('âŒ Error checking low stock alerts:', error);
        res.status(500).json({ 
            error: 'Failed to check low stock alerts',
            details: error.message 
        });
    }
});

// 9. GET INVENTORY SUMMARY
app.get('/api/inventory/summary', async (req, res) => {
    try {
        console.log('ðŸ“Š Generating inventory summary...');
        
        const products = await prisma.product.findMany();
        
        let totalValue = 0;
        let totalCost = 0;
        let totalItems = 0;
        let lowStockCount = 0;
        const categorySummary = {};
        
        products.forEach(product => {
            const productValue = (product.price || 0) * product.quantity;
            const productCost = (product.cost || 0) * product.quantity;
            
            totalValue += productValue;
            totalCost += productCost;
            totalItems += product.quantity;
            
            if (product.quantity <= product.minStock) {
                lowStockCount++;
            }
            
            // Category breakdown
            const category = product.category || 'Uncategorized';
            if (!categorySummary[category]) {
                categorySummary[category] = {
                    count: 0,
                    totalValue: 0,
                    totalItems: 0,
                    totalCost: 0
                };
            }
            categorySummary[category].count++;
            categorySummary[category].totalValue += productValue;
            categorySummary[category].totalItems += product.quantity;
            categorySummary[category].totalCost += productCost;
        });
        
        const totalProfit = totalValue - totalCost;
        const profitMargin = totalValue > 0 ? (totalProfit / totalValue) * 100 : 0;
        const averageProfitPerItem = totalItems > 0 ? totalProfit / totalItems : 0;
        
        res.json({
            summary: {
                totalProducts: products.length,
                totalItems,
                totalValue: parseFloat(totalValue.toFixed(2)),
                totalCost: parseFloat(totalCost.toFixed(2)),
                totalProfit: parseFloat(totalProfit.toFixed(2)),
                profitMargin: parseFloat(profitMargin.toFixed(1)),
                averageProfitPerItem: parseFloat(averageProfitPerItem.toFixed(2)),
                lowStockCount,
                currency: 'GHS (â‚µ)'
            },
            categories: categorySummary,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('âŒ Error generating inventory summary:', error);
        res.status(500).json({ 
            error: 'Failed to generate inventory summary',
            details: error.message 
        });
    }
});

// 10. SEARCH PRODUCTS
app.get('/api/products/search/:query', async (req, res) => {
    try {
        const query = req.params.query;
        console.log(`ðŸ”Ž Searching for: ${query}`);
        
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { sku: { contains: query, mode: 'insensitive' } },
                    { category: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { supplier: { contains: query, mode: 'insensitive' } },
                    { location: { contains: query, mode: 'insensitive' } }
                ]
            },
            orderBy: [ { name: "asc" } ]
        });
        
        // Add profit calculation to search results
        const productsWithProfit = products.map(product => addProfitCalculation(product));
        
        console.log(`âœ… Found ${products.length} products matching "${query}"`);
        res.json(productsWithProfit);
        
    } catch (error) {
        console.error(`âŒ Error searching for ${req.params.query}:`, error);
        res.status(500).json({ 
            error: 'Failed to search products',
            details: error.message 
        });
    }
});

// 11. GET PRODUCTS BY CATEGORY
app.get('/api/products/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        console.log(`ðŸ“‚ Fetching products for category: ${category}`);
        
        const products = await prisma.product.findMany({
            where: { 
                category: {
                    equals: category,
                    mode: 'insensitive'
                }
            },
            orderBy: [ { name: "asc" } ]
        });
        
        // Add profit calculation
        const productsWithProfit = products.map(product => addProfitCalculation(product));
        
        console.log(`âœ… Found ${products.length} products in category "${category}"`);
        res.json(productsWithProfit);
        
    } catch (error) {
        console.error(`âŒ Error fetching products for category ${req.params.category}:`, error);
        res.status(500).json({ 
            error: 'Failed to fetch products by category',
            details: error.message 
        });
    }
});

// ===========================================
// ERROR HANDLING

// ==================== NEW ENHANCED ENDPOINTS ====================

// Get profit by category for chart (NEW ENDPOINT)
app.get('/api/inventory/profit-by-category', async (req, res) => {
    try {
        console.log(' Generating profit by category data...');
        
        const products = await prisma.product.findMany();
        
        const profitByCategory = {};
        
        products.forEach(product => {
            const category = product.category || 'Uncategorized';
            const profit = ((product.price || 0) - (product.cost || 0)) * product.quantity;
            
            if (!profitByCategory[category]) {
                profitByCategory[category] = {
                    category,
                    totalProfit: 0,
                    productCount: 0,
                    totalValue: 0,
                    totalItems: 0
                };
            }
            
            profitByCategory[category].totalProfit += profit;
            profitByCategory[category].productCount += 1;
            profitByCategory[category].totalValue += (product.price || 0) * product.quantity;
            profitByCategory[category].totalItems += product.quantity;
        });
        
        const result = Object.values(profitByCategory)
            .sort((a, b) => b.totalProfit - a.totalProfit);
        
        console.log(` Generated profit data for ${result.length} categories`);
        res.json(result);
        
    } catch (error) {
        console.error(' Error generating profit by category:', error);
        res.status(500).json({ 
            error: 'Failed to get profit data',
            details: error.message 
        });
    }
});

// Get suppliers list for filter (NEW ENDPOINT)
app.get('/api/inventory/suppliers', async (req, res) => {
    try {
        console.log(' Fetching suppliers list...');
        
        const products = await prisma.product.findMany();
        
        // Extract unique suppliers
        const suppliersMap = {};
        products.forEach(product => {
            if (product.supplier) {
                if (!suppliersMap[product.supplier]) {
                    suppliersMap[product.supplier] = {
                        name: product.supplier,
                        count: 0,
                        productCount: 0
                    };
                }
                suppliersMap[product.supplier].count++;
                suppliersMap[product.supplier].productCount += product.quantity;
            }
        });
        
        const suppliers = Object.values(suppliersMap)
            .sort((a, b) => b.count - a.count);
        
        console.log(` Found ${suppliers.length} suppliers`);
        res.json(suppliers);
        
    } catch (error) {
        console.error(' Error fetching suppliers:', error);
        res.status(500).json({ 
            error: 'Failed to fetch suppliers',
            details: error.message 
        });
    }
});

// Bulk update endpoint (NEW ENDPOINT)
app.post('/api/products/bulk-update', async (req, res) => {
    try {
        const { productIds, updates } = req.body;
        console.log(` Bulk updating ${productIds?.length || 0} products...`);
        
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ error: 'No product IDs provided' });
        }
        
        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({ error: 'No updates provided' });
        }
        
        // Validate updates
        const validFields = ['price', 'cost', 'quantity', 'minStock', 'category', 'supplier', 'location'];
        const updateData = {};
        
        Object.keys(updates).forEach(key => {
            if (validFields.includes(key)) {
                updateData[key] = updates[key];
            }
        });
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        
        // Update products
        const result = await prisma.product.updateMany({
            where: {
                id: {
                    in: productIds
                }
            },
            data: updateData
        });
        
        console.log(` Bulk updated ${result.count} products`);
        res.json({
            success: true,
            message: `Successfully updated ${result.count} products`,
            count: result.count,
            updatedFields: Object.keys(updateData)
        });
        
    } catch (error) {
        console.error(' Error in bulk update:', error);
        res.status(500).json({ 
            error: 'Failed to perform bulk update',
            details: error.message 
        });
    }
});

// Export data endpoint (NEW ENDPOINT)
app.get('/api/inventory/export', async (req, res) => {
    try {
        console.log(' Generating export data...');
        
        const products = await prisma.product.findMany({
            orderBy: [ { name: "asc" } ]
        });
        
        // Format for export
        const exportData = products.map(product => {
            const profit = ((product.price || 0) - (product.cost || 0)) * product.quantity;
            const profitMargin = product.cost > 0 ? 
                (((product.price || 0) - product.cost) / product.cost * 100).toFixed(2) : 
                null;
            
            return {
                id: product.id,
                name: product.name,
                sku: product.sku || '',
                description: product.description || '',
                category: product.category || '',
                quantity: product.quantity,
                price: product.price,
                cost: product.cost || 0,
                supplier: product.supplier || '',
                location: product.location || '',
                minStock: product.minStock,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
                profit: profit,
                profitMargin: profitMargin,
                totalValue: (product.price || 0) * product.quantity,
                stockStatus: product.quantity === 0 ? 'Out of Stock' : 
                            product.quantity <= product.minStock ? 'Low Stock' : 'Adequate'
            };
        });
        
        console.log(` Generated export data for ${exportData.length} products`);
        res.json({
            success: true,
            count: exportData.length,
            timestamp: new Date().toISOString(),
            data: exportData
        });
        
    } catch (error) {
        console.error(' Error generating export:', error);
        res.status(500).json({ 
            error: 'Failed to generate export data',
            details: error.message 
        });
    }
});

// ==================== END OF NEW ENDPOINTS ====================
// ==================== ENHANCED FEATURES ENDPOINTS ====================

// Get profit by category for chart
app.get('/api/inventory/profit-by-category', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        
        const profitByCategory = {};
        
        products.forEach(product => {
            const category = product.category || 'Uncategorized';
            const profit = ((product.price || 0) - (product.cost || 0)) * product.quantity;
            
            if (!profitByCategory[category]) {
                profitByCategory[category] = {
                    category,
                    totalProfit: 0,
                    productCount: 0
                };
            }
            
            profitByCategory[category].totalProfit += profit;
            profitByCategory[category].productCount += 1;
        });
        
        const result = Object.values(profitByCategory)
            .sort((a, b) => b.totalProfit - a.totalProfit);
        
        res.json(result);
    } catch (error) {
        console.error('Profit by category error:', error);
        res.status(500).json({ error: 'Failed to get profit data' });
    }
});

// ==================== END OF ENHANCED ENDPOINTS ====================
// ==================== ENHANCED FEATURES ENDPOINTS ====================

// Get profit by category for chart
app.get('/api/inventory/profit-by-category', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        
        const profitByCategory = {};
        
        products.forEach(product => {
            const category = product.category || 'Uncategorized';
            const profit = ((product.price || 0) - (product.cost || 0)) * product.quantity;
            
            if (!profitByCategory[category]) {
                profitByCategory[category] = {
                    category,
                    totalProfit: 0,
                    productCount: 0
                };
            }
            
            profitByCategory[category].totalProfit += profit;
            profitByCategory[category].productCount += 1;
        });
        
        const result = Object.values(profitByCategory)
            .sort((a, b) => b.totalProfit - a.totalProfit);
        
        res.json(result);
    } catch (error) {
        console.error('Profit by category error:', error);
        res.status(500).json({ error: 'Failed to get profit data' });
    }
});

// ==================== END OF ENHANCED ENDPOINTS ====================
// ==================== COMPLETE PDF REPORT SYSTEM ====================

// Helper function to format currency
function formatCurrency(amount) {
    return `${parseFloat(amount || 0).toFixed(2)}`;
}

// Helper function to format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-GH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Generate comprehensive inventory PDF report
app.get('/api/reports/pdf/inventory', async (req, res) => {
    try {
        console.log(' Generating comprehensive inventory PDF report...');
        
        const PDFDocument = require('pdfkit');
        const products = await prisma.product.findMany({
            orderBy: [ { category: "asc" }, { name: "asc" } ]
        });
        
        // Calculate totals
        let totalValue = 0;
        let totalCost = 0;
        let totalItems = 0;
        let lowStockCount = 0;
        const categorySummary = {};
        
        products.forEach(product => {
            const value = (product.price || 0) * product.quantity;
            const cost = (product.cost || 0) * product.quantity;
            
            totalValue += value;
            totalCost += cost;
            totalItems += product.quantity;
            
            if (product.quantity <= product.minStock) {
                lowStockCount++;
            }
            
            // Category summary
            const category = product.category || 'Uncategorized';
            if (!categorySummary[category]) {
                categorySummary[category] = {
                    count: 0,
                    totalValue: 0,
                    totalItems: 0,
                    products: []
                };
            }
            categorySummary[category].count++;
            categorySummary[category].totalValue += value;
            categorySummary[category].totalItems += product.quantity;
            categorySummary[category].products.push(product);
        });
        
        const totalProfit = totalValue - totalCost;
        const profitMargin = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
        
        // Create PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: 'Inventory Report',
                Author: 'Inventory Manager',
                Subject: 'Complete Inventory Analysis',
                Keywords: 'inventory, report, stock, business, ghana'
            }
        });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="inventory-report-${new Date().toISOString().split('T')[0]}.pdf"`);
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // ========== COVER PAGE ==========
        // Logo/Header
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor('#0d6efd')
           .text('INVENTORY MANAGEMENT SYSTEM', 50, 50, { align: 'center' });
        
        doc.fontSize(18)
           .fillColor('#333')
           .text('COMPREHENSIVE INVENTORY REPORT', 50, 90, { align: 'center' });
        
        // Report details
        doc.fontSize(12)
           .font('Helvetica')
           .text(`Generated: ${formatDate(new Date())}`, 50, 150, { align: 'center' });
        
        // Summary box
        doc.rect(50, 180, 500, 100)
           .fillColor('#f8f9fa')
           .fill()
           .strokeColor('#dee2e6')
           .stroke();
        
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#212529')
           .text('QUICK SUMMARY', 60, 190);
        
        doc.fontSize(11)
           .font('Helvetica')
           .text(`Total Products: ${products.length}`, 60, 215)
           .text(`Total Items in Stock: ${totalItems}`, 60, 235)
           .text(`Total Inventory Value: ${formatCurrency(totalValue)}`, 60, 255)
           .text(`Low Stock Items: ${lowStockCount}`, 300, 215)
           .text(`Total Profit: ${formatCurrency(totalProfit)}`, 300, 235)
           .text(`Profit Margin: ${profitMargin.toFixed(1)}%`, 300, 255);
        
        // Footer on cover page
        doc.fontSize(10)
           .fillColor('#6c757d')
           .text('Ghana Cedis () Currency Used Throughout', 50, 300, { align: 'center' });
        
        doc.addPage();
        
        // ========== DETAILED PRODUCT LIST ==========
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#212529')
           .text('DETAILED PRODUCT INVENTORY', 50, 50);
        
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#6c757d')
           .text('Showing all products with profit calculations', 50, 75);
        
        let yPosition = 100;
        
        Object.entries(categorySummary).forEach(([category, data]) => {
            // Category header
            if (yPosition > 650) {
                doc.addPage();
                yPosition = 50;
            }
            
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#0d6efd')
               .text(category.toUpperCase(), 50, yPosition);
            
            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#6c757d')
               .text(`${data.count} products  ${data.totalItems} items  ${formatCurrency(data.totalValue)} value`, 
                     50, yPosition + 15);
            
            yPosition += 40;
            
            // Category table header
            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor('#495057')
               .text('Product Name', 50, yPosition)
               .text('Qty', 250, yPosition)
               .text('Price', 300, yPosition)
               .text('Cost', 350, yPosition)
               .text('Profit', 400, yPosition)
               .text('Value', 450, yPosition);
            
            // Draw header line
            doc.moveTo(50, yPosition + 5)
               .lineTo(550, yPosition + 5)
               .strokeColor('#adb5bd')
               .lineWidth(0.5)
               .stroke();
            
            yPosition += 15;
            
            // Category products
            data.products.forEach(product => {
                if (yPosition > 700) {
                    doc.addPage();
                    yPosition = 50;
                    
                    // Repeat category header on new page
                    doc.fontSize(14)
                       .font('Helvetica-Bold')
                       .fillColor('#0d6efd')
                       .text(category.toUpperCase(), 50, yPosition);
                    
                    yPosition += 40;
                    
                    // Repeat table header
                    doc.fontSize(9)
                       .font('Helvetica-Bold')
                       .fillColor('#495057')
                       .text('Product Name', 50, yPosition)
                       .text('Qty', 250, yPosition)
                       .text('Price', 300, yPosition)
                       .text('Cost', 350, yPosition)
                       .text('Profit', 400, yPosition)
                       .text('Value', 450, yPosition);
                    
                    doc.moveTo(50, yPosition + 5)
                       .lineTo(550, yPosition + 5)
                       .strokeColor('#adb5bd')
                       .lineWidth(0.5)
                       .stroke();
                    
                    yPosition += 15;
                }
                
                const productValue = (product.price || 0) * product.quantity;
                const productCost = (product.cost || 0) * product.quantity;
                const productProfit = productValue - productCost;
                const isLowStock = product.quantity <= product.minStock;
                
                // Product row
                doc.fontSize(9)
                   .font('Helvetica')
                   .fillColor(isLowStock ? '#dc3545' : '#212529')
                   .text(product.name.substring(0, 30), 50, yPosition)
                   .text(product.quantity.toString(), 250, yPosition)
                   .text(formatCurrency(product.price), 300, yPosition)
                   .text(formatCurrency(product.cost), 350, yPosition)
                   .text(formatCurrency(productProfit), 400, yPosition)
                   .text(formatCurrency(productValue), 450, yPosition);
                
                // Low stock indicator
                if (isLowStock) {
                    doc.circle(530, yPosition + 4, 3)
                       .fillColor('#dc3545')
                       .fill();
                }
                
                yPosition += 20;
            });
            
            // Add spacing between categories
            yPosition += 30;
        });
        
        // ========== SUMMARY PAGE ==========
        doc.addPage();
        
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#212529')
           .text('INVENTORY ANALYSIS & RECOMMENDATIONS', 50, 50);
        
        // Summary table
        const summaryData = [
            ['Metric', 'Value', 'Status'],
            ['Total Products', products.length, products.length > 0 ? 'Good' : 'No Products'],
            ['Total Inventory Value', formatCurrency(totalValue), totalValue > 0 ? 'Good' : 'No Value'],
            ['Average Profit Margin', `${profitMargin.toFixed(1)}%`, profitMargin > 20 ? 'Excellent' : 'Needs Improvement'],
            ['Low Stock Items', lowStockCount, lowStockCount === 0 ? 'Good' : 'Attention Needed'],
            ['Stock Turnover', `${(totalItems / products.length).toFixed(1)}`, 'Healthy'],
            ['Total Profit', formatCurrency(totalProfit), totalProfit > 0 ? 'Profitable' : 'Loss']
        ];
        
        yPosition = 100;
        summaryData.forEach((row, index) => {
            doc.fontSize(10)
               .font(index === 0 ? 'Helvetica-Bold' : 'Helvetica')
               .fillColor(index === 0 ? '#0d6efd' : '#212529')
               .text(row[0], 50, yPosition)
               .text(row[1], 250, yPosition)
               .text(row[2], 400, yPosition);
            
            yPosition += 20;
            
            if (index === 0) {
                doc.moveTo(50, yPosition - 5)
                   .lineTo(550, yPosition - 5)
                   .strokeColor('#0d6efd')
                   .stroke();
            }
        });
        
        // Recommendations section
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#198754')
           .text('RECOMMENDED ACTIONS:', 50, 250);
        
        const recommendations = [
            lowStockCount > 0 ? ` Reorder ${lowStockCount} low stock items` : ' All stock levels are adequate',
            profitMargin < 20 ? ' Consider adjusting prices to improve profit margins' : ' Profit margins are healthy',
            totalItems > 100 ? ' Good inventory turnover rate' : ' Consider increasing stock variety',
            ' Regular inventory audits recommended',
            ' Consider barcode implementation for faster tracking'
        ];
        
        yPosition = 280;
        recommendations.forEach(rec => {
            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#495057')
               .text(rec, 60, yPosition);
            yPosition += 20;
        });
        
        // Final page footer
        doc.fontSize(8)
           .fillColor('#6c757d')
           .text('Generated by Inventory Management System  Ghana Business Focused  Report ID: ' + 
                 Date.now().toString(36).toUpperCase(), 
                 50, 800, { align: 'center' });
        
        // Finalize PDF
        doc.end();
        
        console.log(` PDF report generated successfully with ${products.length} products`);
        
    } catch (error) {
        console.error(' Error generating PDF report:', error);
        res.status(500).json({ 
            error: 'Failed to generate PDF report',
            details: error.message 
        });
    }
});

// Generate quick summary PDF (one page)
app.get('/api/reports/pdf/summary', async (req, res) => {
    try {
        console.log(' Generating quick summary PDF...');
        
        const PDFDocument = require('pdfkit');
        const summaryResponse = await prisma.product.aggregate({
            _count: { id: true },
            _sum: { quantity: true },
            _avg: { price: true }
        });
        
        const lowStockCount = await prisma.product.count({
            where: { quantity: { lte: prisma.product.fields.minStock } }
        });
        
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="inventory-summary.pdf"');
        
        doc.pipe(res);
        
        // Simple one-page summary
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .text('INVENTORY SNAPSHOT', 50, 50);
        
        doc.fontSize(12)
           .font('Helvetica')
           .text(formatDate(new Date()), 50, 85);
        
        // Stats in boxes
        const stats = [
            { label: 'Total Products', value: summaryResponse._count.id, color: '#0d6efd' },
            { label: 'Total Items', value: summaryResponse._sum.quantity, color: '#198754' },
            { label: 'Avg Price', value: formatCurrency(summaryResponse._avg.price), color: '#6c757d' },
            { label: 'Low Stock', value: lowStockCount, color: lowStockCount > 0 ? '#dc3545' : '#ffc107' }
        ];
        
        let x = 50, y = 120;
        stats.forEach((stat, index) => {
            doc.roundedRect(x, y, 120, 80, 5)
               .fillColor(stat.color + '20') // Light background
               .fill()
               .strokeColor(stat.color)
               .stroke();
            
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor(stat.color)
               .text(stat.label, x + 10, y + 15);
            
            doc.fontSize(24)
               .font('Helvetica-Bold')
               .fillColor('#212529')
               .text(stat.value.toString(), x + 10, y + 40);
            
            x += 130;
            if (index === 1) {
                x = 50;
                y += 100;
            }
        });
        
        // Recent activity section
        const recentProducts = await prisma.product.findMany({
            orderBy: [ { updatedAt: "desc" } ],
            take: 5
        });
        
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('RECENTLY UPDATED PRODUCTS', 50, 320);
        
        y = 350;
        recentProducts.forEach(product => {
            doc.fontSize(10)
               .font('Helvetica')
               .text(product.name, 50, y)
               .text(formatCurrency(product.price), 250, y)
               .text(`${product.quantity} units`, 350, y)
               .text(formatDate(product.updatedAt), 420, y);
            
            y += 20;
        });
        
        doc.end();
        
    } catch (error) {
        console.error(' Error generating summary PDF:', error);
        res.status(500).json({ error: 'Failed to generate summary PDF' });
    }
});

// Generate product label PDF
app.get('/api/reports/pdf/label/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id }
        });
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({
            size: [288, 144], // 4x2 inches at 72 DPI
            margin: 10,
            info: {
                Title: `Label - ${product.name}`,
                Author: 'Inventory Manager'
            }
        });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="label-${product.name.replace(/[^a-z0-9]/gi, '-')}.pdf"`);
        
        doc.pipe(res);
        
        // Label border
        doc.rect(5, 5, 278, 134)
           .strokeColor('#000')
           .lineWidth(1)
           .stroke();
        
        // Company logo/name
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#0d6efd')
           .text('INVENTORY MANAGER', 15, 15);
        
        // Product name (truncate if too long)
        const productName = product.name.length > 30 ? product.name.substring(0, 27) + '...' : product.name;
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#000')
           .text(productName, 15, 30, { width: 180 });
        
        // SKU/Barcode value
        const barcodeValue = product.sku || product.id.substring(0, 8).toUpperCase();
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#666')
           .text(`SKU: ${barcodeValue}`, 15, 55);
        
        // Price (big and bold)
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor('#198754')
           .text(formatCurrency(product.price), 15, 70);
        
        // Quantity and location
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#666')
           .text(`Qty: ${product.quantity}`, 15, 100)
           .text(`Min: ${product.minStock}`, 80, 100);
        
        if (product.location) {
            doc.text(`Loc: ${product.location}`, 140, 100);
        }
        
        // Simple barcode representation
        doc.rect(180, 30, 90, 50)
           .strokeColor('#ccc')
           .stroke();
        
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#999')
           .text(barcodeValue, 185, 45);
        
        // Barcode lines (simple representation)
        for (let i = 0; i < 10; i++) {
            const height = 15 + Math.random() * 20;
            doc.rect(185 + (i * 8), 55, 6, height)
               .fillColor('#000')
               .fill();
        }
        
        // Footer text
        doc.fontSize(6)
           .fillColor('#999')
           .text('Scan for details  Ghana Cedis ()', 15, 120);
        
        doc.end();
        
    } catch (error) {
        console.error(' Error generating label:', error);
        res.status(500).json({ error: 'Failed to generate label' });
    }
});

// ==================== END OF PDF REPORT SYSTEM ====================// ===========================================

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `Route ${req.method} ${req.originalUrl} does not exist`
    });
});

// Handle other errors
app.use((err, req, res, next) => {
    console.error('ðŸ”¥ Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong on our end'
    });
});

// ===========================================
// Start server with Railway support
async function startServer() {
    console.log("============================================================");
    console.log(" INVENTORY STOCK MANAGER - Railway Edition");
    console.log("============================================================");
    
    // Try to connect to database (will retry on Railway)
    const dbConnected = await connectDatabase();
    
    if (!dbConnected) {
        console.log("  Starting without database connection...");
        console.log(" Railway will provide database automatically");
    }
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(` Server running: http://localhost:${PORT}`);
        console.log(` Frontend: http://localhost:${PORT}/index.html`);
        console.log(` API Health: http://localhost:${PORT}/api/health`);
        console.log("============================================================");
        console.log(" Ready for Railway deployment!");
        console.log("============================================================");
    });
}

startServer().catch(console.error);
// ===========================================

app.listen(PORT, async () => {
    console.log('='.repeat(60));
    console.log('ðŸš€ INVENTORY STOCK MANAGER SERVER');
    console.log('='.repeat(60));
    console.log(`âœ… Server running: http://localhost:${PORT}`);
    console.log(`ðŸ“ Frontend: http://localhost:${PORT}/index.html`);
    console.log(`ðŸ“Š API Health: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(60));
    console.log('ðŸ“ AVAILABLE ENDPOINTS:');
    console.log('  GET    /api/health                    - Health check');
    console.log('  GET    /api/products                  - List all products');
    console.log('  GET    /api/products/:id              - Get single product');
    console.log('  POST   /api/products                  - Create product');
    console.log('  PUT    /api/products/:id              - Update product');
    console.log('  DELETE /api/products/:id              - Delete product');
    console.log('  GET    /api/categories                - List categories');
    console.log('  GET    /api/alerts/low-stock          - Low stock alerts');
    console.log('  GET    /api/inventory/summary         - Inventory summary');
    console.log('  GET    /api/products/search/:query    - Search products');
    console.log('  GET    /api/products/category/:category - Filter by category');
    console.log('='.repeat(60));
    console.log('ðŸ’° FEATURES:');
    console.log('  â€¢ Profit calculation (per item & total)');
    console.log('  â€¢ Profit margin percentage');
    console.log('  â€¢ Low stock detection');
    console.log('  â€¢ UUID product IDs');
    console.log('  â€¢ All schema fields supported');
    console.log('  â€¢ Partial updates allowed');
    console.log('='.repeat(60));
    
    // Check database connection
    try {
        await prisma.$connect();
        console.log('âœ… Database connection established');
    } catch (error) {
        console.error('âŒ Database connection failed:', error);
    }
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});








