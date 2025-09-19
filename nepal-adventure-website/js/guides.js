// Guides & Porters Page JavaScript

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Display selected adventures from previous page
    displaySelectedAdventures();
    
    // Initialize filter listeners
    initializeFilters();
    
    // Initialize pagination
    initializePagination();
    
    // Load guides and porters
    loadGuides();
});

// Display selected adventures
function displaySelectedAdventures() {
    const selectedAdventures = JSON.parse(sessionStorage.getItem('selectedAdventures') || '[]');
    const container = document.getElementById('selectedAdventures');
    
    if (selectedAdventures.length > 0) {
        const html = selectedAdventures.map(adventure => 
            `<span class="adventure-tag">${formatAdventureName(adventure)}</span>`
        ).join('');
        
        container.innerHTML = '<p style="margin-bottom: 0.5rem;">Showing guides for:</p>' + html;
    }
}

// Format adventure names
function formatAdventureName(adventure) {
    const names = {
        'trekking': 'Trekking',
        'climbing': 'Mountain Climbing',
        'motorbiking': 'Motorbiking',
        'cycling': 'Mountain Biking',
        'rafting': 'Water Rafting',
        'paragliding': 'Paragliding',
        'wildlife': 'Wildlife Safari',
        'cultural': 'Cultural Tours',
        'bungee': 'Bungee Jumping'
    };
    return names[adventure] || adventure;
}

// Initialize filters
function initializeFilters() {
    const checkboxes = document.querySelectorAll('.filters-sidebar input[type="checkbox"], .filters-sidebar input[type="radio"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // In a real app, this would trigger filtering
            console.log('Filter changed:', this.name, this.value, this.checked);
        });
    });
}

// Apply filters
function applyFilters() {
    // Collect all filter values
    const filters = {
        type: [],
        spec: [],
        lang: [],
        exp: [],
        price: ''
    };
    
    // Get checked checkboxes
    document.querySelectorAll('.filters-sidebar input[type="checkbox"]:checked').forEach(checkbox => {
        if (filters[checkbox.name]) {
            filters[checkbox.name].push(checkbox.value);
        }
    });
    
    // Get selected radio
    const priceRadio = document.querySelector('.filters-sidebar input[name="price"]:checked');
    if (priceRadio) {
        filters.price = priceRadio.value;
    }
    
    console.log('Applying filters:', filters);
    
    // In a real app, this would filter the results
    filterGuides(filters);
}

// Filter guides based on criteria
function filterGuides(filters) {
    const guideCards = document.querySelectorAll('.guide-card');
    let visibleCount = 0;
    
    guideCards.forEach(card => {
        let shouldShow = true;
        
        // Filter by type
        if (filters.type.length > 0) {
            const cardType = card.getAttribute('data-type');
            if (!filters.type.includes(cardType)) {
                shouldShow = false;
            }
        }
        
        // Show/hide card
        card.style.display = shouldShow ? 'block' : 'none';
        if (shouldShow) visibleCount++;
    });
    
    // Update results count
    console.log(`Showing ${visibleCount} results`);
}

// Clear all filters
function clearFilters() {
    document.querySelectorAll('.filters-sidebar input').forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else if (input.type === 'radio' && input.value === 'all') {
            input.checked = true;
        }
    });
    
    // Show all guides
    document.querySelectorAll('.guide-card').forEach(card => {
        card.style.display = 'block';
    });
}

// Sort results
function sortResults() {
    const sortBy = document.getElementById('sortBy').value;
    const guidesGrid = document.getElementById('guidesGrid');
    const guideCards = Array.from(guidesGrid.querySelectorAll('.guide-card'));
    
    // Sort cards based on selected criteria
    guideCards.sort((a, b) => {
        switch(sortBy) {
            case 'rating':
                // Extract rating from stars
                const ratingA = a.querySelector('.stars').textContent.length;
                const ratingB = b.querySelector('.stars').textContent.length;
                return ratingB - ratingA;
            
            case 'price-low':
                const priceA = parseFloat(a.querySelector('.guide-price').textContent.replace('$', ''));
                const priceB = parseFloat(b.querySelector('.guide-price').textContent.replace('$', ''));
                return priceA - priceB;
            
            case 'price-high':
                const priceHighA = parseFloat(a.querySelector('.guide-price').textContent.replace('$', ''));
                const priceHighB = parseFloat(b.querySelector('.guide-price').textContent.replace('$', ''));
                return priceHighB - priceHighA;
            
            case 'experience':
                // Extract years from experience text
                const expA = parseInt(a.querySelector('.spec-item').textContent.match(/\d+/) || 0);
                const expB = parseInt(b.querySelector('.spec-item').textContent.match(/\d+/) || 0);
                return expB - expA;
            
            default:
                return 0;
        }
    });
    
    // Re-append sorted cards
    guideCards.forEach(card => guidesGrid.appendChild(card));
}

// Book guide/porter
function bookGuide(guideName) {
    // Check if user is logged in (would check session in real app)
    const isLoggedIn = false; // This would check actual login status
    
    if (!isLoggedIn) {
        // Redirect to login with return URL
        alert('Please login to book a guide. Redirecting to login page...');
        window.location.href = `login.html?return=guides&guide=${encodeURIComponent(guideName)}`;
        return;
    }
    
    // In a real app, this would open a booking modal or redirect to booking page
    console.log('Booking guide:', guideName);
    alert(`Booking ${guideName}. In a real app, this would open a booking form.`);
}

// Initialize pagination
function initializePagination() {
    const pageButtons = document.querySelectorAll('.page-btn');
    pageButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('active')) {
                // Remove active from all buttons
                pageButtons.forEach(btn => btn.classList.remove('active'));
                // Add active to clicked button
                this.classList.add('active');
                
                // In a real app, this would load new page of results
                console.log('Loading page:', this.textContent);
                
                // Simulate loading
                const guidesGrid = document.getElementById('guidesGrid');
                guidesGrid.style.opacity = '0.5';
                setTimeout(() => {
                    guidesGrid.style.opacity = '1';
                }, 300);
            }
        });
    });
}

// Mock guide data for future expansion
const mockGuides = [
    {
        name: 'Pemba Sherpa',
        type: 'guide',
        specialization: 'Mountain Guide',
        rating: 5,
        reviews: 127,
        experience: 15,
        languages: ['English', 'Nepali', 'Hindi'],
        price: 120,
        certifications: ['NMGA', 'First Aid', 'Rescue'],
        description: 'Expert mountain guide with 15+ years experience. Summited Everest 12 times.'
    },
    {
        name: 'Maya Tamang',
        type: 'guide',
        specialization: 'Trekking Guide',
        rating: 5,
        reviews: 89,
        experience: 8,
        languages: ['English', 'French', 'Nepali'],
        price: 65,
        certifications: ['First Aid', 'Wildlife'],
        description: 'Specialized in Annapurna region treks. Excellent knowledge of local culture.'
    },
    {
        name: 'Ram Bahadur',
        type: 'porter',
        capacity: 30,
        rating: 4,
        reviews: 64,
        experience: 10,
        languages: ['Nepali', 'Basic English'],
        price: 25,
        maxAltitude: 5500,
        description: 'Reliable porter with experience in Everest and Annapurna regions.'
    }
];

// Load guides and porters from API
async function loadGuides() {
    try {
        showLoading(true);
        
        // Get current filter values
        const filters = getCurrentFilters();
        
        // Load guides
        const guidesResponse = await API.guides.getAll(filters);
        
        // Load porters  
        const portersResponse = await API.porters.getAll(filters);
        
        // Combine and display
        const allProviders = [
            ...guidesResponse.data.map(guide => ({ ...guide, type: 'guide' })),
            ...portersResponse.data.map(porter => ({ ...porter, type: 'porter' }))
        ];
        
        displayProviders(allProviders);
        
    } catch (error) {
        console.error('Error loading guides:', error);
        showError('Failed to load guides and porters. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Get current filter values
function getCurrentFilters() {
    const filters = {};
    
    // Get checked service types
    const checkedTypes = Array.from(document.querySelectorAll('input[name="type"]:checked'));
    if (checkedTypes.length > 0) {
        filters.type = checkedTypes.map(cb => cb.value).join(',');
    }
    
    // Get other filters
    const checkedSpecs = Array.from(document.querySelectorAll('input[name="spec"]:checked'));
    if (checkedSpecs.length > 0) {
        filters.specializations = checkedSpecs.map(cb => cb.value).join(',');
    }
    
    const checkedLangs = Array.from(document.querySelectorAll('input[name="lang"]:checked'));
    if (checkedLangs.length > 0) {
        filters.languages = checkedLangs.map(cb => cb.value).join(',');
    }
    
    const checkedExp = Array.from(document.querySelectorAll('input[name="exp"]:checked'));
    if (checkedExp.length > 0) {
        filters.minExperience = Math.min(...checkedExp.map(cb => parseInt(cb.value.replace('+', ''))));
    }
    
    return filters;
}

// Display providers (guides and porters)
function displayProviders(providers) {
    const guidesGrid = document.getElementById('guidesGrid');
    
    if (providers.length === 0) {
        guidesGrid.innerHTML = '<p class="no-results">No guides or porters found matching your criteria.</p>';
        return;
    }
    
    guidesGrid.innerHTML = providers.map(provider => createProviderCard(provider)).join('');
}

// Create provider card HTML
function createProviderCard(provider) {
    const isGuide = provider.type === 'guide';
    const name = provider.user?.fullName || 'Unknown';
    const rating = provider.rating?.average || 0;
    const reviewCount = provider.rating?.count || 0;
    const price = provider.pricing?.dailyRate || 0;
    
    let specialization = '';
    let experience = '';
    let languages = [];
    
    if (isGuide) {
        specialization = provider.specializations?.[0] || 'Guide';
        experience = `${provider.experience?.years || 0} years`;
        languages = provider.languages?.map(l => l.language) || [];
    } else {
        specialization = 'Porter';
        experience = `${provider.experience?.years || 0} years`;
        languages = provider.languages?.map(l => l.language) || [];
    }
    
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    
    return `
        <div class="guide-card" data-type="${provider.type}">
            <div class="guide-header">
                <div class="guide-avatar ${isGuide ? '' : 'porter'}">
                    <i class="fas fa-${isGuide ? 'user' : 'hiking'}"></i>
                </div>
                <div class="guide-info">
                    <h4>${name}</h4>
                    <span class="guide-type ${isGuide ? '' : 'porter'}">${specialization}</span>
                    <div class="guide-rating">
                        <span class="stars">${stars}</span>
                        <span>(${reviewCount} reviews)</span>
                    </div>
                </div>
            </div>
            <div class="guide-details">
                <p>${provider.experience?.description || `Experienced ${specialization.toLowerCase()} with ${experience} of experience.`}</p>
                <div class="guide-specs">
                    <span class="spec-item">
                        <i class="fas fa-clock"></i> ${experience}
                    </span>
                    ${isGuide ? `
                        <span class="spec-item">
                            <i class="fas fa-certificate"></i> Certified
                        </span>
                    ` : `
                        <span class="spec-item">
                            <i class="fas fa-weight"></i> ${provider.carryingCapacity || 25}kg capacity
                        </span>
                        <span class="spec-item">
                            <i class="fas fa-mountain"></i> ${provider.maxAltitude || 5000}m max
                        </span>
                    `}
                </div>
                <div class="guide-languages">
                    ${languages.map(lang => `<span class="language-tag">${lang}</span>`).join('')}
                </div>
            </div>
            <div class="guide-footer">
                <span class="guide-price">$${price}/day</span>
                <button class="btn-book" onclick="bookProvider('${provider._id}', '${provider.type}', '${name}')">View Profile</button>
            </div>
        </div>
    `;
}

// Book provider function
async function bookProvider(providerId, type, name) {
    if (!API.utils.isLoggedIn()) {
        alert('Please login to book a guide or porter.');
        window.location.href = 'login.html';
        return;
    }
    
    // For now, just show an alert. In a real app, this would open a booking modal
    alert(`Booking ${name} (${type}). Full booking system coming soon!`);
}

// Show loading state
function showLoading(show) {
    const guidesGrid = document.getElementById('guidesGrid');
    if (show) {
        guidesGrid.innerHTML = '<div class="loading">Loading guides and porters...</div>';
    }
}

// Show error message
function showError(message) {
    const guidesGrid = document.getElementById('guidesGrid');
    guidesGrid.innerHTML = `<div class="error">${message}</div>`;
}

// Add styles for selected adventure tags and new elements
const style = document.createElement('style');
style.innerHTML = `
    .adventure-tag {
        background: var(--primary-color);
        color: var(--white);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        display: inline-block;
    }
    
    .loading, .error, .no-results {
        text-align: center;
        padding: 2rem;
        color: var(--text-light);
        font-size: 1.1rem;
    }
    
    .error {
        color: var(--primary-color);
    }
    
    .user-menu {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .btn-logout {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
    }
    
    .btn-logout:hover {
        background: #c0392b;
    }
`;
document.head.appendChild(style);