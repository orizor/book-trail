# BookTrail

BookTrail is a mobile-first reading tracker PWA built with Next.js for Vercel hosting and a Supabase-ready data model. It lets you:

- Search published books and add them to a readlist
- Organize books into nested folders
- Attach a PDF, mark a physical copy, or store both
- Start a reading session with a timer and automatic reading logs
- Finish books, save thoughts, rate them, and review total hours spent
- Add the app to your iPhone home screen from Safari

## Current State

This repository ships in **local-first mode** so it works immediately without paid services or account setup.

- User data is stored in browser storage
- Uploaded PDFs are stored locally in IndexedDB for demo and offline use
- The Supabase schema and storage bucket setup are included in `supabase/migrations`
- The Vercel deployment path is ready once you add your environment variables

This keeps the MVP free to use while preserving a clear upgrade path.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- PWA manifest, install metadata, and service worker
- Open Library search API for book discovery
- Supabase-ready PostgreSQL schema and private PDF bucket plan

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Free Deployment

### 1. Create a Supabase project

- Stay on the free plan
- Copy the project URL and anon key
- Enable `Anonymous Sign-Ins` in `Authentication` -> `Sign In / Providers`
- Add your site URL in `Authentication` -> `URL Configuration`
- For this project use:
  - `Site URL`: `https://project-hcz3y.vercel.app`
  - `Additional Redirect URLs`: `https://project-hcz3y.vercel.app/**`

### 2. Run the included schema

- Open the Supabase SQL editor
- Run `supabase/migrations/202609280001_init.sql`
- This creates folders, books, sessions, active sessions, and a private `book-pdfs` bucket

### 3. Configure the app

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The current app is wired to use these public keys in the browser and signs users in anonymously so each person gets private synced data without a manual auth screen.

### 4. Deploy to Vercel

- Push this repository to GitHub
- Import the repo into Vercel
- Add the same environment variables in the Vercel project settings
- Production domain for this setup: `https://project-hcz3y.vercel.app`
- Deploy on the free Vercel Hobby plan

## iPhone Home Screen Install

- Open the deployed site in Safari on your iPhone
- Tap the Share button
- Tap `Add to Home Screen`
- Launch BookTrail from the home screen like a normal app

## Portability And Self-Hosting

This project is structured so you can move away from Vercel and Supabase later without losing data.

- The core user entities are described in plain SQL instead of hidden inside vendor-only tooling
- Book metadata is sourced from a public API instead of a locked proprietary catalog
- App data structure is simple and export-friendly: folders, books, sessions, reviews, and file references
- You can migrate the schema to another Postgres host with standard SQL tools
- PDFs can be exported from the Supabase storage bucket or replaced with another object store later

## Recommended Future Steps

- Wire the UI to Supabase Auth and database CRUD
- Add signed URL handling for private PDFs in hosted mode
- Add JSON export/import for one-click migration backups
- Add offline sync conflict handling if multi-device editing is required
