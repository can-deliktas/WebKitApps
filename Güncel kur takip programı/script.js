
// Constants
const BASE_API_URL = 'https://api.exchangerate-api.com/v4/latest/';
const REFRESH_INTERVAL = 60000; // 1 minute
let currentRates = {};
let lastRates = {}; // To calculate change
let alarms = [];

// DOM Elements
const currencyElements = {
    USD: { price: document.getElementById('usd-price'), change: document.getElementById('usd-change') },
    EUR: { price: document.getElementById('eur-price'), change: document.getElementById('eur-change') },
    GBP: { price: document.getElementById('gbp-price'), change: document.getElementById('gbp-change') },
    XAU: { price: document.getElementById('xau-price'), change: document.getElementById('xau-change') }
};
const lastUpdateEl = document.getElementById('last-update-time');
const clockEl = document.getElementById('clock');
const themeToggle = document.getElementById('theme-toggle');

// Converter Elements
const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('from-currency');
const toSelect = document.getElementById('to-currency');
const resultAmount = document.getElementById('result-amount');
const resultCurrency = document.getElementById('result-currency');
const swapBtn = document.getElementById('swap-btn');

// Alarm Elements
const alarmCurrencySelect = document.getElementById('alarm-currency');
const alarmConditionSelect = document.getElementById('alarm-condition');
const alarmValueInput = document.getElementById('alarm-value');
const addAlarmBtn = document.getElementById('add-alarm-btn');
const alarmsList = document.getElementById('active-alarms-list');
const notificationBtn = document.getElementById('enable-notifications');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initTheme();
    getData();
    loadAlarms();

    // Event Listeners
    swapBtn.addEventListener('click', swapCurrencies);
    amountInput.addEventListener('input', updateConverter);
    fromSelect.addEventListener('change', updateConverter);
    toSelect.addEventListener('change', updateConverter);
    addAlarmBtn.addEventListener('click', addAlarm);
    notificationBtn.addEventListener('click', requestNotificationPermission);

    // Periodically fetch data
    setInterval(getData, REFRESH_INTERVAL);
});

function initClock() {
    const updateTime = () => {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('tr-TR');
    };
    updateTime();
    setInterval(updateTime, 1000);
}

function initTheme() {
    const storedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', storedTheme);
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.innerHTML = newTheme === 'dark' ?
            '<i class="fa-regular fa-moon"></i>' :
            '<i class="fa-regular fa-sun"></i>';
    });
}

// Data Fetching
async function getData() {
    try {
        // Fetching USD base rates
        const res = await fetch(BASE_API_URL + 'USD');
        const data = await res.json();

        // Update timestamp
        const now = new Date();
        lastUpdateEl.textContent = now.toLocaleTimeString('tr-TR');

        processRates(data.rates);
    } catch (error) {
        console.error('Error fetching rates:', error);
        lastUpdateEl.textContent = 'Hata!';
    }
}

function processRates(rates) {
    // Store previous rates to calculate change
    if (Object.keys(currentRates).length > 0) {
        lastRates = { ...currentRates };
    }

    // We want rates in TRY. The API gives USD base.
    // USD/TRY = rates['TRY']
    // EUR/TRY = rates['TRY'] / rates['EUR']
    // GBP/TRY = rates['TRY'] / rates['GBP']
    // For Gold (XAU), standard APIs might not have it free. 
    // If XAU is available in rates (usually per oz in USD), we convert to Gram TRY.
    // 1 oz = 31.1035 gram.

    const usdTry = rates['TRY'];
    const eurTry = rates['TRY'] / rates['EUR'];
    const gbpTry = rates['TRY'] / rates['GBP'];

    let xauTry = 0;
    // Mocking Gold Rate if not in API (often the case for free generic tiers)
    // Or check if 'XAU' exists. 
    // Let's assume user wants USD, EUR, GBP primarily. 
    // Use a fixed calculation or another source if needed. 
    // For this demo, we'll try to find Real Gold data or approximate it.
    // Gold Price ~2000 USD/oz. 
    // (2000 * USD/TRY) / 31.10 = Gram/TRY
    // Let's use a mock base for Gold if not found, or calculate if 'XAU' is there.
    if (rates['XAU']) {
        // Price of 1 USD in XAU (usually very small number). 
        // Price of 1 XAU in USD = 1/rates['XAU']
        const xauUsd = 1 / rates['XAU'];
        xauTry = (xauUsd * usdTry) / 31.1034768;
    } else {
        // Fallback approximation (e.g. 2650 USD/oz constant for demo if API fails)
        const xauUsd = 2650;
        xauTry = (xauUsd * usdTry) / 31.1034768;
    }

    const newRates = {
        USD: usdTry,
        EUR: eurTry,
        GBP: gbpTry,
        XAU: xauTry
    };

    updateUI(newRates);
    currentRates = newRates;
    checkAlarms();

    // Update Converter Logic Base
    // We need all rates relative to something common or relative to USD.
    // We will simple store the raw 'rates' object from API globally for converter
    window.rawRates = rates;
}

function updateUI(rates) {
    updateCard('USD', rates.USD);
    updateCard('EUR', rates.EUR);
    updateCard('GBP', rates.GBP);
    updateCard('XAU', rates.XAU);

    // Initial converter run
    if (!amountInput.value) amountInput.value = 1;
    updateConverter();
}

function updateCard(currency, value) {
    const el = currencyElements[currency];
    if (!el) return;

    // Formatting
    const formatted = value.toFixed(2);
    el.price.textContent = formatted;

    // Change calculation
    if (lastRates[currency]) {
        const prev = lastRates[currency];
        const change = ((value - prev) / prev) * 100;
        const changeFormatted = Math.abs(change).toFixed(2);

        el.change.classList.remove('up', 'down', 'neutral');

        if (change > 0) {
            el.change.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> %${changeFormatted}`;
            el.change.classList.add('up');
        } else if (change < 0) {
            el.change.innerHTML = `<i class="fa-solid fa-arrow-trend-down"></i> %${changeFormatted}`;
            el.change.classList.add('down');
        } else {
            el.change.innerHTML = `<i class="fa-solid fa-minus"></i> %0.00`;
            el.change.classList.add('neutral');
        }
    }
}

// Converter Logic
function updateConverter() {
    if (!window.rawRates) return;

    const amount = parseFloat(amountInput.value) || 0;
    const from = fromSelect.value;
    const to = toSelect.value;

    // Convert 'from' to USD, then USD to 'to'
    // rates[from] is amount of 'from' per 1 USD
    // Val in USD = amount / rates[from]
    // Val in Target = Val in USD * rates[to]

    const rates = window.rawRates;
    let valInUsd = 0;

    if (from === 'USD') {
        valInUsd = amount;
    } else {
        valInUsd = amount / rates[from];
    }

    let result = 0;
    if (to === 'USD') {
        result = valInUsd;
    } else {
        result = valInUsd * rates[to];
    }

    resultAmount.textContent = result.toFixed(2);
    resultCurrency.textContent = to;
}

function swapCurrencies() {
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    updateConverter();
}

// Alarm Logic
function loadAlarms() {
    const stored = localStorage.getItem('alarms');
    if (stored) {
        alarms = JSON.parse(stored);
        renderAlarms();
    }
}

function saveAlarms() {
    localStorage.setItem('alarms', JSON.stringify(alarms));
    renderAlarms();
}

function addAlarm() {
    const currency = alarmCurrencySelect.value;
    const condition = alarmConditionSelect.value;
    const value = parseFloat(alarmValueInput.value);

    if (!value) {
        alert('Lütfen geçerli bir değer girin.');
        return;
    }

    const alarm = {
        id: Date.now(),
        currency,
        condition,
        value,
        active: true
    };

    alarms.push(alarm);
    saveAlarms();
    alarmValueInput.value = '';
}

function deleteAlarm(id) {
    alarms = alarms.filter(a => a.id !== id);
    saveAlarms();
}

function renderAlarms() {
    alarmsList.innerHTML = '';
    alarms.forEach(alarm => {
        const li = document.createElement('li');
        li.className = 'alarm-item';

        const conditionText = alarm.condition === 'gt' ? '>' : '<';

        li.innerHTML = `
            <div class="alarm-info">
                <span>${alarm.currency}</span>
                <span style="color: var(--accent-color); margin: 0 0.5rem">${conditionText}</span>
                <span>${alarm.value}</span>
            </div>
            <button class="delete-alarm-btn" onclick="deleteAlarm(${alarm.id})">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        alarmsList.appendChild(li);
    });
}

// Make deleteAlarm global so onclick works
window.deleteAlarm = deleteAlarm;

function checkAlarms() {
    if (!alarms.length) return;

    alarms.forEach(alarm => {
        if (!alarm.active) return;

        const currentRate = currentRates[alarm.currency];
        if (!currentRate) return;

        let triggered = false;

        if (alarm.condition === 'gt' && currentRate > alarm.value) {
            triggered = true;
        } else if (alarm.condition === 'lt' && currentRate < alarm.value) {
            triggered = true;
        }

        if (triggered) {
            sendNotification(`Kur Alarmı: ${alarm.currency}`,
                `${alarm.currency} değeri ${currentRate.toFixed(2)} oldu! (Hedef: ${alarm.condition === 'gt' ? '>' : '<'} ${alarm.value})`);

            // Disable alarm after trigger to prevent spam
            // alarm.active = false; 
            // Optional: remove it or keep it? Let's remove it for now.
            deleteAlarm(alarm.id);
        }
    });
}

// Notifications
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("Tarayıcınız bildirimleri desteklemiyor.");
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            notificationBtn.innerHTML = '<i class="fa-solid fa-check"></i> Bildirimler Açık';
            new Notification("KurTakip Pro", { body: "Bildirimler başarıyla aktif edildi!" });
        }
    });
}

function sendNotification(title, body) {
    if (Notification.permission === "granted") {
        new Notification(title, { body });
    }
}
