// js/dashboard.js - Simplified Dashboard (Works with existing endpoints)
class DashboardManager {
    constructor() {
        this.initDashboard();
    }
    
    async initDashboard() {
        await this.loadDashboardData();
        this.createInteractiveCards();
        this.initFilters();
    }
    
    async loadDashboardData() {
        try {
            const response = await fetch("/api/inventory/summary");
            if (!response.ok) throw new Error("Failed to load summary");
            const data = await response.json();
            
            // Your server returns: { summary: {...}, categories: {...} }
            const summary = data.summary || {};
            const categories = data.categories || {};
            
            this.updateDashboardCards(summary);
            this.updateFilterOptions(categories);
            
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        }
    }
    
    updateDashboardCards(summary) {
        const dashboardCards = document.getElementById("dashboardCards");
        if (!dashboardCards) return;
        
        const cardsHtml = `
            <div class="col-md-3 mb-3">
                <div class="card dashboard-card border-warning" data-filter='{"type":"stockStatus","value":"low"}'>
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle mb-2 text-muted">Low Stock</h6>
                                <h3 class="card-title text-warning">${summary.lowStockCount || 0}</h3>
                            </div>
                            <div class="text-warning">
                                <i class="fas fa-exclamation-triangle fa-2x"></i>
                            </div>
                        </div>
                        <small class="text-muted">Needs attention</small>
                    </div>
                </div>
            </div>
            
            <div class="col-md-3 mb-3">
                <div class="card dashboard-card border-primary">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle mb-2 text-muted">Total Value</h6>
                                <h3 class="card-title text-primary">${(summary.totalValue || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
                            </div>
                            <div class="text-primary">
                                <i class="fas fa-coins fa-2x"></i>
                            </div>
                        </div>
                        <small class="text-muted">Inventory worth</small>
                    </div>
                </div>
            </div>
            
            <div class="col-md-3 mb-3">
                <div class="card dashboard-card border-success">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle mb-2 text-muted">Profit Margin</h6>
                                <h3 class="card-title text-success">${(summary.profitMargin || 0).toFixed(1)}%</h3>
                            </div>
                            <div class="text-success">
                                <i class="fas fa-chart-line fa-2x"></i>
                            </div>
                        </div>
                        <small class="text-muted">Average profit</small>
                    </div>
                </div>
            </div>
            
            <div class="col-md-3 mb-3">
                <div class="card dashboard-card border-info">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle mb-2 text-muted">Total Products</h6>
                                <h3 class="card-title text-info">${summary.totalProducts || 0}</h3>
                            </div>
                            <div class="text-info">
                                <i class="fas fa-boxes fa-2x"></i>
                            </div>
                        </div>
                        <small class="text-muted">In inventory</small>
                    </div>
                </div>
            </div>
        `;
        
        dashboardCards.innerHTML = cardsHtml;
        this.makeCardsClickable();
    }
    
    makeCardsClickable() {
        document.querySelectorAll(".dashboard-card[data-filter]").forEach(card => {
            card.style.cursor = "pointer";
            card.addEventListener("click", (e) => {
                if (e.target.tagName === "A" || e.target.closest("a")) return;
                
                const filterData = JSON.parse(card.dataset.filter);
                this.applyCardFilter(filterData);
            });
        });
    }
    
    applyCardFilter(filterData) {
        if (window.inventoryFilters) {
            if (filterData.type === "stockStatus") {
                window.inventoryFilters.activeFilters.stockStatus = [filterData.value];
                document.getElementById("filterLow").checked = filterData.value === "low";
                document.getElementById("filterAdequate").checked = filterData.value === "adequate";
                document.getElementById("filterOut").checked = filterData.value === "out";
                window.inventoryFilters.applyFilters();
            }
        }
    }
    
    updateFilterOptions(categories) {
        // Update category filter dropdowns
        const categorySelect = document.getElementById("categorySelectFilter");
        const categoryMainFilter = document.getElementById("categoryFilter");
        
        if (categorySelect && categories) {
            let options = '<option value="">All Categories</option>';
            Object.keys(categories).forEach(catName => {
                const cat = categories[catName];
                options += `<option value="${catName}">${catName} (${cat.count || 0})</option>`;
            });
            categorySelect.innerHTML = options;
            
            if (categoryMainFilter) {
                categoryMainFilter.innerHTML = options;
            }
        }
    }
    
    initFilters() {
        // Load suppliers from products for supplier filter
        this.loadSuppliersForFilter();
    }
    
    async loadSuppliersForFilter() {
        try {
            const response = await fetch("/api/products");
            if (!response.ok) return;
            const products = await response.json();
            
            // Extract unique suppliers
            const suppliers = [...new Set(products.filter(p => p.supplier).map(p => p.supplier))];
            const supplierCounts = {};
            
            products.forEach(p => {
                if (p.supplier) {
                    supplierCounts[p.supplier] = (supplierCounts[p.supplier] || 0) + 1;
                }
            });
            
            // Update supplier filter dropdown
            const supplierSelect = document.getElementById("supplierSelectFilter");
            if (supplierSelect && suppliers.length > 0) {
                let options = '<option value="">All Suppliers</option>';
                suppliers.sort().forEach(supp => {
                    options += `<option value="${supp}">${supp} (${supplierCounts[supp] || 0})</option>`;
                });
                supplierSelect.innerHTML = options;
            }
        } catch (error) {
            console.error("Failed to load suppliers:", error);
        }
    }
}

// Initialize dashboard when page loads
document.addEventListener("DOMContentLoaded", () => {
    window.dashboardManager = new DashboardManager();
});
