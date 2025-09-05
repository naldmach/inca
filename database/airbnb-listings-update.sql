-- Update Airbnb Listings for Client's Properties
-- Replace the IDs below with actual Airbnb listing IDs from the client's profile

-- Example: Update specific properties with their Airbnb IDs
-- You'll need to get these IDs from https://www.airbnb.com/users/show/126012540

-- Update by property title (adjust these based on your actual properties)
UPDATE properties 
SET 
    airbnb_id = 'REPLACE_WITH_ACTUAL_AIRBNB_ID_1',
    airbnb_synced = true
WHERE title = 'Cozy Beach House';

UPDATE properties 
SET 
    airbnb_id = 'REPLACE_WITH_ACTUAL_AIRBNB_ID_2',
    airbnb_synced = true
WHERE title = 'Mountain Retreat Cabin';

UPDATE properties 
SET 
    airbnb_id = 'REPLACE_WITH_ACTUAL_AIRBNB_ID_3',
    airbnb_synced = true
WHERE title = 'Downtown City Loft';

-- Or update all properties at once if they all belong to the same client
-- Uncomment and modify as needed:

/*
-- If you have a list of property IDs and their corresponding Airbnb IDs:
UPDATE properties SET airbnb_id = CASE
    WHEN id = 1 THEN 'AIRBNB_ID_FOR_PROPERTY_1'
    WHEN id = 2 THEN 'AIRBNB_ID_FOR_PROPERTY_2'
    WHEN id = 3 THEN 'AIRBNB_ID_FOR_PROPERTY_3'
    -- Add more as needed
END,
airbnb_synced = true
WHERE id IN (1, 2, 3); -- List all property IDs here
*/

-- Verify the updates
SELECT id, title, airbnb_id, airbnb_synced 
FROM properties 
ORDER BY id;
