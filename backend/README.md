# Srilaxmi ERP Backend

Production-ready Node.js + Express + MySQL API for the Towers frontend.

## Folder Structure

```
backend/
├── database.sql
├── .env.example
├── .env
├── package.json
├── README.md
├── API.md
└── src/
    ├── config/db.js
    ├── controllers/
    ├── services/
    ├── repositories/
    ├── middleware/
    ├── routes/
    ├── validations/
    ├── utils/
    ├── uploads/
    ├── scripts/initDb.js
    ├── app.js
    └── server.js
```

## Prerequisites

- Node.js 18+
- MySQL 8+

## Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL password

npm install

# Create database + tables
mysql -u root -p < database.sql

# Seed admin user
npm run db:init

npm run dev
```

API runs at **http://localhost:5000**

Default admin: `admin` / `admin123`

## Frontend Integration

In project root `.env`:

```
VITE_API_URL=http://localhost:5000/api
VITE_USE_API=true
```

Start frontend: `npm run dev`

## Security

- JWT access + refresh tokens (httpOnly cookie)
- bcrypt password hashing (12 rounds)
- Helmet, CORS, rate limiting
- Parameterized SQL queries (mysql2)
- express-validator input validation
- Soft deletes on ERP entities

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with file watch |
| `npm start` | Production start |
| `npm run db:init` | Run schema + seed admin |
