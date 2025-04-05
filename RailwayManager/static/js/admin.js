// Admin panel JavaScript for Railway Management System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize date and time pickers for schedule forms
    const dateTimeInputs = document.querySelectorAll('input[type="datetime-local"]');
    if (dateTimeInputs.length > 0) {
        dateTimeInputs.forEach(input => {
            // Ensure the input has a default value if editing
            if (input.getAttribute('data-value')) {
                const dateValue = input.getAttribute('data-value');
                // Convert to format expected by datetime-local input
                const dateObj = new Date(dateValue);
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                
                input.value = `${year}-${month}-${day}T${hours}:${minutes}`;
            }
        });
    }
    
    // Train form validation
    const trainForm = document.getElementById('trainForm');
    if (trainForm) {
        trainForm.addEventListener('submit', function(event) {
            let isValid = true;
            
            // Train name validation
            const trainName = document.getElementById('name').value.trim();
            if (trainName.length < 3) {
                showError('name', 'Train name must be at least 3 characters long');
                isValid = false;
            } else {
                clearError('name');
            }
            
            // Train number validation
            const trainNumber = document.getElementById('train_number').value.trim();
            if (trainNumber.length < 2) {
                showError('train_number', 'Please enter a valid train number');
                isValid = false;
            } else {
                clearError('train_number');
            }
            
            // Total seats validation
            const totalSeats = document.getElementById('total_seats').value.trim();
            if (!totalSeats || isNaN(totalSeats) || totalSeats < 1) {
                showError('total_seats', 'Please enter a valid number of seats');
                isValid = false;
            } else {
                clearError('total_seats');
            }
            
            // Coach count validation
            const coachCount = document.getElementById('coach_count').value.trim();
            if (!coachCount || isNaN(coachCount) || coachCount < 1) {
                showError('coach_count', 'Please enter a valid number of coaches');
                isValid = false;
            } else {
                clearError('coach_count');
            }
            
            if (!isValid) {
                event.preventDefault();
            }
        });
    }
    
    // Station form validation
    const stationForm = document.getElementById('stationForm');
    if (stationForm) {
        stationForm.addEventListener('submit', function(event) {
            let isValid = true;
            
            // Station name validation
            const stationName = document.getElementById('name').value.trim();
            if (stationName.length < 3) {
                showError('name', 'Station name must be at least 3 characters long');
                isValid = false;
            } else {
                clearError('name');
            }
            
            // Station code validation
            const stationCode = document.getElementById('code').value.trim();
            if (stationCode.length < 2 || stationCode.length > 5) {
                showError('code', 'Station code must be 2-5 characters');
                isValid = false;
            } else {
                clearError('code');
            }
            
            // City validation
            const city = document.getElementById('city').value.trim();
            if (city.length < 2) {
                showError('city', 'Please enter a valid city name');
                isValid = false;
            } else {
                clearError('city');
            }
            
            // State validation
            const state = document.getElementById('state').value.trim();
            if (state.length < 2) {
                showError('state', 'Please enter a valid state name');
                isValid = false;
            } else {
                clearError('state');
            }
            
            // Address validation
            const address = document.getElementById('address').value.trim();
            if (address.length < 5) {
                showError('address', 'Please enter a complete address');
                isValid = false;
            } else {
                clearError('address');
            }
            
            // Platforms validation
            const platforms = document.getElementById('platforms').value.trim();
            if (!platforms || isNaN(platforms) || platforms < 1) {
                showError('platforms', 'Please enter a valid number of platforms');
                isValid = false;
            } else {
                clearError('platforms');
            }
            
            if (!isValid) {
                event.preventDefault();
            }
        });
    }
    
    // Schedule form validation
    const scheduleForm = document.getElementById('scheduleForm');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', function(event) {
            let isValid = true;
            
            // Train validation
            const trainId = document.getElementById('train_id').value;
            if (!trainId) {
                showError('train_id', 'Please select a train');
                isValid = false;
            } else {
                clearError('train_id');
            }
            
            // Departure station validation
            const departureStationId = document.getElementById('departure_station_id').value;
            if (!departureStationId) {
                showError('departure_station_id', 'Please select a departure station');
                isValid = false;
            } else {
                clearError('departure_station_id');
            }
            
            // Arrival station validation
            const arrivalStationId = document.getElementById('arrival_station_id').value;
            if (!arrivalStationId) {
                showError('arrival_station_id', 'Please select an arrival station');
                isValid = false;
            } else {
                clearError('arrival_station_id');
            }
            
            // Check if departure and arrival stations are the same
            if (departureStationId && arrivalStationId && departureStationId === arrivalStationId) {
                showError('arrival_station_id', 'Departure and arrival stations cannot be the same');
                isValid = false;
            }
            
            // Departure time validation
            const departureTime = document.getElementById('departure_time').value;
            if (!departureTime) {
                showError('departure_time', 'Please select a departure time');
                isValid = false;
            } else {
                clearError('departure_time');
            }
            
            // Arrival time validation
            const arrivalTime = document.getElementById('arrival_time').value;
            if (!arrivalTime) {
                showError('arrival_time', 'Please select an arrival time');
                isValid = false;
            } else {
                clearError('arrival_time');
            }
            
            // Check if departure time is before arrival time
            if (departureTime && arrivalTime) {
                const dTime = new Date(departureTime);
                const aTime = new Date(arrivalTime);
                
                if (dTime >= aTime) {
                    showError('arrival_time', 'Arrival time must be after departure time');
                    isValid = false;
                }
            }
            
            // Distance validation
            const distance = document.getElementById('distance').value.trim();
            if (!distance || isNaN(distance) || distance < 1) {
                showError('distance', 'Please enter a valid distance');
                isValid = false;
            } else {
                clearError('distance');
            }
            
            // Price validation
            const price = document.getElementById('price').value.trim();
            if (!price || isNaN(price) || price < 1) {
                showError('price', 'Please enter a valid price');
                isValid = false;
            } else {
                clearError('price');
            }
            
            // Available seats validation
            const availableSeats = document.getElementById('available_seats').value.trim();
            if (!availableSeats || isNaN(availableSeats) || availableSeats < 0) {
                showError('available_seats', 'Please enter a valid number of available seats');
                isValid = false;
            } else {
                clearError('available_seats');
            }
            
            if (!isValid) {
                event.preventDefault();
            }
        });
    }
    
    // Delete confirmation
    const deleteButtons = document.querySelectorAll('.delete-btn');
    if (deleteButtons.length > 0) {
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
                    event.preventDefault();
                }
            });
        });
    }
    
    // Search functionality for admin tables
    const searchInput = document.getElementById('searchTable');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('table tbody tr');
            
            tableRows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // Sort tables
    const sortableHeaders = document.querySelectorAll('th[data-sort]');
    if (sortableHeaders.length > 0) {
        sortableHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const table = this.closest('table');
                const columnIndex = this.cellIndex;
                const sortDirection = this.getAttribute('data-sort-direction') === 'asc' ? 'desc' : 'asc';
                
                // Update the sort direction attribute
                sortableHeaders.forEach(h => h.setAttribute('data-sort-direction', ''));
                this.setAttribute('data-sort-direction', sortDirection);
                
                // Update visual indicators
                sortableHeaders.forEach(h => h.querySelector('i')?.remove());
                const icon = document.createElement('i');
                icon.className = `ms-2 fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`;
                this.appendChild(icon);
                
                // Sort the table
                const rows = Array.from(table.querySelectorAll('tbody tr'));
                rows.sort((rowA, rowB) => {
                    const cellA = rowA.cells[columnIndex].textContent.trim();
                    const cellB = rowB.cells[columnIndex].textContent.trim();
                    
                    // Check if the column contains numbers
                    if (!isNaN(cellA) && !isNaN(cellB)) {
                        return sortDirection === 'asc' 
                            ? parseFloat(cellA) - parseFloat(cellB)
                            : parseFloat(cellB) - parseFloat(cellA);
                    } else {
                        return sortDirection === 'asc'
                            ? cellA.localeCompare(cellB)
                            : cellB.localeCompare(cellA);
                    }
                });
                
                // Reorder rows in the table
                const tbody = table.querySelector('tbody');
                rows.forEach(row => tbody.appendChild(row));
            });
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
});
