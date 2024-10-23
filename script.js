document.addEventListener("DOMContentLoaded", () => {
    const listings = [
        { title: "Cozy Apartment Downtown", link: "https://www.airbnb.com/rooms/1" },
        { title: "Beach House Getaway", link: "https://www.airbnb.com/rooms/2" },
        { title: "Mountain Cabin Retreat", link: "https://www.airbnb.com/rooms/3" },
        { title: "Luxury City Penthouse", link: "https://www.airbnb.com/rooms/4" },
        { title: "Quiet Countryside Cottage", link: "https://www.airbnb.com/rooms/5" },
        { title: "Modern Loft", link: "https://www.airbnb.com/rooms/6" },
        { title: "Rustic Farmhouse", link: "https://www.airbnb.com/rooms/7" },
        { title: "Urban Studio", link: "https://www.airbnb.com/rooms/8" },
        { title: "Seaside Villa", link: "https://www.airbnb.com/rooms/9" },
        { title: "Forest Treehouse", link: "https://www.airbnb.com/rooms/10" },
        { title: "Country Manor", link: "https://www.airbnb.com/rooms/11" },
        { title: "Lakefront Bungalow", link: "https://www.airbnb.com/rooms/12" }
    ];

    const listingContainer = document.getElementById('listing-container');
    
    listings.forEach((listing) => {
        const listingDiv = document.createElement('div');
        listingDiv.className = 'listing';
        listingDiv.innerHTML = `<h3>${listing.title}</h3><a href="${listing.link}" target="_blank">View on Airbnb</a>`;
        listingContainer.appendChild(listingDiv);
    });
});

function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}
