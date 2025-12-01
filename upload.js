// Upload Page JavaScript

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');

if (uploadArea && fileInput) {
    // Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('drag-over');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('drag-over');
        });
    });
    
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
}

function handleDrop(e) {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFile(file) {
    const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        showNotification('Неподдерживаемый формат файла', 'error');
        return;
    }
    
    showProgress();
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            parseFile(e.target.result, file);
        } catch (error) {
            console.error(error);
            showNotification('Ошибка при обработке файла', 'error');
            hideProgress();
        }
    };
    
    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsBinaryString(file);
    }
}

function parseFile(data, file) {
    let parsedData = [];
    
    if (file.name.endsWith('.csv')) {
        // Parse CSV
        const results = Papa.parse(data, { header: true });
        parsedData = results.data;
    } else {
        // Parse Excel
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        parsedData = XLSX.utils.sheet_to_json(firstSheet);
    }
    
    // Validate and preview
    validateAndPreview(parsedData, file);
}

function validateAndPreview(data, file) {
    const requiredFields = ['Symbol', 'Last'];
    const hasRequired = requiredFields.every(field => 
        data.length > 0 && field in data[0]
    );
    
    if (!hasRequired) {
        showNotification('Файл не содержит обязательных полей', 'error');
        hideProgress();
        return;
    }
    
    // Show preview
    document.getElementById('previewSection').style.display = 'block';
    document.getElementById('previewFileName').textContent = file.name;
    document.getElementById('previewRows').textContent = data.length;
    document.getElementById('previewTickers').textContent = new Set(data.map(d => d.Symbol)).size;
    
    // Store temporarily
    window.tempUploadData = data;
    
    hideProgress();
    showNotification('Файл загружен. Проверьте данные.', 'success');
}

function confirmUpload() {
    if (!window.tempUploadData) return;
    
    const existingData = getOptionsData();
    const newData = [...existingData, ...window.tempUploadData];
    
    saveOptionsData(newData);
    showNotification(`Добавлено ${window.tempUploadData.length} записей`, 'success');
    
    // Reset
    document.getElementById('previewSection').style.display = 'none';
    window.tempUploadData = null;
    
    // Redirect to database
    setTimeout(() => {
        window.location.href = 'database.html';
    }, 1500);
}

function cancelUpload() {
    window.tempUploadData = null;
    document.getElementById('previewSection').style.display = 'none';
}

function showProgress() {
    document.getElementById('uploadProgress').style.display = 'block';
}

function hideProgress() {
    document.getElementById('uploadProgress').style.display = 'none';
}

function loadDemoData() {
    showProgress();
    document.getElementById('uploadFileName').textContent = 'Загрузка демо-данных...';
    
    fetch('data/demo-data.json')
        .then(response => {
            if (!response.ok) throw new Error('Demo data not found');
            return response.json();
        })
        .then(data => {
            // Clear existing data first
            localStorage.removeItem('options_data');
            
            // Save demo data
            saveOptionsData(data);
            hideProgress();
            showNotification(`Загружено ${data.length} демо-записей`, 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        })
        .catch(err => {
            console.error(err);
            hideProgress();
            showNotification('Ошибка загрузки демо-данных', 'error');
        });
}
