// js/main.js - Main Application Logic
class InventoryManager {
    constructor() {
        this.init();
    }
    
    async init() {
        await this.loadProducts();
        this.initEventListeners();
        this.initExportFunctionality();
    }
    
    async loadProducts() {
        try {
            const response = await fetch("/api/products");
            if (!response.ok) throw new Error("Network response was not ok");
            const products = await response.json();
            this.renderProducts(products);
        } catch (error) {
            console.error("Failed to load products:", error);
            this.showError("Failed to load products. Please try again.");
        }
    }
    
    renderProducts(products) {
        const tbody = document.getElementById("productsTableBody");
        if (!tbody) return;
        
        let html = "";
        
        products.forEach(product => {
            const profit = (product.price - (product.cost || 0)) * product.quantity;
            const profitMargin = product.cost ? ((product.price - product.cost) / product.cost) * 100 : 0;
            
            // Determine stock status
            let stockStatus = "adequate";
            let stockBadge = "bg-success";
            if (product.quantity === 0) {
                stockStatus = "out";
                stockBadge = "bg-danger";
            } else if (product.quantity <= product.minStock) {
                stockStatus = "low";
                stockBadge = "bg-warning";
            }
            
            // Determine profit margin color
            let marginColor = "text-success";
            if (profitMargin < 20) marginColor = "text-danger";
            else if (profitMargin < 40) marginColor = "text-warning";
            
            html += `
                <tr class="product-row" 
                    data-price="${product.price}" 
                    data-profit-margin="${profitMargin.toFixed(1)}"
                    data-stock-status="${stockStatus}"
                    data-category="${product.category || ""}"
                    data-supplier="${product.supplier || ""}">
                    <td>
                        <input type="checkbox" class="form-check-input product-select" 
                               data-id="${product.id}">
                    </td>
                    <td>
                        <div class="fw-bold">${product.name}</div>
                        <small class="text-muted">${product.description || ""}</small>
                    </td>
                    <td>
                        ${product.sku ? `<span class="badge bg-secondary">${product.sku}</span>` : "-"}
                    </td>
                    <td>
                        ${product.category ? `<span class="badge bg-info">${product.category}</span>` : "-"}
                    </td>
                    <td>
                        <span class="badge ${stockBadge}">${product.quantity} units</span>
                        ${product.quantity <= product.minStock ? 
                          `<small class="text-danger d-block">Min: ${product.minStock}</small>` : ""}
                    </td>
                    <td class="fw-bold">${product.price.toFixed(2)}</td>
                    <td class="fw-bold text-success">${profit.toFixed(2)}</td>
                    <td class="fw-bold ${marginColor}">${profitMargin.toFixed(1)}%</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <a href="edit-product.html?id=${product.id}" 
                               class="btn btn-outline-primary">
                                <i class="fas fa-edit"></i>
                            </a>
                            <button class="btn btn-outline-danger delete-btn" 
                                    data-id="${product.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        this.attachDeleteListeners();
        this.attachSelectionListeners();
        this.updateResultCount(products.length);
    }
    
    attachDeleteListeners() {
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const productId = e.target.closest(".delete-btn").dataset.id;
                this.deleteProduct(productId);
            });
        });
    }
    
    attachSelectionListeners() {
        document.querySelectorAll(".product-select").forEach(checkbox => {
            checkbox.addEventListener("change", (e) => {
                if (window.inventoryShortcuts) {
                    window.inventoryShortcuts.toggleRowSelection(e.target);
                    window.inventoryShortcuts.updateBulkActions();
                }
                
                // Update select all checkbox
                const allCheckboxes = document.querySelectorAll(".product-select");
                const selectAll = document.getElementById("selectAll");
                if (selectAll) {
                    const checkedCount = document.querySelectorAll(".product-select:checked").length;
                    selectAll.checked = checkedCount === allCheckboxes.length;
                    selectAll.indeterminate = checkedCount > 0 && checkedCount < allCheckboxes.length;
                }
            });
        });
    }
    
    async deleteProduct(productId) {
        if (!confirm("Are you sure you want to delete this product?")) return;
        
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: "DELETE"
            });
            
            if (response.ok) {
                this.showSuccess("Product deleted successfully!");
                await this.loadProducts();
            } else {
                throw new Error("Failed to delete product");
            }
        } catch (error) {
            console.error("Delete error:", error);
            this.showError("Failed to delete product. Please try again.");
        }
    }
    
    initEventListeners() {
        // Search functionality
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.searchProducts(e.target.value);
            });
        }
        
        // Category filter
        const categoryFilter = document.getElementById("categoryFilter");
        if (categoryFilter) {
            categoryFilter.addEventListener("change", (e) => {
                this.filterByCategory(e.target.value);
            });
        }
        
        // Quick action buttons
        const quickActionButtons = ["viewLowStock", "viewProfitable", "quickExportBtn"];
        quickActionButtons.forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                if (id === "viewLowStock") {
                    button.addEventListener("click", (e) => {
                        e.preventDefault();
                        this.filterLowStock();
                    });
                } else if (id === "viewProfitable") {
                    button.addEventListener("click", (e) => {
                        e.preventDefault();
                        this.filterMostProfitable();
                    });
                }
            }
        });
    }
    
    async searchProducts(query) {
        if (!query.trim()) {
            await this.loadProducts();
            return;
        }
        
        try {
            const response = await fetch(`/api/products/search/${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error("Network response was not ok");
            const products = await response.json();
            this.renderProducts(products);
        } catch (error) {
            console.error("Search error:", error);
        }
    }
    
    filterByCategory(category) {
        if (!category) {
            if (window.inventoryFilters) {
                window.inventoryFilters.activeFilters.category = null;
                window.inventoryFilters.applyFilters();
            }
            return;
        }
        
        if (window.inventoryFilters) {
            window.inventoryFilters.activeFilters.category = category;
            window.inventoryFilters.applyFilters();
        }
    }
    
    filterLowStock() {
        if (window.inventoryFilters) {
            window.inventoryFilters.activeFilters.stockStatus = ["low"];
            document.getElementById("filterLow").checked = true;
            document.getElementById("filterAdequate").checked = false;
            document.getElementById("filterOut").checked = false;
            window.inventoryFilters.applyFilters();
        }
    }
    
    filterMostProfitable() {
        if (window.inventoryFilters) {
            window.inventoryFilters.activeFilters.minProfit = 40;
            document.getElementById("minProfit").value = 40;
            window.inventoryFilters.applyFilters();
        }
    }
    
    initExportFunctionality() {
        const exportBtn = document.getElementById("exportBtn");
        const quickExportBtn = document.getElementById("quickExportBtn");
        
        const exportHandler = async () => {
            try {
                const response = await fetch("/api/products");
                if (!response.ok) throw new Error("Network response was not ok");
                const products = await response.json();
                
                // Convert to CSV
                const csv = this.convertToCSV(products);
                
                // Download
                this.downloadCSV(csv, "inventory-export.csv");
                
                this.showSuccess("Export completed successfully!");
            } catch (error) {
                console.error("Export error:", error);
                this.showError("Failed to export data.");
            }
        };
        
        if (exportBtn) exportBtn.addEventListener("click", exportHandler);
        if (quickExportBtn) quickExportBtn.addEventListener("click", exportHandler);
    }
    
    convertToCSV(products) {
        const headers = ["Name", "SKU", "Description", "Category", "Quantity", "Price", "Cost", "Supplier", "Location", "Min Stock", "Profit", "Margin %"];
        
        const rows = products.map(product => {
            const profit = (product.price - (product.cost || 0)) * product.quantity;
            const profitMargin = product.cost ? ((product.price - product.cost) / product.cost) * 100 : 0;
            
            return [
                `"${product.name}"`,
                product.sku || "",
                `"${product.description || ""}"`,
                product.category || "",
                product.quantity,
                product.price,
                product.cost || 0,
                product.supplier || "",
                product.location || "",
                product.minStock,
                profit.toFixed(2),
                profitMargin.toFixed(1)
            ];
        });
        
        return [headers, ...rows].map(row => row.join(",")).join("\n");
    }
    
    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
    
    updateResultCount(count) {
        const resultElement = document.getElementById("resultCount");
        if (resultElement) {
            resultElement.textContent = `Showing ${count} products`;
        }
    }
    
    showSuccess(message) {
        if (window.inventoryFilters && window.inventoryFilters.showNotification) {
            window.inventoryFilters.showNotification(message, "success");
        } else {
            alert(message);
        }
    }
    
    showError(message) {
        if (window.inventoryFilters && window.inventoryFilters.showNotification) {
            window.inventoryFilters.showNotification(message, "danger");
        } else {
            alert("Error: " + message);
        }
    }
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => {
    window.inventoryManager = new InventoryManager();
});

