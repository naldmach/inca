document.addEventListener('DOMContentLoaded', function () {
    const listings = [
        {
            image: 'listing1.jpg',
            title: 'Comfy and Homey Space - Azure North',
            location: 'San Fernando, Pampanga',
            price: '₱2,530/night',
            link: 'https://www.airbnb.com/link1'
        },
        {
            image: 'listing2.jpg',
            title: 'Modern & Minimalist Space - Azure North',
            location: 'San Fernando, Pampanga',
            price: '₱2,299/night',
            link: 'https://www.airbnb.com/link2'
        },
        {
            image: 'listing3.jpg',
            title: 'A Holiday Space - Azure North',
            location: 'San Fernando, Pampanga',
            price: '₱1,840/night',
            link: 'https://www.airbnb.com/link3'
        },
        {
            image: 'listing4.jpg',
            title: 'Urban Residences - Azure',
            location: 'Parañaque, Metro Manila',
            price: '₱5,750/night',
            link: 'https://www.airbnb.com/link4'
        }
    ];

    const cardContainer = document.getElementById('card-container');

    listings.forEach(listing => {
        const card = document.createElement('div');
        card.classList.add('card');

        card.innerHTML = `
            <a href="${listing.link}" target="_blank">
                <img src="${listing.image}" alt="${listing.title}">
                <div class="card-body">
                    <h3>${listing.title}</h3>
                    <p>${listing.location}</p>
                    <p class="price">${listing.price}</p>
                </div>
            </a>
        `;

        cardContainer.appendChild(card);
    });
});
