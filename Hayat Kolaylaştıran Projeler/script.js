/**
 * Hayat Kolaylaştıran Projeler - Unified Script
 */

// === ROUTER SYSTEM ===
const router = {
    currentApp: null,

    goHome: () => {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('global-header').classList.add('hidden');

        // Stop any running intervals
        if (apps.clock.interval) clearInterval(apps.clock.interval);
    },

    openApp: (appId) => {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        const target = document.getElementById(`app-${appId}`);
        if (target) {
            target.classList.remove('hidden');
            document.getElementById('global-header').classList.remove('hidden');
            document.getElementById('current-app-title').textContent = router.getAppTitle(appId);

            // Init logic if needed
            if (appId === 'clock') apps.clock.start();
            if (appId === 'budget') apps.budget.render();
            if (appId === 'vault') apps.vault.checkAuth();
        }
    },

    getAppTitle: (id) => {
        const titles = {
            'budget': 'Bütçe Takibi',
            'text-stats': 'Kelime Analizi',
            'currency': 'Döviz Çevirici',
            'password-gen': 'Şifre Oluşturucu',
            'decision': 'Karar Çarkı',
            'temp': 'Sıcaklık Çevirici',
            'dice': 'Zar At',
            'life-time': 'Yaşam Sayacı',
            'clock': 'Dijital Saat',
            'vault': 'Şifre Kasası',
            'rps': 'Taş Kağıt Makas',
            'hangman': 'Adam Asmaca'
        };
        return titles[id] || 'Uygulama';
    }
};

// === APP CONTROLLERS ===
const apps = {
    common: {
        copy: (el) => {
            navigator.clipboard.writeText(el.innerText);
            const orig = el.innerText;
            el.innerText = "Kopyalandı!";
            setTimeout(() => el.innerText = orig, 1000);
        }
    },

    // 1. BUDGET
    budget: {
        data: JSON.parse(localStorage.getItem('budgetItems')) || [],

        addEntry: () => {
            const type = document.getElementById('budget-type').value;
            const desc = document.getElementById('budget-desc').value;
            const amount = parseFloat(document.getElementById('budget-amount').value);

            if (!desc || isNaN(amount)) return alert('Lütfen geçerli veri girin.');

            apps.budget.data.push({ type, desc, amount, id: Date.now() });
            apps.budget.save();
            apps.budget.render();

            document.getElementById('budget-desc').value = '';
            document.getElementById('budget-amount').value = '';
        },

        save: () => localStorage.setItem('budgetItems', JSON.stringify(apps.budget.data)),

        render: () => {
            const list = document.getElementById('budget-list');
            list.innerHTML = '';
            let total = 0;

            apps.budget.data.forEach(item => {
                const li = document.createElement('li');
                li.className = 'list-item';
                li.innerHTML = `
                    <span>${item.desc}</span>
                    <span class="amount ${item.type}">
                        ${item.type === 'income' ? '+' : '-'}${item.amount} ₺
                    </span>
                    <i class="fa-solid fa-trash text-danger" onclick="apps.budget.delete(${item.id})" style="cursor:pointer"></i>
                `;
                list.appendChild(li);

                if (item.type === 'income') total += item.amount;
                else total -= item.amount;
            });

            document.getElementById('budget-total').textContent = total.toFixed(2);

            // Advice Logic
            const adviceBox = document.getElementById('budget-advice');
            if (total < 1000 && apps.budget.data.length > 0) {
                adviceBox.classList.remove('hidden');
                adviceBox.textContent = "Uyarı: Bütçeniz azalıyor! Gereksiz harcamaları kısın.";
            } else {
                adviceBox.classList.add('hidden');
            }
        },

        delete: (id) => {
            apps.budget.data = apps.budget.data.filter(i => i.id !== id);
            apps.budget.save();
            apps.budget.render();
        }
    },

    // 2. TEXT STATS
    textStats: {
        analyze: () => {
            const text = document.getElementById('text-input').value;
            const charCount = text.length;
            const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
            const vowels = (text.match(/[aeıioöuüAEIİOÖUÜ]/g) || []).length;
            const consonants = (text.match(/[bcçdfgğhjklmnprsştvyzBCÇDFGĞHJKLMNPRSŞTVYZ]/g) || []).length;

            document.getElementById('stat-char').textContent = charCount;
            document.getElementById('stat-word').textContent = wordCount;
            document.getElementById('stat-vowel').textContent = vowels;
            document.getElementById('stat-consonant').textContent = consonants; // Simplified logic

            document.getElementById('text-results').classList.remove('hidden');
        }
    },

    // 3. CURRENCY
    currency: {
        rates: { TRY: 1, USD: 0.03, EUR: 0.028 }, // Mock rates 1 TRY = X
        convert: () => {
            const amount = parseFloat(document.getElementById('curr-amount').value);
            const from = document.getElementById('curr-from').value;
            const to = document.getElementById('curr-to').value;

            if (from === to) return alert('Aynı para birimini seçtiniz!');

            // Base is TRY for simplicity in this mockup
            // logic: amount * (1/rateFrom) * rateTo is wrong if base is not standard.
            // Let's assume rates are VALUE IN TRY. 
            const mockRatesToTry = { TRY: 1, USD: 34.50, EUR: 36.20 };

            const valInTry = amount * mockRatesToTry[from];
            const result = valInTry / mockRatesToTry[to];

            document.getElementById('curr-result').textContent = `${result.toFixed(2)} ${to}`;
        }
    },

    // 4. PASSWORD GEN
    passwordGen: {
        generate: () => {
            const len = document.getElementById('pwd-length').value;
            const useUpper = document.getElementById('pwd-upper').checked;
            const useLower = document.getElementById('pwd-lower').checked;
            const useNum = document.getElementById('pwd-num').checked;
            const useSpecial = document.getElementById('pwd-special').checked;

            let chars = '';
            if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
            if (useNum) chars += '0123456789';
            if (useSpecial) chars += '!@#$%^&*()_+';

            if (!chars) return alert('En az bir seçenek işaretleyin!');

            let pwd = '';
            for (let i = 0; i < len; i++) {
                pwd += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            document.getElementById('pwd-result').textContent = pwd;
        }
    },

    // 5. DECISION
    decision: {
        decide: () => {
            const input = document.getElementById('decision-input').value;
            const repeats = parseInt(document.getElementById('decision-repeat').value);

            const options = input.split('\n').filter(line => line.trim() !== '');
            if (options.length < 2) return alert('En az 2 seçenek girin.');

            const counts = {};
            options.forEach(o => counts[o] = 0);

            for (let i = 0; i < repeats; i++) {
                const choice = options[Math.floor(Math.random() * options.length)];
                counts[choice]++;
            }

            // Find max
            let maxKey = '';
            let maxVal = -1;
            for (const [key, val] of Object.entries(counts)) {
                if (val > maxVal) { maxVal = val; maxKey = key; }
            }

            document.getElementById('decision-result').innerHTML = `
                Kazanan: <b>${maxKey}</b> <br>
                <small>(${maxVal} kez seçildi)</small>
            `;
        }
    },

    // 6. TEMP
    temp: {
        convert: () => {
            const val = parseFloat(document.getElementById('temp-val').value);
            const from = document.getElementById('temp-unit-from').value;
            const to = document.getElementById('temp-unit-to').value;

            if (isNaN(val)) return;
            if (from === to) return alert('Birimler aynı!');

            let celcius = 0;
            // To C
            if (from === 'C') celcius = val;
            if (from === 'F') celcius = (val - 32) * 5 / 9;
            if (from === 'K') celcius = val - 273.15;

            let result = 0;
            // From C
            if (to === 'C') result = celcius;
            if (to === 'F') result = (celcius * 9 / 5) + 32;
            if (to === 'K') result = celcius + 273.15;

            document.getElementById('temp-result').textContent = `${result.toFixed(2)} °${to}`;
        }
    },

    // 7. DICE
    dice: {
        roll: () => {
            const count = document.getElementById('dice-count').value;
            const container = document.getElementById('dice-container');
            container.innerHTML = '';

            const icons = [
                '<i class="fa-solid fa-dice-one"></i>',
                '<i class="fa-solid fa-dice-two"></i>',
                '<i class="fa-solid fa-dice-three"></i>',
                '<i class="fa-solid fa-dice-four"></i>',
                '<i class="fa-solid fa-dice-five"></i>',
                '<i class="fa-solid fa-dice-six"></i>'
            ];

            for (let i = 0; i < count; i++) {
                const val = Math.floor(Math.random() * 6);
                const die = document.createElement('div');
                die.className = 'die';
                die.innerHTML = icons[val];
                container.appendChild(die);
            }
        }
    },

    // 8. LIFE TIME
    life: {
        calculate: () => {
            const dob = new Date(document.getElementById('life-dob').value);
            if (isNaN(dob.getTime())) return alert('Tarih seçin.');

            const now = new Date();
            const diff = now - dob;

            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            const years = (days / 365.25).toFixed(2);

            const container = document.getElementById('life-stats');
            container.classList.remove('hidden');
            container.innerHTML = `
                <div class="stat-box">Yaşınız: ${years}</div>
                <div class="stat-box">Toplam Gün: ${days.toLocaleString()}</div>
                <div class="stat-box">Toplam Saat: ${hours.toLocaleString()}</div>
            `;
        }
    },

    // 9. CLOCK
    clock: {
        interval: null,
        showDate: true,
        start: () => {
            if (apps.clock.interval) clearInterval(apps.clock.interval);

            const update = () => {
                const now = new Date();
                document.getElementById('clk-time').innerText = now.toLocaleTimeString('tr-TR');
                if (apps.clock.showDate) {
                    document.getElementById('clk-date').innerText = now.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                } else {
                    document.getElementById('clk-date').innerText = '';
                }
            };
            apps.clock.interval = setInterval(update, 1000);
            update();

            // Key Listener for Clock (A, D, T)
            document.addEventListener('keydown', (e) => {
                if (document.getElementById('app-clock').classList.contains('hidden')) return;
                if (e.key.toLowerCase() === 't') apps.clock.toggleDate();
            });
        },
        toggleDate: () => {
            apps.clock.showDate = !apps.clock.showDate;
        }
    },

    // 10. VAULT (Password Manager)
    vault: {
        isAuth: false,
        checkAuth: () => {
            if (!apps.vault.isAuth) {
                document.getElementById('vault-auth').classList.remove('hidden');
                document.getElementById('vault-content').classList.add('hidden');
            }
        },
        login: () => {
            const pass = document.getElementById('vault-master-input').value;
            if (pass === '1234') { // Weak demo password
                apps.vault.isAuth = true;
                document.getElementById('vault-auth').classList.add('hidden');
                document.getElementById('vault-content').classList.remove('hidden');
                apps.vault.render();
            } else {
                alert('Yanlış Şifre! (Demo: 1234)');
            }
        },
        logout: () => {
            apps.vault.isAuth = false;
            apps.vault.checkAuth();
        },
        add: () => {
            const site = document.getElementById('vault-site').value;
            const pass = document.getElementById('vault-pass').value;
            if (!site || !pass) return;

            const items = JSON.parse(localStorage.getItem('vaultItems')) || [];
            // Basic encryption simulation (Base64)
            const encrypted = btoa(pass);
            items.push({ site, pass: encrypted });
            localStorage.setItem('vaultItems', JSON.stringify(items));

            document.getElementById('vault-site').value = '';
            document.getElementById('vault-pass').value = '';
            apps.vault.render();
        },
        render: () => {
            const items = JSON.parse(localStorage.getItem('vaultItems')) || [];
            const list = document.getElementById('vault-list');
            list.innerHTML = '';
            items.forEach((item, idx) => {
                const li = document.createElement('li');
                li.className = 'list-item';
                li.innerHTML = `
                    <span>${item.site}</span>
                    <span style="font-family:monospace; cursor:pointer" onclick="alert('Şifre: ' + atob('${item.pass}'))">********</span>
                `;
                list.appendChild(li);
            });
        }
    },

    // 11. RPS
    rps: {
        userScore: 0,
        cpuScore: 0,
        play: (userMove) => {
            const moves = ['rock', 'paper', 'scissors'];
            const cpuMove = moves[Math.floor(Math.random() * 3)];

            const icons = { rock: 'fa-hand-rock', paper: 'fa-hand-paper', scissors: 'fa-hand-scissors' };

            document.getElementById('rps-user-move').innerHTML = `<i class="fa-regular ${icons[userMove]}"></i>`;
            document.getElementById('rps-cpu-move').innerHTML = `<i class="fa-regular ${icons[cpuMove]}"></i>`;

            let result = '';
            if (userMove === cpuMove) {
                result = 'Berabere!';
            } else if (
                (userMove === 'rock' && cpuMove === 'scissors') ||
                (userMove === 'paper' && cpuMove === 'rock') ||
                (userMove === 'scissors' && cpuMove === 'paper')
            ) {
                result = 'Kazandın!';
                apps.rps.userScore++;
            } else {
                result = 'Kaybettin!';
                apps.rps.cpuScore++;
            }

            document.getElementById('rps-user-score').innerText = apps.rps.userScore;
            document.getElementById('rps-cpu-score').innerText = apps.rps.cpuScore;
            document.getElementById('rps-result').innerText = result;
        }
    },

    // 12. HANGMAN (Ported from previous)
    hangman: {
        words: {
            movies: ["INCEPTION", "MATRIX", "TITANIC", "JOKER"],
            cities: ["ISTANBUL", "ANKARA", "IZMIR", "LONDRA"],
        },
        state: { word: '', guessed: new Set(), lives: 6 },

        setup: (mode) => {
            document.getElementById('hm-menu').classList.add('hidden');
            document.getElementById('hm-setup').classList.remove('hidden');

            if (mode === 'multi') {
                document.getElementById('hm-cat').classList.add('hidden');
                document.getElementById('hm-secret').classList.remove('hidden');
            } else {
                document.getElementById('hm-cat').classList.remove('hidden');
                document.getElementById('hm-secret').classList.add('hidden');
            }
        },

        start: () => {
            const secretInput = document.getElementById('hm-secret');
            let word = '';
            if (!secretInput.classList.contains('hidden')) {
                word = secretInput.value.toUpperCase();
            } else {
                // Random logic simplified
                const cat = document.getElementById('hm-cat').value === 'random' ? 'cities' : document.getElementById('hm-cat').value;
                const list = apps.hangman.words[cat] || apps.hangman.words.cities;
                word = list[Math.floor(Math.random() * list.length)];
            }

            if (word.length < 3) return alert('Geçersiz Kelime');

            apps.hangman.state = { word, guessed: new Set(), lives: 6 };
            document.getElementById('hm-setup').classList.add('hidden');
            document.getElementById('hm-game').classList.remove('hidden');
            apps.hangman.render();
        },

        render: () => {
            const { word, guessed, lives } = apps.hangman.state;

            // Word
            const display = word.split('').map(c => guessed.has(c) ? c : '_').join(' ');
            document.getElementById('hm-word').innerText = display;

            // Lives
            document.getElementById('hm-lives').innerText = '❤'.repeat(lives);

            // Keyboard
            const kb = document.getElementById('hm-keyboard');
            kb.innerHTML = '';
            "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split('').forEach(char => {
                const btn = document.createElement('button');
                btn.className = `key-btn ${guessed.has(char) ? 'disabled' : ''}`;
                btn.innerText = char;
                btn.onclick = () => apps.hangman.guess(char);
                if (guessed.has(char)) btn.disabled = true;
                kb.appendChild(btn);
            });

            // Draw dummy (simplified)
            document.querySelectorAll('.draw-part').forEach(p => p.classList.remove('visible'));
            const partsLost = 6 - lives;
            for (let i = 0; i < partsLost; i++) {
                // Logic to show SVG parts by index if we had IDs
                // For now, just a placeholder text
            }

            if (lives <= 0) alert('Kaybettin: ' + word);
            if (!display.includes('_')) alert('Kazandın: ' + word);
        },

        guess: (char) => {
            if (apps.hangman.state.lives <= 0) return;
            apps.hangman.state.guessed.add(char);
            if (!apps.hangman.state.word.includes(char)) {
                apps.hangman.state.lives--;
            }
            apps.hangman.render();
        }
    }
};
