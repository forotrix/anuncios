# Architecture

## Overview

Front (Next.js) -> API (Node/Express) -> MongoDB
                                -> Cloudinary (media)

## Domains

- Local: http://localhost:3100 (front) and http://localhost:8080 (api)
- Preview: https://*.vercel.app (front) -> http://<hetzner-ip>:3000/api/v1 (api)
- Production: https://forotrix.com and https://www.forotrix.com -> https://api.forotrix.com/api/v1

Note: The API listens on API_PORT (3000 on Hetzner).

## Git flow

- Source repo: mikongame/anuncios
- Mirror repo: forotrix/anuncios
- GitHub Actions mirrors main via SSH deploy key.
- Vercel deploys only from forotrix/anuncios (main branch).

## Deployment flow

1) Push to mikongame/anuncios (main)
2) GitHub Actions mirrors to forotrix/anuncios
3) Vercel deploys front from forotrix/anuncios
4) Hetzner runs API (PM2 + Nginx)
