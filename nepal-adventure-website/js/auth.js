// Authentication JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (API.utils.isLoggedIn()) {
        updateNavigationForLoggedInUser();
    }
    // Get URL parameters to check if user type was pre-selected
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedType = urlParams.get('type');
    
    // User type selection
    const typeOptions = document.querySelectorAll('.type-option');
    const registrationForm = document.getElementById('registrationForm');
    let selectedUserType = null;

    typeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            typeOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to selected option
            this.classList.add('active');
            selectedUserType = this.getAttribute('data-type');
            
            // Show the form
            if (registrationForm) {
                registrationForm.style.display = 'block';
                showFieldsForUserType(selectedUserType);
            }
        });
        
        // Pre-select if type was passed in URL
        if (preselectedType && option.getAttribute('data-type') === preselectedType) {
            option.click();
        }
    });

    // Show/hide fields based on user type
    function showFieldsForUserType(userType) {
        // Hide all specific fields first
        document.querySelector('.guide-fields').style.display = 'none';
        document.querySelector('.porter-fields').style.display = 'none';
        document.querySelector('.gear-fields').style.display = 'none';
        document.querySelector('.guide-porter-docs').style.display = 'none';
        
        // Show relevant fields
        switch(userType) {
            case 'guide':
                document.querySelector('.guide-fields').style.display = 'block';
                document.querySelector('.guide-porter-docs').style.display = 'block';
                break;
            case 'porter':
                document.querySelector('.porter-fields').style.display = 'block';
                document.querySelector('.guide-porter-docs').style.display = 'block';
                break;
            case 'gear':
                document.querySelector('.gear-fields').style.display = 'block';
                break;
        }
    }

    // Form submission
    if (registrationForm) {
        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate passwords match
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showAlert('Passwords do not match!', 'error');
                return;
            }
            
            try {
                // Collect form data
                const formData = new FormData(this);
                const userData = {
                    fullName: formData.get('fullName'),
                    email: formData.get('email'),
                    password: formData.get('password'),
                    phone: formData.get('phone'),
                    role: selectedUserType
                };

                // Add role-specific data
                if (selectedUserType === 'guide') {
                    userData.guideData = {
                        licenseNumber: formData.get('licenseNumber'),
                        specializations: Array.from(document.querySelectorAll('input[name="specializations[]"]:checked')).map(cb => cb.value),
                        languages: Array.from(document.querySelectorAll('input[name="languages[]"]:checked')).map(cb => ({ language: cb.value, proficiency: 'intermediate' })),
                        experience: {
                            years: parseInt(formData.get('experience')) || 0,
                            description: formData.get('certifications')
                        },
                        pricing: {
                            dailyRate: 50 // Default rate
                        }
                    };
                } else if (selectedUserType === 'porter') {
                    userData.porterData = {
                        carryingCapacity: parseInt(formData.get('carryingCapacity')) || 25,
                        maxAltitude: parseInt(formData.get('altitudeExperience')) || 5000,
                        familiarRoutes: Array.from(document.querySelectorAll('input[name="routes[]"]:checked')).map(cb => ({ region: cb.value, timesCompleted: 1 })),
                        experience: {
                            years: parseInt(formData.get('porterExperience')) || 0
                        },
                        pricing: {
                            dailyRate: 25 // Default rate
                        }
                    };
                }

                console.log('Sending registration data:', userData);
                const response = await API.auth.register(userData);
                console.log('Registration response:', response);
                
                if (response.success) {
                    // Store authentication data
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(response.user));
                    
                    showAlert('Registration successful! Redirecting...', 'success');
                    
                    // Redirect based on user role
                    setTimeout(() => {
                        if (selectedUserType === 'tourist') {
                            window.location.href = 'adventures.html';
                        } else if (selectedUserType === 'admin' || selectedUserType === 'operator') {
                            window.location.href = 'dashboard.html';
                        } else {
                            // For guides, porters, and gear providers, redirect to adventures
                            window.location.href = 'adventures.html';
                        }
                    }, 2000);
                } else {
                    showAlert(response.message || 'Registration failed', 'error');
                }
            } catch (error) {
                console.error('Registration error:', error);
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    userData: userData
                });
                showAlert(`Registration failed: ${error.message || 'Unknown error'}`, 'error');
            }
        });
    }

    // Show alert messages
    function showAlert(message, type) {
        // Create alert if it doesn't exist
        let alert = document.querySelector('.alert');
        if (!alert) {
            alert = document.createElement('div');
            alert.className = 'alert';
            registrationForm.insertBefore(alert, registrationForm.firstChild);
        }
        
        alert.textContent = message;
        alert.className = `alert alert-${type}`;
        alert.style.display = 'block';
        
        // Hide alert after 5 seconds
        setTimeout(() => {
            alert.style.display = 'none';
        }, 5000);
    }

    // Multi-select functionality
    const multiSelects = document.querySelectorAll('select[multiple]');
    multiSelects.forEach(select => {
        // Convert to checkboxes for better UX
        const options = Array.from(select.options);
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'checkbox-group';
        
        options.forEach(option => {
            const label = document.createElement('label');
            label.className = 'checkbox-label';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = select.name + '[]';
            checkbox.value = option.value;
            
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(' ' + option.text));
            checkboxContainer.appendChild(label);
        });
        
        select.style.display = 'none';
        select.parentNode.appendChild(checkboxContainer);
    });

    // Add checkbox group styles
    const style = document.createElement('style');
    style.innerHTML = `
        .checkbox-group {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
            max-height: 200px;
            overflow-y: auto;
            padding: 0.5rem;
            border: 2px solid #e0e0e0;
            border-radius: 5px;
        }
        
        .checkbox-group .checkbox-label {
            margin: 0;
            padding: 0.25rem;
        }
        
        .checkbox-group input[type="checkbox"] {
            margin-right: 0.5rem;
        }
    `;
    document.head.appendChild(style);
});

// Login form handling (for login.html)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const response = await API.auth.login({ email, password });
            
            if (response.success) {
                // Store authentication data
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                
                // Redirect based on user role
                if (response.user.role === 'tourist') {
                    window.location.href = 'adventures.html';
                } else if (response.user.role === 'admin' || response.user.role === 'operator') {
                    window.location.href = 'dashboard.html';
                } else {
                    // For guides, porters, and gear providers, redirect to adventures
                    window.location.href = 'adventures.html';
                }
            } else {
                showAlert(response.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlert(error.message || 'Login failed. Please try again.', 'error');
        }
    });
}

// Function to update navigation for logged-in users
function updateNavigationForLoggedInUser() {
    const user = API.utils.getUser();
    if (user) {
        // Update navigation to show user info and logout
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            // Replace login/register with user menu
            const loginBtn = navLinks.querySelector('.btn-login');
            const registerBtn = navLinks.querySelector('.btn-register');
            
            if (loginBtn) loginBtn.remove();
            if (registerBtn) registerBtn.remove();
            
            // Add user menu
            const userMenu = document.createElement('li');
            userMenu.innerHTML = `
                <div class="user-menu">
                    <span>Welcome, ${user.fullName}</span>
                    <button onclick="API.utils.logout()" class="btn-logout">Logout</button>
                </div>
            `;
            navLinks.appendChild(userMenu);
        }
    }
}