# Security

## Reporting a vulnerability

Email **security@incahomes.com** with steps to reproduce. Please do not open a
public GitHub issue for a security problem.

Expect an acknowledgement within 3 working days and an assessment within 10.

## Supported versions

Only the currently deployed `main` branch receives fixes.

## How the app authenticates

- Sessions are HS256 JWTs in an `HttpOnly`, `SameSite=Lax` cookie, `Secure` in
  production, expiring after 7 days. Signed with `JWT_SECRET`, which has no
  fallback — the app fails loudly if it is unset.
- Passwords are hashed with bcrypt (cost 12).
- Two roles: `guest` and `admin`. Signup can only ever create a `guest`; the
  role is set server-side and never read from the request body.
- Every mutating API route checks the role on the server. A valid token with
  the wrong role gets 403, not 401.
- `/api/bookings/[id]` resolves the booking and then checks `user_id` against
  the token before responding, because the response carries the host's payout
  details.

## Database access

- The anon key is public and reaches the database only through row-level
  security. The single policy allows reading properties with
  `status = 'active'`. Everything else denies anon outright.
- All writes, and all reads of non-public data, use the service role key via
  `src/lib/supabase/admin.ts`. That key bypasses RLS and must never reach a
  client component or a `NEXT_PUBLIC_` variable.
- See `database/fix-rls-policies.sql`.

## Known limitations

- **Payments are settled manually.** There is no payment gateway. The host
  publishes where to send money, the guest submits a transfer reference, and
  the host confirms it. The app never sees or stores card data.
- **Content-Security-Policy is Report-Only.** Promoting it to enforcing needs
  a nonce pass over Next's inline bootstrap scripts.
- **No MFA** on admin accounts.
- **Rate limits are per client address** and will not stop a distributed
  attempt.
