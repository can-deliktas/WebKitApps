const hourHand = document.getElementById('hourHand');
const minuteHand = document.getElementById('minuteHand');
const secondHand = document.getElementById('secondHand');
const digitalClock = document.getElementById('digitalClock');
const analogClock = document.getElementById('analogClock');
const dateText = document.getElementById('dateText');
const dateContainer = document.getElementById('dateContainer');
const toggleDateBtn = document.getElementById('toggleDateBtn');
const colorPicker = document.getElementById('colorPicker');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

let isAnalog = true;

// --- Clock Logic ---
function updateClock() {
    const now = new Date();

    // Analog Clock
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secondDeg = ((seconds / 60) * 360);
    const minuteDeg = ((minutes / 60) * 360) + ((seconds / 60) * 6);
    const hourDeg = ((hours % 12) / 12 * 360) + ((minutes / 60) * 30);

    // Apply rotations
    // Adjust -50% translateX via CSS, so we just rotate here. 
    // Usually transforms overwrite each other, so we need to include translate if it's in the same property
    // But in CSS I used transform: translateX(-50%) rotate(0deg);
    // So here I must maintain translateX(-50%)
    secondHand.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
    hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;

    // Digital Clock
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');
    digitalClock.querySelector('.time-text').textContent = `${h}:${m}:${s}`;

    // Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateText.textContent = now.toLocaleDateString('tr-TR', options);
}

// Start Clock
setInterval(updateClock, 1000);
updateClock(); // Initial call

// --- Interactivity ---

// Toggle Clock Mode
function switchClockMode() {
    if (isAnalog) {
        analogClock.classList.remove('active');
        // Small delay for fade effect if needed, otherwise CSS handles display:none/flex
        setTimeout(() => {
            digitalClock.classList.add('active');
        }, 100); // overlap slightly or instant? CSS transition is on opacity, but display:none kills it instantly. 
        // Better way: Logic handles class toggle, CSS handles visuals.
        // Actually, display:none is abrupt. Let's rely on opacity/absolute positioning if we want smooth crossfade.
        // But for this simple implementation:
        isAnalog = false;
    } else {
        digitalClock.classList.remove('active');
        setTimeout(() => {
            analogClock.classList.add('active');
        }, 100);
        isAnalog = true;
    }
}

// Buttons for Prev/Next (Cyclic)
prevBtn.addEventListener('click', switchClockMode);
nextBtn.addEventListener('click', switchClockMode);

// Toggle Date Visibility
toggleDateBtn.addEventListener('click', () => {
    dateContainer.classList.toggle('hidden');
    // Optional: Update button text or icon state if desired
});

// Color Customization
colorPicker.addEventListener('input', (e) => {
    const color = e.target.value;
    document.documentElement.style.setProperty('--primary-color', color);
});
