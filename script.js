// ============================================
// ISLAMIC ZONE - MAIN SCRIPT FILE
// ============================================
// This file handles the main page (index.html) functionality
// Includes: Quran display, search, navigation, prayer times widget
// ============================================

// ============================================
// GLOBAL VARIABLES
// ============================================

let quranData = null;              // Stores all Quran data loaded from JSON file
let currentLanguage = 'en';        // Current language: 'en', 'ar', or 'bn'
let allSurahs = [];                // Array of all surahs (chapters) from the Quran

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Skip initialization if we're on prayer-times.html or quran.html pages
    if (window.location.pathname.includes('prayer-times.html') || 
        window.location.pathname.includes('quran.html')) {
        console.log('Skipping main script initialization on this page');
        return;
    }
    
    console.log('Page is loading...');
    
    // Set up all event listeners (buttons, inputs, etc.)
    setupEventListeners();
    
    // Initialize prayer times widget on main page
    initializePrayerTimesWithLocation();
    
    // Start Ramadan countdown timer
    initializeRamadanCountdown();
    
    // Set up navbar scroll effects
    setupNavbarScroll();
    
    // Show random dua (prayer) of the day
    showDuaOfDay();
});

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================

function setupNavbarScroll() {
    const navbar = document.getElementById('mainNav');
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.pageYOffset > 100);
            updateActiveNavLink();
        });
    }
}

// ============================================
// UPDATE ACTIVE NAVIGATION LINK
// ============================================

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';
    
    sections.forEach(section => {
        if (window.pageYOffset >= section.offsetTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${current}`;
        link.classList.toggle('active', isActive);
    });
}

// ============================================
// LOAD QURAN DATA (Removed - now handled by quran.js)
// ============================================

// ============================================
// SET UP EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // Only prevent default for anchor links (not empty hash)
            if (href && href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    // Account for fixed navbar height
                    const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 80;
                    const targetPosition = target.offsetTop - navbarHeight;
                    window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ============================================
// QURAN/SURAH FUNCTIONALITY MOVED TO quran.js
// ============================================

// ============================================
// INITIALIZE PRAYER TIMES (MAIN PAGE WIDGET)
// ============================================

function initializePrayerTimesWithLocation() {
    const fallbackPrayerTimes = {
        fajr: '05:30',
        dhuhr: '12:15',
        asr: '15:45',
        maghrib: '18:20',
        isha: '19:45'
    };
    
    function applyPrayerTimes(prayerTimes) {
        Object.keys(prayerTimes).forEach(prayer => {
            const element = document.getElementById(`${prayer}-time`);
            if (element) {
                element.textContent = formatTime(prayerTimes[prayer]);
            }
        });
        updateActivePrayer(prayerTimes);
        startCountdown(prayerTimes);
    }
    
    if (!('geolocation' in navigator)) {
        console.warn('Geolocation not supported, using fallback prayer times.');
        applyPrayerTimes(fallbackPrayerTimes);
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const prayerTimes = await fetchPrayerTimesAPI(latitude, longitude, 'Hanafi', 'MuslimWorldLeague');
                if (prayerTimes) {
                    applyPrayerTimes(prayerTimes);
                } else {
                    applyPrayerTimes(fallbackPrayerTimes);
                }
            } catch (error) {
                console.error('Error fetching prayer times:', error);
                applyPrayerTimes(fallbackPrayerTimes);
            }
        },
        (error) => {
            console.error('Geolocation error:', error);
            applyPrayerTimes(fallbackPrayerTimes);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
}

// ============================================
// FETCH PRAYER TIMES FROM API
// ============================================
// Uses the same Aladhan API as prayer-times.html page

async function fetchPrayerTimesAPI(latitude, longitude, madhab = 'Hanafi', method = 'MuslimWorldLeague') {
    try {
        // Get today's date in DD-MM-YYYY format
        const today = new Date();
        const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
        
        // Map method names to Aladhan method numbers, considering madhab
        const methodMap = {
            'MuslimWorldLeague': madhab === 'Hanafi' ? 3 : 2, // 3 is Karachi (Hanafi), 2 is MWL (Shafi)
            'IslamicSocietyOfNorthAmerica': 1,
            'EgyptianGeneralAuthorityOfSurvey': 5,
            'Egyptian': 5,
            'UmmAlQuraUniversityMakkah': 4,
            'UmmAlQura': 4,
            'UniversityOfIslamicSciencesKarachi': 3,
            'Karachi': 3,
            'InstituteOfGeophysicsUniversityOfTehran': 7,
            'Dubai': 8,
            'Qatar': 9,
            'Kuwait': 10,
            'MoonsightingCommittee': 11,
            'Singapore': 12,
            'Turkey': 13
        };
        
        const methodNumber = methodMap[method] || (madhab === 'Hanafi' ? 3 : 2);
        
        // Build the API URL with parameters (using Aladhan API)
        const apiUrl = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${methodNumber}`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || data.code !== 200 || data.status !== 'OK' || !data.data || !data.data.timings) {
            throw new Error('Invalid API response');
        }
        
        const prayerTimes = data.data.timings;
        
        // Aladhan API uses capitalized prayer names
        return {
            fajr: prayerTimes.Fajr,
            dhuhr: prayerTimes.Dhuhr,
            asr: prayerTimes.Asr,
            maghrib: prayerTimes.Maghrib,
            isha: prayerTimes.Isha
        };
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        return null;
    }
}

// ============================================
// FORMAT TIME TO 12-HOUR FORMAT
// ============================================

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

// ============================================
// UPDATE ACTIVE PRAYER
// ============================================

function updateActivePrayer(prayerTimes) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    
    let activePrayer = null;
    let nextPrayer = null;
    
    prayers.forEach(prayer => {
        const [hours, minutes] = prayerTimes[prayer].split(':');
        const prayerTime = parseInt(hours) * 60 + parseInt(minutes);
        const card = document.querySelector(`[data-prayer="${prayer}"]`);
        
        if (card) {
            card.classList.remove('active');
            const statusElement = document.getElementById(`${prayer}-status`);
            if (statusElement) {
                statusElement.textContent = 'Upcoming';
            }
        }
        
        if (prayerTime <= currentTime) {
            activePrayer = prayer;
        } else if (!nextPrayer) {
            nextPrayer = prayer;
        }
    });
    
    if (activePrayer) {
        const activeCard = document.querySelector(`[data-prayer="${activePrayer}"]`);
        if (activeCard) {
            activeCard.classList.add('active');
            const statusElement = document.getElementById(`${activePrayer}-status`);
            if (statusElement) {
                statusElement.textContent = 'Current';
            }
        }
    }
    
    const nextPrayerElement = document.getElementById('next-prayer');
    if (nextPrayerElement) {
        nextPrayerElement.textContent = nextPrayer 
            ? nextPrayer.charAt(0).toUpperCase() + nextPrayer.slice(1)
            : 'Fajr (Tomorrow)';
    }
}

// ============================================
// START COUNTDOWN TIMER
// ============================================

function startCountdown(prayerTimes) {
    if (!prayerTimes) return;
    
    setInterval(() => {
        const now = new Date();
        const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        let nextPrayerTime = null;
        
        prayers.forEach(prayer => {
            const [hours, minutes] = prayerTimes[prayer].split(':');
            const prayerTime = parseInt(hours) * 3600 + parseInt(minutes) * 60;
            if (prayerTime > currentTime && !nextPrayerTime) {
                nextPrayerTime = prayerTime;
            }
        });
        
        if (!nextPrayerTime) {
            const [hours, minutes] = prayerTimes.fajr.split(':');
            nextPrayerTime = (24 * 3600) + (parseInt(hours) * 3600 + parseInt(minutes) * 60);
        }
        
        const timeLeft = nextPrayerTime - currentTime;
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        
        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            countdownElement.textContent = 
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }, 1000);
}

// ============================================
// INITIALIZE RAMADAN COUNTDOWN
// ============================================

function initializeRamadanCountdown() {
    // Get the countdown elements
    const daysElement = document.getElementById('ramadan-days');
    const hoursElement = document.getElementById('ramadan-hours');
    const minutesElement = document.getElementById('ramadan-minutes');
    
    // Check if elements exist
    if (!daysElement || !hoursElement || !minutesElement) {
        console.warn('Ramadan countdown elements not found on this page');
        return;
    }
    
    // Calculate next Ramadan date
    // Ramadan dates for upcoming years (approximate - based on Islamic calendar)
    // These dates are approximate and should be updated annually
    const ramadanDates = {
        2025: new Date(2025, 2, 1, 0, 0, 0),   // March 1, 2025
        2026: new Date(2026, 1, 18, 0, 0, 0),  // February 18, 2026
        2027: new Date(2027, 1, 8, 0, 0, 0),   // February 8, 2027
        2028: new Date(2028, 0, 28, 0, 0, 0),  // January 28, 2028
        2029: new Date(2029, 0, 16, 0, 0, 0),  // January 16, 2029
        2030: new Date(2030, 0, 6, 0, 0, 0)    // January 6, 2030
    };
    
    function getNextRamadanDate() {
        const now = new Date();
        const currentYear = now.getFullYear();
        
        // Check if we have a date for the current year
        if (ramadanDates[currentYear]) {
            const thisYearRamadan = ramadanDates[currentYear];
            if (now < thisYearRamadan) {
                return thisYearRamadan;
            }
        }
        
        // Find the next Ramadan date
        for (let year = currentYear; year <= currentYear + 5; year++) {
            if (ramadanDates[year]) {
                const ramadanDate = ramadanDates[year];
                if (now < ramadanDate) {
                    return ramadanDate;
                }
            }
        }
        
        // Fallback: calculate approximate date (March 1 of next year)
        return new Date(currentYear + 1, 2, 1, 0, 0, 0);
    }
    
    const ramadanDate = getNextRamadanDate();
    
    function updateCountdown() {
        const now = new Date();
        const timeLeft = ramadanDate.getTime() - now.getTime();
        
        if (timeLeft > 0) {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            
            if (daysElement) daysElement.textContent = String(days).padStart(2, '0');
            if (hoursElement) hoursElement.textContent = String(hours).padStart(2, '0');
            if (minutesElement) minutesElement.textContent = String(minutes).padStart(2, '0');
        } else {
            // If countdown has passed, recalculate for next year
            const nextRamadan = getNextRamadanDate();
            const newTimeLeft = nextRamadan.getTime() - now.getTime();
            
            if (newTimeLeft > 0) {
                const days = Math.floor(newTimeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((newTimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((newTimeLeft % (1000 * 60 * 60)) / (1000 * 60));
                
                if (daysElement) daysElement.textContent = String(days).padStart(2, '0');
                if (hoursElement) hoursElement.textContent = String(hours).padStart(2, '0');
                if (minutesElement) minutesElement.textContent = String(minutes).padStart(2, '0');
            } else {
                // Fallback: show zeros if calculation fails
                if (daysElement) daysElement.textContent = '00';
                if (hoursElement) hoursElement.textContent = '00';
                if (minutesElement) minutesElement.textContent = '00';
            }
        }
    }
    
    // Update immediately
    updateCountdown();
    
    // Then update every minute (more efficient than every second for days/hours/minutes)
    setInterval(updateCountdown, 60000);
    
    // Also update every second for the first minute to show seconds changing
    let secondCount = 0;
    const secondInterval = setInterval(() => {
        updateCountdown();
        secondCount++;
        if (secondCount >= 60) {
            clearInterval(secondInterval);
        }
    }, 1000);
}

// ============================================
// SHOW ERROR MESSAGE
// ============================================

// ============================================
// ERROR HANDLING (if needed for other features)
// ============================================

// ============================================
// SHOW DUA OF THE DAY
// ============================================

function showDuaOfDay() {
    const duas = [
        {
            arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
            english: "O Allah, grant us good in this world and good in the Hereafter, and save us from the punishment of the Fire."
        },
        {
            arabic: "اللَّهُمَّ بَارِكْ لِي فِي مَا أَعْطَيْتَنِي",
            english: "O Allah, bless me in what You have given me."
        },
        {
            arabic: "رَبِّ اشْرَحْ لِي صَدْرِي",
            english: "O my Lord, expand for me my breast."
        }
    ];
    
    const randomDua = duas[Math.floor(Math.random() * duas.length)];
    const duaText = document.getElementById('dua-text');
    
    if (duaText) {
        duaText.innerHTML = `
            <strong>Arabic:</strong> ${randomDua.arabic}<br><br>
            <strong>English:</strong> ${randomDua.english}
        `;
    }
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================

function viewFullSchedule() {
    window.location.href = 'prayer-times.html';
}

function showHajjGuide() {
    window.location.href = 'highlights.html#hajj';
}

function openZakatCalculator() {
    window.location.href = 'highlights.html#zakat';
}

function scrollToSurahs() {
    document.getElementById('surahs')?.scrollIntoView({ behavior: 'smooth' });
}

function scrollToQuran() {
    window.location.href = 'quran.html';
}

function scrollToPrayerTimes() {
    const target = document.getElementById('prayer-times');
    if (target) {
        const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 80;
        const targetPosition = target.offsetTop - navbarHeight;
        window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: 'smooth'
        });
    }
}

function scrollToHadith() {
    document.getElementById('hadith')?.scrollIntoView({ behavior: 'smooth' });
}

function scrollToSearch() {
    document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('searchInput')?.focus();
}

