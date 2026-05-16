# KLJ Kasboek

A full-stack web application for managing finances, tracking attendance and a routeplanner for pupil registration, built with a Node.js/NestJS backend and a Vite-powered frontend.

## Tech Stack

- **Frontend:** Vite + (React/Vue)
- **Backend:** Node.js, NestJS
- **Database:** MySQL
- **Auth:** JWT + Google OAuth 2.0
- **Package manager:** pnpm

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org) (v18 or higher)
- [pnpm](https://pnpm.io) — install globally via `npm install -g pnpm`
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) — or use the included Docker setup

---

## Frontend

### Setup

1. Install dependencies:

```bash
cd kirhanhuyghe-frontend
pnpm install
```

2. Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:3000/api
```

### Running

**Development:**

```bash
pnpm run dev
```

The app is available at [http://localhost:5173](http://localhost:5173).

**Production:**

```bash
pnpm run build
pnpm run preview
```

Builds with Vite and previews the output from `dist/`. You can also serve `dist/` via any static file host.

### Tests

```bash
pnpm test
```

Select a test from the menu — it will run automatically.

---

## Backend

### Setup

1. Install dependencies:

```bash
cd kirhanhuyghe-backend
pnpm install
```

2. Create a `.env` file in the backend root:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGINS=["http://localhost:5173"]
CORS_MAX_AGE=10800
DATABASE_URL=mysql://devusr:devpwd@localhost:3307/kirhanhuyghe
LOG_LEVELS=["log","error","warn","debug"]
AUTH_JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
```

> **Note:** The mail service uses Google OAuth 2.0. See [Google's OAuth 2.0 guide](https://developers.google.com/identity/protocols/oauth2) to generate your credentials. Without these, mail functionality is disabled but the rest of the app works normally.

> **Note:** Never commit real secrets to version control. Use a secrets manager or environment injection in production.

### Database (Docker)

The backend includes a `docker-compose.yml` for running MySQL locally:

```bash
cd kirhanhuyghe-backend

# Start the database
docker compose up -d

# Stop and remove containers
docker compose down
```

### Running in Development

```bash
# Run database migrations
pnpm run db:migrate

# (Optional) Seed with example data
pnpm run db:seed

# Start the dev server
pnpm run start:dev
```

The API is available at [http://localhost:3000](http://localhost:3000).

### Quick Start (all-in-one)

```bash
# 1. Start the database (port 3307)
cd kirhanhuyghe-backend && docker compose up -d

# 2. Install, migrate, seed, and start the backend
pnpm install && pnpm run db:migrate && pnpm run db:seed && pnpm run start:dev

# 3. In a new terminal — install and start the frontend
cd kirhanhuyghe-frontend && pnpm install && pnpm run dev
```

### Production

```bash
pnpm install
pnpm run build
pnpm run db:migrate
node dist/main.js
```

### Tests

1. Make sure `.env.test` exists with test database configuration.

2. Start the test database:

```bash
docker compose -f docker-compose.test.yml up
```

3. Run migrations against the test database:

```bash
pnpm run migrate:test
```

4. Run the test suite:

```bash
pnpm run test:jest
```

5. Generate a coverage report:

```bash
pnpm run test:cov
```

The report is saved to `__tests__/coverage/`. Open `index.html` in your browser to view it.

---

## Troubleshooting

**Check the API is reachable:**

```bash
curl http://localhost:3000/api/aanwezigheden/event/30
```

**Frontend shows no data?**

- Verify `VITE_API_URL` in `.env` is set to `http://localhost:3000/api`
- Open browser DevTools → Network and inspect the response body
- Check that `CORS_ORIGINS` in the backend `.env` includes `http://localhost:5173`

**Empty tables after starting?**

Run migrations and seed after the database is up:

```bash
pnpm run db:migrate && pnpm run db:seed
```

---

## Contributing

Pull requests are welcome. Please open an issue first to discuss any significant changes.

## Credits
This is a schoolproject made by Jasper Huyghe and Aykon Kirhan, it will be mantained by Jasper Huyghe

## License

[MIT](LICENSE)
