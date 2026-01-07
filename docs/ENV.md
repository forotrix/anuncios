# Environment variables

This repo uses runtime environment variables for local, preview, and production.
Do not commit real .env files.

## apps/api

Required:
- API_PORT
- MONGODB_URI
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- STORAGE_DRIVER
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

Optional:
- JWT_ACCESS_TTL (default: 15m)
- JWT_REFRESH_TTL (default: 7d)
- CORS_ORIGIN (CSV allowlist)
- CORS_ALLOW_VERCEL_PREVIEW (true/false)
- CLOUDINARY_BASE_FOLDER (default: anuncios/data)
- CLOUDINARY_UPLOAD_FOLDER (default: anuncios/uploads)
- CLOUDINARY_MAX_FILE_SIZE (default: 5242880)

Example (local):

API_PORT=8080
MONGODB_URI=mongodb://localhost:27017/anuncios
JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
CORS_ORIGIN=http://localhost:3100
CORS_ALLOW_VERCEL_PREVIEW=false
STORAGE_DRIVER=cloudinary
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=123
CLOUDINARY_API_SECRET=abc
CLOUDINARY_BASE_FOLDER=anuncios/data
CLOUDINARY_UPLOAD_FOLDER=anuncios/uploads
CLOUDINARY_MAX_FILE_SIZE=5242880

## apps/desktop-web

Required:
- NEXT_PUBLIC_API_BASE_URL

Optional:
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- NEXT_PUBLIC_CLOUDINARY_API_KEY
- NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER (default: anuncios/uploads)
- NEXT_PUBLIC_CLOUDINARY_MAX_FILE_SIZE (default: 5242880)

Example (local):

NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=demo
NEXT_PUBLIC_CLOUDINARY_API_KEY=123
NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER=anuncios/uploads
NEXT_PUBLIC_CLOUDINARY_MAX_FILE_SIZE=5242880

## Example origins by environment

Local:
- CORS_ORIGIN=http://localhost:3100
- NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

Preview (Vercel):
- CORS_ORIGIN=https://your-project.vercel.app
- CORS_ALLOW_VERCEL_PREVIEW=true
- NEXT_PUBLIC_API_BASE_URL=http://<hetzner-ip>:8080/api/v1

Production:
- CORS_ORIGIN=https://forotrix.com,https://www.forotrix.com
- CORS_ALLOW_VERCEL_PREVIEW=false
- NEXT_PUBLIC_API_BASE_URL=https://api.forotrix.com/api/v1
