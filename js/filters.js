// js/filters.js - Enhanced Filter System
class InventoryFilters {
    constructor() {
        this.activeFilters = {
            priceMin: 0,
            priceMax: 10000,
            minProfit: 0,
            stockStatus: ['low', 'adequate', 'out'],
            category: null,
            supplier: null
        };
        
        this.initFilters();
    }
    
    initFilters() {
        // Price range slider
        const priceRange = document.getElementById("priceRange");
        if (priceRange) {
            priceRange.addEventListener("input", (e) => {
                const value = e.target.value;
                this.activeFilters.priceMax = parseInt(value);
                document.getElementById("priceMax").textContent = value;
                this.applyFilters();
            });
        }
        
        // Profit margin filter
        const minProfit = document.getElementById("minProfit");
        if (minProfit) {
            minProfit.addEventListener("input", (e) => {
                this.activeFilters.minProfit = parseInt(e.target.value) || 0;
                this.applyFilters();
            });
        }
        
        // Stock status checkboxes
        ["filterLow", "filterAdequate", "filterOut"].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener("change", () => {
                    this.updateStockFilters();
                });
            }
        });
        
        // Category filter
        const categoryFilter = document.getElementById("categorySelectFilter");
        if (categoryFilter) {
            categoryFilter.addEventListener("change", (e) => {
                this.activeFilters.category = e.target.value || null;
                this.applyFilters();
            });
        }
        
        // Supplier filter
        const supplierFilter = document.getElementById("supplierSelectFilter");
        if (supplierFilter) {
            supplierFilter.addEventListener("change", (e) => {
                this.activeFilters.supplier = e.target.value || null;
                this.applyFilters();
            });
        }
        
        // Clear filters button
        const clearBtn = document.getElementById("clearFilters");
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                this.clearAllFilters();
            });
        }
    }
    
    updateStockFilters() {
        this.activeFilters.stockStatus = [];
        
        if (document.getElementById("filterLow")?.checked) {
            this.activeFilters.stockStatus.push("low");
        }
        if (document.getElementById("filterAdequate")?.checked) {
            this.activeFilters.stockStatus.push("adequate");
        }
        if (document.getElementById("filterOut")?.checked) {
            this.activeFilters.stockStatus.push("out");
        }
        
        this.applyFilters();
    }
    
    applyFilters() {
        const products = document.querySelectorAll(".product-row");
        let visibleCount = 0;
        
        products.forEach(product => {
            const price = parseFloat(product.dataset.price || 0);
            const profitMargin = parseFloat(product.dataset.profitMargin || 0);
            const stockStatus = product.dataset.stockStatus || "adequate";
            const category = product.dataset.category || "";
            const supplier = product.dataset.supplier || "";
            
            // Check all filters
            const priceMatch = price >= this.activeFilters.priceMin && 
                              price <= this.activeFilters.priceMax;
            const profitMatch = profitMargin >= this.activeFilters.minProfit;
            const stockMatch = this.activeFilters.stockStatus.includes(stockStatus);
            const categoryMatch = !this.activeFilters.category || 
                                 category === this.activeFilters.category;
            const supplierMatch = !this.activeFilters.supplier || 
                                 supplier === this.activeFilters.supplier;
            
            // Show/hide product
            if (priceMatch && profitMatch && stockMatch && categoryMatch && supplierMatch) {
                product.style.display = "";
                visibleCount++;
            } else {
                product.style.display = "none";
            }
        });
        
        // Update counters
        this.updateFilterCount(visibleCount, products.length);
        this.updateResultsMessage(visibleCount, products.length);
    }
    
    updateFilterCount(visible, total) {
        const countElement = document.getElementById("filterCount");
        if (countElement) {
            const activeFilterCount = this.countActiveFilters();
            countElement.textContent = activeFilterCount;
        }
        
        const visibleElement = document.getElementById("visibleCount");
        if (visibleElement) {
            visibleElement.textContent = visible;
        }
    }
    
    countActiveFilters() {
        let count = 0;
        if (this.activeFilters.priceMax < 10000) count++;
        if (this.activeFilters.minProfit > 0) count++;
        if (this.activeFilters.stockStatus.length < 3) count++;
        if (this.activeFilters.category) count++;
        if (this.activeFilters.supplier) count++;
        return count;
    }
    
    clearAllFilters() {
        // Reset all filters to defaults
        this.activeFilters = {
            priceMin: 0,
            priceMax: 10000,
            minProfit: 0,
            stockStatus: ["low", "adequate", "out"],
            category: null,
            supplier: null
        };
        
        // Reset UI elements
        const elements = {
            "priceRange": "10000",
            "priceMax": "10000",
            "minProfit": "0",
            "categorySelectFilter": "",
            "supplierSelectFilter": ""
        };
        
        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === "range" || element.type === "text" || element.type === "number") {
                    element.value = elements[id];
                } else if (element.tagName === "SPAN") {
                    element.textContent = elements[id];
                } else if (element.tagName === "SELECT") {
                    element.value = elements[id];
                }
            }
        });
        
        // Reset checkboxes
        ["filterLow", "filterAdequate", "filterOut"].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.checked = true;
        });
        
        // Reapply filters
        this.applyFilters();
        
        // Show success message
        this.showNotification("Filters cleared successfully", "success");
    }
    
    updateResultsMessage(visible, total) {
        const messageElement = document.getElementById("filterMessage");
        if (messageElement) {
            const activeFilters = this.countActiveFilters();
            if (activeFilters > 0) {
                messageElement.innerHTML = `
                    <span id="resultCount">Showing ${visible} of ${total} products</span>
                    <button class="btn btn-sm btn-link p-0 ms-2" id="clearCurrentFilters">
                        Clear filters
                    </button>
                `;
                
                // Add event listener to clear button
                setTimeout(() => {
                    const clearBtn = document.getElementById("clearCurrentFilters");
                    if (clearBtn) {
                        clearBtn.addEventListener("click", () => {
                            this.clearAllFilters();
                        });
                    }
                }, 100);
            } else {
                messageElement.innerHTML = `<span id="resultCount">Showing all ${total} products</span>`;
            }
        }
    }
    
    showNotification(message, type = "info") {
        // Remove existing notifications
        document.querySelectorAll(".custom-notification").forEach(el => el.remove());
        
        // Create new notification
        const toast = document.createElement("div");
        toast.className = `custom-notification alert alert-${type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = "top: 20px; right: 20px; z-index: 1000; min-width: 300px;";
        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === "success" ? "check-circle" : type === "danger" ? "exclamation-circle" : "info-circle"} me-2"></i>
                <div class="flex-grow-1">${message}</div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => {
    window.inventoryFilters = new InventoryFilters();
});
