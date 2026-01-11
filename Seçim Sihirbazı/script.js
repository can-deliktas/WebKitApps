document.addEventListener('DOMContentLoaded', () => {
    const optionsInput = document.getElementById('optionsInput');
    const loopCountInput = document.getElementById('loopCount');
    const magicButton = document.getElementById('magicButton');
    const resultContainer = document.getElementById('resultContainer');
    const winnerResult = document.getElementById('winnerResult');
    const statsResult = document.getElementById('statsResult');
    const btnText = document.querySelector('.btn-text');

    magicButton.addEventListener('click', () => {
        // Girdiyi al ve temizle
        const rawText = optionsInput.value;
        // Satır veya virgülle ayır, boşlukları temizle, boş elemanları filtrele
        const options = rawText.split(/[\n,]+/)
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0);

        if (options.length === 0) {
            alert('Lütfen en az bir seçenek girin!');
            return;
        }

        const loopCount = parseInt(loopCountInput.value);
        if (isNaN(loopCount) || loopCount < 1) {
            alert('Geçerli bir tekrar sayısı girin (En az 1).');
            return;
        }

        // Animasyon başlangıcı
        startMagicEffect();

        // İşlem süresi simülasyonu (Kısa bir gecikme ekleyerek "düşünme" hissi verelim)
        setTimeout(() => {
            performSelection(options, loopCount);
            stopMagicEffect();
        }, 600);
    });

    function performSelection(options, count) {
        // Sonuçları saklamak için map
        const results = {};

        // Simülasyon döngüsü
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * options.length);
            const selected = options[randomIndex];
            results[selected] = (results[selected] || 0) + 1;
        }

        // Kazananı bul (En çok tekrar eden)
        let winner = '';
        let maxCount = -1;

        for (const [option, count] of Object.entries(results)) {
            if (count > maxCount) {
                maxCount = count;
                winner = option;
            }
        }

        // Sonucu Göster
        displayResult(winner, maxCount, count, results);
    }

    function displayResult(winner, winCount, totalLoops, allResults) {
        resultContainer.classList.remove('hidden');
        winnerResult.textContent = winner;

        // İstatistikleri göster (Eğer birden fazla döngü varsa)
        if (totalLoops > 1) {
            statsResult.classList.remove('hidden');
            statsResult.innerHTML = '<h3>Sonuç Dağılımı:</h3>';

            // Sonuçları çoktan aza sırala
            const sortedResults = Object.entries(allResults)
                .sort(([, a], [, b]) => b - a);

            sortedResults.forEach(([opt, count]) => {
                const percent = ((count / totalLoops) * 100).toFixed(1);
                const item = document.createElement('div');
                item.className = 'stat-item';
                item.innerHTML = `
                    <span class="stat-name">${opt}</span>
                    <span class="stat-count">${count} (%${percent})</span>
                `;
                statsResult.appendChild(item);
            });
        } else {
            statsResult.classList.add('hidden');
        }
    }

    function startMagicEffect() {
        magicButton.disabled = true;
        btnText.textContent = 'Karıştırılıyor...';
        resultContainer.classList.add('hidden');
    }

    function stopMagicEffect() {
        magicButton.disabled = false;
        btnText.textContent = 'Sihri Başlat';
    }
});
