# PeterParts Frontend

Next.js 16 storefront and admin frontend for PeterParts.

## Getting Started

1. Install dependencies.

```bash
npm install
```

2. Configure your environment variables.

```bash
DATABASE_URL="postgresql://..."
AUTH_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

AUTH_GOOGLE_ID="your-google-oauth-client-id"
AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"

RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="PeterParts <no-reply@your-domain.com>"

BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

3. Apply migrations and generate Prisma.

```bash
npx prisma migrate dev
npm run db:generate
```

4. Start the development server.

```bash
npm run dev
```

Open http://localhost:3000.

## Auth Setup

The login/register flow now includes:

- Google Login/Register through Auth.js and Google OAuth.
- Email/password registration with mandatory email confirmation.
- Login blocked until the email is confirmed.
- Password reset emails sent through Resend.

Routes added or updated:

- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password?token=...`
- `/verify-email?token=...`

Notes:

- Google auth is only enabled when both `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are present.
- The app also accepts `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as fallbacks.
- Email verification and password reset require both `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
- Admin product image uploads use Vercel Blob and require `BLOB_READ_WRITE_TOKEN`. On local machines, pull it from Vercel with `vercel env pull` or define it manually in your `.env.local`.
- `NEXT_PUBLIC_APP_URL` is used to generate confirmation and reset links.
- The app also accepts `AUTH_URL`, `NEXTAUTH_URL`, and `APP_URL` as fallbacks for production email links.
- `.env*` files are gitignored. On Vercel or any managed host, configure the production env vars in the hosting dashboard or on the server itself; a local `.env.production` file is not deployed automatically.
- `RESEND_FROM_EMAIL` must use a sender/domain that is verified in Resend, otherwise the API can reject the request in production.
- On Neon, keep `DATABASE_URL` pointed at the pooled endpoint for the app runtime and define `DIRECT_URL` with the non-pooler host for migrations.
- Run migrations with `npm run db:migrate`, which uses `DIRECT_URL` via Prisma CLI `--url`.

## Build Commands

```bash
npm run lint
npm run build
```
