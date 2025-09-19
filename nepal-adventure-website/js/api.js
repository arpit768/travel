// API Configuration and Helper Functions

const API_BASE_URL = 'http://localhost:5000/api';

// Get stored token
function getToken() {
    return localStorage.getItem('token');
}

// Get stored user
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Set authentication headers
function getAuthHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Generic API call function
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: getAuthHeaders(),
        ...options
    };

    console.log('Making API call:', {
        url,
        method: config.method || 'GET',
        headers: config.headers,
        body: config.body
    });

    try {
        const response = await fetch(url, config);

        console.log('API Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            ok: response.ok
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response Text:', errorText);

            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (parseError) {
                console.error('Failed to parse error response as JSON:', parseError);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Success Response:', data);
        return data;
    } catch (error) {
        console.error('API Error Details:', {
            message: error.message,
            stack: error.stack,
            url,
            config
        });

        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error - please check your connection and try again');
        }

        throw error;
    }
}

// Authentication API calls
const authAPI = {
    async register(userData) {
        return apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async login(credentials) {
        return apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    async logout() {
        return apiCall('/auth/logout');
    },

    async getMe() {
        return apiCall('/auth/me');
    },

    async updateProfile(userData) {
        return apiCall('/auth/updatedetails', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }
};

// Adventures API calls
const adventuresAPI = {
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/adventures${queryString ? '?' + queryString : ''}`);
    },

    async getById(id) {
        return apiCall(`/adventures/${id}`);
    },

    async getByType(type) {
        return apiCall(`/adventures/type/${type}`);
    },

    async getFeatured() {
        return apiCall('/adventures/featured');
    }
};

// Guides API calls
const guidesAPI = {
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/guides${queryString ? '?' + queryString : ''}`);
    },

    async getById(id) {
        return apiCall(`/guides/${id}`);
    },

    async getFeatured() {
        return apiCall('/guides/featured');
    },

    async create(guideData) {
        return apiCall('/guides', {
            method: 'POST',
            body: JSON.stringify(guideData)
        });
    },

    async update(id, guideData) {
        return apiCall(`/guides/${id}`, {
            method: 'PUT',
            body: JSON.stringify(guideData)
        });
    }
};

// Porters API calls
const portersAPI = {
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/porters${queryString ? '?' + queryString : ''}`);
    },

    async getById(id) {
        return apiCall(`/porters/${id}`);
    },

    async create(porterData) {
        return apiCall('/porters', {
            method: 'POST',
            body: JSON.stringify(porterData)
        });
    }
};

// Bookings API calls
const bookingsAPI = {
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/bookings${queryString ? '?' + queryString : ''}`);
    },

    async getById(id) {
        return apiCall(`/bookings/${id}`);
    },

    async create(bookingData) {
        return apiCall('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    },

    async cancel(id, reason) {
        return apiCall(`/bookings/${id}/cancel`, {
            method: 'PUT',
            body: JSON.stringify({ reason })
        });
    }
};

// Reviews API calls
const reviewsAPI = {
    async create(reviewData) {
        return apiCall('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    },

    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/reviews${queryString ? '?' + queryString : ''}`);
    }
};

// Utility functions
function isLoggedIn() {
    return !!getToken();
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Handle API errors globally
window.addEventListener('unhandledrejection', function(event) {
    if (event.reason.message && event.reason.message.includes('401')) {
        // Token expired or invalid
        logout();
    }
});

// Export for use in other files
window.API = {
    auth: authAPI,
    adventures: adventuresAPI,
    guides: guidesAPI,
    porters: portersAPI,
    bookings: bookingsAPI,
    reviews: reviewsAPI,
    utils: {
        isLoggedIn,
        logout,
        requireAuth,
        getUser,
        getToken
    }
};