// ============================================
// DUAS PAGE - BEGINNER FRIENDLY VERSION
// ============================================
// This file handles displaying duas (supplications) from JSON files
// ============================================

// ============================================
// GLOBAL VARIABLES
// ============================================

let allDuas = [];               // All duas from all categories
let currentCategory = 'all';    // Current selected category
let searchTerm = '';            // Current search term

// JSON file paths
const DUA_FILES = {
    'general': 'assets/json/dua_en.json',
    'morning': 'assets/json/morning_dua_en.json',
    'evening': 'assets/json/evening_dua_en.json',
    'after-salah': 'assets/json/after_salah_dua_en.json'
};

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Duas page is loading...');
    
    setupEventListeners();
    setupNavbarScroll();
    loadAllDuas();
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
// SET UP EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Update current category
            currentCategory = this.getAttribute('data-category');
            
            // Filter and display duas
            filterAndDisplayDuas();
        });
    });
    
    // Search input
    const searchInput = document.getElementById('duaSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            filterAndDisplayDuas();
        });
    }
}

// ============================================
// LOAD ALL DUAS
// ============================================
// Loads duas from all JSON files

async function loadAllDuas() {
    console.log('Loading all duas...');
    
    const container = document.getElementById('duasContainer');
    if (container) {
        container.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading duas...</p>
            </div>
        `;
    }
    
    try {
        // Load all JSON files in parallel
        const loadPromises = Object.entries(DUA_FILES).map(async ([category, filePath]) => {
            try {
                const response = await fetch(filePath);
                if (!response.ok) {
                    console.warn(`Failed to load ${filePath}`);
                    return [];
                }
                const duas = await response.json();
                
                // Add category to each dua
                return duas.map(dua => ({
                    ...dua,
                    category: category
                }));
            } catch (error) {
                console.error(`Error loading ${filePath}:`, error);
                return [];
            }
        });
        
        // Wait for all files to load
        const results = await Promise.all(loadPromises);
        
        // Combine all duas into one array
        allDuas = results.flat();
        
        console.log('Loaded', allDuas.length, 'duas');
        
        // Display duas
        filterAndDisplayDuas();
        
    } catch (error) {
        console.error('Error loading duas:', error);
        showError('Failed to load duas. Please try again later.');
    }
}

// ============================================
// FILTER AND DISPLAY DUAS
// ============================================

function filterAndDisplayDuas() {
    let filteredDuas = allDuas;
    
    // Filter by category
    if (currentCategory !== 'all') {
        filteredDuas = filteredDuas.filter(dua => dua.category === currentCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
        filteredDuas = filteredDuas.filter(dua => {
            const searchText = (
                dua.title + ' ' +
                (dua.arabic || '') + ' ' +
                (dua.latin || '') + ' ' +
                (dua.translation || '') + ' ' +
                (dua.benefits || '') + ' ' +
                (dua.fawaid || '')
            ).toLowerCase();
            
            return searchText.includes(searchTerm);
        });
    }
    
    // Display filtered duas
    displayDuas(filteredDuas);
}

// ============================================
// DISPLAY DUAS
// ============================================

function displayDuas(duas) {
    const container = document.getElementById('duasContainer');
    
    if (!container) {
        console.error('Duas container not found');
        return;
    }
    
    if (duas.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info text-center">
                <i class="fas fa-info-circle me-2"></i>
                No duas found. Try adjusting your search or category filter.
            </div>
        `;
        return;
    }
    
    console.log('Displaying', duas.length, 'duas');
    
    // Create HTML for each dua
    const duasHTML = duas.map((dua, index) => {
        return createDuaHTML(dua, index);
    }).join('');
    
    // Update container
    container.innerHTML = duasHTML;
    
    // Highlight search terms
    if (searchTerm) {
        highlightSearchTerms();
    }
}

// ============================================
// CREATE DUA HTML
// ============================================

function createDuaHTML(dua, index) {
    return `
        <div class="dua-card" data-index="${index}">
            <div class="dua-title">
                <i class="fas fa-star text-warning"></i>
                ${dua.title || 'Dua'}
            </div>
            
            ${dua.arabic ? `
                <div class="dua-arabic">
                    ${dua.arabic}
                </div>
            ` : ''}
            
            ${dua.latin ? `
                <div class="dua-latin">
                    ${dua.latin}
                </div>
            ` : ''}
            
            ${dua.translation ? `
                <div class="dua-translation">
                    <strong>Translation:</strong><br>
                    ${dua.translation}
                </div>
            ` : ''}
            
            <div class="dua-info">
                ${dua.notes ? `
                    <div class="dua-info-item">
                        <div class="dua-info-label">Notes:</div>
                        <div class="dua-info-value">${dua.notes}</div>
                    </div>
                ` : ''}
                
                ${dua.benefits ? `
                    <div class="dua-info-item">
                        <div class="dua-info-label">Benefits:</div>
                        <div class="dua-info-value">${dua.benefits}</div>
                    </div>
                ` : ''}
                
                ${dua.fawaid ? `
                    <div class="dua-info-item">
                        <div class="dua-info-label">Benefits:</div>
                        <div class="dua-info-value">${dua.fawaid}</div>
                    </div>
                ` : ''}
                
                ${dua.source ? `
                    <div class="dua-info-item">
                        <div class="dua-info-label">Source:</div>
                        <div class="dua-info-value">${dua.source}</div>
                    </div>
                ` : ''}
            </div>
            
            <div class="dua-actions">
                <button class="dua-action-btn" onclick="copyDua(${index})" title="Copy dua">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="dua-action-btn" onclick="shareDua(${index})" title="Share dua">
                    <i class="fas fa-share-alt"></i>
                </button>
            </div>
        </div>
    `;
}

// ============================================
// HIGHLIGHT SEARCH TERMS
// ============================================

function highlightSearchTerms() {
    if (!searchTerm) return;
    
    const cards = document.querySelectorAll('.dua-card');
    cards.forEach(card => {
        const translation = card.querySelector('.dua-translation');
        if (translation) {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            const originalText = translation.textContent;
            translation.innerHTML = originalText.replace(regex, '<mark>$1</mark>');
        }
    });
}

// ============================================
// COPY DUA
// ============================================

function copyDua(index) {
    const dua = allDuas[index];
    if (!dua) return;
    
    let text = `${dua.title}\n\n`;
    
    if (dua.arabic) {
        text += `${dua.arabic}\n\n`;
    }
    
    if (dua.latin) {
        text += `${dua.latin}\n\n`;
    }
    
    if (dua.translation) {
        text += `Translation: ${dua.translation}\n\n`;
    }
    
    if (dua.notes) {
        text += `Notes: ${dua.notes}\n\n`;
    }
    
    if (dua.benefits || dua.fawaid) {
        text += `Benefits: ${dua.benefits || dua.fawaid}\n\n`;
    }
    
    if (dua.source) {
        text += `Source: ${dua.source}`;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        // Show feedback
        const card = document.querySelector(`[data-index="${index}"]`);
        const btn = card?.querySelector(`[onclick*="copyDua(${index})"]`);
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 1000);
        }
    });
}

// ============================================
// SHARE DUA
// ============================================

function shareDua(index) {
    const dua = allDuas[index];
    if (!dua) return;
    
    let text = `${dua.title}\n\n`;
    
    if (dua.arabic) {
        text += `${dua.arabic}\n\n`;
    }
    
    if (dua.translation) {
        text += `${dua.translation}`;
    }
    
    if (navigator.share) {
        navigator.share({
            title: dua.title,
            text: text
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text);
        alert('Dua copied to clipboard!');
    }
}

// ============================================
// SHOW ERROR MESSAGE
// ============================================

function showError(message) {
    const container = document.getElementById('duasContainer');
    if (container) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error:</strong> ${message}
            </div>
        `;
    }
}

// Make functions globally accessible
window.copyDua = copyDua;
window.shareDua = shareDua;

