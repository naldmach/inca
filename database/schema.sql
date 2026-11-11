-- SUPERSEDED - DO NOT RUN.
-- This file creates "FOR ALL USING (true)" policies, which grant the public
-- anon key full read and write on every table. Use complete-setup.sql, then
-- the add-*.sql migrations, then fix-rls-policies.sql.

-- InCA Homes Property Management System Database Schema
-- This file contains all the table definitions and policies

-- Users table (Admin authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Properties table
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

-- Bookings table (synced from Airbnb)
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

-- Analytics table
CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id),
    event_type VARCHAR(50), -- view, inquiry, booking
    event_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_analytics_property ON analytics(property_id);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users: Only admins can manage users
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (true);

-- Properties: Public read, admin write
CREATE POLICY "Public can view active properties" ON properties FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage all properties" ON properties FOR ALL USING (true);

-- Bookings: Admin only
CREATE POLICY "Admins can manage bookings" ON bookings FOR ALL USING (true);

-- Analytics: Admin only
CREATE POLICY "Admins can manage analytics" ON analytics FOR ALL USING (true);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 