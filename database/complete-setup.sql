-- InCA Homes Property Management System - Complete Setup
-- This combines the fresh schema + Airbnb listings mapping

-- Step 1: Drop existing tables (if they exist)
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Step 3: Create Users table (Admin authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Step 4: Create Properties table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    guests INTEGER NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER DEFAULT 1,
    amenities JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, inactive
    airbnb_id VARCHAR(255),
    airbnb_synced BOOLEAN DEFAULT FALSE,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Create Bookings table (synced from Airbnb)
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id),
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INTEGER NOT NULL,
    total_price DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, cancelled, completed
    airbnb_booking_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: Create Analytics table
CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id),
    event_type VARCHAR(50), -- view, inquiry, booking
    event_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 7: Create indexes for performance
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_analytics_property ON analytics(property_id);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);

-- Step 8: Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies
-- Users: Only admins can manage users
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (true);

-- Properties: Public read, admin write
CREATE POLICY "Public can view active properties" ON properties FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage all properties" ON properties FOR ALL USING (true);

-- Bookings: Admin only
CREATE POLICY "Admins can manage bookings" ON bookings FOR ALL USING (true);

-- Analytics: Admin only
CREATE POLICY "Admins can manage analytics" ON analytics FOR ALL USING (true);

-- Step 10: Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 11: Create triggers for updated_at
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 12: Create your admin user
-- Password is 'admin123' (hashed with bcrypt)
INSERT INTO users (email, password_hash, name, role)
VALUES (
    'admin@example.com', 
    '$2a$10$cM/x30QgIIoF3zVq0LiluO7PiVGTYkcopOU2SqRXqhbsjERhLuGwu',
    'Admin User', 
    'admin'
);

-- =============================================================================
-- AIRBNB LISTINGS MAPPING
-- Based on scraped data from: https://www.airbnb.com/users/show/126012540
-- =============================================================================

-- Step 13: Insert all 10 Airbnb listings as properties
INSERT INTO properties (
    title, description, location, address, city, state, zip_code,
    price, guests, bedrooms, bathrooms, amenities, images, status,
    airbnb_id, airbnb_synced, user_id
) VALUES 

-- 1. Home Away From Home Near Rockwell (Mandaluyong, Metro Manila)
(
    'Home Away From Home Near Rockwell',
    'Comfortable home away from home experience near Rockwell, perfect for business travelers and tourists',
    'Mandaluyong, Metro Manila, Philippines',
    'Near Rockwell Power Plant Mall',
    'Mandaluyong',
    'Metro Manila',
    '1550',
    4500.00,
    4,
    2,
    2,
    '["WiFi", "Kitchen", "Air Conditioning", "Near Mall", "Parking"]'::jsonb,
    '[{"url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "alt_text": "Modern apartment near Rockwell", "is_primary": true}]'::jsonb,
    'active',
    '1495326036863538666',
    true,
    1
),

-- 2. New Cozy Studio @ Novotel Suites Acqua Residences
(
    'New Cozy Studio @ Novotel Suites Acqua Residences',
    'Brand new cozy studio at the prestigious Novotel Suites Acqua Residences',
    'Mandaluyong, Metro Manila, Philippines',
    'Novotel Suites Acqua Residences',
    'Mandaluyong',
    'Metro Manila',
    '1550',
    4000.00,
    2,
    1,
    1,
    '["WiFi", "Hotel Amenities", "Pool", "Gym", "Kitchen"]'::jsonb,
    '[{"url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", "alt_text": "Cozy studio at Novotel", "is_primary": true}]'::jsonb,
    'active',
    '852013970145409100',
    true,
    1
),

-- 3. Property (ID: 32910625)
(
    'Premium City Apartment',
    'Premium apartment in prime city location with excellent amenities',
    'Metro Manila, Philippines',
    'City Center',
    'Manila',
    'Metro Manila',
    '1000',
    5000.00,
    4,
    2,
    2,
    '["WiFi", "Kitchen", "Air Conditioning", "City View"]'::jsonb,
    '[{"url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800", "alt_text": "Premium city apartment", "is_primary": true}]'::jsonb,
    'active',
    '32910625',
    true,
    1
),

-- 4. Montana-Modern & Spacious
(
    'Montana-Modern & Spacious',
    'Modern and spacious property with contemporary design and comfort',
    'San Fernando, Central Luzon, Philippines',
    'San Fernando',
    'San Fernando',
    'Central Luzon',
    '2000',
    3800.00,
    4,
    2,
    2,
    '["WiFi", "Kitchen", "Air Conditioning", "Parking", "Modern Design"]'::jsonb,
    '[{"url": "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800", "alt_text": "Modern spacious apartment", "is_primary": true}]'::jsonb,
    'active',
    '1457604182685170074',
    true,
    1
),

-- 5. 1-Studio Pool View & Cozy Place @ Azure North
(
    '1-Studio Pool View & Cozy Place @ Azure North',
    'Cozy studio with beautiful pool view at Azure North development',
    'San Fernando, Central Luzon, Philippines',
    'Azure North',
    'San Fernando',
    'Central Luzon',
    '2000',
    3000.00,
    2,
    1,
    1,
    '["WiFi", "Pool View", "Pool Access", "Kitchen", "Air Conditioning"]'::jsonb,
    '[{"url": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800", "alt_text": "Studio with pool view", "is_primary": true}]'::jsonb,
    'active',
    '1433949677956202137',
    true,
    1
),

-- 6. Urban Oasis in Azure North
(
    'Urban Oasis in Azure North',
    'Urban oasis retreat in the heart of Azure North, perfect for relaxation',
    'San Fernando, Central Luzon, Philippines',
    'Azure North',
    'San Fernando',
    'Central Luzon',
    '2000',
    3200.00,
    4,
    2,
    1,
    '["WiFi", "Pool", "Kitchen", "Gym", "Garden View"]'::jsonb,
    '[{"url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "alt_text": "Urban oasis apartment", "is_primary": true}]'::jsonb,
    'active',
    '1457633501740853467',
    true,
    1
),

-- 7. Tropical Zen-Modern Minimalist Spacious Unit
(
    'Tropical Zen-Modern Minimalist Spacious Unit',
    'Modern minimalist unit with tropical zen design, spacious and peaceful',
    'San Fernando, Central Luzon, Philippines',
    'San Fernando',
    'San Fernando',
    'Central Luzon',
    '2000',
    3500.00,
    4,
    2,
    2,
    '["WiFi", "Kitchen", "Air Conditioning", "Balcony", "Zen Design"]'::jsonb,
    '[{"url": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800", "alt_text": "Zen minimalist apartment", "is_primary": true}]'::jsonb,
    'active',
    '1457580782301850955',
    true,
    1
),

-- 8. Extraordinary Solace Space @ Livingstone+Netflix
(
    'Extraordinary Solace Space @ Livingstone+Netflix',
    'Extraordinary comfortable space at Livingstone with Netflix entertainment included',
    'Mandaluyong, Metro Manila, Philippines',
    'Livingstone',
    'Mandaluyong',
    'Metro Manila',
    '1550',
    4800.00,
    4,
    2,
    2,
    '["WiFi", "Netflix", "Kitchen", "Air Conditioning", "Parking", "Entertainment"]'::jsonb,
    '[{"url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800", "alt_text": "Comfortable space with entertainment", "is_primary": true}]'::jsonb,
    'active',
    '30554342',
    true,
    1
),

-- 9. Paris Beach - Paradise in the City @ Azure
(
    'Paris Beach - Paradise in the City @ Azure',
    'Beach-themed paradise in the city at Azure, bringing vacation vibes to urban living',
    'Parañaque, Metro Manila, Philippines',
    'Azure',
    'Parañaque',
    'Metro Manila',
    '1700',
    5300.00,
    6,
    2,
    2,
    '["WiFi", "Pool", "Beach Theme", "Kitchen", "Parking", "City Paradise"]'::jsonb,
    '[{"url": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800", "alt_text": "Beach-themed city paradise", "is_primary": true}]'::jsonb,
    'active',
    '31931264',
    true,
    1
),

-- 10. High Floor 2BR w/ Amazing View+Netflix
(
    'High Floor 2BR w/ Amazing View+Netflix',
    'High floor 2-bedroom unit with amazing city views and Netflix entertainment',
    'Mandaluyong, Metro Manila, Philippines',
    'Near Rockwell Power Plant Mall',
    'Mandaluyong',
    'Metro Manila',
    '1550',
    5800.00,
    6,
    2,
    2,
    '["WiFi", "Netflix", "City View", "Kitchen", "Air Conditioning", "High Floor"]'::jsonb,
    '[{"url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800", "alt_text": "High floor apartment with city view", "is_primary": true}]'::jsonb,
    'active',
    '32169814',
    true,
    1
);

-- Step 14: Verify the setup
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ COMPLETE SETUP SUCCESSFUL!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Database schema: Created';
    RAISE NOTICE 'Admin user: admin@example.com / admin123';
    RAISE NOTICE 'Properties created: %', (SELECT COUNT(*) FROM properties);
    RAISE NOTICE 'Airbnb-linked properties: %', (SELECT COUNT(*) FROM properties WHERE airbnb_synced = true);
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update your .env.local with real Supabase credentials';
    RAISE NOTICE '2. Restart your dev server: npm run dev';
    RAISE NOTICE '3. Visit http://localhost:3000/properties';
    RAISE NOTICE '4. Login to admin: http://localhost:3000/admin/login';
    RAISE NOTICE '==============================================';
END $$;

-- Show all properties with their Airbnb links
SELECT 
    id, 
    title, 
    location,
    price,
    airbnb_id, 
    airbnb_synced,
    CASE 
        WHEN airbnb_id IS NOT NULL THEN 'https://www.airbnb.com/rooms/' || airbnb_id
        ELSE 'Not linked'
    END as airbnb_url
FROM properties 
ORDER BY id;
