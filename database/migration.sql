-- Migration Script for InCA Homes Property Management System
-- This script updates existing tables to match the new schema

-- First, let's check and add missing columns to the properties table
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='properties' AND column_name='status') THEN
        ALTER TABLE properties ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;

    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='properties' AND column_name='location') THEN
        ALTER TABLE properties ADD COLUMN location VARCHAR(255);
        -- Set location from city if it exists
        UPDATE properties SET location = COALESCE(city, 'Unknown Location') WHERE location IS NULL;
        ALTER TABLE properties ALTER COLUMN location SET NOT NULL;
    END IF;

    -- Add guests column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='properties' AND column_name='guests') THEN
        ALTER TABLE properties ADD COLUMN guests INTEGER DEFAULT 2;
        UPDATE properties SET guests = 2 WHERE guests IS NULL;
        ALTER TABLE properties ALTER COLUMN guests SET NOT NULL;
    END IF;

    -- Add price column if it doesn't exist (or rename price_per_month)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='properties' AND column_name='price') THEN
        -- Check if price_per_month exists and rename it
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='properties' AND column_name='price_per_month') THEN
            ALTER TABLE properties RENAME COLUMN price_per_month TO price;
        ELSE
            ALTER TABLE properties ADD COLUMN price DECIMAL(10,2) DEFAULT 100.00;
            UPDATE properties SET price = 100.00 WHERE price IS NULL;
            ALTER TABLE properties ALTER COLUMN price SET NOT NULL;
        END IF;
    END IF;

    -- Add amenities column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='properties' AND column_name='amenities') THEN
        ALTER TABLE properties ADD COLUMN amenities JSONB DEFAULT '[]';
    END IF;

    -- Add images column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='properties' AND column_name='images') THEN
        ALTER TABLE properties ADD COLUMN images JSONB DEFAULT '[]';
    END IF;

    -- Add airbnb_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='properties' AND column_name='airbnb_id') THEN
        ALTER TABLE properties ADD COLUMN airbnb_id VARCHAR(255);
    END IF;

    -- Add airbnb_synced column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='properties' AND column_name='airbnb_synced') THEN
        ALTER TABLE properties ADD COLUMN airbnb_synced BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='properties' AND column_name='user_id') THEN
        ALTER TABLE properties ADD COLUMN user_id INTEGER;
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='properties' AND column_name='updated_at') THEN
        ALTER TABLE properties ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Add bathrooms column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='properties' AND column_name='bathrooms') THEN
        ALTER TABLE properties ADD COLUMN bathrooms INTEGER DEFAULT 1;
    END IF;
END $$;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id),
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INTEGER NOT NULL,
    total_price DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'confirmed',
    airbnb_booking_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id),
    event_type VARCHAR(50),
    event_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_analytics_property ON analytics(property_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);

-- Enable Row Level Security (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Public can view active properties" ON properties;
DROP POLICY IF EXISTS "Admins can manage all properties" ON properties;
DROP POLICY IF EXISTS "Admins can manage bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage analytics" ON analytics;

-- Create RLS policies
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (true);
CREATE POLICY "Public can view active properties" ON properties FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage all properties" ON properties FOR ALL USING (true);
CREATE POLICY "Admins can manage bookings" ON bookings FOR ALL USING (true);
CREATE POLICY "Admins can manage analytics" ON analytics FOR ALL USING (true);

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing data to ensure compatibility
UPDATE properties 
SET 
    status = COALESCE(status, 'active'),
    amenities = COALESCE(amenities, '[]'::jsonb),
    images = COALESCE(images, '[]'::jsonb),
    airbnb_synced = COALESCE(airbnb_synced, false)
WHERE status IS NULL OR amenities IS NULL OR images IS NULL OR airbnb_synced IS NULL;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
END $$;
