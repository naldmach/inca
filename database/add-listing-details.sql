-- Adds a home for the listing-wizard fields that have no dedicated column:
-- property type, privacy type, beds, bedroom locks, the bathroom breakdown,
-- occupancy, description highlights, instant-book preference, weekend pricing
-- and map coordinates.
--
-- Run this in the Supabase SQL Editor before publishing a listing from
-- /become-a-host, or the publish step will fail with a missing-column error.

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS listing_details JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN properties.listing_details IS
  'Listing-wizard fields without dedicated columns. See src/lib/listing-wizard.ts for the shape.';
