// ===========================================
// Inventory Stock Manager - COMPLETE VERSION
// WITH IMAGE UPLOAD SUPPORT
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

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for images
app.use(express.static('.'));

// ===========================================
// ROOT ROUTE - Serve the dashboard
// ===========================================

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

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
        isLowStock: product.quantity <= product.minstock
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
        currency: 'Ghana Cedis (GH₵)',
        features: ['image_upload', 'profit_calculation', 'low_stock_alerts']
    });
});

// 2. GET ALL PRODUCTS (WITH PROFIT CALCULATION)
app.get('/api/products', async (req, res) => {
    try {
        console.log('📦 Fetching all products...');
        const products = await prisma.product.findMany({
            orderBy: { createdAt: "desc" }
        });
        
        // Add profit calculation to all products
        const productsWithProfit = products.map(product => addProfitCalculation(product));
        
        console.log(`✅ Retrieved ${products.length} products`);
        res.json({
            success: true,
            products: productsWithProfit,
            count: products.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        res.status(500).json({ 
            error: 'Failed to fetch products',
            details: error.message 
        });
    }
});

// 3. GET SINGLE PRODUCT
app.get('/api/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log(` Fetching product ID: ${id}`);
        
        const product = await prisma.product.findUnique({
            where: { id }
        });
        
        if (!product) {
            console.log(` Product ${id} not found`);
            return res.status(404).json({ error: 'Product not found' });
        }
        
        console.log(` Found product: ${product.name}`);
        const productWithProfit = addProfitCalculation(product);
        res.json(productWithProfit);
        
    } catch (error) {
        console.error(` Error fetching product ${req.params.id}:`, error);
        res.status(500).json({ 
            error: 'Failed to fetch product',
            details: error.message 
        });
    }
});

// 4. CREATE PRODUCT (WITH IMAGE_URL SUPPORT)
app.post('/api/products', async (req, res) => {
    try {
        console.log(' Creating new product...');
        
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
            minstock,
            image_url  // ADDED: image_url support
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
        
        // Create the product with all fields including image_url
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
                minstock: minstock ? parseInt(minstock) : 10,
                image_url: image_url || null  // ADDED: Save image_url
            }
        });
        
        console.log('====================================');
        console.log(' PRODUCT CREATED SUCCESSFULLY');
        console.log(`ID: ${product.id}`);
        console.log(`Name: ${product.name}`);
        console.log(`Price: GH${product.price}`);
        console.log(`Cost: ${product.cost ? 'GH' + product.cost : 'Not set'}`);
        console.log(`Quantity: ${product.quantity}`);
        console.log(`Min Stock: ${product.minstock}`);
        console.log(`Image URL: ${product.image_url || 'None'}`);
        console.log('====================================');
        
        const productWithProfit = addProfitCalculation(product);
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: productWithProfit
        });
        
    } catch (error) {
        console.error(' ERROR CREATING PRODUCT:', error);
        
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

// 5. UPDATE PRODUCT (WITH IMAGE_URL SUPPORT)
app.put('/api/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log(` Updating product ID: ${id}`);
        
        // Get existing product first
        const existingProduct = await prisma.product.findUnique({
            where: { id }
        });
        
        if (!existingProduct) {
            console.log(` Product ${id} not found`);
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
            minstock,
            image_url  // ADDED: image_url support
        } = req.body;
        
        // Prepare update data (use existing values if not provided)
        const updateData = {};
        
        if (name !== undefined) updateData.name = name.trim();
        if (sku !== undefined) updateData.sku = sku ? sku.trim() : null;
        if (description !== undefined) updateData.description = description ? description.trim() : null;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (quantity !== undefined) updateData.quantity = parseInt(quantity);
        if (category !== undefined) updateData.category = category.trim();
        if (cost !== undefined) updateData.cost = cost ? parseFloat(cost) : null;
        if (supplier !== undefined) updateData.supplier = supplier ? supplier.trim() : null;
        if (location !== undefined) updateData.location = location ? location.trim() : null;
        if (minstock !== undefined) updateData.minstock = parseInt(minstock);
        if (image_url !== undefined) updateData.image_url = image_url || null;  // ADDED
        
        // Update the product
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: updateData
        });
        
        console.log(` Product updated: ${updatedProduct.name}`);
        console.log(`Image URL: ${updatedProduct.image_url || 'None'}`);
        
        const productWithProfit = addProfitCalculation(updatedProduct);
        
        res.json({
            success: true,
            message: 'Product updated successfully',
            product: productWithProfit
        });
        
    } catch (error) {
        console.error(` Error updating product ${req.params.id}:`, error);
        
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
        console.log(` Deleting product ID: ${id}`);
        
        const product = await prisma.product.delete({
            where: { id }
        });
        
        console.log(` Product deleted: ${product.name}`);
        res.json({ 
            success: true,
            message: 'Product deleted successfully',
            deletedProduct: product
        });
        
    } catch (error) {
        console.error(` Error deleting product ${req.params.id}:`, error);
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

// ... rest of your endpoints remain the same ...

// ===========================================
// Start server
// ===========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log('='.repeat(60));
    console.log(' INVENTORY STOCK MANAGER SERVER');
    console.log('='.repeat(60));
    console.log(` Server running: http://localhost:${PORT}`);
    console.log(` Frontend: http://localhost:${PORT}/index.html`);
    console.log(` API Health: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(60));
    console.log(' AVAILABLE ENDPOINTS:');
    console.log('  GET    /api/health                    - Health check');
    console.log('  GET    /api/products                  - List all products');
    console.log('  GET    /api/products/:id              - Get single product');
    console.log('  POST   /api/products                  - Create product (with image)');
    console.log('  PUT    /api/products/:id              - Update product (with image)');
    console.log('  DELETE /api/products/:id              - Delete product');
    console.log('='.repeat(60));
    console.log('💰 FEATURES:');
    console.log('  • Profit calculation (per item & total)');
    console.log('  • Profit margin percentage');
    console.log('  • Low stock detection');
    console.log('  • UUID product IDs');
    console.log('  • Image upload support');  // ADDED
    console.log('='.repeat(60));
    
    // Check database connection
    try {
        await prisma.$connect();
        console.log('✅ Database connection established');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
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
