/**
 * Professional Form Validation System
 * Enterprise-grade validation with security and UX focus
 */

class FormValidator {
    constructor() {
        this.validators = {
            email: this.validateEmail,
            password: this.validatePassword,
            phone: this.validatePhone,
            name: this.validateName,
            required: this.validateRequired,
            minLength: this.validateMinLength,
            maxLength: this.validateMaxLength,
            pattern: this.validatePattern,
            file: this.validateFile
        };

        this.securityRules = {
            maxFieldLength: 1000,
            allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
            maxFileSize: 5 * 1024 * 1024, // 5MB
            rateLimitRequests: 5,
            rateLimitWindow: 60000 // 1 minute
        };

        this.submissionTracking = new Map();
        this.initializeFormHandlers();
    }

    initializeFormHandlers() {
        document.addEventListener('DOMContentLoaded', () => {
            // Find all forms with validation
            const forms = document.querySelectorAll('form[data-validate]');
            forms.forEach(form => this.setupFormValidation(form));

            // Real-time validation on input
            document.addEventListener('input', (e) => {
                if (e.target.matches('input[data-validate], textarea[data-validate], select[data-validate]')) {
                    this.validateField(e.target);
                }
            });

            // Form submission handling
            document.addEventListener('submit', (e) => {
                if (e.target.matches('form[data-validate]')) {
                    e.preventDefault();
                    this.handleFormSubmission(e.target);
                }
            });
        });
    }

    setupFormValidation(form) {
        // Add form validation styling
        if (!document.getElementById('form-validation-styles')) {
            const styles = document.createElement('style');
            styles.id = 'form-validation-styles';
            styles.textContent = `
                .form-group {
                    position: relative;
                    margin-bottom: 1.5rem;
                }

                .form-control {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid #e1e8ed;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: all 0.3s ease;
                    background: white;
                }

                .form-control:focus {
                    outline: none;
                    border-color: #2c5530;
                    box-shadow: 0 0 0 3px rgba(44, 85, 48, 0.1);
                }

                .form-control.valid {
                    border-color: #27ae60;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%2327ae60' d='m2.3 6.73.8-.8 2.7-2.7-.8-.8-1.9 1.9-.7-.7-.8.8z'/%3e%3c/svg%3e");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                    background-size: 16px;
                }

                .form-control.invalid {
                    border-color: #e74c3c;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23e74c3c'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath d='m5.5 5.5 2 2m0-2-2 2'/%3e%3c/svg%3e");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                    background-size: 16px;
                }

                .form-label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #2c3e50;
                }

                .form-label.required::after {
                    content: ' *';
                    color: #e74c3c;
                }

                .form-error {
                    color: #e74c3c;
                    font-size: 14px;
                    margin-top: 6px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .form-error::before {
                    content: '⚠️';
                    font-size: 12px;
                }

                .form-success {
                    color: #27ae60;
                    font-size: 14px;
                    margin-top: 6px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .form-success::before {
                    content: '✅';
                    font-size: 12px;
                }

                .form-submit {
                    background: linear-gradient(135deg, #2c5530, #4a7c59);
                    color: white;
                    border: none;
                    padding: 14px 32px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .form-submit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(44, 85, 48, 0.3);
                }

                .form-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .form-submit.loading::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 20px;
                    height: 20px;
                    margin: -10px 0 0 -10px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .form-submit.loading {
                    color: transparent;
                }

                .password-strength {
                    margin-top: 8px;
                }

                .password-strength-bar {
                    height: 4px;
                    border-radius: 2px;
                    background: #e1e8ed;
                    overflow: hidden;
                }

                .password-strength-fill {
                    height: 100%;
                    transition: all 0.3s ease;
                    border-radius: 2px;
                }

                .password-strength-weak .password-strength-fill {
                    width: 25%;
                    background: #e74c3c;
                }

                .password-strength-fair .password-strength-fill {
                    width: 50%;
                    background: #f39c12;
                }

                .password-strength-good .password-strength-fill {
                    width: 75%;
                    background: #3498db;
                }

                .password-strength-strong .password-strength-fill {
                    width: 100%;
                    background: #27ae60;
                }

                .password-requirements {
                    margin-top: 8px;
                    font-size: 12px;
                    color: #7f8c8d;
                }

                .password-requirement {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 2px;
                }

                .password-requirement.met {
                    color: #27ae60;
                }

                .password-requirement.met::before {
                    content: '✓';
                }

                .password-requirement:not(.met)::before {
                    content: '○';
                }
            `;
            document.head.appendChild(styles);
        }

        // Wrap form fields in groups if not already wrapped
        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            if (!field.closest('.form-group')) {
                const group = document.createElement('div');
                group.className = 'form-group';
                field.parentNode.insertBefore(group, field);
                group.appendChild(field);
            }
        });
    }

    validateField(field) {
        const rules = field.getAttribute('data-validate')?.split('|') || [];
        const value = field.value.trim();
        const errors = [];

        // Security check - prevent overly long inputs
        if (value.length > this.securityRules.maxFieldLength) {
            errors.push(`Input too long (max ${this.securityRules.maxFieldLength} characters)`);
        }

        // Apply validation rules
        for (const rule of rules) {
            const [ruleName, ruleValue] = rule.split(':');
            const validator = this.validators[ruleName];

            if (validator) {
                const result = validator.call(this, value, ruleValue, field);
                if (result !== true) {
                    errors.push(result);
                }
            }
        }

        this.displayFieldValidation(field, errors);
        return errors.length === 0;
    }

    displayFieldValidation(field, errors) {
        const group = field.closest('.form-group');
        const existingError = group.querySelector('.form-error');
        const existingSuccess = group.querySelector('.form-success');

        // Remove existing messages
        if (existingError) existingError.remove();
        if (existingSuccess) existingSuccess.remove();

        if (errors.length > 0) {
            field.classList.add('invalid');
            field.classList.remove('valid');

            const errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            errorElement.textContent = errors[0]; // Show first error
            group.appendChild(errorElement);
        } else if (field.value.trim()) {
            field.classList.add('valid');
            field.classList.remove('invalid');

            const successElement = document.createElement('div');
            successElement.className = 'form-success';
            successElement.textContent = 'Looks good!';
            group.appendChild(successElement);
        } else {
            field.classList.remove('valid', 'invalid');
        }

        // Special handling for password fields
        if (field.type === 'password') {
            this.updatePasswordStrength(field);
        }
    }

    updatePasswordStrength(field) {
        const password = field.value;
        const strength = this.calculatePasswordStrength(password);

        let strengthContainer = field.closest('.form-group').querySelector('.password-strength');
        if (!strengthContainer && password) {
            strengthContainer = document.createElement('div');
            strengthContainer.className = 'password-strength';
            strengthContainer.innerHTML = `
                <div class="password-strength-bar">
                    <div class="password-strength-fill"></div>
                </div>
                <div class="password-requirements">
                    <div class="password-requirement" data-req="length">At least 8 characters</div>
                    <div class="password-requirement" data-req="uppercase">One uppercase letter</div>
                    <div class="password-requirement" data-req="lowercase">One lowercase letter</div>
                    <div class="password-requirement" data-req="number">One number</div>
                    <div class="password-requirement" data-req="special">One special character</div>
                </div>
            `;
            field.closest('.form-group').appendChild(strengthContainer);
        }

        if (strengthContainer) {
            const bar = strengthContainer.querySelector('.password-strength-bar');
            const requirements = strengthContainer.querySelectorAll('.password-requirement');

            // Update strength class
            bar.className = `password-strength-bar password-strength-${strength.level}`;

            // Update requirements
            requirements.forEach(req => {
                const reqType = req.getAttribute('data-req');
                req.classList.toggle('met', strength.requirements[reqType]);
            });

            // Hide if password is empty
            strengthContainer.style.display = password ? 'block' : 'none';
        }
    }

    calculatePasswordStrength(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const metCount = Object.values(requirements).filter(Boolean).length;
        let level = 'weak';

        if (metCount >= 5) level = 'strong';
        else if (metCount >= 4) level = 'good';
        else if (metCount >= 3) level = 'fair';

        return { level, requirements };
    }

    async handleFormSubmission(form) {
        // Rate limiting check
        if (!this.checkRateLimit(form)) {
            window.errorHandler.showNotification(
                'warning',
                'Too Many Attempts',
                'Please wait before submitting again.'
            );
            return;
        }

        // Validate all fields
        const fields = form.querySelectorAll('[data-validate]');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            window.errorHandler.showNotification(
                'error',
                'Validation Failed',
                'Please fix the errors and try again.'
            );
            return;
        }

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Sanitize data
        const sanitizedData = this.sanitizeFormData(data);

        // Show loading state
        const submitButton = form.querySelector('[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.classList.add('loading');
        submitButton.disabled = true;

        try {
            // Submit form
            const endpoint = form.getAttribute('action') || '/api/submit';
            const method = form.getAttribute('method') || 'POST';

            const response = await window.errorHandler.handleApiRequest(endpoint, {
                method,
                body: JSON.stringify(sanitizedData)
            });

            // Success handling
            window.errorHandler.showNotification(
                'success',
                'Success!',
                'Your form has been submitted successfully.'
            );

            // Reset form or redirect
            const redirect = form.getAttribute('data-redirect');
            if (redirect) {
                setTimeout(() => {
                    window.location.href = redirect;
                }, 1500);
            } else {
                form.reset();
                // Remove validation classes
                fields.forEach(field => {
                    field.classList.remove('valid', 'invalid');
                    const group = field.closest('.form-group');
                    const error = group.querySelector('.form-error');
                    const success = group.querySelector('.form-success');
                    if (error) error.remove();
                    if (success) success.remove();
                });
            }

        } catch (error) {
            // Error is already handled by errorHandler.handleApiRequest
        } finally {
            // Reset button state
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    checkRateLimit(form) {
        const formId = form.id || form.action || 'default';
        const now = Date.now();
        const submissions = this.submissionTracking.get(formId) || [];

        // Clean old submissions
        const recentSubmissions = submissions.filter(
            time => now - time < this.securityRules.rateLimitWindow
        );

        if (recentSubmissions.length >= this.securityRules.rateLimitRequests) {
            return false;
        }

        // Add current submission
        recentSubmissions.push(now);
        this.submissionTracking.set(formId, recentSubmissions);
        return true;
    }

    sanitizeFormData(data) {
        const sanitized = {};

        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                // Basic XSS prevention
                sanitized[key] = value
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .replace(/\//g, '&#x2F;')
                    .trim();
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }

    // Validation methods
    validateRequired(value) {
        return value.length > 0 || 'This field is required';
    }

    validateEmail(value) {
        if (!value) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || 'Please enter a valid email address';
    }

    validatePassword(value) {
        if (!value) return true;
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain a lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain an uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain a number';
        return true;
    }

    validatePhone(value) {
        if (!value) return true;
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')) || 'Please enter a valid phone number';
    }

    validateName(value) {
        if (!value) return true;
        const nameRegex = /^[a-zA-Z\s\-\'\.]+$/;
        return nameRegex.test(value) || 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    validateMinLength(value, min) {
        if (!value) return true;
        return value.length >= parseInt(min) || `Must be at least ${min} characters`;
    }

    validateMaxLength(value, max) {
        if (!value) return true;
        return value.length <= parseInt(max) || `Must be no more than ${max} characters`;
    }

    validatePattern(value, pattern) {
        if (!value) return true;
        const regex = new RegExp(pattern);
        return regex.test(value) || 'Invalid format';
    }

    validateFile(value, rules, field) {
        if (!field.files || field.files.length === 0) return true;

        const file = field.files[0];

        // Check file type
        if (!this.securityRules.allowedFileTypes.includes(file.type)) {
            return 'File type not allowed';
        }

        // Check file size
        if (file.size > this.securityRules.maxFileSize) {
            return `File size must be less than ${this.securityRules.maxFileSize / 1024 / 1024}MB`;
        }

        return true;
    }
}

// Initialize form validator
window.addEventListener('DOMContentLoaded', () => {
    window.formValidator = new FormValidator();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}