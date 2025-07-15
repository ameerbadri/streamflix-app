# Movie Streaming Platform - Rebuild Prompts

This document contains structured prompts to rebuild the complete movie streaming platform from scratch. Follow these prompts in order for a systematic rebuild.

## Prerequisites: Supabase Setup Decision

### Initial Setup Prompt
```
Before starting the rebuild, determine your Supabase setup preference:

Option A: Create New Supabase Project
- I need to create a completely new Supabase project from scratch
- Set up new database, authentication, and edge functions
- Configure all tables, RLS policies, and triggers from the beginning

Option B: Use Existing Supabase Project
- I have an existing Supabase project with the required infrastructure
- Please provide your Supabase project credentials:
  - Project URL
  - Anon Key
  - Service Role Key (for edge functions)
- I understand the existing database schema and edge functions will be used

If Option B is selected, ensure your existing Supabase project has:
- Authentication configured
- Required database tables (movies, profiles, subscribers, etc.)
- Edge functions for checkout, subscription management, etc.
- Proper RLS policies for security
```

## Phase 1: Project Foundation

### Prompt 1: Initialize Project Structure
```
Create a new React + TypeScript project using Vite with the following specifications:
- Use Tailwind CSS for styling
- Install shadcn/ui components library
- Set up React Router for navigation
- Configure the project with a modern folder structure (src/components, src/pages, src/hooks, src/lib, etc.)
- Create a basic index.css with CSS variables for theming
- Set up a tailwind.config.ts with custom design tokens
```

### Prompt 2: Design System & Visual Identity
```
Create a premium Netflix-inspired streaming platform design with:

**Visual Design Philosophy:**
- Modern, cinematic dark theme as primary with elegant light mode support
- Rich, immersive experience with high-quality imagery and smooth animations
- Professional streaming service aesthetic with premium feel
- Clean, content-focused layout that showcases movies beautifully

**Color Palette (HSL format required):**
- Primary: Deep cinematic red/burgundy for accents and CTAs
- Secondary: Rich charcoal/midnight blue for backgrounds
- Accent: Gold/amber for premium subscription indicators
- Neutral: Sophisticated grays with proper contrast ratios
- Success/Error: Muted greens and reds that fit the cinematic theme

**Typography:**
- Modern sans-serif primary font (Inter, Poppins, or similar)
- Clear hierarchy with readable sizes for movie titles, descriptions, metadata
- Proper spacing and line heights for both desktop and mobile

**Component Design Patterns:**
- Glass morphism effects for overlays and modals
- Subtle gradient overlays on hero sections
- Rounded corners with consistent border radius scale
- Shadow system that creates depth without overwhelming
- Smooth micro-interactions and hover states

**Layout Principles:**
- Grid-based movie galleries with responsive breakpoints
- Full-width hero sections with background movie imagery
- Sticky navigation with transparent-to-solid transition on scroll
- Card-based design for movie items with hover elevation
- Proper spacing scale for consistent visual rhythm

Configure all colors in HSL format in both index.css and tailwind.config.ts for proper theming support.
```

## Phase 2: Backend Infrastructure

### Prompt 3: Supabase Integration Setup
```
**IMPORTANT: Use existing Supabase infrastructure if available, or create new as needed.**

Configure Supabase integration following these patterns:
- Use the existing Supabase client from src/integrations/supabase/client.ts
- Configure environment variables for URL and anon key in .env.example
- Implement proper error handling for missing environment variables
- Configure auth settings with localStorage persistence and auto-refresh
- Follow existing Supabase design patterns:
  * Use supabase.from() for database queries
  * Use supabase.auth for authentication
  * Use supabase.functions.invoke() for edge functions
  * Always handle errors properly with try/catch
  * Use RLS policies for data security
  * Use TypeScript types from src/integrations/supabase/types.ts

**Required Integration Points:**
- Authentication: supabase.auth.signUp(), signInWithPassword(), signOut()
- Database: Use existing tables and RLS policies
- Edge Functions: Follow existing edge function patterns
- Real-time: Configure for live data updates if needed
```

### Prompt 4: Database Schema & Backend API Architecture
```
**CRITICAL: Use existing Supabase database schema and extend as needed.**

**Existing Database Tables (Reference for integration):**

**movies table:**
- id (uuid, primary key)
- title (text, required)
- description (text)
- poster_url (text)
- trailer_url (text)
- video_url (text)
- genre (text array)
- release_year (integer)
- duration_minutes (integer)
- rating (numeric)
- subscription_tier (text, default: 'Basic')
- created_at, updated_at (timestamps)

**profiles table:**
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- email (text, required)
- display_name (text)
- avatar_url (text)
- created_at, updated_at (timestamps)

**subscribers table:**
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- email (text, unique, required)
- stripe_customer_id (text)
- subscribed (boolean, default: false)
- subscription_tier (text)
- subscription_end (timestamp)
- created_at, updated_at (timestamps)

**Additional required tables:**
- cast_members, crew_members, watchlist, user_ratings, viewing_history

**RLS Policies Pattern:**
- Users can only access their own data (profiles, watchlist, ratings, viewing_history)
- Movies and cast/crew are publicly readable
- Subscribers table accessible by user_id or email match
- Edge functions use service role key to bypass RLS for administrative operations

**Required Database Triggers:**
- Auto-update updated_at columns on record changes
- Auto-create profile on user signup (handle_new_user function)
```

### Prompt 5: Authentication System
```
Implement a complete authentication system with:
- Auth context with session management
- Login/signup forms with email/password
- Proper session persistence and token refresh handling
- User profile creation trigger that runs on signup
- Auth state management throughout the app
- Protected routes and auth guards
- Error handling for auth failures
- Email redirect configuration for signup
```

## Phase 3: Core Components & UI

### Prompt 6: Layout Components
```
Create the main layout components:
- App.tsx with router configuration for all pages (/, /auth, /movie/:id, /watchlist, /account, /pricing, /subscription-success)
- Navigation header with logo, search, and user menu
- Responsive sidebar for mobile
- Footer component
- Loading states and error boundaries
Ensure all navigation is properly linked and responsive.
```

### Prompt 7: Movie Components
```
Build movie-related components:
- MovieCard component with poster, title, rating, and subscription tier badge
- TrailerModal component for playing movie trailers
- Movie grid layouts with responsive design
- Movie filters and search functionality
- Genre badges and rating displays
- Subscription tier indicators (Basic/Premium)
```

### Prompt 8: UI Component Library
```
Implement shadcn/ui components with custom styling:
- Button variants (default, secondary, outline, ghost, destructive)
- Card components with modern styling
- Dialog/Modal components
- Form components (Input, Label, Textarea)
- Toast notifications
- Badge components
- Avatar components
- Progress indicators
- Skeleton loading components
Customize all components to match the design system with proper variants.
```

## Phase 4: Page Implementation

### Prompt 9: Home Page (Index)
```
Create a comprehensive home page with:
- Hero section with featured movie
- Movie categories (Popular, New Releases, Trending)
- Subscription tier filtering
- Search functionality with Fuse.js
- Responsive movie grids
- Loading states and empty states
- Integration with movie database queries
```

### Prompt 10: Authentication Pages
```
Build authentication pages:
- Combined auth page with login/signup tabs
- Form validation with react-hook-form and zod
- Social login styling (even if not implemented)
- Password strength indicators
- Error message handling
- Success states and redirects
- Responsive design for mobile
```

### Prompt 11: Movie Details Page
```
Create a detailed movie page with:
- Hero section with poster and movie info
- Cast and crew sections with profile pictures
- User ratings and reviews
- Add to watchlist functionality
- Subscription requirement checks
- Trailer integration
- Related movies section
- Responsive layout for all screen sizes
```

### Prompt 12: User Account Pages
```
Implement user account functionality:
- Account settings page with profile editing
- Subscription status display
- Billing history
- Watchlist management page
- Viewing history with progress tracking
- User ratings management
- Profile picture upload capability
```

### Prompt 13: Pricing & Subscription Pages
```
Build subscription-related pages:
- Pricing page with subscription tier comparison
- Subscription success page
- Subscription management interface
- Plan upgrade/downgrade options
- Billing portal integration
- Clear subscription benefits display
```

## Phase 5: Stripe Integration

### Prompt 14: Stripe Subscription Setup with Edge Functions API
```
**CRITICAL: Use existing Supabase edge functions architecture patterns.**

**Required Edge Functions with API Signatures:**

**1. create-checkout Function:**
```typescript
// POST /functions/v1/create-checkout
// Headers: Authorization: Bearer <user-token>
// Request Body: { priceId?: string, successUrl?: string, cancelUrl?: string }
// Response: { url: string } | { error: string }
```

**2. check-subscription Function:**
```typescript
// POST /functions/v1/check-subscription
// Headers: Authorization: Bearer <user-token>
// Request Body: {} (empty)
// Response: { 
//   subscribed: boolean, 
//   subscription_tier: string | null, 
//   subscription_end: string | null 
// } | { error: string }
```

**3. customer-portal Function:**
```typescript
// POST /functions/v1/customer-portal
// Headers: Authorization: Bearer <user-token>
// Request Body: { returnUrl?: string }
// Response: { url: string } | { error: string }
```

**Implementation Requirements:**
- All edge functions must use CORS headers for web app compatibility
- Use Supabase service role key for database operations (bypass RLS)
- Implement proper error handling and logging for debugging
- Use existing Stripe secret key from Supabase secrets
- Follow existing edge function patterns in supabase/functions/
- Database integration: Update subscribers table with subscription status
- Subscription tier validation based on Stripe price IDs
- Test mode configuration with Stripe test keys
```

### Prompt 15: Subscription Management
```
Build subscription management features:
- Real-time subscription status checking
- Subscription tier enforcement throughout the app
- Payment method management
- Subscription cancellation and renewal
- Prorated upgrades/downgrades
- Billing history display
- Invoice management
```

## Phase 6: Advanced Features

### Prompt 16: Movie Data Integration
```
Implement movie data management:
- TMDB API integration edge function
- Movie population from external APIs
- Image optimization and caching
- Metadata management (cast, crew, ratings)
- Batch data import functionality
- Data validation and cleanup
```

### Prompt 17: User Features
```
Add advanced user functionality:
- Watchlist with add/remove capabilities
- User rating system with stars
- Viewing history with progress tracking
- Personalized recommendations
- User preferences and settings
- Social features (if desired)
```

### Prompt 18: Search & Discovery
```
Implement search and discovery features:
- Advanced search with filters (genre, year, rating)
- Fuzzy search with Fuse.js
- Search suggestions and autocomplete
- Category browsing
- Popular and trending sections
- Personalized recommendations based on viewing history
```

## Phase 7: Admin Features

### Prompt 19: Admin Panel
```
Create admin functionality:
- Admin user detection and role management
- Movie management interface (add, edit, delete)
- User management dashboard
- Subscription analytics
- Content moderation tools
- System health monitoring
```

### Prompt 20: Content Management
```
Build content management features:
- Movie upload and metadata editing
- Bulk movie import tools
- Content approval workflows
- Image and video management
- SEO optimization tools
- Content scheduling
```

## Phase 8: Performance & Polish

### Prompt 21: Performance Optimization
```
Optimize application performance:
- Image lazy loading and optimization
- Component code splitting
- Database query optimization
- Caching strategies
- Bundle size optimization
- SEO improvements
- Mobile performance tuning
```

### Prompt 22: Testing & Quality Assurance
```
Implement testing and QA:
- Component unit tests
- Integration tests for key flows
- API endpoint testing
- Authentication flow testing
- Payment flow testing
- Cross-browser compatibility
- Mobile responsiveness testing
```

### Prompt 23: Deployment & DevOps
```
Set up deployment infrastructure:
- Create public/_redirects file for Netlify SPA routing (/* /index.html 200)
- Production environment configuration
- Environment variable management for different environments
- Database migration strategies
- CDN setup for media assets
- Monitoring and logging setup
- Backup strategies for database and assets
- Security hardening and HTTPS configuration
- Domain configuration and DNS setup
```

## Phase 9: Documentation & Maintenance

### Prompt 24: Documentation
```
Create comprehensive documentation:
- README with setup instructions
- API documentation
- Component documentation
- Deployment guides
- Troubleshooting guides
- Contributing guidelines
- License and legal information
```

### Prompt 25: Final Polish
```
Final application polish:
- Error boundary implementation
- Loading state consistency
- Accessibility improvements (ARIA labels, keyboard navigation)
- Form validation refinement
- Animation and transition polish
- Browser compatibility testing
- Performance monitoring setup
- Security audit and hardening
```

## Environment Variables & Secrets Configuration

### .env.example File Variables (Public/Anonymous Keys)
Create a `.env.example` file with these public variables that are safe to expose:
```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Supabase Edge Function Secrets (Sensitive Keys)
Configure these sensitive keys in Supabase Edge Function Secrets (NOT in .env files):
- `STRIPE_SECRET_KEY` - Your Stripe secret key for payment processing
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for bypassing RLS in edge functions
- `TMDB_API_KEY` - The Movie Database API key (optional, for populating movie data)
- `SUPABASE_URL` - Supabase project URL (also available in edge functions)
- `SUPABASE_ANON_KEY` - Anon key (also available in edge functions)

### Important Security Notes:
- NEVER put secret keys (STRIPE_SECRET_KEY, SERVICE_ROLE_KEY) in .env files or frontend code
- Only use VITE_ prefixed variables for public, non-sensitive configuration
- All sensitive operations should use Supabase Edge Functions with proper secrets management
- The .env file should only contain public configuration that's safe to expose to the frontend

## Key Dependencies

Essential packages to install:
- @supabase/supabase-js
- react-router-dom
- @tanstack/react-query
- react-hook-form + @hookform/resolvers + zod
- lucide-react
- tailwindcss + tailwindcss-animate
- shadcn/ui components
- fuse.js (for search)
- date-fns
- class-variance-authority + clsx + tailwind-merge

## Success Criteria

The rebuild is complete when:
- [ ] All pages are functional and responsive
- [ ] Authentication works end-to-end
- [ ] Subscription system is fully operational
- [ ] Movie database is populated and searchable
- [ ] User features (watchlist, ratings) work properly
- [ ] Admin features are accessible to admin users
- [ ] Payment processing works in test mode
- [ ] Application is deployed and accessible
- [ ] Documentation is complete and accurate

## Notes

- Follow the exact database schema provided
- Use the established design system consistently
- Test all subscription flows thoroughly
- Ensure proper error handling throughout
- Maintain responsive design principles
- Follow React and TypeScript best practices
- Implement proper security measures
- Use semantic HTML and accessibility best practices