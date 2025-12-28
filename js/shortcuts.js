// js/shortcuts.js - Keyboard Navigation
class InventoryShortcuts {
    constructor() {
        this.initShortcuts();
        this.initBulkSelection();
    }
    
    initShortcuts() {
        document.addEventListener("keydown", (e) => {
            // Ctrl+F to focus search
            if (e.ctrlKey && e.key === "f") {
                e.preventDefault();
                const searchInput = document.getElementById("searchInput");
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
            
            // Escape to clear search and filters
            if (e.key === "Escape") {
                const activeElement = document.activeElement;
                if (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA") {
                    if (activeElement.value) {
                        activeElement.value = "";
                        if (activeElement.id === "searchInput") {
                            activeElement.dispatchEvent(new Event("input"));
                        }
                    }
                }
            }
            
            // Ctrl+A to select all (when not in input)
            if (e.ctrlKey && e.key === "a" && 
                !["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
                e.preventDefault();
                this.toggleSelectAll();
            }
            
            // Delete key for selected items
            if (e.key === "Delete" && this.hasSelectedItems()) {
                e.preventDefault();
                this.deleteSelectedItems();
            }
            
            // Ctrl+E to export
            if (e.ctrlKey && e.key === "e") {
                e.preventDefault();
                this.quickExport();
            }
            
            // Ctrl+N to add new product
            if (e.ctrlKey && e.key === "n") {
                e.preventDefault();
                window.location.href = "add-product.html";
            }
        });
    }
    
    initBulkSelection() {
        // Select all checkbox
        const selectAll = document.getElementById("selectAll");
        if (selectAll) {
            selectAll.addEventListener("change", (e) => {
                const checkboxes = document.querySelectorAll(".product-select");
                checkboxes.forEach(cb => {
                    cb.checked = e.target.checked;
                    this.toggleRowSelection(cb);
                });
                this.updateBulkActions();
            });
        }
    }
    
    toggleSelectAll() {
        const selectAll = document.getElementById("selectAll");
        if (selectAll) {
            selectAll.checked = !selectAll.checked;
            selectAll.dispatchEvent(new Event("change"));
        }
    }
    
    toggleRowSelection(checkbox) {
        const row = checkbox.closest("tr");
        if (row) {
            if (checkbox.checked) {
                row.classList.add("selected");
            } else {
                row.classList.remove("selected");
            }
        }
    }
    
    hasSelectedItems() {
        const selected = document.querySelectorAll(".product-select:checked");
        return selected.length > 0;
    }
    
    deleteSelectedItems() {
        const selected = document.querySelectorAll(".product-select:checked");
        if (selected.length === 0) return;
        
        if (confirm(`Delete ${selected.length} selected product(s)?`)) {
            // Implement bulk delete
            console.log("Bulk delete would happen here");
            alert("Bulk delete functionality would be implemented here");
        }
    }
    
    quickExport() {
        const exportBtn = document.getElementById("quickExportBtn") || 
                         document.getElementById("exportBtn");
        if (exportBtn) {
            exportBtn.click();
        }
    }
    
    updateBulkActions() {
        const selectedCount = document.querySelectorAll(".product-select:checked").length;
        if (selectedCount > 0) {
            this.showBulkActionsBar(selectedCount);
        } else {
            this.hideBulkActionsBar();
        }
    }
    
    showBulkActionsBar(count) {
        let bar = document.getElementById("bulkActionsBar");
        if (!bar) {
            bar = document.createElement("div");
            bar.id = "bulkActionsBar";
            bar.className = "bulk-actions-bar";
            bar.innerHTML = `
                <div class="container-fluid">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="fw-bold">${count} product(s) selected</span>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-secondary me-2" id="bulkEdit">
                                <i class="fas fa-edit me-1"></i>Edit
                            </button>
                            <button class="btn btn-sm btn-danger" id="bulkDelete">
                                <i class="fas fa-trash me-1"></i>Delete
                            </button>
                            <button class="btn btn-sm btn-link" id="bulkDeselect">
                                Deselect All
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(bar);
            
            // Add event listeners
            document.getElementById("bulkDeselect").addEventListener("click", () => {
                const selectAll = document.getElementById("selectAll");
                if (selectAll) {
                    selectAll.checked = false;
                    selectAll.dispatchEvent(new Event("change"));
                }
            });
            
            document.getElementById("bulkDelete").addEventListener("click", () => {
                this.deleteSelectedItems();
            });
        } else {
            // Update count
            bar.querySelector(".fw-bold").textContent = `${count} product(s) selected`;
        }
    }
    
    hideBulkActionsBar() {
        const bar = document.getElementById("bulkActionsBar");
        if (bar) {
            bar.remove();
        }
    }
}

// Initialize shortcuts when page loads
document.addEventListener("DOMContentLoaded", () => {
    window.inventoryShortcuts = new InventoryShortcuts();
});
