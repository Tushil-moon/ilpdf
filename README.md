# ILPDF - Free Online PDF Tools

A production-ready PDF tools platform built with Next.js 16, React 19, TypeScript, and Tailwind CSS. Similar to iLovePDF with a modern, unique UI.

## Features

- **20+ PDF Tools** - Merge, split, compress, convert, rotate, unlock, protect, watermark, and more
- **Modern UI** - Glassmorphism, gradients, dark mode, Framer Motion animations
- **Enterprise SEO** - Dynamic metadata, sitemap, robots.txt, JSON-LD structured data
- **Authentication** - Better Auth with Google, GitHub, and email login
- **Internationalization** - English, Spanish, French, German, Japanese (RTL-ready)
- **Dashboard** - File history, downloads, favorites, API keys, billing
- **Admin Panel** - User management, analytics, blog CMS, SEO settings
- **Blog CMS** - Markdown posts with categories, tags, and rich SEO
- **Security** - Rate limiting, CSP headers, file validation, auto-delete
- **Queue System** - BullMQ + Redis for background PDF processing
- **Storage** - AWS S3 / Cloudflare R2 integration

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| UI | Radix UI, Framer Motion, Lucide Icons |
| Forms | React Hook Form + Zod |
| Backend | Next.js Route Handlers, Server Actions |
| Database | PostgreSQL + Prisma ORM |
| Auth | Better Auth |
| Queue | BullMQ + Redis |
| Storage | AWS S3 / Cloudflare R2 |
| PDF | pdf-lib, pdfjs-dist, sharp |
| i18n | next-intl |
| Testing | Vitest + Testing Library |
| Deploy | Docker, Vercel |

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- (Optional) AWS S3 or MinIO for file storage

### Installation

```bash
# Clone and install
git clone <repo-url>
cd ilpdf
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker

```bash
docker-compose up -d
```

This starts the app, PostgreSQL, Redis, and MinIO (S3-compatible storage).

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # i18n routes
│   │   ├── tools/         # PDF tool pages
│   │   ├── blog/          # Blog pages
│   │   ├── dashboard/     # User dashboard
│   │   └── admin/         # Admin panel
│   └── api/               # API routes
├── components/
│   ├── ui/                # Reusable UI primitives
│   ├── home/              # Homepage sections
│   ├── tools/             # Tool-specific components
│   └── layout/            # Header, footer, breadcrumbs
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities, auth, SEO, tools config
├── services/              # PDF processing, storage, queue
├── types/                 # TypeScript type definitions
├── actions/               # Server actions
└── i18n/                  # Internationalization config
prisma/                    # Database schema
messages/                  # i18n translation files
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Prisma Studio |

## Adding a New PDF Tool

1. Add tool config in `src/lib/tools.ts`
2. Implement processor in `src/services/pdf-processor.ts`
3. Add tool options in `src/components/tools/tool-options.tsx` (if needed)
4. The page at `/tools/[slug]` is auto-generated via `generateStaticParams`

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [Testing Guide](docs/TESTING.md)
- [SEO Guide](docs/SEO.md)

## Environment Variables

See [.env.example](.env.example) for all required variables.

## License

MIT
