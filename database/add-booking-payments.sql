-- Moves bookings off the Airbnb hand-off and onto on-site booking + payment.
--
-- user_id ties a booking to the guest account that made it, so only that
-- guest can see the host's payment details. The payment_* columns track the
-- manual settlement flow (bank transfer / GCash / PayMaya), which has no
-- gateway: the guest transfers and submits a reference, the host confirms.
--
-- Run this in the Supabase SQL Editor before booking a stay.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
  ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255),
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'awaiting_payment',
  ADD COLUMN IF NOT EXISTS nights INTEGER;

COMMENT ON COLUMN bookings.payment_status IS
  'awaiting_payment -> submitted (guest sent a reference) -> confirmed | rejected (host decides)';

-- New bookings start unconfirmed; the old default assumed Airbnb had already
-- taken the money.
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'pending';
