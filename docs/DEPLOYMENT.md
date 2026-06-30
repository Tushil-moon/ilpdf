# Deployment Guide

## Vercel (Recommended)

### 1. Prerequisites

- Vercel account
- PostgreSQL database (Vercel Postgres, Neon, or Supabase)
- Redis instance (Upstash Redis recommended)
- S3-compatible storage (AWS S3 or Cloudflare R2)

### 2. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 3. Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
BETTER_AUTH_SECRET=<32+ char random string>
BETTER_AUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
S3_ENDPOINT=...
S3_BUCKET=ilpdf-uploads
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
NEXT_PUBLIC_GA_ID=G-XXXXXXXX
NEXT_PUBLIC_CLARITY_ID=...
```

### 4. Database Migration

```bash
npx prisma migrate deploy
```

### 5. Custom Domain

1. Add domain in Vercel Dashboard
2. Update `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL`
3. Configure DNS records as instructed

## Docker Production

### Build and Run

```bash
docker build -t ilpdf .
docker run -p 3000:3000 --env-file .env ilpdf
```

### Docker Compose (Full Stack)

```bash
docker-compose up -d
```

Services:
- **app** - Next.js application (port 3000)
- **worker** - BullMQ PDF processing worker
- **postgres** - PostgreSQL database (port 5432)
- **redis** - Redis for queue (port 6379)
- **minio** - S3-compatible storage (ports 9000, 9001)

### Production Checklist

- [ ] Set strong `BETTER_AUTH_SECRET` (32+ characters)
- [ ] Configure production database with SSL
- [ ] Set up Redis with persistence
- [ ] Configure S3/R2 with proper IAM policies
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set up monitoring and error tracking
- [ ] Configure backup for PostgreSQL
- [ ] Set `FILE_RETENTION_HOURS` appropriately
- [ ] Configure OAuth redirect URLs
- [ ] Set up Google Search Console verification

## External PDF Tools

For advanced conversions (PDF to Word, OCR, etc.), install on the server:

- **LibreOffice** - Document conversions
- **Ghostscript** - PDF compression
- **qpdf** - PDF manipulation
- **Tesseract** - OCR processing
- **ImageMagick** - Image processing

Configure the BullMQ worker to use these tools for server-side processing.

## Scaling

- Use Vercel's edge network for static pages (ISR)
- Scale BullMQ workers horizontally for PDF processing
- Use CDN for S3/R2 file delivery
- Consider read replicas for PostgreSQL at scale
