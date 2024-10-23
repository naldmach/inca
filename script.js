// Sample property listings
const listings = [
    {
        image: 'your-image1.jpg',
        title: 'Comfy and Homey Space - Azure North',
        location: 'San Fernando, Pampanga',
        price: '₱2,530/night',
        link: 'https://www.airbnb.com/rooms/example1'
    },
    {
        image: 'your-image2.jpg',
        title: 'Modern & Minimalist Space - Azure North',
        location: 'San Fernando, Pampanga',
        price: '₱2,299/night',
        link: 'https://www.airbnb.com/rooms/example2'
    },
    // Add more listings as needed
];

// Render property listings dynamically
const cardContainer = document.getElementById('card-container');
listings.forEach(listing => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <img src="${listing.image}" alt="${listing.title}">
        <h3>${listing.title}</h3>
        <p>${listing.location}</p>
        <p>${listing.price}</p>
        <a href="${listing.link}" class="btn" target="_blank">View More</a>
    `;
    cardContainer.appendChild(card);
});

// Contact Form submission
document.getElementById('contactForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission

    const name = document.getElementById('name').value;
    const message = document.getElementById('message').value;

    // Simulate sending the message
    simulateSendMessage(name, message);
});

// Simulate sending the message
function simulateSendMessage(name, message) {
    // Here you would typically send data to a server via AJAX or Fetch API.
    // For simulation, we just create a delay to mock the server request.
    
    setTimeout(() => {
        showNotification(`Message from ${name} has been sent!`);
    }, 1000);
}

// Show notification
function showNotification(message) {
    const notificationElement = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');

    notificationMessage.textContent = message;
    notificationElement.classList.remove('hidden');

    // Automatically hide the notification after 3 seconds
    setTimeout(() => {
        notificationElement.classList.add('hidden');
    }, 3000);
}

// Close notification manually
function closeNotification() {
    document.getElementById('notification').classList.add('hidden');
}
