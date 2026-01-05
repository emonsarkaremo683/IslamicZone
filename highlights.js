// Highlights page functionality
// This script handles showing only specific sections based on URL hash

// Run immediately to prevent flash of all content
(function() {
    // Get the hash from URL (remove # if present)
    const hash = window.location.hash.replace('#', '').toLowerCase();
    
    // If there's a hash, hide all sections immediately
    if (hash && (hash === 'ramadan' || hash === 'hajj' || hash === 'zakat')) {
        const style = document.createElement('style');
        style.id = 'hash-navigation-style';
        style.textContent = `
            .highlight-section {
                display: none !important;
            }
            #${hash}.highlight-section {
                display: block !important;
            }
        `;
        document.head.appendChild(style);
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    // Get all highlight sections
    const sections = document.querySelectorAll('.highlight-section');
    
    // Function to show/hide sections based on hash
    function handleHashNavigation() {
        // Get the hash from URL (remove # if present)
        const hash = window.location.hash.replace('#', '').toLowerCase();
        
        // Remove any existing inline style
        const existingStyle = document.getElementById('hash-navigation-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // If there's no hash, show all sections (default behavior)
        if (!hash) {
            sections.forEach(section => {
                section.style.display = '';
                section.style.opacity = '1';
            });
            // Remove "Show All" button if it exists
            removeShowAllButton();
            return;
        }
        
        // Validate hash - only allow ramadan, hajj, zakat
        const validHashes = ['ramadan', 'hajj', 'zakat'];
        if (!validHashes.includes(hash)) {
            console.warn(`Invalid hash: ${hash}. Showing all sections.`);
            sections.forEach(section => {
                section.style.display = '';
                section.style.opacity = '1';
            });
            removeShowAllButton();
            return;
        }
        
        // Hide all sections first
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show only the section matching the hash
        const targetSection = document.getElementById(hash);
        
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.style.opacity = '1';
            
            // Add "Show All" button if it doesn't exist
            addShowAllButton();
            
            // Scroll to the section smoothly (account for navbar)
            setTimeout(() => {
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 80;
                const sectionTop = targetSection.offsetTop - navbarHeight;
                window.scrollTo({
                    top: Math.max(0, sectionTop),
                    behavior: 'smooth'
                });
            }, 100);
        } else {
            // If hash doesn't match any section, show all sections
            console.warn(`No section found with id: ${hash}. Showing all sections.`);
            sections.forEach(section => {
                section.style.display = '';
                section.style.opacity = '1';
            });
            removeShowAllButton();
        }
    }
    
    // Function to add "Show All" button
    function addShowAllButton() {
        // Check if button already exists
        if (document.getElementById('show-all-sections-btn')) {
            return;
        }
        
        const button = document.createElement('button');
        button.id = 'show-all-sections-btn';
        button.className = 'btn btn-golden btn-lg';
        button.innerHTML = '<i class="fas fa-list me-2"></i>Show All Sections';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = '20px';
        button.style.zIndex = '1000';
        button.style.boxShadow = '0 5px 20px rgba(0,0,0,0.3)';
        button.onclick = function() {
            window.location.hash = '';
            // Force navigation
            handleHashNavigation();
        };
        
        document.body.appendChild(button);
    }
    
    // Function to remove "Show All" button
    function removeShowAllButton() {
        const button = document.getElementById('show-all-sections-btn');
        if (button) {
            button.remove();
        }
    }
    
    // Handle hash on page load
    handleHashNavigation();
    
    // Handle hash changes (when user clicks links with hash)
    window.addEventListener('hashchange', handleHashNavigation);
    
    // Ramadan countdown functionality
    function updateRamadanCountdown() {
        // Ramadan dates for upcoming years (approximate - based on Islamic calendar)
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
        
        const ramadanStart = getNextRamadanDate();
        const now = new Date();
        const timeDiff = ramadanStart.getTime() - now.getTime();
        
        if (timeDiff > 0) {
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            // Update countdown display for highlights page
            const daysEl = document.getElementById('ramadan-days-large');
            const hoursEl = document.getElementById('ramadan-hours-large');
            const minutesEl = document.getElementById('ramadan-minutes-large');
            const secondsEl = document.getElementById('ramadan-seconds-large');

            if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');

            // Update homepage countdown (if on homepage)
            const daysHomepage = document.getElementById('ramadan-days');
            const hoursHomepage = document.getElementById('ramadan-hours');
            const minutesHomepage = document.getElementById('ramadan-minutes');

            if (daysHomepage) daysHomepage.textContent = String(days).padStart(2, '0');
            if (hoursHomepage) hoursHomepage.textContent = String(hours).padStart(2, '0');
            if (minutesHomepage) minutesHomepage.textContent = String(minutes).padStart(2, '0');
        }
    }
    
    // Update countdown only if we're on the highlights page (has ramadan-days-large)
    // The homepage countdown is handled by script.js
    const hasHighlightsElements = document.getElementById('ramadan-days-large');
    
    if (hasHighlightsElements) {
        updateRamadanCountdown();
        setInterval(updateRamadanCountdown, 1000);
    }
    
    // Zakat Calculator functionality
    window.calculateZakat = function() {
        // Get input values
        const cash = parseFloat(document.getElementById('cash-amount').value) || 0;
        const goldGrams = parseFloat(document.getElementById('gold-amount').value) || 0;
        const silverGrams = parseFloat(document.getElementById('silver-amount').value) || 0;
        const stocks = parseFloat(document.getElementById('stocks-amount').value) || 0;
        const business = parseFloat(document.getElementById('business-amount').value) || 0;
        const other = parseFloat(document.getElementById('other-amount').value) || 0;
        
        // Get gold and silver prices
        const goldPricePerGram = parseFloat(document.getElementById('gold-price').textContent) || 65.00;
        const silverPricePerGram = parseFloat(document.getElementById('silver-price').textContent) || 0.85;
        
        // Calculate total wealth
        const goldValue = goldGrams * goldPricePerGram;
        const silverValue = silverGrams * silverPricePerGram;
        const totalWealth = cash + goldValue + silverValue + stocks + business + other;
        
        // Nisab threshold (87.48 grams of gold at current price)
        const nisab = 87.48 * goldPricePerGram;
        
        // Calculate Zakat (2.5% of total wealth if above Nisab)
        let zakatAmount = 0;
        if (totalWealth >= nisab) {
            zakatAmount = totalWealth * 0.025; // 2.5%
        }
        
        // Display result
        const resultDiv = document.getElementById('zakat-result');
        const amountDiv = document.getElementById('zakat-amount');
        const nisabDiv = document.getElementById('nisab-amount');
        
        if (resultDiv && amountDiv && nisabDiv) {
            amountDiv.textContent = '$' + zakatAmount.toFixed(2);
            nisabDiv.textContent = nisab.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            resultDiv.classList.add('show');
        }
    };
});
