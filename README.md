# M. Gyamprah Enterprise — Website

A professional, fully responsive business website for **M. Gyamprah Enterprise (MGE)** — a Ghana-based supplier of building materials, importer of galvanized & pre-painted steel coils, and operator of a fuel station.

The project is split into a static frontend (`client/`) and a Node.js + PostgreSQL backend API (`server/`).

```
M-GYAMPRAH-ENTERPRISE/
├── client/                    # Static site (HTML5 / CSS3 / Vanilla JS)
│   ├── index.html             # Home
│   ├── products.html          # Products & cart
│   ├── about.html             # Company story
│   ├── contact.html           # Enquiry form & info
│   ├── css/style.css          # Full design system
│   ├── js/
│   │   ├── config.js          # API base + helpers
│   │   ├── main.js            # Nav, mobile menu, scroll reveal, toast
│   │   ├── cart.js            # Slide-out cart + quote submission
│   │   ├── products.js        # Catalogue fetch, filter, search
│   │   └── contact.js         # Enquiry form
│   └── assets/images/
├── server/                    # Express + PostgreSQL API
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/db.js
│   │   ├── controllers/       # products, enquiries, orders
│   │   ├── routes/
│   │   └── middleware/        # validation, error handler
│   ├── db/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── scripts/
│   │   ├── initDb.js
│   │   └── seedDb.js
│   ├── .env.example
│   ├── package.json
│   └── README.md
└── README.md                  # this file
```

## Tech stack

- **Frontend:** semantic HTML5, modern CSS3 (custom property–driven design system), vanilla ES6 JavaScript. Poppins via Google Fonts. Mobile-first responsive layout.
- **Backend:** Node.js 18+, Express 4, `pg` (PostgreSQL client). Helmet, CORS, morgan, rate limiting.
- **Database:** PostgreSQL 13+.

## Quick start

### 1. Database

Create a PostgreSQL database (default name `mge_db`):

```bash
createdb mge_db
# or:  psql -U postgres -c "CREATE DATABASE mge_db;"
```

### 2. Backend

```bash
cd server
cp .env.example .env          # then edit PG credentials if needed
npm install
npm run db:init               # creates tables
npm run db:seed               # loads sample catalogue
npm run dev                   # starts http://localhost:4000
```

The server also serves the static `client/` folder, so once it's running you can open **http://localhost:4000** and the whole site works end-to-end.

### 3. Frontend (alternative: standalone)

You can also open the `client/` files directly in a static server (e.g. VS Code Live Server on port 5500). `client/js/config.js` will auto-detect and point at `http://localhost:4000` for the API.

## API summary

| Method | Endpoint                  | Purpose                                    |
| ------ | ------------------------- | ------------------------------------------ |
| GET    | `/api/health`             | Liveness check                             |
| GET    | `/api/products`           | List products (`?category=`, `?search=`, `?featured=true`) |
| GET    | `/api/products/categories`| List categories with counts                |
| GET    | `/api/products/:id`       | Get single product (by id or slug)         |
| POST   | `/api/products`           | Create product                             |
| PATCH  | `/api/products/:id`       | Update product                             |
| DELETE | `/api/products/:id`       | Delete product                             |
| POST   | `/api/enquiries`          | Submit contact form                        |
| GET    | `/api/enquiries`          | List enquiries                             |
| POST   | `/api/orders`             | Submit quote request from cart             |
| GET    | `/api/orders`             | List orders + line items                   |

Full details in [`server/README.md`](server/README.md).

## Pages

- **Home** — hero, "What MGE Offers" (3 divisions), supply snapshot, featured products (live from API), why-choose, CTA, footer.
- **Products** — filterable catalogue with search, category chips, add-to-cart, slide-out cart drawer with quote submission.
- **About** — company story, six core values, three-division overview, CTA.
- **Contact** — enquiry form (posts to `/api/enquiries`), phone/email/location/hours blocks, embedded map placeholder, bulk-order CTA.

## Design system

Defined as CSS custom properties at the top of `client/css/style.css`:

- Brand blue scale (`--brand-500` → `--brand-900`)
- Neutral surfaces, soft borders, three shadow tiers
- Rounded card radii (`--r-md`, `--r-lg`, `--r-pill`)
- Spacing/typography scale tuned for industrial-corporate feel

## Customising

- **Currency:** displayed via `Intl.NumberFormat('en-GH', { currency: 'GHS' })` in `client/js/config.js`.
- **Map:** replace the iframe `src` on `contact.html` with your real Google Maps embed URL.
- **Imagery:** uses Unsplash hotlinks for now. Replace with your own assets in `client/assets/images/` and update the `image_url` column in `products` (and any `<img>` tags).
- **Phone / email / address:** update once in the four HTML pages' nav/footer blocks and on `contact.html`.

## Notes

- The order endpoint (`POST /api/orders`) treats orders as **quote requests** — pricing is indicative and confirmed by the sales team. The DB stores totals using the price at order time so historical orders stay accurate even if catalogue prices change later.
- Write endpoints (`/api/enquiries`, `/api/orders`) are rate-limited to 30 requests per 15 minutes per IP.
- CORS origins are configured via `CORS_ORIGIN` in `.env` (comma-separated).
