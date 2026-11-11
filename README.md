# InCA Homes - Property Management System

A modern, Airbnb-like property management system built for property owners who want to simplify their vacation rental business.

## 🎯 Project Overview

**Project Name:** InCA Homes  
**Client:** Property owner wanting simplified Airbnb-like system

### Core Features

- **Property Management Dashboard** - Complete admin panel for managing properties
- **Customer Booking Website** - Beautiful, responsive website for guests
- **Airbnb Integration** - Sync properties with Airbnb (future feature)
- **Mobile-Responsive Design** - Works perfectly on all devices
- **Self-Manageable** - Easy for clients to manage independently
- **Zero Monthly Costs** - Free hosting and services initially

## 🛠 Tech Stack

### Frontend

- **Framework:** Next.js 15 (React 18)
- **Styling:** Tailwind CSS + Headless UI
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation
- **State:** React Context + useState
- **Image Handling:** Next.js Image optimization

### Backend

- **Runtime:** Node.js (Vercel Serverless Functions)
- **Framework:** Next.js API Routes
- **Authentication:** JWT + bcrypt
- **File Upload:** Supabase Storage (`property-images` bucket)
- **Validation:** Zod schemas

### Database

- **Primary DB:** Supabase (PostgreSQL - Free tier)
- **Data access:** supabase-js. Anon key for public reads (bound by RLS),
  service role for writes.
- **Storage:** 500MB (thousands of properties)
- **Features:** Built-in auth, real-time, auto-backups

### Third-Party Services

- **Hosting:** Vercel (Free Hobby Plan)
- **Images:** Supabase Storage
- **Domain:** .vercel.app initially (custom domain $10/year optional)
- **Analytics:** Vercel Analytics (free)
- **Monitoring:** Built-in Vercel monitoring
- **SSL:** Automatic (Vercel included)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- A `JWT_SECRET` (generate with `openssl rand -base64 32`)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd inca-homes-property-management
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Then fill in the four values. `.env.example` documents which are public
   (inlined into the browser bundle) and which are secret. See also
   [SECURITY.md](SECURITY.md).

4. **Run the database migrations**

   In the Supabase SQL Editor, run in this order:

   | File | Purpose |
   |---|---|
   | `database/complete-setup.sql` | Tables and seed data (new projects only) |
   | `database/add-listing-details.sql` | `listing_details` for the host wizard |
   | `database/add-booking-payments.sql` | Booking payment columns |
   | `database/add-rate-limits.sql` | Shared rate-limit counters |
   | `database/fix-rls-policies.sql` | **Required.** Closes public read/write access |

   `fix-rls-policies.sql` is not optional: without it the anon key can read
   every password hash and insert an admin account.

4. **Set up the database**

   - Create a new Supabase project
   - Run the SQL commands from `database/schema.sql` in your Supabase SQL editor

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   │   ├── login/         # Admin login
│   │   └── page.tsx       # Admin dashboard
│   ├── api/               # Backend API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── properties/    # Property management
│   │   └── upload/        # File upload
│   ├── properties/        # Customer-facing property pages
│   └── page.tsx           # Customer homepage
├── components/            # React components
│   ├── admin/            # Admin panel components
│   ├── customer/         # Customer-facing components
│   ├── shared/           # Shared components
│   └── ui/               # UI components
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication helpers
│   ├── supabase/         # Database client
│   ├── storage.ts       # Supabase Storage uploads
│   └── utils.ts          # Helper functions
└── types/                # TypeScript definitions
```

## 🗄 Database Schema

The system uses the following main tables:

- **users** - Admin authentication and user management
- **properties** - Property listings with images and amenities
- **bookings** - On-site bookings and manual payment settlement
- **analytics** - Event tracking and analytics data

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/login          # Admin login
POST   /api/auth/logout         # Admin logout
GET    /api/auth/me             # Get current user
```

### Properties

```
GET    /api/properties          # List properties (public)
POST   /api/properties          # Create property (admin)
GET    /api/properties/[id]     # Get property details
PUT    /api/properties/[id]     # Update property (admin)
DELETE /api/properties/[id]     # Delete property (admin)
```

### File Management

```
POST   /api/upload              # Upload images
DELETE /api/upload/[id]         # Delete image
```

## 🎨 Design System

### Color Palette

- **Primary:** #3B82F6 (Blue)
- **Secondary:** #EF4444 (Red - Airbnb inspired)
- **Success:** #10B981 (Green)
- **Warning:** #F59E0B (Yellow)

### Typography

- **Headings:** Inter (Bold)
- **Body:** Inter (Regular)
- **Buttons:** Inter (Medium)

### Components

- **Cards:** Rounded corners + subtle shadows
- **Buttons:** Rounded + hover states
- **Forms:** Clean inputs + validation states

## 📱 Features

### Customer Website

- **Homepage:** Hero section + property grid + search
- **Property Details:** Photo gallery + amenities + booking widget
- **Search:** Filters by location, price, guests, dates
- **Mobile-first:** Responsive design for all devices

### Admin Dashboard

- **Login Page:** Secure admin authentication
- **Dashboard:** Overview stats + recent activity
- **Properties:** Grid view + add/edit forms
- **Analytics:** Charts + booking reports
- **Settings:** System configuration

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - Set `NEXT_PUBLIC_APP_URL` to your Vercel app URL (e.g., `https://your-app-name.vercel.app`)
   - Add all other environment variables from `.env.local`
4. Deploy

**Important:** For production deployment, ensure `NEXT_PUBLIC_APP_URL` is set to your actual Vercel domain, not localhost:3000. The property detail pages and API calls depend on this URL being correct.

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 Success Metrics

### Technical Metrics

- Page load time: < 3 seconds
- Mobile responsiveness: 100%
- Uptime: 99.9% (Vercel SLA)
- SEO score: > 90 (Lighthouse)

### Business Metrics

- Property management time: Reduced by 80%
- Booking inquiries: Tracked and organized
- Client satisfaction: Easy self-management
- Cost savings: $50-200/month vs alternatives

## 🔄 Future Enhancements

### Phase 2 Features

- [ ] Airbnb API integration
- [ ] Multi-language support
- [ ] Advanced analytics + reporting
- [ ] Email marketing integration
- [ ] Guest communication system
- [ ] Calendar sync (Google, Outlook)
- [ ] Payment integration (Stripe)
- [ ] Review management system

### Scaling Options

- [ ] Multi-tenant (multiple property owners)
- [ ] White-label solution
- [ ] API for third-party integrations
- [ ] Advanced booking management
- [ ] Revenue optimization tools

## 📞 Support & Maintenance

### Documentation

- [ ] User manual for client
- [ ] Developer documentation
- [ ] API documentation
- [ ] Deployment guide

### Training

- [ ] 1-hour training session for client
- [ ] Video tutorials for common tasks
- [ ] Admin panel user guide

### Ongoing Support

- [ ] Bug fixes and updates
- [ ] Feature requests evaluation
- [ ] Performance monitoring
- [ ] Security updates

## 🎯 Project Deliverables

1. **Live Website** - https://incahomes.vercel.app
2. **Admin Dashboard** - https://incahomes.vercel.app/admin
3. **Source Code** - GitHub repository
4. **Documentation** - User guide + technical docs
5. **Training** - Client onboarding session
6. **Support** - 30-day post-launch support

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**This project delivers a complete, professional property management system for $0/month hosting costs, with the flexibility to scale as the business grows.**
