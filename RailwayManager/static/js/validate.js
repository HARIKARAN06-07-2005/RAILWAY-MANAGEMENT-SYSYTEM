// Form validation functions for Railway Management System

document.addEventListener('DOMContentLoaded', function() {
    // Registration form validation
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(event) {
            let isValid = true;
            
            // Username validation
            const username = document.getElementById('username').value.trim();
            if (username.length < 4) {
                showError('username', 'Username must be at least 4 characters long');
                isValid = false;
            } else if (!/^[A-Za-z0-9_]+$/.test(username)) {
                showError('username', 'Username can only contain letters, numbers, and underscores');
                isValid = false;
            } else {
                clearError('username');
            }
            
            // Email validation
            const email = document.getElementById('email').value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError('email', 'Please enter a valid email address');
                isValid = false;
            } else {
                clearError('email');
            }
            
            // Password validation
            const password = document.getElementById('password').value;
            if (password.length < 8) {
                showError('password', 'Password must be at least 8 characters long');
                isValid = false;
            } else if (!/[A-Z]/.test(password)) {
                showError('password', 'Password must contain at least one uppercase letter');
                isValid = false;
            } else if (!/[a-z]/.test(password)) {
                showError('password', 'Password must contain at least one lowercase letter');
                isValid = false;
            } else if (!/[0-9]/.test(password)) {
                showError('password', 'Password must contain at least one number');
                isValid = false;
            } else {
                clearError('password');
            }
            
            // Confirm password validation
            const confirmPassword = document.getElementById('confirm_password').value;
            if (password !== confirmPassword) {
                showError('confirm_password', 'Passwords do not match');
                isValid = false;
            } else {
                clearError('confirm_password');
            }
            
            // Full name validation
            const fullName = document.getElementById('full_name').value.trim();
            if (fullName.length < 3) {
                showError('full_name', 'Please enter your full name');
                isValid = false;
            } else {
                clearError('full_name');
            }
            
            // Phone validation
            const phone = document.getElementById('phone').value.trim();
            if (phone && !/^\d{10,15}$/.test(phone)) {
                showError('phone', 'Please enter a valid phone number (10-15 digits)');
                isValid = false;
            } else {
                clearError('phone');
            }
            
            if (!isValid) {
                event.preventDefault();
            }
        });
    }
    
    // Login form validation
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            let isValid = true;
            
            // Username validation
            const username = document.getElementById('username').value.trim();
            if (username.length < 1) {
                showError('username', 'Please enter your username');
                isValid = false;
            } else {
                clearError('username');
            }
            
            // Password validation
            const password = document.getElementById('password').value;
            if (password.length < 1) {
                showError('password', 'Please enter your password');
                isValid = false;
            } else {
                clearError('password');
            }
            
            if (!isValid) {
                event.preventDefault();
            }
        });
    }
    
    // Booking form validation
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(event) {
            let isValid = true;
            
            // Passenger name validation
            const passengerName = document.getElementById('passenger_name').value.trim();
            if (passengerName.length < 3) {
                showError('passenger_name', 'Please enter passenger\'s full name');
                isValid = false;
            } else {
                clearError('passenger_name');
            }
            
            // Passenger age validation
            const passengerAge = document.getElementById('passenger_age').value.trim();
            if (!passengerAge || isNaN(passengerAge) || passengerAge < 1 || passengerAge > 120) {
                showError('passenger_age', 'Please enter a valid age (1-120)');
                isValid = false;
            } else {
                clearError('passenger_age');
            }
            
            // Passenger gender validation
            const passengerGender = document.getElementById('passenger_gender').value;
            if (!passengerGender) {
                showError('passenger_gender', 'Please select passenger\'s gender');
                isValid = false;
            } else {
                clearError('passenger_gender');
            }
            
            // Journey date validation
            const journeyDate = document.getElementById('journey_date').value;
            if (!journeyDate) {
                showError('journey_date', 'Please select a journey date');
                isValid = false;
            } else {
                const selectedDate = new Date(journeyDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) {
                    showError('journey_date', 'Journey date cannot be in the past');
                    isValid = false;
                } else {
                    clearError('journey_date');
                }
            }
            
            if (!isValid) {
                event.preventDefault();
            }
        });
    }
    
    // Search form validation
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            let isValid = true;
            
            // From station validation
            const fromStation = document.getElementById('from').value;
            if (!fromStation) {
                showError('from', 'Please select departure station');
                isValid = false;
            } else {
                clearError('from');
            }
            
            // To station validation
            const toStation = document.getElementById('to').value;
            if (!toStation) {
                showError('to', 'Please select arrival station');
                isValid = false;
            } else {
                clearError('to');
            }
            
            // Check if from and to stations are the same
            if (fromStation && toStation && fromStation === toStation) {
                showError('to', 'Departure and arrival stations cannot be the same');
                isValid = false;
            }
            
            // Date validation
            const journeyDate = document.getElementById('date').value;
            if (!journeyDate) {
                showError('date', 'Please select a date');
                isValid = false;
            } else {
                clearError('date');
            }
            
            if (!isValid) {
                event.preventDefault();
            }
        });
    }
    
    // Utility functions for form validation
    function showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorElement = document.getElementById(`${inputId}-error`);
        
        input.classList.add('is-invalid');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        } else {
            const newErrorElement = document.createElement('div');
            newErrorElement.id = `${inputId}-error`;
            newErrorElement.className = 'invalid-feedback';
            newErrorElement.textContent = message;
            
            input.parentNode.appendChild(newErrorElement);
        }
    }
    
    function clearError(inputId) {
        const input = document.getElementById(inputId);
        const errorElement = document.getElementById(`${inputId}-error`);
        
        input.classList.remove('is-invalid');
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }
    
    // Real-time validation for password strength
    const passwordInput = document.getElementById('password');
    const passwordStrength = document.getElementById('password-strength');
    
    if (passwordInput && passwordStrength) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            
            // Length check
            if (password.length >= 8) strength += 1;
            
            // Uppercase check
            if (/[A-Z]/.test(password)) strength += 1;
            
            // Lowercase check
            if (/[a-z]/.test(password)) strength += 1;
            
            // Number check
            if (/[0-9]/.test(password)) strength += 1;
            
            // Special character check
            if (/[^A-Za-z0-9]/.test(password)) strength += 1;
            
            // Update strength indicator
            passwordStrength.className = 'progress-bar';
            
            if (strength === 0) {
                passwordStrength.style.width = '0%';
                passwordStrength.classList.add('bg-danger');
            } else if (strength === 1) {
                passwordStrength.style.width = '20%';
                passwordStrength.classList.add('bg-danger');
            } else if (strength === 2) {
                passwordStrength.style.width = '40%';
                passwordStrength.classList.add('bg-warning');
            } else if (strength === 3) {
                passwordStrength.style.width = '60%';
                passwordStrength.classList.add('bg-info');
            } else if (strength === 4) {
                passwordStrength.style.width = '80%';
                passwordStrength.classList.add('bg-success');
            } else {
                passwordStrength.style.width = '100%';
                passwordStrength.classList.add('bg-success');
            }
        });
    }
});
