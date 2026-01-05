// ============================================
// PRAYER TIMES PAGE - BEGINNER FRIENDLY VERSION
// ============================================
// This file handles all prayer times functionality
// Uses API: https://api.aladhan.com/
// ============================================

// ============================================
// GLOBAL VARIABLES
// ============================================

let currentLocation = null;           // Stores user's location (latitude, longitude, name)
let currentPrayerTimes = null;       // Stores today's prayer times
let calculationMethod = 'MuslimWorldLeague';  // Method for calculating prayer times
let madhab = 'Hanafi';                // Islamic school of thought (Hanafi or Shafi)
let countdownInterval = null;         // Stores the countdown timer

// ============================================
// INITIALIZATION - Runs when page loads
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Prayer Times page is loading...');
    
    setupNavbarScroll();
    setupEventListeners();
    initializePrayerTimes();
    updateHijriDate();
    updateGregorianDate();
});

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================

function setupNavbarScroll() {
    const navbar = document.getElementById('mainNav');
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.pageYOffset > 100);
        });
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Calculation method dropdown
    const methodSelect = document.getElementById('calculation-method');
    if (methodSelect) {
        methodSelect.addEventListener('change', function() {
            calculationMethod = this.value;
            if (currentLocation) {
                updatePrayerTimes();
            }
        });
    }
    
    // Madhab dropdown (Hanafi/Shafi)
    const madhabSelect = document.getElementById('madhab-select');
    if (madhabSelect) {
        madhabSelect.addEventListener('change', function() {
            madhab = this.value;
            if (currentLocation) {
                updatePrayerTimes();
            }
        });
    }
}

// ============================================
// INITIALIZE PRAYER TIMES
// ============================================

function initializePrayerTimes() {
    console.log('Starting to get prayer times...');
    
    // Check if we saved location before (in browser storage)
    const savedLocation = localStorage.getItem('prayerLocation');
    
    if (savedLocation) {
        try {
            const location = JSON.parse(savedLocation);
            currentLocation = location;
            console.log('Using saved location:', currentLocation);
            
            // Validate saved location has required fields
            if (!currentLocation.latitude || !currentLocation.longitude) {
                console.warn('Saved location invalid, requesting new location');
                currentLocation = null;
            } else {
                updateLocationDisplay();
                setTimeout(() => {
                    console.log('Calling updatePrayerTimes with saved location');
                    updatePrayerTimes();
                }, 100);
                return;
            }
        } catch (e) {
            console.error('Error reading saved location:', e);
            currentLocation = null;
        }
    }
    
    // Check if browser supports geolocation
    if (!('geolocation' in navigator)) {
        console.warn('Geolocation not supported, using default location (Mecca)');
        currentLocation = {
            latitude: 21.3891,
            longitude: 39.8579,
            name: 'Mecca, Saudi Arabia'
        };
        updateLocationDisplay();
        setTimeout(() => {
            console.log('Calling updatePrayerTimes with default location');
            updatePrayerTimes();
        }, 100);
        return;
    }
    
    // Request user's location
    console.log('Requesting user location...');
    requestLocation();
}

// ============================================
// REQUEST USER LOCATION
// ============================================
// Asks the browser to get user's current location

function requestLocation() {
    console.log('Asking for user location...');
    
    const locationInput = document.getElementById('location-input');
    if (locationInput) {
        locationInput.value = 'Detecting location...';
    }
    
    // Use browser's geolocation API
    navigator.geolocation.getCurrentPosition(
        // Success: We got the location
        async (position) => {
            console.log('Location received:', position.coords);
            
            const { latitude, longitude } = position.coords;
            currentLocation = { latitude, longitude };
            
            // Try to get a friendly name for the location
            try {
                const response = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                const data = await response.json();
                
                if (data.locality && data.city) {
                    currentLocation.name = `${data.locality}, ${data.city}`;
                } else if (data.city) {
                    currentLocation.name = data.city;
                } else {
                    currentLocation.name = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                }
                
                console.log('Location name:', currentLocation.name);
            } catch (e) {
                currentLocation.name = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            }
            
            // Save location to browser storage
            localStorage.setItem('prayerLocation', JSON.stringify(currentLocation));
            
            updateLocationDisplay();
            setTimeout(() => updatePrayerTimes(), 200);
        },
        
        // Error: Couldn't get location
        (error) => {
            console.error('Geolocation error:', error);
            showError(`Unable to get your location (${error.message}). Using default location: Mecca.`);
            
            currentLocation = {
                latitude: 21.3891,
                longitude: 39.8579,
                name: 'Mecca, Saudi Arabia'
            };
            
            updateLocationDisplay();
            setTimeout(() => updatePrayerTimes(), 200);
        },
        
        // Options for geolocation
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// ============================================
// UPDATE LOCATION DISPLAY
// ============================================

function updateLocationDisplay() {
    if (!currentLocation) return;
    
    const locationInput = document.getElementById('location-input');
    const coordinatesDisplay = document.getElementById('coordinates-display');
    const infoLocation = document.getElementById('info-location');
    
    if (locationInput) {
        locationInput.value = currentLocation.name || 
            `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`;
    }
    
    if (coordinatesDisplay) {
        coordinatesDisplay.textContent = 
            `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`;
    }
    
    if (infoLocation) {
        infoLocation.textContent = currentLocation.name || 'Unknown';
    }
}

// ============================================
// FETCH PRAYER TIMES FROM API
// ============================================
// Uses the Aladhan API: https://api.aladhan.com/

async function fetchPrayerTimesFromAPI(latitude, longitude, method, madhab) {
    // Get today's date in DD-MM-YYYY format
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
    
    // Map method names to Aladhan method numbers, considering madhab
    const methodMap = {
        'MuslimWorldLeague': madhab === 'Hanafi' ? 3 : 2, // 3 is Karachi (Hanafi), 2 is MWL (Shafi)
        'IslamicSocietyOfNorthAmerica': 1, // ISNA is Shafi
        'EgyptianGeneralAuthorityOfSurvey': 5, // Egyptian is Shafi
        'Egyptian': 5, // Alias
        'UmmAlQuraUniversityMakkah': 4, // Umm Al-Qura is Shafi
        'UmmAlQura': 4, // Alias
        'UniversityOfIslamicSciencesKarachi': 3, // Karachi is Hanafi
        'Karachi': 3, // Alias
        'InstituteOfGeophysicsUniversityOfTehran': 7, // Tehran is Shafi
        'Dubai': 8, // Dubai
        'Qatar': 9, // Qatar
        'Kuwait': 10, // Kuwait
        'MoonsightingCommittee': 11, // Moonsighting Committee
        'Singapore': 12, // Singapore
        'Turkey': 13 // Turkey
    };
    
    const methodNumber = methodMap[method] || (madhab === 'Hanafi' ? 3 : 2); // Default to Karachi for Hanafi, MWL for Shafi
    
    // Build the API URL with parameters
    const apiUrl = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${methodNumber}`;
    
    console.log('Fetching prayer times from API:', apiUrl);
    
    // Try direct connection first (Aladhan should work without CORS issues)
    const corsProxies = [
        '', // Try direct first
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
    ];
    
    let lastError = null;
    
    // Try each method (direct, then with proxies)
    for (let i = 0; i < corsProxies.length; i++) {
        const proxy = corsProxies[i];
        const finalUrl = proxy ? `${proxy}${encodeURIComponent(apiUrl)}` : apiUrl;
        
        console.log(`Attempt ${i + 1}/${corsProxies.length}: ${proxy ? 'Using proxy' : 'Direct connection'}`);
        
        try {
            // Make the API request with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
            
            let response;
            try {
                response = await fetch(finalUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                    signal: controller.signal,
                    mode: 'cors' // Explicitly set CORS mode
                });
                clearTimeout(timeoutId);
            } catch (fetchError) {
                clearTimeout(timeoutId);
                
                // Check for network/CORS errors
                if (fetchError.name === 'AbortError') {
                    lastError = new Error('Request timeout: API took too long to respond');
                    continue; // Try next proxy
                } else if (fetchError.message.includes('Failed to fetch') || 
                          fetchError.message.includes('CORS') ||
                          fetchError.message.includes('network')) {
                    lastError = new Error('Network/CORS error: ' + fetchError.message);
                    continue; // Try next proxy
                } else {
                    lastError = new Error(`Network error: ${fetchError.message}`);
                    continue; // Try next proxy
                }
            }
        
            console.log('API Response status:', response.status, response.statusText);
            
            // Check if request was successful
            if (!response.ok) {
                let errorText = '';
                try {
                    errorText = await response.text();
                    console.error('API Error Response:', errorText);
                } catch (e) {
                    errorText = 'Unable to read error response';
                }
                lastError = new Error(`API failed with status ${response.status}: ${errorText}`);
                continue; // Try next proxy
            }
            
            // Convert response to JSON
            let data;
            try {
                const responseText = await response.text();
                console.log('Raw response text:', responseText.substring(0, 200));
                data = JSON.parse(responseText);
            } catch (jsonError) {
                console.error('Failed to parse JSON:', jsonError);
                lastError = new Error(`Invalid JSON response: ${jsonError.message}`);
                continue; // Try next proxy
            }
            
            console.log('API Response data:', data);
            
            // Check if API returned success (Aladhan format)
            if (data.code !== 200 || data.status !== 'OK') {
                lastError = new Error(`API returned error: ${data.status || 'Unknown error'}`);
                continue; // Try next proxy
            }
            
            if (!data.data) {
                lastError = new Error('API response missing data field');
                continue; // Try next proxy
            }
            
            // Handle Aladhan response format
            let prayerTimesData = null;
            
            if (data.data.timings) {
                prayerTimesData = data.data.timings;
            }
            
            if (!prayerTimesData) {
                console.error('Full API response:', JSON.stringify(data, null, 2));
                lastError = new Error('API response missing timings field. Response structure: ' + JSON.stringify(Object.keys(data.data || data)));
                continue; // Try next proxy
            }
            
            console.log('Prayer times extracted:', prayerTimesData);
            
            // Validate that we have all required prayer times (Aladhan uses capitalized names)
            const requiredPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            const missingPrayers = requiredPrayers.filter(prayer => !prayerTimesData[prayer]);
            
            if (missingPrayers.length > 0) {
                console.error('Missing prayer times in response:', missingPrayers);
                console.error('Available keys:', Object.keys(prayerTimesData));
                lastError = new Error(`API response missing required prayer times: ${missingPrayers.join(', ')}`);
                continue; // Try next proxy
            }
            
            // Success! Return formatted prayer times
            console.log('✅ Successfully fetched prayer times!');
            return {
                fajr: prayerTimesData.Fajr,
                sunrise: prayerTimesData.Sunrise || '',
                dhuhr: prayerTimesData.Dhuhr,
                asr: prayerTimesData.Asr,
                maghrib: prayerTimesData.Maghrib,
                isha: prayerTimesData.Isha,
                // Store full data for additional info
                fullData: data.data
            };
            
        } catch (error) {
            console.error(`Error with attempt ${i + 1}:`, error);
            lastError = error;
            continue; // Try next proxy
        }
    }
    
    // If we get here, all attempts failed
    console.error('All API attempts failed. Last error:', lastError);
    return {
        error: true,
        message: lastError ? lastError.message : 'All connection attempts failed. Please check your internet connection and try again.'
    };
}

// ============================================
// UPDATE PRAYER TIMES
// ============================================

async function updatePrayerTimes() {
    console.log('Updating prayer times...');
    console.log('Current location:', currentLocation);
    console.log('Method:', calculationMethod, 'Madhab:', madhab);
    
    if (!currentLocation) {
        console.error('No location available');
        showError('Location not available. Please allow location access.');
        return;
    }
    
    // Show loading state
    const card = document.getElementById('current-prayer-card');
    if (card) {
        card.innerHTML = '<div class="text-center"><div class="spinner-border text-primary"></div><p>Loading prayer times...</p></div>';
    }
    
    try {
        // Fetch prayer times from API
        console.log('Fetching from API with:', {
            lat: currentLocation.latitude,
            lng: currentLocation.longitude,
            method: calculationMethod,
            madhab: madhab
        });
        
        const prayerTimes = await fetchPrayerTimesFromAPI(
            currentLocation.latitude,
            currentLocation.longitude,
            calculationMethod,
            madhab
        );
        
        console.log('API response:', prayerTimes);
        
        // Check if API returned an error
        if (!prayerTimes) {
            console.error('Prayer times is null');
            showError('Error: Could not fetch prayer times. Please check your internet connection and try again.');
            return;
        }
        
        if (prayerTimes.error) {
            console.error('API returned error:', prayerTimes.message);
            showError(`Error: ${prayerTimes.message}. Please check the browser console (F12) for more details.`);
            return;
        }
        
        // Validate prayer times data
        if (!prayerTimes.fajr || !prayerTimes.dhuhr || !prayerTimes.asr || !prayerTimes.maghrib || !prayerTimes.isha) {
            console.error('Invalid prayer times data:', prayerTimes);
            showError('Error: Invalid prayer times data received from API. Please try again.');
            return;
        }
        
        // Store prayer times globally
        currentPrayerTimes = prayerTimes;
        
        console.log('Prayer times stored successfully:', currentPrayerTimes);
        
        // Update all displays
        updateCurrentPrayerCard();
        updatePrayerTimesTable();
        updateMonthlySchedule();
        updatePrayerInfo();
        startPrayerTimesCountdown();
        
    } catch (error) {
        console.error('Error in updatePrayerTimes:', error);
        console.error('Error stack:', error.stack);
        showError('Error calculating prayer times: ' + (error.message || 'Unknown error'));
    }
}

// ============================================
// FORMAT TIME TO 12-HOUR FORMAT
// ============================================

function formatPrayerTime12Hour(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

// ============================================
// UPDATE CURRENT PRAYER CARD
// ============================================

function updateCurrentPrayerCard() {
    if (!currentPrayerTimes) return;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
        { name: 'Fajr', time: currentPrayerTimes.fajr },
        { name: 'Dhuhr', time: currentPrayerTimes.dhuhr },
        { name: 'Asr', time: currentPrayerTimes.asr },
        { name: 'Maghrib', time: currentPrayerTimes.maghrib },
        { name: 'Isha', time: currentPrayerTimes.isha }
    ];
    
    let nextPrayer = null;
    
    prayers.forEach(prayer => {
        const [hours, minutes] = prayer.time.split(':');
        const prayerTime = parseInt(hours) * 60 + parseInt(minutes);
        if (prayerTime > currentTime && !nextPrayer) {
            nextPrayer = prayer;
        }
    });
    
    if (!nextPrayer) {
        nextPrayer = prayers[0];
    }
    
    const card = document.getElementById('current-prayer-card');
    if (!card) return;
    
    const timeUntilNext = calculateTimeUntil(nextPrayer.time);
    
    card.innerHTML = `
        <div class="current-prayer-name">${nextPrayer.name}</div>
        <div class="current-prayer-time">${formatPrayerTime12Hour(nextPrayer.time)}</div>
        <div class="next-prayer-info">
            <div class="mb-2">
                <i class="fas fa-hourglass-half me-2"></i>
                <strong>Time Remaining:</strong>
            </div>
            <div class="countdown-display-large" id="countdown-large">
                ${formatCountdown(timeUntilNext)}
            </div>
        </div>
    `;
}

// ============================================
// START COUNTDOWN TIMER
// ============================================

function startPrayerTimesCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(() => {
        if (!currentPrayerTimes) return;
        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const prayers = [
            { name: 'Fajr', time: currentPrayerTimes.fajr },
            { name: 'Dhuhr', time: currentPrayerTimes.dhuhr },
            { name: 'Asr', time: currentPrayerTimes.asr },
            { name: 'Maghrib', time: currentPrayerTimes.maghrib },
            { name: 'Isha', time: currentPrayerTimes.isha }
        ];
        
        let nextPrayer = null;
        prayers.forEach(prayer => {
            const [hours, minutes] = prayer.time.split(':');
            const prayerTime = parseInt(hours) * 60 + parseInt(minutes);
            if (prayerTime > currentTime && !nextPrayer) {
                nextPrayer = prayer;
            }
        });
        
        if (!nextPrayer) {
            nextPrayer = prayers[0];
        }
        
        const timeUntilNext = calculateTimeUntil(nextPrayer.time);
        const countdownElement = document.getElementById('countdown-large');
        
        if (countdownElement) {
            countdownElement.textContent = formatCountdown(timeUntilNext);
        }
        
        updateCurrentPrayerCard();
    }, 1000);
}

// ============================================
// CALCULATE TIME UNTIL TARGET
// ============================================

function calculateTimeUntil(targetTimeString) {
    const now = new Date();
    const target = new Date();
    
    const [hours, minutes] = targetTimeString.split(':');
    target.setHours(parseInt(hours));
    target.setMinutes(parseInt(minutes));
    target.setSeconds(0);
    target.setMilliseconds(0);
    
    if (target < now) {
        target.setDate(target.getDate() + 1);
    }
    
    const diff = target - now;
    const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secondsRemaining = Math.floor((diff % (1000 * 60)) / 1000);
    
    return {
        hours: hoursRemaining,
        minutes: minutesRemaining,
        seconds: secondsRemaining
    };
}

// ============================================
// FORMAT COUNTDOWN DISPLAY
// ============================================

function formatCountdown(time) {
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
}

// ============================================
// UPDATE PRAYER TIMES TABLE
// ============================================

function updatePrayerTimesTable() {
    if (!currentPrayerTimes) return;
    
    const tableBody = document.getElementById('prayer-times-table');
    if (!tableBody) return;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
        { name: 'Fajr', time: currentPrayerTimes.fajr, icon: 'fa-sun' },
        { name: 'Sunrise', time: currentPrayerTimes.sunrise || '', icon: 'fa-sun' },
        { name: 'Dhuhr', time: currentPrayerTimes.dhuhr, icon: 'fa-sun' },
        { name: 'Asr', time: currentPrayerTimes.asr, icon: 'fa-sun' },
        { name: 'Maghrib', time: currentPrayerTimes.maghrib, icon: 'fa-moon' },
        { name: 'Isha', time: currentPrayerTimes.isha, icon: 'fa-moon' }
    ];
    
    tableBody.innerHTML = prayers.map(prayer => {
        if (!prayer.time) return '';
        
        const [hours, minutes] = prayer.time.split(':');
        const prayerTime = parseInt(hours) * 60 + parseInt(minutes);
        const isActive = Math.abs(prayerTime - currentTime) <= 5;
        const isPast = prayerTime < currentTime;
        
        let status = 'Upcoming';
        if (isActive) {
            status = '<span class="badge bg-success">Current</span>';
        } else if (isPast) {
            status = '<span class="badge bg-secondary">Passed</span>';
        } else {
            status = '<span class="badge bg-primary">Upcoming</span>';
        }
        
        return `
            <tr class="${isActive ? 'active' : ''}">
                <td>
                    <i class="fas ${prayer.icon} me-2"></i>
                    <strong>${prayer.name}</strong>
                </td>
                <td><strong>${formatPrayerTime12Hour(prayer.time)}</strong></td>
                <td>${status}</td>
            </tr>
        `;
    }).join('');
}

// ============================================
// UPDATE MONTHLY SCHEDULE
// ============================================

async function updateMonthlySchedule() {
    if (!currentLocation) return;
    
    const container = document.getElementById('monthly-schedule-container');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"></div></div>';
    
    setTimeout(async () => {
        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            let scheduleHTML = `
                <table class="table table-sm table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Fajr</th>
                            <th>Dhuhr</th>
                            <th>Asr</th>
                            <th>Maghrib</th>
                            <th>Isha</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            // Get prayer times for each day (up to 15 days)
            for (let day = 1; day <= Math.min(daysInMonth, 15); day++) {
                const prayerTimes = await fetchPrayerTimesFromAPI(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    calculationMethod,
                    madhab
                );
                
                if (prayerTimes) {
                    function formatTime(timeString) {
                        if (!timeString) return '--';
                        const [hours, minutes] = timeString.split(':');
                        return `${hours}:${minutes}`;
                    }
                    
                    scheduleHTML += `
                        <tr>
                            <td><strong>${day}</strong></td>
                            <td>${formatTime(prayerTimes.fajr)}</td>
                            <td>${formatTime(prayerTimes.dhuhr)}</td>
                            <td>${formatTime(prayerTimes.asr)}</td>
                            <td>${formatTime(prayerTimes.maghrib)}</td>
                            <td>${formatTime(prayerTimes.isha)}</td>
                        </tr>
                    `;
                }
            }
            
            scheduleHTML += '</tbody></table>';
            container.innerHTML = scheduleHTML;
            
        } catch (error) {
            console.error('Error generating monthly schedule:', error);
            container.innerHTML = '<p class="text-muted text-center">Unable to generate schedule.</p>';
        }
    }, 500);
}

// ============================================
// UPDATE PRAYER INFO
// ============================================

function updatePrayerInfo() {
    const infoMethod = document.getElementById('info-method');
    const infoTimezone = document.getElementById('info-timezone');
    const infoDate = document.getElementById('info-date');
    
    if (infoMethod) {
        infoMethod.textContent = calculationMethod;
    }
    
    if (infoTimezone) {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const offset = -new Date().getTimezoneOffset() / 60;
        infoTimezone.textContent = `${timezone} (UTC${offset >= 0 ? '+' : ''}${offset})`;
    }
    
    if (infoDate) {
        const today = new Date();
        infoDate.textContent = today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// ============================================
// UPDATE HIJRI DATE
// ============================================

function updateHijriDate() {
    const today = new Date();
    const gregorianYear = today.getFullYear();
    const gregorianMonth = today.getMonth() + 1;
    const gregorianDay = today.getDate();
    
    const hijriYear = Math.floor((gregorianYear - 622) * 0.970224) + 1;
    const hijriMonth = Math.floor((gregorianMonth + 8) % 12) + 1;
    const hijriDay = gregorianDay;
    
    const hijriMonths = [
        'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
        'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
        'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];
    
    const hijriDateDisplay = document.getElementById('hijri-date-display');
    if (hijriDateDisplay) {
        hijriDateDisplay.textContent = `${hijriDay} ${hijriMonths[hijriMonth - 1]} ${hijriYear} AH`;
    }
}

// ============================================
// UPDATE GREGORIAN DATE
// ============================================

function updateGregorianDate() {
    const gregorianDateDisplay = document.getElementById('gregorian-date-display');
    
    if (gregorianDateDisplay) {
        const today = new Date();
        gregorianDateDisplay.textContent = today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// ============================================
// SHOW ERROR MESSAGE
// ============================================

function showError(message) {
    console.error('Error:', message);
    
    const card = document.getElementById('current-prayer-card');
    if (card) {
        card.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error:</strong> ${message}
                <br><br>
                <button class="btn btn-outline-danger btn-sm mt-2" onclick="retryPrayerTimes()">
                    <i class="fas fa-redo me-1"></i> Retry
                </button>
                <br><br>
                <small>Please check the browser console (F12) for more details.</small>
            </div>
        `;
    }
}

// ============================================
// RETRY PRAYER TIMES
// ============================================

window.retryPrayerTimes = function() {
    console.log('Retrying prayer times...');
    if (currentLocation) {
        updatePrayerTimes();
    } else {
        initializePrayerTimes();
    }
};

// ============================================
// TEST API DIRECTLY (for debugging)
// ============================================
// Call this from browser console: testPrayerTimesAPI(24.8607, 67.0011)

window.testPrayerTimesAPI = async function(lat = 24.8607, lng = 67.0011, method = 'MuslimWorldLeague', madhab = 'Hanafi') {
    console.log('Testing API directly...');
    console.log('Parameters:', { lat, lng, method, madhab });
    
    const result = await fetchPrayerTimesFromAPI(lat, lng, method, madhab);
    console.log('Test result:', result);
    
    if (result && result.error) {
        console.error('API Test Failed:', result.message);
        alert('API Test Failed: ' + result.message);
    } else if (result) {
        console.log('API Test Success!', result);
        alert('API Test Success! Check console for details.');
    } else {
        console.error('API Test Failed: No result returned');
        alert('API Test Failed: No result returned');
    }
    
    return result;
};

