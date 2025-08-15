// USIU-A Event Booking Dashboard JavaScript

// Sample events data
const initialEvents = [
    {
        id: 1,
        name: "Tech Innovation Summit 2025",
        date: "2025-09-15",
        venue: "Main Auditorium",
        slots: 150
    },
    {
        id: 2,
        name: "Career Fair & Networking",
        date: "2025-09-22",
        venue: "Student Center",
        slots: 200
    },
    {
        id: 3,
        name: "International Cultural Festival",
        date: "2025-10-05",
        venue: "Campus Grounds",
        slots: 300
    },
    {
        id: 4,
        name: "Academic Excellence Awards",
        date: "2025-10-12",
        venue: "Conference Hall",
        slots: 100
    },
    {
        id: 5,
        name: "Sports Day Championship",
        date: "2025-10-20",
        venue: "Sports Complex",
        slots: 250
    },
    {
        id: 6,
        name: "Alumni Networking Dinner",
        date: "2025-09-08",
        venue: "Grand Ballroom",
        slots: 0
    }
];

// Global variables
let events = [];
let registrations = [];

// DOM elements
const eventsTableBody = document.getElementById('eventsTableBody');
const registrationForm = document.getElementById('registrationForm');
const selectedEventSelect = document.getElementById('selectedEvent');
const messageContainer = document.getElementById('message-container');
const confirmationMessage = document.getElementById('confirmationMessage');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    renderEvents();
    populateEventDropdown();
    setupEventListeners();
});

// Load data from localStorage or use initial data
function loadDataFromStorage() {
    const storedEvents = localStorage.getItem('usiu-events');
    const storedRegistrations = localStorage.getItem('usiu-registrations');
    
    if (storedEvents) {
        events = JSON.parse(storedEvents);
    } else {
        events = [...initialEvents];
        saveEventsToStorage();
    }
    
    if (storedRegistrations) {
        registrations = JSON.parse(storedRegistrations);
    }
}

// Save events to localStorage
function saveEventsToStorage() {
    localStorage.setItem('usiu-events', JSON.stringify(events));
}

// Save registrations to localStorage
function saveRegistrationsToStorage() {
    localStorage.setItem('usiu-registrations', JSON.stringify(registrations));
}

// Render events table
function renderEvents() {
    eventsTableBody.innerHTML = '';
    
    events.forEach(event => {
        const row = document.createElement('tr');
        
        // Format date for display
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        row.innerHTML = `
            <td><strong>${event.name}</strong></td>
            <td>${formattedDate}</td>
            <td>${event.venue}</td>
            <td><span class="slots-count">${event.slots}</span></td>
            <td>
                <button 
                    class="register-btn" 
                    data-event-id="${event.id}"
                    ${event.slots === 0 ? 'disabled' : ''}
                >
                    ${event.slots === 0 ? 'Fully Booked' : 'Register'}
                </button>
            </td>
        `;
        
        eventsTableBody.appendChild(row);
    });
}

// Populate event dropdown in registration form
function populateEventDropdown() {
    // Clear existing options except the first one
    selectedEventSelect.innerHTML = '<option value="">Choose an event...</option>';
    
    events.forEach(event => {
        if (event.slots > 0) {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = event.name;
            selectedEventSelect.appendChild(option);
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Register button clicks (event delegation)
    eventsTableBody.addEventListener('click', function(e) {
        if (e.target.classList.contains('register-btn') && !e.target.disabled) {
            const eventId = parseInt(e.target.getAttribute('data-event-id'));
            handleQuickRegistration(eventId);
        }
    });
    
    // Registration form submission
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmission();
    });
}

// Handle quick registration from table buttons
function handleQuickRegistration(eventId) {
    const event = events.find(e => e.id === eventId);
    
    if (!event || event.slots === 0) {
        showMessage('This event is fully booked!', 'error');
        return;
    }
    
    // Scroll to registration form
    scrollToRegistrationForm();
    
    // Pre-select the event in the dropdown
    selectedEventSelect.value = eventId;
    
    // Focus on the name field
    document.getElementById('studentName').focus();
    
    // Show message to guide user
    showMessage(`Please complete the registration form for "${event.name}".`, 'success');
}

// Handle form submission
function handleFormSubmission() {
    // Get form data
    const formData = new FormData(registrationForm);
    const studentName = formData.get('studentName').trim();
    const studentId = formData.get('studentId').trim();
    const selectedEventId = parseInt(formData.get('selectedEvent'));
    
    // Validate form data
    if (!validateFormData(studentName, studentId, selectedEventId)) {
        return;
    }
    
    // Find the selected event
    const selectedEvent = events.find(e => e.id === selectedEventId);
    
    if (!selectedEvent || selectedEvent.slots === 0) {
        showMessage('Selected event is no longer available!', 'error');
        return;
    }
    
    // Check if student is already registered for this event
    const existingRegistration = registrations.find(r => 
        r.studentId === studentId && r.eventId === selectedEventId
    );
    
    if (existingRegistration) {
        showMessage('You are already registered for this event!', 'error');
        return;
    }
    
    // Create registration record
    const registration = {
        id: Date.now(),
        studentName,
        studentId,
        eventId: selectedEventId,
        eventName: selectedEvent.name,
        registrationDate: new Date().toISOString()
    };
    
    // Add to registrations array
    registrations.push(registration);
    
    // Reduce event slots
    selectedEvent.slots -= 1;
    
    // Save to localStorage
    saveEventsToStorage();
    saveRegistrationsToStorage();
    
    // Update UI
    renderEvents();
    populateEventDropdown();
    
    // Show confirmation message
    showConfirmationMessage(studentName, studentId, selectedEvent.name);
    
    // Reset form
    registrationForm.reset();
    
    // Show success message
    showMessage('Registration completed successfully!', 'success');
}

// Validate form data
function validateFormData(name, studentId, eventId) {
    // Clear previous messages
    clearMessages();
    
    let isValid = true;
    const errors = [];
    
    // Validate name
    if (!name || name.length < 2) {
        errors.push('Please enter a valid full name (at least 2 characters).');
        isValid = false;
    }
    
    // Validate student ID format (6 digits)
    const studentIdPattern = /^\d{6}$/;
    if (!studentId || !studentIdPattern.test(studentId)) {
        errors.push('Please enter a valid Student ID (6 digits, e.g., 665437).');
        isValid = false;
    }
    
    // Validate event selection
    if (!eventId || isNaN(eventId)) {
        errors.push('Please select an event to register for.');
        isValid = false;
    }
    
    // Show errors if any
    if (!isValid) {
        errors.forEach(error => showMessage(error, 'error'));
    }
    
    return isValid;
}

// Show confirmation message
function showConfirmationMessage(name, studentId, eventName) {
    const message = `
        <h3>Registration Confirmed!</h3>
        <p><strong>Student Name:</strong> ${name}</p>
        <p><strong>Student ID:</strong> ${studentId}</p>
        <p><strong>Event:</strong> ${eventName}</p>
        <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
    `;
    
    confirmationMessage.innerHTML = message;
    confirmationMessage.classList.add('show');
    
    // Hide after 10 seconds
    setTimeout(() => {
        confirmationMessage.classList.remove('show');
    }, 10000);
}

// Show message (success/error)
function showMessage(text, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    
    messageContainer.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// Clear all messages
function clearMessages() {
    messageContainer.innerHTML = '';
    confirmationMessage.classList.remove('show');
}

// Scroll to registration form smoothly
function scrollToRegistrationForm() {
    const registrationSection = document.querySelector('.registration-section');
    if (registrationSection) {
        registrationSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Debug function to reset data (for testing)
function resetAllData() {
    localStorage.removeItem('usiu-events');
    localStorage.removeItem('usiu-registrations');
    location.reload();
}

// Export functions for potential external use
window.EventBookingDashboard = {
    resetAllData,
    events,
    registrations
};
