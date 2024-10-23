// Sample property listings
const listings = [
    {
        image: 'assets/azure-north-1.jpg',
        title: 'Comfy and Homey Space - Azure North',
        location: 'San Fernando, Pampanga',
        price: '₱2,530/night',
        link: 'https://www.airbnb.com/rooms/1182344741925082227?check_in=2024-07-25&check_out=2024-07-27&guests=1&adults=1&s=67&unique_share_id=5767ebf1-a584-4e58-8fd7-2593f25dca17&fbclid=IwY2xjawGFXXdleHRuA2FlbQIxMQABHTvgNz2JYQCsvYAB2XgMQ8IQqgeweiDX0YLZoVqsViBq_hcWbxT6lsti5Q_aem_ZfSq117TOpeWFg39-h-Iog&source_impression_id=p3_1729658408_P3Ery6HHwIp6RjRu'
    },
    {
        image: 'assets/modern-minimalist-azure.jpg',
        title: 'Modern & Minimalist Space - Azure North',
        location: 'San Fernando, Pampanga',
        price: '₱2,299/night',
        link: 'https://www.airbnb.com/rooms/example2'
    },
    {
        image: 'assets/urban-residences-azure.webp',
        title: 'Exquisite Condo - Azure Parañaque',
        location: 'Parañaque City',
        price: '₱5,750/night',
        link: 'https://www.airbnb.com/rooms/23785553?check_in=2024-11-01&check_out=2024-11-02&guests=1&adults=1&s=67&unique_share_id=e44b6ac0-e769-49d7-828e-771a48897f15'
    },
    {
        image: 'assets/mandaluyong-azure.webp',
        title: 'Acqua Private Residences',
        location: 'Mandaluyong City',
        price: '₱2,404/night',
        link: 'https://www.airbnb.com/rooms/998150245136716390?check_in=2024-11-01&check_out=2024-11-02&guests=1&adults=1&s=67&unique_share_id=d3905b22-6bf0-493c-b93e-6802e4d90a64'
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
