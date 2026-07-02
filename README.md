# نقابة محامين جنوب القليوبية — Website & Admin Dashboard

موقع إلكتروني احترافي ولوحة تحكم لإدارة محتوى **نقابة محامين جنوب القليوبية**.

A full-stack, production-ready, Arabic **RTL** platform for the South Qalyubia Lawyers Syndicate.

## Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React 18 + Vite + Tailwind CSS (RTL) |
| Backend | Node.js + Express (ES Modules) |
| Database | MongoDB + Mongoose |
| Auth | JWT (Bearer tokens) |
| Uploads | Multer (images + PDFs) |
| Security | Helmet, CORS, rate-limiting, mongo-sanitize |

## Features

### Public website
- الرئيسية (Hero, About, Board Members, Location with embedded Google Map)
- ما تقدمه النقابة الفرعية (Services with details modal)
- العروض الحصرية (Offers with discount/expiry)
- الندوات والمحاضرات (Lectures with image / external link / PDF)
- **أحكام النقض** — search, filter by category/year/appeal number, pagination, in-browser **PDF viewer** + download. Optimized with DB indexes + text search for **30,000+ records**.
- تعاقدات النقابة (Contracts)
- المواقع الحكومية (Dropdown menu, opens in new tab)
- أنشطة النقابة (Trips / Social, with image gallery + lightbox)
- الاستعلامات والشكاوى (Professional form with attachment, contact preference, agreement)
- تواصل معنا (Contact info + map)

### Admin dashboard (`/admin`)
Secure JWT login → Statistics, and full CRUD for: Board Members, Services, Offers, Lectures, Judgments (with bulk delete + pagination), Contracts, Government Links, Activities, Complaints (status workflow: جديد / جاري المراجعة / تم الرد / مغلق), and Site Settings (name, logo, banner, contact, social links, map).

## Project Structure

```
southQalubyah/
├── backend/
│   ├── server.js               # App entry, middleware, route mounting
│   ├── .env.example
│   └── src/
│       ├── config/db.js
│       ├── models/             # 11 Mongoose schemas
│       ├── controllers/        # Business logic per resource
│       ├── routes/             # REST route definitions
│       ├── middleware/         # auth, upload (multer), error handling
│       ├── utils/              # token + file helpers
│       └── seed/seed.js        # Seeds admin, settings, demo data
│   └── uploads/                # Stored images + PDFs (served at /uploads)
└── frontend/
    ├── vite.config.js          # Dev proxy → backend
    ├── tailwind.config.js
    └── src/
        ├── api/                # axios instance + service layer
        ├── context/            # Auth + Settings providers
        ├── components/         # layout, ui, admin shared
        ├── hooks/              # useFetch, useCrud
        ├── pages/              # Public pages
        └── pages/admin/        # Admin dashboard pages
```

## Database Models
`Admin`, `BoardMember`, `Service`, `Offer`, `Lecture`, `Judgment`, `Contract`, `GovernmentLink`, `Activity`, `Complaint`, `Settings`.

## REST API (base: `/api`)

| Resource | Public | Admin (JWT) |
|----------|--------|-------------|
| `/auth` | `POST /login` | `GET /me`, `PUT /password`, `POST /register` |
| `/board-members` | `GET` | `POST`, `PUT/:id`, `DELETE/:id` |
| `/services` | `GET` | CRUD |
| `/offers` | `GET` | CRUD |
| `/lectures` | `GET` | CRUD |
| `/judgments` | `GET` (paginated/search/filter), `GET /meta` | CRUD + `POST /bulk-delete` |
| `/contracts` | `GET` | CRUD |
| `/government-links` | `GET` | CRUD |
| `/activities` | `GET` | CRUD (gallery) |
| `/complaints` | `POST` | `GET` (paginated), `PUT/:id`, `DELETE/:id` |
| `/settings` | `GET` | `PUT` |
| `/stats` | — | `GET` |

---

## Local Development

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Backend
```bash
cd backend
cp .env.example .env        # then edit values
npm install
npm run seed                # creates default admin + demo data
npm run dev                 # http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env        # leave VITE_API_URL empty to use the dev proxy
npm install
npm run dev                 # http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`.

### Default admin login
Set in `backend/.env` (used by `npm run seed`):
- Email: `admin@bar-southqalyubia.eg`
- Password: `Admin@12345`

> ⚠️ Change these before going to production. Login at `/admin/login`.

---

## Production Deployment

### Backend
1. Set environment variables (`PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`, admin creds).
2. `npm install --omit=dev && npm run seed && npm start`
3. Run behind a process manager (PM2) and a reverse proxy (Nginx) with HTTPS.
4. Persist the `uploads/` directory (volume / object storage). For very large judgment archives, consider serving PDFs from S3/Spaces or a CDN.

Example PM2:
```bash
pm2 start server.js --name bar-api
```

### Frontend
1. Set `VITE_API_URL` to your API origin (e.g. `https://api.your-domain.eg`).
2. `npm run build` → outputs static files to `frontend/dist`.
3. Serve `dist/` via Nginx / Vercel / Netlify. For SPA routing, redirect all unknown paths to `index.html`.

Example Nginx (frontend + API proxy):
```nginx
server {
  server_name your-domain.eg;
  root /var/www/bar/dist;
  index index.html;

  location /api/      { proxy_pass http://127.0.0.1:5000; }
  location /uploads/  { proxy_pass http://127.0.0.1:5000; }
  location /          { try_files $uri /index.html; }
}
```

---

## Handling 30,000+ Judgment PDFs
- Compound indexes: `{category, year}`, plus single indexes on `appealNumber`, `year`, `createdAt`.
- A **text index** (`title`, `appealNumber`, `summary`) powers fast search.
- API uses server-side pagination (`page`/`limit`, capped at 100), `.lean()` reads, and parallel `count`/`find`.
- Bulk import recommendation: write a script using `Judgment.insertMany([...], { ordered: false })` in batches of ~1000, then ensure indexes are built. Store PDFs on disk/object storage and save only the path in the DB.

## Notes
- All responses follow `{ success, message?, data? }`.
- File uploads accept images (`jpeg/png/webp/gif`) and `application/pdf`, max 25 MB (configurable via `MAX_FILE_SIZE`).
- The UI is fully RTL/Arabic with loading, empty, and error states throughout.
