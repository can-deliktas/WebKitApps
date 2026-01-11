/* Game State */
const state = {
    mode: 'pvc', // 'pvc' or 'pvp'
    p1Score: 0,
    p2Score: 0,
    targetScore: 3,
    p1Move: null,
    p2Move: null,
    roundActive: false,
    turn: 1 // 1 for P1, 2 for P2 (only relevant for PvP)
};

/* DOM Elements */
const screens = {
    menu: document.getElementById('main-menu'),
    game: document.getElementById('game-screen'),
    settings: document.getElementById('settings-screen')
};

const ui = {
    p1Score: document.getElementById('score-p1'),
    p2Score: document.getElementById('score-p2'),
    p1Name: document.getElementById('p1-name'),
    p2Name: document.getElementById('p2-name'),
    targetDisplay: document.getElementById('display-target'),
    p1Hand: document.getElementById('p1-hand'),
    p2Hand: document.getElementById('p2-hand'),
    resultText: document.getElementById('round-result'),
    p1Controls: document.getElementById('p1-controls'),
    p2Controls: document.getElementById('p2-controls'),
    p1TurnVal: document.getElementById('p1-turn'),
    p2TurnVal: document.getElementById('p2-turn'),
    winnerOverlay: document.getElementById('winner-overlay'),
    winnerText: document.getElementById('winner-text'),
    nextRoundBtn: document.getElementById('next-round-btn')
};

/* Constants */
const MOVES = {
    rock: { icon: 'fa-hand-back-fist', beats: 'scissors' },
    paper: { icon: 'fa-hand', beats: 'rock' },
    scissors: { icon: 'fa-hand-scissors', beats: 'paper' }
};

/* Navigation Functions */
function startGame(mode) {
    state.mode = mode;
    state.p1Score = 0;
    state.p2Score = 0;
    state.p1Move = null;
    state.p2Move = null;
    updateScoreUI();

    // Set Names
    ui.p1Name.innerText = "Oyuncu 1";
    ui.p2Name.innerText = mode === 'pvc' ? "Bilgisayar" : "Oyuncu 2";

    // Reset Hands
    resetHands();

    // UI Setup
    showScreen('game');
    ui.resultText.innerText = "VS";
    ui.nextRoundBtn.classList.add('hidden');

    startRound();
}

function showScreen(screenName) {
    Object.values(screens).forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    screens[screenName].classList.remove('hidden');
    setTimeout(() => screens[screenName].classList.add('active'), 50); // Small delay for transition
}

function returnToMenu() {
    showScreen('menu');
    ui.winnerOverlay.classList.add('hidden');
}

function showSettings() {
    showScreen('settings');
}

function setTargetScore(score) {
    state.targetScore = score;
    ui.targetDisplay.innerText = score;

    // Update active button visually
    document.querySelectorAll('.sel-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.innerText) === score) btn.classList.add('active');
    });
}

/* Game Logic */

function startRound() {
    state.p1Move = null;
    state.p2Move = null;
    state.roundActive = true;
    state.turn = 1;

    resetHands();
    ui.resultText.innerText = "VS";

    // Setup Controls based on Mode
    if (state.mode === 'pvc') {
        ui.p1Controls.classList.remove('hidden');
        ui.p2Controls.classList.add('hidden');
        ui.p1TurnVal.innerText = "Seçim Yap!";
        ui.p2TurnVal.classList.add('hidden'); // No text needed for PC
        ui.p1TurnVal.classList.remove('hidden');
    } else {
        // PvP
        ui.p1Controls.classList.remove('hidden');
        ui.p2Controls.classList.add('hidden');
        ui.p1TurnVal.innerText = "Oyuncu 1 Seçiyor";
        ui.p2TurnVal.innerText = "Sıra Bekliyor...";
        ui.p1TurnVal.classList.remove('hidden');
        ui.p2TurnVal.classList.remove('hidden');
    }
}

function makeMove(move, player) {
    if (!state.roundActive) return;

    if (state.mode === 'pvc') {
        if (player === 1) {
            state.p1Move = move;
            // Generate computer move
            const movesKeys = Object.keys(MOVES);
            state.p2Move = movesKeys[Math.floor(Math.random() * movesKeys.length)];

            runAnimationAndReveal();
        }
    } else {
        // PvP Logic
        if (player === 1) {
            state.p1Move = move;
            state.turn = 2;

            // Toggle controls
            ui.p1Controls.classList.add('hidden');
            ui.p1TurnVal.innerText = "Seçim Yapıldı";

            // Show P2 controls
            ui.p2Controls.classList.remove('hidden');
            ui.p2TurnVal.innerText = "Oyuncu 2 Seçiyor";

        } else if (player === 2) {
            state.p2Move = move;
            ui.p2Controls.classList.add('hidden');
            ui.p2TurnVal.innerText = "Seçim Yapıldı";

            runAnimationAndReveal();
        }
    }
}

function runAnimationAndReveal() {
    state.roundActive = false;

    // Add Shake Class
    ui.p1Hand.parentElement.classList.add('shake-animation');
    ui.p2Hand.parentElement.classList.add('shake-animation');

    // Wait for animation (1.5s = 3 shakes * 0.5s)
    setTimeout(() => {
        // Update Icons
        updateHandIcon(ui.p1Hand, state.p1Move);
        updateHandIcon(ui.p2Hand, state.p2Move);

        ui.p1Hand.parentElement.classList.remove('shake-animation');
        ui.p2Hand.parentElement.classList.remove('shake-animation');

        determineWinner();

    }, 1500);
}

function updateHandIcon(element, move) {
    element.className = `fa-regular ${MOVES[move].icon} hand-icon`;
}

function resetHands() {
    ui.p1Hand.className = "fa-regular fa-hand-back-fist hand-icon";
    ui.p2Hand.className = "fa-regular fa-hand-back-fist hand-icon";
    // Flip P2 hand horizontally so they face each other
    ui.p2Hand.style.transform = "scaleX(-1)";
}

function determineWinner() {
    const p1 = state.p1Move;
    const p2 = state.p2Move;
    let result = '';

    if (p1 === p2) {
        result = 'BERABERE';
        ui.resultText.style.color = 'var(--text-muted)';
    } else if (MOVES[p1].beats === p2) {
        state.p1Score++;
        result = 'P1 KAZANDI';
        ui.resultText.style.color = 'var(--primary-color)';
    } else {
        state.p2Score++;
        result = 'P2 KAZANDI';
        ui.resultText.style.color = 'var(--secondary-color)';
    }

    updateScoreUI();
    ui.resultText.innerText = result;

    if (checkGameEnd()) {
        return;
    }

    // Auto next round after delay or button
    setTimeout(startRound, 2000); // 2 seconds delay before next round
}

function updateScoreUI() {
    ui.p1Score.innerText = state.p1Score;
    ui.p2Score.innerText = state.p2Score;
}

function checkGameEnd() {
    if (state.p1Score >= state.targetScore) {
        showWinner("Oyuncu 1");
        return true;
    }
    if (state.p2Score >= state.targetScore) {
        const winnerName = state.mode === 'pvc' ? "Bilgisayar" : "Oyuncu 2";
        showWinner(winnerName);
        return true;
    }
    return false;
}

function showWinner(winnerName) {
    ui.winnerText.innerText = `${winnerName} Kazandı!`;
    ui.winnerOverlay.classList.remove('hidden');
}

function resetGame() {
    ui.winnerOverlay.classList.add('hidden');
    startGame(state.mode);
}

// Initial Setup
resetHands();
