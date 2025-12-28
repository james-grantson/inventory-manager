// dark-mode.js - Theme management
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('inventory-theme') || 'light';
        this.init();
    }
    
    init() {
        this.setTheme(this.theme);
        this.createToggleButton();
    }
    
    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('inventory-theme', theme);
        this.updateToggleButton();
    }
    
    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        this.showNotification(`Switched to ${newTheme} mode`);
    }
    
    createToggleButton() {
        const button = document.createElement('button');
        button.id = 'themeToggle';
        button.className = 'theme-toggle';
        button.innerHTML = '<i class="fas fa-moon"></i>';
        button.title = 'Toggle dark/light mode';
        button.addEventListener('click', () => this.toggleTheme());
        document.body.appendChild(button);
    }
    
    updateToggleButton() {
        const button = document.getElementById('themeToggle');
        if (button) {
            const icon = button.querySelector('i');
            icon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    showNotification(message) {
        // Use existing notification system or create simple one
        const notification = document.createElement('div');
        notification.className = 'alert alert-info position-fixed';
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 1000;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});
