document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('travel-date').value = today;
    document.getElementById('carpool-date').value = today;
    document.getElementById('offer-date').value = today;
    
    document.getElementById('travel-date').min = today;
    document.getElementById('carpool-date').min = today;
    document.getElementById('offer-date').min = today;
    
    const timePicker = document.getElementById('offer-time');
    timePicker.value = '08:00';
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    document.getElementById('travel-time').value = currentTime;
    
    initializeClockPickers();
    loadBookings();
    setupEventListeners();
});

function setupEventListeners() {
    setupNavigationLinks();
    setupTabEventListeners();
    
    document.getElementById('search-buses').addEventListener('click', searchBuses);
    
    document.getElementById('search-carpools').addEventListener('click', searchCarpools);
    
    document.getElementById('offer-form').addEventListener('submit', offerCarpool);
    
    document.getElementById('request-carpool').addEventListener('click', requestCarpool);
    
    document.getElementById('confirm-booking').addEventListener('click', confirmBusBooking);
    
    document.getElementById('search-autos').addEventListener('click', searchAutos);
    
    document.getElementById('confirm-auto-booking').addEventListener('click', confirmAutoBooking);
    
    // Close modal when clicking on the close button or outside the modal
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Add auto driver call buttons event listener
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('call-driver')) {
            const driverId = e.target.getAttribute('data-driver-id');
            const driver = autoDrivers.find(d => d.id === driverId);
            if (driver) {
                window.location.href = `tel:${driver.phone}`;
            }
        } else if (e.target.classList.contains('book-auto')) {
            const driverId = e.target.getAttribute('data-driver-id');
            const driver = autoDrivers.find(d => d.id === driverId);
            if (driver) {
                openAutoBookingModal(driver);
            }
        }
    });

    // Add destination change event listener for auto booking modal
    document.getElementById('modal-auto-destination').addEventListener('change', function() {
        updateAutoBookingDetails();
    });
}

function setupNavigationLinks() {
    document.querySelectorAll('.nav-link').forEach(link => {
        const oldLink = link.cloneNode(true);
        link.parentNode.replaceChild(oldLink, link);
        
        oldLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
            
            this.classList.add('active');
            
            const sectionId = this.getAttribute('data-section');
            
            document.getElementById('bus-booking').style.display = 'none';
            document.getElementById('carpooling').style.display = 'none';
            document.getElementById('auto-sharing').style.display = 'none';
            document.getElementById('my-bookings').style.display = 'none';
            
            if (sectionId === 'auto-sharing') {
                document.getElementById('auto-sharing').style.display = 'block';
                document.getElementById('auto-source').value = 'IIT Hyderabad';
                document.getElementById('auto-destination').value = '';
                displayAutoDrivers();
            } else if (sectionId === 'bus-booking') {
                document.getElementById('bus-booking').style.display = 'block';
                document.getElementById('carpool-results').innerHTML = '';
                document.getElementById('carpool-from').value = 'IIT Hyderabad';
                document.getElementById('carpool-to').value = '';
                document.getElementById('carpool-date').value = new Date().toISOString().split('T')[0];
                document.getElementById('offer-form').reset();
                document.getElementById('offer-from').value = 'IIT Hyderabad';
                document.getElementById('offer-time').value = '08:00';
            } else if (sectionId === 'carpooling') {
                document.getElementById('carpooling').style.display = 'block';
                document.getElementById('bus-results').innerHTML = '';
                document.getElementById('travel-date').value = new Date().toISOString().split('T')[0];
                document.getElementById('travel-time').value = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            } else if (sectionId === 'my-bookings') {
                document.getElementById('my-bookings').style.display = 'block';
                document.getElementById('bus-results').innerHTML = '';
                document.getElementById('carpool-results').innerHTML = '';
                
                // Ensure bus tickets tab is active and visible
                document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
                document.querySelector('.tab-btn[data-tab="bus-tickets"]').classList.add('active');
                
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.style.display = 'none';
                });
                document.getElementById('bus-tickets').style.display = 'block';
                
                // Load the bookings
                loadBookings();
            }
        });
    });
}

function setupTabEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const oldBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(oldBtn, btn);
        
        oldBtn.addEventListener('click', function() {
            const tabsContainer = this.closest('.tabs');
            
            // Remove active class from all tabs
            tabsContainer.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                content.style.display = 'none';
            });
            
            // Show selected tab content
            const tabId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.style.display = 'block';
            }
        });
    });
}

const buses = [
    {
        id: 'bus1',
        name: 'Early Bird Express',
        type: 'AC',
        departureTime: '04:30',
        arrivalTime: '05:15',
        departureLocation: 'IIT Hyderabad Main Gate',
        arrivalLocation: 'Secunderabad Station',
        price: 180,
        amenities: ['WiFi', 'Water Bottle', 'Charging Point', 'Blanket'],
        seats: Array(16).fill().map((_, i) => ({ id: i + 1, available: Math.random() > 0.2 }))
    },
    {
        id: 'bus2',
        name: 'Morning Commuter',
        type: 'AC',
        departureTime: '06:00',
        arrivalTime: '06:45',
        departureLocation: 'IIT Hyderabad Main Gate',
        arrivalLocation: 'HITEC City',
        price: 170,
        amenities: ['WiFi', 'Water Bottle', 'Charging Point', 'Breakfast Box'],
        seats: Array(12).fill().map((_, i) => ({ id: i + 1, available: Math.random() > 0.2 }))
    },
    {
        id: 'bus3',
        name: 'Express Shuttle',
        type: 'AC',
        departureTime: '07:30',
        arrivalTime: '08:15',
        departureLocation: 'IIT Hyderabad Main Gate',
        arrivalLocation: 'Gachibowli',
        price: 160,
        amenities: ['WiFi', 'Water Bottle', 'Charging Point'],
        seats: Array(16).fill().map((_, i) => ({ id: i + 1, available: Math.random() > 0.2 }))
    },
    {
        id: 'bus4',
        name: 'City Connect',
        type: 'Non-AC',
        departureTime: '09:00',
        arrivalTime: '09:45',
        departureLocation: 'IIT Hyderabad Main Gate',
        arrivalLocation: 'Lingampally',
        price: 140,
        amenities: ['Newspaper'],
        seats: Array(12).fill().map((_, i) => ({ id: i + 1, available: Math.random() > 0.2 }))
    },
    {
        id: 'bus5',
        name: 'Campus Rider',
        type: 'AC',
        departureTime: '14:30',
        arrivalTime: '15:15',
        departureLocation: 'IIT Hyderabad Main Gate',
        arrivalLocation: 'HITEC City',
        price: 170,
        amenities: ['WiFi', 'Water Bottle', 'Charging Point', 'Snacks'],
        seats: Array(16).fill().map((_, i) => ({ id: i + 1, available: Math.random() > 0.2 }))
    },
    {
        id: 'bus6',
        name: 'Night Shuttle',
        type: 'AC',
        departureTime: '19:00',
        arrivalTime: '19:45',
        departureLocation: 'IIT Hyderabad Main Gate',
        arrivalLocation: 'Gachibowli',
        price: 165,
        amenities: ['WiFi', 'Water Bottle', 'Charging Point'],
        seats: Array(16).fill().map((_, i) => ({ id: i + 1, available: Math.random() > 0.2 }))
    },
    {
        id: 'bus7',
        name: 'Late Night Express',
        type: 'AC',
        departureTime: '22:30',
        arrivalTime: '23:15',
        departureLocation: 'IIT Hyderabad Main Gate',
        arrivalLocation: 'Secunderabad Station',
        price: 180,
        amenities: ['WiFi', 'Water Bottle', 'Charging Point', 'Blanket', 'Reading Light'],
        seats: Array(16).fill().map((_, i) => ({ id: i + 1, available: Math.random() > 0.2 }))
    },
    {
        id: 'bus8',
        name: 'Midnight Shuttle',
        type: 'AC Sleeper',
        departureTime: '23:45',
        arrivalTime: '00:30',
        departureLocation: 'IIT Hyderabad Main Gate',
        arrivalLocation: 'HITEC City',
        price: 190,
        amenities: ['WiFi', 'Water Bottle', 'Charging Point', 'Blanket', 'Reading Light', 'Sleeper Seats'],
        seats: Array(12).fill().map((_, i) => ({ id: i + 1, available: Math.random() > 0.2 }))
    },
    {
        id: 'bus9',
        name: 'Dawn Express',
        type: 'AC Sleeper',
        departureTime: '03:00',
        arrivalTime: '03:45',
        departureLocation: 'IIT Hyderabad Main Gate',
        arrivalLocation: 'Secunderabad Station',
        price: 195,
        amenities: ['WiFi', 'Water Bottle', 'Charging Point', 'Blanket', 'Reading Light', 'Sleeper Seats'],
        seats: Array(12).fill().map((_, i) => ({ id: i + 1, available: Math.random() > 0.2 }))
    },
    {
        id: 'bus10',
        name: 'Morning Star',
        type: 'AC',
        departureTime: '05:15',
        arrivalTime: '06:00',
        departureLocation: 'IIT Hyderabad Main Gate',
        arrivalLocation: 'Gachibowli',
        price: 165,
        amenities: ['WiFi', 'Water Bottle', 'Charging Point', 'Morning Newspaper'],
        seats: Array(16).fill().map((_, i) => ({ id: i + 1, available: Math.random() > 0.2 }))
    },
    {
        id: 'bus11',
        name: 'Afternoon Special',
        type: 'AC',
        departureTime: '12:00',
        arrivalTime: '12:45',
        departureLocation: 'IIT Hyderabad Main Gate',
        arrivalLocation: 'HITEC City',
        price: 175,
        amenities: ['WiFi', 'Water Bottle', 'Charging Point', 'Lunch Box'],
        seats: Array(16).fill().map((_, i) => ({ id: i + 1, available: Math.random() > 0.2 }))
    },
    {
        id: 'bus12',
        name: 'Evening Connect',
        type: 'AC',
        departureTime: '16:30',
        arrivalTime: '17:15',
        departureLocation: 'IIT Hyderabad Main Gate',
        arrivalLocation: 'Lingampally',
        price: 155,
        amenities: ['WiFi', 'Water Bottle', 'Charging Point'],
        seats: Array(16).fill().map((_, i) => ({ id: i + 1, available: Math.random() > 0.2 }))
    }
];

let carpools = [
    {
        id: 'carpool1',
        driver: 'Raj Kumar',
        from: 'IIT Hyderabad',
        to: 'Gachibowli',
        date: '2025-03-12',
        time: '08:00',
        availableSeats: 3,
        pricePerSeat: 50,
        carModel: 'Honda City',
        notes: 'Comfortable ride with AC. No smoking please.',
        contact: '+91 9876543210'
    },
    {
        id: 'carpool2',
        driver: 'Priya Sharma',
        from: 'IIT Hyderabad',
        to: 'HITEC City',
        date: '2025-03-12',
        time: '17:30',
        availableSeats: 2,
        pricePerSeat: 60,
        carModel: 'Hyundai i20',
        notes: 'Direct trip to HITEC City, no stops in between.',
        contact: '+91 9765432180'
    },
    {
        id: 'carpool3',
        driver: 'Vikram Singh',
        from: 'IIT Hyderabad',
        to: 'Lingampally',
        date: '2025-03-13',
        time: '09:15',
        availableSeats: 3,
        pricePerSeat: 45,
        carModel: 'Maruti Swift',
        notes: 'Quick ride to Lingampally. Can drop at railway station.',
        contact: '+91 8765432190'
    }
];

const governmentBuses = [
    {
        id: 'gov1',
        type: 'Express',
        busNumber: 'TS 123456',
        operator: 'TSRTC',
        route: 'Sangareddy - Hyderabad',
        stops: [
            { name: 'Sangareddy Bus Stand', time: '06:00', type: 'Origin' },
            { name: 'Patancheru', time: '06:30', type: 'Stop' },
            { name: 'Miyapur X Roads', time: '07:00', type: 'Stop' },
            { name: 'JNTU', time: '07:15', type: 'Stop' },
            { name: 'Ameerpet', time: '07:30', type: 'Stop' },
            { name: 'Hyderabad CBS', time: '08:00', type: 'Destination' }
        ],
        frequency: '30 minutes',
        fare: 75,
        amenities: ['Reserved Seating', 'Air Suspension'],
        nextBus: '30 minutes',
        status: 'On Time'
    },
    {
        id: 'gov2',
        type: 'Super Luxury',
        busNumber: 'TS 789012',
        operator: 'TSRTC',
        route: 'Hyderabad - Sangareddy',
        stops: [
            { name: 'Hyderabad CBS', time: '07:00', type: 'Origin' },
            { name: 'Ameerpet', time: '07:30', type: 'Stop' },
            { name: 'JNTU', time: '07:45', type: 'Stop' },
            { name: 'Miyapur X Roads', time: '08:00', type: 'Stop' },
            { name: 'Patancheru', time: '08:30', type: 'Stop' },
            { name: 'Sangareddy Bus Stand', time: '09:00', type: 'Destination' }
        ],
        frequency: '1 hour',
        fare: 90,
        amenities: ['AC', 'Reserved Seating', 'Air Suspension', 'Mobile Charging'],
        nextBus: '1 hour',
        status: 'Delayed by 10 mins'
    },
    {
        id: 'gov3',
        type: 'Deluxe',
        busNumber: 'TS 345678',
        operator: 'TSRTC',
        route: 'Sangareddy - Secunderabad',
        stops: [
            { name: 'Sangareddy Bus Stand', time: '08:00', type: 'Origin' },
            { name: 'Patancheru', time: '08:30', type: 'Stop' },
            { name: 'Balanagar', time: '09:00', type: 'Stop' },
            { name: 'Bowenpally', time: '09:20', type: 'Stop' },
            { name: 'Paradise', time: '09:35', type: 'Stop' },
            { name: 'Secunderabad Station', time: '10:00', type: 'Destination' }
        ],
        frequency: '45 minutes',
        fare: 85,
        amenities: ['Reserved Seating', 'Air Suspension'],
        nextBus: '45 minutes',
        status: 'On Time'
    },
    {
        id: 'gov4',
        type: 'Metro Luxury',
        busNumber: 'TS 567890',
        operator: 'TSRTC',
        route: 'Sangareddy - HITEC City',
        stops: [
            { name: 'Sangareddy Bus Stand', time: '07:30', type: 'Origin' },
            { name: 'Patancheru', time: '08:00', type: 'Stop' },
            { name: 'Miyapur X Roads', time: '08:30', type: 'Stop' },
            { name: 'JNTU', time: '08:45', type: 'Stop' },
            { name: 'Gachibowli', time: '09:15', type: 'Stop' },
            { name: 'HITEC City', time: '09:30', type: 'Destination' }
        ],
        frequency: '40 minutes',
        fare: 95,
        amenities: ['AC', 'Reserved Seating', 'Air Suspension', 'WiFi'],
        nextBus: '40 minutes',
        status: 'On Time'
    },
    {
        id: 'gov5',
        type: 'City Ordinary',
        busNumber: 'TS 234567',
        operator: 'TSRTC',
        route: 'Sangareddy - Lingampally',
        stops: [
            { name: 'Sangareddy Bus Stand', time: '05:30', type: 'Origin' },
            { name: 'Patancheru', time: '06:00', type: 'Stop' },
            { name: 'Isnapur', time: '06:15', type: 'Stop' },
            { name: 'RC Puram', time: '06:30', type: 'Stop' },
            { name: 'Lingampally', time: '07:00', type: 'Destination' }
        ],
        frequency: '20 minutes',
        fare: 55,
        amenities: ['Standard Seating'],
        nextBus: '20 minutes',
        status: 'On Time'
    },
    {
        id: 'gov6',
        type: 'Metro Express',
        busNumber: 'TS 678901',
        operator: 'TSRTC',
        route: 'Sangareddy - Mehdipatnam',
        stops: [
            { name: 'Sangareddy Bus Stand', time: '09:00', type: 'Origin' },
            { name: 'Patancheru', time: '09:30', type: 'Stop' },
            { name: 'Miyapur X Roads', time: '10:00', type: 'Stop' },
            { name: 'JNTU', time: '10:15', type: 'Stop' },
            { name: 'Kukatpally', time: '10:30', type: 'Stop' },
            { name: 'SR Nagar', time: '10:45', type: 'Stop' },
            { name: 'Mehdipatnam', time: '11:15', type: 'Destination' }
        ],
        frequency: '35 minutes',
        fare: 80,
        amenities: ['AC', 'Reserved Seating'],
        nextBus: '35 minutes',
        status: 'Delayed by 5 mins'
    }
];

const autoDrivers = [
    {
        id: 'auto1',
        name: 'Rajesh Kumar',
        phone: '+91 9876543210',
        rating: 4.8,
        totalRides: 1250,
        vehicleNumber: 'TS 12 A 3456',
        experience: '5 years',
        languages: ['Telugu', 'Hindi', 'English'],
        photo: '👨‍✈️',
        available: true,
        currentLocation: 'IIT Hyderabad Main Gate'
    },
    {
        id: 'auto2',
        name: 'Venkat Reddy',
        phone: '+91 9765432180',
        rating: 4.9,
        totalRides: 1500,
        vehicleNumber: 'TS 12 B 7890',
        experience: '8 years',
        languages: ['Telugu', 'Hindi'],
        photo: '👨‍✈️',
        available: true,
        currentLocation: 'IIT Hyderabad Main Gate'
    },
    {
        id: 'auto3',
        name: 'Mohammad Ismail',
        phone: '+91 8765432190',
        rating: 4.7,
        totalRides: 980,
        vehicleNumber: 'TS 12 C 1234',
        experience: '4 years',
        languages: ['Telugu', 'Hindi', 'Urdu'],
        photo: '👨‍✈️',
        available: true,
        currentLocation: 'IIT Hyderabad Main Gate'
    },
    {
        id: 'auto4',
        name: 'Srinivas Rao',
        phone: '+91 9876543211',
        rating: 4.6,
        totalRides: 850,
        vehicleNumber: 'TS 12 D 5678',
        experience: '3 years',
        languages: ['Telugu', 'Hindi'],
        photo: '👨‍✈️',
        available: true,
        currentLocation: 'IIT Hyderabad Main Gate'
    }
];

const autoFares = {
    baseFare: 30,
    ratePerKm: 10,
    destinations: {
        'Patancheru': {
            distance: 30,
            basePrice: 100
        },
        'Isnapur': {
            distance: 20,
            basePrice: 80
        },
        'Miyapur': {
            distance: 45,
            basePrice: 200
        },
        'Hyderabad City': {
            distance: 65,
            basePrice: 500
        }
    }
};

function searchBuses() {
    const travelDate = document.getElementById('travel-date').value;
    const travelTime = document.getElementById('travel-time').value;
    const resultsContainer = document.getElementById('bus-results');
    
    resultsContainer.innerHTML = '';
    
    const searchTimeInMinutes = convertTimeToMinutes(travelTime);
    
    // Add government bus schedule section
    const govBusSection = document.createElement('div');
    govBusSection.className = 'government-bus-section';
    govBusSection.innerHTML = `
        <h3 class="section-title">Government Bus Schedules (TSRTC)</h3>
        <div class="schedule-info">
            <p>Regular services between Sangareddy and major destinations in Hyderabad</p>
        </div>
    `;
    
    governmentBuses.forEach(bus => {
        const busScheduleCard = document.createElement('div');
        busScheduleCard.className = 'bus-card government-bus';
        
        const firstStop = bus.stops[0];
        const lastStop = bus.stops[bus.stops.length - 1];
        const stopsHTML = bus.stops.map(stop => `
            <div class="stop-item ${stop.type.toLowerCase()}">
                <div class="stop-time">${stop.time}</div>
                <div class="stop-name">${stop.name}</div>
                <div class="stop-type">${stop.type}</div>
            </div>
        `).join('');
        
        busScheduleCard.innerHTML = `
            <div class="bus-header">
                <div class="bus-name">${bus.type} (${bus.busNumber})</div>
                <div class="bus-status ${bus.status.toLowerCase().includes('delayed') ? 'delayed' : 'on-time'}">
                    ${bus.status}
                </div>
            </div>
            <div class="bus-details">
                <div class="bus-time departure">
                    <div class="time">${firstStop.time}</div>
                    <div class="location">${firstStop.name}</div>
                </div>
                <div class="bus-duration">
                    <div class="line"></div>
                    <div class="time">Frequency: ${bus.frequency}</div>
                </div>
                <div class="bus-time arrival">
                    <div class="time">${lastStop.time}</div>
                    <div class="location">${lastStop.name}</div>
                </div>
                <div class="bus-price">₹${bus.fare}</div>
            </div>
            <div class="bus-amenities">
                ${bus.amenities.map(amenity => `<div class="amenity">${amenity}</div>`).join('')}
            </div>
            <div class="bus-actions">
                <button class="btn primary view-stops" data-bus-id="${bus.id}">View Stops & Location</button>
                <button class="btn secondary buy-ticket" data-bus-id="${bus.id}">Buy Ticket</button>
            </div>
            <div class="stops-details hidden" id="stops-${bus.id}">
                <div class="current-location">
                    <h4>Current Location</h4>
                    <div class="location-status">
                        <span class="location-dot ${bus.status.toLowerCase().includes('delayed') ? 'delayed' : 'on-time'}"></span>
                        <span>Last seen at: ${bus.stops[Math.floor(bus.stops.length / 2)].name}</span>
                    </div>
                </div>
                <div class="stops-container">
                    <h4>Stops & Timings</h4>
                    <div class="stops-timeline">
                        ${stopsHTML}
                    </div>
                </div>
            </div>
        `;
        
        govBusSection.appendChild(busScheduleCard);
    });
    
    resultsContainer.appendChild(govBusSection);
    
    // Add click event listeners for view stops buttons
    document.querySelectorAll('.view-stops').forEach(button => {
        button.addEventListener('click', function() {
            const busId = this.getAttribute('data-bus-id');
            const stopsDetails = document.getElementById(`stops-${busId}`);
            const allStopsDetails = document.querySelectorAll('.stops-details');
            
            // Close other open stops sections
            allStopsDetails.forEach(detail => {
                if (detail !== stopsDetails && !detail.classList.contains('hidden')) {
                    detail.classList.add('hidden');
                    const otherButton = detail.previousElementSibling.querySelector('.view-stops');
                    if (otherButton) {
                        otherButton.textContent = 'View Stops & Location';
                    }
                }
            });
            
            // Toggle current stops section
            stopsDetails.classList.toggle('hidden');
            this.textContent = stopsDetails.classList.contains('hidden') ? 
                'View Stops & Location' : 'Hide Stops & Location';
        });
    });
    
    // Add click event listeners for buy ticket buttons
    document.querySelectorAll('.buy-ticket').forEach(button => {
        button.addEventListener('click', function() {
            const busId = this.getAttribute('data-bus-id');
            const selectedBus = governmentBuses.find(bus => bus.id === busId);
            if (selectedBus) {
                const booking = {
                    id: 'GOVBUS' + Date.now().toString().slice(-6),
                    type: 'government_bus',
                    busName: `${selectedBus.type} (${selectedBus.busNumber})`,
                    operator: selectedBus.operator,
                    route: selectedBus.route,
                    departureTime: selectedBus.stops[0].time,
                    departureLocation: selectedBus.stops[0].name,
                    arrivalTime: selectedBus.stops[selectedBus.stops.length - 1].time,
                    arrivalLocation: selectedBus.stops[selectedBus.stops.length - 1].name,
                    fare: `₹${selectedBus.fare}`,
                    bookingDate: new Date().toISOString(),
                    status: 'Confirmed'
                };
                
                saveBooking(booking);
                alert(`Booking confirmed! Your booking ID is ${booking.id}`);
            }
        });
    });
    
    // Continue with existing private bus search
    const filteredBuses = buses.filter(bus => {
        const busTimeInMinutes = convertTimeToMinutes(bus.departureTime);
        return Math.abs(busTimeInMinutes - searchTimeInMinutes) <= 120;
    });
    
    if (filteredBuses.length > 0) {
        const privateBusSection = document.createElement('div');
        privateBusSection.className = 'private-bus-section';
        privateBusSection.innerHTML = '<h3 class="section-title">Private Bus Services</h3>';
        resultsContainer.appendChild(privateBusSection);
        
        filteredBuses.forEach(bus => {
            const busCard = document.createElement('div');
            busCard.className = 'bus-card';
            
            const availableSeats = bus.seats.filter(seat => seat.available).length;
            
            busCard.innerHTML = `
                <div class="bus-header">
                    <div class="bus-name">${bus.name}</div>
                    <div class="bus-type">${bus.type}</div>
                </div>
                <div class="bus-details">
                    <div class="bus-time departure">
                        <div class="time">${bus.departureTime}</div>
                        <div class="location">${bus.departureLocation}</div>
                    </div>
                    <div class="bus-duration">
                        <div class="line"></div>
                        <div class="time">45 min</div>
                    </div>
                    <div class="bus-time arrival">
                        <div class="time">${bus.arrivalTime}</div>
                        <div class="location">${bus.arrivalLocation}</div>
                    </div>
                    <div class="bus-price">₹${bus.price}</div>
                </div>
                <div class="bus-amenities">
                    ${bus.amenities.map(amenity => `<div class="amenity">${amenity}</div>`).join('')}
                </div>
                <div class="bus-seat-info">
                    <div class="available-seats">${availableSeats} seats available</div>
                </div>
                <div class="bus-actions">
                    <button class="btn primary select-seats" data-bus-id="${bus.id}">Select Seats</button>
                </div>
            `;
            
            privateBusSection.appendChild(busCard);
        });
    } else {
        resultsContainer.innerHTML = '<p class="empty-message">No buses found for the selected time. Please try a different time.</p>';
    }
    
    // Add click event listeners for select seats buttons
    document.querySelectorAll('.select-seats').forEach(button => {
        button.addEventListener('click', function() {
            const busId = this.getAttribute('data-bus-id');
            const selectedBus = buses.find(bus => bus.id === busId);
            if (selectedBus) {
                openSeatSelectionModal(selectedBus);
            }
        });
    });
}

function convertTimeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function openSeatSelectionModal(bus) {
    const modal = document.getElementById('seat-modal');
    const busDetailsDiv = document.getElementById('modal-bus-details');
    const seatMapDiv = document.getElementById('seat-map');
    const bookingDetailsDiv = document.getElementById('booking-details');
    
    // Reset passenger details
    document.getElementById('passenger-name').value = '';
    document.getElementById('passenger-email').value = '';
    document.getElementById('passenger-phone').value = '';
    
    busDetailsDiv.innerHTML = `
        <h4>${bus.name} (${bus.type})</h4>
        <div class="time-info">
            <span>${bus.departureTime} → ${bus.arrivalTime}</span>
            <span>${bus.departureLocation} → ${bus.arrivalLocation}</span>
        </div>
    `;
    
    seatMapDiv.innerHTML = '';
    bus.seats.forEach(seat => {
        const seatDiv = document.createElement('div');
        seatDiv.className = `seat ${seat.available ? 'available' : 'booked'}`;
        seatDiv.textContent = seat.id;
        seatDiv.setAttribute('data-seat-id', seat.id);
        
        if (seat.available) {
            seatDiv.addEventListener('click', function() {
                document.querySelectorAll('.seat.selected').forEach(s => {
                    s.classList.remove('selected');
                    s.classList.add('available');
                });
                
                this.classList.remove('available');
                this.classList.add('selected');
                
                updateBookingDetails(bus, seat.id);
            });
        }
        
        seatMapDiv.appendChild(seatDiv);
    });
    
    modal.style.display = 'block';
    
    bookingDetailsDiv.innerHTML = '<p>Please select a seat to continue.</p>';
    document.getElementById('total-fare').textContent = '₹0';
}

function updateBookingDetails(bus, seatId) {
    const bookingDetailsDiv = document.getElementById('booking-details');
    const totalFareSpan = document.getElementById('total-fare');
    
    bookingDetailsDiv.innerHTML = `
        <div class="booking-detail-item">
            <span>Bus:</span>
            <span>${bus.name} (${bus.type})</span>
        </div>
        <div class="booking-detail-item">
            <span>Route:</span>
            <span>${bus.departureLocation} → ${bus.arrivalLocation}</span>
        </div>
        <div class="booking-detail-item">
            <span>Time:</span>
            <span>${bus.departureTime} → ${bus.arrivalTime}</span>
        </div>
        <div class="booking-detail-item">
            <span>Seat:</span>
            <span>${seatId}</span>
        </div>
        <div class="booking-detail-item">
            <span>Fare:</span>
            <span>₹${bus.price}</span>
        </div>
    `;
    
    totalFareSpan.textContent = `₹${bus.price}`;
}

function confirmBusBooking() {
    const name = document.getElementById('passenger-name').value;
    const email = document.getElementById('passenger-email').value;
    const phone = document.getElementById('passenger-phone').value;
    
    if (!name || !email || !phone) {
        alert('Please fill in all passenger details');
        return;
    }
    
    const selectedSeat = document.querySelector('.seat.selected');
    if (!selectedSeat) {
        alert('Please select a seat');
        return;
    }
    
    const busDetailsDiv = document.getElementById('modal-bus-details');
    const busName = busDetailsDiv.querySelector('h4').textContent;
    const timeInfo = busDetailsDiv.querySelector('.time-info').textContent;
    const seatId = selectedSeat.getAttribute('data-seat-id');
    const totalFare = document.getElementById('total-fare').textContent;
    
    const booking = {
        id: 'BUS' + Date.now().toString().slice(-6),
        type: 'bus',
        busName: busName,
        timeInfo: timeInfo,
        seat: seatId,
        fare: totalFare,
        passengerName: name,
        passengerEmail: email,
        passengerPhone: phone,
        bookingDate: new Date().toISOString(),
        status: 'Confirmed'
    };
    
    saveBooking(booking);
    
    document.getElementById('seat-modal').style.display = 'none';
    
    alert(`Booking confirmed! Your booking ID is ${booking.id}`);
    
    updateBusSeatAvailability(seatId);
    
    setupTabEventListeners();
}

function updateBusSeatAvailability(seatId) {
    buses.forEach(bus => {
        const seatIndex = bus.seats.findIndex(seat => seat.id == seatId);
        if (seatIndex !== -1) {
            bus.seats[seatIndex].available = false;
        }
    });
}

function searchCarpools() {
    const from = document.getElementById('carpool-from').value;
    const to = document.getElementById('carpool-to').value;
    const date = document.getElementById('carpool-date').value;
    const resultsContainer = document.getElementById('carpool-results');
    
    if (!to) {
        alert('Please enter a destination');
        return;
    }
    
    resultsContainer.innerHTML = '';
    document.getElementById('bus-results').innerHTML = '';
    document.getElementById('travel-date').value = new Date().toISOString().split('T')[0];
    
    const filteredCarpools = carpools.filter(carpool => {
        return carpool.from.toLowerCase().includes(from.toLowerCase()) &&
               carpool.to.toLowerCase().includes(to.toLowerCase()) &&
               carpool.date === date &&
               carpool.availableSeats > 0;
    });
    
    if (filteredCarpools.length === 0) {
        resultsContainer.innerHTML = '<p class="empty-message">No carpools found for your search criteria. Why not offer one?</p>';
        return;
    }
    
    filteredCarpools.forEach(carpool => {
        const carpoolCard = document.createElement('div');
        carpoolCard.className = 'carpool-card';
        
        carpoolCard.innerHTML = `
            <div class="carpool-header">
                <div class="carpool-driver">${carpool.driver}</div>
                <div class="carpool-seats">${carpool.availableSeats} ${carpool.availableSeats === 1 ? 'seat' : 'seats'} available</div>
            </div>
            <div class="carpool-details">
                <div class="carpool-time">
                    <div class="time">${carpool.time}</div>
                    <div class="date">${formatDate(carpool.date)}</div>
                </div>
                <div class="carpool-route">
                    <div class="from">${carpool.from}</div>
                    <div class="arrow">→</div>
                    <div class="to">${carpool.to}</div>
                </div>
                <div class="carpool-price">₹${carpool.pricePerSeat}</div>
            </div>
            <div class="carpool-car-info">
                <div class="car-model">${carpool.carModel}</div>
            </div>
            <div class="carpool-notes">
                <p>${carpool.notes}</p>
            </div>
            <div class="carpool-actions">
                <button class="btn primary request-carpool" data-carpool-id="${carpool.id}">Request to Join</button>
            </div>
        `;
        
        resultsContainer.appendChild(carpoolCard);
    });
    
    document.querySelectorAll('.request-carpool').forEach(button => {
        button.addEventListener('click', function() {
            const carpoolId = this.getAttribute('data-carpool-id');
            const selectedCarpool = carpools.find(carpool => carpool.id === carpoolId);
            openCarpoolModal(selectedCarpool);
        });
    });
    
    setupNavigationLinks();
    setupTabEventListeners();
}

function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function openCarpoolModal(carpool) {
    const modal = document.getElementById('carpool-modal');
    const carpoolDetailsDiv = document.getElementById('modal-carpool-details');
    
    carpoolDetailsDiv.innerHTML = `
        <h4>${carpool.driver}</h4>
        <div class="carpool-info">
            <div class="carpool-detail-item">
                <span>From:</span>
                <span>${carpool.from}</span>
            </div>
            <div class="carpool-detail-item">
                <span>To:</span>
                <span>${carpool.to}</span>
            </div>
            <div class="carpool-detail-item">
                <span>Date:</span>
                <span>${formatDate(carpool.date)}</span>
            </div>
            <div class="carpool-detail-item">
                <span>Time:</span>
                <span>${carpool.time}</span>
            </div>
            <div class="carpool-detail-item">
                <span>Car:</span>
                <span>${carpool.carModel}</span>
            </div>
            <div class="carpool-detail-item">
                <span>Available Seats:</span>
                <span>${carpool.availableSeats}</span>
            </div>
            <div class="carpool-detail-item">
                <span>Price per Seat:</span>
                <span>₹${carpool.pricePerSeat}</span>
            </div>
            <div class="carpool-detail-item">
                <span>Notes:</span>
                <span>${carpool.notes}</span>
            </div>
        </div>
    `;
    
    document.getElementById('carpool-seats').max = carpool.availableSeats;
    
    modal.style.display = 'block';
    
    document.getElementById('request-carpool').setAttribute('data-carpool-id', carpool.id);
}

function requestCarpool() {
    const name = document.getElementById('carpool-passenger-name').value;
    const email = document.getElementById('carpool-passenger-email').value;
    const phone = document.getElementById('carpool-passenger-phone').value;
    const seats = parseInt(document.getElementById('carpool-seats').value);
    const carpoolId = document.getElementById('request-carpool').getAttribute('data-carpool-id');
    
    if (!name || !email || !phone) {
        alert('Please fill in all passenger details');
        return;
    }
    
    const selectedCarpool = carpools.find(carpool => carpool.id === carpoolId);
    
    if (!selectedCarpool) {
        alert('Carpool not found');
        return;
    }
    
    if (seats > selectedCarpool.availableSeats) {
        alert(`Only ${selectedCarpool.availableSeats} seats available`);
        return;
    }
    
    const booking = {
        id: 'CP' + Date.now().toString().slice(-6),
        type: 'carpool',
        carpoolId: selectedCarpool.id,
        carpoolDriver: selectedCarpool.driver,
        carpoolFrom: selectedCarpool.from,
        carpoolTo: selectedCarpool.to,
        carpoolDate: selectedCarpool.date,
        carpoolTime: selectedCarpool.time,
        seats: seats,
        fare: `₹${selectedCarpool.pricePerSeat * seats}`,
        passengerName: name,
        passengerEmail: email,
        passengerPhone: phone,
        bookingDate: new Date().toISOString(),
        status: 'Requested',
        driverContact: selectedCarpool.contact
    };
    
    saveBooking(booking);
    
    selectedCarpool.availableSeats -= seats;
    
    document.getElementById('carpool-modal').style.display = 'none';
    
    alert(`Carpool request sent! Your request ID is ${booking.id}. You'll receive a confirmation shortly. Contact driver at ${selectedCarpool.contact} for any queries.`);
    
    searchCarpools();
    
    setupTabEventListeners();
}

function offerCarpool(e) {
    e.preventDefault();
    
    const from = document.getElementById('offer-from').value;
    const to = document.getElementById('offer-to').value;
    const date = document.getElementById('offer-date').value;
    const time = document.getElementById('offer-time').value;
    
    if (!time) {
        alert('Please select a time for your carpool');
        return;
    }
    
    const seats = document.getElementById('offer-seats').value;
    const price = document.getElementById('offer-price').value;
    const notes = document.getElementById('offer-notes').value;
    
    const carpool = {
        id: 'carpool' + (carpools.length + 1),
        driver: 'You (Owner)',
        from: from,
        to: to,
        date: date,
        time: time,
        availableSeats: parseInt(seats),
        pricePerSeat: parseInt(price),
        carModel: 'Your Car',
        notes: notes || 'No additional notes',
        contact: 'Your Contact'
    };
    
    carpools.push(carpool);
    
    document.getElementById('offer-form').reset();
    document.getElementById('offer-from').value = 'IIT Hyderabad';
    document.getElementById('offer-time').value = '08:00';
    
    alert('Your carpool offer has been posted successfully!');
    
    document.querySelector('.tab-btn[data-tab="find-carpool"]').click();
    
    document.getElementById('carpool-to').value = to;
    document.getElementById('carpool-date').value = date;
    searchCarpools();
    
    setupTabEventListeners();
}

function saveBooking(booking) {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

function loadBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    const busBookingsDiv = document.getElementById('bus-bookings-list');
    const carpoolBookingsDiv = document.getElementById('carpool-bookings-list');
    const autoBookingsDiv = document.getElementById('auto-bookings-list');
    
    // Clear all sections initially
    busBookingsDiv.innerHTML = '';
    carpoolBookingsDiv.innerHTML = '';
    autoBookingsDiv.innerHTML = '';
    
    const busBookings = bookings.filter(booking => (booking.type === 'bus' || booking.type === 'government_bus') && booking.status !== 'Cancelled');
    const carpoolBookings = bookings.filter(booking => booking.type === 'carpool' && booking.status !== 'Cancelled');
    const autoBookings = bookings.filter(booking => booking.type === 'auto' && booking.status !== 'Cancelled');
    
    // Handle bus bookings section
    if (busBookings.length === 0) {
        busBookingsDiv.innerHTML = '<p class="empty-message">You have no bus bookings yet.</p>';
    } else {
        busBookings.forEach(booking => {
            const bookingItem = document.createElement('div');
            bookingItem.className = 'booking-item';
            
            if (booking.type === 'government_bus') {
                bookingItem.innerHTML = `
                    <div class="booking-header">
                        <div class="booking-id">Booking ID: ${booking.id}</div>
                        <div class="booking-status">${booking.status}</div>
                    </div>
                    <div class="booking-details">
                        <h4>${booking.busName}</h4>
                        <div class="booking-info">
                            <div class="booking-info-item">
                                <span>Route: ${booking.route}</span>
                            </div>
                            <div class="booking-info-item">
                                <span>Time: ${booking.departureTime} → ${booking.arrivalTime}</span>
                            </div>
                            <div class="booking-info-item">
                                <span>${booking.departureLocation} → ${booking.arrivalLocation}</span>
                            </div>
                            <div class="booking-info-item">
                                <span>Operator: ${booking.operator}</span>
                            </div>
                            <div class="booking-info-item">
                                <span>Fare: ${booking.fare}</span>
                            </div>
                            <div class="booking-info-item">
                                <span>Booked on: ${new Date(booking.bookingDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <div class="booking-actions">
                        <button class="btn cancel-booking" data-booking-id="${booking.id}" data-booking-type="government_bus">Cancel Booking</button>
                    </div>
                `;
            } else {
                bookingItem.innerHTML = `
                    <div class="booking-header">
                        <div class="booking-id">Booking ID: ${booking.id}</div>
                        <div class="booking-status">${booking.status}</div>
                    </div>
                    <div class="booking-details">
                        <h4>${booking.busName}</h4>
                        <div class="booking-info">
                            <div class="booking-info-item">
                                <span>${booking.timeInfo}</span>
                            </div>
                            <div class="booking-info-item">
                                <span>Seat: ${booking.seat}</span>
                            </div>
                            <div class="booking-info-item">
                                <span>Fare: ${booking.fare}</span>
                            </div>
                            <div class="booking-info-item">
                                <span>Booked on: ${new Date(booking.bookingDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <div class="booking-actions">
                        <button class="btn cancel-booking" data-booking-id="${booking.id}" data-booking-type="bus">Cancel Booking</button>
                    </div>
                `;
            }
            
            busBookingsDiv.appendChild(bookingItem);
        });
    }
    
    // Handle carpool bookings section
    if (carpoolBookings.length === 0) {
        carpoolBookingsDiv.innerHTML = '<p class="empty-message">You have no carpool bookings yet.</p>';
    } else {
        carpoolBookings.forEach(booking => {
            const bookingItem = document.createElement('div');
            bookingItem.className = 'booking-item';
            
            bookingItem.innerHTML = `                <div class="booking-header">
                    <div class="booking-id">Request ID: ${booking.id}</div>
                    <div class="booking-status">${booking.status}</div>
                </div>
                <div class="booking-details">
                    <h4>Carpool with ${booking.carpoolDriver}</h4>
                    <div class="booking-info">
                        <div class="booking-info-item">
                            <span>${booking.carpoolFrom} → ${booking.carpoolTo}</span>
                        </div>
                        <div class="booking-info-item">
                            <span>Date: ${formatDate(booking.carpoolDate)}</span>
                        </div>
                        <div class="booking-info-item">
                            <span>Time: ${booking.carpoolTime}</span>
                        </div>
                        <div class="booking-info-item">
                            <span>Seats: ${booking.seats}</span>
                        </div>
                        <div class="booking-info-item">
                            <span>Fare: ${booking.fare}</span>
                        </div>
                        <div class="booking-info-item">
                            <span>Driver Contact: ${booking.driverContact}</span>
                        </div>
                    </div>
                </div>
                <div class="booking-actions">
                    <button class="btn cancel-booking" data-booking-id="${booking.id}" data-booking-type="carpool">Cancel Booking</button>
                </div>
            `;
            
            carpoolBookingsDiv.appendChild(bookingItem);
        });
    }
    
    // Handle auto bookings section
    if (autoBookings.length === 0) {
        autoBookingsDiv.innerHTML = '<p class="empty-message">You have no auto bookings yet.</p>';
    } else {
        autoBookings.forEach(booking => {
            const bookingItem = document.createElement('div');
            bookingItem.className = 'booking-item';
            
            bookingItem.innerHTML = `
                <div class="booking-header">
                    <div class="booking-id">Booking ID: ${booking.id}</div>
                    <div class="booking-status">${booking.status}</div>
                </div>
                <div class="booking-details">
                    <h4>Auto Ride with ${booking.driverName}</h4>
                    <div class="booking-info">
                        <div class="booking-info-item">
                            <span>From: ${booking.from}</span>
                        </div>
                        <div class="booking-info-item">
                            <span>To: ${booking.to}</span>
                        </div>
                        <div class="booking-info-item">
                            <span>Distance: ${booking.distance} km</span>
                        </div>
                        <div class="booking-info-item">
                            <span>Fare: ₹${booking.fare}</span>
                        </div>
                        <div class="booking-info-item">
                            <span>Driver Contact: ${booking.driverPhone}</span>
                        </div>
                        <div class="booking-info-item">
                            <span>Vehicle Number: ${booking.vehicleNumber}</span>
                        </div>
                        <div class="booking-info-item">
                            <span>Booked on: ${new Date(booking.bookingDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div class="booking-actions">
                    <button class="btn call-driver" onclick="window.location.href='tel:${booking.driverPhone}'">
                        📞 Call Driver
                    </button>
                    <button class="btn cancel-booking" data-booking-id="${booking.id}" data-booking-type="auto">
                        Cancel Booking
                    </button>
                </div>
            `;
            
            autoBookingsDiv.appendChild(bookingItem);
        });
    }
    
    // Add event listeners for cancel buttons
    document.querySelectorAll('.cancel-booking').forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-booking-id');
            const bookingType = this.getAttribute('data-booking-type');
            cancelBooking(bookingId, bookingType);
        });
    });
    
    // Show the active tab content and hide others
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        const tabId = activeTab.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = content.id === tabId ? 'block' : 'none';
        });
    }
}

function cancelBooking(bookingId, bookingType) {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    const bookingIndex = bookings.findIndex(booking => booking.id === bookingId);
    
    if (bookingIndex !== -1) {
        const booking = bookings[bookingIndex];
        
        if (confirm(`Are you sure you want to cancel this ${bookingType === 'government_bus' ? 'government bus' : bookingType} booking?`)) {
            booking.status = 'Cancelled';
            
            if (bookingType === 'bus') {
                const seatId = booking.seat;
                buses.forEach(bus => {
                    const seat = bus.seats.find(s => s.id == seatId);
                    if (seat) {
                        seat.available = true;
                    }
                });
            }
            else if (bookingType === 'carpool') {
                carpools.forEach(carpool => {
                    if (carpool.from === booking.carpoolFrom && 
                        carpool.to === booking.carpoolTo && 
                        carpool.date === booking.carpoolDate && 
                        carpool.time === booking.carpoolTime) {
                        carpool.availableSeats += parseInt(booking.seats);
                    }
                });
            }
            else if (bookingType === 'auto') {
                // Make the auto driver available again
                const driver = autoDrivers.find(d => d.vehicleNumber === booking.vehicleNumber);
                if (driver) {
                    driver.available = true;
                    displayAutoDrivers(); // Refresh the auto drivers display
                }
            }
            
            bookings[bookingIndex] = booking;
            localStorage.setItem('bookings', JSON.stringify(bookings));
            
            loadBookings();
            
            alert('Booking cancelled successfully!');
        }
    }
}

window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

function initializeClockPickers() {
    const timeInputs = document.querySelectorAll('input[type="time"]');
    
    timeInputs.forEach(input => {
        const clockContainer = input.nextElementSibling;
        const hourHand = clockContainer.querySelector('.hour-hand');
        const minuteHand = clockContainer.querySelector('.minute-hand');
        const modeBtns = clockContainer.querySelectorAll('.mode-btn');
        const periodBtns = clockContainer.querySelectorAll('.period-btn');
        const clockFace = clockContainer.querySelector('.analog-clock');
        
        let currentMode = 'hours';
        let currentPeriod = 'AM';
        let selectedHour = 12;
        let selectedMinute = 0;
        
        // Create clock marks and numbers
        createClockMarks(clockContainer);
        
        // Function to set clock hands position
        function setClockHandsPosition(hour24, minutes) {
            // Convert 24-hour to 12-hour format
            const hour12 = hour24 % 12 || 12;
            
            // Hour hand makes a complete 360° rotation in 12 hours (30° per hour)
            // For precise position, we add a small angle for minutes (30° / 60 = 0.5° per minute)
            const hourAngle = (hour12 * 30) + (minutes * 0.5);
            
            // Minute hand makes a complete 360° rotation in 60 minutes (6° per minute)
            const minuteAngle = minutes * 6;
            
            hourHand.style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
            minuteHand.style.transform = `translateX(-50%) rotate(${minuteAngle}deg)`;
            
            // Update state
            selectedHour = hour12;
            selectedMinute = minutes;
            currentPeriod = hour24 >= 12 ? 'PM' : 'AM';
            
            // Update period buttons
            periodBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.period === currentPeriod);
            });
        }
        
        // Initialize clock state
        function initializeClockState() {
            if (input.value) {
                const [hours, minutes] = input.value.split(':').map(Number);
                setClockHandsPosition(hours, minutes);
            }
        }
        
        // Initialize on page load
        initializeClockState();
        
        // Show clock on input click
        input.addEventListener('click', () => {
            document.querySelectorAll('.clock-container').forEach(container => {
                if (container !== clockContainer) {
                    container.classList.remove('show');
                }
            });
            
            clockContainer.classList.toggle('show');
            
            // Reset to hours mode when opening
            currentMode = 'hours';
            modeBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === 'hours');
            });
            
            // Show hour numbers initially
            const hourNumbers = clockFace.querySelectorAll('.hour-number');
            const minuteNumbers = clockFace.querySelectorAll('.minute-number');
            hourNumbers.forEach(num => num.style.display = 'flex');
            minuteNumbers.forEach(num => num.style.display = 'none');
            
            // Initialize clock state
            initializeClockState();
        });
        
        // Mode switching
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMode = btn.dataset.mode;
                
                // Toggle number visibility based on mode
                const hourNumbers = clockFace.querySelectorAll('.hour-number');
                const minuteNumbers = clockFace.querySelectorAll('.minute-number');
                
                if (currentMode === 'hours') {
                    hourNumbers.forEach(num => num.style.display = 'flex');
                    minuteNumbers.forEach(num => num.style.display = 'none');
                } else {
                    hourNumbers.forEach(num => num.style.display = 'none');
                    minuteNumbers.forEach(num => num.style.display = 'flex');
                }
            });
        });
        
        // Period switching
        periodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                periodBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentPeriod = btn.dataset.period;
                updateTimeInput();
            });
        });
        
        function createClockMarks(container) {
            const clockMarks = container.querySelector('.clock-marks');
            const analog = container.querySelector('.analog-clock');
            
            // Clear existing content
            clockMarks.innerHTML = '';
            const existingNumbers = analog.querySelectorAll('.clock-number');
            existingNumbers.forEach(num => num.remove());
            
            // Create numbers for hours and minutes
            for (let i = 1; i <= 12; i++) {
                // Create hour number
                const hourNumber = document.createElement('div');
                hourNumber.className = 'clock-number hour-number';
                hourNumber.textContent = i;
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const radius = 80;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                hourNumber.style.position = 'absolute';
                hourNumber.style.left = `calc(50% + ${x}px)`;
                hourNumber.style.top = `calc(50% + ${y}px)`;
                hourNumber.style.transform = 'translate(-50%, -50%)';
                
                // Add click handler for hour numbers
                hourNumber.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (currentMode === 'hours') {
                        selectedHour = i;
                        const hourAngle = (i * 30) + (selectedMinute * 0.5);
                        hourHand.style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
                        updateTimeInput();
                        
                        // Automatically switch to minutes after selecting hour
                        const minuteBtn = container.querySelector('.mode-btn[data-mode="minutes"]');
                        minuteBtn.click();
                    }
                });
                
                analog.appendChild(hourNumber);
                
                // Create minute number (showing minutes in increments of 5)
                const minuteValue = i * 5;
                const minuteNumber = document.createElement('div');
                minuteNumber.className = 'clock-number minute-number';
                minuteNumber.textContent = minuteValue.toString().padStart(2, '0');
                minuteNumber.style.position = 'absolute';
                minuteNumber.style.left = `calc(50% + ${x}px)`;
                minuteNumber.style.top = `calc(50% + ${y}px)`;
                minuteNumber.style.transform = 'translate(-50%, -50%)';
                
                // Add click handler for minute numbers
                minuteNumber.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (currentMode === 'minutes') {
                        selectedMinute = minuteValue;
                        const minuteAngle = minuteValue * 6;
                        const hourAngle = (selectedHour * 30) + (minuteValue * 0.5);
                        minuteHand.style.transform = `translateX(-50%) rotate(${minuteAngle}deg)`;
                        hourHand.style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
                        updateTimeInput();
                        
                        // Hide the clock after selecting minutes
                        clockContainer.classList.remove('show');
                    }
                });
                
                analog.appendChild(minuteNumber);
            }
        }
        
        function updateTimeInput() {
            let hours = selectedHour;
            if (currentPeriod === 'PM' && hours !== 12) hours += 12;
            if (currentPeriod === 'AM' && hours === 12) hours = 0;
            
            input.value = `${String(hours).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
            
            // Update clock hands after changing the input value
            const [h, m] = input.value.split(':').map(Number);
            setClockHandsPosition(h, m);
        }
        
        // Close clock when clicking outside
        document.addEventListener('click', (e) => {
            if (!clockContainer.contains(e.target) && !input.contains(e.target)) {
                clockContainer.classList.remove('show');
            }
        });
    });
}

function calculateAutoFare(destination) {
    const fareInfo = autoFares.destinations[destination];
    if (!fareInfo) return null;
    
    const baseFare = autoFares.baseFare;
    const distanceCharge = fareInfo.distance * autoFares.ratePerKm;
    const totalFare = Math.max(fareInfo.basePrice, baseFare + distanceCharge);
    
    return {
        baseFare: baseFare,
        distance: fareInfo.distance,
        distanceCharge: distanceCharge,
        totalFare: totalFare
    };
}

function searchAutos() {
    const destination = document.getElementById('auto-destination').value;
    const resultsContainer = document.getElementById('auto-results');
    
    if (!destination) {
        alert('Please select a destination');
        return;
    }
    
    const fareDetails = calculateAutoFare(destination);
    if (!fareDetails) {
        resultsContainer.innerHTML = '<p class="empty-message">No fare information available for this route. Please select from popular destinations.</p>';
        return;
    }
    
    resultsContainer.innerHTML = `
        <div class="fare-details">
            <h3>Fare Details for ${destination}</h3>
            <div class="fare-breakdown">
                <div class="fare-item">
                    <span>Base Fare:</span>
                    <span>₹${fareDetails.baseFare}</span>
                </div>
                <div class="fare-item">
                    <span>Distance:</span>
                    <span>${fareDetails.distance} km</span>
                </div>
                <div class="fare-item">
                    <span>Distance Charge:</span>
                    <span>₹${fareDetails.distanceCharge}</span>
                </div>
                <div class="fare-item total">
                    <span>Total Fare:</span>
                    <span>₹${fareDetails.totalFare}</span>
                </div>
            </div>
            <p class="fare-note">* Actual fare may vary slightly based on traffic and route conditions</p>
        </div>
    `;
    
    // Scroll to available drivers section
    document.querySelector('.available-drivers-section').scrollIntoView({ behavior: 'smooth' });
}

function displayAutoDrivers() {
    const driversContainer = document.getElementById('auto-drivers');
    
    driversContainer.innerHTML = autoDrivers.map(driver => `
        <div class="driver-card ${driver.available ? 'available' : 'busy'}">
            <div class="driver-photo">${driver.photo}</div>
            <div class="driver-info">
                <h4 class="driver-name">${driver.name}</h4>
                <div class="driver-rating">
                    <span class="stars">${'⭐'.repeat(Math.floor(driver.rating))}</span>
                    <span class="rating-value">${driver.rating}</span>
                    <span class="total-rides">(${driver.totalRides} rides)</span>
                </div>
                <div class="driver-details">
                    <div class="detail-item">
                        <span class="label">Vehicle:</span>
                        <span>${driver.vehicleNumber}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Experience:</span>
                        <span>${driver.experience}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Languages:</span>
                        <span>${driver.languages.join(', ')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Current Location:</span>
                        <span>${driver.currentLocation}</span>
                    </div>
                </div>
            </div>
            <div class="driver-actions">
                <button class="btn primary call-driver" data-driver-id="${driver.id}">
                    📞 Call Driver
                </button>
                <button class="btn secondary book-auto" data-driver-id="${driver.id}">
                    Book Auto
                </button>
            </div>
        </div>
    `).join('');
}

function openAutoBookingModal(driver) {
    const modal = document.getElementById('auto-modal');
    const autoDetailsDiv = document.getElementById('modal-auto-details');
    
    // Reset passenger details
    document.getElementById('auto-passenger-name').value = '';
    document.getElementById('auto-passenger-phone').value = '';
    document.getElementById('modal-auto-destination').value = '';
    
    // Display driver details
    autoDetailsDiv.innerHTML = `
        <div class="driver-info-summary">
            <div class="driver-photo">${driver.photo}</div>
            <div class="driver-basic-info">
                <h4>${driver.name}</h4>
                <div class="driver-rating">
                    <span class="stars">${'⭐'.repeat(Math.floor(driver.rating))}</span>
                    <span class="rating-value">${driver.rating}</span>
                </div>
                <div class="vehicle-info">
                    <span>Vehicle: ${driver.vehicleNumber}</span>
                </div>
            </div>
        </div>
    `;
    
    // Store driver ID for booking
    modal.setAttribute('data-driver-id', driver.id);
    
    // Show the modal
    modal.style.display = 'block';
    
    // Reset booking details
    updateAutoBookingDetails();
}

function updateAutoBookingDetails() {
    const destination = document.getElementById('modal-auto-destination').value;
    const bookingDetailsDiv = document.getElementById('auto-booking-details');
    const totalFareSpan = document.getElementById('auto-total-fare');
    
    if (!destination) {
        bookingDetailsDiv.innerHTML = '<p>Please select a destination to see fare details.</p>';
        totalFareSpan.textContent = '₹0';
        return;
    }
    
    const fareDetails = calculateAutoFare(destination);
    
    bookingDetailsDiv.innerHTML = `
        <div class="fare-breakdown">
            <div class="fare-item">
                <span>Base Fare:</span>
                <span>₹${fareDetails.baseFare}</span>
            </div>
            <div class="fare-item">
                <span>Distance:</span>
                <span>${fareDetails.distance} km</span>
            </div>
            <div class="fare-item">
                <span>Distance Charge:</span>
                <span>₹${fareDetails.distanceCharge}</span>
            </div>
        </div>
    `;
    
    totalFareSpan.textContent = `₹${fareDetails.totalFare}`;
}

function confirmAutoBooking() {
    const name = document.getElementById('auto-passenger-name').value;
    const phone = document.getElementById('auto-passenger-phone').value;
    const destination = document.getElementById('modal-auto-destination').value;
    
    if (!name || !phone || !destination) {
        alert('Please fill in all booking details');
        return;
    }
    
    const modal = document.getElementById('auto-modal');
    const driverId = modal.getAttribute('data-driver-id');
    const driver = autoDrivers.find(d => d.id === driverId);
    const fareDetails = calculateAutoFare(destination);
    
    if (!driver || !fareDetails) {
        alert('Something went wrong. Please try again.');
        return;
    }
    
    const booking = {
        id: 'AUTO' + Date.now().toString().slice(-6),
        type: 'auto',
        driverName: driver.name,
        driverPhone: driver.phone,
        vehicleNumber: driver.vehicleNumber,
        passengerName: name,
        passengerPhone: phone,
        from: 'IIT Hyderabad',
        to: destination,
        fare: fareDetails.totalFare,
        distance: fareDetails.distance,
        bookingDate: new Date().toISOString(),
        status: 'Confirmed'
    };
    
    saveBooking(booking);
    
    modal.style.display = 'none';
    
    alert(`Auto booking confirmed!\nBooking ID: ${booking.id}\nDriver: ${driver.name}\nContact: ${driver.phone}`);
    
    // Update driver availability
    driver.available = false;
    displayAutoDrivers();
}
