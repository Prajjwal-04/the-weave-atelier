# The Weave Atelier

An artisanal luxury handcrafted rug e-commerce and catalog platform, honoring the century-old weaving heritage of Bhadohi, India. Designed with architectural restraint, editorial typography, and high-performance digital craftsmanship.

---

## Overview

**The Weave Atelier** combines contemporary digital commerce with authentic Eastern Uttar Pradesh weaving traditions. The platform features:

- **Bespoke Product Catalog & Detail Perspectives**: Multiple viewpoints (Full Overhead, Living Room, Bedroom, Reading Nook, Dining Room, Texture & Pile, Loom Backing, and Artisan Loom).
- **Custom Size Estimator & Tiered Quotes**: Interactive sizing calculator for custom dimensions with lead-time estimation and real-time quotes.
- **Craft & Heritage Documentation**: Multi-stage narrative capturing small-batch yarn selection, mineral dyeing, vertical loom knotting, river paddle washing, and precision shearing.
- **Admin Management Portal**: Real-time product creation, editorial photo uploading, variant matrix configuration, and stock management.
- **Multi-Currency & Dual Payment Gateway**: Real-time currency conversions and integrated dual-checkout support with Stripe and Razorpay.
- **Real-Time Stock Alerts**: Back-in-stock notifications connected via automated email dispatches.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Build Tool**: Vite 5
- **Backend / Database**: Supabase (PostgreSQL, Realtime Subscriptions, Database triggers)
- **Local Server**: Express.js (Payment and Order API)
- **Payment Gateways**: Stripe (`@stripe/stripe-js`), Razorpay (`razorpay`)

---

## Project Structure

```
├── public/
│   ├── images/
│   │   ├── atelier/       # Studio & weaving photography
│   │   ├── collections/   # Curated collection editorial imagery
│   │   ├── craft/         # Loom techniques and artisan carving
│   │   ├── hero/          # High-resolution hero assets
│   │   ├── journal/       # Journal article covers
│   │   ├── moments/       # Atelier moments social feed
│   │   └── narrative/     # 6-stage Bhadohi craft lineage photos
├── server/
│   └── index.js           # Razorpay & order payment backend
├── src/
│   ├── components/        # Reusable UI, Navigation, Modals, Product Cards
│   ├── context/           # React Context (Auth, Cart, Currency, Inventory, Wishlist)
│   ├── data/              # Static seed catalogs (products, collections, journal)
│   ├── pages/             # Route views (Home, Shop, Product Detail, Craft, Admin)
│   ├── services/          # Supabase, Product, Payment, Email, Order services
│   └── types/             # TypeScript definitions
├── supabase/              # SQL schemas and migration scripts
├── .env.example           # Environment variable template
└── vite.config.ts         # Vite configuration
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Supabase account (for cloud database and realtime subscriptions)

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Prajjwal-04/the-weave-atelier.git
cd the-weave-atelier
npm install
```

### 2. Environment Configuration

Copy the sample environment file and configure your API keys:

```bash
cp .env.example .env
```

Fill in your configuration:

| Variable | Description |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public API key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Key ID (frontend) |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (backend) |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key |
| `VITE_ADMIN_ACCESS_KEY` | Passcode for Admin Portal |
| `VITE_ADMIN_EMAIL` | Atelier notification recipient email |
| `VITE_FROM_EMAIL` | Outbound sender email address |

### 3. Development Server

Start the Vite frontend development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### 4. Optional Payment Backend

If running the local Razorpay order creation server:

```bash
node server/index.js
```

### 5. Production Build

Verify TypeScript compilation and generate the production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## License

Private & Confidential © The Weave Atelier. All rights reserved.
