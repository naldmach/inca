-- InCA Homes Property Management System - Fresh Schema Setup
-- WARNING: This will DROP all existing tables and create new ones!

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

-- Step 13: Create sample properties for testing
INSERT INTO properties (
    title, description, location, address, city, state, zip_code,
    price, guests, bedrooms, bathrooms, amenities, images, status,
    airbnb_id, airbnb_synced, user_id
) VALUES 
(
    'Cozy Beach House',
    'Beautiful beachfront property with stunning ocean views',
    'Miami Beach, FL',
    '123 Ocean Drive',
    'Miami Beach',
    'FL',
    '33139',
    250.00,
    6,
    3,
    2,
    '["WiFi", "Pool", "Beach Access", "Kitchen", "Parking"]'::jsonb,
    '[{"url": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800", "alt_text": "Beach house exterior", "is_primary": true}]'::jsonb,
    'active',
    '12345678',
    true,
    1
),
(
    'Mountain Retreat Cabin',
    'Rustic cabin nestled in the mountains with breathtaking views',
    'Aspen, CO',
    '456 Mountain Road',
    'Aspen',
    'CO',
    '81611',
    350.00,
    4,
    2,
    1,
    '["WiFi", "Fireplace", "Hot Tub", "Kitchen", "Hiking Trails"]'::jsonb,
    '[{"url": "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800", "alt_text": "Mountain cabin", "is_primary": true}]'::jsonb,
    'active',
    '87654321',
    true,
    1
),
(
    'Downtown City Loft',
    'Modern loft in the heart of the city, walking distance to everything',
    'New York, NY',
    '789 Broadway',
    'New York',
    'NY',
    '10003',
    400.00,
    2,
    1,
    1,
    '["WiFi", "Gym", "Rooftop Access", "Kitchen", "Doorman"]'::jsonb,
    '[{"url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "alt_text": "City loft interior", "is_primary": true}]'::jsonb,
    'active',
    null,
    false,
    1
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Fresh schema applied successfully!';
    RAISE NOTICE 'Admin user created: admin@example.com / admin123';
    RAISE NOTICE 'Sample properties created!';
END $$;
