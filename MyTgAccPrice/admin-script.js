// База данных аккаунтов (в реальном проекте заменить на серверную часть)
let accounts = JSON.parse(localStorage.getItem('mrx_accounts')) || [
    {
        id: 1,
        name: "VIP 'Neon' Edition",
        type: "vip",
        price: 149,
        status: "available",
        date: "2023-10-15",
        description: "Премиум аккаунт с историей от 2015 года",
        age: 8,
        image: "assets/images/account-1.png",
        features: "2FA отключен\nСмена номера\nПолный доступ\nИстория"
    },
    {
        id: 2,
        name: "Business 'Quantum'",
        type: "business",
        price: 299,
        status: "available",
        date: "2023-10-20",
        description: "Идеален для бизнеса",
        age: 5,
        image: "assets/images/account-2.png",
        features: "Увеличенные лимиты\nAPI доступ\nБизнес-инструменты\nПриоритетная поддержка"
    },
    {
        id: 3,
        name: "Ghost 'Shadow'",
        type: "anonymous",
        price: 99,
        status: "sold",
        date: "2023-10-10",
        description: "Полная анонимность",
        age: 0,
        image: "assets/images/account-3.png",
        features: "Нет истории\nФейковые данные\nVPN рекомендации\nШифрование"
    }
];

let currentEditId = null;
let currentFilter = 'all';

// Сохранение данных в localStorage
function saveAccounts() {
    localStorage.setItem('mrx_accounts', JSON.stringify(accounts));
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    updateStats();
    loadAccountsTable();
    setupForm();
    setupModal();
    setupSearch();
});

// Навигация
function initNavigation() {
    // Навигация по боковой панели
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Удаляем активный класс
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.admin-main > section').forEach(s => s.classList.remove('active-section'));
            
            // Добавляем активный класс
            item.classList.add('active');
            const targetId = item.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active-section');
            
            // Обновляем заголовок
            updatePageTitle(item.querySelector('span').textContent);
        });
    });
    
    // Кнопка добавления в хедере
    document.querySelector('.add-btn').addEventListener('click', () => {
        document.querySelector('a[href="#add"]').click();
        resetForm();
    });
    
    // Кнопка обновления
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadAccountsTable();
        updateStats();
        showNotification('Данные обновлены', 'success');
    });
    
    // Выход
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if(confirm('Вы уверены, что хотите выйти?')) {
            window.location.href = 'index.html';
        }
    });
    
    // Кнопка "На сайт"
    document.querySelector('.back-btn').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'index.html';
    });
}

function updatePageTitle(title) {
    document.getElementById('pageTitle').textContent = title;
}

// Обновление статистики
function updateStats() {
    const total = accounts.length;
    const available = accounts.filter(acc => acc.status === 'available').length;
    const totalPrice = accounts.reduce((sum, acc) => sum + acc.price, 0);
    
    document.getElementById('totalAccounts').textContent = total;
    document.getElementById('availableAccounts').textContent = available;
    document.getElementById('accountsCount').textContent = total;
    
    // Обновляем суммы в статистике
    const priceElement = document.querySelector('.stat-card:nth-child(3) .stat-number');
    if(priceElement) {
        priceElement.textContent = `$${totalPrice}`;
    }
}

// Загрузка таблицы
function loadAccountsTable() {
    const tbody = document.getElementById('accountsTableBody');
    tbody.innerHTML = '';
    
    // Фильтрация
    let filteredAccounts = accounts;
    if(currentFilter === 'available') {
        filteredAccounts = accounts.filter(acc => acc.status === 'available');
    } else if(currentFilter === 'sold') {
        filteredAccounts = accounts.filter(acc => acc.status === 'sold');
    }
    
    filteredAccounts.forEach(account => {
        const row = document.createElement('tr');
        
        // Определяем статус
        let statusClass = '';
        let statusText = '';
        switch(account.status) {
            case 'available':
                statusClass = 'status-available';
                statusText = 'Доступен';
                break;
            case 'sold':
                statusClass = 'status-sold';
                statusText = 'Продан';
                break;
            case 'reserved':
                statusClass = 'status-reserved';
                statusText = 'Зарезервирован';
                break;
        }
        
        row.innerHTML = `
            <td>#${account.id}</td>
            <td>
                <strong>${account.name}</strong>
                <small style="display: block; color: var(--admin-text-secondary); font-size: 13px;">${account.description.substring(0, 50)}...</small>
            </td>
            <td>${getTypeName(account.type)}</td>
            <td>$${account.price}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${account.date}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-edit" data-id="${account.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" data-id="${account.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Обновляем счетчики
    document.getElementById('shownAccounts').textContent = filteredAccounts.length;
    document.getElementById('totalAccountsTable').textContent = accounts.length;
    
    // Добавляем обработчики кнопок
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editAccount(parseInt(btn.dataset.id)));
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => confirmDelete(parseInt(btn.dataset.id)));
    });
    
    // Настройка фильтров
    setupFilters();
}

function getTypeName(type) {
    const types = {
        'vip': 'VIP',
        'business': 'Бизнес',
        'anonymous': 'Анонимный',
        'premium': 'Премиум'
    };
    return types[type] || type;
}

// Фильтры
function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Убираем активный класс
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // Добавляем активный класс текущему
            btn.classList.add('active');
            // Устанавливаем фильтр
            currentFilter = btn.dataset.filter;
            // Перезагружаем таблицу
            loadAccountsTable();
        });
    });
}

// Форма
function setupForm() {
    const form = document.getElementById('accountForm');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const clearBtn = document.getElementById('clearFormBtn');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveAccount();
    });
    
    cancelBtn.addEventListener('click', () => {
        document.querySelector('a[href="#accounts"]').click();
        resetForm();
    });
    
    clearBtn.addEventListener('click', resetForm);
}

function editAccount(id) {
    const account = accounts.find(acc => acc.id === id);
    if(!account) return;
    
    currentEditId = id;
    
    // Заполняем форму
    document.getElementById('editName').value = account.name;
    document.getElementById('editType').value = account.type;
    document.getElementById('editPrice').value = account.price;
    document.getElementById('editStatus').value = account.status;
    document.getElementById('editDescription').value = account.description;
    document.getElementById('editAge').value = account.age;
    document.getElementById('editImage').value = account.image;
    document.getElementById('editFeatures').value = account.features;
    
    // Меняем заголовок
    document.getElementById('editFormTitle').textContent = 'Редактировать аккаунт';
    
    // Переходим на форму
    document.querySelector('a[href="#add"]').click();
}

function saveAccount() {
    const name = document.getElementById('editName').value.trim();
    const price = parseInt(document.getElementById('editPrice').value);
    const description = document.getElementById('editDescription').value.trim();
    const type = document.getElementById('editType').value;
    const status = document.getElementById('editStatus').value;
    const age = parseInt(document.getElementById('editAge').value) || 0;
    const image = document.getElementById('editImage').value.trim();
    const features = document.getElementById('editFeatures').value.trim();
    
    // Валидация
    if(!name || !price || !description) {
        showNotification('Заполните обязательные поля!', 'error');
        return;
    }
    
    const newAccount = {
        id: currentEditId || accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) + 1 : 1,
        name: name,
        type: type,
        price: price,
        status: status,
        date: new Date().toISOString().split('T')[0],
        description: description,
        age: age,
        image: image || 'assets/images/account-1.png',
        features: features
    };
    
    if(currentEditId) {
        // Обновление существующего аккаунта
        const index = accounts.findIndex(acc => acc.id === currentEditId);
        if(index !== -1) {
            accounts[index] = newAccount;
            showNotification('Аккаунт обновлён!', 'success');
        }
    } else {
        // Добавление нового аккаунта
        accounts.push(newAccount);
        showNotification('Аккаунт добавлен!', 'success');
    }
    
    // Сохраняем в localStorage
    saveAccounts();
    
    // Обновляем данные
    updateStats();
    loadAccountsTable();
    resetForm();
    
    // Возвращаемся к таблице
    document.querySelector('a[href="#accounts"]').click();
}

function resetForm() {
    document.getElementById('accountForm').reset();
    document.getElementById('editFormTitle').textContent = 'Добавить новый аккаунт';
    currentEditId = null;
    document.getElementById('editImage').value = 'assets/images/account-1.png';
    document.getElementById('editType').value = 'vip';
    document.getElementById('editStatus').value = 'available';
}

// Удаление
function confirmDelete(id) {
    const account = accounts.find(acc => acc.id === id);
    if(!account) return;
    
    showModal(
        `Вы уверены, что хотите удалить аккаунт "${account.name}"?`,
        () => deleteAccount(id)
    );
}

function deleteAccount(id) {
    accounts = accounts.filter(acc => acc.id !== id);
    saveAccounts();
    updateStats();
    loadAccountsTable();
    showNotification('Аккаунт удалён!', 'success');
}

// Модальное окно
function setupModal() {
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelActionBtn');
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    document.getElementById('confirmActionBtn').addEventListener('click', () => {
        if(window.modalCallback) {
            window.modalCallback();
            window.modalCallback = null;
        }
        closeModal();
    });
}

function showModal(message, callback) {
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('confirmModal').classList.add('active');
    window.modalCallback = callback;
}

function closeModal() {
    document.getElementById('confirmModal').classList.remove('active');
    window.modalCallback = null;
}

// Поиск
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            if(searchTerm.length === 0) {
                loadAccountsTable();
                return;
            }
            
            const filtered = accounts.filter(account => 
                account.name.toLowerCase().includes(searchTerm) ||
                account.description.toLowerCase().includes(searchTerm) ||
                account.type.toLowerCase().includes(searchTerm)
            );
            
            updateTableWithSearch(filtered);
        });
    }
}

function updateTableWithSearch(filteredAccounts) {
    const tbody = document.getElementById('accountsTableBody');
    tbody.innerHTML = '';
    
    filteredAccounts.forEach(account => {
        const row = document.createElement('tr');
        
        let statusClass = '';
        let statusText = '';
        switch(account.status) {
            case 'available':
                statusClass = 'status-available';
                statusText = 'Доступен';
                break;
            case 'sold':
                statusClass = 'status-sold';
                statusText = 'Продан';
                break;
            case 'reserved':
                statusClass = 'status-reserved';
                statusText = 'Зарезервирован';
                break;
        }
        
        row.innerHTML = `
            <td>#${account.id}</td>
            <td>
                <strong>${account.name}</strong>
                <small style="display: block; color: var(--admin-text-secondary); font-size: 13px;">${account.description.substring(0, 50)}...</small>
            </td>
            <td>${getTypeName(account.type)}</td>
            <td>$${account.price}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${account.date}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-edit" data-id="${account.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" data-id="${account.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Обновляем обработчики
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editAccount(parseInt(btn.dataset.id)));
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => confirmDelete(parseInt(btn.dataset.id)));
    });
    
    document.getElementById('shownAccounts').textContent = filteredAccounts.length;
}

// Уведомления
function showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    
    let icon = 'info-circle';
    if(type === 'success') icon = 'check-circle';
    if(type === 'error') icon = 'exclamation-circle';
    if(type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Автоматическое скрытие
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if(notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Добавляем стили для уведомлений
    if(!document.getElementById('admin-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'admin-notification-styles';
        style.textContent = `
            .admin-notification {
                position: fixed;
                top: 30px;
                right: 30px;
                background: var(--admin-surface);
                border: 1px solid var(--admin-border);
                border-radius: 12px;
                padding: 16px 20px;
                min-width: 300px;
                transform: translateX(400px);
                transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            
            .admin-notification.show {
                transform: translateX(0);
            }
            
            .admin-notification.success {
                border-color: var(--admin-success);
            }
            
            .admin-notification.error {
                border-color: var(--admin-error);
            }
            
            .admin-notification.warning {
                border-color: var(--admin-warning);
            }
            
            .admin-notification.info {
                border-color: var(--admin-primary);
            }
            
            .admin-notification i {
                font-size: 20px;
            }
            
            .admin-notification.success i {
                color: var(--admin-success);
            }
            
            .admin-notification.error i {
                color: var(--admin-error);
            }
            
            .admin-notification.warning i {
                color: var(--admin-warning);
            }
            
            .admin-notification.info i {
                color: var(--admin-primary);
            }
            
            .admin-notification span {
                flex: 1;
            }
        `;
        document.head.appendChild(style);
    }
}