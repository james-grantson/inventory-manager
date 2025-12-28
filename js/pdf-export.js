// js/pdf-export.js - Enhanced PDF export with server-side generation
class PDFExporter {
    constructor() {
        this.init();
    }
    
    init() {
        this.addPDFButtons();
        this.addExportMenu();
    }
    
    addPDFButtons() {
        // Add PDF section to dashboard
        const dashboardCards = document.getElementById('dashboardCards');
        if (dashboardCards && !document.getElementById('pdfExportSection')) {
            const pdfSection = `
                <div class="col-12 mt-3" id="pdfExportSection">
                    <div class="card border-danger">
                        <div class="card-header bg-danger text-white">
                            <h6 class="mb-0"><i class="fas fa-file-pdf me-2"></i>Professional PDF Reports</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <div class="card h-100">
                                        <div class="card-body text-center">
                                            <i class="fas fa-file-alt fa-3x text-primary mb-3"></i>
                                            <h5>Full Inventory Report</h5>
                                            <p class="text-muted">Complete analysis with all products, profits, and recommendations</p>
                                            <button class="btn btn-primary" onclick="pdfExporter.generateFullReport()">
                                                <i class="fas fa-download me-1"></i>Download Report
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="card h-100">
                                        <div class="card-body text-center">
                                            <i class="fas fa-chart-pie fa-3x text-success mb-3"></i>
                                            <h5>Quick Summary</h5>
                                            <p class="text-muted">One-page overview with key metrics and recent activity</p>
                                            <button class="btn btn-success" onclick="pdfExporter.generateSummaryReport()">
                                                <i class="fas fa-chart-bar me-1"></i>Download Summary
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-3 text-center">
                                <small class="text-muted">
                                    <i class="fas fa-info-circle me-1"></i>
                                    Reports include Ghana Cedis () currency and professional formatting
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            dashboardCards.insertAdjacentHTML('beforeend', pdfSection);
        }
    }
    
    addExportMenu() {
        // Add to floating action menu
        const floatingMenu = document.querySelector('.dropdown-menu');
        if (floatingMenu && !floatingMenu.querySelector('.pdf-export-item')) {
            const pdfItem = document.createElement('li');
            pdfItem.className = 'pdf-export-item';
            pdfItem.innerHTML = `
                <hr class="dropdown-divider">
                <h6 class="dropdown-header">PDF Reports</h6>
                <a class="dropdown-item" href="#" onclick="pdfExporter.generateFullReport()">
                    <i class="fas fa-file-alt me-2 text-danger"></i>Full Report
                </a>
                <a class="dropdown-item" href="#" onclick="pdfExporter.generateSummaryReport()">
                    <i class="fas fa-chart-pie me-2 text-success"></i>Quick Summary
                </a>
            `;
            floatingMenu.appendChild(pdfItem);
        }
    }
    
    async generateFullReport() {
        try {
            this.showLoading('Generating comprehensive PDF report...', 'This may take a moment for large inventories');
            
            const response = await fetch('/api/reports/pdf/inventory');
            
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inventory-full-report-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showSuccess('Full PDF report downloaded successfully!');
            
        } catch (error) {
            console.error('Full report error:', error);
            this.showError(`Failed to generate full report: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }
    
    async generateSummaryReport() {
        try {
            this.showLoading('Generating quick summary PDF...');
            
            const response = await fetch('/api/reports/pdf/summary');
            
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inventory-summary-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showSuccess('Summary PDF downloaded successfully!');
            
        } catch (error) {
            console.error('Summary report error:', error);
            this.showError(`Failed to generate summary: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }
    
    async generateProductLabel(productId, productName) {
        try {
            this.showLoading('Generating product label...');
            
            const response = await fetch(`/api/reports/pdf/label/${productId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to generate label: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `label-${productName.replace(/[^a-z0-9]/gi, '-')}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showSuccess('Product label downloaded!');
            
        } catch (error) {
            console.error('Label generation error:', error);
            this.showError('Failed to generate product label');
        } finally {
            this.hideLoading();
        }
    }
    
    showLoading(title, subtitle = '') {
        const overlay = document.createElement('div');
        overlay.id = 'pdfLoadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        overlay.innerHTML = `
            <div class="card shadow-lg" style="min-width: 350px; max-width: 500px;">
                <div class="card-body text-center p-4">
                    <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;"></div>
                    <h5 class="mb-2">${title}</h5>
                    ${subtitle ? `<p class="text-muted mb-3">${subtitle}</p>` : ''}
                    <div class="progress mb-2" style="height: 6px;">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
                    </div>
                    <small class="text-muted">Please wait while we generate your PDF...</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    hideLoading() {
        const overlay = document.getElementById('pdfLoadingOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s';
            setTimeout(() => overlay.remove(), 300);
        }
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success', 'check-circle');
    }
    
    showError(message) {
        this.showNotification(message, 'danger', 'exclamation-circle');
    }
    
    showNotification(message, type = 'info', icon = 'info-circle') {
        // Remove existing notifications
        document.querySelectorAll('.pdf-notification').forEach(el => el.remove());
        
        const notification = document.createElement('div');
        notification.className = `pdf-notification alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 1000;
            min-width: 350px;
            max-width: 500px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        notification.innerHTML = `
            <div class="d-flex align-items-start">
                <i class="fas fa-${icon} fa-lg mt-1 me-3"></i>
                <div class="flex-grow-1">
                    <h6 class="alert-heading mb-1">${type === 'success' ? 'Success!' : 'Error!'}</h6>
                    <div class="mb-2">${message}</div>
                    <button type="button" class="btn btn-sm btn-${type === 'success' ? 'outline-success' : 'outline-danger'}" 
                            onclick="this.parentElement.parentElement.parentElement.remove()">
                        Dismiss
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds for success, 10 for errors
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
                setTimeout(() => notification.remove(), 500);
            }
        }, type === 'success' ? 5000 : 10000);
    }
    
    // Add label generation to barcode modal
    enhanceBarcodeModal() {
        // This will be called when barcode modal is shown
        const modal = document.getElementById('barcodeModal');
        if (modal) {
            const modalBody = modal.querySelector('.modal-body');
            const labelBtn = document.createElement('button');
            labelBtn.className = 'btn btn-warning mt-2';
            labelBtn.innerHTML = '<i class="fas fa-tag me-1"></i>Generate Label PDF';
            labelBtn.onclick = () => {
                const productId = modal.dataset.productId;
                const productName = modal.dataset.productName;
                if (productId && productName) {
                    this.generateProductLabel(productId, productName);
                }
            };
            modalBody.appendChild(labelBtn);
        }
    }
}

// Initialize PDF exporter
document.addEventListener('DOMContentLoaded', () => {
    window.pdfExporter = new PDFExporter();
    
    // Enhance barcode manager to include PDF labels
    if (window.barcodeManager && window.barcodeManager.showBarcodeModal) {
        const originalShowModal = window.barcodeManager.showBarcodeModal;
        window.barcodeManager.showBarcodeModal = function(product) {
            originalShowModal.call(this, product);
            setTimeout(() => {
                window.pdfExporter.enhanceBarcodeModal();
                
                // Store product info in modal for label generation
                const modal = document.getElementById('barcodeModal');
                if (modal) {
                    modal.dataset.productId = product.id;
                    modal.dataset.productName = product.name;
                }
            }, 100);
        };
    }
});
