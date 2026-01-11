const birthdateInput = document.getElementById('birthdate');
const calculateBtn = document.getElementById('calculate-btn');
const resultsSection = document.getElementById('results');

// Display Elements
const ageText = document.getElementById('age-text');
const totalMonths = document.getElementById('total-months');
const totalWeeks = document.getElementById('total-weeks');
const totalDays = document.getElementById('total-days');
const totalHours = document.getElementById('total-hours');
const totalMinutes = document.getElementById('total-minutes');
const totalSeconds = document.getElementById('total-seconds');

const totalSeasons = document.getElementById('total-seasons');
const leapYears = document.getElementById('leap-years');
const sleepTime = document.getElementById('sleep-time');
const heartbeats = document.getElementById('heartbeats');

let updateInterval;

function calculateLifeStats() {
    const birthDate = new Date(birthdateInput.value);
    const now = new Date();

    if (isNaN(birthDate.getTime())) {
        alert('Lütfen geçerli bir doğum tarihi giriniz.');
        return;
    }

    if (birthDate > now) {
        alert('Gelecek bir tarih seçemezsiniz!');
        return;
    }

    // Show results
    resultsSection.classList.remove('hidden');

    // Clear previous interval
    if (updateInterval) clearInterval(updateInterval);

    // Initial calculation and start interval
    updateStats(birthDate);
    updateInterval = setInterval(() => updateStats(birthDate), 1000);
}

function updateStats(birthDate) {
    const now = new Date();
    const diff = now - birthDate; // Difference in milliseconds

    // Exact Age Calculation
    let ageYears = now.getFullYear() - birthDate.getFullYear();
    let ageMonths = now.getMonth() - birthDate.getMonth();
    let ageDays = now.getDate() - birthDate.getDate();

    if (ageDays < 0) {
        ageMonths--;
        ageDays += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }

    if (ageMonths < 0) {
        ageYears--;
        ageMonths += 12;
    }

    ageText.innerText = `${ageYears} Yıl, ${ageMonths} Ay, ${ageDays} Gün`;

    // Detailed Stats
    const totalSecs = Math.floor(diff / 1000);
    const totalMins = Math.floor(totalSecs / 60);
    const totalHrs = Math.floor(totalMins / 60);
    const totalDys = Math.floor(totalHrs / 24);
    const totalWks = Math.floor(totalDys / 7);
    const totalMths = (ageYears * 12) + ageMonths;

    totalSeconds.innerText = formatNumber(totalSecs);
    totalMinutes.innerText = formatNumber(totalMins);
    totalHours.innerText = formatNumber(totalHrs);
    totalDays.innerText = formatNumber(totalDys);
    totalWeeks.innerText = formatNumber(totalWks);
    totalMonths.innerText = formatNumber(totalMths);

    // Fun Stats
    calculateFunStats(birthDate, now, ageYears);
}

function calculateFunStats(birthDate, now, ageYears) {
    // Seasons (Approx 4 per year)
    // More precise: Calculate passed solstices/equinoxes ideally, but year * 4 is a good approximation for general stats
    totalSeasons.innerText = formatNumber(ageYears * 4);

    // Leap Years
    let leapYearCount = 0;
    for (let year = birthDate.getFullYear(); year <= now.getFullYear(); year++) {
        if (isLeapYear(year)) {
            // Check if the 29th Feb is actually passed in that year relative to birth/current date
            const leapDay = new Date(year, 1, 29); // Feb is month 1
            if (birthDate <= leapDay && now >= leapDay) {
                leapYearCount++;
            }
        }
    }
    leapYears.innerText = leapYearCount;

    // Sleep Time (Approx 1/3 of life)
    const sleepYears = (ageYears / 3).toFixed(1);
    sleepTime.innerText = `${sleepYears} Yıl`;

    // Heartbeats (Approx 80 bpm average)
    // 80 * 60 * 24 * 365.25 = ~42 million per year
    const beats = (ageYears * 42000000) / 1000000000; // in billions
    heartbeats.innerText = beats.toFixed(3);
}

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function formatNumber(num) {
    return new Intl.NumberFormat('tr-TR').format(num);
}

calculateBtn.addEventListener('click', calculateLifeStats);

// Set default date to today for convenience (optional, maybe leave empty for user to fill)
// birthdateInput.valueAsDate = new Date();
