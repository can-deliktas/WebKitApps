const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const resultContainer = document.getElementById('result-container');
const rateInfo = document.getElementById('rate-info');
const resultValue = document.getElementById('result-value');
const messageArea = document.getElementById('message-area');
const convertBtn = document.getElementById('convert-btn');
const swapBtn = document.getElementById('swap-btn');
const fromFlag = document.getElementById('from-flag');
const toFlag = document.getElementById('to-flag');

// Common currencies with country codes for flags
const currencies = [
    { code: 'USD', name: 'US Dollar', country: 'US' },
    { code: 'EUR', name: 'Euro', country: 'EU' },
    { code: 'TRY', name: 'Turkish Lira', country: 'TR' },
    { code: 'GBP', name: 'British Pound', country: 'GB' },
    { code: 'JPY', name: 'Japanese Yen', country: 'JP' },
    { code: 'CAD', name: 'Canadian Dollar', country: 'CA' },
    { code: 'AUD', name: 'Australian Dollar', country: 'AU' },
    { code: 'CHF', name: 'Swiss Franc', country: 'CH' },
    { code: 'CNY', name: 'Chinese Yuan', country: 'CN' },
    { code: 'RUB', name: 'Russian Ruble', country: 'RU' }
];

// Populate select options
function populateCurrencies() {
    currencies.forEach(currency => {
        const option1 = document.createElement('option');
        option1.value = currency.code;
        option1.text = `${currency.code} - ${currency.name}`;
        option1.dataset.country = currency.country;

        const option2 = option1.cloneNode(true);

        fromCurrency.appendChild(option1);
        toCurrency.appendChild(option2);
    });

    // Set defaults
    fromCurrency.value = 'USD';
    toCurrency.value = 'TRY';
    updateFlags();
}

// Update flags based on selection
function updateFlags() {
    const fromOption = fromCurrency.options[fromCurrency.selectedIndex];
    const toOption = toCurrency.options[toCurrency.selectedIndex];

    if (fromOption) {
        fromFlag.src = `https://flagsapi.com/${fromOption.dataset.country}/flat/64.png`;
    }
    if (toOption) {
        toFlag.src = `https://flagsapi.com/${toOption.dataset.country}/flat/64.png`;
    }
}

// Swap currencies
function swapCurrencies() {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    updateFlags();
    messageArea.textContent = ''; // Clear any errors
    resultContainer.classList.remove('active');
}

// Fetch exchange rates and convert
async function convertCurrency(e) {
    if (e) e.preventDefault();

    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;

    // Validate inputs
    if (isNaN(amount) || amount <= 0) {
        messageArea.textContent = 'Lütfen geçerli bir miktar giriniz.';
        return;
    }

    // Check if currencies are the same
    if (from === to) {
        messageArea.textContent = 'Uyarı: Kaynak ve hedef para birimi aynı olamaz.';
        resultContainer.classList.remove('active');
        return;
    }

    messageArea.textContent = '';
    convertBtn.textContent = 'Çevriliyor...';
    convertBtn.disabled = true;

    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
        const data = await response.json();

        if (!data || !data.rates) {
            throw new Error('Kur bilgisi alınamadı.');
        }

        const rate = data.rates[to];
        const result = (amount * rate).toFixed(2);

        // Display results
        rateInfo.textContent = `1 ${from} = ${rate} ${to}`;
        resultValue.textContent = `${result} ${to}`;
        resultContainer.classList.add('active');

    } catch (error) {
        console.error('Hata:', error);
        messageArea.textContent = 'Bir hata oluştu. Lütfen bağlantınızı kontrol edin.';
    } finally {
        convertBtn.textContent = 'Çevir';
        convertBtn.disabled = false;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', populateCurrencies);
fromCurrency.addEventListener('change', updateFlags);
toCurrency.addEventListener('change', updateFlags);
swapBtn.addEventListener('click', swapCurrencies);
document.getElementById('converter-form').addEventListener('submit', convertCurrency);
