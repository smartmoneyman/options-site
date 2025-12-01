const SAMPLE_SIGNALS = [
    { symbol: 'PACS', price: 31.78, change: 102.42, pc: 0.30, freq: 7, score: 95 },
    { symbol: 'OMER', price: 9.76, change: 56.16, pc: 0.20, freq: 7, score: 92 },
    { symbol: 'ESPR', price: 3.97, change: 34.58, pc: 0.08, freq: 5, score: 88 },
    { symbol: 'TMC', price: 6.89, change: 33.53, pc: 0.18, freq: 10, score: 85 },
    { symbol: 'BITF', price: 3.46, change: 33.08, pc: 0.22, freq: 10, score: 83 }
];

document.addEventListener('DOMContentLoaded', function() {
    initRecommendations();
});

function initRecommendations() {
    displaySignals();
    displayWatchlist();
    displayTradingJournal();
    updateSidebar();
}

function displaySignals() {
    const tbody = document.getElementById('signals-body');
    if (!tbody) return;
    
    tbody.innerHTML = SAMPLE_SIGNALS.map((signal, index) => {
        const strength = getSignalStrength(signal.score);
        return `
            <tr>
                <td><strong>#${index + 1}</strong></td>
                <td><strong>${signal.symbol}</strong></td>
                <td>${formatCurrency(signal.price)}</td>
                <td class="text-success">↑ ${formatPercent(signal.change)}</td>
                <td>${formatNumber(signal.pc)}</td>
                <td><span class="badge badge-warning">${signal.freq}x</span></td>
                <td><span class="badge badge-${strength.class}">${strength.icon} ${strength.text}</span></td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="addToWatchlistWithNotif('${signal.symbol}')">⭐ Watch</button>
                </td>
            </tr>
        `;
    }).join('');
}

function displayWatchlist() {
    const container = document.getElementById('watchlist-content');
    if (!container) return;
    
    if (AppState.watchlist.length === 0) {
        container.innerHTML = '<p class="text-gray">Your watchlist is empty. Add tickers from Dashboard or Database.</p>';
        return;
    }
    
    container.innerHTML = AppState.watchlist.map(item => `
        <div class="history-item">
            <div>
                <div class="history-date"><strong>${item.symbol}</strong></div>
                <div class="history-stats">${item.notes || 'No notes'}</div>
                <div class="text-gray" style="font-size: 0.8rem;">Added ${formatDateTime(new Date(item.addedAt))}</div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-outline btn-sm" onclick="editNotes('${item.symbol}')">✏️ Edit</button>
                <button class="btn btn-danger btn-sm" onclick="removeFromWatchlistWithNotif('${item.symbol}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

function displayTradingJournal() {
    const container = document.getElementById('journal-content');
    if (!container) return;
    
    if (AppState.tradingJournal.length === 0) {
        container.innerHTML = '<p class="text-gray">No trades recorded yet. Start tracking your trades!</p>';
        return;
    }
    
    container.innerHTML = AppState.tradingJournal.map(trade => {
        const pnl = trade.exitPrice ? ((trade.exitPrice - trade.entryPrice) / trade.entryPrice * 100) : 0;
        const pnlClass = pnl > 0 ? 'text-success' : pnl < 0 ? 'text-danger' : '';
        
        return `
            <div class="history-item">
                <div>
                    <div class="history-date"><strong>${trade.symbol}</strong> - ${trade.type}</div>
                    <div class="history-stats">Entry: ${formatCurrency(trade.entryPrice)} | Exit: ${trade.exitPrice ? formatCurrency(trade.exitPrice) : 'Open'}</div>
                    ${trade.exitPrice ? `<div class="${pnlClass}">P&L: ${pnl > 0 ? '+' : ''}${formatPercent(pnl)}</div>` : ''}
                </div>
                <div>
                    <button class="btn btn-danger btn-sm" onclick="deleteTrade(${trade.id})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function addToWatchlistWithNotif(symbol) {
    const added = addToWatchlist(symbol);
    if (added) {
        displayWatchlist();
        updateSidebar();
        showNotification(`${symbol} added to watchlist!`, 'success');
    } else {
        showNotification(`${symbol} is already in watchlist.`, 'info');
    }
}

function removeFromWatchlistWithNotif(symbol) {
    if (confirm(`Remove ${symbol} from watchlist?`)) {
        removeFromWatchlist(symbol);
        displayWatchlist();
        updateSidebar();
        showNotification(`${symbol} removed from watchlist`, 'info');
    }
}

function editNotes(symbol) {
    const item = AppState.watchlist.find(i => i.symbol === symbol);
    const notes = prompt(`Edit notes for ${symbol}:`, item ? item.notes : '');
    
    if (notes !== null) {
        updateWatchlistNotes(symbol, notes);
        displayWatchlist();
        showNotification('Notes updated', 'success');
    }
}

function clearWatchlist() {
    if (confirm('Are you sure you want to clear your entire watchlist?')) {
        AppState.watchlist = [];
        saveToLocalStorage('watchlist', []);
        displayWatchlist();
        updateSidebar();
        showNotification('Watchlist cleared', 'info');
    }
}

function exportWatchlist() {
    if (AppState.watchlist.length === 0) {
        showNotification('Watchlist is empty', 'warning');
        return;
    }
    
    const data = AppState.watchlist.map(item => ({
        Symbol: item.symbol,
        Notes: item.notes,
        'Added At': item.addedAt
    }));
    
    exportToCSV(data, 'watchlist.csv');
    showNotification('Watchlist exported!', 'success');
}

function showAddTradeModal() {
    const symbol = prompt('Enter ticker symbol:');
    if (!symbol) return;
    
    const type = prompt('Trade type (Call/Put/Stock):');
    if (!type) return;
    
    const entryPrice = parseFloat(prompt('Entry price:'));
    if (isNaN(entryPrice)) return;
    
    addTradeToJournal({
        symbol: symbol.toUpperCase(),
        type: type,
        entryPrice: entryPrice,
        exitPrice: null
    });
    
    displayTradingJournal();
    showNotification('Trade added to journal', 'success');
}

function updateSidebar() {
    document.getElementById('sidebar-watchlist').textContent = AppState.watchlist.length;
}

window.addToWatchlistWithNotif = addToWatchlistWithNotif;
window.removeFromWatchlistWithNotif = removeFromWatchlistWithNotif;
window.editNotes = editNotes;
window.clearWatchlist = clearWatchlist;
window.exportWatchlist = exportWatchlist;
window.showAddTradeModal = showAddTradeModal;
