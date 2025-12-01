let currentView = 'all';
let currentPage = 1;
let rowsPerPage = 50;
let sortColumn = 'Date';
let sortDirection = 'desc';

document.addEventListener('DOMContentLoaded', function() {
    initDatabase();
});

function initDatabase() {
    loadExistingData();
    displayData();
    updateSidebarStats();
}

function displayData() {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    
    if (AppState.filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No data available. <a href="upload.html">Upload data</a> to get started.</td></tr>';
        updateTableInfo(0, 0);
        return;
    }
    
    // Sort data
    const sortedData = sortData(AppState.filteredData, sortColumn, sortDirection);
    
    // Paginate
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = sortedData.slice(start, end);
    
    tbody.innerHTML = pageData.map(row => `
        <tr>
            <td><strong>${row.Symbol || 'N/A'}</strong></td>
            <td>${formatDate(row.Date)}</td>
            <td>${formatCurrency(row.Last)}</td>
            <td class="${getChangeClass(row.Change)}">
                ${row.Change > 0 ? '↑' : row.Change < 0 ? '↓' : ''} ${formatCurrency(Math.abs(row.Change || 0))}
            </td>
            <td>${formatNumber(row['P/C Vol'])}</td>
            <td>${formatNumber(row['Options Vol'], 0)}</td>
            <td>${formatPercent((row['IV Rank'] || 0) * 100, 0)}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="addToWatchlistWithNotif('${row.Symbol}')">⭐</button>
            </td>
        </tr>
    `).join('');
    
    updateTableInfo(pageData.length, sortedData.length);
    renderPagination(sortedData.length);
}

function updateTableInfo(showing, total) {
    document.getElementById('showing-count').textContent = showing;
    document.getElementById('total-count').textContent = total;
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous
    html += `<button class="btn btn-outline" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`;
    
    // Pages
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        const active = i === currentPage ? 'btn-primary' : 'btn-outline';
        html += `<button class="btn ${active}" onclick="goToPage(${i})">${i}</button>`;
    }
    
    if (totalPages > 5) {
        html += `<span>...</span>`;
        html += `<button class="btn btn-outline" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }
    
    // Next
    html += `<button class="btn btn-outline" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
    
    pagination.innerHTML = html;
}

function goToPage(page) {
    const totalPages = Math.ceil(AppState.filteredData.length / rowsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayData();
}

function sortTable(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'desc';
    }
    
    currentPage = 1;
    displayData();
}

function applyFilters() {
    const filters = {
        symbol: document.getElementById('filter-symbol').value,
        dateFrom: document.getElementById('filter-date-from').value,
        dateTo: document.getElementById('filter-date-to').value,
        pcMin: parseFloat(document.getElementById('filter-pc-min').value) || null,
        pcMax: parseFloat(document.getElementById('filter-pc-max').value) || null,
        ivMin: parseFloat(document.getElementById('filter-iv-min').value) || null,
        ivMax: parseFloat(document.getElementById('filter-iv-max').value) || null
    };
    
    filterData(filters);
    currentPage = 1;
    displayData();
    updateSidebarStats();
    
    showNotification('Filters applied', 'success');
}

function resetFilters() {
    document.getElementById('filter-symbol').value = '';
    document.getElementById('filter-date-from').value = '';
    document.getElementById('filter-date-to').value = '';
    document.getElementById('filter-pc-min').value = '';
    document.getElementById('filter-pc-max').value = '';
    document.getElementById('filter-iv-min').value = '';
    document.getElementById('filter-iv-max').value = '';
    
    AppState.filteredData = AppState.data;
    currentPage = 1;
    displayData();
    updateSidebarStats();
    
    showNotification('Filters reset', 'info');
}

function switchView(view) {
    currentView = view;
    
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update display based on view
    // (For now, just refresh - implement grouped/daily view as needed)
    displayData();
}

function updateSidebarStats() {
    document.getElementById('sidebar-total-records').textContent = AppState.data.length.toLocaleString();
    document.getElementById('sidebar-filtered').textContent = AppState.filteredData.length.toLocaleString();
}

function addToWatchlistWithNotif(symbol) {
    const added = addToWatchlist(symbol);
    if (added) {
        showNotification(`${symbol} added to watchlist!`, 'success');
    } else {
        showNotification(`${symbol} is already in watchlist.`, 'info');
    }
}

window.goToPage = goToPage;
window.sortTable = sortTable;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.switchView = switchView;
window.addToWatchlistWithNotif = addToWatchlistWithNotif;
