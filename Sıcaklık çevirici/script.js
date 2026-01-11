document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amount');
    const fromUnitSelect = document.getElementById('fromUnit');
    const toUnitSelect = document.getElementById('toUnit');
    const convertBtn = document.getElementById('convertBtn');
    const swapBtn = document.getElementById('swapBtn');

    // Result elements
    const resultBox = document.getElementById('resultBox');
    const resultText = document.getElementById('resultText');
    const resultDetail = document.getElementById('resultDetail');

    // Alert elements
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');

    // Hide alerts/results function
    const resetUI = () => {
        alertBox.classList.add('hidden');
        resultBox.classList.add('hidden');
    };

    // Swap functionality
    swapBtn.addEventListener('click', () => {
        const fromVal = fromUnitSelect.value;
        const toVal = toUnitSelect.value;

        fromUnitSelect.value = toVal;
        toUnitSelect.value = fromVal;

        resetUI();
    });

    // Conversion Logic
    convertBtn.addEventListener('click', () => {
        resetUI();

        const amount = parseFloat(amountInput.value);
        const fromUnit = fromUnitSelect.value;
        const toUnit = toUnitSelect.value;

        // Validation 1: Check if input is a valid number
        if (isNaN(amount)) {
            showAlert('Lütfen geçerli bir sayı giriniz.');
            return;
        }

        // Validation 2: Check if units are the same
        if (fromUnit === toUnit) {
            showAlert('Giriş ve hedef birim aynı olamaz.');
            return;
        }

        // Perform calculation
        let result;
        try {
            result = convertTemperature(amount, fromUnit, toUnit);
            showResult(result, toUnit);
        } catch (error) {
            console.error(error);
            showAlert('Bir hata oluştu.');
        }
    });

    function showAlert(message) {
        alertMessage.textContent = message;
        alertBox.classList.remove('hidden');
    }

    function showResult(value, unit) {
        // Format the number nicely (max 2 decimals, but don't show .00)
        const formattedValue = parseFloat(value.toFixed(2));

        let unitSymbol = '';
        switch (unit) {
            case 'C': unitSymbol = '°C'; break;
            case 'F': unitSymbol = '°F'; break;
            case 'K': unitSymbol = 'K'; break;
        }

        resultText.textContent = `${formattedValue} ${unitSymbol}`;
        resultDetail.textContent = `Sonuç başarıyla hesaplandı.`; // Or generic text
        resultBox.classList.remove('hidden');
    }

    function convertTemperature(val, from, to) {
        // Convert input to Celsius first
        let celsius;

        if (from === 'C') {
            celsius = val;
        } else if (from === 'F') {
            celsius = (val - 32) * 5 / 9;
        } else if (from === 'K') {
            celsius = val - 273.15;
        }

        // Convert Celsius to target
        if (to === 'C') {
            return celsius;
        } else if (to === 'F') {
            return (celsius * 9 / 5) + 32;
        } else if (to === 'K') {
            return celsius + 273.15;
        }
    }

    // Auto hide result/alert when input changes
    amountInput.addEventListener('input', resetUI);
    fromUnitSelect.addEventListener('change', resetUI);
    toUnitSelect.addEventListener('change', resetUI);
});
