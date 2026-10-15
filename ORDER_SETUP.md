# Vendrahub orders: Vercel + Supabase + Resend

The storefront is `index.html`; order management is `admin.html` (visit `/admin.html`). Vercel serves the frontend. Supabase stores orders and authorizes admins. Supabase Edge Functions notify `contact@vendrahub.com` through Resend. WhatsApp links are for enquiries only.

## Connect Supabase

1. In your Supabase project, run `supabase/migrations/202610150001_orders.sql` in the SQL editor. It creates the orders, admin allowlist, and rate-limit tables, enables row-level security, and denies direct browser access to customer data.
2. In Supabase Authentication, create the admin user with a strong password. Disable public email/password signups if you do not need customer accounts. Add the user's UUID to the allowlist in the SQL editor:

   ```sql
   insert into public.order_admins(user_id) values ('YOUR_ADMIN_AUTH_USER_UUID');
   ```

3. Set Edge Function secrets in Supabase:

   - `RESEND_API_KEY`: your transactional API key.
   - `EMAIL_FROM`: a sender address verified in Resend, e.g. `orders@vendrahub.com`.
   - `ORDER_EMAIL`: `contact@vendrahub.com` (must be an existing inbox; Resend does not create one).
   - `ALLOWED_ORIGINS`: `https://vendra-rose.vercel.app` (the configured default), plus any additional exact custom-domain origins, comma-separated; no trailing slash. Add `http://localhost:5173` for local development if needed. Preview deployments require explicit origins; no wildcard is used.
   - `RATE_LIMIT_SALT`: a long randomly generated secret for hashing rate-limit identities.

   Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to functions. Never put the service-role key or Resend key in frontend variables, source control, or chat.

4. Deploy `place-order` and `admin-orders` from this repository using the Supabase CLI:

   ```text
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy place-order --no-verify-jwt
   supabase functions deploy admin-orders --no-verify-jwt
   ```

   The public order function validates input and computes prices. The admin function manually verifies the Supabase Auth bearer token and checks the admin allowlist on every request. Gateway JWT verification is disabled intentionally because the functions implement their own access rules and support public submissions.

## Connect Vercel

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel. Use the publishable/anon key, not a secret/service-role key. Select Vite, build command `npm run build`, output directory `dist`. Redeploy after changing these values. Both HTML pages are build entrypoints.

Use Node.js 24 or newer for development and builds.

Local preview: copy `.env.example` to `.env`, enter the two public Supabase values, then run `npm run dev`. Add the local origin to Supabase's `ALLOWED_ORIGINS`. The local frontend uses your configured Supabase project; do not submit real customer data to a test project.

## Order behavior

- Packages cost GH₵ 490, GH₵ 900, and GH₵ 1,250. Delivery is free. This is order capture, not payment collection.
- Every order is stored before sending its notification. A failed notification leaves the order visible to admins, with a retry action.
- A browser submission UUID prevents duplicate inserts when the same request is retried. Reusing the UUID with different customer details is rejected.
- Statuses: new, confirmed, dispatched, delivered, cancelled.
- The dashboard searches/filters the latest 1,000 orders. Order value excludes cancelled orders and is not money collected.
- “Accepted by Resend” records API acceptance, not inbox delivery. Delivery tracking would require Resend webhooks.
- Admin sessions use Supabase Auth access/refresh tokens held in sessionStorage for the current tab. Sign out clears them and requests server-side logout. Access-token validity follows Supabase's configured expiry.
- A notification stuck in “sending” can be retried after two minutes. Resend requests use the order UUID as an idempotency key to prevent duplicate notifications within Resend’s 24-hour idempotency window. A retry after that window may send another email, but never creates another order.

## Validation and launch checks

`npm test` exercises actual Edge Function handlers with mocked Supabase/Resend services: pricing, validation, duplicate prevention, email failure retention, origins, rate limits, admin access and status changes. `npm run build` checks both frontend pages. These checks do not execute the SQL against a real project.

Before going live, apply the migration, deploy the functions, verify the sender in Resend, confirm the recipient inbox, and test one order and admin login in the deployed environment. The supplied Supabase project URL and public publishable key are configured in ignored `.env.local` for local builds. Add those same two public settings in Vercel and redeploy. Private Resend secrets, the database migration, and Edge Function deployment still need to be configured in Supabase.

Official references: https://resend.com/docs/api-reference/emails/send-email ; https://supabase.com/docs/guides/functions/auth ; https://supabase.com/docs/guides/database/postgres/row-level-security

Current storefront origin: `https://vendra-rose.vercel.app`. The Edge Function defaults to this origin when `ALLOWED_ORIGINS` is unset. Deploy the updated functions to apply that default.
