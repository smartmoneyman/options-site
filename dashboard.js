// Dashboard Page JavaScript

function loadDashboard() {
    loadQuickStats();
    loadTopSignals();
    loadAlerts();
    loadRecentActivity();
    initCharts();
}

function loadQuickStats() {
    const data = getOptionsData();
    
    // Calculate stats
    const recent10Days = filterByDateRange(data, 
        new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), 
        new Date()
    );
    
    // Active signals (тикеры появившиеся ≥5 раз)
    const tickerCounts = {};
    recent10Days.forEach(item => {
        tickerCounts[item.Symbol] = (tickerCounts[item.Symbol] || 0) + 1;
    });
    const hotTickers = Object.values(tickerCounts).filter(count => count >= 5).length;
    
    // Update DOM
    document.getElementById('activeSignals').textContent = hotTickers;
    document.getElementById('hotTickers').textContent = hotTickers;
}

function loadTopSignals() {
    // Load from localStorage or use sample data
    const signals = [
        { symbol: 'PACS', price: 31.78, change: 102.4, pc: 0.30, strength: 3 },
        { symbol: 'OMER', price: 9.76, change: 56.2, pc: 0.20, strength: 3 },
        { symbol: 'ESPR', price: 3.97, change: 34.6, pc: 0.08, strength: 3 },
        { symbol: 'TMC', price: 6.89, change: 33.5, pc: 0.18, strength: 2 },
        { symbol: 'BITF', price: 3.46, change: 33.1, pc: 0.22, strength: 2 },
    ];
    
    const container = document.getElementById('topSignals');
    if (!container) return;
    
    container.innerHTML = signals.map((sig, idx) => `
        <div class="signal-card">
            <div class="signal-rank">${idx + 1}</div>
            <div class="signal-header">
                <div>
                    <div class="signal-ticker">${sig.symbol}</div>
                    <div class="signal-price">$${sig.price}</div>
                </div>
                <div class="signal-strength">
                    ${[1,2,3].map(i => `<div class="strength-bar ${i <= sig.strength ? 'active' : ''}"></div>`).join('')}
                </div>
            </div>
            <div class="signal-change positive">
                <i class="fas fa-arrow-up"></i> +${sig.change}%
            </div>
            <div class="signal-metrics">
                <div class="metric-item">
                    <label>P/C Ratio</label>
                    <strong>${sig.pc}</strong>
                </div>
                <div class="metric-item">
                    <label>Signal</label>
                    <strong class="text-success">Strong Buy</strong>
                </div>
            </div>
            <div class="signal-actions">
                <button class="btn-primary btn-sm" onclick="viewSignalDetails('${sig.symbol}')">
                    <i class="fas fa-eye"></i> Детали
                </button>
                <button class="btn-secondary btn-sm" onclick="addToWatchlist('${sig.symbol}')">
                    <i class="fas fa-bookmark"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function loadAlerts() {
    // Placeholder - would load real alerts
}

function loadRecentActivity() {
    // Placeholder - would load real activity
}

function initCharts() {
    // Win Rate Chart
    const winRateCtx = document.getElementById('winRateChart');
    if (winRateCtx) {
        new Chart(winRateCtx, {
            type: 'bar',
            data: {
                labels: ['Strong Buy', 'Momentum', 'Hot Tickers', 'P/C<0.3'],
                datasets: [{
                    label: 'Win Rate %',
                    data: [60.9, 60.9, 56.7, 51.4],
                    backgroundColor: ['#10b981', '#10b981', '#3b82f6', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    // Returns Chart
    const returnsCtx = document.getElementById('returnsChart');
    if (returnsCtx) {
        new Chart(returnsCtx, {
            type: 'line',
            data: {
                labels: ['1d', '3d', '5d', '10d'],
                datasets: [{
                    label: 'Strong Buy',
                    data: [0.9, 1.3, 2.0, 5.5],
                    borderColor: '#10b981',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

function viewSignalDetails(symbol) {
    window.location.href = `database.html?symbol=${symbol}`;
}

function addToWatchlist(symbol) {
    const watchlist = getWatchlist();
    if (!watchlist.find(item => item.symbol === symbol)) {
        watchlist.push({
            symbol,
            addedDate: new Date().toISOString(),
            notes: ''
        });
        saveWatchlist(watchlist);
        showNotification(`${symbol} добавлен в Watchlist`, 'success');
    } else {
        showNotification(`${symbol} уже в Watchlist`, 'info');
    }
}

// Load on page ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDashboard);
} else {
    loadDashboard();
}
