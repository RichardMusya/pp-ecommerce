# PP E-commerce (Next.js + Prisma)

Local development scaffold for a production-ready e-commerce app.

Quick start

1. Install dependencies:

```bash
pnpm install
# or npm install
```

2. Copy `.env.example` to `.env` and fill in values (database URL, PayPal keys, SMTP).

3. Run Prisma migrate & seed:

```bash
npx prisma generate
npx prisma migrate dev --name init
pnpm prisma:seed
```

4. Run the dev server:

```bash
pnpm dev
```

PayPal sandbox

- Create sandbox account at https://developer.paypal.com and get `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`.
- Set `PAYPAL_ENV=sandbox` in `.env`.

Docker / MailHog

- For email testing run MailHog via Docker: `docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog` and point SMTP_HOST=localhost, SMTP_PORT=1025.

Vercel deployment (recommended)
------------------------------

1. Push your repository to GitHub and sign in to https://vercel.com.
2. Create a new Project -> Import Git Repository -> select your repo.
3. In Project Settings -> Environment Variables, add the following production variables:

	- `DATABASE_URL` (Postgres connection string, e.g. `postgresql://USER:PASS@HOST:5432/dbname`)
	- `NEXTAUTH_SECRET` (a long random string)
	- `PAYPAL_CLIENT_ID` (your live PayPal client id)
	- `PAYPAL_CLIENT_SECRET` (your live PayPal secret)
	- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (same as `PAYPAL_CLIENT_ID`)
	- `PAYPAL_ENV=live`
	- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
	- `CSRF_TOKEN` (random string)

4. Build & Output Settings: default `Build Command` is `npm run build`, and `Output Directory` leave blank (Next.js App Router is automatic).

5. Migrations & seeding: Vercel does not run long-running Postgres migrations automatically. After deploying:

	- Use your Postgres provider dashboard to run migrations, or run locally and push the database.
	- Locally, run:

```bash
npx prisma generate
npx prisma migrate deploy
node prisma/seed.mjs
```

	Alternatively, add a one-off run step via your Postgres provider or use the `vercel ssh`/platform console to run these commands.

6. After environment variables and migrations are set, trigger a redeploy from Vercel and verify the site at the assigned domain.

Notes:
- Replace SQLite with Postgres for production by updating `DATABASE_URL` in Vercel.
- Keep your `.env` and production secrets out of the repository.
- For PayPal live testing, use buyer sandbox/test accounts only for verification until you are ready to accept real payments.
