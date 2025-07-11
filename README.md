# Movie Streaming Platform (Demo)

A modern, full-featured movie trailer viewing platform built with React, TypeScript, and Supabase. This application provides users with a Netflix-like experience for discovering, rating, and watching movie trailers with subscription-based access control.

## 🎬 App Functionality Summary

This movie streaming platform allows users to:

- **Browse and discover movies** with detailed information including ratings, genres, and descriptions
- **Create accounts and authenticate** securely using Supabase Auth
- **Subscribe to different tiers** (Basic, Premium) via Stripe integration
- **Manage personal watchlists** and track viewing history
- **Rate and review movies** with a 5-star rating system
- **Watch movie trailers** and access full content based on subscription level
- **Manage account settings** and subscription details

## ✨ Key Features

### 🔐 Authentication & User Management
- Secure email/password authentication via Supabase
- User profiles with display names and avatars
- Protected routes based on authentication status
- Password reset and email verification
- Automatic profile creation on signup

### 💳 Subscription Management
- **Stripe-powered subscription system** with multiple tiers:
  - **Basic ($7.99/month)**: Access to basic content library
  - **Premium ($14.99/month)**: Extended content + HD quality
  - **Enterprise ($29.99/month)**: Full content library + 4K quality
- Secure checkout process with Stripe Checkout
- Customer portal for subscription management
- Automatic subscription status verification
- Real-time subscription updates

### 🎥 Movie Features
- **Comprehensive movie database** with rich metadata:
  - Title, description, genres, ratings
  - Release year, duration, poster images
  - Trailer and video URLs
  - Cast and crew information
  - Subscription tier requirements
- **Advanced movie discovery**:
  - Browse by genre and rating
  - Search functionality with fuzzy matching
  - Personalized recommendations
  - Filter by subscription tier
- **Interactive features**:
  - Personal watchlist management
  - User rating system (1-5 stars)
  - Viewing progress tracking
  - Watch history with completion status
  - Trailer modal with video controls

### 📱 User Experience
- **Responsive design** optimized for all devices (mobile, tablet, desktop)
- **Modern UI** built with shadcn/ui components
- **Dark/light mode** support with theme switching
- **Intuitive navigation** with protected route handling
- **Real-time updates** for subscription status
- **Error handling** with user-friendly toast notifications
- **Loading states** and skeleton components
- **Accessibility** features with ARIA labels

## 🏗️ Web App Architecture

### Frontend Architecture
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components (buttons, cards, etc.)
│   ├── MovieCard.tsx   # Movie display component with ratings
│   └── TrailerModal.tsx # Video player modal with controls
├── pages/              # Route components
│   ├── Index.tsx       # Home page with movie grid and search
│   ├── Auth.tsx        # Login/signup page with form validation
│   ├── MovieDetails.tsx # Individual movie page with cast/crew
│   ├── Watchlist.tsx   # User's saved movies with filtering
│   ├── Account.tsx     # Profile management and settings
│   ├── Pricing.tsx     # Subscription plans comparison
│   └── NotFound.tsx    # 404 error page
├── contexts/           # React context providers
│   └── AuthContext.tsx # Authentication state management
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client & TypeScript types
├── hooks/              # Custom React hooks
│   ├── use-mobile.tsx  # Mobile device detection
│   └── use-toast.ts    # Toast notification hook
└── lib/               # Utility functions
    └── utils.ts       # Common helper functions
```

### Backend Architecture (Supabase)
```
Database Tables:
├── profiles           # User profile information (display_name, avatar_url)
├── movies            # Movie catalog with metadata and tiers
├── cast_members      # Movie cast with character names and photos
├── crew_members      # Movie crew with jobs and departments
├── subscribers       # Subscription status tracking with Stripe IDs
├── user_ratings      # User movie ratings (1-5 stars)
├── viewing_history   # Watch progress & completion tracking
└── watchlist         # User's saved movies for later viewing

Edge Functions:
├── check-subscription    # Verify user subscription status with Stripe
├── create-checkout      # Create Stripe checkout sessions
├── customer-portal      # Manage subscription via Stripe portal
├── check-admin-status   # Verify admin privileges for movie management
└── populate-movies      # Admin-only function for importing TMDB movie data
```

### Security & Data Protection
- **Row Level Security (RLS)** policies on all user data tables
- **Authenticated routes** with automatic redirects to login
- **Subscription-based content access** control by tier
- **Secure API key management** via Supabase secrets
- **CORS-enabled edge functions** for secure API calls
- **Input validation** on all forms and API endpoints

### Admin Functionality & Movie Database Management

The platform includes secure admin functionality for managing the movie database. Admin privileges are controlled through configurable email addresses to ensure only authorized users can manage movie content.

#### Admin Access Control
- **Admin Email Configuration**: Two special email addresses are configured as environment secrets:
  - `TEST_BASIC_EMAIL`: Grants basic admin privileges for testing
  - `TEST_PREMIUM_EMAIL`: Grants premium admin privileges for testing
- **Secure Verification**: The `check-admin-status` edge function verifies if the currently logged-in user has admin privileges
- **Account Page Integration**: Admin users see additional controls on their Account page for managing movie data

#### Movie Database Management
- **TMDB Integration**: Admin users can populate the movie database using the `populate-movies` edge function
- **Data Import Process**: 
  1. Admin logs in with authorized email address
  2. Clicks "Populate Movies from TMDB" button on Account page
  3. System fetches latest popular movies from TMDB API
  4. Movie data (including cast, crew, posters) is imported into the database
  5. Movies are automatically assigned subscription tier requirements
- **Security**: Only users with configured admin emails can trigger movie database updates
- **Scalability**: The system can be extended to support additional admin roles and permissions

This admin system ensures that movie database management is secure and controlled while remaining flexible for different deployment environments.

## 🔌 Third-Party APIs & Services

### Core Infrastructure
- **[Supabase](https://supabase.com)** - Backend as a Service
  - PostgreSQL database with real-time subscriptions
  - Authentication & user management with JWT tokens
  - Row Level Security (RLS) policies for data protection
  - Edge Functions for serverless computing (Deno runtime)
  - Automatic REST API generation with TypeScript types

### Payment Processing
- **[Stripe](https://stripe.com)** - Payment & Subscription Management
  - Secure checkout sessions with `mode: "subscription"`
  - Customer portal for self-service subscription management
  - Webhook handling for real-time subscription updates
  - Multiple subscription tiers with different pricing
  - Test mode for development and production keys

### Movie Data
- **[TMDB (The Movie Database)](https://www.themoviedb.org)** - Movie Metadata
  - Comprehensive movie information and metadata
  - High-resolution posters and backdrop images
  - Trailer URLs and video content
  - Cast and crew information with photos
  - Genre classifications and user ratings

### Frontend Technologies
- **[React 18](https://react.dev)** - UI framework with concurrent features
- **[TypeScript](https://typescriptlang.org)** - Type-safe JavaScript for better DX
- **[Vite](https://vitejs.dev)** - Fast build tool and dev server with HMR
- **[React Router](https://reactrouter.com)** - Client-side routing with protected routes
- **[TanStack Query](https://tanstack.com/query)** - Server state management and caching

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com)** - Modern React components with variants
- **[Radix UI](https://radix-ui.com)** - Accessible component primitives
- **[Lucide React](https://lucide.dev)** - Beautiful SVG icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme switching

## 📊 Database Schema Details

### Core Tables

#### `movies`
```sql
CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT[] -- Array of genres
  rating NUMERIC, -- TMDB rating
  release_year INTEGER,
  duration_minutes INTEGER,
  poster_url TEXT,
  trailer_url TEXT,
  video_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'Basic',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- References auth.users
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `subscribers`
```sql
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN DEFAULT false,
  subscription_tier TEXT, -- Basic, Premium, Enterprise
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Relationship Tables

#### `cast_members` & `crew_members`
```sql
CREATE TABLE cast_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID NOT NULL,
  tmdb_person_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  character_name TEXT,
  profile_picture_url TEXT,
  order_position INTEGER DEFAULT 0
);

CREATE TABLE crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID NOT NULL,
  tmdb_person_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  job TEXT NOT NULL,
  department TEXT,
  profile_picture_url TEXT
);
```

### Row Level Security (RLS) Policies

All user data tables implement RLS policies:

```sql
-- Users can only access their own data
CREATE POLICY "Users can manage their own watchlist" 
ON watchlist FOR ALL 
USING (user_id = auth.uid());

-- Movies are publicly readable
CREATE POLICY "Anyone can view movies" 
ON movies FOR SELECT 
USING (true);

-- Subscription data is user-specific
CREATE POLICY "Users can view their own subscription" 
ON subscribers FOR SELECT 
USING (user_id = auth.uid() OR email = auth.email());
```

## 🚀 Complete Installation & Setup Guide

### Prerequisites
- **Node.js 18+** and npm
- **Supabase account** (free tier available)
- **Stripe account** (test mode for development)
- **TMDB API account** (free registration)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd movie-streaming-platform

# Install dependencies
npm install
```

### Step 2: Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Wait for database setup (2-3 minutes)

2. **Configure Database**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link to your project
   supabase link --project-ref YOUR_PROJECT_ID

   # Run migrations
   supabase db push
   ```

3. **Set up Authentication**
   - Go to Authentication > Providers in Supabase dashboard
   - Enable Email provider
   - Configure redirect URLs for your domain

4. **Configure Secrets**
   Navigate to Project Settings > Edge Functions and add:
   ```
   STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
   TMDB_API_KEY=your_tmdb_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   TEST_BASIC_EMAIL=your_test_basic_admin_email@domain.com
   TEST_PREMIUM_EMAIL=your_test_premium_admin_email@domain.com
   ```

   **Admin Email Configuration:**
   - `TEST_BASIC_EMAIL`: Email address for testing basic admin functionality
   - `TEST_PREMIUM_EMAIL`: Email address for testing premium admin functionality
   - These emails are used by the `check-admin-status` edge function to determine admin privileges

### Step 3: Stripe Configuration

1. **Create Stripe Account**
   - Sign up at [stripe.com](https://stripe.com)
   - Get your API keys from Dashboard > Developers > API keys

2. **Create Products**
   ```bash
   # Use Stripe CLI or Dashboard to create subscription products
   # Basic: $7.99/month
   # Premium: $14.99/month  
   # Enterprise: $29.99/month
   ```

3. **Configure Webhooks** (Optional)
   - Endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

### Step 4: TMDB API Setup

1. **Get API Key**
   - Register at [themoviedb.org](https://www.themoviedb.org)
   - Go to Settings > API
   - Request API key (free)

2. **Populate Movie Data**
   ```bash
   # Use the populate-movies edge function
   # This will fetch popular movies from TMDB
   ```

### Step 5: Environment Configuration

1. **Create Environment File**
   Copy the example environment file and add your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```

2. **Configure Environment Variables**
   Edit `.env.local` with your Supabase project details:
   ```bash
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   Get these values from your Supabase project dashboard:
   - Project URL: Settings > API > Project URL
   - Anon Key: Settings > API > Project API Keys > anon public

3. **Important Security Notes**
   - The `.env.local` file is already in `.gitignore` to prevent committing secrets
   - The anon key is safe to use in frontend applications but is project-specific
   - Never commit actual environment files to version control

### Step 6: Development Server

```bash
# Start development server
npm run dev

# Open browser at http://localhost:5173
```

## 🔧 Technical Implementation Details

### Authentication Flow
1. User signs up/logs in via Supabase Auth
2. Profile automatically created via database trigger
3. Subscription status checked on login
4. Routes protected based on auth state

### Subscription Management
1. User selects plan on Pricing page
2. Stripe Checkout session created via edge function
3. Payment processed by Stripe
4. Subscription status updated in database
5. Content access granted based on tier

### Movie Data Flow
1. Movies fetched from TMDB API
2. Data stored in Supabase database
3. Cast/crew information linked via foreign keys
4. Content filtered by user's subscription tier

### Real-time Features
- Subscription status updates
- Watchlist changes
- Rating updates
- View progress tracking

## 📱 User Guide

### Getting Started
1. **Sign Up**: Create account with email/password
2. **Choose Plan**: Select subscription tier on Pricing page
3. **Browse Movies**: Explore catalog on home page
4. **Add to Watchlist**: Save movies for later viewing
5. **Rate Movies**: Give 1-5 star ratings
6. **Watch Trailers**: Click play button on movie cards

### Account Management
- **Profile**: Update display name and avatar in Account page
- **Subscription**: Manage billing via Stripe Customer Portal
- **Watchlist**: View and manage saved movies
- **History**: Track viewing progress and completed movies

### Content Access
- **Basic**: Standard movie library
- **Premium**: Extended library + HD trailers
- **Enterprise**: Full library + 4K content + early access

## 🛠️ Developer Guide

### Project Structure
```
├── src/
│   ├── components/ui/    # Reusable UI components
│   ├── pages/           # Route components
│   ├── contexts/        # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   └── integrations/    # External service integrations
├── supabase/
│   ├── functions/       # Edge functions
│   └── migrations/      # Database migrations
└── public/              # Static assets
```

### Adding New Features

1. **Database Changes**
   ```bash
   # Create migration
   supabase migration new feature_name
   
   # Edit migration file
   vim supabase/migrations/xxx_feature_name.sql
   
   # Apply migration
   supabase db push
   ```

2. **Edge Functions**
   ```bash
   # Create function
   supabase functions new function-name
   
   # Deploy function
   supabase functions deploy function-name
   ```

3. **UI Components**
   ```bash
   # Add shadcn component
   npx shadcn-ui@latest add component-name
   ```

### Testing

```bash
# Run type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment

1. **Build Preparation**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy --project-ref YOUR_PROJECT_ID
   ```

## 🚀 Deployment & Hosting

### Netlify Deployment

1. **Connect Repository**
   - Link GitHub repository to Netlify
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Node version: 18

2. **Environment Variables**
   Set in Netlify dashboard:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Custom Domain** (Optional)
   - Add custom domain in Netlify settings
   - Configure DNS records
   - SSL certificate auto-generated

### Alternative Deployments

- **Vercel**: Similar setup with build command configuration
- **Railway**: Direct GitHub integration with automatic deployments
- **Surge**: Simple static hosting for quick demos

## 🔒 Security Features

### Authentication Security
- **JWT tokens** with automatic refresh
- **Secure session management** via Supabase
- **Password validation** with strength requirements
- **Email verification** for new accounts

### Data Protection
- **Row Level Security (RLS)** on all user data
- **API key encryption** via Supabase secrets
- **CORS configuration** for secure API calls
- **Input sanitization** on all forms

### Subscription Security
- **Stripe's secure payment processing**
- **Webhook signature verification**
- **Customer data isolation**
- **PCI compliance** via Stripe

## 📈 Performance Optimizations

### Frontend Optimizations
- **React.lazy()** for code splitting
- **Image optimization** with proper sizing
- **Caching strategies** via TanStack Query
- **Bundle analysis** and tree shaking

### Database Optimizations
- **Indexes** on frequently queried columns
- **Query optimization** with proper joins
- **Connection pooling** via Supabase
- **Real-time subscriptions** for live updates

### CDN & Caching
- **Global CDN** via Netlify
- **Static asset caching**
- **API response caching**
- **Image CDN** for movie posters

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Conventional commits** for commit messages

### Testing Guidelines
- Test authentication flows
- Verify subscription logic
- Check responsive design
- Validate form inputs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the amazing backend platform
- **Stripe** for secure payment processing
- **TMDB** for comprehensive movie data
- **shadcn/ui** for beautiful UI components
- **Netlify** for hosting the web app

---

**Built with ❤️ using modern web technologies for a seamless streaming experience.**

For support or questions, please open an issue on GitHub or contact the development team.
