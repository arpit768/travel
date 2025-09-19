// Adventures Page JavaScript

let selectedAdventures = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check URL parameters for country filter
    const urlParams = new URLSearchParams(window.location.search);
    const countryFilter = urlParams.get('country');

    // Load adventures from API with country filter
    if (countryFilter) {
        loadAdventuresWithFilters({ country: countryFilter });

        // Update page title to show country
        const countryNames = {
            nepal: 'Nepal',
            india: 'India',
            tibet: 'Tibet',
            bhutan: 'Bhutan'
        };

        if (countryNames[countryFilter]) {
            document.title = `${countryNames[countryFilter]} Adventures - Nepal Adventures`;

            // Add country header
            addCountryHeader(countryFilter, countryNames[countryFilter]);
        }
    } else {
        loadAdventures();
    }

    // Handle adventure selection
    const adventureItems = document.querySelectorAll('.adventure-item');
    adventureItems.forEach(item => {
        item.addEventListener('click', function() {
            toggleAdventure(this);
        });
    });

    // Check URL parameters for pre-selected adventure
    const adventureType = urlParams.get('type');
    if (adventureType) {
        const item = document.querySelector(`[data-adventure="${adventureType}"]`);
        if (item) {
            toggleAdventure(item);
        }
    }
});

// Toggle adventure selection
function toggleAdventure(item) {
    const adventureType = item.getAttribute('data-adventure');
    
    if (item.classList.contains('selected')) {
        // Remove from selection
        item.classList.remove('selected');
        selectedAdventures = selectedAdventures.filter(adv => adv !== adventureType);
    } else {
        // Add to selection
        item.classList.add('selected');
        selectedAdventures.push(adventureType);
    }
    
    updateSelectionCount();
}

// Update selection count and button state
function updateSelectionCount() {
    const countElement = document.getElementById('selectedCount');
    const proceedBtn = document.getElementById('proceedBtn');
    
    countElement.textContent = selectedAdventures.length;
    
    if (selectedAdventures.length > 0) {
        proceedBtn.disabled = false;
        proceedBtn.textContent = `Proceed to Find Guides & Gear (${selectedAdventures.length} selected)`;
    } else {
        proceedBtn.disabled = true;
        proceedBtn.textContent = 'Proceed to Find Guides & Gear';
    }
}

// Clear all selections
function clearSelection() {
    selectedAdventures = [];
    document.querySelectorAll('.adventure-item').forEach(item => {
        item.classList.remove('selected');
    });
    updateSelectionCount();
}

// Proceed with selected adventures
function proceedWithSelection() {
    if (selectedAdventures.length === 0) {
        alert('Please select at least one adventure type');
        return;
    }
    
    // Store selected adventures in sessionStorage
    sessionStorage.setItem('selectedAdventures', JSON.stringify(selectedAdventures));
    
    // Redirect to guides page with selected adventures
    const queryString = selectedAdventures.map(adv => `adventure=${adv}`).join('&');
    window.location.href = `guides.html?${queryString}`;
}

// Filter handling
const filters = ['duration', 'difficulty', 'season', 'budget'];
filters.forEach(filter => {
    const element = document.getElementById(filter);
    if (element) {
        element.addEventListener('change', applyFilters);
    }
});

// Load adventures from API
async function loadAdventures() {
    try {
        console.log('Loading adventures from API...');

        // Show loading state
        const adventuresSection = document.querySelector('#adventures .container');
        if (adventuresSection) {
            // Create loading element
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'adventures-loading';
            loadingDiv.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: white;">
                    <h3>🏔️ Loading Amazing Adventures...</h3>
                    <div style="margin: 1rem 0;">⛰️ Fetching treks from the Himalayas...</div>
                </div>
            `;

            // Insert loading message
            const existingContent = adventuresSection.querySelector('.adventures-list');
            if (existingContent) {
                existingContent.style.display = 'none';
            }
            adventuresSection.appendChild(loadingDiv);
        }

        // Fetch adventures from API
        const response = await window.API.adventures.getAll();

        console.log('Adventures loaded:', response);

        if (response && response.success && response.data) {
            displayAdventures(response.data);
        } else {
            console.error('Failed to load adventures:', response);
            showErrorMessage('Failed to load adventures. Please try again.');
        }
    } catch (error) {
        console.error('Error loading adventures:', error);
        showErrorMessage('Network error - please check if the server is running and try again.');
    }
}

// Display adventures in the UI
function displayAdventures(adventures) {
    console.log('Displaying adventures:', adventures);

    // Remove loading message
    const loadingDiv = document.getElementById('adventures-loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }

    // Create adventures grid
    const adventuresSection = document.querySelector('#adventures .container');
    if (!adventuresSection) return;

    // Create adventures list HTML
    const adventuresHTML = `
        <div class="adventures-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; margin: 2rem 0;">
            ${adventures.map(adventure => `
                <div class="adventure-card" style="background: rgba(255,255,255,0.95); border-radius: 12px; padding: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.3); backdrop-filter: blur(20px); transition: transform 0.3s ease, box-shadow 0.3s ease;">
                    <div class="adventure-image" style="height: 200px; background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${adventure.images && adventure.images[0] ? adventure.images[0].url : 'https://images.unsplash.com/photo-1544735716-392fe2489ffa'}') center/cover; border-radius: 8px; margin-bottom: 1rem; position: relative;">
                        <div style="position: absolute; top: 10px; right: 10px; background: rgba(44,85,48,0.9); color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">
                            ${adventure.country.charAt(0).toUpperCase() + adventure.country.slice(1)}
                        </div>
                        <div style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem;">
                            ${adventure.duration.days} days
                        </div>
                    </div>
                    <h3 style="color: var(--primary-color); margin-bottom: 0.5rem; font-size: 1.3rem;">${adventure.title}</h3>
                    <p style="color: var(--text-color); margin-bottom: 1rem; font-size: 0.9rem;">${adventure.shortDescription}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <span style="background: rgba(44,85,48,0.1); color: var(--primary-color); padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem; font-weight: 600;">
                            ${adventure.difficulty.level.charAt(0).toUpperCase() + adventure.difficulty.level.slice(1)}
                        </span>
                        <span style="color: var(--primary-color); font-weight: 700; font-size: 1.1rem;">
                            $${adventure.pricing.basePrice}
                        </span>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
                        ${adventure.highlights.slice(0, 2).map(highlight => `
                            <span style="background: rgba(52,152,219,0.1); color: #3498db; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.7rem;">${highlight}</span>
                        `).join('')}
                    </div>
                    <button onclick="viewAdventure('${adventure._id}')" style="width: 100%; background: linear-gradient(135deg, var(--primary-color), #27ae60); color: white; border: none; padding: 0.8rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: transform 0.2s ease;">
                        🏔️ View Details
                    </button>
                </div>
            `).join('')}
        </div>
    `;

    // Insert adventures HTML
    const existingList = adventuresSection.querySelector('.adventures-list');
    if (existingList) {
        existingList.outerHTML = adventuresHTML;
    } else {
        adventuresSection.innerHTML += adventuresHTML;
    }

    // Add hover effects to adventure cards
    document.querySelectorAll('.adventure-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 20px 50px rgba(0,0,0,0.4)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
        });
    });
}

// View adventure details
function viewAdventure(adventureId) {
    // For now, just show an alert. In a real app, this would open a detailed view
    alert(`🏔️ Opening adventure details for ID: ${adventureId}\n\nThis would typically open a detailed adventure page with:\n- Full itinerary\n- Pricing details\n- Booking options\n- Guide recommendations`);
}

// Show error message
function showErrorMessage(message) {
    // Remove loading message
    const loadingDiv = document.getElementById('adventures-loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }

    const adventuresSection = document.querySelector('#adventures .container');
    if (!adventuresSection) return;

    const errorHTML = `
        <div style="text-align: center; padding: 3rem; color: white; background: rgba(231,76,60,0.1); border-radius: 12px; margin: 2rem 0; border: 1px solid rgba(231,76,60,0.3);">
            <h3>❌ ${message}</h3>
            <button onclick="loadAdventures()" style="background: linear-gradient(135deg, var(--primary-color), #27ae60); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem;">
                🔄 Try Again
            </button>
        </div>
    `;

    const existingList = adventuresSection.querySelector('.adventures-list');
    if (existingList) {
        existingList.outerHTML = errorHTML;
    } else {
        adventuresSection.innerHTML += errorHTML;
    }
}

function applyFilters() {
    const filterValues = {};
    filters.forEach(filter => {
        const element = document.getElementById(filter);
        if (element && element.value) {
            filterValues[filter] = element.value;
        }
    });

    console.log('Applying filters:', filterValues);

    // Convert filter values to API parameters
    const apiParams = {};

    if (filterValues.difficulty) {
        apiParams.difficulty = filterValues.difficulty;
    }

    if (filterValues.duration) {
        // Convert duration filter to days
        switch (filterValues.duration) {
            case 'short': apiParams.maxDays = 7; break;
            case 'medium': apiParams.minDays = 7; apiParams.maxDays = 14; break;
            case 'long': apiParams.minDays = 14; break;
        }
    }

    if (filterValues.budget) {
        // Convert budget filter to price range
        switch (filterValues.budget) {
            case 'budget': apiParams.maxPrice = 500; break;
            case 'mid': apiParams.minPrice = 500; apiParams.maxPrice = 1500; break;
            case 'premium': apiParams.minPrice = 1500; apiParams.maxPrice = 3000; break;
            case 'luxury': apiParams.minPrice = 3000; break;
        }
    }

    // Reload adventures with filters
    if (Object.keys(apiParams).length > 0) {
        loadAdventuresWithFilters(apiParams);
    } else {
        loadAdventures(); // Reload all adventures if no filters
    }
}

// Load adventures with filters
async function loadAdventuresWithFilters(params) {
    try {
        console.log('Loading filtered adventures:', params);

        // Show loading state
        const adventuresSection = document.querySelector('#adventures .container .adventures-list');
        if (adventuresSection) {
            adventuresSection.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: white; grid-column: 1/-1;">
                    <h3>🔍 Filtering Adventures...</h3>
                </div>
            `;
        }

        const response = await window.API.adventures.getAll(params);

        if (response && response.success && response.data) {
            displayAdventures(response.data);
        } else {
            showErrorMessage('No adventures found matching your filters. Try adjusting your criteria.');
        }
    } catch (error) {
        console.error('Error loading filtered adventures:', error);
        showErrorMessage('Error applying filters. Please try again.');
    }
}

// Add country-specific header
function addCountryHeader(countryCode, countryName) {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    const countryEmojis = {
        nepal: '🏔️',
        india: '🕌',
        tibet: '🏮',
        bhutan: '🏯'
    };

    const countryDescriptions = {
        nepal: 'Discover the roof of the world with Everest, Annapurna, and Langtang adventures',
        india: 'Explore the magnificent Himalayas of Kashmir, Himachal Pradesh, and Ladakh',
        tibet: 'Experience the mystical Tibet with Everest North Face and Lhasa expeditions',
        bhutan: 'Journey through the Last Shangri-La, the Thunder Dragon Kingdom'
    };

    const countryColors = {
        nepal: 'rgba(44, 85, 48, 0.9)',
        india: 'rgba(255, 153, 51, 0.9)',
        tibet: 'rgba(220, 20, 60, 0.9)',
        bhutan: 'rgba(255, 215, 0, 0.9)'
    };

    // Create country banner
    const countryBanner = document.createElement('div');
    countryBanner.className = 'country-banner';
    countryBanner.style.cssText = `
        background: linear-gradient(135deg, ${countryColors[countryCode]}, rgba(0,0,0,0.3));
        color: white;
        padding: 1rem 0;
        text-align: center;
        margin-bottom: 2rem;
        border-radius: 12px;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.1);
        animation: slideDown 0.8s ease-out;
    `;

    countryBanner.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
            <h2 style="font-size: 2.5rem; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 1rem;">
                <span style="font-size: 3rem;">${countryEmojis[countryCode]}</span>
                ${countryName} Adventures
            </h2>
            <p style="font-size: 1.2rem; opacity: 0.9; margin-bottom: 1rem;">
                ${countryDescriptions[countryCode]}
            </p>
            <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                <button onclick="showAllCountries()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 0.5rem 1rem; border-radius: 20px; cursor: pointer; transition: all 0.3s ease;">
                    🌍 All Countries
                </button>
                <button onclick="window.location.href='../dashboard.html'" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 0.5rem 1rem; border-radius: 20px; cursor: pointer; transition: all 0.3s ease;">
                    📊 Dashboard
                </button>
            </div>
        </div>
    `;

    // Add animation style
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .country-banner button:hover {
            background: rgba(255,255,255,0.3) !important;
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(style);

    // Insert banner after hero section
    heroSection.insertAdjacentElement('afterend', countryBanner);
}

// Show all countries function
function showAllCountries() {
    // Remove country filter from URL and reload
    window.location.href = 'adventures.html';
}

// Add hover effect for better UX
document.querySelectorAll('.adventure-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        if (!this.classList.contains('selected')) {
            this.style.transform = 'translateY(-5px)';
        }
    });
    
    item.addEventListener('mouseleave', function() {
        if (!this.classList.contains('selected')) {
            this.style.transform = 'translateY(0)';
        }
    });
});

// Add loading state when proceeding
function showLoadingState() {
    const proceedBtn = document.getElementById('proceedBtn');
    proceedBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    proceedBtn.disabled = true;
}

// Adventure data for future API integration
const adventureData = {
    trekking: {
        popularRoutes: ['Everest Base Camp', 'Annapurna Circuit', 'Langtang Valley'],
        duration: '3-30 days',
        bestSeason: 'Spring (Mar-May) & Autumn (Sep-Nov)'
    },
    climbing: {
        peaks: ['Island Peak', 'Mera Peak', 'Lobuche East'],
        duration: '14-45 days',
        requirements: 'Previous climbing experience recommended'
    },
    motorbiking: {
        routes: ['Mustang Circuit', 'Annapurna Circuit', 'Kathmandu to Lhasa'],
        bikes: ['Royal Enfield', 'Honda CRF', 'KTM'],
        duration: '5-15 days'
    },
    cycling: {
        trails: ['Kathmandu Valley Rim', 'Annapurna Circuit', 'Upper Mustang'],
        difficulty: 'Moderate to Challenging',
        equipment: 'Mountain bikes available for rent'
    },
    rafting: {
        rivers: ['Trishuli', 'Sun Koshi', 'Bhote Koshi'],
        grades: 'Grade 3-5 rapids',
        duration: '1-3 days'
    },
    paragliding: {
        locations: ['Pokhara', 'Bandipur'],
        flightTime: '30-60 minutes',
        requirements: 'No experience needed for tandem flights'
    },
    wildlife: {
        parks: ['Chitwan National Park', 'Bardia National Park'],
        activities: ['Elephant safari', 'Jeep safari', 'Bird watching'],
        wildlife: ['Tigers', 'Rhinos', 'Elephants', '500+ bird species']
    },
    cultural: {
        sites: ['Kathmandu Durbar Square', 'Bhaktapur', 'Patan', 'Lumbini'],
        experiences: ['Homestays', 'Festival participation', 'Monastery visits'],
        duration: '1-7 days'
    },
    bungee: {
        location: 'The Last Resort (160m)',
        additional: ['Canyon Swing', 'Canyoning'],
        requirements: 'Age 18+, weight 35-110kg'
    }
};