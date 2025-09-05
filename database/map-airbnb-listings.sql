-- Map Airbnb Listings to Properties
-- Based on the scraped data from the client's profile: https://www.airbnb.com/users/show/126012540
-- Generated from automated scraping on the latest run

-- First, let's see what properties we currently have
SELECT id, title, airbnb_id, airbnb_synced FROM properties ORDER BY id;

-- Now, let's update each property with its corresponding Airbnb ID
-- These are the 10 listings found on the client's profile:

-- 1. Home Away From Home Near Rockwell (Mandaluyong, Metro Manila)
UPDATE properties 
SET 
    airbnb_id = '1495326036863538666',
    airbnb_synced = true,
    title = 'Home Away From Home Near Rockwell',
    location = 'Mandaluyong, Metro Manila, Philippines'
WHERE id = 1;

-- 2. New Cozy Studio @ Novotel Suites Acqua Residences (Mandaluyong, Metro Manila)
UPDATE properties 
SET 
    airbnb_id = '852013970145409100',
    airbnb_synced = true,
    title = 'New Cozy Studio @ Novotel Suites Acqua Residences',
    location = 'Mandaluyong, Metro Manila, Philippines'
WHERE id = 2;

-- 3. Property ID: 32910625 (Details not available - may need manual check)
UPDATE properties 
SET 
    airbnb_id = '32910625',
    airbnb_synced = true
WHERE id = 3;

-- If you want to add more properties (since we found 10 listings), run these inserts:
-- This will create new property entries for the remaining Airbnb listings

-- 4. Montana-Modern & Spacious (San Fernando, Central Luzon)
INSERT INTO properties (
    title, description, location, address, city, state, zip_code,
    price, guests, bedrooms, bathrooms, amenities, images, status,
    airbnb_id, airbnb_synced, user_id
) VALUES (
    'Montana-Modern & Spacious',
    'Modern and spacious property in San Fernando',
    'San Fernando, Central Luzon, Philippines',
    'San Fernando',
    'San Fernando',
    'Central Luzon',
    '2000',
    150.00,
    4,
    2,
    2,
    '["WiFi", "Kitchen", "Air Conditioning", "Parking"]'::jsonb,
    '[]'::jsonb,
    'active',
    '1457604182685170074',
    true,
    1
) ON CONFLICT (airbnb_id) DO NOTHING;

-- 5. 1-Studio Pool View & Cozy Place @ Azure North
INSERT INTO properties (
    title, description, location, address, city, state, zip_code,
    price, guests, bedrooms, bathrooms, amenities, images, status,
    airbnb_id, airbnb_synced, user_id
) VALUES (
    '1-Studio Pool View & Cozy Place @ Azure North',
    'Cozy studio with pool view at Azure North',
    'San Fernando, Central Luzon, Philippines',
    'Azure North',
    'San Fernando',
    'Central Luzon',
    '2000',
    120.00,
    2,
    1,
    1,
    '["WiFi", "Pool", "Kitchen", "Air Conditioning"]'::jsonb,
    '[]'::jsonb,
    'active',
    '1433949677956202137',
    true,
    1
) ON CONFLICT (airbnb_id) DO NOTHING;

-- 6. Urban Oasis in Azure North
INSERT INTO properties (
    title, description, location, address, city, state, zip_code,
    price, guests, bedrooms, bathrooms, amenities, images, status,
    airbnb_id, airbnb_synced, user_id
) VALUES (
    'Urban Oasis in Azure North',
    'Urban oasis retreat in Azure North',
    'San Fernando, Central Luzon, Philippines',
    'Azure North',
    'San Fernando',
    'Central Luzon',
    '2000',
    130.00,
    4,
    2,
    1,
    '["WiFi", "Pool", "Kitchen", "Gym"]'::jsonb,
    '[]'::jsonb,
    'active',
    '1457633501740853467',
    true,
    1
) ON CONFLICT (airbnb_id) DO NOTHING;

-- 7. Tropical Zen-Modern Minimalist Spacious Unit
INSERT INTO properties (
    title, description, location, address, city, state, zip_code,
    price, guests, bedrooms, bathrooms, amenities, images, status,
    airbnb_id, airbnb_synced, user_id
) VALUES (
    'Tropical Zen-Modern Minimalist Spacious Unit',
    'Modern minimalist unit with tropical zen design',
    'San Fernando, Central Luzon, Philippines',
    'San Fernando',
    'San Fernando',
    'Central Luzon',
    '2000',
    140.00,
    4,
    2,
    2,
    '["WiFi", "Kitchen", "Air Conditioning", "Balcony"]'::jsonb,
    '[]'::jsonb,
    'active',
    '1457580782301850955',
    true,
    1
) ON CONFLICT (airbnb_id) DO NOTHING;

-- 8. Extraordinary Solace Space @ Livingstone+Netflix
INSERT INTO properties (
    title, description, location, address, city, state, zip_code,
    price, guests, bedrooms, bathrooms, amenities, images, status,
    airbnb_id, airbnb_synced, user_id
) VALUES (
    'Extraordinary Solace Space @ Livingstone+Netflix',
    'Comfortable space at Livingstone with Netflix included',
    'Mandaluyong, Metro Manila, Philippines',
    'Livingstone',
    'Mandaluyong',
    'Metro Manila',
    '1550',
    180.00,
    4,
    2,
    2,
    '["WiFi", "Netflix", "Kitchen", "Air Conditioning", "Parking"]'::jsonb,
    '[]'::jsonb,
    'active',
    '30554342',
    true,
    1
) ON CONFLICT (airbnb_id) DO NOTHING;

-- 9. Paris Beach - Paradise in the City @ Azure
INSERT INTO properties (
    title, description, location, address, city, state, zip_code,
    price, guests, bedrooms, bathrooms, amenities, images, status,
    airbnb_id, airbnb_synced, user_id
) VALUES (
    'Paris Beach - Paradise in the City @ Azure',
    'Beach-themed paradise in the city at Azure',
    'Parañaque, Metro Manila, Philippines',
    'Azure',
    'Parañaque',
    'Metro Manila',
    '1700',
    200.00,
    6,
    2,
    2,
    '["WiFi", "Pool", "Beach Access", "Kitchen", "Parking"]'::jsonb,
    '[]'::jsonb,
    'active',
    '31931264',
    true,
    1
) ON CONFLICT (airbnb_id) DO NOTHING;

-- 10. High Floor 2BR w/ Amazing View+Netflix
INSERT INTO properties (
    title, description, location, address, city, state, zip_code,
    price, guests, bedrooms, bathrooms, amenities, images, status,
    airbnb_id, airbnb_synced, user_id
) VALUES (
    'High Floor 2BR w/ Amazing View+Netflix',
    'High floor 2-bedroom unit with amazing city views and Netflix',
    'Mandaluyong, Metro Manila, Philippines',
    'Near Rockwell Power Plant Mall',
    'Mandaluyong',
    'Metro Manila',
    '1550',
    220.00,
    6,
    2,
    2,
    '["WiFi", "Netflix", "City View", "Kitchen", "Air Conditioning"]'::jsonb,
    '[]'::jsonb,
    'active',
    '32169814',
    true,
    1
) ON CONFLICT (airbnb_id) DO NOTHING;

-- Verify the updates
SELECT 
    id, 
    title, 
    location,
    airbnb_id, 
    airbnb_synced,
    CASE 
        WHEN airbnb_id IS NOT NULL THEN 'https://www.airbnb.com/rooms/' || airbnb_id
        ELSE 'Not linked'
    END as airbnb_url
FROM properties 
ORDER BY id;

-- Summary
DO $$
BEGIN
    RAISE NOTICE '✅ Airbnb listings have been mapped!';
    RAISE NOTICE 'Total properties with Airbnb links: %', 
        (SELECT COUNT(*) FROM properties WHERE airbnb_synced = true);
END $$;

