# CareHub

CareHub is a Vietnamese multi-brand health and wellness storefront that combines product catalog, COD checkout, loyalty points, subscriptions, free samples, and pack-code scanning into one platform.

## Brands

| Brand | Focus |
|---|---|
| **Blackmores** | Vitamins, minerals, fish oil, infant formula |
| **GAIA Skin Naturals** | Baby bath, skin, hair, oral care |
| **The Little Oak Company** | Goat milk infant formula (cans, sachets, combos) |
| **HAPPI Health** | Health products |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router 7 |
| Backend / Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | GitHub Pages |

## Features

- Product catalog with brand/category filtering and search
- Shopping cart with bundle pricing and subscribe-and-save discounts
- COD (Cash on Delivery) checkout
- Promo codes (percent and fixed discount, expiry, usage limits, brand restrictions)
- Loyalty points system (pack-code scan earn + gift redemption)
- Free sample requests
- User accounts and wishlist
- Subscription management (pause, skip, change frequency)
- Women's health content section
- Staff dashboard for order and subscription management

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your Supabase URL and anon key

# 3. Start development server
npm run dev
# Opens at http://localhost:5173/Consumer-Loyalty-Program-Web-Application/

# 4. Build for production
npm run build

# 5. Run linting and type-checking
npm run lint
npx tsc --noEmit
```

## Project Structure

```
├── src/                    # React source code
│   ├── components/         # Header, ProductCard, CartSidebar, etc.
│   ├── pages/              # Home, Product, Checkout, Loyalty, etc.
│   ├── context/            # Auth + Cart state management
│   ├── data/               # Products, promo codes, pricing logic
│   └── lib/                # Supabase client, auth helpers
├── supabase/
│   ├── functions/          # Edge functions (OCR, redemptions, free samples)
│   └── migrations/         # SQL database migrations
├── scripts/
│   └── catalog_cleanup.mjs # Pre-launch catalog quality check
└── docs/                   # Documentation (operational plan, demo checklist, etc.)
```

## Database Setup

The app requires a Supabase project with the schema and seed data applied:

1. Create a Supabase project at [supabase.com](https://supabase.com/dashboard)
2. Open SQL Editor
3. Run `rebuild_all.sql` (full schema + seed data)
4. Copy your Supabase URL and anon key into `.env`

For existing projects, apply migrations in filename order from `supabase/migrations/`.

## Deployment

See `docs/DEPLOYMENT-GUIDE.md` for step-by-step deployment instructions (GitHub Pages, Vercel, custom domain).

## License

This project is proprietary software prepared for client handover.
