// Main JavaScript for the Railway Management System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    
    // Initialize popovers
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
    
    // Station search functionality
    const stationSearchInput = document.getElementById('stationSearch');
    if (stationSearchInput) {
        stationSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const stationCards = document.querySelectorAll('.station-card');
            
            stationCards.forEach(card => {
                const stationName = card.querySelector('.station-name').textContent.toLowerCase();
                const stationCode = card.querySelector('.station-code').textContent.toLowerCase();
                const stationCity = card.querySelector('.station-city').textContent.toLowerCase();
                
                if (stationName.includes(searchTerm) || 
                    stationCode.includes(searchTerm) || 
                    stationCity.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Journey date validation - Cannot select past dates
    const journeyDateInput = document.getElementById('journey_date');
    if (journeyDateInput) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
        const yyyy = today.getFullYear();
        
        const todayStr = yyyy + '-' + mm + '-' + dd;
        journeyDateInput.min = todayStr;
        
        // Set max date to 3 months from today
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        const maxDd = String(maxDate.getDate()).padStart(2, '0');
        const maxMm = String(maxDate.getMonth() + 1).padStart(2, '0');
        const maxYyyy = maxDate.getFullYear();
        
        const maxDateStr = maxYyyy + '-' + maxMm + '-' + maxDd;
        journeyDateInput.max = maxDateStr;
    }
    
    // Schedule search date validation
    const scheduleSearchDate = document.getElementById('date');
    if (scheduleSearchDate) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        
        const todayStr = yyyy + '-' + mm + '-' + dd;
        scheduleSearchDate.min = todayStr;
        
        // Set max date to 3 months from today
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        const maxDd = String(maxDate.getDate()).padStart(2, '0');
        const maxMm = String(maxDate.getMonth() + 1).padStart(2, '0');
        const maxYyyy = maxDate.getFullYear();
        
        const maxDateStr = maxYyyy + '-' + maxMm + '-' + maxDd;
        scheduleSearchDate.max = maxDateStr;
        
        // If no date is set, default to today
        if (!scheduleSearchDate.value) {
            scheduleSearchDate.value = todayStr;
        }
    }
    
    // Train status by PNR form validation
    const pnrForm = document.getElementById('pnrForm');
    if (pnrForm) {
        pnrForm.addEventListener('submit', function(event) {
            const pnrInput = document.getElementById('pnr');
            const pnrValue = pnrInput.value.trim();
            
            // PNR should be 10 characters
            if (pnrValue.length !== 10) {
                event.preventDefault();
                alert('PNR number should be 10 characters long');
                return false;
            }
            
            // PNR should contain only alphanumeric characters
            if (!/^[A-Za-z0-9]+$/.test(pnrValue)) {
                event.preventDefault();
                alert('PNR number should contain only letters and numbers');
                return false;
            }
        });
    }
    
    // Ticket filters on profile page
    const ticketFilterButtons = document.querySelectorAll('.ticket-filter-btn');
    if (ticketFilterButtons.length > 0) {
        ticketFilterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-filter');
                const tickets = document.querySelectorAll('.ticket-card');
                
                // Remove active class from all buttons
                ticketFilterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                tickets.forEach(ticket => {
                    if (filterValue === 'all') {
                        ticket.style.display = 'block';
                    } else {
                        const ticketStatus = ticket.getAttribute('data-status');
                        if (ticketStatus === filterValue) {
                            ticket.style.display = 'block';
                        } else {
                            ticket.style.display = 'none';
                        }
                    }
                });
            });
        });
    }
    
    // Animated counters for statistics on admin dashboard
    const counters = document.querySelectorAll('.counter');
    if (counters.length > 0) {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const increment = target / 100;
            
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(() => updateCounter(counter), 10);
            } else {
                counter.innerText = target;
            }
        });
        
        function updateCounter(counter) {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const increment = target / 100;
            
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(() => updateCounter(counter), 10);
            } else {
                counter.innerText = target;
            }
        }
    }
});
