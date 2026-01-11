document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration & State ---
    const TOTAL_IMAGES = 10;

    // State Variables
    let goals = JSON.parse(localStorage.getItem('goals')) || [];
    let currentFilter = 'all';
    let currentLang = localStorage.getItem('ascend_lang') || 'en';
    let appStreak = parseInt(localStorage.getItem('ascend_streak')) || 0;
    let lastActiveDate = localStorage.getItem('ascend_last_active');

    let unlockedBadges = JSON.parse(localStorage.getItem('ascend_badges')) || [];
    let appXP = parseInt(localStorage.getItem('ascend_xp')) || 0;

    let appTheme = localStorage.getItem('ascend_theme') || 'default';
    let wallpaperMode = localStorage.getItem('ascend_wallpaper_mode') || 'random'; // 'random' or 'fixed'
    let fixedWallpaperId = parseInt(localStorage.getItem('ascend_fixed_wallpaper')) || 1;

    // --- DOM Elements ---
    const goalForm = document.getElementById('goal-form');
    const goalsContainer = document.getElementById('goals-container');
    const emptyState = document.getElementById('empty-state');
    const totalGoalsEl = document.getElementById('total-goals');
    const activeGoalsCountEl = document.getElementById('active-goals-count');
    const completedGoalsCountEl = document.getElementById('completed-goals-count');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const streakCountEl = document.getElementById('streak-count');
    const achievementsGrid = document.getElementById('achievements-grid');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const randomWallpaperToggle = document.getElementById('random-wallpaper-toggle');
    const wallpaperGrid = document.getElementById('wallpaper-grid');

    // Success Overlay
    const successOverlay = document.getElementById('success-overlay');
    const closeOverlayBtn = document.getElementById('close-overlay-btn');

    // Modal Elements
    const modal = document.getElementById('update-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const updateForm = document.getElementById('update-form');
    const modalGoalName = document.getElementById('modal-goal-name');
    const currentValDisplay = document.getElementById('current-val-display');
    const targetValDisplay = document.getElementById('target-val-display');
    const unitDisplay = document.getElementById('unit-display');
    const progressSlider = document.getElementById('progress-slider');
    const newProgressInput = document.getElementById('new-progress-input');
    const incrementBtn = document.getElementById('increment-btn');
    const resetStreakBtn = document.getElementById('reset-streak-btn');

    // Date Inputs
    const startDateInput = document.getElementById('goal-start');
    const targetDateInput = document.getElementById('goal-deadline');

    // Navigation
    const langBtn = document.getElementById('lang-toggle');
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');
    const exportBtn = document.getElementById('export-btn');
    const importInput = document.getElementById('import-file');

    let currentEditingGoalId = null;

    // --- SVG ICON SYSTEM ---
    const ICONS = {
        'fa-fire': '<path d="M2.212 17.203c.516-1.785 2.126-3.79 3.093-5.263 1.25-1.905 1.583-3.6 1.347-5.071-.055-.34.331-.611.597-.407.391.298 1.159 1.01 1.763 2.158.468.89 1.125 2.5 1.125 2.5s.463-1.42 1.03-2.925c.44-1.168 1.571-3.64 1.571-3.64s.229-.444.68-.13c.451.312 2.664 1.874 3.738 5.76.674 2.44-.09 5.37-2.38 7.37-2.07 1.83-5.34 2.37-7.98 1.14-2.65-1.22-3.86-3.87-3.95-3.96-.13-.135.24-.653.366-1.523z"/>',
        'fa-list-check': '<path d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z"/>',
        'fa-person-running': '<path d="M13.4 9l1.6 4.3L12.5 16l3.5 3.5 1.4-1.4-2.1-2.1 1.6-3.2 2.1 2.1V18h2v-3.5l-2.5-2.5-1.2-3.2 2.1-1.1v-2h-3.6L13.4 9zM9 5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.8 11.5L8.5 14H5v2l2.5 2.5 2 4.5 1.8-.8-2.5-5.7z"/>',
        'fa-trophy': '<path d="M19 3H5c-1.1 0-2 .9-2 2v2c0 2.2 1.8 4 4 4 .6 0 1.1-.1 1.6-.3C9.6 12.3 11 15 11 15v2H8v2h8v-2h-3s1.4-2.7 2.4-4.3c.5.2 1 .3 1.6.3 2.2 0 4-1.8 4-4V5c0-1.1-.9-2-2-2zm-12 6c-1.1 0-2-.9-2-2V5h2v4zm12-2c0 1.1-.9 2-2 2V5h2v2z"/>',
        'fa-plus-circle': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>',
        'fa-arrow-right': '<path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>',
        'fa-rocket': '<path d="M12 2.5s-4 4.16-4 8c0 2.7 1.66 4.97 4 6 2.34-1.03 4-3.3 4-6 0-3.84-4-8-4-8zM12 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>',
        'fa-check': '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>',
        'fa-trash': '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>',
        'fa-pen': '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>',
        'fa-gauge-high': '<path d="M12 4C7.58 4 4 7.58 4 12h2c0-3.31 2.69-6 6-6s6 2.69 6 6h2c0-4.42-3.58-8-8-8zm0 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>',
        'fa-list-ul': '<path d="M4 10h4v4H4v-4zm0 6h4v4H4v-4zm0-12h4v4H4V4zm6 12h10v4H10v-4zm0-6h10v4H10v-4zm0-6h10v4H10V4z"/>',
        'fa-medal': '<path d="M12 7l1 2 2-1-1.5 3H16l1.5-3 2 1 1-2H12zm0 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>',
        'fa-gear': '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L6.14 6.94c-.11.2-.06.47.12.61l2.03 1.58c-.05.3-.09.63-.09.95s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.11-.22.06-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>',
        'fa-download': '<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>',
        'fa-upload': '<path d="M5 20h14v-2H5v2zm0-10h4v6h6v-6h4l-7-7-7 7z"/>',
        'fa-heart-crack': '<path d="M1.393 17.38a10.003 10.003 0 1 1 19.995-3.793L1.393 17.38zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>',
        'fa-shoe-prints': '<path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z M13 19H7V5h6v14z"/>',
        'fa-hand-spock': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/>',
        'fa-calendar-check': '<path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>',
        'fa-crown': '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
        'fa-dragon': '<path d="M12 2L2 22h20L12 2zm0 3.5l6 12H6l6-12z"/>',
        'fa-mountain-sun': '<path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.55 8.26 9.22 8 8.5 6.42 12.39 3.03 16 3.03 16H21S16.27 10.3 14 6z"/>',
        'fa-quote-left': '<path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>'
    };

    function renderIcons() {
        document.querySelectorAll('i[class^="fa-"]').forEach(el => {
            const classes = Array.from(el.classList);
            const iconClass = classes.find(c => ICONS[c]);
            if (iconClass && ICONS[iconClass]) {
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("viewBox", "0 0 24 24");
                svg.setAttribute("class", `svg-icon ${classes.join(' ')}`);
                svg.innerHTML = ICONS[iconClass];
                el.parentNode.replaceChild(svg, el);
            }
        });
    }

    // --- Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.error('Service Worker Error', err));
    }

    // --- Badge Definitions ---
    // IDs must match keys in translations.js
    const BADGES = [
        { id: 'first_step', icon: 'fa-shoe-prints' },
        { id: 'first_blood', icon: 'fa-medal' },
        { id: 'high_five', icon: 'fa-hand-spock' },
        { id: 'on_fire', icon: 'fa-fire' },
        { id: 'dedicated', icon: 'fa-calendar-check' },
        { id: 'champion', icon: 'fa-trophy' },
        { id: 'master', icon: 'fa-crown' },
        { id: 'legend', icon: 'fa-dragon' },
        { id: 'level_5', icon: 'fa-rocket' },
        { id: 'level_10', icon: 'fa-crown' },
        { id: 'xp_hunter', icon: 'fa-gauge-high' },
        { id: 'early_bird', icon: 'fa-mountain-sun' }
    ];

    // --- Visualization of Random Quotes ---
    const quoteEl = document.getElementById('daily-quote-container');

    function renderQuote() {
        if (!quoteEl) return;
        const quotes = translations[currentLang].quotes;
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteEl.innerHTML = `<i class="fa-solid fa-quote-left" style="color:var(--primary-color); opacity:0.5; margin-right:8px;"></i>${randomQuote}`;
        quoteEl.style.display = 'block';
    }

    // --- Initialization ---
    // Apply Theme
    document.body.setAttribute('data-theme', appTheme);
    themeBtns.forEach(btn => {
        if (btn.dataset.theme === appTheme) btn.classList.add('active');
        btn.addEventListener('click', () => {
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appTheme = btn.dataset.theme;
            document.body.setAttribute('data-theme', appTheme);
            localStorage.setItem('ascend_theme', appTheme);

            // Re-render to update dynamic colors (confetti etc if needed)
            renderWallpaperGrid();
        });
    });

    // XP Helper
    function addXP(amount) {
        appXP += amount;
        localStorage.setItem('ascend_xp', appXP);
        checkBadges(); // Checks level up
    }

    // Reset Logic
    if (resetStreakBtn) {
        resetStreakBtn.addEventListener('click', () => {
            if (confirm(translations[currentLang].resetConfirm)) {
                appStreak = 0;
                appXP = 0;
                unlockedBadges = [];
                localStorage.setItem('ascend_streak', 0);
                localStorage.setItem('ascend_xp', 0);
                localStorage.setItem('ascend_badges', JSON.stringify([]));
                // Reload to reset state cleanly
                location.reload();
            }
        });
    }

    // ... Wallpaper Logic ...
    function renderWallpaperGrid() {
        wallpaperGrid.innerHTML = '';
        for (let i = 1; i <= TOTAL_IMAGES; i++) {
            const thumb = document.createElement('div');
            thumb.className = `wallpaper-thumb ${(!randomWallpaperToggle.checked && fixedWallpaperId === i) ? 'active' : ''}`;
            thumb.style.backgroundImage = `url('images/${i}.jpg')`;
            thumb.onclick = () => {
                randomWallpaperToggle.checked = false;
                setWallpaperMode('fixed', i);
            };
            wallpaperGrid.appendChild(thumb);
        }
    }

    function setWallpaperMode(mode, id = 1) {
        wallpaperMode = mode;
        if (mode === 'fixed') fixedWallpaperId = id;

        localStorage.setItem('ascend_wallpaper_mode', mode);
        localStorage.setItem('ascend_fixed_wallpaper', fixedWallpaperId);

        setBackground();
        renderWallpaperGrid();
    }

    randomWallpaperToggle.addEventListener('change', (e) => {
        if (e.target.checked) setWallpaperMode('random');
        else setWallpaperMode('fixed', fixedWallpaperId);
    });
    randomWallpaperToggle.checked = (wallpaperMode === 'random');
    renderWallpaperGrid();

    function setBackground() {
        const bg1 = document.getElementById('bg-container-1');
        let imgUrl = '';

        if (wallpaperMode === 'random') {
            const randomIdx = Math.floor(Math.random() * TOTAL_IMAGES) + 1;
            imgUrl = `images/${randomIdx}.jpg`;
        } else {
            imgUrl = `images/${fixedWallpaperId}.jpg`;
        }
        bg1.style.backgroundImage = `url('${imgUrl}')`;
    }
    setBackground(); // Initial set

    // --- Badge Logic ---
    // --- Badge Logic ---
    function checkBadges() {
        let newUnlock = false;
        const completedCount = goals.filter(g => g.completed).length;
        const currentLevel = Math.floor(appXP / 1000) + 1;

        const conditions = {
            'first_step': goals.length > 0,
            'first_blood': completedCount >= 1,
            'high_five': completedCount >= 5,
            'on_fire': appStreak >= 3,
            'dedicated': appStreak >= 7,
            'champion': completedCount >= 10,
            'master': completedCount >= 20,
            'legend': appStreak >= 30,
            'level_5': currentLevel >= 5,
            'level_10': currentLevel >= 10,
            'xp_hunter': appXP >= 5000,
            'early_bird': false
        };

        for (const [id, met] of Object.entries(conditions)) {
            if (met && !unlockedBadges.includes(id)) {
                unlockedBadges.push(id);
                newUnlock = true;
            }
        }

        if (newUnlock) {
            localStorage.setItem('ascend_badges', JSON.stringify(unlockedBadges));
            renderBadges();
            if (typeof celebrateSuccess === 'function') celebrateSuccess();
        }

        // Update XP/Level UI
        const levelEl = document.getElementById('user-level');
        const xpEl = document.getElementById('user-xp');
        const xpProgressEl = document.getElementById('xp-progress');

        if (levelEl) levelEl.textContent = currentLevel;
        if (xpEl) xpEl.textContent = appXP;
        if (xpProgressEl) {
            const xpProgress = (appXP % 1000) / 10; // 0-1000 -> 0-100%
            xpProgressEl.style.width = `${xpProgress}%`;
        }
    }

    function renderBadges() {
        achievementsGrid.innerHTML = '';
        const t = translations[currentLang];

        BADGES.forEach(badge => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            const name = t.badgeNames[badge.id] || badge.id;
            const desc = t.badgeDescs[badge.id] || '';

            const card = document.createElement('div');
            card.className = `badge-card ${isUnlocked ? 'unlocked' : ''}`;
            card.innerHTML = `
                <div class="badge-icon"><i class="fa-solid ${badge.icon}"></i></div>
                <div class="badge-name">${name}</div>
                <div class="badge-desc">${desc}</div>
                <div class="badge-status">${isUnlocked ? (t.unlocked) : (t.locked)}</div>
            `;
            achievementsGrid.appendChild(card);
        });
    }

    // --- Localization System ---
    function updateLanguage() {
        langBtn.textContent = currentLang === 'en' ? 'TR' : 'EN';

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[currentLang][key]) {
                el.textContent = translations[currentLang][key];
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[currentLang][key]) {
                el.placeholder = translations[currentLang][key];
            }
        });

        renderGoals();
        updateStats();
        renderBadges();
        renderQuote();
        localStorage.setItem('ascend_lang', currentLang);
    }

    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'tr' : 'en';
        updateLanguage();
    });

    // --- Navigation Logic ---
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const targetId = item.dataset.target;
            viewSections.forEach(view => {
                view.classList.remove('active');
                if (view.id === targetId) view.classList.add('active');
            });
        });
    });

    // --- Streak Logic (Enhanced) ---
    function updateStreak(forceReset = false) {
        if (forceReset) {
            appStreak = 0;
            lastActiveDate = null;
        } else {
            const today = new Date(); // Local time
            // We want yyyy-mm-dd in local time
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;

            if (lastActiveDate === todayStr) {
                // Already active today
            } else if (lastActiveDate) {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const yYear = yesterday.getFullYear();
                const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
                const yDay = String(yesterday.getDate()).padStart(2, '0');
                const yesterdayStr = `${yYear}-${yMonth}-${yDay}`;

                if (lastActiveDate === yesterdayStr) {
                    appStreak++;
                } else {
                    appStreak = 1; // Broken
                }
                lastActiveDate = todayStr;
            } else {
                appStreak = 1;
                lastActiveDate = todayStr;
            }
        }

        streakCountEl.textContent = appStreak;
        localStorage.setItem('ascend_streak', appStreak);
        if (lastActiveDate) localStorage.setItem('ascend_last_active', lastActiveDate);
        else localStorage.removeItem('ascend_last_active');

        if (!forceReset) {
            const flame = document.querySelector('.flame-icon');
            flame.style.transform = 'scale(1.5)';
            setTimeout(() => flame.style.transform = '', 300);
            checkBadges();
        }
    }

    streakCountEl.textContent = appStreak;

    resetStreakBtn.addEventListener('click', () => {
        if (confirm('Reset Streak to 0?')) updateStreak(true);
    });

    // --- Core Goal Logic ---
    function saveGoals() {
        localStorage.setItem('goals', JSON.stringify(goals));
        renderGoals();
        updateStats();
        checkBadges();
    }

    // Date Constraints
    const today = new Date().toISOString().split('T')[0];
    startDateInput.min = today;
    startDateInput.value = today;

    function updateDateConstraints() {
        if (!startDateInput.value) {
            targetDateInput.disabled = true; targetDateInput.value = '';
        } else {
            targetDateInput.disabled = false;
            targetDateInput.min = startDateInput.value;
            if (targetDateInput.value && targetDateInput.value < startDateInput.value) {
                targetDateInput.value = startDateInput.value;
            }
        }
    }
    startDateInput.addEventListener('change', updateDateConstraints);
    updateDateConstraints();

    // --- DOM Elements (Expanded) ---
    const goalTypeSelect = document.getElementById('goal-type');
    const goalCategorySelect = document.getElementById('goal-category');
    const resetGoalsBtn = document.getElementById('reset-goals-btn');

    // Reset GOALS Logic
    if (resetGoalsBtn) {
        resetGoalsBtn.addEventListener('click', () => {
            // Use localized confirm message if available, else fallback
            const confirmMsg = translations?.[currentLang]?.resetGoalsConfirm || "Delete all goals?";
            if (confirm(confirmMsg)) {
                goals = [];
                saveGoals();
                renderGoals();
                updateStats();
            }
        });
    }

    function createGoal(e) {
        e.preventDefault();

        const name = document.getElementById('goal-name').value;
        const target = parseFloat(document.getElementById('goal-target').value);
        const unit = document.getElementById('goal-unit').value;
        const start = document.getElementById('goal-start').value;
        const deadline = document.getElementById('goal-deadline').value;

        // New Inputs
        const type = goalTypeSelect ? goalTypeSelect.value : 'goal';
        const category = goalCategorySelect ? goalCategorySelect.value : 'general';

        if (name && target) {
            const newGoal = {
                id: Date.now(),
                name,
                target,
                current: 0,
                unit,
                start,
                end: deadline, // Mapped to 'end' for consistency
                completed: false,
                type: type,
                category: category,
                history: [],
                createdAt: new Date().toISOString()
            };

            goals.push(newGoal);
            saveGoals();

            // Check first step badge
            checkBadges();

            goalForm.reset();

            startDateInput.value = today;
            updateDateConstraints();

            navItems[1].click(); // Switch to goals
            updateStreak();
        }

        startDateInput.value = today;
        updateDateConstraints();

        navItems[1].click(); // Switch to goals
        updateStreak();
    }

    function deleteGoal(id) {
        const confirmMsg = translations[currentLang].deleteConfirm;
        if (confirm(confirmMsg)) {
            goals = goals.filter(g => g.id !== id);
            saveGoals();
        }
    }

    function toggleComplete(id) {
        const goal = goals.find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;
            if (goal.completed) {
                goal.current = goal.target;
                celebrateSuccess();
                updateStreak();
            }
            saveGoals();
        }
    }

    function celebrateSuccess() {
        // Overlay Animation
        successOverlay.classList.remove('hidden');
        setTimeout(() => successOverlay.classList.add('show'), 10);

        // Dynamic Colors from Theme
        const style = getComputedStyle(document.body);
        const pColor = style.getPropertyValue('--primary-color').trim();
        const sColor = style.getPropertyValue('--success-color').trim();
        const colors = [pColor, sColor, '#ffffff', '#ffd700'];

        // Confetti
        if (typeof confetti === 'function') {
            const end = Date.now() + 3000;

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 70,
                    origin: { x: 0 },
                    colors: colors,
                    zIndex: 2100,
                    shapes: ['square', 'circle'],
                    scalar: 1.2
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 70,
                    origin: { x: 1 },
                    colors: colors,
                    zIndex: 2100,
                    shapes: ['square', 'circle'],
                    scalar: 1.2
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }

    closeOverlayBtn.addEventListener('click', () => {
        successOverlay.classList.remove('show');
        setTimeout(() => successOverlay.classList.add('hidden'), 500);
    });

    function openUpdateModal(id) {
        const goal = goals.find(g => g.id === id);
        if (!goal) return;

        currentEditingGoalId = id;
        modalGoalName.textContent = goal.name;
        currentValDisplay.textContent = goal.current;
        targetValDisplay.textContent = goal.target;
        unitDisplay.textContent = goal.unit;

        progressSlider.max = goal.target;
        progressSlider.value = goal.current;
        newProgressInput.value = goal.current;

        modal.classList.add('show');
    }

    function closeUpdateModal() {
        modal.classList.remove('show');
        currentEditingGoalId = null;
    }

    function handleProgressUpdate(e) {
        e.preventDefault();
        if (!currentEditingGoalId) return;

        const goal = goals.find(g => g.id === currentEditingGoalId);
        const newVal = parseFloat(newProgressInput.value);

        if (goal) {
            const wasCompleted = goal.completed;
            goal.current = newVal;

            if (goal.current >= goal.target) {
                goal.completed = true;
                if (!wasCompleted) {
                    celebrateSuccess();
                    updateStreak();
                }
            } else {
                goal.completed = false;
            }

            if (newVal > 0) updateStreak();

            saveGoals();
            closeUpdateModal();
        }
    }

    function updateStats() {
        const total = goals.length;
        const completed = goals.filter(g => g.completed).length;
        const active = total - completed;

        totalGoalsEl.textContent = total;
        activeGoalsCountEl.textContent = active;
        completedGoalsCountEl.textContent = completed;
    }

    function getDaysLeft(deadline) {
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const end = new Date(deadline);
        const diffTime = end - todayDate;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    function renderGoals() {
        goalsContainer.innerHTML = '';
        const t = translations[currentLang];

        // Filter Logic
        let filteredGoals = goals;
        if (currentFilter === 'active') filteredGoals = goals.filter(g => !g.completed);
        if (currentFilter === 'completed') filteredGoals = goals.filter(g => g.completed);

        // Empty State
        if (filteredGoals.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');

            filteredGoals.forEach(goal => {
                // Ensure defaults for old data
                const type = goal.type || 'goal';
                const category = goal.category || 'general';
                const current = parseFloat(goal.current) || 0;
                const target = parseFloat(goal.target) || 1;

                const percent = Math.min(100, Math.max(0, (current / target) * 100));
                const daysLeft = getDaysLeft(goal.deadline || goal.end);

                // Labels & Meta
                const catKey = `cat${category.charAt(0).toUpperCase() + category.slice(1)}`;
                const catInfo = (t[catKey] || category).toUpperCase();

                let metaHTML = '';
                let dateBadge = '';

                if (type === 'habit') {
                    metaHTML = `<span class="category-tag cat-habit" style="margin-left:5px;"><i class="fa-solid fa-repeat"></i> Daily</span>`;
                } else {
                    // Date badges
                    if (daysLeft < 0 && !goal.completed) {
                        dateBadge = `<div class="deadline-info text-danger"><i class="fa-solid fa-clock"></i> ${t.overdue}</div>`;
                    } else if (!goal.completed) {
                        dateBadge = `<div class="deadline-info"><i class="fa-regular fa-clock"></i> ${daysLeft} ${t.daysLeft}</div>`;
                    }
                }

                const card = document.createElement('div');
                card.className = `goal-card ${goal.completed ? 'completed' : ''}`;
                // Use flex for category tag row
                card.innerHTML = `
                    <div style="margin-bottom:8px; display:flex; gap:5px;">
                        <span class="category-tag cat-${category}">${catInfo}</span>
                        ${type === 'habit' ? '<span class="category-tag cat-habit"><i class="fa-solid fa-repeat"></i> Daily</span>' : ''}
                    </div>
                    <div class="goal-header">
                        <div>
                            <div class="goal-title">${goal.name}</div>
                            <div class="goal-meta">${type !== 'habit' && goal.end ? `${t.targetDateLabel}: ${goal.end}` : ''}</div>
                        </div>
                        <div class="goal-actions">
                            ${!goal.completed ? `<button class="action-btn complete" onclick="window.completeGoal(${goal.id})"><i class="fa-check"></i></button>` : ''}
                            <button class="action-btn" onclick="window.openUpdateModal(${goal.id})"><i class="fa-pen"></i></button>
                            <button class="action-btn delete" onclick="window.deleteGoal(${goal.id})"><i class="fa-trash"></i></button>
                        </div>
                    </div>
                    
                    <div class="progress-container" onclick="window.openUpdateModal(${goal.id})">
                        <div class="progress-labels">
                            <span>${current} / ${target} ${goal.unit}</span>
                            <span>${Math.round(percent)}%</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${percent}%"></div>
                        </div>
                    </div>
                    
                    ${dateBadge}
                    ${goal.completed ? `<div class="stamp">${t.completed}</div>` : ''}
                `;
                goalsContainer.appendChild(card);
            });
        }
        renderIcons(); // TRIGGER SVG REPLACEMENT
    }

    // Expose functions to window for onclick handlers
    window.openUpdateModal = openUpdateModal;
    window.deleteGoal = deleteGoal;
    window.completeGoal = (id) => {
        const goal = goals.find(g => g.id === id);
        if (goal) {
            goal.completed = true;
            goal.current = goal.target;
            addXP(100);
            saveGoals();
            celebrateSuccess();
        }
    };

    // --- Import/Export ---
    exportBtn.addEventListener('click', () => {
        // Collect ALL data
        const exportData = {
            goals,
            streak: appStreak,
            badges: unlockedBadges,
            lastActive: lastActiveDate,
            theme: appTheme,
            wallpaperMode: wallpaperMode,
            fixedWallpaper: fixedWallpaperId,
            lang: currentLang
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `ascend_backup_${new Date().toISOString().slice(0, 10)}.json`);
        linkElement.click();
    });

    importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.goals || Array.isArray(data)) {
                    // Restore Data
                    if (Array.isArray(data)) {
                        goals = data; // Legacy support
                    } else {
                        goals = data.goals || [];
                        appStreak = data.streak || 0;
                        unlockedBadges = data.badges || [];
                        lastActiveDate = data.lastActive || null;

                        // Settings Restore
                        if (data.theme) {
                            appTheme = data.theme;
                            document.body.setAttribute('data-theme', appTheme);
                            localStorage.setItem('ascend_theme', appTheme);
                            // Update buttons UI
                            themeBtns.forEach(b => {
                                b.classList.remove('active');
                                if (b.dataset.theme === appTheme) b.classList.add('active');
                            });
                        }
                        if (data.wallpaperMode) {
                            wallpaperMode = data.wallpaperMode;
                            fixedWallpaperId = data.fixedWallpaper || 1;
                            setWallpaperMode(wallpaperMode, fixedWallpaperId);
                            randomWallpaperToggle.checked = (wallpaperMode === 'random');
                        }
                        if (data.lang) {
                            currentLang = data.lang;
                            updateLanguage();
                        }
                    }
                    saveGoals();
                    alert(translations[currentLang].importSuccess);
                } else throw new Error('Invalid');
            } catch (err) {
                console.error(err);
                alert(translations[currentLang].importError);
            }
        };
        reader.readAsText(file);
    });

    // --- Streak Logic (Enhanced) ---
    function updateStreak(forceReset = false) {
        if (forceReset) {
            appStreak = 0;
            lastActiveDate = null;
        } else {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;

            // Check if streak should increment (activity today after a valid yesterday)
            if (lastActiveDate === todayStr) {
                // Already active today. 
                // User Feedback: "Decrease confusion" - ensure it doesn't look 'stuck'.
                // If it is 0, make it 1 immediately on first action.
                if (appStreak === 0) appStreak = 1;
            } else if (lastActiveDate) {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const yYear = yesterday.getFullYear();
                const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
                const yDay = String(yesterday.getDate()).padStart(2, '0');
                const yesterdayStr = `${yYear}-${yMonth}-${yDay}`;

                if (lastActiveDate === yesterdayStr) {
                    appStreak++;
                } else {
                    appStreak = 1; // Streak broken, restart
                }
                lastActiveDate = todayStr;
            } else {
                // First time ever
                appStreak = 1;
                lastActiveDate = todayStr;
            }
        }

        streakCountEl.textContent = appStreak;
        localStorage.setItem('ascend_streak', appStreak);
        if (lastActiveDate) localStorage.setItem('ascend_last_active', lastActiveDate);
        else localStorage.removeItem('ascend_last_active');

        if (!forceReset) {
            const flame = document.querySelector('.flame-icon');
            flame.style.transform = 'scale(1.5)';
            flame.style.filter = 'drop-shadow(0 0 10px orange)';
            setTimeout(() => {
                flame.style.transform = '';
                flame.style.filter = '';
            }, 300);
            checkBadges();
        }
    }

    // --- Events ---
    goalForm.addEventListener('submit', createGoal);
    updateForm.addEventListener('submit', handleProgressUpdate);
    closeModalBtn.addEventListener('click', closeUpdateModal);
    window.addEventListener('click', (e) => { if (e.target == modal) closeUpdateModal(); });

    progressSlider.addEventListener('input', (e) => newProgressInput.value = e.target.value);
    newProgressInput.addEventListener('input', (e) => progressSlider.value = e.target.value);
    incrementBtn.addEventListener('click', () => {
        let val = parseFloat(newProgressInput.value) || 0;
        newProgressInput.value = ++val; progressSlider.value = val;
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderGoals();
        });
    });

    updateLanguage();
    window.app = { deleteGoal, toggleComplete, openUpdateModal };
});
