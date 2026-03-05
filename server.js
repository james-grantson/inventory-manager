// ===========================================
// INVENTORY MANAGER - COMPLETE BACKEND
// WITH FULL CRUD OPERATIONS AND SUPABASE
// ===========================================

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://uqisohfzdoxmhsdxzcrg.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_O3BPZNAcNG3hojR3Gsk9iQ_73yCbPmn';
const supabase = createClient(supabaseUrl, supabaseKey);

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// Generate a simple ID for products
function generateProductId() {
    return `prod-${Date.now().toString().slice(-6)}`;
}

// ===========================================
// HEALTH CHECK
// ===========================================
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        database: 'Supabase'
    });
});

// ===========================================
// GET ALL PRODUCTS
// ===========================================
app.get('/api/products', async (req, res) => {
    try {
        console.log(' Fetching all products...');
        
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log(` Retrieved ${products.length} products`);
        
        res.json({
            success: true,
            products: products,
            count: products.length,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error(' Error fetching products:', error);
        res.status(500).json({ 
            error: 'Failed to fetch products',
            details: error.message 
        });
    }
});

// ===========================================
// GET SINGLE PRODUCT
// ===========================================
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(` Fetching product: ${id}`);
        
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Product not found' });
            }
            throw error;
        }
        
        console.log(` Found product: ${product.name}`);
        
        res.json({
            success: true,
            product: product
        });
        
    } catch (error) {
        console.error(' Error fetching product:', error);
        res.status(500).json({ 
            error: 'Failed to fetch product',
            details: error.message 
        });
    }
});

// ===========================================
// CREATE PRODUCT
// ===========================================
app.post('/api/products', async (req, res) => {
    try {
        console.log(' Creating new product...');
        
        const { 
            name, 
            sku, 
            description, 
            category,
            price, 
            cost, 
            quantity, 
            minstock,
            supplier,
            location,
            image_url
        } = req.body;
        
        // Validate required fields
        if (!name || !category || !price || !cost || !quantity) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['name', 'category', 'price', 'cost', 'quantity']
            });
        }
        
        const productData = {
            id: generateProductId(),
            name: name,
            sku: sku || `${category.substring(0,3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
            description: description || '',
            category: category,
            price: parseFloat(price),
            cost: parseFloat(cost),
            quantity: parseInt(quantity),
            minstock: parseInt(minstock) || 10,
            supplier: supplier || '',
            location: location || '',
            image_url: image_url || null,
            created_at: new Date().toISOString()
        };
        
        console.log('Inserting product:', productData);
        
        const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select();
        
        if (error) throw error;
        
        console.log(' Product created successfully:', data[0].id);
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: data[0]
        });
        
    } catch (error) {
        console.error(' Error creating product:', error);
        res.status(500).json({ 
            error: 'Failed to create product',
            details: error.message 
        });
    }
});

// ===========================================
// UPDATE PRODUCT
// ===========================================
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`✏️ Updating product: ${id}`);
        
        const { 
            name, 
            sku, 
            description, 
            category,
            price, 
            cost, 
            quantity, 
            minstock,
            supplier,
            location,
            image_url
        } = req.body;
        
        // Check if product exists
        const { data: existing, error: checkError } = await supabase
            .from('products')
            .select('id')
            .eq('id', id)
            .single();
        
        if (checkError || !existing) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Prepare update data
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (sku !== undefined) updateData.sku = sku;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (cost !== undefined) updateData.cost = parseFloat(cost);
        if (quantity !== undefined) updateData.quantity = parseInt(quantity);
        if (minstock !== undefined) updateData.minstock = parseInt(minstock);
        if (supplier !== undefined) updateData.supplier = supplier;
        if (location !== undefined) updateData.location = location;
        if (image_url !== undefined) updateData.image_url = image_url;
        
        updateData.updated_at = new Date().toISOString();
        
        console.log('Update data:', updateData);
        
        const { data, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        
        console.log(' Product updated successfully:', id);
        
        res.json({
            success: true,
            message: 'Product updated successfully',
            product: data[0]
        });
        
    } catch (error) {
        console.error(' Error updating product:', error);
        res.status(500).json({ 
            error: 'Failed to update product',
            details: error.message 
        });
    }
});

// ===========================================
// DELETE PRODUCT
// ===========================================
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(` Deleting product: ${id}`);
        
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        console.log(' Product deleted successfully:', id);
        
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        res.status(500).json({ 
            error: 'Failed to delete product',
            details: error.message 
        });
    }
});

// ===========================================
// GET PRODUCTS BY CATEGORY
// ===========================================
app.get('/api/products/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        console.log(` Fetching products in category: ${category}`);
        
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('category', category)
            .order('name');
        
        if (error) throw error;
        
        res.json({
            success: true,
            products: products,
            count: products.length
        });
        
    } catch (error) {
        console.error(' Error fetching by category:', error);
        res.status(500).json({ error: 'Failed to fetch products by category' });
    }
});

// ===========================================
// SEARCH PRODUCTS
// ===========================================
app.get('/api/products/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        console.log(` Searching for: ${query}`);
        
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .or(`name.ilike.%${query}%,sku.ilike.%${query}%,category.ilike.%${query}%`)
            .order('name');
        
        if (error) throw error;
        
        res.json({
            success: true,
            products: products,
            count: products.length
        });
        
    } catch (error) {
        console.error(' Error searching products:', error);
        res.status(500).json({ error: 'Failed to search products' });
    }
});

// ===========================================
// GET INVENTORY SUMMARY
// ===========================================
app.get('/api/inventory/summary', async (req, res) => {
    try {
        console.log(' Generating inventory summary...');
        
        const { data: products, error } = await supabase
            .from('products')
            .select('*');
        
        if (error) throw error;
        
        let totalValue = 0;
        let totalCost = 0;
        let totalItems = 0;
        let lowStockCount = 0;
        
        products.forEach(product => {
            totalValue += (product.price || 0) * product.quantity;
            totalCost += (product.cost || 0) * product.quantity;
            totalItems += product.quantity;
            if (product.quantity <= (product.minstock || 10)) {
                lowStockCount++;
            }
        });
        
        const totalProfit = totalValue - totalCost;
        const profitMargin = totalValue > 0 ? (totalProfit / totalValue) * 100 : 0;
        
        res.json({
            success: true,
            summary: {
                totalProducts: products.length,
                totalItems,
                totalValue,
                totalCost,
                totalProfit,
                profitMargin: profitMargin.toFixed(1),
                lowStockCount
            }
        });
        
    } catch (error) {
        console.error(' Error generating summary:', error);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
});

// ===========================================
// LOW STOCK ALERTS
// ===========================================
app.get('/api/alerts/low-stock', async (req, res) => {
    try {
        console.log(' Checking low stock alerts...');
        
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .lte('quantity', supabase.rpc('coalesce', { 'minstock', 10 }));
        
        if (error) throw error;
        
        res.json({
            success: true,
            alerts: products,
            count: products.length
        });
        
    } catch (error) {
        console.error(' Error checking low stock:', error);
        res.status(500).json({ error: 'Failed to check low stock' });
    }
});

// ===========================================
// 404 HANDLER
// ===========================================
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.url}`
    });
});

// ===========================================
// ERROR HANDLER
// ===========================================
app.use((err, req, res, next) => {
    console.error(' Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// ===========================================
// EXPORT FOR VERCEL
// ===========================================
module.exports = app;

// ===========================================
// LOCAL DEVELOPMENT SERVER
// ===========================================
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log('='.repeat(60));
        console.log(' INVENTORY MANAGER SERVER');
        console.log('='.repeat(60));
        console.log(` Server running: http://localhost:${PORT}`);
        console.log(` API Health: http://localhost:${PORT}/api/health`);
        console.log(` Products: http://localhost:${PORT}/api/products`);
        console.log('='.repeat(60));
    });
}
