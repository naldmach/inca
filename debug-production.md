# Production Debugging Guide

## Quick Debugging Steps for Vercel 404 Error

### 1. Test Production APIs

Visit these URLs to test your production deployment:

- **Database Test**: https://inca-homes.vercel.app/api/test
- **Properties List**: https://inca-homes.vercel.app/api/properties
- **Single Property**: https://inca-homes.vercel.app/api/properties/1

### 2. Expected Results

#### Successful API Response:

```json
{
  "properties": [
    {
      "id": 1,
      "title": "Home Away From Home Near Rockwell",
      "price": 180,
      "location": "Mandaluyong, Metro Manila, Philippines"
    }
  ]
}
```

#### If Database is Empty:

```json
{
  "properties": [],
  "pagination": {...}
}
```

#### If Environment Variables Missing:

```json
{
  "error": "Database connection failed. Please check environment variables."
}
```

### 3. Common Fixes

#### Fix 1: Set Up Production Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to SQL Editor
4. Copy and run the entire `database/complete-setup.sql` file

#### Fix 2: Update Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
JWT_SECRET=your-secret-key-minimum-32-characters
NEXT_PUBLIC_APP_URL=https://inca-homes.vercel.app
```

#### Fix 3: Redeploy After Changes

After updating environment variables:

1. Go to Deployments tab in Vercel
2. Click the three dots on latest deployment
3. Click "Redeploy"

### 4. Database Schema Check

Your production database needs these tables:

- `users` (for admin authentication)
- `properties` (main property listings)
- `bookings` (optional)
- `analytics` (optional)

### 5. Sample Data Population

If your database is empty, you can add sample data by:

1. Going to your admin panel: https://inca-homes.vercel.app/admin
2. Creating an admin user first
3. Adding properties through the admin interface

OR run the complete SQL setup that includes sample data.

