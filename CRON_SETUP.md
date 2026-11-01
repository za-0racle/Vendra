# Scheduled backend health check

This adds a small read-only database check for an external scheduler. Requesting the static Vercel homepage does not check or use Supabase.

1. Generate a separate random secret locally:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Save it as `KEEPALIVE_SECRET` in Supabase > Edge Functions > Secrets. Do not use a VITE_ variable, publish the secret in HTML, or put it in the URL.
3. In Supabase > Edge Functions, create `backend-health`. Paste all of `supabase/dashboard/backend-health.ts`, deploy, and turn gateway Verify JWT off. The handler requires its own private bearer secret before it queries the database. No SQL migration is needed.
4. In cron-job.org, create a job:

   - Title: Vendrahub backend health
   - URL: https://vrbxegdyfkzypsuikpkr.supabase.co/functions/v1/backend-health
   - Method: GET
   - Schedule: every 6 hours (four times daily); custom expression where supported: `0 */6 * * *`
   - Custom header name: `Authorization`
   - Custom header value: `Bearer YOUR_KEEPALIVE_SECRET`
   - Enable failure notifications in the scheduler.

5. Use the scheduler's test execution. Expected response is HTTP 200 with `ok: true` and `database: reachable`.

A 401 means the header or secret is incorrect. A 503 means the function is not configured or the database could not be reached. A 404 means the function has not been deployed at that name/project. The function never inserts orders, changes statuses, or sends emails. Its response contains no customer data.

Supabase documents Free-plan pausing based on low database activity over a seven-day window, and says a few database requests per day typically suffice. Scheduled checks generate that activity, but do not guarantee the project will never be paused or automatically restore an already paused project. A paid plan is the documented way to remove inactivity pausing. If the project is paused, resume it in the Supabase dashboard first.

Official references:
- https://supabase.com/docs/guides/platform/free-project-pausing
- https://cron-job.org/en/faq/

Regenerate the standalone function after source changes using `npm run prepare:dashboard`.
