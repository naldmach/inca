// Automated Airbnb Listings Scraper
// This script will fetch all listing IDs from the client's Airbnb profile

const https = require("https");
const fs = require("fs");
const path = require("path");

// Configuration
const HOST_ID = "126012540";
const HOST_URL = `https://www.airbnb.com/users/show/${HOST_ID}`;

// Function to fetch HTML content
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

// Function to extract listing IDs from HTML
function extractListingIds(html) {
  const listings = [];

  // Pattern to find Airbnb room URLs in the HTML
  const roomPattern = /\/rooms\/(\d+)/g;
  const matches = html.matchAll(roomPattern);

  const uniqueIds = new Set();
  for (const match of matches) {
    uniqueIds.add(match[1]);
  }

  // Convert to array with full URLs
  uniqueIds.forEach((id) => {
    listings.push({
      id: id,
      url: `https://www.airbnb.com/rooms/${id}`,
    });
  });

  return listings;
}

// Function to fetch listing details
async function fetchListingDetails(listingId) {
  const url = `https://www.airbnb.com/rooms/${listingId}`;
  try {
    const html = await fetchPage(url);

    // Extract title from the HTML
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch
      ? titleMatch[1].replace(" - Airbnb", "").trim()
      : "Unknown Property";

    // Try to extract price
    const priceMatch = html.match(/\$(\d+)\s*(?:per night|\/night)/i);
    const price = priceMatch ? priceMatch[1] : null;

    return {
      id: listingId,
      title: title,
      price: price,
      url: url,
    };
  } catch (error) {
    console.error(
      `Error fetching details for listing ${listingId}:`,
      error.message
    );
    return {
      id: listingId,
      title: "Unknown Property",
      price: null,
      url: url,
    };
  }
}

// Main function
async function scrapeAirbnbListings() {
  console.log("🔍 Starting Airbnb Listings Scraper...\n");
  console.log(`Host Profile: ${HOST_URL}\n`);

  try {
    console.log("📥 Fetching host profile page...");
    const html = await fetchPage(HOST_URL);

    console.log("🔎 Extracting listing IDs...");
    const listings = extractListingIds(html);

    if (listings.length === 0) {
      console.log(
        "❌ No listings found. The host might not have any active listings."
      );
      return;
    }

    console.log(`✅ Found ${listings.length} listing(s)\n`);

    // Fetch details for each listing
    console.log("📋 Fetching listing details...\n");
    const detailedListings = [];

    for (let i = 0; i < listings.length; i++) {
      console.log(`Processing listing ${i + 1}/${listings.length}...`);
      const details = await fetchListingDetails(listings[i].id);
      detailedListings.push(details);

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Display results
    console.log("\n=================================");
    console.log("📊 SCRAPED LISTINGS");
    console.log("=================================\n");

    detailedListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title}`);
      console.log(`   ID: ${listing.id}`);
      if (listing.price) {
        console.log(`   Price: $${listing.price}/night`);
      }
      console.log(`   URL: ${listing.url}\n`);
    });

    // Generate SQL update statements
    console.log("=================================");
    console.log("📝 SQL UPDATE STATEMENTS");
    console.log("=================================\n");
    console.log("Copy and paste these into Supabase SQL Editor:\n");

    detailedListings.forEach((listing, index) => {
      console.log(`-- Update for listing ${index + 1}: ${listing.title}`);
      console.log(`UPDATE properties`);
      console.log(`SET airbnb_id = '${listing.id}', airbnb_synced = true`);
      console.log(
        `WHERE id = ${index + 1}; -- Update with correct property ID\n`
      );
    });

    // Save to JSON file
    const outputPath = path.join(__dirname, "airbnb-listings.json");
    fs.writeFileSync(outputPath, JSON.stringify(detailedListings, null, 2));
    console.log(`💾 Results saved to: ${outputPath}\n`);

    // Generate a CSV for easy import
    const csvPath = path.join(__dirname, "airbnb-listings.csv");
    const csvContent =
      "ID,Title,Price,URL\n" +
      detailedListings
        .map((l) => `${l.id},"${l.title}",${l.price || ""},${l.url}`)
        .join("\n");
    fs.writeFileSync(csvPath, csvContent);
    console.log(`📄 CSV saved to: ${csvPath}\n`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\nTroubleshooting tips:");
    console.log("1. Make sure you have an internet connection");
    console.log("2. The Airbnb profile might be private or unavailable");
    console.log("3. Airbnb might be blocking automated requests");
  }
}

// Run the scraper
scrapeAirbnbListings();
