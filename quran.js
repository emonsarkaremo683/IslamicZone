// ============================================
// QURAN PAGE - SURAH LIST
// ============================================
// This file handles the Quran surah list page (quran.html)
// Displays all 114 surahs with filtering and search functionality
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
    console.log('Quran page is loading...');
    
    // Load Quran data from JSON file
    loadQuranData();
    
    // Set up all event listeners (buttons, inputs, etc.)
    setupEventListeners();
    
    // Set up navbar scroll effects
    setupNavbarScroll();
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
// LOAD QURAN DATA
// ============================================

async function loadQuranData() {
    try {
        const languageMap = {
            'ar': 'assets/json/quran.json',
            'en': 'assets/json/quran_en.json',
            'bn': 'assets/json/quran_bn.json'
        };
        
        const filePath = languageMap[currentLanguage];
        const response = await fetch(filePath);
        quranData = await response.json();
        allSurahs = quranData;
        displaySurahs(allSurahs);
        
        console.log('Quran data loaded successfully');
    } catch (error) {
        console.error('Error loading Quran data:', error);
        showError('Failed to load Quran data. Please try again later.');
    }
}

// ============================================
// SET UP EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Language selector
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Update current language
            currentLanguage = this.getAttribute('data-lang');
            // Reload Quran data with new language
            loadQuranData();
        });
    });
    
    // Surah filter
    const surahFilter = document.getElementById('surahFilter');
    if (surahFilter) {
        surahFilter.addEventListener('input', filterSurahs);
    }
    
    // Type filter
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) {
        typeFilter.addEventListener('change', filterSurahs);
    }
}

// ============================================
// DISPLAY SURAHS
// ============================================

function displaySurahs(surahs) {
    const container = document.getElementById('surahsContainer');
    if (!container) return;
    
    if (!surahs || surahs.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <h4>No surahs found</h4>
                    <p>Try adjusting your filters</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Responsive column classes: col-4 on mobile, col-md-2 on tablet, col-lg-2 on desktop
    container.innerHTML = surahs.map(surah => `
        <div class="col-6 col-md-4 col-lg-3 col-xl-2">
            <div class="card surah-card shadow-sm" onclick="openSurah(${surah.id})">
                <div class="card-body p-3">
                    <div class="surah-number">${surah.id}</div>
                    <h5 class="surah-name">${surah.name}</h5>
                    <div class="surah-transliteration">${surah.transliteration || ''}</div>
                    <div class="surah-info">
                        <i class="fas fa-list-ol me-1"></i>${surah.total_verses} Verses
                    </div>
                    <span class="surah-type-badge type-${surah.type}">
                        ${surah.type.charAt(0).toUpperCase() + surah.type.slice(1)}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// OPEN SURAH PAGE
// ============================================

function openSurah(surahId) {
    window.location.href = `surah.html?id=${surahId}&lang=${currentLanguage}`;
}

// ============================================
// FILTER SURAHS
// ============================================

function filterSurahs() {
    const nameFilter = document.getElementById('surahFilter')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    let filtered = allSurahs;
    
    if (nameFilter) {
        filtered = filtered.filter(surah => {
            return surah.name.toLowerCase().includes(nameFilter) ||
                   (surah.transliteration && 
                    surah.transliteration.toLowerCase().includes(nameFilter));
        });
    }
    
    if (typeFilter) {
        filtered = filtered.filter(surah => surah.type === typeFilter);
    }
    
    displaySurahs(filtered);
}

// ============================================
// SHOW ERROR MESSAGE
// ============================================

function showError(message) {
    const container = document.getElementById('surahsContainer');
    if (container) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>${message}
                </div>
            </div>
        `;
    }
}

