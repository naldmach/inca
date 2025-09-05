// Advanced Airbnb Listings Scraper using Puppeteer
// This provides more reliable scraping of dynamic content

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Configuration
const HOST_ID = "126012540";
const HOST_URL = `https://www.airbnb.com/users/show/${HOST_ID}`;

async function scrapeWithPuppeteer() {
  console.log("🚀 Starting Advanced Airbnb Scraper...\n");

  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set user agent to avoid detection
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log(`📥 Navigating to: ${HOST_URL}`);
    await page.goto(HOST_URL, { waitUntil: "networkidle2", timeout: 30000 });

    // Wait for content to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log("🔍 Extracting listing information...\n");

    // Extract listings from the page
    const listings = await page.evaluate(() => {
      const results = [];

      // Look for listing links
      const links = document.querySelectorAll('a[href*="/rooms/"]');
      const uniqueIds = new Set();

      links.forEach((link) => {
        const href = link.getAttribute("href");
        const match = href.match(/\/rooms\/(\d+)/);
        if (match && match[1]) {
          uniqueIds.add(match[1]);
        }
      });

      // Convert to array with details
      uniqueIds.forEach((id) => {
        // Try to find the listing card for this ID
        const listingCard = document.querySelector(`a[href*="/rooms/${id}"]`);
        let title = "Unknown Property";
        let price = null;

        if (listingCard) {
          // Try to extract title
          const titleElement = listingCard.querySelector(
            '[class*="title"], [class*="name"], h3, h4'
          );
          if (titleElement) {
            title = titleElement.textContent.trim();
          }

          // Try to extract price
          const priceElements = listingCard.querySelectorAll("span");
          priceElements.forEach((el) => {
            if (el.textContent.includes("$")) {
              const priceMatch = el.textContent.match(/\$(\d+)/);
              if (priceMatch && !price) {
                price = priceMatch[1];
              }
            }
          });
        }

        results.push({
          id: id,
          title: title,
          price: price,
          url: `https://www.airbnb.com/rooms/${id}`,
        });
      });

      return results;
    });

    if (listings.length === 0) {
      console.log("⚠️  No listings found on the profile page.");
      console.log("Trying alternative method...\n");

      // Try clicking on "Show all" or "View listings" button if it exists
      try {
        const buttons = await page.$$("button");
        for (const button of buttons) {
          const text = await page.evaluate((el) => el.textContent, button);
          if (
            text &&
            (text.includes("Show all") || text.includes("View listings"))
          ) {
            await button.click();
            break;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Re-extract after clicking
        const moreListings = await page.evaluate(() => {
          const results = [];
          const links = document.querySelectorAll('a[href*="/rooms/"]');
          const uniqueIds = new Set();

          links.forEach((link) => {
            const href = link.getAttribute("href");
            const match = href.match(/\/rooms\/(\d+)/);
            if (match && match[1]) {
              uniqueIds.add(match[1]);
            }
          });

          uniqueIds.forEach((id) => {
            results.push({
              id: id,
              url: `https://www.airbnb.com/rooms/${id}`,
            });
          });

          return results;
        });

        if (moreListings.length > 0) {
          listings.push(...moreListings);
        }
      } catch (e) {
        // Button not found or click failed
      }
    }

    console.log(`✅ Found ${listings.length} listing(s)\n`);

    // Fetch additional details for each listing
    console.log("📋 Fetching detailed information for each listing...\n");

    for (let i = 0; i < listings.length; i++) {
      const listing = listings[i];
      console.log(`Processing ${i + 1}/${listings.length}: ${listing.url}`);

      try {
        await page.goto(listing.url, {
          waitUntil: "networkidle2",
          timeout: 30000,
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Extract detailed information
        const details = await page.evaluate(() => {
          // Get title
          const titleElement = document.querySelector(
            'h1, [data-section-id="TITLE_DEFAULT"] h2'
          );
          const title = titleElement
            ? titleElement.textContent.trim()
            : "Unknown Property";

          // Get price
          let price = null;
          const priceElements = document.querySelectorAll("span, div");
          priceElements.forEach((el) => {
            if (
              el.textContent.includes("$") &&
              el.textContent.includes("night")
            ) {
              const priceMatch = el.textContent.match(/\$(\d+)/);
              if (priceMatch && !price) {
                price = priceMatch[1];
              }
            }
          });

          // Get location
          const locationElement = document.querySelector(
            '[class*="location"], [data-section-id="LOCATION_DEFAULT"]'
          );
          const location = locationElement
            ? locationElement.textContent.trim()
            : null;

          // Get number of guests, bedrooms, bathrooms
          let guests = null,
            bedrooms = null,
            bathrooms = null;
          const statsElements = document.querySelectorAll(
            '[class*="guest"], [class*="bedroom"], [class*="bath"]'
          );
          statsElements.forEach((el) => {
            const text = el.textContent;
            if (text.includes("guest")) {
              const match = text.match(/(\d+)/);
              if (match) guests = match[1];
            }
            if (text.includes("bedroom")) {
              const match = text.match(/(\d+)/);
              if (match) bedrooms = match[1];
            }
            if (text.includes("bath")) {
              const match = text.match(/(\d+)/);
              if (match) bathrooms = match[1];
            }
          });

          return { title, price, location, guests, bedrooms, bathrooms };
        });

        // Update listing with details
        listings[i] = { ...listing, ...details };
      } catch (error) {
        console.log(`  ⚠️  Could not fetch details: ${error.message}`);
      }

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Display results
    console.log("\n=================================");
    console.log("📊 SCRAPED AIRBNB LISTINGS");
    console.log("=================================\n");

    listings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title || "Unknown Property"}`);
      console.log(`   Airbnb ID: ${listing.id}`);
      if (listing.price) console.log(`   Price: $${listing.price}/night`);
      if (listing.location) console.log(`   Location: ${listing.location}`);
      if (listing.guests)
        console.log(
          `   Capacity: ${listing.guests} guests, ${
            listing.bedrooms || "?"
          } bed, ${listing.bathrooms || "?"} bath`
        );
      console.log(`   URL: ${listing.url}\n`);
    });

    // Generate SQL statements
    console.log("=================================");
    console.log("📝 SQL UPDATE STATEMENTS");
    console.log("=================================\n");
    console.log("-- Copy and paste these into Supabase SQL Editor:\n");

    listings.forEach((listing, index) => {
      console.log(`-- Listing ${index + 1}: ${listing.title || "Unknown"}`);
      console.log(`UPDATE properties`);
      console.log(`SET airbnb_id = '${listing.id}', airbnb_synced = true`);
      console.log(
        `WHERE id = ${index + 1}; -- Adjust the ID to match your property\n`
      );
    });

    // Alternative: Update by matching title
    console.log("-- Alternative: Update by matching title\n");
    listings.forEach((listing) => {
      if (listing.title && listing.title !== "Unknown Property") {
        console.log(`UPDATE properties`);
        console.log(`SET airbnb_id = '${listing.id}', airbnb_synced = true`);
        console.log(
          `WHERE LOWER(title) LIKE LOWER('%${listing.title.substring(
            0,
            20
          )}%');\n`
        );
      }
    });

    // Save results
    const outputDir = path.dirname(__filename);
    const jsonPath = path.join(outputDir, "airbnb-listings-detailed.json");
    const csvPath = path.join(outputDir, "airbnb-listings-detailed.csv");

    // Save JSON
    fs.writeFileSync(jsonPath, JSON.stringify(listings, null, 2));
    console.log(`💾 JSON saved to: ${jsonPath}`);

    // Save CSV
    const csvHeader =
      "Airbnb_ID,Title,Price,Location,Guests,Bedrooms,Bathrooms,URL\n";
    const csvContent =
      csvHeader +
      listings
        .map(
          (l) =>
            `${l.id},"${l.title || ""}",${l.price || ""},"${
              l.location || ""
            }",${l.guests || ""},${l.bedrooms || ""},${l.bathrooms || ""},${
              l.url
            }`
        )
        .join("\n");
    fs.writeFileSync(csvPath, csvContent);
    console.log(`📄 CSV saved to: ${csvPath}\n`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\nTroubleshooting:");
    console.log("1. Make sure puppeteer is installed: npm install puppeteer");
    console.log("2. Check your internet connection");
    console.log("3. The profile might be private or require login");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is installed
try {
  require.resolve("puppeteer");
  scrapeWithPuppeteer();
} catch (e) {
  console.log("📦 Puppeteer not installed. Installing now...\n");
  console.log("Run: npm install puppeteer\n");
  console.log(
    "Then run this script again: node scripts/scrape-airbnb-puppeteer.js"
  );
}
