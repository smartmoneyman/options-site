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
    const data = getOptionsData();
    
    if (!data || data.length === 0) {
        const container = document.getElementById('topSignals');
        if (container) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: #64748b;">No data loaded yet. Please upload data or load demo data.</div>';
        }
        return;
    }
    
    // Calculate frequency for each ticker
    const tickerData = {};
    data.forEach(item => {
        const symbol = item.Symbol || item.symbol;
        if (!symbol) return;
        
        if (!tickerData[symbol]) {
            tickerData[symbol] = {
                symbol: symbol,
                appearances: [],
                totalPCVol: 0,
                totalIVRank: 0,
                lastPrice: 0,
                lastChange: 0
            };
        }
        
        tickerData[symbol].appearances.push(item);
        
        // Parse P/C Vol
        let pcVol = 0;
        if (item['P/C Vol']) {
            pcVol = parseFloat(String(item['P/C Vol']).replace(/,/g, ''));
        }
        tickerData[symbol].totalPCVol += isNaN(pcVol) ? 0 : pcVol;
        
        // Parse IV Rank
        let ivRank = 0;
        if (item['IV Rank']) {
            ivRank = parseFloat(String(item['IV Rank']).replace(/%/g, ''));
        }
        tickerData[symbol].totalIVRank += isNaN(ivRank) ? 0 : ivRank;
        
        // Last price and change
        tickerData[symbol].lastPrice = parseFloat(item.Last || item.last || 0);
        tickerData[symbol].lastChange = parseFloat(String(item['%Change'] || item.change || '0').replace(/%/g, ''));
    });
    
    // Calculate averages and filter Strong Buy signals
    const signals = Object.values(tickerData)
        .filter(ticker => ticker.appearances.length >= 5) // Frequency ≥5
        .map(ticker => {
            const avgPC = ticker.totalPCVol / ticker.appearances.length;
            const avgIV = ticker.totalIVRank / ticker.appearances.length;
            
            return {
                symbol: ticker.symbol,
                price: ticker.lastPrice,
                change: ticker.lastChange,
                pc: avgPC,
                frequency: ticker.appearances.length,
                ivRank: avgIV,
                // Signal strength based on P/C ratio and frequency
                strength: avgPC < 0.25 ? 3 : avgPC < 0.35 ? 2 : 1
            };
        })
        .filter(sig => sig.pc < 0.5) // Bullish signals only
        .sort((a, b) => {
            // Sort by strength first, then frequency, then P/C ratio
            if (b.strength !== a.strength) return b.strength - a.strength;
            if (b.frequency !== a.frequency) return b.frequency - a.frequency;
            return a.pc - b.pc;
        })
        .slice(0, 10); // Top 10
    
    const container = document.getElementById('topSignals');
    if (!container) return;
    
    if (signals.length === 0) {
        container.innerHTML = '<div style="padding: 20px; text-align: center; color: #64748b;">No Strong Buy signals found. Try loading more data.</div>';
        return;
    }
    
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
