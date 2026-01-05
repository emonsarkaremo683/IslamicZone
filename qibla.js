// ============================================
// QIBLA COMPASS - BEGINNER FRIENDLY VERSION
// ============================================
// This file handles the Qibla compass functionality
// Shows the direction to Mecca (Kaaba) from user's location
// ============================================

// ============================================
// GLOBAL VARIABLES
// ============================================

let currentHeading = 0;           // Current compass heading (0-360 degrees)
let qiblaDirection = 0;           // Direction to Qibla in degrees
let compassInterval = null;       // Interval for updating compass
let userLocation = null;          // User's current location

// Kaaba coordinates (Mecca, Saudi Arabia)
const KAABA_LATITUDE = 21.4225;
const KAABA_LONGITUDE = 39.8262;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Qibla Compass initializing...');
    
    // Check if we're on a page with qibla compass
    if (document.getElementById('qibla-compass')) {
        initializeQiblaCompass();
    }
});

// ============================================
// INITIALIZE QIBLA COMPASS
// ============================================

function initializeQiblaCompass() {
    // Request location permission
    if (!('geolocation' in navigator)) {
        showQiblaError('Geolocation is not supported by your browser.');
        return;
    }
    
    // Get user's location
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            
            // Try to get location name
            try {
                const response = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&localityLanguage=en`
                );
                const data = await response.json();
                
                if (data.locality && data.city) {
                    userLocation.name = `${data.locality}, ${data.city}`;
                } else if (data.city) {
                    userLocation.name = data.city;
                } else {
                    userLocation.name = `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;
                }
            } catch (e) {
                userLocation.name = `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;
            }
            
            // Calculate Qibla direction
            qiblaDirection = calculateQiblaDirection(
                userLocation.latitude,
                userLocation.longitude
            );
            
            console.log('Qibla direction calculated:', qiblaDirection);
            
            // Start compass
            startCompass();
            
            // Update Qibla info
            updateQiblaInfo();
        },
        (error) => {
            console.error('Geolocation error:', error);
            showQiblaError('Unable to get your location. Please allow location access.');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// ============================================
// CALCULATE QIBLA DIRECTION
// ============================================
// Calculates the bearing (direction) from user's location to Kaaba
// Returns angle in degrees (0-360, where 0 is North)

function calculateQiblaDirection(latitude, longitude) {
    // Convert degrees to radians
    const lat1 = latitude * Math.PI / 180;
    const lon1 = longitude * Math.PI / 180;
    const lat2 = KAABA_LATITUDE * Math.PI / 180;
    const lon2 = KAABA_LONGITUDE * Math.PI / 180;
    
    // Calculate the bearing using the formula
    const dLon = lon2 - lon1;
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - 
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    // Calculate bearing in radians, then convert to degrees
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    
    // Normalize to 0-360 degrees
    bearing = (bearing + 360) % 360;
    
    return bearing;
}

// ============================================
// START COMPASS
// ============================================
// Uses device orientation API to get compass heading

function startCompass() {
    // Check if device orientation is supported
    if (window.DeviceOrientationEvent) {
        // Request permission for iOS 13+
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    } else {
                        // Fallback: use manual compass
                        showManualCompass();
                    }
                })
                .catch(error => {
                    console.error('Permission error:', error);
                    showManualCompass();
                });
        } else {
            // Android and older iOS
            window.addEventListener('deviceorientation', handleOrientation);
        }
    } else {
        // Device orientation not supported, show manual compass
        showManualCompass();
    }
}

// ============================================
// HANDLE DEVICE ORIENTATION
// ============================================
// Updates compass when device orientation changes

function handleOrientation(event) {
    if (event.alpha !== null) {
        // alpha is the compass heading (0-360 degrees)
        currentHeading = event.alpha;
        
        // Update compass display
        updateCompassDisplay();
    }
}

// ============================================
// UPDATE COMPASS DISPLAY
// ============================================

function updateCompassDisplay() {
    const compass = document.getElementById('qibla-compass');
    const compassNeedle = document.getElementById('compass-needle');
    const qiblaArrow = document.getElementById('qibla-arrow');
    const directionDisplay = document.getElementById('qibla-direction');
    const angleDisplay = document.getElementById('qibla-angle');
    
    if (!compass) return;
    
    // Calculate the angle to rotate the compass needle (points to North)
    if (compassNeedle) {
        compassNeedle.style.transform = `translate(-50%, -100%) rotate(${currentHeading}deg)`;
    }
    
    // Rotate the Qibla arrow (points to Qibla direction)
    if (qiblaArrow) {
        qiblaArrow.style.transform = `translateX(-50%) rotate(${qiblaDirection}deg)`;
    }
    
    // Update direction text
    if (directionDisplay) {
        const directionName = getDirectionName(qiblaDirection);
        directionDisplay.textContent = directionName;
    }
    
    // Update angle display
    if (angleDisplay) {
        angleDisplay.textContent = `${qiblaDirection.toFixed(1)}° from North`;
    }
    
    // Update info display
    updateQiblaInfoDisplay();
}

// ============================================
// SHOW MANUAL COMPASS
// ============================================
// Shows a manual compass that user can rotate

function showManualCompass() {
    const compass = document.getElementById('qibla-compass');
    if (!compass) return;
    
    // Add instruction message
    const instruction = document.createElement('div');
    instruction.className = 'alert alert-info mt-3';
    instruction.innerHTML = `
        <i class="fas fa-info-circle me-2"></i>
        <strong>Manual Mode:</strong> Rotate your device or use the buttons below to align with North.
        The red arrow will point to Qibla.
    `;
    compass.parentElement.appendChild(instruction);
    
    // Add manual rotation buttons
    const controls = document.createElement('div');
    controls.className = 'compass-controls text-center mt-3';
    controls.innerHTML = `
        <button class="btn btn-outline-primary me-2" onclick="rotateCompass(-10)">
            <i class="fas fa-undo"></i> Rotate Left
        </button>
        <button class="btn btn-outline-primary me-2" onclick="resetCompass()">
            <i class="fas fa-compass"></i> Reset
        </button>
        <button class="btn btn-outline-primary" onclick="rotateCompass(10)">
            Rotate Right <i class="fas fa-redo"></i>
        </button>
    `;
    compass.parentElement.appendChild(controls);
}

// ============================================
// ROTATE COMPASS MANUALLY
// ============================================
// Make these functions globally accessible for onclick handlers

window.rotateCompass = function(degrees) {
    currentHeading = (currentHeading + degrees + 360) % 360;
    updateCompassDisplay();
};

// ============================================
// RESET COMPASS
// ============================================

window.resetCompass = function() {
    currentHeading = 0;
    updateCompassDisplay();
};

// ============================================
// GET DIRECTION NAME
// ============================================
// Converts degrees to direction name (N, NE, E, etc.)

function getDirectionName(degrees) {
    const directions = [
        'North', 'NNE', 'NE', 'ENE',
        'East', 'ESE', 'SE', 'SSE',
        'South', 'SSW', 'SW', 'WSW',
        'West', 'WNW', 'NW', 'NNW'
    ];
    
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

// ============================================
// CALCULATE DISTANCE TO KAABA
// ============================================
// Calculates distance from user's location to Kaaba in kilometers

function calculateDistance() {
    if (!userLocation) return null;
    
    // Haversine formula to calculate distance
    const R = 6371; // Earth's radius in kilometers
    
    const lat1 = userLocation.latitude * Math.PI / 180;
    const lon1 = userLocation.longitude * Math.PI / 180;
    const lat2 = KAABA_LATITUDE * Math.PI / 180;
    const lon2 = KAABA_LONGITUDE * Math.PI / 180;
    
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance.toFixed(0);
}

// ============================================
// UPDATE QIBLA INFO
// ============================================

function updateQiblaInfo() {
    updateQiblaInfoDisplay();
}

function updateQiblaInfoDisplay() {
    if (!userLocation) return;
    
    const distance = calculateDistance();
    const directionName = getDirectionName(qiblaDirection);
    
    // Update info element if it exists
    const infoElement = document.getElementById('qibla-info');
    if (infoElement) {
        infoElement.innerHTML = `
            <div class="qibla-details">
                <p><strong>Your Location:</strong> ${userLocation.name || `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}</p>
                <p><strong>Qibla Direction:</strong> ${directionName} (${qiblaDirection.toFixed(1)}°)</p>
                <p><strong>Distance to Kaaba:</strong> ${distance} km</p>
            </div>
        `;
    }
    
    // Update location display elements
    const locationEl = document.getElementById('user-location');
    const coordsEl = document.getElementById('user-coordinates');
    const distanceEl = document.getElementById('distance-to-kaaba');
    const directionEl = document.getElementById('qibla-direction-text');
    
    if (locationEl) {
        locationEl.textContent = userLocation.name || `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;
    }
    
    if (coordsEl) {
        coordsEl.textContent = `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;
    }
    
    if (distanceEl && distance) {
        distanceEl.textContent = `${distance} km`;
    }
    
    if (directionEl) {
        directionEl.textContent = `${directionName} (${qiblaDirection.toFixed(1)}°)`;
    }
}

// ============================================
// SHOW QIBLA ERROR
// ============================================

function showQiblaError(message) {
    const compass = document.getElementById('qibla-compass');
    if (compass) {
        compass.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        `;
    }
}

