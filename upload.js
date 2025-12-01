// Upload Page JavaScript

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadProgress = document.getElementById('uploadProgress');
const previewSection = document.getElementById('previewSection');

let tempUploadData = null;

// Initialize
if (dropZone && fileInput) {
    // Click to browse
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File selected
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });
    
    // Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        });
    });
    
    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
}

function handleFile(file) {
    // Check file type
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExt) && !validTypes.includes(file.type)) {
        alert('Invalid file type. Please upload Excel (.xlsx, .xls) or CSV (.csv) files.');
        return;
    }
    
    showProgress();
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            parseFile(e.target.result, file);
        } catch (error) {
            console.error('Error parsing file:', error);
            alert('Error processing file: ' + error.message);
            hideProgress();
        }
    };
    
    if (fileExt === '.csv') {
        reader.readAsText(file);
    } else {
        reader.readAsBinaryString(file);
    }
}

function parseFile(data, file) {
    let parsedData = [];
    
    try {
        if (file.name.endsWith('.csv')) {
            // Simple CSV parsing
            const lines = data.split('\n');
            const headers = lines[0].split(',');
            
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = lines[i].split(',');
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header.trim()] = values[index] ? values[index].trim() : '';
                    });
                    parsedData.push(obj);
                }
            }
        } else {
            // Excel parsing
            if (typeof XLSX !== 'undefined') {
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                parsedData = XLSX.utils.sheet_to_json(firstSheet);
            } else {
                throw new Error('XLSX library not loaded');
            }
        }
        
        if (parsedData.length === 0) {
            throw new Error('No data found in file');
        }
        
        showPreview(parsedData, file.name);
        hideProgress();
        
    } catch (error) {
        console.error('Parse error:', error);
        alert('Error parsing file: ' + error.message);
        hideProgress();
    }
}

function showPreview(data, filename) {
    tempUploadData = data;
    
    document.getElementById('previewFilename').textContent = filename;
    document.getElementById('previewRows').textContent = data.length;
    
    const uniqueTickers = new Set(data.map(d => d.Symbol || d.symbol));
    document.getElementById('previewTickers').textContent = uniqueTickers.size;
    
    // Show first 5 rows
    const previewBody = document.getElementById('previewBody');
    previewBody.innerHTML = '';
    
    for (let i = 0; i < Math.min(5, data.length); i++) {
        const row = data[i];
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.Symbol || row.symbol || '-'}</td>
            <td>${row.Date || row.date || '-'}</td>
            <td>${row.Last || row.last || '-'}</td>
            <td>${row['P/C Vol'] || row.pc_vol || '-'}</td>
            <td>${row['Options Vol'] || row.options_vol || '-'}</td>
            <td>${row['IV Rank'] || row.iv_rank || '-'}</td>
        `;
        previewBody.appendChild(tr);
    }
    
    previewSection.style.display = 'block';
}

function confirmUpload() {
    if (!tempUploadData) return;
    
    // Get existing data
    const existingData = localStorage.getItem('options_data');
    let allData = existingData ? JSON.parse(existingData) : [];
    
    // Merge new data
    allData = [...allData, ...tempUploadData];
    
    // Save
    localStorage.setItem('options_data', JSON.stringify(allData));
    
    alert(`Successfully imported ${tempUploadData.length} records!`);
    
    // Reset
    tempUploadData = null;
    previewSection.style.display = 'none';
    fileInput.value = '';
    
    // Redirect to database
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function cancelUpload() {
    tempUploadData = null;
    previewSection.style.display = 'none';
    fileInput.value = '';
}

function showProgress() {
    uploadProgress.style.display = 'block';
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = '50%';
}

function hideProgress() {
    uploadProgress.style.display = 'none';
}

function loadDemoData() {
    showProgress();
    document.getElementById('progressText').textContent = 'Loading demo data...';
    
    fetch('data/demo-data.json')
        .then(response => {
            if (!response.ok) throw new Error('Demo data not found');
            return response.json();
        })
        .then(data => {
            localStorage.setItem('options_data', JSON.stringify(data));
            hideProgress();
            alert(`Loaded ${data.length} demo records!`);
            setTimeout(() => window.location.href = 'index.html', 1000);
        })
        .catch(err => {
            console.error(err);
            hideProgress();
            alert('Error loading demo data. Please upload your own file.');
        });
}

function clearHistory() {
    if (confirm('Clear all upload history?')) {
        alert('History cleared');
    }
}

console.log('Upload.js loaded');
