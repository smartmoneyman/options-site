// ========================================
// OPTIONS ANALYZER - MAIN JAVASCRIPT
// ========================================

// Global State
const AppState = {
    data: [],
    filteredData: [],
    currentPage: 'dashboard',
    settings: {
        darkMode: false,
        autoRefresh: false
    },
    watchlist: [],
    tradingJournal: []
};

// ========================================
// LOCAL STORAGE HELPERS
// ========================================

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        return null;
    }
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    loadAppState();
    
    // Initialize components
    initNavigation();
    initThemeToggle();
    
    // Load existing data
    loadExistingData();
    
    // Update last update time
    updateLastUpdateTime();
});

function loadAppState() {
    // Load watchlist
    const savedWatchlist = loadFromLocalStorage('watchlist');
    if (savedWatchlist) {
        AppState.watchlist = savedWatchlist;
    }
    
    // Load trading journal
    const savedJournal = loadFromLocalStorage('tradingJournal');
    if (savedJournal) {
        AppState.tradingJournal = savedJournal;
    }
    
    // Load settings
    const savedSettings = loadFromLocalStorage('settings');
    if (savedSettings) {
        AppState.settings = {...AppState.settings, ...savedSettings};
        if (savedSettings.darkMode) {
            document.body.classList.add('dark-mode');
        }
    }
    
    // Load main data
    const savedData = loadFromLocalStorage('optionsData');
    if (savedData) {
        AppState.data = savedData;
        AppState.filteredData = savedData;
    }
}

// ========================================
// NAVIGATION
// ========================================

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get page name from href
            const page = this.getAttribute('href').replace('.html', '');
            
            // Navigate
            if (page === 'index') {
                window.location.href = 'index.html';
            } else {
                window.location.href = page + '.html';
            }
        });
    });
}

// ========================================
// THEME TOGGLE
// ========================================

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    AppState.settings.darkMode = document.body.classList.contains('dark-mode');
    saveToLocalStorage('settings', AppState.settings);
}

// ========================================
// DATA MANAGEMENT
// ========================================

function loadExistingData() {
    // Try to load from localStorage
    const savedData = loadFromLocalStorage('optionsData');
    
    if (savedData && savedData.length > 0) {
        AppState.data = savedData;
        AppState.filteredData = savedData;
        
        // Update UI if we're on relevant page
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
        
        return true;
    }
    
    return false;
}

function saveData(data) {
    AppState.data = data;
    AppState.filteredData = data;
    saveToLocalStorage('optionsData', data);
    
    // Update last update time
    saveToLocalStorage('lastUpdate', new Date().toISOString());
    updateLastUpdateTime();
}

function updateLastUpdateTime() {
    const lastUpdate = loadFromLocalStorage('lastUpdate');
    const elements = document.querySelectorAll('.last-update');
    
    if (lastUpdate && elements.length > 0) {
        const date = new Date(lastUpdate);
        const formatted = formatDateTime(date);
        
        elements.forEach(el => {
            el.textContent = `Last update: ${formatted}`;
        });
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return Number(num).toFixed(decimals);
}

function formatCurrency(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return '$' + Number(num).toFixed(decimals);
}

function formatPercent(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return Number(num).toFixed(decimals) + '%';
}

function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatDateTime(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getChangeClass(value) {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return '';
}

function getSignalStrength(score) {
    if (score >= 80) return { text: 'Very Strong', class: 'success', icon: '🟢🟢🟢' };
    if (score >= 60) return { text: 'Strong', class: 'success', icon: '🟢🟢' };
    if (score >= 40) return { text: 'Good', class: 'warning', icon: '🟢' };
    if (score >= 20) return { text: 'Weak', class: 'danger', icon: '🟡' };
    return { text: 'Very Weak', class: 'danger', icon: '🔴' };
}

// ========================================
// FILTERING & SORTING
// ========================================

function filterData(filters) {
    let filtered = [...AppState.data];
    
    // Apply filters
    if (filters.symbol && filters.symbol !== '') {
        filtered = filtered.filter(item => 
            item.Symbol && item.Symbol.toUpperCase().includes(filters.symbol.toUpperCase())
        );
    }
    
    if (filters.dateFrom) {
        filtered = filtered.filter(item => 
            new Date(item.Date) >= new Date(filters.dateFrom)
        );
    }
    
    if (filters.dateTo) {
        filtered = filtered.filter(item => 
            new Date(item.Date) <= new Date(filters.dateTo)
        );
    }
    
    if (filters.pcMin !== null && filters.pcMin !== undefined) {
        filtered = filtered.filter(item => 
            item['P/C Vol'] >= filters.pcMin
        );
    }
    
    if (filters.pcMax !== null && filters.pcMax !== undefined) {
        filtered = filtered.filter(item => 
            item['P/C Vol'] <= filters.pcMax
        );
    }
    
    if (filters.ivMin !== null && filters.ivMin !== undefined) {
        filtered = filtered.filter(item => 
            item['IV Rank'] >= filters.ivMin
        );
    }
    
    if (filters.ivMax !== null && filters.ivMax !== undefined) {
        filtered = filtered.filter(item => 
            item['IV Rank'] <= filters.ivMax
        );
    }
    
    AppState.filteredData = filtered;
    return filtered;
}

function sortData(data, column, direction = 'desc') {
    return [...data].sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        // Handle dates
        if (column === 'Date') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }
        
        // Handle numbers
        if (typeof aVal === 'string' && !isNaN(aVal)) {
            aVal = parseFloat(aVal);
            bVal = parseFloat(bVal);
        }
        
        if (direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
}

// ========================================
// ANALYTICS CALCULATIONS
// ========================================

function calculateStats(data) {
    if (!data || data.length === 0) {
        return {
            totalRecords: 0,
            uniqueTickers: 0,
            avgPCRatio: 0,
            avgIVRank: 0,
            hotTickers: 0
        };
    }
    
    const uniqueTickers = new Set(data.map(item => item.Symbol)).size;
    
    const avgPCRatio = data.reduce((sum, item) => {
        const pc = parseFloat(item['P/C Vol']) || 0;
        return sum + pc;
    }, 0) / data.length;
    
    const avgIVRank = data.reduce((sum, item) => {
        const iv = parseFloat(item['IV Rank']) || 0;
        return sum + iv;
    }, 0) / data.length;
    
    // Count hot tickers (appeared more than 5 times in last 10 days)
    const tickerCounts = {};
    data.forEach(item => {
        if (!tickerCounts[item.Symbol]) {
            tickerCounts[item.Symbol] = 0;
        }
        tickerCounts[item.Symbol]++;
    });
    
    const hotTickers = Object.values(tickerCounts).filter(count => count >= 5).length;
    
    return {
        totalRecords: data.length,
        uniqueTickers,
        avgPCRatio,
        avgIVRank,
        hotTickers
    };
}

function findMomentumTickers(data) {
    // Group by ticker
    const groupedByTicker = {};
    
    data.forEach(item => {
        if (!groupedByTicker[item.Symbol]) {
            groupedByTicker[item.Symbol] = [];
        }
        groupedByTicker[item.Symbol].push(item);
    });
    
    // Find momentum tickers (low P/C, multiple appearances)
    const momentumTickers = [];
    
    Object.entries(groupedByTicker).forEach(([symbol, items]) => {
        if (items.length >= 3) {
            const avgPC = items.reduce((sum, item) => sum + (parseFloat(item['P/C Vol']) || 0), 0) / items.length;
            
            if (avgPC < 0.5) {
                const firstPrice = parseFloat(items[0].Last) || 0;
                const lastPrice = parseFloat(items[items.length - 1].Last) || 0;
                const priceChange = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
                
                momentumTickers.push({
                    symbol,
                    appearances: items.length,
                    avgPC,
                    priceChange,
                    lastPrice
                });
            }
        }
    });
    
    // Sort by price change
    return momentumTickers.sort((a, b) => b.priceChange - a.priceChange);
}

function findHotTickers(data) {
    // Get last 10 days of data
    const dates = [...new Set(data.map(item => item.Date))].sort().reverse().slice(0, 10);
    const recentData = data.filter(item => dates.includes(item.Date));
    
    // Count appearances
    const tickerCounts = {};
    recentData.forEach(item => {
        if (!tickerCounts[item.Symbol]) {
            tickerCounts[item.Symbol] = {
                count: 0,
                data: []
            };
        }
        tickerCounts[item.Symbol].count++;
        tickerCounts[item.Symbol].data.push(item);
    });
    
    // Filter hot tickers (>=5 appearances)
    const hotTickers = [];
    
    Object.entries(tickerCounts).forEach(([symbol, info]) => {
        if (info.count >= 5) {
            const items = info.data.sort((a, b) => new Date(a.Date) - new Date(b.Date));
            const firstPrice = parseFloat(items[0].Last) || 0;
            const lastPrice = parseFloat(items[items.length - 1].Last) || 0;
            const priceChange = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
            
            const avgPC = items.reduce((sum, item) => sum + (parseFloat(item['P/C Vol']) || 0), 0) / items.length;
            const avgIV = items.reduce((sum, item) => sum + (parseFloat(item['IV Rank']) || 0), 0) / items.length;
            
            hotTickers.push({
                symbol,
                appearances: info.count,
                priceChange,
                avgPC,
                avgIV,
                lastPrice
            });
        }
    });
    
    return hotTickers.sort((a, b) => b.appearances - a.appearances);
}

// ========================================
// WATCHLIST MANAGEMENT
// ========================================

function addToWatchlist(symbol, notes = '') {
    if (!AppState.watchlist.find(item => item.symbol === symbol)) {
        AppState.watchlist.push({
            symbol,
            notes,
            addedAt: new Date().toISOString()
        });
        
        saveToLocalStorage('watchlist', AppState.watchlist);
        return true;
    }
    return false;
}

function removeFromWatchlist(symbol) {
    AppState.watchlist = AppState.watchlist.filter(item => item.symbol !== symbol);
    saveToLocalStorage('watchlist', AppState.watchlist);
}

function updateWatchlistNotes(symbol, notes) {
    const item = AppState.watchlist.find(item => item.symbol === symbol);
    if (item) {
        item.notes = notes;
        saveToLocalStorage('watchlist', AppState.watchlist);
    }
}

// ========================================
// TRADING JOURNAL
// ========================================

function addTradeToJournal(trade) {
    trade.id = Date.now();
    trade.timestamp = new Date().toISOString();
    AppState.tradingJournal.push(trade);
    saveToLocalStorage('tradingJournal', AppState.tradingJournal);
}

function updateTrade(id, updates) {
    const trade = AppState.tradingJournal.find(t => t.id === id);
    if (trade) {
        Object.assign(trade, updates);
        saveToLocalStorage('tradingJournal', AppState.tradingJournal);
    }
}

function deleteTrade(id) {
    AppState.tradingJournal = AppState.tradingJournal.filter(t => t.id !== id);
    saveToLocalStorage('tradingJournal', AppState.tradingJournal);
}

// ========================================
// EXPORT FUNCTIONS
// ========================================

function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }
    
    // Get headers
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csv = headers.join(',') + '\n';
    
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
        });
        csv += values.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// ========================================
// NOTIFICATION SYSTEM
// ========================================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="margin-left: auto; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}
