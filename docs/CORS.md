# CORS strategy

The API uses a strict allowlist for CORS. Origins are controlled by env vars.

## Allowlist

- Set CORS_ORIGIN to a comma-separated list of allowed origins.
- Exact match only (scheme + host + port).

Example:
CORS_ORIGIN=http://localhost:3100,https://forotrix.com,https://www.forotrix.com

## Vercel previews

If you want to allow preview deployments on *.vercel.app, enable:
CORS_ALLOW_VERCEL_PREVIEW=true

This allows any origin matching:
- https://<anything>.vercel.app

Keep it off in production if you only want the fixed allowlist.

## Notes

- Requests without an Origin header (server-to-server, curl) are allowed.
- When CORS_ORIGIN includes *, all origins are allowed.
- Avoid using * in production.
