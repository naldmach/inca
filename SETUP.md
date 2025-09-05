# InCA Homes - Setup Instructions

## 🚀 Quick Start Guide

### 1. Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 2. Supabase Database Setup

1. **Create a Supabase Project:**

   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready

2. **Apply the Database Schema:**

   - Go to your Supabase project dashboard
   - Navigate to "SQL Editor"
   - Copy and paste the contents of `database/schema.sql`
   - Run the SQL script

3. **Get Your Supabase Credentials:**
   - Go to "Settings" → "API"
   - Copy the "Project URL" and "anon public" key
   - Add them to your `.env.local` file

### 3. Create Admin User

After setting up the database, create an admin user by running this SQL in Supabase:

```sql
-- First, create a user (you'll need to hash the password)
-- Use an online bcrypt generator or run this in Node.js:
-- const bcrypt = require('bcryptjs');
-- const hashedPassword = bcrypt.hashSync('your_password', 10);

INSERT INTO users (email, password_hash, name, role)
VALUES ('admin@example.com', '$2a$10$hashedpassword', 'Admin User', 'admin');
```

### 4. Cloudinary Setup (Optional)

1. **Create a Cloudinary Account:**

   - Go to [cloudinary.com](https://cloudinary.com)
   - Create a free account
   - Get your cloud name, API key, and API secret

2. **Add to Environment Variables:**
   - Add the Cloudinary credentials to your `.env.local` file

### 5. Start the Development Server

```bash
npm run dev
```

The website will be available at `http://localhost:3001`

## 🔧 Troubleshooting

### Properties Not Loading

If you see "Failed to load properties" error:

1. **Check Environment Variables:**

   ```bash
   # Make sure .env.local exists and has all required variables
   cat .env.local
   ```

2. **Test Database Connection:**

   ```bash
   # Visit this URL in your browser
   http://localhost:3001/api/test
   ```

3. **Create Sample Data:**
   - Login to admin panel: `http://localhost:3001/admin/login`
   - Go to: `http://localhost:3001/api/sample-data` (POST request)
   - Or create properties manually through the admin panel

### Common Issues

1. **"TypeError: fetch failed"**

   - Check Supabase URL and keys
   - Ensure database schema is applied
   - Verify network connectivity

2. **"Unauthorized" errors**

   - Make sure JWT_SECRET is set
   - Check if admin user exists in database

3. **Image upload issues**
   - Verify Cloudinary credentials
   - Check Cloudinary account limits

## 📱 Available Pages

- **Homepage:** `http://localhost:3001/`
- **Properties:** `http://localhost:3001/properties`
- **Admin Login:** `http://localhost:3001/admin/login`
- **Admin Dashboard:** `http://localhost:3001/admin`
- **Airbnb Integration:** `http://localhost:3001/admin/airbnb`

## 🎯 Next Steps

1. Set up environment variables
2. Apply database schema
3. Create admin user
4. Start development server
5. Create sample properties
6. Link properties to Airbnb listings

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Check the terminal for server errors
3. Verify all environment variables are set
4. Ensure database schema is applied correctly
