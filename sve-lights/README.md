# SVE Lights

This project now includes a React frontend and a small Express API prepared for MySQL.

## Setup

1. Copy `.env.example` to `.env`.
2. Update the MySQL credentials in `.env`.
3. Run the SQL in `server/schema.sql` in your MySQL instance.
4. Install dependencies with `npm install`.

## Scripts

- `npm run dev` starts the Vite frontend.
- `npm run server` starts the Express API on port `4000`.

## Database

The feedback form posts to `/api/feedback` and stores submissions in the `feedback` table.
