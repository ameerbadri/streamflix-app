# Quick Setup Guide

This is a streamlined setup guide for getting the Movie Streaming Platform running locally. For complete documentation, see [README.md](./README.md).

## Prerequisites

- Node.js 18+ or Bun
- A Supabase account (free tier works)
- A Stripe account (for subscriptions)
- A TMDB account (optional, for movie data)

## Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <your-repo>
cd movie-streaming-platform
npm install
# or
bun install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Required: Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Required: Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_test_...

# Optional: TMDB (for movie data)
TMDB_API_KEY=your-tmdb-key
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your URL and anon key
3. Update `supabase/config.toml` with your project ID
4. Run database migrations:
   ```bash
   npx supabase db push
   ```

### 4. Configure Stripe

1. Get your secret key from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Add it to your Supabase secrets:
   - Go to your Supabase project → Functions → Settings
   - Add `STRIPE_SECRET_KEY` with your secret key

### 5. Start Development Server

```bash
npm run dev
# or  
bun dev
```

Visit `http://localhost:5173` to see your app!

## Next Steps

- **Add Movies**: Use the populate-movies function or add manually via Supabase dashboard
- **Set Up Authentication**: The app includes complete auth - just start using it
- **Configure Subscriptions**: Create products in Stripe dashboard
- **Customize**: Modify the theme, add features, make it yours!

## Need Help?

- Check the full [README.md](./README.md) for detailed documentation
- Review the [troubleshooting guide](https://docs.lovable.dev/tips-tricks/troubleshooting)
- Open an issue if you encounter problems

## Security Note

Never commit your `.env.local` file. All sensitive keys should be in environment variables or Supabase secrets, never hardcoded in the source code.