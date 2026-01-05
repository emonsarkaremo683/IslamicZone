// ============================================
// SURAH PAGE - BEGINNER FRIENDLY VERSION
// ============================================
// This file handles displaying a single surah (chapter) from the Quran
// Shows verses with Arabic text and translations
// ============================================

// ============================================
// GLOBAL VARIABLES
// ============================================

let currentSurah = null;        // Stores the current surah data
let currentLanguage = 'en';     // Current language: 'en', 'ar', or 'bn'
let allSurahs = [];             // All surahs from the loaded JSON file
let currentFontSize = 1;        // Current font size multiplier
let favoriteVerses = new Set(); // Set of favorite verse IDs
let searchTerm = '';            // Current search term

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Surah page is loading...');
    
    // Get surah ID and language from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const surahId = urlParams.get('id');
    const lang = urlParams.get('lang');
    
    console.log('Surah ID:', surahId, 'Language:', lang);
    
    // Set current language (default to English if not specified)
    if (lang) {
        currentLanguage = lang;
    }
    
    // Load saved preferences
    loadPreferences();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up navbar scroll effect
    setupNavbarScroll();
    
    // Set up reading progress
    setupReadingProgress();
    
    // Set up scroll to top button
    setupScrollToTop();
    
    // Load and display the surah
    if (surahId) {
        loadSurah(parseInt(surahId));
    } else {
        showError('No surah ID provided. Please go back and select a surah.');
    }
});

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================

function setupNavbarScroll() {
    const navbar = document.getElementById('mainNav');
    const controlsBar = document.getElementById('controlsBar');
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.pageYOffset > 100);
            
            // Add scrolled class to controls bar
            if (controlsBar) {
                controlsBar.classList.toggle('scrolled', window.pageYOffset > 200);
            }
        });
    }
}

// ============================================
// SET UP EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Language selector buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });
    
    // Font size controls
    document.getElementById('fontDecrease')?.addEventListener('click', () => adjustFontSize(-0.1));
    document.getElementById('fontIncrease')?.addEventListener('click', () => adjustFontSize(0.1));
    document.getElementById('fontReset')?.addEventListener('click', () => resetFontSize());
    
    // Dark mode toggle
    document.getElementById('darkModeToggle')?.addEventListener('click', toggleDarkMode);
    
    // Jump to verse
    document.getElementById('jumpToVerseBtn')?.addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('jumpToVerseModal'));
        modal.show();
    });
    
    document.getElementById('jumpToVerseConfirm')?.addEventListener('click', jumpToVerse);
    
    // Search functionality
    const searchInput = document.getElementById('verseSearch');
    const clearSearchBtn = document.getElementById('clearSearch');
    const searchResultsInfo = document.getElementById('searchResultsInfo');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase().trim();
            filterVerses();
            updateSearchUI();
        });
        
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.style.borderColor = 'var(--surah-primary)';
        });
        
        searchInput.addEventListener('blur', () => {
            if (!searchTerm) {
                searchInput.parentElement.style.borderColor = '';
            }
        });
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchTerm = '';
                filterVerses();
                updateSearchUI();
                searchInput.focus();
            }
        });
    }
    
    function updateSearchUI() {
        // Show/hide clear button
        if (clearSearchBtn) {
            if (searchTerm) {
                clearSearchBtn.classList.add('show');
            } else {
                clearSearchBtn.classList.remove('show');
            }
        }
        
        // Update search results info
        if (searchResultsInfo && searchInput) {
            const containers = document.querySelectorAll('.verse-container');
            let visibleCount = 0;
            
            containers.forEach(container => {
                if (container.style.display !== 'none' && getComputedStyle(container).display !== 'none') {
                    visibleCount++;
                }
            });
            
            const totalVerses = containers.length;
            
            if (searchTerm && visibleCount > 0) {
                searchResultsInfo.textContent = `Found ${visibleCount} of ${totalVerses} verses`;
                searchResultsInfo.classList.add('show');
                searchResultsInfo.style.color = '';
            } else if (searchTerm && visibleCount === 0) {
                searchResultsInfo.textContent = `No verses found matching "${searchInput.value}"`;
                searchResultsInfo.classList.add('show');
                searchResultsInfo.style.color = '#ef4444';
            } else {
                searchResultsInfo.classList.remove('show');
            }
        }
    }
    
    // Make updateSearchUI globally accessible
    window.updateSearchUI = updateSearchUI;
    
    // Scroll to top button
    document.getElementById('jumpToTop')?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// LOAD PREFERENCES
// ============================================

function loadPreferences() {
    // Load dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }
    
    // Load font size preference
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        currentFontSize = parseFloat(savedFontSize);
        applyFontSize();
    }
    
    // Load favorite verses
    const savedFavorites = localStorage.getItem('favoriteVerses');
    if (savedFavorites) {
        favoriteVerses = new Set(JSON.parse(savedFavorites));
    }
}

// ============================================
// SWITCH LANGUAGE
// ============================================

function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update URL
    const urlParams = new URLSearchParams(window.location.search);
    const surahId = urlParams.get('id');
    window.history.replaceState({}, '', `surah.html?id=${surahId}&lang=${currentLanguage}`);
    
    // Reload surah
    if (surahId) {
        loadSurah(parseInt(surahId));
    }
}

// ============================================
// FONT SIZE CONTROLS
// ============================================

function adjustFontSize(delta) {
    currentFontSize = Math.max(0.8, Math.min(1.5, currentFontSize + delta));
    applyFontSize();
    localStorage.setItem('fontSize', currentFontSize.toString());
}

function resetFontSize() {
    currentFontSize = 1;
    applyFontSize();
    localStorage.setItem('fontSize', currentFontSize.toString());
}

function applyFontSize() {
    const arabicElements = document.querySelectorAll('.verse-arabic');
    const translationElements = document.querySelectorAll('.verse-translation');
    
    arabicElements.forEach(el => {
        el.style.fontSize = `${2 * currentFontSize}rem`;
    });
    
    translationElements.forEach(el => {
        el.style.fontSize = `${1.15 * currentFontSize}rem`;
    });
}

// ============================================
// DARK MODE TOGGLE
// ============================================

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDark.toString());
    updateDarkModeIcon(isDark);
}

function updateDarkModeIcon(isDark) {
    const icon = document.querySelector('#darkModeToggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ============================================
// JUMP TO VERSE
// ============================================

function jumpToVerse() {
    const verseNumber = parseInt(document.getElementById('verseNumberInput').value);
    
    if (!verseNumber || verseNumber < 1) {
        alert('Please enter a valid verse number');
        return;
    }
    
    const verseElement = document.querySelector(`[data-verse-id="${verseNumber}"]`);
    
    if (verseElement) {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('jumpToVerseModal'));
        modal.hide();
        
        // Scroll to verse
        verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight verse temporarily
        verseElement.classList.add('highlighted');
        setTimeout(() => {
            verseElement.classList.remove('highlighted');
        }, 2000);
    } else {
        alert(`Verse ${verseNumber} not found`);
    }
}

// ============================================
// SEARCH VERSES
// ============================================

function filterVerses() {
    const containers = document.querySelectorAll('.verse-container');
    
    if (!searchTerm) {
        containers.forEach(container => {
            container.style.display = '';
            container.classList.remove('highlighted');
            // Remove highlight marks
            const translation = container.querySelector('.verse-translation');
            if (translation) {
                translation.innerHTML = translation.textContent;
            }
        });
        return;
    }
    
    let visibleCount = 0;
    
    containers.forEach(container => {
        const verseText = container.textContent.toLowerCase();
        if (verseText.includes(searchTerm)) {
            container.style.display = '';
            container.classList.add('highlighted');
            visibleCount++;
            // Highlight search term
            highlightSearchTerm(container);
        } else {
            container.style.display = 'none';
            container.classList.remove('highlighted');
        }
    });
}

function highlightSearchTerm(container) {
    const translation = container.querySelector('.verse-translation');
    if (translation && searchTerm) {
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        translation.innerHTML = translation.textContent.replace(regex, '<mark>$1</mark>');
    }
}

// ============================================
// READING PROGRESS
// ============================================

function setupReadingProgress() {
    window.addEventListener('scroll', () => {
        const progressBar = document.getElementById('readingProgress');
        if (!progressBar) return;
        
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        
        progressBar.style.width = Math.min(100, scrollPercent) + '%';
    });
}

// ============================================
// SCROLL TO TOP BUTTON
// ============================================

function setupScrollToTop() {
    const button = document.getElementById('jumpToTop');
    if (!button) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.classList.add('show');
        } else {
            button.classList.remove('show');
        }
    });
}

// ============================================
// VERSE ACTIONS
// ============================================

function copyVerse(verseId) {
    const container = document.querySelector(`[data-verse-id="${verseId}"]`);
    if (!container) return;
    
    const arabic = container.querySelector('.verse-arabic')?.textContent || '';
    const translation = container.querySelector('.verse-translation')?.textContent || '';
    const text = `${arabic}\n\n${translation}`;
    
    navigator.clipboard.writeText(text).then(() => {
        // Show feedback
        const btn = container.querySelector(`[onclick*="${verseId}"]`);
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 1000);
        }
    });
}

function toggleFavorite(verseId) {
    if (favoriteVerses.has(verseId)) {
        favoriteVerses.delete(verseId);
    } else {
        favoriteVerses.add(verseId);
    }
    
    // Save to localStorage
    localStorage.setItem('favoriteVerses', JSON.stringify([...favoriteVerses]));
    
    // Update button
    const btn = document.querySelector(`[onclick*="toggleFavorite(${verseId})"]`);
    if (btn) {
        btn.classList.toggle('favorited', favoriteVerses.has(verseId));
    }
}

function shareVerse(verseId) {
    const container = document.querySelector(`[data-verse-id="${verseId}"]`);
    if (!container) return;
    
    const arabic = container.querySelector('.verse-arabic')?.textContent || '';
    const translation = container.querySelector('.verse-translation')?.textContent || '';
    const text = `${arabic}\n\n${translation}`;
    
    if (navigator.share) {
        navigator.share({
            title: `Surah ${currentSurah?.name} - Verse ${verseId}`,
            text: text
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text);
        alert('Verse copied to clipboard!');
    }
}

// ============================================
// LOAD SURAH DATA
// ============================================

async function loadSurah(surahId) {
    console.log('Loading surah:', surahId, 'in language:', currentLanguage);
    
    // Show loading spinner
    const container = document.getElementById('versesContainer');
    if (container) {
        container.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading surah...</p>
            </div>
        `;
    }
    
    try {
        const languageMap = {
            'ar': 'assets/json/quran.json',
            'en': 'assets/json/quran_en.json',
            'bn': 'assets/json/quran_bn.json'
        };
        
        const filePath = languageMap[currentLanguage];
        
        if (!filePath) {
            throw new Error('Invalid language: ' + currentLanguage);
        }
        
        console.log('Loading from file:', filePath);
        
        const response = await fetch(filePath);
        
        if (!response.ok) {
            throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
        }
        
        const quranData = await response.json();
        allSurahs = quranData;
        
        console.log('Quran data loaded. Total surahs:', allSurahs.length);
        
        const surah = allSurahs.find(s => s.id === surahId);
        
        if (!surah) {
            throw new Error(`Surah with ID ${surahId} not found`);
        }
        
        console.log('Surah found:', surah.name);
        
        currentSurah = surah;
        displaySurah(surah);
        
    } catch (error) {
        console.error('Error loading surah:', error);
        showError('Failed to load surah: ' + error.message);
    }
}

// ============================================
// DISPLAY SURAH
// ============================================

function displaySurah(surah) {
    if (!surah) {
        showError('No surah data available');
        return;
    }
    
    console.log('Displaying surah:', surah.name);
    
    updateSurahHeader(surah);
    displayVerses(surah);
    applyFontSize(); // Apply saved font size
}

// ============================================
// UPDATE SURAH HEADER
// ============================================

function updateSurahHeader(surah) {
    const titleElement = document.getElementById('surahTitle');
    const infoElement = document.getElementById('surahInfo');
    
    if (titleElement) {
        titleElement.textContent = surah.name;
    }
    
    if (infoElement) {
        const badges = [];
        
        if (surah.transliteration) {
            badges.push(`<span class="surah-info-badge">${surah.transliteration}</span>`);
        }
        
        badges.push(`<span class="surah-info-badge"><i class="fas fa-list-ol me-1"></i>${surah.total_verses} Verses</span>`);
        
        if (surah.type) {
            badges.push(`<span class="surah-info-badge">${surah.type.charAt(0).toUpperCase() + surah.type.slice(1)}</span>`);
        }
        
        infoElement.innerHTML = badges.join('');
    }
}

// ============================================
// DISPLAY VERSES
// ============================================

function displayVerses(surah) {
    const container = document.getElementById('versesContainer');
    
    if (!container) {
        console.error('Verses container not found');
        return;
    }
    
    if (!surah.verses || surah.verses.length === 0) {
        container.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                No verses found for this surah.
            </div>
        `;
        return;
    }
    
    console.log('Displaying', surah.verses.length, 'verses');
    
    const versesHTML = surah.verses.map(verse => {
        return createVerseHTML(verse);
    }).join('');
    
    container.innerHTML = versesHTML;
    
    // Apply font size after rendering
    setTimeout(() => applyFontSize(), 100);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// CREATE VERSE HTML
// ============================================

function createVerseHTML(verse) {
    const verseText = getVerseText(verse);
    const verseTranslation = getVerseTranslation(verse);
    const showArabic = currentLanguage !== 'ar' || verse.text;
    const isFavorited = favoriteVerses.has(verse.id);
    
    return `
        <div class="verse-container" data-verse-id="${verse.id}">
            <div class="verse-header">
                <div class="verse-number">${verse.id}</div>
                <div class="verse-actions">
                    <button class="verse-action-btn" onclick="copyVerse(${verse.id})" title="Copy verse">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="verse-action-btn ${isFavorited ? 'favorited' : ''}" onclick="toggleFavorite(${verse.id})" title="Add to favorites">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="verse-action-btn" onclick="shareVerse(${verse.id})" title="Share verse">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
            
            ${showArabic && verse.text ? `
                <div class="verse-arabic">
                    ${verse.text}
                </div>
            ` : ''}
            
            ${verseTranslation ? `
                <div class="verse-translation">
                    ${verseTranslation}
                </div>
            ` : ''}
        </div>
    `;
}

// ============================================
// GET VERSE TEXT
// ============================================

function getVerseText(verse) {
    return verse.text || '';
}

// ============================================
// GET VERSE TRANSLATION
// ============================================

function getVerseTranslation(verse) {
    if (currentLanguage === 'ar') {
        return verse.text || '';
    }
    return verse.translation || '';
}

// ============================================
// SHOW ERROR MESSAGE
// ============================================

function showError(message) {
    console.error('Error:', message);
    
    const container = document.getElementById('versesContainer');
    if (container) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error:</strong> ${message}
                <br><br>
                <button class="btn btn-outline-danger" onclick="window.location.href='quran.html'">
                    <i class="fas fa-arrow-left me-2"></i>Go Back
                </button>
            </div>
        `;
    }
    
    const titleElement = document.getElementById('surahTitle');
    if (titleElement) {
        titleElement.textContent = 'Error';
    }
    
    const infoElement = document.getElementById('surahInfo');
    if (infoElement) {
        infoElement.textContent = message;
    }
}

// Make functions globally accessible
window.copyVerse = copyVerse;
window.toggleFavorite = toggleFavorite;
window.shareVerse = shareVerse;
