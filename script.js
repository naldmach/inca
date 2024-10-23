// Sample property listings
const listings = [
    {
        image: 'assets/azure-north-1.jpg',
        title: 'Comfy and Homey Space - Azure North',
        location: 'San Fernando, Pampanga',
        price: '₱2,530/night',
        link: 'https://www.airbnb.com/rooms/example1'
    },
    {
        image: 'assets/modern-minimalist-azure.jpg',
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

    // Construct the email content
    const mailtoLink = `mailto:machondonald@gmail.com?subject=Message from ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}`;

    // Open the email client
    window.location.href = mailtoLink;
});
