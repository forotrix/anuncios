# Deployment

This is a simple, provider-agnostic outline for Hetzner (API) and Vercel (front).
No secrets are stored in the repo.

## API on Hetzner

1) Provision a server and install Node.js.
2) Clone the repo or upload the built API artifact.
3) Set runtime env vars (see docs/ENV.md). Use systemd or pm2.
4) Start the API on API_PORT (default 8080).
5) Optional: put Nginx in front and proxy /api/v1 to the Node process.
6) If you do not have a domain yet, use the server IP in NEXT_PUBLIC_API_BASE_URL.

## Front on Vercel

1) Import the repo in Vercel and select apps/desktop-web as the project root.
2) Add env vars from docs/ENV.md for Preview and Production.
3) Set NEXT_PUBLIC_API_BASE_URL to your Hetzner IP or api.forotrix.com when ready.
4) Deploy.

## Domains (when ready)

- Front: forotrix.com and www.forotrix.com (Vercel)
- API: api.forotrix.com (Hetzner)
- Update CORS_ORIGIN to include the production domains.
