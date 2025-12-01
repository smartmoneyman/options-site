# 🚨 КРАТКОЕ РЕШЕНИЕ - Сайт не показывает данные

## Проблема
Сайт загружается, но показывает "Loading data..." и "0 Total Tickers"

## Причина
Нет данных в LocalStorage + отсутствует файл с демо-данными

---

## ⚡ БЫСТРОЕ РЕШЕНИЕ (3 файла)

### 1️⃣ Создайте файл на GitHub: `data/demo-data.json`

**Путь:** https://github.com/smartmoneyman/options-site

**Действия:**
- Add file → Create new file
- Имя: `data/demo-data.json`
- Содержимое: возьмите из `outputs/options-site/data/demo-data.json`
- Commit changes

---

### 2️⃣ Обновите файл: `js/common.js`

**Найдите функцию (в конце файла):**
```javascript
function initializeSampleData() {
    const data = getOptionsData();
    if (data.length === 0) {
        fetch('data/recommendations_strong_buy.json')  // <-- СТАРАЯ СТРОКА
```

**Замените на:**
```javascript
function initializeSampleData() {
    const data = getOptionsData();
    if (data.length === 0) {
        fetch('data/demo-data.json')  // <-- НОВАЯ СТРОКА
            .then(response => {
                if (!response.ok) throw new Error('Demo data not found');
                return response.json();
            })
            .then(data => {
                saveOptionsData(data);
                console.log('Demo data loaded:', data.length, 'records');
                showNotification('Демо-данные загружены!', 'info');
                loadGlobalStats();
                
                if (typeof loadDashboard === 'function') loadDashboard();
                if (typeof loadDatabase === 'function') loadDatabase();
                if (typeof loadRecommendations === 'function') loadRecommendations();
            })
            .catch(err => {
                console.log('Demo data not available');
            });
```

---

### 3️⃣ Добавьте в конец файла: `js/upload.js`

**В самый конец добавьте:**
```javascript
function loadDemoData() {
    showProgress();
    document.getElementById('uploadFileName').textContent = 'Загрузка демо-данных...';
    
    fetch('data/demo-data.json')
        .then(response => {
            if (!response.ok) throw new Error('Demo data not found');
            return response.json();
        })
        .then(data => {
            localStorage.removeItem('options_data');
            saveOptionsData(data);
            hideProgress();
            showNotification(`Загружено ${data.length} демо-записей`, 'success');
            setTimeout(() => window.location.href = 'index.html', 1500);
        })
        .catch(err => {
            console.error(err);
            hideProgress();
            showNotification('Ошибка загрузки демо-данных', 'error');
        });
}
```

---

## ✅ Готово!

После этих изменений:
1. Подождите 2 минуты (GitHub Pages обновляется)
2. Обновите страницу с очисткой кеша: `Ctrl+Shift+R`
3. Откройте https://smartmoneyman.github.io/options-site/
4. Данные должны загрузиться автоматически!

---

## 🧪 Проверка

Откройте консоль браузера (F12):
- ✅ Должно быть: `Demo data loaded: 12 records`
- ✅ Не должно быть красных ошибок
- ✅ Dashboard показывает статистику

---

## 💡 Альтернатива

**Загрузите свой Excel файл:**
1. Перейдите: "Загрузка Данных"
2. Перетащите `UnusualStockOptionsVolume.xlsx`
3. Подтвердите загрузку
4. Данные появятся!

---

Все файлы для обновления находятся в папке `outputs/options-site/` 📁
