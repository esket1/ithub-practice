const API_BASE = 'http://localhost:3000/api';

function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (tabId === 'digital') loadDigital();
}

async function searchPhysicalBooks() {
    const author = document.getElementById('authorSearch').value;
    const res = await fetch(`${API_BASE}/physical/books?author=${author}`);
    const books = await res.json();
    
    const tbody = document.querySelector('#physicalBooksTable tbody');
    tbody.innerHTML = '';
    
    books.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${b.inventory_number}</td>
            <td>${b.title}</td>
            <td>${b.author}</td>
            <td>${b.status}</td>
            <td>
                ${b.status === 'available' ? 
                `<button onclick="loanBook('${b.inventory_number}')">Выдать</button>` : 'Недоступна'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function loanBook(inventory_number) {
    const reader_card = prompt("Введите номер читательского билета:");
    if (!reader_card) return;

    const res = await fetch(`${API_BASE}/physical/loan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory_number, reader_card })
    });
    
    const result = await res.json();
    alert(result.message);
    searchPhysicalBooks();
}

async function loadDigital() {
    const res = await fetch(`${API_BASE}/digital/resources`);
    const resources = await res.json();
    
    const list = document.getElementById('digitalList');
    list.innerHTML = '';
    
    resources.forEach(r => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${r.title}</strong> (${r.format}) - Скачано: ${r.downloadCount} раз
            <button onclick="downloadResource('${r._id}')">Скачать</button>
        `;
        list.appendChild(li);
    });
}

async function downloadResource(resourceId) {
    const res = await fetch(`${API_BASE}/digital/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId, userId: 'user-123' })
    });
    const result = await res.json();
    if(result.success) {
        alert("Загрузка началась! Ссылка: " + result.link);
        loadDigital();
    }
}