# Founder OS — Next.js SaaS foundation

Founder OS is a customer-discovery and early product-validation workspace. It helps a founder track prospects, interview evidence, problem hypotheses, experiments, commercial offers, collected cash, and dated decisions.

## Included

- Next.js App Router + TypeScript + Tailwind CSS
- Email/password registration and sign-in using NextAuth Credentials
- Password hashing with bcrypt
- PostgreSQL persistence via Prisma
- User-scoped CRUD APIs for prospects, interviews, hypotheses, offers, experiments, and founder log entries
- Zod request validation and server-side authentication checks
- Responsive dashboard and record-management screens
- CSV export from individual data screens and JSON backup from Settings
- Founder constraint preferences and evidence-quality indicators

## Requirements

- Node.js 20+
- PostgreSQL 14+
- npm

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment template and update the database credentials:
   ```bash
   cp .env.example .env
   ```
   On Windows PowerShell use `Copy-Item .env.example .env`.
3. Generate a strong `NEXTAUTH_SECRET` (for example `openssl rand -base64 32`) and set it in `.env`.
4. Create the PostgreSQL database named `founder_os` or change `DATABASE_URL` to your database.
5. Generate Prisma client and create tables:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```
7. Open http://localhost:3000 and create an account.

## Main routes

- `/register` — create an account
- `/login` — sign in
- `/dashboard` — validation overview
- `/dashboard/prospects`
- `/dashboard/interviews`
- `/dashboard/hypotheses`
- `/dashboard/offers`
- `/dashboard/experiments`
- `/dashboard/logEntries`
- `/dashboard/settings`

## Data model

The Prisma schema separates users, settings, prospects, interviews, hypotheses, offers, experiments, and founder-log entries. Every primary research record has a `userId`, and API handlers scope reads/deletes to the authenticated user.

## Important implementation notes

This is a working product foundation, not a security-audited production launch. Before onboarding real customers:

- Add rate limiting and abuse protection to registration and authentication endpoints.
- Configure HTTPS, secure deployment secrets, database backups, and monitoring.
- Add email verification, password reset, and account deletion workflows.
- Review privacy policy, terms, data retention, and applicable legal requirements.
- Add automated tests for auth, ownership boundaries, validation, and core workflows.
- Consider CSRF/origin controls, audit logs, structured logging, and a migration/rollback policy.
- Add pagination and filtering at the API/database level as records grow.
- Preferences are currently stored in the browser; move them to the `UserSettings` table before multi-device settings sync is required.

## Commercial evidence principles

- Customer statements, independently observed behavior, signed commitments, and collected cash are distinct evidence types.
- The dashboard does not claim a market is validated based on interviews alone.
- Scores are hypotheses and should include the evidence and counter-evidence behind them.

## License

Private starter project. Add the license and terms appropriate to your intended distribution before publishing.
