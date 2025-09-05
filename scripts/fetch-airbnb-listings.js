// Script to help identify Airbnb listing IDs from a host's profile
// Note: This is a helper script - you'll need to manually visit the URLs to get the IDs

const hostId = "126012540";
const hostProfileUrl = `https://www.airbnb.com/users/show/${hostId}`;

console.log("=================================");
console.log("Airbnb Listing ID Collection Guide");
console.log("=================================\n");

console.log(`1. Visit the host profile: ${hostProfileUrl}`);
console.log('2. Look for the "Listings" section on the profile');
console.log("3. Click on each listing to open it");
console.log("4. Copy the ID from the URL (airbnb.com/rooms/XXXXXXXX)");
console.log("5. Fill in the IDs below:\n");

// Template for collecting listing information
const listingTemplate = `
// Example listing data structure
const listings = [
  {
    propertyTitle: "Property Name from Your System",
    airbnbId: "XXXXXXXX", // Replace with actual Airbnb ID
    airbnbUrl: "https://www.airbnb.com/rooms/XXXXXXXX"
  },
  // Add more listings as needed
];

// SQL to update your database
listings.forEach(listing => {
  console.log(\`
UPDATE properties 
SET airbnb_id = '\${listing.airbnbId}', airbnb_synced = true 
WHERE title = '\${listing.propertyTitle}';
  \`);
});
`;

console.log("Template for your listings:");
console.log(listingTemplate);

console.log("\n=================================");
console.log("Manual Steps Required:");
console.log("=================================");
console.log("1. Visit each listing URL from the client's profile");
console.log("2. Copy the listing ID from the URL");
console.log("3. Match it with the corresponding property in your system");
console.log("4. Update using either:");
console.log("   a) Admin panel at http://localhost:3000/admin/airbnb");
console.log("   b) SQL queries in Supabase");
console.log("\n");

// Helper to generate SQL updates
console.log("Once you have the IDs, use this SQL template in Supabase:\n");
console.log(`
-- Example SQL to update multiple properties at once
UPDATE properties SET 
  airbnb_id = CASE title
    WHEN 'Your Property Title 1' THEN 'airbnb_id_1'
    WHEN 'Your Property Title 2' THEN 'airbnb_id_2'
    WHEN 'Your Property Title 3' THEN 'airbnb_id_3'
    -- Add more as needed
  END,
  airbnb_synced = true
WHERE title IN ('Your Property Title 1', 'Your Property Title 2', 'Your Property Title 3');
`);
