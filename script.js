// JavaScript to dynamically create property listings
const propertyList = document.getElementById('property-list');

const listings = [
    { name: 'Luxury Villa', price: '$200/night', link: 'https://www.airbnb.com/rooms/123456' },
    { name: 'Cozy Cottage', price: '$150/night', link: 'https://www.airbnb.com/rooms/234567' },
    { name: 'Beachfront Bungalow', price: '$180/night', link: 'https://www.airbnb.com/rooms/345678' },
    { name: 'City Apartment', price: '$120/night', link: 'https://www.airbnb.com/rooms/456789' },
    { name: 'Mountain Cabin', price: '$130/night', link: 'https://www.airbnb.com/rooms/567890' },
    { name: 'Modern Condo', price: '$140/night', link: 'https://www.airbnb.com/rooms/678901' },
    { name: 'Rustic Barn', price: '$90/night', link: 'https://www.airbnb.com/rooms/789012' },
    { name: 'Downtown Loft', price: '$170/night', link: 'https://www.airbnb.com/rooms/890123' },
    { name: 'Lakehouse Retreat', price: '$210/night', link: 'https://www.airbnb.com/rooms/901234' },
    { name: 'Countryside Cottage', price: '$160/night', link: 'https://www.airbnb.com/rooms/912345' },
    { name: 'Luxury Penthouse', price: '$300/night', link: 'https://www.airbnb.com/rooms/101234' },
    { name: 'Charming Chalet', price: '$140/night', link: 'https://www.airbnb.com/rooms/112345' }
];

function loadListings() {
    listings.forEach(listing => {
        const propertyCard = document.createElement('div');
        propertyCard.classList.add('property-card');
        propertyCard.innerHTML = `
            <h3>${listing.name}</h3>
            <p>Price: ${listing.price}</p>
            <a href="${listing.link}" target="_blank">View Listing</a>
        `;
        propertyList.appendChild(propertyCard);
    });
}

loadListings();

// Hamburger menu toggle
const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('menu');

menuBtn.addEventListener('click', () => {
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
});

// Logo redirect to homepage
const logo = document.getElementById('logo');
logo.addEventListener('click', () => {
    window.scrollTo(0, 0);
});
