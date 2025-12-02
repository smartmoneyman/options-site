// ============================================
// COMMON FUNCTIONS & UTILITIES
// ============================================

// Local Storage Keys
const STORAGE_KEYS = {
    OPTIONS_DATA: 'options_data',
    WATCHLIST: 'watchlist',
    TRADES: 'trades',
    THEME: 'theme',
    SETTINGS: 'settings'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    loadGlobalStats();
    setupEventListeners();
});

// Theme Management
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.classList.toggle('dark-theme');
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    
    // Update icon
    const icon = document.querySelector('.header-actions .btn-icon i');
    if (icon) {
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const icon = document.querySelector('.header-actions .btn-icon i');
        if (icon) icon.className = 'fas fa-sun';
    }
}

// Data Management
function getOptionsData() {
    const data = localStorage.getItem(STORAGE_KEYS.OPTIONS_DATA);
    return data ? JSON.parse(data) : [];
}

function saveOptionsData(data) {
    localStorage.setItem(STORAGE_KEYS.OPTIONS_DATA, JSON.stringify(data));
    loadGlobalStats();
}

function getWatchlist() {
    const data = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    return data ? JSON.parse(data) : [];
}

function saveWatchlist(data) {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(data));
}

function getTrades() {
    const data = localStorage.getItem(STORAGE_KEYS.TRADES);
    return data ? JSON.parse(data) : [];
}

function saveTrades(data) {
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(data));
}

// Load Global Stats
function loadGlobalStats() {
    const data = getOptionsData();
    
    // Update dashboard stats  
    const totalTickersEl = document.getElementById('total-tickers');
    if (totalTickersEl) {
        totalTickersEl.textContent = formatNumber(data.length);
    }
    
    // Update sidebar stats
    const sidebarTotalEl = document.getElementById('sidebar-total-records');
    if (sidebarTotalEl) {
        sidebarTotalEl.textContent = formatNumber(data.length);
    }
    
    const totalRecordsEl = document.getElementById('totalRecords');
    if (totalRecordsEl) {
        totalRecordsEl.textContent = formatNumber(data.length);
    }
    
    const lastUpdateEl = document.getElementById('lastUpdate');
    if (lastUpdateEl && data.length > 0) {
        const dates = data.map(d => new Date(d.Date)).filter(d => !isNaN(d)).sort((a, b) => b - a);
        if (dates.length > 0) {
            lastUpdateEl.textContent = formatDate(dates[0]);
        }
    }
    
    // Update "Last update" text in header
    const headerUpdateEls = document.querySelectorAll('.last-update');
    if (headerUpdateEls.length > 0 && data.length > 0) {
        const dates = data.map(d => new Date(d.Date)).filter(d => !isNaN(d)).sort((a, b) => b - a);
        if (dates.length > 0) {
            headerUpdateEls.forEach(el => {
                el.textContent = 'Last update: ' + formatDate(dates[0]);
            });
        }
    }
}

// Utility Functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(num);
}

function formatPercent(num) {
    return (num * 100).toFixed(2) + '%';
}

function formatDate(date) {
    if (typeof date === 'string') date = new Date(date);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дн назад`;
    
    return date.toLocaleDateString('ru-RU');
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation active state
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
    });
}

// Refresh All Data
function refreshAllData() {
    const btn = document.querySelector('.btn-refresh');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-sync-alt loading"></i> Обновление...';
        btn.disabled = true;
    }
    
    setTimeout(() => {
        loadGlobalStats();
        if (typeof loadDashboard === 'function') loadDashboard();
        if (typeof loadDatabase === 'function') loadDatabase();
        if (typeof loadAnalytics === 'function') loadAnalytics();
        if (typeof loadRecommendations === 'function') loadRecommendations();
        
        if (btn) {
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Обновить';
            btn.disabled = false;
        }
        
        showNotification('Данные обновлены', 'success');
    }, 1000);
}

// Notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Export Data
function exportToCSV(data, filename) {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') 
                ? `"${value}"` 
                : value;
        }).join(',');
    });
    
    return [headers.join(','), ...rows].join('\n');
}

// Chart Utilities
function createChart(ctx, config) {
    return new Chart(ctx, config);
}

// Date Range Utilities
function getDateRange(period) {
    const end = new Date();
    const start = new Date();
    
    switch(period) {
        case 'today':
            start.setHours(0, 0, 0, 0);
            break;
        case 'week':
            start.setDate(start.getDate() - 7);
            break;
        case '10days':
            start.setDate(start.getDate() - 10);
            break;
        case 'month':
            start.setMonth(start.getMonth() - 1);
            break;
        case '3months':
            start.setMonth(start.getMonth() - 3);
            break;
    }
    
    return { start, end };
}

// Filter Data by Date Range
function filterByDateRange(data, start, end) {
    return data.filter(item => {
        const date = new Date(item.Date);
        return date >= start && date <= end;
    });
}

// Calculate Win Rate
function calculateWinRate(data, returnField = 'Return_10d') {
    const validReturns = data
        .filter(item => item[returnField] !== undefined && item[returnField] !== null)
        .map(item => parseFloat(item[returnField]));
    
    if (validReturns.length === 0) return 0;
    
    const wins = validReturns.filter(r => r > 0).length;
    return (wins / validReturns.length) * 100;
}

// Calculate Average Return
function calculateAvgReturn(data, returnField = 'Return_10d') {
    const validReturns = data
        .filter(item => item[returnField] !== undefined && item[returnField] !== null)
        .map(item => parseFloat(item[returnField]));
    
    if (validReturns.length === 0) return 0;
    
    const sum = validReturns.reduce((a, b) => a + b, 0);
    return sum / validReturns.length;
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize sample data if storage is empty
function initializeSampleData() {
    const data = getOptionsData();
    if (data.length === 0) {
        // Load demo data
        fetch('data/demo-data.json')
            .then(response => {
                if (!response.ok) throw new Error('Demo data not found');
                return response.json();
            })
            .then(data => {
                saveOptionsData(data);
                console.log('Demo data loaded:', data.length, 'records');
                showNotification('Демо-данные загружены! Загрузите свой Excel для реальных данных.', 'info');
                loadGlobalStats();
                
                // Reload current page data if functions exist
                if (typeof loadDashboard === 'function') loadDashboard();
                if (typeof loadDatabase === 'function') loadDatabase();
                if (typeof loadRecommendations === 'function') loadRecommendations();
            })
            .catch(err => {
                console.log('Demo data not available, please upload your data');
            });
    }
}

// Call on load
initializeSampleData();

console.log('Common.js loaded successfully');
