const balanceEl = document.getElementById('total-balance');
const money_plusEl = document.getElementById('total-income');
const money_minusEl = document.getElementById('total-expense');
const list = document.getElementById('list');
const form = document.getElementById('transaction-form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const recommendationCard = document.getElementById('recommendation-card');
const recommendationList = document.getElementById('recommendation-list');

// LocalStorage'dan verileri al
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));

let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// İşlem ekleme
function addTransaction() {
    if (text.value.trim() === '' || amount.value.trim() === '') {
        alert('Lütfen açıklama ve tutar giriniz');
        return;
    }

    const transaction = {
        id: generateID(),
        text: text.value,
        amount: +amount.value
    };

    transactions.push(transaction);

    addTransactionDOM(transaction);
    updateValues();
    updateLocalStorage();

    text.value = '';
    amount.value = '';
}

// Rastgele ID oluşturma
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// DOM'a işlem ekleme
function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    const item = document.createElement('li');

    item.classList.add('transaction-item');

    // Format amount for nice display
    const absAmount = Math.abs(transaction.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 });

    item.innerHTML = `
        <div class="transaction-info">
            <h4>${transaction.text}</h4>
            <span>${new Date().toLocaleDateString('tr-TR')}</span> 
        </div>
        <span class="transaction-amount ${transaction.amount < 0 ? 'minus' : 'plus'}">
            ${sign}₺${absAmount}
        </span>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
            🗑️
        </button>
    `;

    list.prepend(item); // En yeni en üstte
}

// Bakiyeyi güncelleme
function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);

    const total = amounts.reduce((acc, item) => (acc += item), 0);

    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0);

    const expense = (
        amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1
    );

    balanceEl.innerText = `₺${total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
    money_plusEl.innerText = `+₺${income.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
    money_minusEl.innerText = `-₺${expense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

    generateRecommendations(total, income, expense);
}

// İşlem silme
function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    init();
}

// LocalStorage güncelleme
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Tavsiye oluşturma mantığı
function generateRecommendations(total, income, expense) {
    recommendationList.innerHTML = '';
    const suggestions = [];

    // Gelir/Gider oranına göre basit mantık
    if (income > 0) {
        const expenseRatio = (expense / income) * 100;

        if (total < 0) {
            suggestions.push({
                icon: '🚨',
                text: 'Mevcut bakiyeniz eksiye düşmüş durumda! Acil olarak gereksiz harcamaları kısmalısınız.'
            });
            suggestions.push({
                icon: '📉',
                text: 'Borçlarınızı yapılandırmayı veya ek gelir kaynakları araştırmayı düşünebilirsiniz.'
            });
        } else if (expenseRatio > 80) {
            suggestions.push({
                icon: '⚠️',
                text: 'Gelirinizin %80\'inden fazlasını harcıyorsunuz. Tasarruf için riskli bir bölge.'
            });
            suggestions.push({
                icon: '☕',
                text: 'Dışarıda yeme-içme veya abonelikler gibi küçük giderleri gözden geçirin.'
            });
        } else if (expenseRatio > 50) {
            suggestions.push({
                icon: '📊',
                text: 'Bütçeniz dengeli görünüyor, ancak beklenmedik durumlar için birikim yapmaya başlayabilirsiniz.'
            });
        } else {
            suggestions.push({
                icon: '🌟',
                text: 'Harika gidiyorsunuz! Gelirinizin büyük kısmını koruyorsunuz. Yatırım yapmayı düşünebilirsiniz.'
            });
        }
    } else if (expense > 0 && income === 0) {
        suggestions.push({
            icon: '🛑',
            text: 'Hiç gelir girişi yok ancak gideriniz var. Lütfen gelirlerinizi de ekleyin.'
        });
    }

    if (suggestions.length > 0) {
        recommendationCard.style.display = 'block';
        suggestions.forEach(rec => {
            const li = document.createElement('li');
            li.classList.add('recommendation-item');
            li.innerHTML = `<span class="icon">${rec.icon}</span><span>${rec.text}</span>`;
            recommendationList.appendChild(li);
        });
    } else {
        recommendationCard.style.display = 'none';
    }
}

// Başlatma
function init() {
    list.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
}

init();

// Enter tuşu ile form gönderme
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addTransaction();
    }
});
