# MGE Backend API

Express + PostgreSQL API powering the M. Gyamprah Enterprise website.

## Quick start

```bash
cp .env.example .env          # then edit credentials
npm install
createdb mge_db               # or: psql -c "CREATE DATABASE mge_db;"
npm run db:init               # applies schema
npm run db:seed               # loads sample catalog
npm run dev                   # starts http://localhost:4000
```

## Endpoints

### Health
- `GET /api/health`

### Products
- `GET /api/products` — supports `?category=`, `?search=`, `?featured=true`
- `GET /api/products/categories`
- `GET /api/products/:id` — id or slug
- `POST /api/products`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`

### Enquiries (contact form)
- `POST /api/enquiries` — `{ name, email, phone?, company?, subject?, message }`
- `GET /api/enquiries`

### Orders (quote requests / cart)
- `POST /api/orders` — `{ customer_name, customer_email, customer_phone?, customer_company?, notes?, items: [{ product_id, quantity }] }`
- `GET /api/orders`

## Folder layout

```
server/
├── src/
│   ├── app.js              # Express app, middleware, routes
│   ├── server.js           # entry point
│   ├── config/db.js        # pg Pool
│   ├── controllers/        # request handlers
│   ├── routes/             # route definitions
│   └── middleware/         # validation, error handler
├── db/
│   ├── schema.sql
│   └── seed.sql
├── scripts/
│   ├── initDb.js
│   └── seedDb.js
└── package.json
```
