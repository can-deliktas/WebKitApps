document.addEventListener('DOMContentLoaded', () => {
    const rollBtn = document.getElementById('rollBtn');
    const diceContainer = document.getElementById('diceContainer');
    const diceCountInput = document.getElementById('diceCount');
    const dieColorInput = document.getElementById('dieColor');
    const dotColorInput = document.getElementById('dotColor');
    const dieShapeSelect = document.getElementById('dieShape');
    const totalDisplay = document.getElementById('totalDisplay');
    const totalValueSpan = document.getElementById('totalValue');

    // Ses efekti (basit bir pop sesi oluşturmak için AudioContext kullanılabilir ama şimdilik sessiz)

    // Uygulama başladığında varsayılan zarları göster
    createDice(2);

    rollBtn.addEventListener('click', () => {
        const count = parseInt(diceCountInput.value) || 1;
        // Limit dice count to prevent browser crash
        const safeCount = Math.min(Math.max(count, 1), 50);
        rollDice(safeCount);
    });

    // Ayarlar değiştikçe canlı güncelleme
    dieColorInput.addEventListener('input', updateStyles);
    dotColorInput.addEventListener('input', updateStyles);
    dieShapeSelect.addEventListener('change', updateStyles);

    function createDice(count) {
        diceContainer.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const die = document.createElement('div');
            die.className = 'die';
            // Başlangıçta rastgele bir yüz
            die.dataset.face = Math.floor(Math.random() * 6) + 1;

            // Noktaları oluştur (maksimum 6 nokta)
            for (let j = 0; j < 6; j++) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                die.appendChild(dot);
            }

            diceContainer.appendChild(die);
        }
        updateStyles();
    }

    function rollDice(count) {
        // Önce zarları oluştur (eğer sayı değiştiyse)
        if (diceContainer.children.length !== count) {
            createDice(count);
        }

        const dice = Array.from(diceContainer.children);
        let total = 0;

        // Animasyon ve değer atama
        dice.forEach((die, index) => {
            // Animasyon sınıfını ekle
            die.classList.remove('is-rolling');
            void die.offsetWidth; // Trigger reflow
            die.classList.add('is-rolling');

            // Rastgele değer
            const result = Math.floor(Math.random() * 6) + 1;
            total += result;

            // Animasyon bitimine yakın değeri güncelle (daha gerçekçi görünüm için hemen değil)
            setTimeout(() => {
                die.dataset.face = result;
            }, 300);
        });

        // Toplam sonucu göster
        totalDisplay.classList.remove('visible');
        setTimeout(() => {
            totalValueSpan.textContent = total;
            totalDisplay.classList.add('visible');
        }, 600);
    }

    function updateStyles() {
        const dice = document.querySelectorAll('.die');
        const dots = document.querySelectorAll('.dot');
        const bgColor = dieColorInput.value;
        const dColor = dotColorInput.value;
        const shape = dieShapeSelect.value;

        document.documentElement.style.setProperty('--die-bg', bgColor);
        document.documentElement.style.setProperty('--die-dot', dColor);

        dice.forEach(die => {
            if (shape === 'circle') {
                die.classList.add('circle');
            } else {
                die.classList.remove('circle');
            }
        });
    }
});
