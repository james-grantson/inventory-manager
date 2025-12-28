// barcode.js - Barcode generation
class BarcodeManager {
    constructor() {
        this.init();
    }
    
    init() {
        // Load JsBarcode if needed
        if (typeof JsBarcode === 'undefined') {
            this.loadBarcodeLibrary();
        }
    }
    
    loadBarcodeLibrary() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
        document.head.appendChild(script);
    }
    
    generateBarcode(value, targetElementId) {
        if (!value) return;
        
        try {
            // Create canvas if it doesn't exist
            let canvas = document.getElementById(`barcode-${targetElementId}`);
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.id = `barcode-${targetElementId}`;
                document.getElementById(targetElementId)?.appendChild(canvas);
            }
            
            // Generate barcode
            JsBarcode(canvas, value, {
                format: "CODE128",
                lineColor: "#000",
                width: 2,
                height: 40,
                displayValue: true
            });
            
            return canvas;
        } catch (error) {
            console.error('Barcode generation error:', error);
        }
    }
    
    showBarcodeModal(product) {
        const modalHtml = `
            <div class="modal fade" id="barcodeModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Barcode: ${product.name}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <div class="mb-3" id="modalBarcode"></div>
                            <div class="mb-3">
                                <strong>SKU:</strong> ${product.sku || 'N/A'}<br>
                                <strong>Value:</strong> ${product.sku || product.id}
                            </div>
                            <button class="btn btn-primary" onclick="barcodeManager.downloadBarcode()">
                                <i class="fas fa-download me-1"></i>Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        const existingModal = document.getElementById('barcodeModal');
        if (existingModal) existingModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Generate barcode in modal
        const barcodeValue = product.sku || product.id.substring(0, 8);
        setTimeout(() => {
            this.generateBarcode(barcodeValue, 'modalBarcode');
        }, 100);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('barcodeModal'));
        modal.show();
    }
    
    downloadBarcode() {
        const canvas = document.querySelector('#modalBarcode canvas');
        if (!canvas) return;
        
        const link = document.createElement('a');
        link.download = 'barcode.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
    
    addBarcodeToTable() {
        // Add barcode column and buttons to table
        const tableBody = document.getElementById('productsTableBody');
        if (!tableBody) return;
        
        // Update table header
        const headerRow = document.querySelector('table thead tr');
        if (headerRow && !headerRow.querySelector('.barcode-header')) {
            const barcodeHeader = document.createElement('th');
            barcodeHeader.className = 'barcode-header';
            barcodeHeader.textContent = 'Barcode';
            headerRow.insertBefore(barcodeHeader, headerRow.children[2]);
        }
        
        // Add barcode buttons to each row
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            if (!row.querySelector('.barcode-cell')) {
                const barcodeCell = document.createElement('td');
                barcodeCell.className = 'barcode-cell';
                
                const viewBtn = document.createElement('button');
                viewBtn.className = 'btn btn-sm btn-outline-secondary';
                viewBtn.innerHTML = '<i class="fas fa-barcode"></i>';
                viewBtn.title = 'View barcode';
                viewBtn.onclick = () => this.showProductBarcode(row);
                
                barcodeCell.appendChild(viewBtn);
                row.insertBefore(barcodeCell, row.children[2]);
            }
        });
    }
    
    showProductBarcode(row) {
        // Extract product data from row
        const productId = row.querySelector('.delete-btn')?.dataset.id;
        const productName = row.querySelector('td:nth-child(3)')?.textContent.trim();
        const sku = row.querySelector('td:nth-child(4)')?.textContent.trim();
        
        if (productId) {
            const product = {
                id: productId,
                name: productName || 'Product',
                sku: sku || productId.substring(0, 8)
            };
            this.showBarcodeModal(product);
        }
    }
}

// Initialize barcode manager
document.addEventListener('DOMContentLoaded', () => {
    window.barcodeManager = new BarcodeManager();
    
    // Enhance table when products load
    if (window.inventoryManager) {
        const originalRender = window.inventoryManager.renderProducts;
        window.inventoryManager.renderProducts = function(products) {
            originalRender.call(this, products);
            setTimeout(() => {
                window.barcodeManager.addBarcodeToTable();
            }, 100);
        };
    }
});
