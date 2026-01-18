Deployment checklist
--------------------

This project can be deployed via Docker or via a platform (Vercel). Below are instructions for a simple Docker-based deployment and notes for CI.

Local Docker (quick):

1. Ensure you have a production-ready `.env` file (do NOT commit secrets).
2. Build and run with docker-compose:

```bash
docker-compose build --pull
docker-compose up -d
```

3. Visit `http://localhost:3000`.

Notes:
- For production use a managed database (Postgres) instead of SQLite.
- Ensure `PAYPAL_ENV=live` and live keys are set in the environment of your host or CI secrets.
- Configure SMTP credentials for sending receipts.

GitHub Actions (image push):
- The workflow `/.github/workflows/ci-deploy.yml` builds and pushes an image to Docker Hub (or your registry). Set these repository secrets:
  - `DOCKERHUB_USERNAME`
  - `DOCKERHUB_TOKEN`
  - `DOCKERHUB_REPO` (e.g. `username/pp-ecommerce`)

Vercel / Serverless:
- Vercel is a straightforward host for Next.js App Router apps. Create a Vercel project, set the environment variables in the dashboard (do not commit `.env`), and deploy from the repo.
